package com.gui.gui.incident;

import com.gui.gui.incident.dto.IncidentCreateRequest;
import com.gui.gui.incident.dto.IncidentLocationRequest;
import com.gui.gui.incident.dto.IncidentLocationResponse;
import com.gui.gui.incident.dto.IncidentResponse;
import com.gui.gui.user.UserEntity;
import com.gui.gui.user.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Servicio de dominio de incidencias.
 * Encapsula validaciones, creacion, consultas y transiciones de estado.
 */
@Service
public class IncidentService {

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
        UserEntity creator = userRepository.findById(normalizeDni(creatorDni))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no valido"));

        // Construir entidad de ubicacion hija.
        UbicacionEntity ubicacion = toUbicacionEntity(request.ubicacion());

        // Construir entidad principal de incidencia con estado inicial.
        IncidentEntity incident = new IncidentEntity();
        incident.setTitle(request.title().trim());
        incident.setDescription(request.description().trim());
        incident.setCategory(parseCategory(request.category()));
        incident.setPriority(parsePriority(request.priority()));
        incident.setState(IncidentState.CREADA);
        incident.setCreationDate(LocalDate.now());
        incident.setCreator(creator);
        incident.setUbicacion(ubicacion);

        // Persistir y mapear a DTO de salida.
        return toResponse(incidentRepository.save(incident));
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
        if (newState == IncidentState.CERRADA && incident.getClosingDate() == null) {
            incident.setClosingDate(now);
        }

        return toResponse(incidentRepository.save(incident));
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
            incident.getCreationDate(),
            incident.getValidationDate(),
            incident.getAsignationDate(),
            incident.getResolutionDate(),
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
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado invalido");
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
}
