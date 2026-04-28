package com.gui.gui.incident.dto;

/**
 * DTO para asignar una incidencia a un equipo tecnico.
 *
 * @param team equipo tecnico destino.
 */
public record IncidentAssignmentRequest(String team) {
}
