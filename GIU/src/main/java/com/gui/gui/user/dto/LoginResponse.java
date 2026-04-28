package com.gui.gui.user.dto;

import java.util.List;

/**
 * DTO de salida de login/sesion.
 *
 * @param dni identificador del usuario autenticado.
 * @param name nombre visible del usuario.
 * @param role rol en formato texto para control de UI.
 * @param technicalTeam equipo tecnico en formato texto (si aplica).
 * @param availableRoles roles que el usuario puede activar en UI.
 */
public record LoginResponse(String dni, String name, String role, String technicalTeam, List<String> availableRoles) {
}
