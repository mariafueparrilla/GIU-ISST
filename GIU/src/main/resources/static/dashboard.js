let currentUser = null;
let myIncidents = [];
let approvedIncidents = [];
let userIncidentsMap = null;
let userIncidentsMarkersLayer = null;

const madridCenter = [40.4168, -3.7038];

const mapMarkerColorByPriority = {
  baja: '#0ea5e9',
  media: '#f59e0b',
  alta: '#ff6b35',
  critica: '#ef4444'
};

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

async function loadSessionUser() {
  const response = await fetch("/api/auth/me", { credentials: "same-origin" });
  if (!response.ok) {
    throw new Error("Sesion no valida");
  }

  const userData = await response.json();

  if (!Array.isArray(userData.availableRoles) || userData.availableRoles.length === 0) {
    userData.availableRoles = userData.role === "user" ? ["user"] : ["user", userData.role];
  }

  // 1. Buscamos qué rol tiene activo en el navegador
  let currentActiveRole = localStorage.getItem("activeRole");

  // 2. Si no tiene ninguno o es inválido, forzamos que entre como ciudadano ('user')
  if (
    !currentActiveRole ||
    !userData.availableRoles.includes(currentActiveRole)
  ) {
    currentActiveRole = "user";
    localStorage.setItem("activeRole", currentActiveRole);
  }

  // 3. Guardamos la sesión completa
  currentUser = {
    ...userData,
    activeRole: currentActiveRole,
  };

  localStorage.setItem("currentUser", JSON.stringify(currentUser));
}

async function loadMyIncidents() {
  const response = await fetch("/api/incidents/my", { credentials: "same-origin" });
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Error loading incidents: ${response.status}`, errorText);
    throw new Error(`No se pudieron cargar incidencias (${response.status})`);
  }
  myIncidents = await response.json();
  console.log("Incidencias propias cargadas:", myIncidents);
  console.log("Primera incidencia propia (si existe):", myIncidents[0]);
}

async function loadApprovedIncidents() {
  const response = await fetch("/api/incidents/approved", { credentials: "same-origin" });
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Error loading approved incidents: ${response.status}`, errorText);
    throw new Error(`No se pudieron cargar incidencias aprobadas (${response.status})`);
  }
  approvedIncidents = await response.json();
  console.log("Incidencias aprobadas cargadas:", approvedIncidents);
  console.log("Primera incidencia aprobada (si existe):", approvedIncidents[0]);
}

function getIncidentCoordinates(incident) {
  // Intentar diferentes nombres de campos para latitud/longitud
  const latitude = incident.ubicacionLatitud || incident.latitud || incident.latitude;
  const longitude = incident.ubicacionLongitud || incident.longitud || incident.longitude;

  const latNum = Number(latitude);
  const lngNum = Number(longitude);

  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
    console.log(`Coordenadas inválidas para "${incident.title}": lat=${latitude}, lng=${longitude}`);
    return null;
  }

  // Verificar rangos razonables para Madrid
  if (latNum < 40 || latNum > 41 || lngNum < -4 || lngNum > -3) {
    console.log(`Coordenadas fuera de Madrid para "${incident.title}": [${latNum}, ${lngNum}]`);
    return null;
  }

  return [latNum, lngNum];
}

function renderUserIncidentsMap(incidentList = myIncidents) {
  const mapElement = document.getElementById('user-incidents-map');
  if (!mapElement) {
    console.log("Map element not found");
    return;
  }

  // Fijar altura mínima si el contenedor está vacío
  if (mapElement.clientHeight === 0) {
    mapElement.style.minHeight = '400px';
  }

  if (!userIncidentsMap) {
    console.log("Inicializando mapa de Leaflet...");
    try {
      userIncidentsMap = L.map(mapElement, { scrollWheelZoom: false }).setView(madridCenter, 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(userIncidentsMap);
      userIncidentsMarkersLayer = L.layerGroup().addTo(userIncidentsMap);
      console.log("Mapa inicializado correctamente");
      console.log("Centro del mapa:", userIncidentsMap.getCenter());
      console.log("Zoom del mapa:", userIncidentsMap.getZoom());
    } catch (e) {
      console.error("Error al inicializar mapa:", e);
      throw e;
    }
  }

  if (userIncidentsMarkersLayer) {
    userIncidentsMarkersLayer.clearLayers();
  }

  const bounds = L.latLngBounds([]);
  const validIncidents = incidentList.filter((incident) => getIncidentCoordinates(incident));
  console.log("Incidentes totales:", incidentList.length);
  console.log("Incidentes con coordenadas válidas:", validIncidents.length);

  validIncidents.forEach((incident, index) => {
    const coordinates = getIncidentCoordinates(incident);
    if (coordinates) {
      bounds.extend(coordinates);
      const color = mapMarkerColorByPriority[incident.priority] || '#6b7280';
      const marker = L.circleMarker(coordinates, {
        radius: 8,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
        title: incident.title
      });
      marker.addTo(userIncidentsMarkersLayer);
    }
  });

  console.log(`Se agregaron ${validIncidents.length} marcadores al mapa`);

  if (bounds.isValid()) {
    userIncidentsMap.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
  } else {
    // Si no hay incidencias, mostrar mapa centrado en Madrid
    userIncidentsMap.setView(madridCenter, 11);
  }

  setTimeout(() => {
    try {
      userIncidentsMap?.invalidateSize();
      console.log("Mapa renderizado correctamente");
    } catch (e) {
      console.error("Error al redimensionar mapa:", e);
    }
  }, 100);
}

// Nueva función separada para mantener el HTML limpio
function renderHeader() {
  const isFuncionario = currentUser.availableRoles.some((r) => r !== "user");
  const isActingAsUser = currentUser.activeRole === "user";
  const workerRole =
    currentUser.availableRoles.find((r) => r !== "user") || "operator";

  return `
    <header class="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:#1468f5;">
          <i data-lucide="map-pin" style="width:18px;height:18px;color:white;"></i>
        </div>
        <span class="font-mono-brand text-xl font-bold text-slate-900">urFIX</span>
        
        <span class="ml-4 px-3 py-1 text-xs font-bold rounded-md ${isActingAsUser ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}">
          MODO: ${isActingAsUser ? "CIUDADANO" : "TRABAJADOR"}
        </span>
      </div>

      <div class="flex items-center gap-4 text-sm text-slate-600">
        
        ${
          isFuncionario
            ? `
          <button id="switch-context-btn" class="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition font-medium">
            <i data-lucide="arrow-left-right" style="width:16px;height:16px;"></i>
            ${isActingAsUser ? `Acceder como ${roleMap[workerRole]}` : "Acceder como Ciudadano"}
          </button>
          <div class="h-6 w-px bg-slate-200"></div>
        `
            : ""
        }

        <div class="flex items-center gap-2">
          <i data-lucide="user-circle-2" style="width:18px;height:18px;"></i>
          <span>${currentUser?.name || "Usuario"}</span>
        </div>
        
        <button id="edit-profile-btn" class="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition font-medium ml-2" title="Editar datos">
          <i data-lucide="user-circle-2" style="width:16px;height:16px;"></i>
          <span>Editar usuario</span>
        </button>
        <button id="logout-btn" class="text-slate-500 hover:text-slate-700 ml-2" title="Cerrar sesión">
          <i data-lucide="log-out" style="width:18px;height:18px;"></i>
        </button>
      </div>
    </header>
  `;
}

function getWorkerLandingPath(workerRole) {
  if (workerRole === "operator") {
    return "/operator-dashboard";
  }
  if (workerRole === "technician") {
    return "/technician-profile";
  }
  return "/admin-dashboard";
}

function renderDashboard() {
  const app = document.getElementById("app");
  const isActingAsUser = currentUser.activeRole === "user";

  app.innerHTML = `
    <div class="min-h-full bg-surface-50">
      
      ${renderHeader()}

      <nav class="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-6 text-sm">
        <button class="flex items-center gap-2 px-3 py-2 rounded-xl text-white font-semibold" style="background:#1468f5;">
          <i data-lucide="folder-open" style="width:16px;height:16px;"></i>
          Mis incidencias
        </button>

        <button id="new-incident-nav-btn" class="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <i data-lucide="plus-circle" style="width:16px;height:16px;"></i>
          Nueva incidencia
        </button>
      </nav>

      <main class="px-8 py-8">
        ${isActingAsUser ? `
          <div class="mb-8 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div class="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 class="text-lg font-bold text-slate-900">Mapa de incidencias aprobadas</h2>
                <p class="text-sm text-slate-500">${approvedIncidents.length > 0 ? 'Visualización geográfica de las incidencias aprobadas' : 'Aquí aparecerán las incidencias aprobadas por el equipo'}</p>
              </div>
            </div>
            <div id="user-incidents-map" class="rounded-2xl border border-slate-200 min-h-96" style="height: 400px;"></div>
            <div class="flex items-center gap-4 mt-4 text-sm text-slate-600 flex-wrap">
              <div class="flex items-center gap-2">
                <div style="width:12px;height:12px;border-radius:50%;background:#0ea5e9;"></div>
                <span>Baja</span>
              </div>
              <div class="flex items-center gap-2">
                <div style="width:12px;height:12px;border-radius:50%;background:#f59e0b;"></div>
                <span>Media</span>
              </div>
              <div class="flex items-center gap-2">
                <div style="width:12px;height:12px;border-radius:50%;background:#ff6b35;"></div>
                <span>Alta</span>
              </div>
              <div class="flex items-center gap-2">
                <div style="width:12px;height:12px;border-radius:50%;background:#ef4444;"></div>
                <span>Crítica</span>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="flex items-center justify-between mb-8">
          <h1 class="text-3xl font-bold text-slate-900">
            Mis incidencias <span class="text-slate-400 text-xl">(${myIncidents.length})</span>
          </h1>

          <button id="new-incident-main-btn" class="px-5 py-3 rounded-xl text-white font-semibold flex items-center gap-2 shadow-sm hover:opacity-90" style="background:#1468f5;">
            <i data-lucide="plus" style="width:18px;height:18px;"></i>
            Nueva
          </button>
        </div>

        ${
          myIncidents.length === 0
            ? `<div class="flex flex-col items-center justify-center text-center py-24 text-slate-400">
              <i data-lucide="file-text" style="width:52px;height:52px;" class="mb-4"></i>
              <p class="text-lg font-medium">No has reportado incidencias</p>
              <p class="text-sm mt-1">Pulsa el boton Nueva para crear una</p>
            </div>`
            : `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              ${myIncidents
                .map(
                  (incident) => `
                <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer incident-card" data-incident-id="${incident.id}">
                  ${incident.previewImageBase64 ? `
                    <div class="rounded-lg overflow-hidden mb-3 h-40 bg-slate-100">
                      <img src="data:image/jpeg;base64,${incident.previewImageBase64}" alt="Preview" class="w-full h-full object-cover" />
                    </div>
                  ` : `<div class="rounded-lg overflow-hidden mb-3 h-40 bg-slate-100 flex items-center justify-center">
                    <i data-lucide="image-off" style="width:32px;height:32px;color:#cbd5e1;"></i>
                  </div>`}
                  
                  <div class="space-y-2">
                    <div class="flex items-start justify-between gap-2">
                      <h2 class="text-sm font-semibold text-slate-900 line-clamp-2">${incident.title}</h2>
                      <span class="px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${stateColorMap[incident.state] || 'bg-slate-100'}">
                        ${stateLabelMap[incident.state] || incident.state}
                      </span>
                    </div>
                    
                    <p class="text-xs text-slate-600 line-clamp-2">${incident.description}</p>
                    
                    <div class="flex items-center gap-2 flex-wrap pt-2">
                      <span class="px-2 py-1 rounded-full text-xs font-semibold ${priorityColorMap[incident.priority] || 'bg-slate-100'}">
                        ${incident.priority?.toUpperCase() || 'N/A'}
                      </span>
                      <span class="text-xs text-slate-500">${incident.category?.toUpperCase() || 'N/A'}</span>
                    </div>
                    
                    <div class="text-xs text-slate-400 border-t border-slate-100 pt-2 mt-2">
                      <div class="flex items-center gap-1">
                        <i data-lucide="map-pin" style="width:12px;height:12px;"></i>
                        <span>${incident.ubicacionMunicipio}, ${incident.ubicacionCalle} ${incident.ubicacionNumero}</span>
                      </div>
                    </div>
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>`
        }
      </main>
    </div>
  `;

  lucide.createIcons();
  if (isActingAsUser) {
    // Esperar a que el DOM esté completamente renderizado antes de inicializar el mapa
    setTimeout(() => {
      console.log("Inicializando mapa después del render...");
      renderUserIncidentsMap(approvedIncidents);
    }, 100); // Aumentar el timeout para asegurar que el DOM esté listo
  }
  attachDashboardEvents();
}

function attachDashboardEvents() {
  const logoutBtn = document.getElementById("logout-btn");
  const newIncidentNavBtn = document.getElementById("new-incident-nav-btn");
  const newIncidentMainBtn = document.getElementById("new-incident-main-btn");
  const switchContextBtn = document.getElementById("switch-context-btn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      localStorage.removeItem("currentUser");
      localStorage.removeItem("activeRole");
      window.location.href = "/login";
    });
  }

  if (switchContextBtn) {
    switchContextBtn.addEventListener("click", () => {
      if (currentUser.activeRole === "user") {
        const workerRole =
          currentUser.availableRoles.find((r) => r !== "user") || "operator";
        localStorage.setItem("activeRole", workerRole);
        window.location.href = getWorkerLandingPath(workerRole);
      } else {
        localStorage.setItem("activeRole", "user");
        window.location.href = "/dashboard";
      }
    });
  }

  if (newIncidentNavBtn) {
    newIncidentNavBtn.addEventListener(
      "click",
      () => (window.location.href = "/new-incident"),
    );
  }

  const editProfileBtn = document.getElementById('edit-profile-btn');
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      window.location.href = `/user-edit?dni=${encodeURIComponent(currentUser.dni)}`;
    });
  }

  if (newIncidentMainBtn) {
    newIncidentMainBtn.addEventListener(
      "click",
      () => (window.location.href = "/new-incident"),
    );
  }

  // Agregar event listeners a las tarjetas de incidencias
  document.querySelectorAll(".incident-card").forEach((card) => {
    card.addEventListener("click", () => {
      const incidentId = card.dataset.incidentId;
      window.location.href = `/incident-detail?id=${incidentId}`;
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("1. Iniciando carga de dashboard...");
    await loadSessionUser();
    console.log("2. Usuario cargado:", currentUser);

    const isActingAsUser = currentUser.activeRole === "user";
    const currentPath = window.location.pathname;

    // Redirección de seguridad
    if (!isActingAsUser && !currentPath.includes("admin")) {
      // Si está en modo trabajador, debe ir a su panel
      const workerRole =
        currentUser.availableRoles.find((r) => r !== "user") || "operator";
      console.log("3. Redirigiendo a modo trabajador:", workerRole);
      window.location.href = getWorkerLandingPath(workerRole);
      return;
    }

    if (isActingAsUser && currentPath.includes("admin")) {
      // Si está en modo ciudadano, no puede estar en el admin
      console.log("3. Redirigiendo a dashboard (está en admin)");
      window.location.href = "/dashboard";
      return;
    }

    // Si todo está bien, cargamos los datos y dibujamos la pantalla
    console.log("3. Cargando incidencias...");
    await loadMyIncidents();
    if (isActingAsUser) {
      await loadApprovedIncidents();
    }
    console.log("4. Incidencias cargadas:", myIncidents.length);
    if (isActingAsUser) {
      console.log("4.a Incidencias aprobadas cargadas:", approvedIncidents.length);
    }
    
    console.log("5. Renderizando dashboard...");
    renderDashboard();
    console.log("6. Dashboard renderizado correctamente");
  } catch (error) {
    console.error("ERROR en dashboard:", error);
    console.error("Stack:", error.stack);
    localStorage.removeItem("currentUser");
    window.location.href = "/login";
  }
});
