package com.gui.gui.incident.dto;

/**
 * DTO para solicitar cambio de estado.
 *
 * @param state nuevo estado objetivo.
 */
public record IncidentStateUpdateRequest(String state) {
}
