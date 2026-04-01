package com.gui.gui.incident.dto;

public record IncidentCreateRequest(
    String title,
    String description,
    String category,
    String priority,
    IncidentLocationRequest ubicacion
) {
}