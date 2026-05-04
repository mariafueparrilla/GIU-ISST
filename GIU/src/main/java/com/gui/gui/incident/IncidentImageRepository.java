package com.gui.gui.incident;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repositorio JPA para imagenes de incidencias.
 */
public interface IncidentImageRepository extends JpaRepository<IncidentImageEntity, Long> {

    /**
     * Encuentra todas las imagenes asociadas a una incidencia.
     */
    List<IncidentImageEntity> findByIncident_Id(Long incidentId);
}
