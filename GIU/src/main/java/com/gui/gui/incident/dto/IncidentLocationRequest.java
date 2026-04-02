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
 */
public record IncidentLocationRequest(
    String municipio,
    String calle,
    Integer numero,
    Integer codigoPostal,
    Double latitud,
    Double longitud
) {
}
