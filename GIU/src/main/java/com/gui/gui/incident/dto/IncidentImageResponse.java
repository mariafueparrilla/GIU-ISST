package com.gui.gui.incident.dto;

/**
 * DTO de salida para una imagen de incidencia.
 *
 * @param id identificador de la imagen.
 * @param filename nombre original del archivo.
 * @param mimeType tipo MIME (image/jpeg, image/png, etc).
 * @param imageData datos de la imagen en Base64.
 */
public record IncidentImageResponse(
    Long id,
    String filename,
    String mimeType,
    String imageData
) {
}
