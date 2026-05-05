package com.gui.gui.incident;

import com.gui.gui.incident.dto.IncidentCreateRequest;
import com.gui.gui.incident.dto.IncidentAssignmentRequest;
import com.gui.gui.incident.dto.IncidentImageRequest;
import com.gui.gui.incident.dto.IncidentOperatorValidationRequest;
import com.gui.gui.incident.dto.IncidentLocationRequest;
import com.gui.gui.incident.dto.IncidentLocationResponse;
import com.gui.gui.incident.dto.IncidentReportRequest;
import com.gui.gui.incident.dto.IncidentResolutionReviewRequest;
import com.gui.gui.incident.dto.IncidentReportResponse;
import com.gui.gui.incident.dto.IncidentResponse;
import com.gui.gui.incident.dto.IncidentImageResponse;
import com.gui.gui.incident.dto.IncidentPreviewResponse;
import com.gui.gui.user.UserEntity;
import com.gui.gui.user.UserRepository;
import com.gui.gui.user.UserRole;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
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

    /** Repositorio de imagenes de incidencias. */
    private final IncidentImageRepository imageRepository;

    /** Repositorio de informes tecnicos. */
    private final IncidentReportRepository reportRepository;

    public IncidentService(IncidentRepository incidentRepository, UserRepository userRepository, IncidentImageRepository imageRepository, IncidentReportRepository reportRepository) {
        this.incidentRepository = incidentRepository;
        this.userRepository = userRepository;
        this.imageRepository = imageRepository;
        this.reportRepository = reportRepository;
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
        incident.setPriority(null);  // Operario asignara prioridad en validacion
        incident.setState(IncidentState.CREADA);
        incident.setCreationDate(LocalDate.now());
        incident.setCreationInstant(Instant.now());
        incident.setCreator(creator);
        incident.setUbicacion(ubicacion);

        // Persistir incidencia primero.
        IncidentEntity savedIncident = requireNonNull(incidentRepository.save(incident));

        // Procesar y persistir imagenes si existen (maximo 3).
        if (request.images() != null && !request.images().isEmpty()) {
            List<IncidentImageEntity> images = request.images().stream()
                .limit(3)  // Limitar a maximo 3 imagenes
                .map(imageRequest -> {
                    IncidentImageEntity imageEntity = new IncidentImageEntity();
                    imageEntity.setIncident(savedIncident);
                    imageEntity.setFilename(imageRequest.filename());
                    imageEntity.setMimeType(imageRequest.mimeType());
                    imageEntity.setImageData(imageRequest.imageData());
                    imageEntity.setFileSize(imageRequest.fileSize());
                    return imageEntity;
                })
                .toList();
            imageRepository.saveAll(images);
            savedIncident.setImages(images);
        }

        return toResponse(savedIncident);
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
    public IncidentResponse updateState(Long incidentId, String stateValue, String operatorDni) {
        if (incidentId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id de incidencia obligatorio");
        }

        if (isBlank(stateValue)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "state es obligatorio");
        }

        IncidentEntity incident = incidentRepository.findById(incidentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incidencia no encontrada"));

        UserEntity operator = userRepository.findById(normalizeDni(operatorDni))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no valido"));

        IncidentState newState = parseState(stateValue);
        
        // El operario solo puede setear estos estados (rechazar, cerrar o devolver a equipo)
        if (newState != IncidentState.RECHAZADA && newState != IncidentState.CERRADA && newState != IncidentState.ASIGNADA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El operario solo puede rechazar, cerrar o devolver a equipo");
        }

        if (incident.getState() == IncidentState.CERRADA || incident.getState() == IncidentState.RECHAZADA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La incidencia ya esta cerrada o rechazada");
        }

        if (newState == IncidentState.RECHAZADA && incident.getState() != IncidentState.CREADA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se pueden rechazar incidencias CREADA");
        }

        if (newState == IncidentState.CERRADA && incident.getState() != IncidentState.RESUELTA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se puede cerrar una incidencia RESUELTA");
        }

        if (newState == IncidentState.ASIGNADA && incident.getState() != IncidentState.RESUELTA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se puede devolver a ASIGNADA una incidencia RESUELTA");
        }

        applyStateAndMilestoneDates(incident, newState, operator);

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
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La incidencia debe ser revisada por el operario antes de asignarse");
        }
        if (incident.getState() == IncidentState.RESUELTA || incident.getState() == IncidentState.CERRADA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se puede asignar una incidencia resuelta o cerrada");
        }

        IncidentCategory assignedTeam = parseCategory(request.team());
        incident.setAssignedTeam(assignedTeam);
        applyStateAndMilestoneDates(incident, IncidentState.ASIGNADA, operator);

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

        if (newState == IncidentState.RESUELTA && incident.getReport() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Para marcar una incidencia como resuelta deberás rellenar el informe primero");
        }

        applyStateAndMilestoneDates(incident, newState, technician);
        return toResponse(requireNonNull(incidentRepository.save(incident)));
    }

    /**
     * Crea un informe tecnico para una incidencia en curso.
     */
    @Transactional
    public IncidentResponse createTechnicianReport(String technicianDni, Long incidentId, IncidentReportRequest request) {
        if (incidentId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id de incidencia obligatorio");
        }
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El informe es obligatorio");
        }

        UserEntity technician = resolveTechnician(technicianDni);
        IncidentEntity incident = incidentRepository.findById(incidentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incidencia no encontrada"));

        if (incident.getAssignedTeam() != technician.getTechnicalTeam()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "La incidencia no pertenece al equipo tecnico");
        }
        if (incident.getState() != IncidentState.EN_CURSO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se puede añadir un informe cuando la incidencia esta EN_CURSO");
        }
        List<IncidentImageRequest> imageRequests = request.images();
        if (imageRequests == null || imageRequests.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El informe debe incluir al menos una imagen");
        }
        if (imageRequests.size() > 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El informe admite como maximo 3 imagenes");
        }

        IncidentReportEntity report = incident.getReport();
        if (report == null) {
            report = reportRepository.findByIncident_Id(incidentId).orElse(null);
        }

        boolean isNewReport = report == null;
        if (isNewReport) {
            report = new IncidentReportEntity();
            report.setIncident(incident);
        }

        report.setSender(technician);
        report.setReportInstant(Instant.now());
        report.setDescription(request.description() == null || request.description().trim().isEmpty() ? null : request.description().trim());

        List<IncidentReportImageEntity> images = report.getImages();
        images.clear();
        for (IncidentImageRequest imageRequest : imageRequests) {
            IncidentReportImageEntity imageEntity = new IncidentReportImageEntity();
            imageEntity.setReport(report);
            imageEntity.setFilename(imageRequest.filename());
            imageEntity.setMimeType(imageRequest.mimeType());
            imageEntity.setImageData(imageRequest.imageData());
            imageEntity.setFileSize(imageRequest.fileSize());
            images.add(imageEntity);
        }

        // A new technician report supersedes any prior operator review feedback.
        incident.setOperatorReviewComment(null);
        incident.setOperatorReviewDate(null);
        incident.setOperatorReviewer(null);

        incident.setReport(report);
        reportRepository.saveAndFlush(report);

        return toResponse(requireNonNull(incidentRepository.saveAndFlush(incident)));
    }

    /**
     * Revisa la resolucion hecha por el tecnico: confirma y cierra, o rechaza y devuelve a EN_CURSO.
     */
    @Transactional
    public IncidentResponse reviewTechnicianResolution(String operatorDni, Long incidentId, IncidentResolutionReviewRequest request) {
        if (incidentId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id de incidencia obligatorio");
        }
        if (request == null || request.approved() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "approved es obligatorio");
        }

        UserEntity operator = userRepository.findById(requireNonNull(normalizeDni(operatorDni)))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no valido"));

        if (operator.getRole() != UserRole.OPERATOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso exclusivo para operarios");
        }

        IncidentEntity incident = incidentRepository.findById(incidentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incidencia no encontrada"));

        if (incident.getState() != IncidentState.RESUELTA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se puede revisar una incidencia RESUELTA");
        }

        incident.setOperatorReviewer(operator);
        incident.setOperatorReviewDate(Instant.now());

        if (Boolean.TRUE.equals(request.approved())) {
            incident.setOperatorReviewComment(null);
            applyStateAndMilestoneDates(incident, IncidentState.CERRADA, operator);
        } else {
            if (isBlank(request.comment())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debes indicar el motivo del rechazo");
            }

            incident.setOperatorReviewComment(request.comment().trim());
            incident.setState(IncidentState.EN_CURSO);
        }

        return toResponse(requireNonNull(incidentRepository.save(incident)));
    }

    /**
     * Devuelve una incidencia por ID con todos sus detalles (para vista de detalle).
     */
    @Transactional(readOnly = true)
    public IncidentResponse getIncidentById(Long incidentId) {
        if (incidentId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id de incidencia obligatorio");
        }

        IncidentEntity incident = incidentRepository.findById(incidentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incidencia no encontrada"));

        return toResponse(incident);
    }

    /**
     * Devuelve incidencias del usuario autenticado como previews para el dashboard.
     */
    @Transactional(readOnly = true)
    public List<IncidentPreviewResponse> getMyIncidentsPreview(String dni) {
        return incidentRepository.findByCreator_DniOrderByCreationDateDescIdDesc(normalizeDni(dni))
            .stream()
            .map(this::toPreviewResponse)
            .toList();
    }

    /**
     * Devuelve todas las incidencias como previews para vista administrativa.
     */
    @Transactional(readOnly = true)
    public List<IncidentPreviewResponse> getAllIncidentsPreview() {
        return incidentRepository.findAll()
            .stream()
            .sorted(Comparator.comparing(IncidentEntity::getId).reversed())
            .map(this::toPreviewResponse)
            .toList();
    }

    /**
     * Devuelve incidencias del equipo tecnico como previews.
     */
    @Transactional(readOnly = true)
    public List<IncidentPreviewResponse> getTeamIncidentsPreview(String technicianDni) {
        UserEntity technician = resolveTechnician(technicianDni);

        return incidentRepository.findByAssignedTeamOrderByCreationDateDescIdDesc(technician.getTechnicalTeam())
            .stream()
            .map(this::toPreviewResponse)
            .toList();
    }

    /**
     * Operario valida una incidencia CREADA, asigna prioridad y equipo tecnico,
     * y transiciona a ASIGNADA en una sola accion (unificada).
     * Esto reemplaza los pasos anteriores de validacion + asignacion.
     */
    @Transactional
    public IncidentResponse operatorValidateAndAssign(String operatorDni, Long incidentId, IncidentOperatorValidationRequest request) {
        if (incidentId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id de incidencia obligatorio");
        }
        if (request == null || isBlank(request.priority()) || isBlank(request.team())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "priority y team son obligatorios");
        }

        UserEntity operator = userRepository.findById(requireNonNull(normalizeDni(operatorDni)))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no valido"));

        if (operator.getRole() != UserRole.OPERATOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso exclusivo para operarios");
        }

        IncidentEntity incident = incidentRepository.findById(incidentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incidencia no encontrada"));

        // Solo se puede validar incidencias en estado CREADA
        if (incident.getState() != IncidentState.CREADA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se pueden validar incidencias en estado CREADA");
        }

        // Asignar prioridad (realizado por operario)
        incident.setPriority(parsePriority(request.priority()));

        // Asignar equipo tecnico
        IncidentCategory assignedTeam = parseCategory(request.team());
        incident.setAssignedTeam(assignedTeam);

        // Transicionar a ASIGNADA (unificando validacion + asignacion)
        applyStateAndMilestoneDates(incident, IncidentState.ASIGNADA, operator);

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
        ubicacion.setFormattedAddress(request.formattedAddress());
        ubicacion.setPlaceId(request.placeId());
        return ubicacion;
    }

    /**
     * Mapea entidad de incidencia a DTO de salida completo para vista de detalle.
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
            ubicacion.getLongitud(),
            ubicacion.getFormattedAddress(),
            ubicacion.getPlaceId()
        );

        List<IncidentImageResponse> imageResponses = incident.getImages().stream()
            .map(img -> new IncidentImageResponse(
                img.getId(),
                img.getFilename(),
                img.getMimeType(),
                img.getImageData()
            ))
            .toList();

        IncidentReportResponse reportResponse = null;
        if (incident.getReport() != null) {
            IncidentReportEntity report = incident.getReport();
            List<IncidentImageResponse> reportImageResponses = report.getImages().stream()
                .map(img -> new IncidentImageResponse(
                    img.getId(),
                    img.getFilename(),
                    img.getMimeType(),
                    img.getImageData()
                ))
                .toList();

            reportResponse = new IncidentReportResponse(
                report.getId(),
                report.getReportInstant(),
                report.getSender().getDni(),
                report.getSender().getName(),
                report.getDescription(),
                reportImageResponses
            );
        }

        return new IncidentResponse(
            incident.getId(),
            incident.getTitle(),
            incident.getDescription(),
            incident.getCategory().name().toLowerCase(Locale.ROOT),
            incident.getPriority() == null ? null : incident.getPriority().name().toLowerCase(Locale.ROOT),
            incident.getState().name().toLowerCase(Locale.ROOT),
            incident.getAssignedTeam() == null ? null : incident.getAssignedTeam().name().toLowerCase(Locale.ROOT),
            incident.getCreationInstant(),
            incident.getAsignationDate(),
            incident.getResolutionDate(),
            incident.getRejectionDate(),
            incident.getClosingDate(),
            incident.getCreator().getDni(),
            incident.getCreator().getName(),
            incident.getAssigner() != null ? incident.getAssigner().getDni() : null,
            incident.getResolver() != null ? incident.getResolver().getDni() : null,
            incident.getCloser() != null ? incident.getCloser().getDni() : null,
            incident.getRejecter() != null ? incident.getRejecter().getDni() : null,
            ubicacionResponse,
            imageResponses,
            reportResponse,
            incident.getOperatorReviewComment(),
            incident.getOperatorReviewDate(),
            incident.getOperatorReviewer() != null ? incident.getOperatorReviewer().getDni() : null
        );
    }

    /**
     * Mapea entidad de incidencia a DTO de preview para listados en dashboards.
     */
    private IncidentPreviewResponse toPreviewResponse(IncidentEntity incident) {
        String previewImage = null;
        if (!incident.getImages().isEmpty()) {
            previewImage = incident.getImages().get(0).getImageData();
        }

        UbicacionEntity ubicacion = incident.getUbicacion();

        return new IncidentPreviewResponse(
            incident.getId(),
            incident.getTitle(),
            incident.getDescription(),
            incident.getCategory().name().toLowerCase(Locale.ROOT),
            incident.getPriority() == null ? null : incident.getPriority().name().toLowerCase(Locale.ROOT),
            incident.getState().name().toLowerCase(Locale.ROOT),
            incident.getAssignedTeam() == null ? null : incident.getAssignedTeam().name().toLowerCase(Locale.ROOT),
            incident.getCreationDate(),
            incident.getCreator().getDni(),
            incident.getCreator().getName(),
            ubicacion.getMunicipio(),
            ubicacion.getCalle(),
            ubicacion.getNumero(),
            previewImage
        );
    }

    /**
     * Valida campos obligatorios y formato basico para crear incidencia.
     */
    private void validateCreateRequest(IncidentCreateRequest request) {
        if (request == null || isBlank(request.title()) || isBlank(request.description()) || isBlank(request.category()) || request.ubicacion() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title, description, category y ubicacion son obligatorios");
        }

        IncidentLocationRequest ubicacion = request.ubicacion();
        if (isBlank(ubicacion.municipio()) || isBlank(ubicacion.calle()) || ubicacion.numero() == null || ubicacion.codigoPostal() == null || ubicacion.latitud() == null || ubicacion.longitud() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todos los campos de ubicacion son obligatorios");
        }

        // Validar numero maximo de imagenes (maximo 3).
        if (request.images() != null && request.images().size() > 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Se pueden subir maximo 3 imagenes");
        }

        // Verificacion temprana de enums de negocio.
        parseCategory(request.category());
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

    /** Aplica el nuevo estado, registra fechas de hito y guarda quien realizo la accion. */
    private void applyStateAndMilestoneDates(IncidentEntity incident, IncidentState newState, UserEntity user) {
        incident.setState(newState);

        Instant now = Instant.now();

        // Solo se fija la fecha la primera vez que se alcanza cada estado.
        if (newState == IncidentState.ASIGNADA && incident.getAsignationDate() == null) {
            incident.setAsignationDate(now);
            incident.setAssigner(user);
        }
        if (newState == IncidentState.RESUELTA) {
            incident.setResolutionDate(now);
            incident.setResolver(user);
        }
        if (newState == IncidentState.RECHAZADA && incident.getRejectionDate() == null) {
            incident.setRejectionDate(now);
            incident.setRejecter(user);
        }
        if (newState == IncidentState.CERRADA && incident.getClosingDate() == null) {
            incident.setClosingDate(now);
            incident.setCloser(user);
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
    // clearAndSeedPendingIncidents removed per request
}
