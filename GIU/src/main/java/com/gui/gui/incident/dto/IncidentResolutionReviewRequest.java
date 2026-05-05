package com.gui.gui.incident.dto;

/**
 * Request para revisar una resolucion hecha por el tecnico.
 *
 * @param approved true si el operario confirma la resolucion.
 * @param comment comentario obligatorio cuando se rechaza.
 */
public record IncidentResolutionReviewRequest(
    Boolean approved,
    String comment
) {
}