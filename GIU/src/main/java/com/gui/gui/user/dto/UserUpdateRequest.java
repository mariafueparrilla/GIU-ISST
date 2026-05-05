package com.gui.gui.user.dto;

/**
 * DTO para actualizacion administrativa de usuario.
 *
 * @param name nuevo nombre.
 * @param email nuevo email.
 */
public record UserUpdateRequest(String name, String email) {
}
