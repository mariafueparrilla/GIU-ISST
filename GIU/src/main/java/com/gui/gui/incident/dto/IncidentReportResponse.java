package com.gui.gui.incident.dto;

import java.time.Instant;
import java.util.List;

/**
 * DTO del informe tecnico asociado a una incidencia.
 *
 * @param id identificador del informe.
 * @param reportInstant instante de creacion.
 * @param senderDni dni del tecnico que redacto el informe.
 * @param senderName nombre del tecnico que redacto el informe.
 * @param description texto del informe.
 * @param images imagenes asociadas al informe.
 */
public record IncidentReportResponse(
    Long id,
    Instant reportInstant,
    String senderDni,
    String senderName,
    String description,
    List<IncidentImageResponse> images
) {
}