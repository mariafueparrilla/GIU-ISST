package com.gui.gui.incident.dto;

/**
 * DTO de entrada para ubicacion.
 *
 * @param municipio municipio de la incidencia.
 * @param calle calle de referencia.
 * @param numero numero de portal.
 * @param codigoPostal codigo postal.
 * @param latitud latitud geoespacial.
 * @param longitud longitud geoespacial.
 * @param formattedAddress direccion formateada (ej: "Calle Mayor, 123, 28001 Madrid").
 * @param placeId identificador de lugar (Google Maps place ID u otro).
 */
public record IncidentLocationRequest(
    String municipio,
    String calle,
    Integer numero,
    Integer codigoPostal,
    Double latitud,
    Double longitud,
    String formattedAddress,
    String placeId
) {
}
