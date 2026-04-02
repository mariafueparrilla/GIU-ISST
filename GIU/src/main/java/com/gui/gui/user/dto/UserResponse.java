package com.gui.gui.user.dto;

/**
 * DTO de lectura de usuario para listados y formularios de edicion.
 *
 * @param dni identificador del usuario.
 * @param name nombre visible.
 * @param email email del usuario.
 * @param role rol funcional.
 */
public record UserResponse(String dni, String name, String email, String role) {
}
