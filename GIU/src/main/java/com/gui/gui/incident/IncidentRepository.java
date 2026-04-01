package com.gui.gui.incident;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentRepository extends JpaRepository<IncidentEntity, Long> {
    List<IncidentEntity> findByCreator_DniOrderByCreationDateDescIdDesc(String creatorDni);
}