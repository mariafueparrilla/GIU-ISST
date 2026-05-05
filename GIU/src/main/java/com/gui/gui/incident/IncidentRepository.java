package com.gui.gui.incident;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

/**
 * Repositorio JPA de incidencias.
 * Incluye consulta por creador para dashboard de usuario.
 */
public interface IncidentRepository extends JpaRepository<IncidentEntity, Long> {

    /**
     * Devuelve incidencias de un usuario ordenadas por fecha e id descendente.
     */
    List<IncidentEntity> findByCreator_DniOrderByCreationDateDescIdDesc(String creatorDni);

    /**
     * Devuelve incidencias asignadas a un equipo tecnico ordenadas descendente.
     */
    List<IncidentEntity> findByAssignedTeamOrderByCreationDateDescIdDesc(IncidentCategory assignedTeam);

    @Modifying
    @Transactional
    @Query(value = "UPDATE incidents SET creator_dni = :newDni WHERE creator_dni = :oldDni", nativeQuery = true)
    void updateCreatorDni(String oldDni, String newDni);

    @Modifying
    @Transactional
    @Query(value = "UPDATE incidents SET assigner_dni = :newDni WHERE assigner_dni = :oldDni", nativeQuery = true)
    void updateAssignerDni(String oldDni, String newDni);

    @Modifying
    @Transactional
    @Query(value = "UPDATE incidents SET resolver_dni = :newDni WHERE resolver_dni = :oldDni", nativeQuery = true)
    void updateResolverDni(String oldDni, String newDni);

    @Modifying
    @Transactional
    @Query(value = "UPDATE incidents SET closer_dni = :newDni WHERE closer_dni = :oldDni", nativeQuery = true)
    void updateCloserDni(String oldDni, String newDni);

    @Modifying
    @Transactional
    @Query(value = "UPDATE incidents SET rejecter_dni = :newDni WHERE rejecter_dni = :oldDni", nativeQuery = true)
    void updateRejecterDni(String oldDni, String newDni);

    @Modifying
    @Transactional
    @Query(value = "UPDATE incidents SET operator_reviewer_dni = :newDni WHERE operator_reviewer_dni = :oldDni", nativeQuery = true)
    void updateOperatorReviewerDni(String oldDni, String newDni);
}
