package com.gui.gui.incident;

/**
 * Categorias funcionales permitidas para clasificar incidencias.
 */
public enum IncidentCategory {
    /** Problemas de alumbrado publico. */
    ALUMBRADO,
    /** Limpieza viaria, suciedad o vertidos. */
    LIMPIEZA,
    /** Trafico, senalizacion o movilidad urbana. */
    MOVILIDAD,
    /** Fugas, cortes o problemas de agua. */
    AGUA,
    /** Contenedores y gestion de residuos. */
    RESIDUOS,
    /** Bancos, farolas u otro mobiliario urbano. */
    MOBILIARIO,
    /** Categoria de respaldo para casos no tipificados. */
    OTROS
}
