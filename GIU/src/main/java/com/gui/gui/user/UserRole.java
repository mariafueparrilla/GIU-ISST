package com.gui.gui.user;

/**
 * Roles de autorizacion de la aplicacion.
 */
public enum UserRole {
    /** Puede administrar usuarios e incidencias globales. */
    ADMIN,
    /** Usuario estandar que crea y consulta sus incidencias. */
    USER,
    /** Rol operativo reservado para futuras ampliaciones. */
    OPERATOR,
    /** Rol tecnico reservado para futuras ampliaciones. */
    TECHNICIAN
}
