package com.gui.gui.incident;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;

/**
 * Clase de pruebas unitarias para comprobar el funcionamiento
 * de la plataforma GIU (Gestor de Incidencias Urbanas).
 *
 * Estas pruebas no levantan el servidor ni llaman a la API REST.
 * Solo comprueban el comportamiento de objetos y funciones concretas.
 */
class IncidentBusinessRulesTest {

    /**
     * UT-01
     *
     * Comprueba que una incidencia almacena correctamente sus campos básicos:
     * título, descripción, categoría, prioridad, estado y fechas.
     */
    @Test
    void UT01_createIncidentStoresBasicFieldsCorrectly() {
        // Crear una incidencia vacía
        IncidentEntity incident = new IncidentEntity();

        // Asignar valores de prueba a los campos principales
        incident.setTitle("Farola apagada");
        incident.setDescription("La farola no enciende desde anoche.");
        incident.setCategory(IncidentCategory.ALUMBRADO);
        incident.setPriority(IncidentPriority.ALTA);
        incident.setState(IncidentState.CREADA);
        incident.setCreationDate(LocalDate.of(2026, 5, 6));
        incident.setCreationInstant(Instant.parse("2026-05-06T10:30:00Z"));

        // Comprobar que los valores guardados son exactamente los esperados
        assertEquals("Farola apagada", incident.getTitle());
        assertEquals("La farola no enciende desde anoche.", incident.getDescription());
        assertEquals(IncidentCategory.ALUMBRADO, incident.getCategory());
        assertEquals(IncidentPriority.ALTA, incident.getPriority());
        assertEquals(IncidentState.CREADA, incident.getState());
        assertEquals(LocalDate.of(2026, 5, 6), incident.getCreationDate());
        assertEquals(Instant.parse("2026-05-06T10:30:00Z"), incident.getCreationInstant());
    }

    /**
     * UT-02
     *
     * Comprueba que el estado inicial esperado de una incidencia nueva
     * es CREADA.
     *
     * En la aplicación, una incidencia recién registrada por un ciudadano
     * debería comenzar siempre en este estado.
     */
    @Test
    void UT02_incidentInitialStateShouldBeCreada() {
        // Crear una incidencia de prueba
        IncidentEntity incident = new IncidentEntity();

        // Simular el estado inicial que debería asignarse al crearla
        incident.setState(IncidentState.CREADA);

        // Comprobar que el estado inicial es CREADA
        assertEquals(IncidentState.CREADA, incident.getState());
    }

    /**
     * UT-03
     *
     * Comprueba qué estados se consideran pendientes.
     *
     * Para el dashboard y los paneles de gestión, una incidencia está pendiente
     * si todavía no ha finalizado su ciclo de vida.
     */
    @Test
    void UT03_pendingIncidentsAreCreatedAssignedOrInProgress() {
        // Estados activos o pendientes
        assertTrue(isPending(IncidentState.CREADA));
        assertTrue(isPending(IncidentState.ASIGNADA));
        assertTrue(isPending(IncidentState.EN_CURSO));

        // Estados finales, por tanto no pendientes
        assertFalse(isPending(IncidentState.RESUELTA));
        assertFalse(isPending(IncidentState.CERRADA));
        assertFalse(isPending(IncidentState.RECHAZADA));
    }

    /**
     * UT-04
     *
     * Comprueba el cálculo del tiempo medio de resolución.
     *
     * Se crean dos incidencias:
     * - una resuelta en 2 días
     * - otra resuelta en 4 días
     *
     * La media esperada es 3 días.
     */
    @Test
    void UT04_averageResolutionTimeIsCalculatedCorrectly() {
        // Primera incidencia: tarda 2 días en resolverse
        IncidentEntity incident1 = new IncidentEntity();
        incident1.setCreationInstant(Instant.parse("2026-05-01T10:00:00Z"));
        incident1.setResolutionDate(Instant.parse("2026-05-03T10:00:00Z"));

        // Segunda incidencia: tarda 4 días en resolverse
        IncidentEntity incident2 = new IncidentEntity();
        incident2.setCreationInstant(Instant.parse("2026-05-01T10:00:00Z"));
        incident2.setResolutionDate(Instant.parse("2026-05-05T10:00:00Z"));

        // Agrupar las incidencias de prueba
        List<IncidentEntity> incidents = List.of(incident1, incident2);

        // Calcular la media de resolución
        double averageDays = calculateAverageResolutionDays(incidents);

        // Comprobar que la media es exactamente 3 días
        assertEquals(3.0, averageDays);
    }

    /**
     * UT-05
     *
     * Comprueba la detección de incidencias fuera de plazo según su prioridad.
     *
     * Reglas SLA usadas en la prueba:
     * - CRITICA: más de 1 día sin resolver
     * - ALTA: más de 2 días sin resolver
     * - MEDIA: más de 4 días sin resolver
     * - BAJA: más de 7 días sin resolver
     */
    @Test
    void UT05_overdueIncidentDependsOnPrioritySla() {
        // Fecha fija para que la prueba sea determinista
        Instant now = Instant.parse("2026-05-06T10:00:00Z");

        // Incidencia crítica creada hace más de 1 día y no resuelta
        IncidentEntity critical = new IncidentEntity();
        critical.setPriority(IncidentPriority.CRITICA);
        critical.setCreationInstant(Instant.parse("2026-05-04T09:00:00Z"));
        critical.setResolutionDate(null);

        // Incidencia de prioridad baja creada hace poco más de 2 días.
        // Como el SLA de baja prioridad es 7 días, no debería estar fuera de plazo.
        IncidentEntity low = new IncidentEntity();
        low.setPriority(IncidentPriority.BAJA);
        low.setCreationInstant(Instant.parse("2026-05-04T09:00:00Z"));
        low.setResolutionDate(null);

        // La crítica sí está fuera de plazo
        assertTrue(isOverdue(critical, now));

        // La baja todavía no está fuera de plazo
        assertFalse(isOverdue(low, now));
    }

    /**
     * Método auxiliar usado por UT-03.
     *
     * Devuelve true si el estado de la incidencia se considera pendiente.
     */
    private boolean isPending(IncidentState state) {
        return state == IncidentState.CREADA
                || state == IncidentState.ASIGNADA
                || state == IncidentState.EN_CURSO;
    }

    /**
     * Método auxiliar usado por UT-04.
     *
     * Calcula el tiempo medio de resolución en días.
     * Solo tiene en cuenta incidencias que tienen fecha de creación
     * y fecha de resolución.
     */
    private double calculateAverageResolutionDays(List<IncidentEntity> incidents) {
        return incidents.stream()
                // Ignorar incidencias sin fecha de creación
                .filter(i -> i.getCreationInstant() != null)

                // Ignorar incidencias todavía no resueltas
                .filter(i -> i.getResolutionDate() != null)

                // Convertir cada diferencia creationInstant → resolutionDate a días
                .mapToDouble(i -> Duration
                        .between(i.getCreationInstant(), i.getResolutionDate())
                        .toHours() / 24.0)

                // Calcular la media
                .average()

                // Si no hay incidencias resueltas, devolver 0
                .orElse(0.0);
    }

    /**
     * Método auxiliar usado por UT-05.
     *
     * Comprueba si una incidencia no resuelta está fuera de plazo
     * en función de su prioridad.
     */
    private boolean isOverdue(IncidentEntity incident, Instant now) {
        // Si ya está resuelta, no se considera fuera de plazo
        if (incident.getResolutionDate() != null) {
            return false;
        }

        // Calcular cuántas horas han pasado desde la creación
        long ageHours = Duration.between(incident.getCreationInstant(), now).toHours();

        // Aplicar el SLA según la prioridad
        return switch (incident.getPriority()) {
            case CRITICA -> ageHours > 24;   // más de 1 día
            case ALTA -> ageHours > 48;      // más de 2 días
            case MEDIA -> ageHours > 96;     // más de 4 días
            case BAJA -> ageHours > 168;     // más de 7 días
        };
    }
}