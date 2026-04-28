package com.gui.gui.user.dto;

/**
 * DTO para actualizacion administrativa de usuario.
 *
 * @param name nuevo nombre.
 * @param email nuevo email.
 * @param role nuevo rol.
 * @param technicalTeam nuevo equipo tecnico (si aplica).
 */
public record UserUpdateRequest(String name, String email, String role, String technicalTeam) {
}
