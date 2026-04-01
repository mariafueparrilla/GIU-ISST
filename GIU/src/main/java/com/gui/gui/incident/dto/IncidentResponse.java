package com.gui.gui.incident.dto;

import java.time.Instant;
import java.time.LocalDate;

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