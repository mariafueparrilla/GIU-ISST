package com.gui.gui.incident.dto;

/**
 * DTO para enviar una imagen al crear o actualizar incidencia.
 *
 * @param filename nombre original del archivo.
 * @param mimeType tipo MIME (image/jpeg, image/png).
 * @param imageData datos de la imagen en Base64.
 * @param fileSize tamaño del archivo en bytes.
 */
public record IncidentImageRequest(
    String filename,
    String mimeType,
    String imageData,
    Long fileSize
) {
}
