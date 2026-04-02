package com.gui.gui.user.dto;

/**
 * DTO de salida de login/sesion.
 *
 * @param dni identificador del usuario autenticado.
 * @param name nombre visible del usuario.
 * @param role rol en formato texto para control de UI.
 */
public record LoginResponse(String dni, String name, String role) {
}
