package com.gui.gui.user.dto;

/**
 * DTO de entrada para login.
 *
 * @param dni identificador unico del usuario.
 * @param password password en texto plano para validar contra hash almacenado.
 */
public record LoginRequest(String dni, String password) {
}
