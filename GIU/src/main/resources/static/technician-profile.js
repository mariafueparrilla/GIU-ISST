const API_BASE = "/api/incidents";

const TEAM_LABEL_MAP = {
  alumbrado: "Alumbrado",
  limpieza: "Limpieza",
  movilidad: "Movilidad",
  agua: "Agua",
  residuos: "Residuos",
  mobiliario: "Mobiliario",
  otros: "Otros"
};

const TEAM_DESCRIPTION_MAP = {
  alumbrado: "Gestiona incidencias de farolas, cableado y cuadros electricos urbanos.",
  limpieza: "Atiende acumulacion de basura, suciedad y actuaciones de limpieza viaria.",
  movilidad: "Resuelve incidencias de senalizacion, trafico y movilidad urbana.",
  agua: "Interviene en fugas, averias y otras incidencias de red de agua.",
  residuos: "Da soporte a incidencias de recogida y contenedores de residuos.",
  mobiliario: "Gestiona danos en bancos, papeleras y mobiliario urbano.",
  otros: "Atiende incidencias clasificadas en categorias no estandar."
};

const UI_TO_BACKEND_STATE = {
  pending: "ASIGNADA",
  in_progress: "EN_CURSO",
  resolved: "RESUELTA"
};

const BACKEND_TO_UI_STATE = {
  asignada: "pending",
  en_curso: "in_progress",
  resuelta: "resolved"
};

const PRIORITY_LABEL_MAP = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  critica: "Critica"
};

let currentUser = null;
let technicianIncidents = [];
let teamFilterStatus = "all";
let teamSearchQuery = "";
let draggedIncidentId = null;

async function loadSessionUser() {
  const response = await fetch("/api/auth/me", { credentials: "same-origin" });
  if (!response.ok) {
    throw new Error("Sesion no valida");
  }

  currentUser = await response.json();
  if (currentUser.role !== "technician") {
    window.location.href = "/dashboard";
    return;
  }
}

async function loadIncidents() {
  const response = await fetch(`${API_BASE}/team/my`, { credentials: "same-origin" });
  if (!response.ok) {
    throw new Error("No se pudieron cargar las incidencias del equipo");
  }

  const data = await response.json();
  technicianIncidents = data
    .map(mapIncidentFromApi)
    .filter((incident) => incident.uiStatus !== null);
}

function mapIncidentFromApi(apiIncident) {
  const uiStatus = BACKEND_TO_UI_STATE[apiIncident.state] || null;
  const location = apiIncident.ubicacion || {};

  return {
    id: apiIncident.id,
    title: apiIncident.title,
    description: apiIncident.description,
    category: apiIncident.category,
    assignedTeam: apiIncident.assignedTeam,
    priority: apiIncident.priority,
    apiState: apiIncident.state,
    uiStatus,
    creationDate: apiIncident.creationDate,
    resolutionDate: apiIncident.resolutionDate,
    address: `${location.municipio || ""}, ${location.calle || ""} ${location.numero || ""}`.trim()
  };
}

function getTeamIncidents() {
  return technicianIncidents;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }) + " " + date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getPriorityClass(priority) {
  switch ((priority || "").toLowerCase()) {
    case "critica":
      return "bg-red-100 text-red-700";
    case "alta":
      return "bg-orange-100 text-orange-700";
    case "media":
      return "bg-blue-100 text-blue-700";
    case "baja":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getStatusLabel(status) {
  if (status === "pending") return "Pendiente";
  if (status === "in_progress") return "En progreso";
  if (status === "resolved") return "Resuelta";
  return status;
}

function getStatusClass(status) {
  if (status === "pending") return "bg-amber-100 text-amber-700";
  if (status === "in_progress") return "bg-blue-100 text-blue-700";
  if (status === "resolved") return "bg-emerald-100 text-emerald-700";
  return "bg-slate-100 text-slate-600";
}

function normalizeTeamLabel(teamValue) {
  if (!teamValue) return "Sin equipo";
  return TEAM_LABEL_MAP[teamValue] || teamValue;
}

function renderTechnicianProfileData() {
  const incidents = getTeamIncidents();

  const activeIncidents = incidents.filter((incident) => incident.uiStatus !== "resolved").length;
  const pendingIncidents = incidents.filter((incident) => incident.uiStatus === "pending").length;

  const today = new Date().toLocaleDateString("es-ES");
  const resolvedToday = incidents.filter((incident) => {
    if (incident.uiStatus !== "resolved") return false;
    return new Date(incident.resolutionDate).toLocaleDateString("es-ES") === today;
  }).length;

  const teamKey = currentUser?.technicalTeam;
  const teamLabel = normalizeTeamLabel(teamKey);

  const techNameEl = document.getElementById("tech-name");
  const teamNameEl = document.getElementById("team-name");
  const teamSpecialtyEl = document.getElementById("team-specialty");
  const teamStatusEl = document.getElementById("team-status");
  const teamDescriptionEl = document.getElementById("team-description");
  const activeCountEl = document.getElementById("active-count");
  const pendingCountEl = document.getElementById("pending-count");
  const resolvedTodayEl = document.getElementById("resolved-today");

  if (techNameEl) {
    techNameEl.textContent = currentUser?.name || "Tecnico";
  }

  if (teamNameEl) {
    teamNameEl.textContent = `Equipo ${teamLabel}`;
  }

  if (teamSpecialtyEl) {
    teamSpecialtyEl.textContent = teamLabel;
  }

  if (teamStatusEl) {
    const teamStatus = activeIncidents > 0 ? "En servicio" : "Disponible";
    teamStatusEl.textContent = teamStatus;

    teamStatusEl.classList.remove("text-emerald-600", "text-amber-600");
    if (teamStatus === "Disponible") {
      teamStatusEl.classList.add("text-emerald-600");
    } else {
      teamStatusEl.classList.add("text-amber-600");
    }
  }

  if (teamDescriptionEl) {
    teamDescriptionEl.textContent = TEAM_DESCRIPTION_MAP[teamKey] || "Equipo tecnico sin descripcion";
  }

  if (activeCountEl) {
    activeCountEl.textContent = String(activeIncidents);
  }

  if (pendingCountEl) {
    pendingCountEl.textContent = String(pendingIncidents);
  }

  if (resolvedTodayEl) {
    resolvedTodayEl.textContent = String(resolvedToday);
  }
}

function getFilteredTeamIncidents() {
  let incidents = getTeamIncidents();

  if (teamFilterStatus !== "all") {
    incidents = incidents.filter((incident) => incident.uiStatus === teamFilterStatus);
  }

  if (teamSearchQuery.trim() !== "") {
    const query = teamSearchQuery.toLowerCase();
    incidents = incidents.filter((incident) =>
      incident.description.toLowerCase().includes(query) ||
      incident.address.toLowerCase().includes(query) ||
      incident.category.toLowerCase().includes(query)
    );
  }

  return incidents;
}

function createTechnicianIncidentCard(incident) {
  const wrapper = document.createElement("div");

  wrapper.className = "rounded-2xl border-2 border-slate-200 p-4 bg-white shadow-sm cursor-move transition hover:shadow-md";
  wrapper.setAttribute("draggable", "true");
  wrapper.dataset.id = String(incident.id);

  wrapper.innerHTML = `
    <div class="flex items-center gap-2 flex-wrap mb-2">
      <span class="text-xs font-bold text-slate-400 uppercase">${incident.category}</span>
      <span class="px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(incident.uiStatus)}">${getStatusLabel(incident.uiStatus)}</span>
      <span class="px-2 py-1 rounded-full text-xs font-semibold ${getPriorityClass(incident.priority)}">${PRIORITY_LABEL_MAP[incident.priority] || incident.priority}</span>
    </div>

    <p class="font-semibold text-sm mb-2">${incident.title}</p>
    <p class="text-sm text-slate-600 mb-2">${incident.description}</p>

    <div class="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-3">
      <span>${incident.address}</span>
      <span>${formatDate(incident.creationDate)}</span>
    </div>

    <div class="flex gap-2 flex-wrap">
      <select
        class="status-select px-3 py-2 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-700"
        data-id="${incident.id}"
      >
        <option value="pending" ${incident.uiStatus === "pending" ? "selected" : ""}>Pendiente</option>
        <option value="in_progress" ${incident.uiStatus === "in_progress" ? "selected" : ""}>En progreso</option>
        <option value="resolved" ${incident.uiStatus === "resolved" ? "selected" : ""}>Resuelta</option>
      </select>
      <button
        type="button"
        class="px-3 py-2 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cycle-status-btn"
        data-id="${incident.id}"
      >
        Cambiar estado
      </button>
    </div>
  `;

  wrapper.addEventListener("dragstart", (event) => {
    draggedIncidentId = incident.id;
    wrapper.classList.add("opacity-50");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(incident.id));
  });

  wrapper.addEventListener("dragend", () => {
    wrapper.classList.remove("opacity-50");
  });

  return wrapper;
}

function renderTechnicianKanban() {
  const pendingColumn = document.getElementById("pending");
  const inProgressColumn = document.getElementById("in_progress");
  const resolvedColumn = document.getElementById("resolved");

  if (!pendingColumn || !inProgressColumn || !resolvedColumn) return;

  pendingColumn.innerHTML = "";
  inProgressColumn.innerHTML = "";
  resolvedColumn.innerHTML = "";

  const incidents = getFilteredTeamIncidents();

  const pendingIncidents = incidents.filter((incident) => incident.uiStatus === "pending");
  const inProgressIncidents = incidents.filter((incident) => incident.uiStatus === "in_progress");
  const resolvedIncidents = incidents.filter((incident) => incident.uiStatus === "resolved");

  renderColumnContent(pendingColumn, pendingIncidents, "No hay incidencias pendientes");
  renderColumnContent(inProgressColumn, inProgressIncidents, "No hay incidencias en progreso");
  renderColumnContent(resolvedColumn, resolvedIncidents, "No hay incidencias resueltas");

  attachDropEvents();
  attachCardButtons();
}

function renderColumnContent(columnElement, incidents, emptyMessage) {
  if (incidents.length === 0) {
    columnElement.innerHTML = `
      <div class="rounded-xl border-2 border-dashed border-slate-200 p-4 text-center text-sm text-slate-400">
        ${emptyMessage}
      </div>
    `;
    return;
  }

  incidents.forEach((incident) => {
    const card = createTechnicianIncidentCard(incident);
    columnElement.appendChild(card);
  });
}

function attachDropEvents() {
  const columns = document.querySelectorAll(".kanban-column");

  columns.forEach((column) => {
    column.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      column.classList.add("bg-slate-100", "rounded-xl");
    });

    column.addEventListener("dragleave", () => {
      column.classList.remove("bg-slate-100", "rounded-xl");
    });

    column.addEventListener("drop", async () => {
      column.classList.remove("bg-slate-100", "rounded-xl");

      if (!draggedIncidentId) return;

      const newUiStatus = column.id;
      try {
        await updateTechnicianIncidentStatus(draggedIncidentId, newUiStatus);
      } catch (error) {
        console.error(error);
        alert(error.message || "No se pudo cambiar el estado arrastrando la tarjeta");
      }
      draggedIncidentId = null;
    });
  });
}

async function updateTechnicianIncidentStatus(incidentId, newUiStatus) {
  const backendState = UI_TO_BACKEND_STATE[newUiStatus];
  if (!backendState) {
    return;
  }

  const response = await fetch(`${API_BASE}/${incidentId}/team-state`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ state: backendState })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "No se pudo actualizar el estado de la incidencia");
  }

  await loadIncidents();
  renderTechnicianProfileData();
  renderTechnicianKanban();
}

function attachCardButtons() {
  const cycleButtons = document.querySelectorAll(".cycle-status-btn");

  cycleButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const incidentId = Number(button.dataset.id);
      const incident = technicianIncidents.find((item) => item.id === incidentId);
      if (!incident) return;

      try {
        const select = document.querySelector(`.status-select[data-id="${incidentId}"]`);
        const selectedStatus = select ? select.value : incident.uiStatus;
        await updateTechnicianIncidentStatus(incidentId, selectedStatus);
      } catch (error) {
        console.error(error);
        alert(error.message || "No se pudo cambiar el estado de la incidencia");
      }
    });
  });
}

function attachTechnicianFilters() {
  const statusFilter = document.getElementById("team-filter-status");
  const searchInput = document.getElementById("team-search");

  if (statusFilter) {
    statusFilter.addEventListener("change", (event) => {
      teamFilterStatus = event.target.value;
      renderTechnicianKanban();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      teamSearchQuery = event.target.value;
      renderTechnicianKanban();
    });
  }
}

function attachHeaderActions() {
  const switchUserModeBtn = document.getElementById("switch-user-mode-btn");
  const logoutBtn = document.getElementById("logout-btn");

  if (switchUserModeBtn) {
    switchUserModeBtn.addEventListener("click", () => {
      localStorage.setItem("activeRole", "user");
      window.location.href = "/dashboard";
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      localStorage.removeItem("currentUser");
      localStorage.removeItem("activeRole");
      window.location.href = "/login";
    });
  }
}

async function initTechnicianProfile() {
  try {
    await loadSessionUser();
    await loadIncidents();
    renderTechnicianProfileData();
    renderTechnicianKanban();
    attachTechnicianFilters();
    attachHeaderActions();
  } catch (error) {
    console.error(error);
    window.location.href = "/login";
  }
}

document.addEventListener("DOMContentLoaded", initTechnicianProfile);
