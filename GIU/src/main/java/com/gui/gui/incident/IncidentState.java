package com.gui.gui.incident;

/**
 * Estados del flujo de vida de una incidencia.
 */
public enum IncidentState {
    /** Estado inicial al crearla un usuario. */
    CREADA,
    /** Revisada y validada por administracion. */
    VALIDADA,
    /** Asignada a un responsable. */
    ASIGNADA,
    /** Actualmente en ejecucion de trabajo. */
    EN_CURSO,
    /** Trabajo completado y resuelto. */
    RESUELTA,
    /** Cerrada definitivamente. */
    CERRADA
}
