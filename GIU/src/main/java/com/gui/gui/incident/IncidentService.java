package com.gui.gui.incident;

import com.gui.gui.incident.dto.IncidentCreateRequest;
import com.gui.gui.incident.dto.IncidentAssignmentRequest;
import com.gui.gui.incident.dto.IncidentLocationRequest;
import com.gui.gui.incident.dto.IncidentLocationResponse;
import com.gui.gui.incident.dto.IncidentResponse;
import com.gui.gui.user.UserEntity;
import com.gui.gui.user.UserRepository;
import com.gui.gui.user.UserRole;
import java.time.Instant;
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Servicio de dominio de incidencias.
 * Encapsula validaciones, creacion, consultas y transiciones de estado.
 */
@Service
public class IncidentService {

    private static final EnumSet<IncidentState> TECH_ALLOWED_STATES = EnumSet.of(
        IncidentState.ASIGNADA,
        IncidentState.EN_CURSO,
        IncidentState.RESUELTA
    );

    /** Repositorio de incidencias para persistencia y consulta. */
    private final IncidentRepository incidentRepository;

    /** Repositorio de usuarios para resolver el creador de la incidencia. */
    private final UserRepository userRepository;

    public IncidentService(IncidentRepository incidentRepository, UserRepository userRepository) {
        this.incidentRepository = incidentRepository;
        this.userRepository = userRepository;
    }

    /**
     * Crea una incidencia nueva enlazada al usuario autenticado.
     */
    @Transactional
    public IncidentResponse createIncident(String creatorDni, IncidentCreateRequest request) {
        // Validar consistencia de payload.
        validateCreateRequest(request);

        // Resolver creador desde DNI de sesion.
        UserEntity creator = userRepository.findById(requireNonNull(normalizeDni(creatorDni)))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no valido"));

        // Construir entidad de ubicacion hija.
        UbicacionEntity ubicacion = toUbicacionEntity(request.ubicacion());

        // Construir entidad principal de incidencia con estado inicial.
        IncidentEntity incident = new IncidentEntity();
        incident.setTitle(request.title().trim());
        incident.setDescription(request.description().trim());
        incident.setCategory(parseCategory(request.category()));
        incident.setAssignedTeam(null);
        incident.setPriority(parsePriority(request.priority()));
        incident.setState(IncidentState.CREADA);
        incident.setCreationDate(LocalDate.now());
        incident.setCreator(creator);
        incident.setUbicacion(ubicacion);

        // Persistir y mapear a DTO de salida.
        return toResponse(requireNonNull(incidentRepository.save(incident)));
    }

    /**
     * Devuelve incidencias del usuario autenticado.
     */
    @Transactional(readOnly = true)
    public List<IncidentResponse> getIncidentsForUser(String dni) {
        return incidentRepository.findByCreator_DniOrderByCreationDateDescIdDesc(normalizeDni(dni))
            .stream()
            .map(this::toResponse)
            .toList();
    }

    /**
     * Devuelve todas las incidencias para vista administrativa.
     */
    @Transactional(readOnly = true)
    public List<IncidentResponse> getAllIncidents() {
        return incidentRepository.findAll()
            .stream()
            .sorted(Comparator.comparing(IncidentEntity::getId).reversed())
            .map(this::toResponse)
            .toList();
    }

    /**
     * Actualiza estado de incidencia y registra fechas de hito cuando aplica.
     */
    @Transactional
    public IncidentResponse updateState(Long incidentId, String stateValue) {
        if (incidentId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id de incidencia obligatorio");
        }

        if (isBlank(stateValue)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "state es obligatorio");
        }

        IncidentEntity incident = incidentRepository.findById(incidentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incidencia no encontrada"));

        IncidentState newState = parseState(stateValue);
        
        // El operario solo puede setear estos estados
        if (newState != IncidentState.VALIDADA && newState != IncidentState.RECHAZADA && newState != IncidentState.CERRADA && newState != IncidentState.ASIGNADA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El operario solo puede validar, rechazar, cerrar o devolver a equipo");
        }

        if (incident.getState() == IncidentState.CERRADA || incident.getState() == IncidentState.RECHAZADA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La incidencia ya esta cerrada o rechazada");
        }

        if (newState == IncidentState.VALIDADA && incident.getState() != IncidentState.CREADA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se pueden validar incidencias en estado CREADA");
        }

        if (newState == IncidentState.RECHAZADA && incident.getState() != IncidentState.CREADA && incident.getState() != IncidentState.VALIDADA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se pueden rechazar incidencias CREADA o VALIDADA");
        }

        if (newState == IncidentState.CERRADA && incident.getState() != IncidentState.RESUELTA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se puede cerrar una incidencia RESUELTA");
        }

        if (newState == IncidentState.ASIGNADA && incident.getState() != IncidentState.RESUELTA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se puede devolver a ASIGNADA una incidencia RESUELTA");
        }

        applyStateAndMilestoneDates(incident, newState);

        return toResponse(requireNonNull(incidentRepository.save(incident)));
    }

    /**
     * Devuelve incidencias del equipo tecnico asociado al usuario autenticado.
     */
    @Transactional(readOnly = true)
    public List<IncidentResponse> getIncidentsForTechnicianTeam(String technicianDni) {
        UserEntity technician = resolveTechnician(technicianDni);

        return incidentRepository.findByAssignedTeamOrderByCreationDateDescIdDesc(technician.getTechnicalTeam())
            .stream()
            .map(this::toResponse)
            .toList();
    }

    /**
     * Asigna incidencia a un equipo tecnico por parte de operario/admin.
     */
    @Transactional
    public IncidentResponse assignIncidentToTeam(String operatorDni, Long incidentId, IncidentAssignmentRequest request) {
        if (incidentId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id de incidencia obligatorio");
        }
        if (request == null || isBlank(request.team())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "team es obligatorio");
        }

        UserEntity operator = userRepository.findById(requireNonNull(normalizeDni(operatorDni)))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no valido"));

        if (operator.getRole() != UserRole.OPERATOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso exclusivo para operarios");
        }

        IncidentEntity incident = incidentRepository.findById(incidentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incidencia no encontrada"));

        if (incident.getState() == IncidentState.CREADA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La incidencia debe estar validada antes de asignarse a un equipo");
        }
        if (incident.getState() == IncidentState.RESUELTA || incident.getState() == IncidentState.CERRADA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se puede asignar una incidencia resuelta o cerrada");
        }

        IncidentCategory assignedTeam = parseCategory(request.team());
        incident.setAssignedTeam(assignedTeam);
        applyStateAndMilestoneDates(incident, IncidentState.ASIGNADA);

        return toResponse(requireNonNull(incidentRepository.save(incident)));
    }

    /**
     * Cambia estado de una incidencia si pertenece al equipo del tecnico.
     */
    @Transactional
    public IncidentResponse updateStateForTechnician(String technicianDni, Long incidentId, String stateValue) {
        if (incidentId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id de incidencia obligatorio");
        }
        if (isBlank(stateValue)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "state es obligatorio");
        }

        UserEntity technician = resolveTechnician(technicianDni);
        IncidentEntity incident = incidentRepository.findById(incidentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incidencia no encontrada"));

        if (incident.getAssignedTeam() != technician.getTechnicalTeam()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "La incidencia no pertenece al equipo tecnico");
        }

        IncidentState newState = parseState(stateValue);
        if (!TECH_ALLOWED_STATES.contains(newState)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El tecnico solo puede usar estados ASIGNADA, EN_CURSO o RESUELTA");
        }

        applyStateAndMilestoneDates(incident, newState);
        return toResponse(requireNonNull(incidentRepository.save(incident)));
    }

    /**
     * Mapea request de ubicacion a entidad persistente.
     */
    private UbicacionEntity toUbicacionEntity(IncidentLocationRequest request) {
        UbicacionEntity ubicacion = new UbicacionEntity();
        ubicacion.setMunicipio(request.municipio().trim());
        ubicacion.setCalle(request.calle().trim());
        ubicacion.setNumero(request.numero());
        ubicacion.setCodigoPostal(request.codigoPostal());
        ubicacion.setLatitud(request.latitud());
        ubicacion.setLongitud(request.longitud());
        return ubicacion;
    }

    /**
     * Mapea entidad de incidencia a DTO de salida para frontend.
     */
    private IncidentResponse toResponse(IncidentEntity incident) {
        UbicacionEntity ubicacion = incident.getUbicacion();
        IncidentLocationResponse ubicacionResponse = new IncidentLocationResponse(
            ubicacion.getId(),
            ubicacion.getMunicipio(),
            ubicacion.getCalle(),
            ubicacion.getNumero(),
            ubicacion.getCodigoPostal(),
            ubicacion.getLatitud(),
            ubicacion.getLongitud()
        );

        return new IncidentResponse(
            incident.getId(),
            incident.getTitle(),
            incident.getDescription(),
            incident.getCategory().name().toLowerCase(Locale.ROOT),
            incident.getPriority().name().toLowerCase(Locale.ROOT),
            incident.getState().name().toLowerCase(Locale.ROOT),
            incident.getAssignedTeam() == null ? null : incident.getAssignedTeam().name().toLowerCase(Locale.ROOT),
            incident.getCreationDate(),
            incident.getValidationDate(),
            incident.getAsignationDate(),
            incident.getResolutionDate(),
            incident.getRejectionDate(),
            incident.getClosingDate(),
            incident.getCreator().getDni(),
            ubicacionResponse
        );
    }

    /**
     * Valida campos obligatorios y formato basico para crear incidencia.
     */
    private void validateCreateRequest(IncidentCreateRequest request) {
        if (request == null || isBlank(request.title()) || isBlank(request.description()) || isBlank(request.category()) || isBlank(request.priority()) || request.ubicacion() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title, description, category, priority y ubicacion son obligatorios");
        }

        IncidentLocationRequest ubicacion = request.ubicacion();
        if (isBlank(ubicacion.municipio()) || isBlank(ubicacion.calle()) || ubicacion.numero() == null || ubicacion.codigoPostal() == null || ubicacion.latitud() == null || ubicacion.longitud() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todos los campos de ubicacion son obligatorios");
        }

        // Verificacion temprana de enums de negocio.
        parseCategory(request.category());
        parsePriority(request.priority());
    }

    /** Convierte texto de categoria a enum. */
    private IncidentCategory parseCategory(String value) {
        try {
            return IncidentCategory.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoria invalida");
        }
    }

    /** Convierte texto de prioridad a enum. */
    private IncidentPriority parsePriority(String value) {
        try {
            return IncidentPriority.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Prioridad invalida");
        }
    }

    /** Convierte texto de estado a enum (acepta guion o guion bajo). */
    private IncidentState parseState(String value) {
        String normalized = value.trim().toUpperCase(Locale.ROOT).replace('-', '_');
        try {
            return IncidentState.valueOf(normalized);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado invalido: '" + value + "'");
        }
    }

    /** Normaliza y valida DNI de sesion. */
    private String normalizeDni(String dni) {
        if (isBlank(dni)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        return dni.trim().toUpperCase(Locale.ROOT);
    }

    /** Helper para strings null o vacios. */
    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    /** Aplica el nuevo estado y registra fechas de hito cuando corresponda. */
    private void applyStateAndMilestoneDates(IncidentEntity incident, IncidentState newState) {
        incident.setState(newState);

        Instant now = Instant.now();

        // Solo se fija la fecha la primera vez que se alcanza cada estado.
        if (newState == IncidentState.VALIDADA && incident.getValidationDate() == null) {
            incident.setValidationDate(now);
        }
        if (newState == IncidentState.ASIGNADA && incident.getAsignationDate() == null) {
            incident.setAsignationDate(now);
        }
        if (newState == IncidentState.RESUELTA && incident.getResolutionDate() == null) {
            incident.setResolutionDate(now);
        }
        if (newState == IncidentState.RECHAZADA && incident.getRejectionDate() == null) {
            incident.setRejectionDate(now);
        }
        if (newState == IncidentState.CERRADA && incident.getClosingDate() == null) {
            incident.setClosingDate(now);
        }
    }

    /** Recupera y valida que el usuario autenticado sea tecnico con equipo asignado. */
    private UserEntity resolveTechnician(String technicianDni) {
        UserEntity technician = userRepository.findById(requireNonNull(normalizeDni(technicianDni)))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no valido"));

        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso exclusivo para tecnicos");
        }

        if (technician.getTechnicalTeam() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El tecnico no tiene equipo asignado");
        }

        return technician;
    }

    /** Adapta valores ya validados a firmas anotadas como non-null. */
    private <T> T requireNonNull(@NonNull T value) {
        return Objects.requireNonNull(value);
    }
}
