package com.gui.gui.incident.dto;

/**
 * DTO para que el operario valide una incidencia, asigne prioridad y equipo tecnico en una sola accion.
 * Unifica los pasos anteriores de validacion + asignacion.
 *
 * @param priority prioridad de la incidencia (asignada por operario).
 * @param team equipo tecnico a asignar.
 */
public record IncidentOperatorValidationRequest(
    String priority,
    String team
) {
}
