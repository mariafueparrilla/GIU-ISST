package com.gui.gui.incident.dto;

import java.util.List;

/**
 * Request para crear un informe tecnico.
 *
 * @param description texto opcional del informe.
 * @param images imagenes del informe, minimo una y maximo tres.
 */
public record IncidentReportRequest(
    String description,
    List<IncidentImageRequest> images
) {
}