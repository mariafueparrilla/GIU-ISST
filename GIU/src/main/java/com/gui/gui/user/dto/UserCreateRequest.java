package com.gui.gui.user.dto;

/**
 * DTO para alta de usuario.
 *
 * @param dni clave primaria natural.
 * @param name nombre del usuario.
 * @param email correo electronico.
 * @param password password en texto plano (se hashea en servicio).
 * @param role rol solicitado para el usuario.
 */
public record UserCreateRequest(String dni, String name, String email, String password, String role) {
}
