let currentUser = null;
let incidentDetail = null;
let map = null;

const roleMap = {
  admin: "Admin",
  user: "Usuario",
  operator: "Operario",
  technician: "Tecnico",
};

const stateLabelMap = {
  creada: "Creada",
  asignada: "Asignada",
  en_curso: "En curso",
  resuelta: "Resuelta",
  rechazada: "Rechazada",
  cerrada: "Cerrada",
};

const priorityColorMap = {
  baja: "bg-slate-100 text-slate-700",
  media: "bg-blue-100 text-blue-700",
  alta: "bg-orange-100 text-orange-700",
  critica: "bg-red-100 text-red-700",
};

const stateColorMap = {
  creada: "bg-amber-100 text-amber-700",
  asignada: "bg-teal-100 text-teal-700",
  en_curso: "bg-blue-100 text-blue-700",
  resuelta: "bg-emerald-100 text-emerald-700",
  rechazada: "bg-red-100 text-red-700",
  cerrada: "bg-slate-200 text-slate-700",
};

function getIncidentIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function loadSessionUser() {
  const response = await fetch("/api/auth/me", { credentials: "same-origin" });
  if (!response.ok) {
    throw new Error("Sesion no valida");
  }

  currentUser = await response.json();
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
}

async function loadIncidentDetail() {
  const incidentId = getIncidentIdFromURL();
  if (!incidentId) {
    throw new Error("ID de incidencia no proporcionado");
  }

  const response = await fetch(`/api/incidents/${encodeURIComponent(incidentId)}`, {
    credentials: "same-origin"
  });
  
  if (!response.ok) {
    throw new Error("No se pudo cargar la incidencia");
  }

  incidentDetail = await response.json();
}

function initMap() {
  // Wait for Leaflet library to load
  if (typeof L === 'undefined') {
    setTimeout(initMap, 100);
    return;
  }

  if (!incidentDetail || !incidentDetail.ubicacion) {
    return;
  }

  const mapElement = document.getElementById("incident-map");
  if (!mapElement) {
    return;
  }

  const lat = incidentDetail.ubicacion.latitud;
  const lng = incidentDetail.ubicacion.longitud;

  // Inicializar mapa con Leaflet
  map = L.map(mapElement).setView([lat, lng], 15);

  // Agregar capa de OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  // Agregar marcador
  L.marker([lat, lng], {
    title: incidentDetail.title
  }).addTo(map);
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

function renderIncidentDetail() {
  const app = document.getElementById("app");

  const previewImages = incidentDetail.images && incidentDetail.images.length > 0
    ? incidentDetail.images.map((img, idx) => `
        <div class="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <img src="data:${img.mimeType};base64,${img.imageData}" alt="Imagen ${idx + 1}" class="w-full h-auto object-cover max-h-48" />
          <p class="text-xs text-slate-400 px-2 py-1 bg-slate-50">${img.filename}</p>
        </div>
      `).join("")
    : `<div class="text-center py-12 text-slate-400">No hay imágenes disponibles</div>`;

  app.innerHTML = `
    <div class="min-h-full bg-surface-50">
      <header class="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button id="back-btn" class="text-slate-600 hover:text-slate-900">
            <i data-lucide="arrow-left" style="width:18px;height:18px;"></i>
          </button>
          <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:#1468f5;">
            <i data-lucide="map-pin" style="width:18px;height:18px;color:white;"></i>
          </div>
          <span class="font-mono-brand text-xl font-bold text-slate-900">urFIX</span>
        </div>

        <div class="flex items-center gap-3 text-sm text-slate-600">
          <i data-lucide="user-circle-2" style="width:18px;height:18px;"></i>
          <span>${currentUser?.name || "Usuario"}</span>
          <button id="logout-btn" class="ml-2 text-slate-500 hover:text-slate-700">
            <i data-lucide="log-out" style="width:18px;height:18px;"></i>
          </button>
        </div>
      </header>

      <main class="px-6 py-8">
        <div class="max-w-4xl mx-auto">
          <!-- Titulo y estado -->
          <div class="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-slate-200">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h1 class="text-3xl font-bold text-slate-900">${incidentDetail.title}</h1>
                <p class="text-sm text-slate-500 mt-1">#${incidentDetail.id}</p>
              </div>
              <div class="flex items-center gap-2 flex-wrap justify-end">
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${priorityColorMap[incidentDetail.priority] || 'bg-slate-100'}">
                  ${incidentDetail.priority?.toUpperCase() || 'N/A'}
                </span>
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${stateColorMap[incidentDetail.state] || 'bg-slate-100'}">
                  ${stateLabelMap[incidentDetail.state] || incidentDetail.state}
                </span>
              </div>
            </div>

            <p class="text-slate-600 mb-4">${incidentDetail.description}</p>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p class="text-slate-500 font-medium">Categoria</p>
                <p class="text-slate-900">${incidentDetail.category?.toUpperCase() || 'N/A'}</p>
              </div>
              <div>
                <p class="text-slate-500 font-medium">Creador</p>
                <p class="text-slate-900">${incidentDetail.creatorDni || incidentDetail.creatorName}</p>
              </div>
              <div>
                <p class="text-slate-500 font-medium">Fecha de creacion</p>
                <p class="text-slate-900">${formatDate(incidentDetail.creationInstant)}</p>
              </div>
              <div>
                <p class="text-slate-500 font-medium">Equipo asignado</p>
                <p class="text-slate-900">${incidentDetail.assignedTeam?.toUpperCase() || 'Sin asignar'}</p>
              </div>
            </div>
          </div>

          <!-- Imagenes -->
          <div class="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-slate-200">
            <h2 class="text-xl font-bold text-slate-900 mb-4">Imagenes</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              ${previewImages}
            </div>
          </div>

          <!-- Ubicacion y mapa -->
          <div class="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-slate-200">
            <h2 class="text-xl font-bold text-slate-900 mb-4">Ubicacion</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div class="space-y-3 text-sm">
                  <div>
                    <p class="text-slate-500 font-medium">Municipio</p>
                    <p class="text-slate-900">${incidentDetail.ubicacion.municipio}</p>
                  </div>
                  <div>
                    <p class="text-slate-500 font-medium">Calle</p>
                    <p class="text-slate-900">${incidentDetail.ubicacion.calle}, ${incidentDetail.ubicacion.numero}</p>
                  </div>
                  <div>
                    <p class="text-slate-500 font-medium">Codigo postal</p>
                    <p class="text-slate-900">${incidentDetail.ubicacion.codigoPostal}</p>
                  </div>
                  <div>
                    <p class="text-slate-500 font-medium">Direccion formateada</p>
                    <p class="text-slate-900">${incidentDetail.ubicacion.formattedAddress || 'No disponible'}</p>
                  </div>
                  <div>
                    <p class="text-slate-500 font-medium">Coordenadas</p>
                    <p class="text-slate-900">${incidentDetail.ubicacion.latitud.toFixed(4)}, ${incidentDetail.ubicacion.longitud.toFixed(4)}</p>
                  </div>
                </div>
              </div>

              <div>
                <div id="incident-map" class="rounded-xl border border-slate-200"></div>
              </div>
            </div>
          </div>

          <!-- Hitos temporales -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
            <h2 class="text-xl font-bold text-slate-900 mb-4">Hitos</h2>
            
            <div class="space-y-3 text-sm">
              <div>
                <p class="text-slate-500 font-medium">Creacion</p>
                <p class="text-slate-900">${formatDate(incidentDetail.creationInstant)} - ${incidentDetail.creatorDni || incidentDetail.creatorName || '-'}</p>
              </div>
              ${incidentDetail.validationDate ? `<div>
                <p class="text-slate-500 font-medium">Validacion</p>
                <p class="text-slate-900">${formatDate(incidentDetail.validationDate)} - ${incidentDetail.validatorDni || '-'}</p>
              </div>` : ''}
              ${incidentDetail.asignationDate ? `<div>
                <p class="text-slate-500 font-medium">Asignacion</p>
                <p class="text-slate-900">${formatDate(incidentDetail.asignationDate)} - ${incidentDetail.assignerDni || '-'}</p>
              </div>` : ''}
              ${incidentDetail.resolutionDate ? `<div>
                <p class="text-slate-500 font-medium">Resolucion</p>
                <p class="text-slate-900">${formatDate(incidentDetail.resolutionDate)} - ${incidentDetail.resolverDni || '-'}</p>
              </div>` : ''}
              ${incidentDetail.rejectionDate ? `<div>
                <p class="text-slate-500 font-medium">Rechazo</p>
                <p class="text-slate-900">${formatDate(incidentDetail.rejectionDate)} - ${incidentDetail.rejecterDni || '-'}</p>
              </div>` : ''}
              ${incidentDetail.closingDate ? `<div>
                <p class="text-slate-500 font-medium">Cierre</p>
                <p class="text-slate-900">${formatDate(incidentDetail.closingDate)} - ${incidentDetail.closerDni || '-'}</p>
              </div>` : ''}
            </div>
          </div>

          ${currentUser?.role === 'operator' && (incidentDetail.state === 'CREADA' || incidentDetail.state === 'creada') ? `
          <!-- Acciones del operario -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 class="text-xl font-bold text-slate-900 mb-4">Validar y Asignar</h2>
            
            <form id="operator-validation-form" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Prioridad</label>
                  <select id="operator-priority-select" class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700" required>
                    <option value="">Selecciona prioridad</option>
                    <option value="BAJA">Baja</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta</option>
                    <option value="CRITICA">Crítica</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Equipo Técnico</label>
                  <select id="operator-team-select" class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700" required>
                    <option value="">Selecciona equipo</option>
                    <option value="ALUMBRADO">Alumbrado</option>
                    <option value="LIMPIEZA">Limpieza</option>
                    <option value="MOVILIDAD">Movilidad</option>
                    <option value="AGUA">Agua</option>
                    <option value="RESIDUOS">Residuos</option>
                    <option value="MOBILIARIO">Mobiliario</option>
                    <option value="OTROS">Otros</option>
                  </select>
                </div>
              </div>
              
              <div class="flex gap-3 pt-4">
                <button id="validate-incident-btn" type="button" class="px-4 py-3 rounded-xl text-white font-semibold" style="background:#0f766e;">
                  <i data-lucide="check-circle" style="width:16px;height:16px;display:inline;margin-right:6px;"></i>
                  Validar y Asignar
                </button>
                <button id="reject-incident-btn" type="button" class="px-4 py-3 rounded-xl text-white font-semibold" style="background:#b91c1c;">
                  <i data-lucide="x-circle" style="width:16px;height:16px;display:inline;margin-right:6px;"></i>
                  Rechazar incidencia
                </button>
              </div>
            </form>
          </div>
          ` : ''}
        </div>
      </main>
    </div>
  `;

  lucide.createIcons();
  attachDetailEvents();
  setTimeout(initMap, 200);
}

async function updateIncidentState(incidentId, state, fallbackMessage) {
  const response = await fetch(`/api/incidents/${encodeURIComponent(incidentId)}/state`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ state })
  });

  if (!response.ok) {
    const message = await response.text();
    alert(message || fallbackMessage);
    return false;
  }

  return true;
}

function attachDetailEvents() {
  const backBtn = document.getElementById("back-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const validateBtn = document.getElementById("validate-incident-btn");
  const rejectBtn = document.getElementById("reject-incident-btn");

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.history.back();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      localStorage.removeItem("currentUser");
      window.location.href = "/login";
    });
  }

  if (validateBtn) {
    validateBtn.addEventListener("click", async () => {
      if (validateBtn.disabled) {
        return;
      }
      const priority = document.getElementById("operator-priority-select")?.value;
      const team = document.getElementById("operator-team-select")?.value;
      
      if (!priority || !team) {
        alert("Debes seleccionar prioridad y equipo");
        return;
      }

      validateBtn.disabled = true;
      try {
        const response = await fetch(`/api/incidents/${encodeURIComponent(incidentDetail.id)}/operator-validate`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ priority, team })
        });

        if (!response.ok) {
          const message = await response.text();
          alert(message || 'No se pudo validar y asignar la incidencia');
          return;
        }

        window.location.href = '/operator-dashboard';
      } finally {
        validateBtn.disabled = false;
      }
    });
  }

  if (rejectBtn) {
    rejectBtn.addEventListener("click", async () => {
      rejectBtn.disabled = true;
      try {
        await updateIncidentState(incidentDetail.id, 'RECHAZADA', 'No se pudo rechazar la incidencia');
        window.location.href = '/operator-dashboard';
      } finally {
        rejectBtn.disabled = false;
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadSessionUser();
    await loadIncidentDetail();
    renderIncidentDetail();
  } catch (error) {
    console.error(error);
    alert(error.message || "Error cargando la incidencia");
    window.history.back();
  }
});
