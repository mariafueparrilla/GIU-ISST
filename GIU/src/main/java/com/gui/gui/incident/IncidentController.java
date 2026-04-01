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

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IncidentResponse createIncident(@RequestBody IncidentCreateRequest request, Authentication authentication) {
        return incidentService.createIncident(authentication.getName(), request);
    }

    @GetMapping("/my")
    public List<IncidentResponse> myIncidents(Authentication authentication) {
        return incidentService.getIncidentsForUser(authentication.getName());
    }

    @GetMapping
    public List<IncidentResponse> allIncidents() {
        return incidentService.getAllIncidents();
    }

    @PatchMapping("/{id}/state")
    public IncidentResponse updateState(@PathVariable Long id, @RequestBody IncidentStateUpdateRequest request) {
        return incidentService.updateState(id, request.state());
    }
}
