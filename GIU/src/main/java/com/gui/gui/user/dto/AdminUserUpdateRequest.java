package com.gui.gui.user.dto;

/**
 * DTO para edicion de usuario por admin.
 * Permite modificar todos los campos incluyendo DNI y rol.
 *
 * @param name nombre del usuario.
 * @param surname apellido del usuario.
 * @param email correo electronico.
 * @param newDni nuevo DNI (puede ser diferente del actual).
 * @param role rol funcional.
 * @param technicalTeam equipo tecnico asociado (solo para rol technician).
 */
public record AdminUserUpdateRequest(String name, String surname, String email, String newDni, String role, String technicalTeam) {
}
