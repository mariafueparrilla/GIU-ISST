let currentUser = null;
let myIncidents = [];

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
  const response = await fetch("/api/incidents/my");
  if (!response.ok) {
    throw new Error("No se pudieron cargar incidencias");
  }
  myIncidents = await response.json();
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
        
        <button id="edit-profile-btn" class="text-slate-500 hover:text-slate-700 ml-2" title="Editar datos">
          <i data-lucide="edit-2" style="width:18px;height:18px;"></i>
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
    await loadSessionUser();

    const isActingAsUser = currentUser.activeRole === "user";
    const currentPath = window.location.pathname;

    // Redirección de seguridad
    if (!isActingAsUser && !currentPath.includes("admin")) {
      // Si está en modo trabajador, debe ir a su panel
      const workerRole =
        currentUser.availableRoles.find((r) => r !== "user") || "operator";
      window.location.href = getWorkerLandingPath(workerRole);
      return;
    }

    if (isActingAsUser && currentPath.includes("admin")) {
      // Si está en modo ciudadano, no puede estar en el admin
      window.location.href = "/dashboard";
      return;
    }

    // Si todo está bien, cargamos los datos y dibujamos la pantalla
    await loadMyIncidents();
    renderDashboard();
  } catch (error) {
    console.error(error);
    localStorage.removeItem("currentUser");
    window.location.href = "/login";
  }
});
