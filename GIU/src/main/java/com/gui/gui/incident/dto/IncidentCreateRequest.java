package com.gui.gui.incident.dto;

import java.util.List;

/**
 * DTO para crear incidencia.
 *
 * @param title titulo corto.
 * @param description descripcion detallada.
 * @param category categoria funcional.
 * @param ubicacion datos de localizacion de la incidencia.
 * @param images lista de imagenes (maximo 3) en Base64.
 */
public record IncidentCreateRequest(
    String title,
    String description,
    String category,
    IncidentLocationRequest ubicacion,
    List<IncidentImageRequest> images
) {
}
