package com.gui.gui.incident;

import com.gui.gui.incident.dto.IncidentCreateRequest;
import com.gui.gui.incident.dto.IncidentResponse;
import com.gui.gui.incident.dto.IncidentStateUpdateRequest;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * API REST de incidencias.
 * Expone operaciones para crear, listar y actualizar estado.
 */
@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    /** Servicio con toda la logica de negocio de incidencias. */
    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    /**
     * Crea una incidencia asociada al usuario autenticado.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IncidentResponse createIncident(@RequestBody IncidentCreateRequest request, Authentication authentication) {
        return incidentService.createIncident(authentication.getName(), request);
    }

    /**
     * Lista incidencias del propio usuario (vista dashboard usuario).
     */
    @GetMapping("/my")
    public List<IncidentResponse> myIncidents(Authentication authentication) {
        return incidentService.getIncidentsForUser(authentication.getName());
    }

    /**
     * Lista todas las incidencias (uso administrativo).
     */
    @GetMapping
    public List<IncidentResponse> allIncidents() {
        return incidentService.getAllIncidents();
    }

    /**
     * Cambia estado de una incidencia y deja trazadas fechas de hito.
     */
    @PatchMapping("/{id}/state")
    public IncidentResponse updateState(@PathVariable Long id, @RequestBody IncidentStateUpdateRequest request) {
        return incidentService.updateState(id, request.state());
    }
}
