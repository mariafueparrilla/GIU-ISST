package com.gui.gui.incident;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

public interface IncidentReportRepository extends JpaRepository<IncidentReportEntity, Long> {

    Optional<IncidentReportEntity> findByIncident_Id(Long incidentId);

    @Modifying
    @Transactional
    @Query(value = "UPDATE incident_reports SET sender_dni = :newDni WHERE sender_dni = :oldDni", nativeQuery = true)
    void updateSenderDni(String oldDni, String newDni);
}