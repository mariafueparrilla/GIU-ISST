// ========================================
// CONFIG
// ========================================
const API_URL = "http://localhost:8080/api/incidents";
const TEAM_ID = "team-01"; // luego lo puedes sacar del usuario logueado

let technicianIncidents = [];

// ========================================
// CARGAR INCIDENCIAS DESDE SPRING
// ========================================
async function loadIncidents() {
  try {
    const response = await fetch(`${API_URL}/team/${TEAM_ID}`);
    const data = await response.json();

    technicianIncidents = data;
    renderTechnicianProfileData();
    renderTechnicianKanban();

  } catch (error) {
    console.error("Error cargando incidencias:", error);
  }
}

// ======================================================
// HELPERS
// ======================================================

function getCurrentTeam() {
  return technicalTeams.find(team => team.id === currentTechnician.teamId);
}

function getTeamIncidents() {
  return technicianIncidents.filter(
    incident => incident.assignedTeamId === currentTechnician.teamId
  );
}

function formatDate(isoDate) {
  if (!isoDate) return "—";

  const date = new Date(isoDate);

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
  switch (priority.toLowerCase()) {
    case "urgente":
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
  switch (status) {
    case "pending":
      return "Pendiente";
    case "in_progress":
      return "En progreso";
    case "resolved":
      return "Resuelta";
    default:
      return status;
  }
}

function getStatusClass(status) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "in_progress":
      return "bg-blue-100 text-blue-700";
    case "resolved":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

// ======================================================
// RENDER PERFIL DEL TÉCNICO
// ======================================================

function renderTechnicianProfileData() {
  const team = getCurrentTeam();
  const incidents = getTeamIncidents();

  const activeIncidents = incidents.filter(
    incident => incident.status !== "resolved"
  ).length;

  const pendingIncidents = incidents.filter(
    incident => incident.status === "pending"
  ).length;

  const today = new Date().toLocaleDateString("es-ES");
  const resolvedToday = incidents.filter(incident => {
    if (incident.status !== "resolved") return false;
    return new Date(incident.date).toLocaleDateString("es-ES") === today;
  }).length;

  const techNameEl = document.getElementById("tech-name");
  const teamNameEl = document.getElementById("team-name");
  const teamSpecialtyEl = document.getElementById("team-specialty");
  const teamStatusEl = document.getElementById("team-status");
  const teamDescriptionEl = document.getElementById("team-description");
  const activeCountEl = document.getElementById("active-count");
  const pendingCountEl = document.getElementById("pending-count");
  const resolvedTodayEl = document.getElementById("resolved-today");

  if (techNameEl) {
    techNameEl.textContent = `${currentTechnician.name} ${currentTechnician.surname}`;
  }

  if (teamNameEl) {
    teamNameEl.textContent = team?.name || "Sin equipo";
  }

  if (teamSpecialtyEl) {
    teamSpecialtyEl.textContent = team?.specialty || "—";
  }

  if (teamStatusEl) {
    teamStatusEl.textContent = team?.status || "—";

    teamStatusEl.classList.remove("text-emerald-600", "text-amber-600", "text-red-600");

    if (team?.status?.toLowerCase() === "disponible") {
      teamStatusEl.classList.add("text-emerald-600");
    } else if (team?.status?.toLowerCase() === "en servicio") {
      teamStatusEl.classList.add("text-amber-600");
    } else {
      teamStatusEl.classList.add("text-red-600");
    }
  }

  if (teamDescriptionEl) {
    teamDescriptionEl.textContent = team?.description || "Equipo no definido";
  }

  if (activeCountEl) {
    activeCountEl.textContent = activeIncidents;
  }

  if (pendingCountEl) {
    pendingCountEl.textContent = pendingIncidents;
  }

  if (resolvedTodayEl) {
    resolvedTodayEl.textContent = resolvedToday;
  }
}

// ======================================================
// FILTRADO
// ======================================================

function getFilteredTeamIncidents() {
  let incidents = getTeamIncidents();

  if (teamFilterStatus !== "all") {
    incidents = incidents.filter(incident => incident.status === teamFilterStatus);
  }

  if (teamSearchQuery.trim() !== "") {
    const query = teamSearchQuery.toLowerCase();
    incidents = incidents.filter(incident =>
      incident.description.toLowerCase().includes(query) ||
      incident.address.toLowerCase().includes(query) ||
      incident.category.toLowerCase().includes(query)
    );
  }

  return incidents;
}

// ======================================================
// CREACIÓN DE TARJETAS
// ======================================================

function createTechnicianIncidentCard(incident) {
  const wrapper = document.createElement("div");

  wrapper.className = "rounded-2xl border-2 border-surface-200 p-4 bg-white shadow-sm cursor-move transition hover:shadow-md";
  wrapper.setAttribute("draggable", "true");
  wrapper.dataset.id = incident.id;

  wrapper.innerHTML = `
    <div class="flex items-center gap-2 flex-wrap mb-2">
      <span class="text-xs font-bold text-slate-400 uppercase">${incident.category}</span>
      <span class="status-badge ${getStatusClass(incident.status)}">${getStatusLabel(incident.status)}</span>
      <span class="status-badge ${getPriorityClass(incident.priority)}">${incident.priority}</span>
    </div>

    <p class="font-semibold text-sm mb-2">${incident.description}</p>

    <div class="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-3">
      <span class="flex items-center gap-1">
        📍 ${incident.address}
      </span>
      <span class="flex items-center gap-1">
        ⏰ ${formatDate(incident.date)}
      </span>
    </div>

    <div class="flex gap-2 flex-wrap">
      <button 
        type="button"
        class="px-3 py-2 rounded-xl text-white font-bold text-xs bg-brand-600 hover:opacity-90 transition view-detail-btn"
        data-id="${incident.id}"
      >
        Ver detalle
      </button>

      <button 
        type="button"
        class="px-3 py-2 rounded-xl border-2 border-surface-200 text-xs font-bold text-slate-600 hover:bg-surface-100 transition cycle-status-btn"
        data-id="${incident.id}"
      >
        Cambiar estado
      </button>
    </div>
  `;

  // Drag start
  wrapper.addEventListener("dragstart", (event) => {
    draggedIncidentId = incident.id;
    wrapper.classList.add("opacity-50");
    event.dataTransfer.effectAllowed = "move";
  });

  // Drag end
  wrapper.addEventListener("dragend", () => {
    wrapper.classList.remove("opacity-50");
  });

  return wrapper;
}

// ======================================================
// RENDER KANBAN
// ======================================================

function renderTechnicianKanban() {
  const pendingColumn = document.getElementById("pending");
  const inProgressColumn = document.getElementById("in_progress");
  const resolvedColumn = document.getElementById("resolved");

  if (!pendingColumn || !inProgressColumn || !resolvedColumn) return;

  pendingColumn.innerHTML = "";
  inProgressColumn.innerHTML = "";
  resolvedColumn.innerHTML = "";

  const incidents = getFilteredTeamIncidents();

  const pendingIncidents = incidents.filter(incident => incident.status === "pending");
  const inProgressIncidents = incidents.filter(incident => incident.status === "in_progress");
  const resolvedIncidents = incidents.filter(incident => incident.status === "resolved");

  renderColumnContent(pendingColumn, pendingIncidents, "No hay incidencias pendientes");
  renderColumnContent(inProgressColumn, inProgressIncidents, "No hay incidencias en progreso");
  renderColumnContent(resolvedColumn, resolvedIncidents, "No hay incidencias resueltas");

  attachDropEvents();
  attachCardButtons();
}

function renderColumnContent(columnElement, incidents, emptyMessage) {
  if (incidents.length === 0) {
    columnElement.innerHTML = `
      <div class="rounded-xl border-2 border-dashed border-surface-200 p-4 text-center text-sm text-slate-400">
        ${emptyMessage}
      </div>
    `;
    return;
  }

  incidents.forEach(incident => {
    const card = createTechnicianIncidentCard(incident);
    columnElement.appendChild(card);
  });
}

// ======================================================
// DRAG & DROP
// ======================================================

function attachDropEvents() {
  const columns = document.querySelectorAll(".kanban-column");

  columns.forEach(column => {
    column.addEventListener("dragover", (event) => {
      event.preventDefault();
      column.classList.add("bg-slate-100", "rounded-xl");
    });

    column.addEventListener("dragleave", () => {
      column.classList.remove("bg-slate-100", "rounded-xl");
    });

    column.addEventListener("drop", async () => {
      column.classList.remove("bg-slate-100", "rounded-xl");

      if (!draggedIncidentId) return;

      const newStatus = column.id;
      await updateTechnicianIncidentStatus(draggedIncidentId, newStatus);

      draggedIncidentId = null;
      renderTechnicianProfileData();
      renderTechnicianKanban();
    });
  });
}

// ======================================================
// CAMBIO DE ESTADO
// ======================================================

async function updateTechnicianIncidentStatus(incidentId, newStatus) {
  try {
    const response = await fetch(`${API_URL}/${incidentId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (!response.ok) throw new Error("Error actualizando");

    // Recargar datos reales del backend
    await loadIncidents();

  } catch (error) {
    console.error("Error actualizando incidencia:", error);
  }
}

function cycleIncidentStatus(currentStatus) {
  if (currentStatus === "pending") return "in_progress";
  if (currentStatus === "in_progress") return "resolved";
  return "pending";
}

// ======================================================
// BOTONES DE TARJETAS
// ======================================================

function attachCardButtons() {
  const detailButtons = document.querySelectorAll(".view-detail-btn");
  const cycleButtons = document.querySelectorAll(".cycle-status-btn");

  detailButtons.forEach(button => {
    button.addEventListener("click", () => {
      const incidentId = button.dataset.id;
      const incident = technicianIncidents.find(i => i.id === incidentId);

      if (!incident) return;

      alert(
        `Detalle de incidencia\n\n` +
        `Título: ${incident.title}\n` +
        `Descripción: ${incident.description}\n` +
        `Dirección: ${incident.address}\n` +
        `Estado: ${getStatusLabel(incident.status)}\n` +
        `Prioridad: ${incident.priority}`
      );
    });
  });

  cycleButtons.forEach(button => {
    button.addEventListener("click", async () => {
      const incidentId = button.dataset.id;
      const incident = technicianIncidents.find(i => i.id === incidentId);

      if (!incident) return;

      const nextStatus = cycleIncidentStatus(incident.status);
      await updateTechnicianIncidentStatus(incidentId, nextStatus);

      renderTechnicianProfileData();
      renderTechnicianKanban();
    });
  });
}

// ======================================================
// FILTROS
// ======================================================

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

// ======================================================
// INIT
// ======================================================

function initTechnicianProfile() {
  renderTechnicianProfileData();
  renderTechnicianKanban();
  attachTechnicianFilters();
}

// Lanza cuando cargue el DOM
document.addEventListener("DOMContentLoaded", initTechnicianProfile);