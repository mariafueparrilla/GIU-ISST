package com.gui.gui.incident.dto;

import java.time.Instant;
import java.time.LocalDate;

/**
 * DTO de vista previa de incidencia para listados en dashboards.
 * Contiene informacion resumida para mostrar tarjetas en listados.
 * Los detalles completos se carga en la vista de detalle.
 *
 * @param id identificador de incidencia.
 * @param title titulo.
 * @param description descripcion.
 * @param category categoria.
 * @param priority prioridad.
 * @param state estado actual.
 * @param assignedTeam equipo tecnico asignado.
 * @param creationDate fecha de creacion.
 * @param creatorDni dni del usuario creador.
 * @param creatorName nombre del usuario creador.
 * @param ubicacionMunicipio municipio de la ubicacion.
 * @param ubicacionCalle calle de la ubicacion.
 * @param ubicacionNumero numero de la ubicacion.
 * @param previewImageBase64 primera imagen en Base64 para preview (o null).
 */
public record IncidentPreviewResponse(
    Long id,
    String title,
    String description,
    String category,
    String priority,
    String state,
    String assignedTeam,
    LocalDate creationDate,
    Instant resolutionDate,
    Instant operatorReviewDate,
    String creatorDni,
    String creatorName,
    String ubicacionMunicipio,
    String ubicacionCalle,
    Integer ubicacionNumero,
    String previewImageBase64
) {
}
