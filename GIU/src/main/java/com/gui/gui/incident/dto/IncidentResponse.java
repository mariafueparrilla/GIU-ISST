package com.gui.gui.incident.dto;

import java.time.Instant;
import java.time.LocalDate;

/**
 * DTO de salida de incidencia para UI de usuario y admin.
 *
 * @param id identificador de incidencia.
 * @param title titulo.
 * @param description descripcion.
 * @param category categoria.
 * @param priority prioridad.
 * @param state estado actual.
 * @param creationDate fecha de creacion.
 * @param validationDate instante de validacion.
 * @param asignationDate instante de asignacion.
 * @param resolutionDate instante de resolucion.
 * @param closingDate instante de cierre.
 * @param creatorDni dni del usuario creador.
 * @param ubicacion ubicacion asociada.
 */
public record IncidentResponse(
    Long id,
    String title,
    String description,
    String category,
    String priority,
    String state,
    LocalDate creationDate,
    Instant validationDate,
    Instant asignationDate,
    Instant resolutionDate,
    Instant closingDate,
    String creatorDni,
    IncidentLocationResponse ubicacion
) {
}
