package com.gui.gui.incident;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Limpia automaticamente las incidencias rechazadas que ya cumplieron 30 dias.
 */
@Service
public class RejectedIncidentCleanupService {

    private static final Duration REJECTION_RETENTION = Duration.ofDays(30);

    private final IncidentRepository incidentRepository;

    public RejectedIncidentCleanupService(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    /**
     * Ejecuta la limpieza cada dia para eliminar incidencias rechazadas antiguas.
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void deleteExpiredRejectedIncidents() {
        Instant cutoff = Instant.now().minus(REJECTION_RETENTION);
        List<IncidentEntity> expiredRejectedIncidents = incidentRepository.findByStateAndRejectionDateBefore(
            IncidentState.RECHAZADA,
            cutoff
        );

        if (!expiredRejectedIncidents.isEmpty()) {
            incidentRepository.deleteAll(expiredRejectedIncidents);
            incidentRepository.flush();
        }
    }
}
