package com.gui.gui.incident.dto;

/**
 * DTO de salida de ubicacion persistida.
 *
 * @param id id tecnico de ubicacion.
 * @param municipio municipio.
 * @param calle calle.
 * @param numero numero.
 * @param codigoPostal codigo postal.
 * @param latitud latitud.
 * @param longitud longitud.
 */
public record IncidentLocationResponse(
    Long id,
    String municipio,
    String calle,
    Integer numero,
    Integer codigoPostal,
    Double latitud,
    Double longitud
) {
}
