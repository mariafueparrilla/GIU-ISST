package com.gui.gui.incident;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repositorio JPA de incidencias.
 * Incluye consulta por creador para dashboard de usuario.
 */
public interface IncidentRepository extends JpaRepository<IncidentEntity, Long> {

    /**
     * Devuelve incidencias de un usuario ordenadas por fecha e id descendente.
     */
    List<IncidentEntity> findByCreator_DniOrderByCreationDateDescIdDesc(String creatorDni);
}
