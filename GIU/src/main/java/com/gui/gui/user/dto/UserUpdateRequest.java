package com.gui.gui.user.dto;

/**
 * DTO para actualizacion administrativa de usuario.
 *
 * @param dni nuevo DNI del usuario.
 * @param name nuevo nombre.
 * @param email nuevo email.
 * @param role nuevo rol.
 * @param technicalTeam nuevo equipo tecnico (si aplica).
 */
public record UserUpdateRequest(String dni, String name, String email, String role, String technicalTeam) {
}
