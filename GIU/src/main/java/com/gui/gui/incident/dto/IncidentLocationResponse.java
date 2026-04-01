package com.gui.gui.incident.dto;

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