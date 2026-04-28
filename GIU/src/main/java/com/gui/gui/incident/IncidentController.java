package com.gui.gui.incident;

import com.gui.gui.incident.dto.IncidentCreateRequest;
import com.gui.gui.incident.dto.IncidentAssignmentRequest;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * API REST de incidencias.
 * Expone operaciones para crear, listar y actualizar estado.
 */
@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    /** Servicio con toda la logica de negocio de incidencias. */
    private final IncidentService incidentService;

    private static final Logger log = LoggerFactory.getLogger(IncidentController.class);

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
     * Lista incidencias del equipo del tecnico autenticado.
     */
    @GetMapping("/team/my")
    public List<IncidentResponse> myTeamIncidents(Authentication authentication) {
        return incidentService.getIncidentsForTechnicianTeam(authentication.getName());
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

    /**
     * Revisa y asigna una incidencia a un equipo tecnico (operario/admin).
     */
    @PatchMapping("/{id}/assign-team")
    public IncidentResponse assignTeam(@PathVariable Long id, @RequestBody IncidentAssignmentRequest request, Authentication authentication) {
        return incidentService.assignIncidentToTeam(authentication.getName(), id, request);
    }

    /**
     * Cambia estado de incidencia por parte de un tecnico sobre su equipo.
     */
    @PatchMapping("/{id}/team-state")
    public IncidentResponse updateTeamState(@PathVariable Long id, @RequestBody String rawBody, Authentication authentication) {
        String stateValue = null;
        try {
            // try parse as JSON object { "state": "..." }
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            try {
                com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(rawBody);
                if (node.has("state")) {
                    stateValue = node.get("state").asText(null);
                }
            } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
                // try to unescape typical JS-escaped payloads like '{ \"state\": \"EN_CURSO\" }'
                try {
                    String unescaped = rawBody.replace("\\\"", "\"");
                    com.fasterxml.jackson.databind.JsonNode node2 = mapper.readTree(unescaped);
                    if (node2.has("state")) {
                        stateValue = node2.get("state").asText(null);
                    }
                } catch (Exception ex2) {
                    // fallthrough to raw handling
                }
            }

            // if still null, treat rawBody as a plain JSON string or raw token
            if (stateValue == null && rawBody != null) {
                String cleaned = rawBody.trim();
                if (cleaned.startsWith("\"") && cleaned.endsWith("\"")) {
                    cleaned = cleaned.substring(1, cleaned.length() - 1);
                }
                stateValue = cleaned;
            }

            log.info("Technician '{}' requests team-state change for incident {} -> raw='{}' parsedState='{}'", authentication == null ? "<anonymous>" : authentication.getName(), id, rawBody, stateValue);
        } catch (Exception ex) {
            log.warn("Error parsing team-state request body: {}", ex.getMessage());
        }

        // Fallback: try to extract state token via regex to handle oddly-escaped bodies
        if ((stateValue == null || stateValue.contains("state")) && rawBody != null) {
            try {
                java.util.regex.Pattern p = java.util.regex.Pattern.compile("(?i)\\\"?state\\\"?\\s*[:=]\\s*\\\"?([A-Za-z0-9_-]+)\\\"?");
                java.util.regex.Matcher m = p.matcher(rawBody);
                if (m.find()) {
                    stateValue = m.group(1);
                    log.info("Extracted state via regex: {}", stateValue);
                }
            } catch (Exception ex) {
                // ignore regex failures
            }
        }

        return incidentService.updateStateForTechnician(authentication.getName(), id, stateValue);
    }
}
