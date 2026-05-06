package com.gui.gui.incident.dto;

import java.time.Instant;

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
 * @param creationInstant instante de creacion con timestamp completo.
 * @param creatorDni dni del usuario creador.
 * @param creatorName nombre del usuario creador.
 * @param ubicacionLatitud latitud de la ubicacion.
 * @param ubicacionLongitud longitud de la ubicacion.
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
    Instant creationInstant,
    Instant resolutionDate,
    Instant operatorReviewDate,
    Instant closingDate,
    String closerDni,
    String creatorDni,
    String creatorName,
    Double ubicacionLatitud,
    Double ubicacionLongitud,
    String ubicacionMunicipio,
    String ubicacionCalle,
    Integer ubicacionNumero,
    String previewImageBase64
) {
}
