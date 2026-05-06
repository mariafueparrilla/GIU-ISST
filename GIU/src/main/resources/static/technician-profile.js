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
let reportDraftIncidentId = null;
let reportDraftImages = [];
let activeTechView = "board";
let technicianIncidentsMap = null;
let technicianIncidentsMarkersLayer = null;

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
  const municipality = apiIncident.ubicacionMunicipio || location.municipio || "";
  const street = apiIncident.ubicacionCalle || location.calle || "";
  const number = apiIncident.ubicacionNumero || location.numero || "";

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
    ubicacionLatitud: apiIncident.ubicacionLatitud ?? location.latitud,
    ubicacionLongitud: apiIncident.ubicacionLongitud ?? location.longitud,
    address: `${municipality}, ${street} ${number}`.trim()
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

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderReportImagePreviews() {
  const container = document.getElementById("report-image-previews");
  if (!container) return;

  if (reportDraftImages.length === 0) {
    container.innerHTML = '<p class="text-sm text-slate-400">Todavia no has seleccionado imagenes.</p>';
    return;
  }

  container.innerHTML = reportDraftImages.map((img, idx) => `
    <div class="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <img src="data:${img.mimeType};base64,${img.imageData}" alt="Informe ${idx + 1}" class="w-full h-32 object-cover" />
      <button type="button" data-idx="${idx}" class="remove-report-image-btn absolute top-2 right-2 rounded-full bg-white/90 p-1 text-slate-700 shadow hover:bg-white">
        <i data-lucide="x" style="width:14px;height:14px;"></i>
      </button>
      <p class="px-2 py-1 text-xs text-slate-500 bg-slate-50 truncate">${img.filename}</p>
    </div>
  `).join("");

  lucide.createIcons();

  document.querySelectorAll(".remove-report-image-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const idx = Number(button.dataset.idx);
      reportDraftImages.splice(idx, 1);
      renderReportImagePreviews();
    });
  });
}

function openReportModal(incident) {
  reportDraftIncidentId = incident.id;
  reportDraftImages = [];

  const modal = document.getElementById("report-modal");
  const titleEl = document.getElementById("report-modal-incident-title");
  const metaEl = document.getElementById("report-modal-incident-meta");
  const descriptionEl = document.getElementById("report-description");
  const imagesInput = document.getElementById("report-images-input");

  if (!modal || !titleEl || !metaEl || !descriptionEl || !imagesInput) {
    return;
  }

  titleEl.textContent = incident.title;
  metaEl.textContent = `#${incident.id} · ${normalizeTeamLabel(incident.assignedTeam)} · ${formatDate(incident.creationDate)}`;
  descriptionEl.value = "";
  imagesInput.value = "";
  renderReportImagePreviews();

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeReportModal() {
  reportDraftIncidentId = null;
  reportDraftImages = [];

  const modal = document.getElementById("report-modal");
  const descriptionEl = document.getElementById("report-description");
  const imagesInput = document.getElementById("report-images-input");

  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }

  if (descriptionEl) {
    descriptionEl.value = "";
  }

  if (imagesInput) {
    imagesInput.value = "";
  }

  renderReportImagePreviews();
}

async function addReportImages(files) {
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      alert("Solo se permiten archivos de imagen");
      continue;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no puede exceder 5MB");
      continue;
    }

    if (reportDraftImages.length >= 3) {
      alert("El informe admite como maximo 3 imagenes");
      break;
    }

    const base64 = await fileToBase64(file);
    reportDraftImages.push({
      filename: file.name,
      mimeType: file.type,
      imageData: base64,
      fileSize: file.size
    });
  }

  renderReportImagePreviews();
}

async function submitTechnicianReport() {
  if (!reportDraftIncidentId) {
    return;
  }

  if (reportDraftImages.length === 0) {
    alert("Debes adjuntar al menos una imagen");
    return;
  }

  const description = document.getElementById("report-description")?.value?.trim() || "";
  const submitBtn = document.getElementById("report-modal-submit");

  if (submitBtn) {
    submitBtn.disabled = true;
  }

  try {
    const reportResponse = await fetch(`${API_BASE}/${reportDraftIncidentId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        description,
        images: reportDraftImages
      })
    });

    if (!reportResponse.ok) {
      const message = await reportResponse.text();
      alert(message || "No se pudo guardar el informe");
      return;
    }

    const resolveResponse = await fetch(`${API_BASE}/${reportDraftIncidentId}/team-state`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ state: "RESUELTA" })
    });

    if (!resolveResponse.ok) {
      const message = await resolveResponse.text();
      alert(message || "El informe se guardo, pero no se pudo marcar la incidencia como resuelta");
      await loadIncidents();
      refreshTechnicianViews();
      closeReportModal();
      return;
    }

    await loadIncidents();
    refreshTechnicianViews();
    closeReportModal();
  } catch (error) {
    console.error(error);
    alert(error.message || "No se pudo guardar el informe");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
    }
  }
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

function getIncidentCoordinates(incident) {
  const latitude = Number(incident.ubicacionLatitud);
  const longitude = Number(incident.ubicacionLongitud);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return [latitude, longitude];
}

function getTechnicianMapIncidents() {
  return getTeamIncidents().filter((incident) => {
    const isVisibleStatus = incident.uiStatus === "pending" || incident.uiStatus === "in_progress";
    return isVisibleStatus && getIncidentCoordinates(incident);
  });
}

function getTechnicianMapColor(status) {
  if (status === "pending") return "#f59e0b";
  if (status === "in_progress") return "#2563eb";
  return "#64748b";
}

function getTechnicianMapPopup(incident) {
  return `
    <div style="min-width: 220px; font-family: DM Sans, sans-serif;">
      <div style="font-weight: 700; margin-bottom: 4px;">${incident.title}</div>
      <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">${getStatusLabel(incident.uiStatus)}</div>
      <div style="font-size: 12px; color: #475569; margin-bottom: 4px;">${PRIORITY_LABEL_MAP[incident.priority] || incident.priority}</div>
      <div style="font-size: 12px; color: #475569;">${incident.address}</div>
    </div>
  `;
}

function getTechnicianPinIcon(color) {
  return L.divIcon({
    className: '',
    html: `
      <div style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -100%);">
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
          <path fill="${color}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"></path>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -26]
  });
}

function renderTechnicianMapView() {
  const mapElement = document.getElementById("technician-incidents-map");
  const mapCountEl = document.getElementById("tech-map-count");

  if (mapCountEl) {
    mapCountEl.textContent = String(getTechnicianMapIncidents().length);
  }

  if (!mapElement || !window.L || activeTechView !== "map") {
    return;
  }

  const visibleIncidents = getTechnicianMapIncidents();
  const madridCenter = [40.4168, -3.7038];

  if (!technicianIncidentsMap) {
    technicianIncidentsMap = L.map(mapElement, { scrollWheelZoom: false }).setView(madridCenter, 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(technicianIncidentsMap);
    technicianIncidentsMarkersLayer = L.layerGroup().addTo(technicianIncidentsMap);
  }

  if (technicianIncidentsMarkersLayer) {
    technicianIncidentsMarkersLayer.clearLayers();
  }

  const bounds = [];
  visibleIncidents.forEach((incident) => {
    const coordinates = getIncidentCoordinates(incident);
    if (!coordinates) return;

    const color = getTechnicianMapColor(incident.uiStatus);
    const marker = L.marker(coordinates, {
      icon: getTechnicianPinIcon(color)
    });

    marker.bindPopup(getTechnicianMapPopup(incident));
    marker.on("click", () => {
      window.location.href = `/incident-detail?id=${incident.id}`;
    });
    marker.addTo(technicianIncidentsMarkersLayer);
    bounds.push(coordinates);
  });

  if (bounds.length > 0) {
    technicianIncidentsMap.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
  } else {
    technicianIncidentsMap.setView(madridCenter, 10);
  }

  setTimeout(() => technicianIncidentsMap?.invalidateSize(), 0);
}

function setTechnicianView(view) {
  activeTechView = view;

  const boardView = document.getElementById("tech-board-view");
  const mapView = document.getElementById("tech-map-view");
  const boardButton = document.getElementById("tech-view-board-btn");
  const mapButton = document.getElementById("tech-view-map-btn");

  if (boardView) {
    boardView.classList.toggle("hidden", view !== "board");
  }
  if (mapView) {
    mapView.classList.toggle("hidden", view !== "map");
  }

  if (boardButton) {
    boardButton.className = view === "board"
      ? "px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold shadow"
      : "px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50";
  }

  if (mapButton) {
    mapButton.className = view === "map"
      ? "px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold shadow"
      : "px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50";
  }

  if (view === "map") {
    renderTechnicianMapView();
  }
}

function refreshTechnicianViews() {
  renderTechnicianProfileData();
  renderTechnicianKanban();
  if (activeTechView === "map") {
    renderTechnicianMapView();
  }
}

function renderTechnicianProfileData() {
  const incidents = getTeamIncidents();

  const activeIncidents = incidents.filter((incident) => incident.uiStatus !== "resolved" && incident.uiStatus !== "pending").length;
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
      <span>${formatDate(incident.creationDate)}</span>
    </div>

    <div class="flex gap-2 flex-wrap">
      ${incident.uiStatus === "in_progress" ? `
        <button
          type="button"
          class="add-report-btn px-3 py-2 rounded-xl bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 transition"
          data-id="${incident.id}"
        >
          Rellenar informe
        </button>
      ` : ""}
    </div>
  `;

  const isDraggable = incident.uiStatus === "pending" || incident.uiStatus === "in_progress";

  wrapper.addEventListener("dragstart", (event) => {
    if (!isDraggable) {
      event.preventDefault();
      return;
    }
    draggedIncidentId = incident.id;
    wrapper.classList.add("opacity-50");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(incident.id));
  });

  wrapper.addEventListener("dragend", () => {
    wrapper.classList.remove("opacity-50");
  });

  if (!isDraggable) {
    wrapper.style.cursor = "default";
  } else {
    wrapper.draggable = true;
  }

  // Add click handler for detail view (only if not clicking buttons)
  wrapper.addEventListener("click", (e) => {
    if (e.target.closest("button")) {
      return;
    }
    window.location.href = `/incident-detail?id=${incident.id}`;
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
  const allowedDropColumns = new Set(["pending", "in_progress"]);

  columns.forEach((column) => {
    column.addEventListener("dragover", (event) => {
      if (!allowedDropColumns.has(column.id)) {
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      column.classList.add("bg-slate-100", "rounded-xl");
    });

    column.addEventListener("dragleave", () => {
      column.classList.remove("bg-slate-100", "rounded-xl");
    });

    column.addEventListener("drop", async () => {
      column.classList.remove("bg-slate-100", "rounded-xl");

      if (!allowedDropColumns.has(column.id)) {
        draggedIncidentId = null;
        return;
      }

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
    let message = "No se pudo actualizar el estado de la incidencia";
    try {
      const errorData = await response.json();
      if (errorData.message) {
        message = errorData.message;
      }
    } catch {
      try {
        message = await response.text();
      } catch {
        // keep default message
      }
    }
    throw new Error(message);
  }

  await loadIncidents();
  refreshTechnicianViews();
}

function attachCardButtons() {
  const addReportButtons = document.querySelectorAll(".add-report-btn");

  addReportButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const incidentId = Number(button.dataset.id);
      const incident = technicianIncidents.find((item) => item.id === incidentId);
      if (!incident) return;

      openReportModal(incident);
    });
  });
}

function attachReportModalActions() {
  const modal = document.getElementById("report-modal");
  const closeButton = document.getElementById("report-modal-close");
  const cancelButton = document.getElementById("report-modal-cancel");
  const submitButton = document.getElementById("report-modal-submit");
  const imagesInput = document.getElementById("report-images-input");

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeReportModal();
      }
    });
  }

  if (closeButton) {
    closeButton.addEventListener("click", closeReportModal);
  }

  if (cancelButton) {
    cancelButton.addEventListener("click", closeReportModal);
  }

  if (submitButton) {
    submitButton.addEventListener("click", submitTechnicianReport);
  }

  if (imagesInput) {
    imagesInput.addEventListener("change", async (event) => {
      const files = Array.from(event.target.files || []);
      await addReportImages(files);
      imagesInput.value = "";
    });
  }
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

function attachTechnicianViewActions() {
  const boardButton = document.getElementById("tech-view-board-btn");
  const mapButton = document.getElementById("tech-view-map-btn");

  if (boardButton) {
    boardButton.addEventListener("click", () => setTechnicianView("board"));
  }

  if (mapButton) {
    mapButton.addEventListener("click", () => setTechnicianView("map"));
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

  const editProfileBtn = document.getElementById("edit-profile-btn");
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
      window.location.href = `/user-edit?dni=${encodeURIComponent(currentUser.dni)}`;
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
    attachTechnicianViewActions();
    attachHeaderActions();
    attachReportModalActions();
  } catch (error) {
    console.error(error);
    window.location.href = "/login";
  }
}

document.addEventListener("DOMContentLoaded", initTechnicianProfile);
