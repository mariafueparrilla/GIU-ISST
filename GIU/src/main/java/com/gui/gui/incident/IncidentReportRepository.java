package com.gui.gui.incident;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentReportRepository extends JpaRepository<IncidentReportEntity, Long> {

    Optional<IncidentReportEntity> findByIncident_Id(Long incidentId);
}