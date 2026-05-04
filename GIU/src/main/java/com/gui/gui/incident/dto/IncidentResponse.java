package com.gui.gui.incident.dto;

import java.time.Instant;
import java.util.List;

/**
 * DTO de salida de incidencia para UI de usuario y admin.
 *
 * @param id identificador de incidencia.
 * @param title titulo.
 * @param description descripcion.
 * @param category categoria.
 * @param priority prioridad.
 * @param state estado actual.
 * @param assignedTeam equipo tecnico asignado.
 * @param creationInstant instante de creacion con hora.
 * @param asignationDate instante de asignacion.
 * @param resolutionDate instante de resolucion.
 * @param rejectionDate instante de rechazo.
 * @param closingDate instante de cierre.
 * @param creatorDni dni del usuario creador.
 * @param ubicacion ubicacion asociada.
 * @param images lista de imagenes asociadas.
 */
public record IncidentResponse(
    Long id,
    String title,
    String description,
    String category,
    String priority,
    String state,
    String assignedTeam,
    Instant creationInstant,
    Instant asignationDate,
    Instant resolutionDate,
    Instant rejectionDate,
    Instant closingDate,
    String creatorDni,
    String creatorName,
    String assignerDni,
    String resolverDni,
    String closerDni,
    String rejecterDni,
    IncidentLocationResponse ubicacion,
    List<IncidentImageResponse> images
) {
}
