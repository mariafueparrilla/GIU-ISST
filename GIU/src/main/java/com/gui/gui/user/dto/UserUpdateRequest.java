package com.gui.gui.user.dto;

/**
 * DTO para actualizacion administrativa de usuario.
 *
 * @param name nuevo nombre.
 * @param email nuevo email.
 * @param role nuevo rol.
 */
public record UserUpdateRequest(String name, String email, String role) {
}
