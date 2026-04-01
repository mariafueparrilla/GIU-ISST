package com.gui.gui.incident.dto;

public record IncidentLocationRequest(
    String municipio,
    String calle,
    Integer numero,
    Integer codigoPostal,
    Double latitud,
    Double longitud
) {
}