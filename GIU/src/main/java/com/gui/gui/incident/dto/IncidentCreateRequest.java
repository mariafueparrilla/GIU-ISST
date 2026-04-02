package com.gui.gui.incident.dto;

/**
 * DTO para crear incidencia.
 *
 * @param title titulo corto.
 * @param description descripcion detallada.
 * @param category categoria funcional.
 * @param priority prioridad solicitada.
 * @param ubicacion datos de localizacion de la incidencia.
 */
public record IncidentCreateRequest(
    String title,
    String description,
    String category,
    String priority,
    IncidentLocationRequest ubicacion
) {
}
