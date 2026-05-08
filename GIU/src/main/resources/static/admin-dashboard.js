let currentUser = null;
let users = [];
let incidents = [];
let activeTab = 'incidencias';
let activeIncidentFilters = { priority: [], state: [], team: [] };
let activeUserRoleFilters = [];
let adminIncidentSearchQuery = '';
let adminUserSearchQuery = '';
let isInitialLoad = true;
let adminIncidentMapNeedsRefresh = true;

const roleMap = {
  admin: 'Administrador',
  user: 'Usuario',
  operator: 'Operario',
  technician: 'Técnico'
};

const stateLabelMap = {
  creada: 'Creada',
  asignada: 'Asignada',
  en_curso: 'En curso',
  resuelta: 'Resuelta',
  rechazada: 'Rechazada',
  cerrada: 'Cerrada'
};

const priorityColorMap = {
  baja: 'bg-slate-100 text-slate-700',
  media: 'bg-blue-100 text-blue-700',
  alta: 'bg-orange-100 text-orange-700',
  critica: 'bg-red-100 text-red-700',
};

const stateColorMap = {
  creada: 'bg-amber-100 text-amber-700',
  asignada: 'bg-teal-100 text-teal-700',
  en_curso: 'bg-blue-100 text-blue-700',
  resuelta: 'bg-emerald-100 text-emerald-700',
  rechazada: 'bg-red-100 text-red-700',
  cerrada: 'bg-slate-200 text-slate-700',
};

const allStates = ['CREADA', 'ASIGNADA', 'EN_CURSO', 'RESUELTA', 'CERRADA'];

const teamLabelMap = {
  alumbrado: 'Alumbrado',
  limpieza: 'Limpieza',
  movilidad: 'Movilidad',
  agua: 'Agua',
  residuos: 'Residuos',
  mobiliario: 'Mobiliario',
  otros: 'Otros'
};

const allTeams = Object.keys(teamLabelMap);

let adminIncidentsMap = null;
let adminIncidentsMarkersLayer = null;

function normalizeStateKey(value) {
  return (value || '').toLowerCase();
}

function getIncidentCoordinates(incident) {
  const latitude = Number(incident.ubicacionLatitud);
  const longitude = Number(incident.ubicacionLongitud);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return [latitude, longitude];
}

function getIncidentMapColor(state) {
  const normalizedState = normalizeStateKey(state);
  if (normalizedState === 'creada') return '#f59e0b';
  if (normalizedState === 'asignada') return '#0f766e';
  if (normalizedState === 'en_curso') return '#2563eb';
  if (normalizedState === 'resuelta') return '#10b981';
  return '#64748b';
}

function getIncidentMapPopup(incident) {
  const stateLabel = stateLabelMap[incident.state] || incident.state;
  const teamLabel = incident.assignedTeam ? (teamLabelMap[incident.assignedTeam] || incident.assignedTeam) : 'Sin equipo';

  return `
    <div style="min-width: 220px; font-family: DM Sans, sans-serif;">
      <div style="font-weight: 700; margin-bottom: 4px;">${incident.title}</div>
      <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">${stateLabel}</div>
      <div style="font-size: 12px; color: #475569; margin-bottom: 4px;">Equipo: ${teamLabel}</div>
      <div style="font-size: 12px; color: #475569;">${incident.ubicacionMunicipio || ''} ${incident.ubicacionCalle || ''} ${incident.ubicacionNumero || ''}</div>
    </div>
  `;
}

function getIncidentPinIcon(color) {
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

function renderAdminIncidentsMap(incidentList = getFilteredIncidents()) {
  const mapElement = document.getElementById('admin-incidents-map');
  if (!mapElement || !window.L) {
    return;
  }

  const visibleIncidents = incidentList.filter((incident) => {
    const state = normalizeStateKey(incident.state);
    return state !== 'rechazada' && state !== 'cerrada' && getIncidentCoordinates(incident);
  });
  const madridCenter = [40.4168, -3.7038];

  if (!adminIncidentsMap) {
    adminIncidentsMap = L.map(mapElement, { scrollWheelZoom: false }).setView(madridCenter, 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(adminIncidentsMap);
    adminIncidentsMarkersLayer = L.layerGroup().addTo(adminIncidentsMap);
  }

  if (adminIncidentsMarkersLayer) {
    adminIncidentsMarkersLayer.clearLayers();
  }

  // Group incidents by coordinates to handle overlapping locations
  const coordinateGroups = {};
  visibleIncidents.forEach((incident) => {
    const coordinates = getIncidentCoordinates(incident);
    if (!coordinates) return;

    const key = coordinates.join(",");
    if (!coordinateGroups[key]) {
      coordinateGroups[key] = [];
    }
    coordinateGroups[key].push(incident);
  });

  const bounds = [];
  Object.entries(coordinateGroups).forEach(([coordKey, incidents]) => {
    const baseCoords = coordKey.split(",").map(Number);

    incidents.forEach((incident, index) => {
      let markerCoords = baseCoords;

      // If multiple incidents at same location, offset them in a circle
      if (incidents.length > 1) {
        const offsetDistance = Math.max(0.0008, 0.00008 * Math.sqrt(incidents.length * 2));
        const angle = (index / incidents.length) * Math.PI * 2;
        markerCoords = [
          baseCoords[0] + Math.cos(angle) * offsetDistance,
          baseCoords[1] + Math.sin(angle) * offsetDistance
        ];
      }

      const color = getIncidentMapColor(incident.state);
      const marker = L.marker(markerCoords, {
        icon: getIncidentPinIcon(color)
      });

      // Enhanced popup for clustered incidents
      let popupContent = getIncidentMapPopup(incident);
      if (incidents.length > 1) {
        popupContent = `
          <div style="min-width: 220px; font-family: DM Sans, sans-serif;">
            <div style="font-size: 12px; color: #64748b; margin-bottom: 8px; font-weight: 600;">
              ${incidents.length} incidencias en esta ubicación
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 8px;">
              ${incidents.map((inc) => `
                <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9;">
                  <div style="font-weight: 700; margin-bottom: 4px; font-size: 12px;">${inc.title}</div>
                  <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">${stateLabelMap[inc.state] || inc.state}</div>
                  <div style="font-size: 11px; color: #475569;">#${inc.id}</div>
                </div>
              `).join("")}
            </div>
          </div>
        `;
      }

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        window.location.href = `/incident-detail?id=${incident.id}`;
      });
      marker.addTo(adminIncidentsMarkersLayer);
      bounds.push(markerCoords);
    });
  });

  if (bounds.length > 0) {
    adminIncidentsMap.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
  } else {
    adminIncidentsMap.setView(madridCenter, 11);
  }

  setTimeout(() => adminIncidentsMap?.invalidateSize(), 0);
}

function getUserRoleStats(userList) {
  return {
    admin: userList.filter(u => u.role === 'admin').length,
    user: userList.filter(u => u.role === 'user').length,
    operator: userList.filter(u => u.role === 'operator').length,
    technician: userList.filter(u => u.role === 'technician').length
  };
}

function getIncidentStats(incidentList) {
  const initial = { total: incidentList.length, creadas: 0, enCurso: 0, resueltas: 0, cerradas: 0, criticas: 0 };
  return incidentList.reduce((acc, incident) => {
    if (incident.state === 'creada') acc.creadas += 1;
    if (incident.state === 'en_curso') acc.enCurso += 1;
    if (incident.state === 'resuelta') acc.resueltas += 1;
    if (incident.state === 'cerrada') acc.cerradas += 1;
    if (incident.priority === 'critica') acc.criticas += 1;
    return acc;
  }, initial);
}

function getTechnicalTeamStats(userList, incidentList) {
  return allTeams.map((teamKey) => {
    const technicians = userList.filter((user) => user.role === 'technician' && user.technicalTeam === teamKey);
    const assignedIncidents = incidentList.filter((incident) => incident.assignedTeam === teamKey);
    const activeIncidents = assignedIncidents.filter((incident) => incident.state !== 'resuelta' && incident.state !== 'cerrada');

    return {
      teamKey,
      teamName: teamLabelMap[teamKey],
      technicians,
      assignedCount: assignedIncidents.length,
      activeCount: activeIncidents.length
    };
  });
}

function adminIncidentMatchesSearch(incident) {
  const query = (adminIncidentSearchQuery || '').trim().toLowerCase();
  if (!query) {
    return true;
  }

  const values = [
    incident.id,
    incident.title,
    incident.description,
    incident.category,
    incident.state,
    incident.priority,
    incident.creatorDni,
    incident.creatorName,
    incident.creatorSurname,
    incident.assignedTeam,
    incident.ubicacionMunicipio,
    incident.ubicacionCalle,
    incident.ubicacionNumero,
    incident.resolutionDescription,
    incident.ubicacionCodigoPostal,
    incident.ubicacionBarrio
  ];

  return values
    .filter((value) => value !== undefined && value !== null)
    .map((value) => String(value).toLowerCase())
    .some((text) => text.includes(query));
}

function adminUserMatchesSearch(user) {
  const query = (adminUserSearchQuery || '').trim().toLowerCase();
  if (!query) {
    return true;
  }

  return [
    user.name,
    user.surname,
    user.dni,
    user.email,
    user.role
  ].some((value) => value && value.toLowerCase().includes(query));
}

function getFilteredIncidents() {
  return incidents.filter((incident) => {
    if (activeIncidentFilters.priority.length > 0 && !activeIncidentFilters.priority.includes(incident.priority)) return false;
    if (activeIncidentFilters.state.length > 0 && !activeIncidentFilters.state.includes(incident.state)) return false;
    if (activeIncidentFilters.team.length > 0 && !activeIncidentFilters.team.includes(incident.assignedTeam)) return false;
    return adminIncidentMatchesSearch(incident);
  });
}

function updateAdminIncidentList() {
  const filteredIncidents = getFilteredIncidents();
  const totalIncidents = incidents.length;
  const titleCount = document.getElementById('admin-incident-title-count');
  const listContainer = document.getElementById('admin-incident-list-container');

  if (titleCount) {
    titleCount.textContent = `(${filteredIncidents.length} de ${totalIncidents})`;
  }

  if (!listContainer) {
    return;
  }

  if (filteredIncidents.length === 0) {
    listContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center text-center py-20 text-slate-400">
        <i data-lucide="inbox" style="width:46px;height:46px;" class="mb-4"></i>
        <p class="text-lg font-semibold text-slate-400">No hay incidencias que coincidan con los filtros</p>
      </div>
    `;
    return;
  }

  const order = { creada: 0, asignada: 1, resuelta: 2, cerrada: 3, rechazada: 4 };
  const sorted = filteredIncidents.slice().sort((a, b) => {
    const ka = order[normalizeStateKey(a.state)] ?? 99;
    const kb = order[normalizeStateKey(b.state)] ?? 99;
    if (ka !== kb) return ka - kb;
    return (a.id || 0) - (b.id || 0);
  });

  listContainer.innerHTML = sorted.map((incident) => renderAdminIncidentRow(incident)).join('');
  lucide.createIcons();
  attachAdminIncidentListEvents();
}

function attachAdminIncidentListEvents() {
  document.querySelectorAll('.incident-detail-link').forEach(card => {
    card.addEventListener('click', () => {
      const incidentId = card.dataset.incidentId;
      window.location.href = `/incident-detail?id=${incidentId}`;
    });
  });
}

function getFilteredUsers() {
  const filteredByRole = activeUserRoleFilters.length > 0 ? users.filter((user) => activeUserRoleFilters.includes(user.role)) : users;
  return filteredByRole.filter(adminUserMatchesSearch);
}

function updateAdminUserList() {
  const filteredUsersList = getFilteredUsers();
  const titleCount = document.getElementById('admin-user-title-count');
  const listContainer = document.getElementById('admin-user-list-container');

  if (titleCount) {
    titleCount.textContent = `(${filteredUsersList.length} de ${users.length})`;
  }

  if (!listContainer) {
    return;
  }

  if (filteredUsersList.length === 0) {
    listContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center text-center py-20 text-slate-400">
        <i data-lucide="users" style="width:46px;height:46px;" class="mb-4"></i>
        <p class="text-lg font-semibold text-slate-400">No hay usuarios que coincidan con los filtros</p>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = filteredUsersList.map((user) => `
    <div class="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center ${user.role === 'admin' ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'}">
          <i data-lucide="${getRoleIcon(user.role)}" style="width:18px;height:18px;"></i>
        </div>

        <div>
          <p class="font-semibold text-slate-900">${user.name}</p>
          <p class="text-sm text-slate-400">${user.dni} · ${user.email || ''}</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <span class="px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClass(user.role)}">${getRoleLabel(user.role)}</span>
        <button class="edit-user-btn text-slate-400 hover:text-slate-600" data-dni="${user.dni}" title="Editar">
          <i data-lucide="pencil" style="width:16px;height:16px;"></i>
        </button>
        ${currentUser?.dni !== user.dni ? `
        <button class="delete-user-btn text-rose-400 hover:text-rose-600" data-dni="${user.dni}" title="Eliminar">
          <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
        </button>
        ` : ''}
      </div>
    </div>
  `).join('');

  lucide.createIcons();
  attachAdminUserListEvents();
}

function attachAdminUserListEvents() {
  document.querySelectorAll('.edit-user-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = `/admin-user-edit?dni=${encodeURIComponent(btn.dataset.dni)}`;
    });
  });

  document.querySelectorAll('.delete-user-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await deleteUser(btn.dataset.dni);
    });
  });
}

function toggleIncidentFilter(type, value) {
  const current = activeIncidentFilters[type] || [];
  if (current.includes(value)) {
    activeIncidentFilters[type] = current.filter((item) => item !== value);
  } else {
    activeIncidentFilters[type] = [...current, value];
  }
}

function toggleUserRoleFilter(value) {
  if (activeUserRoleFilters.includes(value)) {
    activeUserRoleFilters = activeUserRoleFilters.filter((item) => item !== value);
  } else {
    activeUserRoleFilters = [...activeUserRoleFilters, value];
  }
}

function getIncidentKpis(incidentList) {
  // Average days until resolution (for closed incidents)
  const closed = incidentList.filter((incident) => incident.state && incident.state.toLowerCase() === 'cerrada' && incident.closingDate && incident.creationInstant);
  const totalClosed = closed.length;
  
  const averageSolveDays = totalClosed > 0
    ? closed.reduce((sum, incident) => {
        const creation = new Date(incident.creationInstant);
        const closing = new Date(incident.closingDate);
        const days = Math.max(0, closing - creation) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0) / totalClosed
    : 0;

  // Average closed incidents per operator
  const operatorCount = users.filter((user) => user.role === 'operator').length;
  const averageClosedPerOperator = operatorCount > 0 ? totalClosed / operatorCount : 0;

  // Rejected incidents stats (kept for backward compatibility)
  const rejected = incidentList.filter((incident) => incident.state && incident.state.toLowerCase() === 'rechazada' && incident.operatorReviewDate);
  const averageRejectedPerOperator = operatorCount > 0 ? rejected.length / operatorCount : 0;

  return {
    total: incidentList.length,
    totalClosed,
    averageSolveDays,
    operatorCount,
    rejectedCount: rejected.length,
    averageRejectedPerOperator,
    averageClosedPerOperator
  };
}

function formatDays(value) {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(1)} días`;
}

function getRoleBadgeClass(role) {
  if (role === 'admin') return 'bg-violet-100 text-violet-700';
  if (role === 'operator') return 'bg-sky-100 text-sky-700';
  if (role === 'technician') return 'bg-teal-100 text-teal-700';
  return 'bg-blue-100 text-blue-700';
}

function getRoleLabel(role) {
  return roleMap[role] || 'Usuario';
}

function getRoleIcon(role) {
  if (role === 'admin') return 'shield';
  if (role === 'operator') return 'wrench';
  if (role === 'technician') return 'briefcase';
  return 'user';
}

async function loadSessionUser() {
  const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error('Sesion no valida');
  }

  currentUser = await response.json();
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

async function loadUsers() {
  const response = await fetch('/api/users', { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error('No se pudieron cargar usuarios');
  }

  users = await response.json();
}

async function loadIncidents() {
  const response = await fetch('/api/incidents', { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error('No se pudieron cargar incidencias');
  }

  incidents = await response.json();
}

function renderIncidenciasSection() {
  if (incidents.length === 0) {
    return `
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-slate-900">
          Incidencias <span class="text-slate-400 text-xl">(0)</span>
        </h1>
      </div>
      <div class="flex flex-col items-center justify-center text-center py-20 text-slate-400">
        <i data-lucide="inbox" style="width:46px;height:46px;" class="mb-4"></i>
        <p class="text-lg font-semibold text-slate-400">No hay incidencias</p>
      </div>
    `;
  }

  const filteredIncidents = getFilteredIncidents();
  const totalIncidents = incidents.length;
  const selectedPriorityLabel = activeIncidentFilters.priority.length > 0 ? `${activeIncidentFilters.priority.length} seleccionadas` : 'Todas';
  const selectedStateLabel = activeIncidentFilters.state.length > 0 ? `${activeIncidentFilters.state.length} seleccionadas` : 'Todos';
  const selectedTeamLabel = activeIncidentFilters.team.length > 0 ? `${activeIncidentFilters.team.length} seleccionados` : 'Todos';
  const priorityOptions = ['baja', 'media', 'alta', 'critica'];
  const stateOptions = ['creada', 'asignada', 'en_curso', 'resuelta', 'rechazada', 'cerrada'];

  return `
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900">
        Incidencias <span id="admin-incident-title-count" class="text-slate-400 text-xl">(${filteredIncidents.length} de ${totalIncidents})</span>
      </h1>
    </div>

    <div class="mb-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm max-w-4xl mx-auto">
      <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 class="text-lg font-bold text-slate-900">Mapa de incidencias activas</h2>
          <p class="text-sm text-slate-500">Se muestran las incidencias visibles tras aplicar los filtros.</p>
        </div>
        <div class="text-sm text-slate-500">
          <span class="font-semibold text-slate-900">${filteredIncidents.filter((incident) => normalizeStateKey(incident.state) !== 'rechazada' && normalizeStateKey(incident.state) !== 'cerrada' && getIncidentCoordinates(incident)).length}</span> incidencias visibles
        </div>
      </div>
      <div id="admin-incidents-map" class="rounded-2xl border border-slate-200"></div>
    </div>

    <div class="mb-6 bg-white border border-slate-200 rounded-2xl p-3 shadow-sm w-full max-w-none">
      <div class="mb-3">
        <h3 class="text-sm font-medium text-slate-600">Filtrar</h3>
      </div>
      <div class="grid gap-4 lg:grid-cols-[1.5fr_1fr] items-end mb-4">
        <label class="grid gap-2">
          <span class="text-slate-600 text-sm font-semibold">Buscar incidencia</span>
          <input id="admin-incident-search-input" type="text" value="${adminIncidentSearchQuery}" placeholder="Añade filtros a la búsqueda" class="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800" />
        </label>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p class="text-slate-500 text-sm">Busca por título, descripción, categoría, DNI, ubicación o equipo asignado.</p>
        </div>
      </div>
      <div class="flex gap-3 flex-wrap">
        <details class="incident-filter-dropdown group relative rounded-2xl border border-slate-200 bg-slate-50 p-3 overflow-visible flex-1 min-w-[16rem]">
          <summary class="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100">
            <span>Prioridad</span>
            <span class="text-slate-400">${selectedPriorityLabel}</span>
          </summary>
          <div class="absolute left-0 top-full z-50 mt-2 w-[min(36rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
            <div class="mb-3 flex items-center justify-between gap-2">
              <span class="text-sm text-slate-500">Selecciona prioridades</span>
              <button type="button" class="incident-filter-clear-btn rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200" data-filter-type="priority">Limpiar</button>
            </div>
            <div class="space-y-2">
              ${priorityOptions.map((priority) => `
                <button type="button" class="incident-filter-menu-item flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 transition hover:border-brand-500 hover:bg-brand-50 ${activeIncidentFilters.priority.includes(priority) ? 'border-brand-500 bg-brand-100 text-brand-700' : ''}" data-filter-type="priority" data-filter-value="${priority}">
                  <span>${priority.toUpperCase()}</span>
                  <span>${activeIncidentFilters.priority.includes(priority) ? '✓' : ''}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </details>

        <details class="incident-filter-dropdown group relative rounded-2xl border border-slate-200 bg-slate-50 p-3 overflow-visible flex-1 min-w-[16rem]">
          <summary class="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100">
            <span>Estado</span>
            <span class="text-slate-400">${selectedStateLabel}</span>
          </summary>
          <div class="absolute left-0 top-full z-50 mt-2 w-[min(36rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
            <div class="mb-3 flex items-center justify-between gap-2">
              <span class="text-sm text-slate-500">Selecciona estados</span>
              <button type="button" class="incident-filter-clear-btn rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200" data-filter-type="state">Limpiar</button>
            </div>
            <div class="space-y-2">
              ${stateOptions.map((state) => `
                <button type="button" class="incident-filter-menu-item flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 transition hover:border-brand-500 hover:bg-brand-50 ${activeIncidentFilters.state.includes(state) ? 'border-brand-500 bg-brand-100 text-brand-700' : ''}" data-filter-type="state" data-filter-value="${state}">
                  <span>${stateLabelMap[state] || state}</span>
                  <span>${activeIncidentFilters.state.includes(state) ? '✓' : ''}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </details>

        <details class="incident-filter-dropdown group relative rounded-2xl border border-slate-200 bg-slate-50 p-3 overflow-visible flex-1 min-w-[16rem]">
          <summary class="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100">
            <span>Equipo</span>
            <span class="text-slate-400">${selectedTeamLabel}</span>
          </summary>
          <div class="absolute left-0 top-full z-50 mt-2 w-[min(36rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
            <div class="mb-3 flex items-center justify-between gap-2">
              <span class="text-sm text-slate-500">Selecciona equipos</span>
              <button type="button" class="incident-filter-clear-btn rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200" data-filter-type="team">Limpiar</button>
            </div>
            <div class="space-y-2">
              ${allTeams.map((teamKey) => `
                <button type="button" class="incident-filter-menu-item flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 transition hover:border-brand-500 hover:bg-brand-50 ${activeIncidentFilters.team.includes(teamKey) ? 'border-brand-500 bg-brand-100 text-brand-700' : ''}" data-filter-type="team" data-filter-value="${teamKey}">
                  <span>${teamLabelMap[teamKey]}</span>
                  <span>${activeIncidentFilters.team.includes(teamKey) ? '✓' : ''}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </details>

        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-start flex-1 min-w-0 max-w-xs">
          <button type="button" class="general-filter-clear-btn w-full rounded-xl border border-slate-300 bg-gradient-to-r from-slate-100 to-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:from-slate-200 hover:to-slate-100 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-start gap-2">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>

    <div id="admin-incident-list-container" class="space-y-4">
      ${(() => {
        if (filteredIncidents.length === 0) {
          return `
            <div class="flex flex-col items-center justify-center text-center py-20 text-slate-400">
              <i data-lucide="inbox" style="width:46px;height:46px;" class="mb-4"></i>
              <p class="text-lg font-semibold text-slate-400">No hay incidencias que coincidan con los filtros</p>
            </div>
          `;
        }

        const order = { creada: 0, asignada: 1, resuelta: 2, cerrada: 3, rechazada: 4 };
        const sorted = filteredIncidents.slice().sort((a, b) => {
          const ka = order[normalizeStateKey(a.state)] ?? 99;
          const kb = order[normalizeStateKey(b.state)] ?? 99;
          if (ka !== kb) return ka - kb;
          return (a.id || 0) - (b.id || 0);
        });

        return sorted.map((incident) => renderAdminIncidentRow(incident)).join('');
      })()}
    </div>
  `;
}

function renderAdminIncidentRow(incident) {
  return `
    <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm cursor-pointer hover:shadow-md transition incident-detail-link" data-incident-id="${incident.id}">
      <div class="flex items-start gap-4">
        <div class="w-28 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
          ${incident.previewImageBase64 ? `
            <img src="data:image/jpeg;base64,${incident.previewImageBase64}" alt="Preview" class="w-full h-full object-cover" />
          ` : `
            <div class="w-full h-full flex items-center justify-center">
              <i data-lucide="image-off" style="width:22px;height:22px;color:#cbd5e1;"></i>
            </div>
          `}
        </div>

        <div class="flex-grow">
          <h3 class="font-semibold text-slate-900">${incident.title}</h3>
          <p class="text-sm text-slate-600 mt-1 line-clamp-2">${incident.description}</p>
          <p class="text-xs text-slate-400 mt-2">#${incident.id} · ${incident.creatorDni} · Estado: <span class="px-2 py-1 rounded-full text-xs font-semibold ${stateColorMap[incident.state] || 'bg-slate-100'}">${stateLabelMap[incident.state] || incident.state}</span></p>
        </div>

        <div class="flex items-center gap-2 flex-wrap justify-end ml-auto">
          <span class="text-xs text-slate-500">${incident.category?.toUpperCase() || '-'}</span>
          <span class="px-2 py-1 rounded-full text-xs font-semibold ${priorityColorMap[incident.priority] || 'bg-slate-100'}">${incident.priority?.toUpperCase() || 'N/A'}</span>
        </div>
      </div>
    </div>
  `;
}

function preserveAdminSearchFocus() {
  const inputId = activeTab === 'usuarios' ? 'admin-user-search-input' : 'admin-incident-search-input';
  const input = document.getElementById(inputId);
  if (!input) return;

  input.focus({ preventScroll: true });
  const caretPos = input.value.length;
  input.setSelectionRange(caretPos, caretPos);
}

function renderAdminDashboard() {
  const app = document.getElementById('app');
  const roleStats = getUserRoleStats(users);
  const incidentStats = getIncidentStats(incidents);
  const incidentKpis = getIncidentKpis(incidents);
  const teamStats = getTechnicalTeamStats(users, incidents);

  if (adminIncidentsMap) {
    adminIncidentsMap.remove();
    adminIncidentsMap = null;
    adminIncidentsMarkersLayer = null;
  }

  app.innerHTML = `
    <div class="min-h-full bg-surface-50">
      <header class="w-full bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:#1468f5;">
            <i data-lucide="map-pin" style="width:18px;height:18px;color:white;"></i>
          </div>
          <span class="font-mono-brand text-xl font-bold text-slate-900">urFIX</span>
        </div>

        <div class="flex items-center gap-3 text-sm text-slate-600">
          <button id="switch-user-mode-btn" class="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">Modo ciudadano</button>
          <button id="edit-profile-btn" class="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">Editar datos</button>
          <i data-lucide="shield" style="width:16px;height:16px;"></i>
          <span>${currentUser?.name || 'Admin'}</span>
          <span class="px-2 py-1 rounded-full bg-brand-100 text-brand-600 font-medium">${getRoleLabel(currentUser?.role || 'admin')}</span>
          <button id="logout-btn" class="ml-2 text-slate-500 hover:text-slate-700">
            <i data-lucide="log-out" style="width:18px;height:18px;"></i>
          </button>
        </div>
      </header>

      <nav class="bg-white border-b border-slate-200 px-3 py-2 flex items-center gap-4 text-sm">
        <button class="tab-btn flex items-center gap-2 px-3 py-2 rounded-xl text-white font-semibold" style="background:#1468f5;" data-tab="incidencias">
          <i data-lucide="list" style="width:16px;height:16px;"></i>
          Incidencias
        </button>

        <button class="tab-btn flex items-center gap-2 text-slate-600 hover:text-slate-900 px-2 py-2" data-tab="usuarios">
          <i data-lucide="users" style="width:16px;height:16px;"></i>
          Usuarios
        </button>

        <button class="tab-btn flex items-center gap-2 text-slate-600 hover:text-slate-900 px-2 py-2" data-tab="equipos">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
            <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/>
            <circle cx="7" cy="9" r="1" fill="currentColor"/>
            <circle cx="12" cy="9" r="1" fill="currentColor"/>
            <circle cx="17" cy="9" r="1" fill="currentColor"/>
            <circle cx="7" cy="13" r="1" fill="currentColor"/>
            <circle cx="12" cy="13" r="1" fill="currentColor"/>
            <circle cx="17" cy="13" r="1" fill="currentColor"/>
          </svg>
          Equipos
        </button>

        <button class="tab-btn flex items-center gap-2 text-slate-600 hover:text-slate-900 px-2 py-2" data-tab="estadisticas">
          <i data-lucide="bar-chart-3" style="width:16px;height:16px;"></i>
          Estadisticas
        </button>
      </nav>

      <main class="px-3 py-6">
        <section id="incidencias" class="tab-content">
          ${renderIncidenciasSection()}
        </section>

        <section id="usuarios" class="tab-content hidden">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-slate-900">
      Usuarios <span id="admin-user-title-count" class="text-slate-400 text-xl">(${getFilteredUsers().length} de ${users.length})</span>

          <div class="mb-6 bg-white border border-slate-200 rounded-2xl p-3 shadow-sm max-w-2xl">
            <div class="grid gap-4">
              <div>
                <h3 class="text-sm font-medium text-slate-600">Filtrar</h3>
              </div>
              <div class="grid gap-4 sm:grid-cols-[1.5fr_1fr] items-end">
                <label class="grid gap-2">
                  <span class="text-slate-600 text-sm font-semibold">Buscar usuarios</span>
                  <input id="admin-user-search-input" type="text" value="${adminUserSearchQuery}" placeholder="Añade filtros a la búsqueda" class="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800" />
                </label>
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-slate-500 text-sm">Busca por nombre, apellidos, DNI, email o rol.</p>
                </div>
              </div>
            </div>
            <div class="flex gap-3 flex-wrap mt-4">
              <details class="group relative rounded-2xl border border-slate-200 bg-slate-50 p-3 overflow-visible flex-1 min-w-0">
                <summary class="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100">
                  <span>Filtrar por rol</span>
                  <span class="text-slate-400">${activeUserRoleFilters.length ? `${activeUserRoleFilters.length} seleccionados` : 'Todos'}</span>
                </summary>
                <div class="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                  <div class="mb-3 flex items-center justify-between gap-2">
                    <span class="text-sm text-slate-500">Selecciona roles</span>
                    <button type="button" class="user-role-filter-clear-btn rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200">Limpiar</button>
                  </div>
                  <div class="space-y-2">
                    ${['admin', 'operator', 'technician', 'user'].map((role) => `
                      <button type="button" class="user-role-filter-menu-item flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 transition hover:border-brand-500 hover:bg-brand-50 ${activeUserRoleFilters.includes(role) ? 'border-brand-500 bg-brand-100 text-brand-700' : ''}" data-role-value="${role}">
                        <span>${getRoleLabel(role)}</span>
                        <span>${activeUserRoleFilters.includes(role) ? '✓' : ''}</span>
                      </button>
                    `).join('')}
                  </div>
                </div>
              </details>

              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-start flex-1 min-w-0 max-w-xs">
                <button type="button" class="general-filter-clear-btn w-full rounded-xl border border-slate-300 bg-gradient-to-r from-slate-100 to-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:from-slate-200 hover:to-slate-100 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-start gap-2">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>

          <div id="admin-user-list-container" class="space-y-4">
            ${(() => {
              const filteredUsersList = getFilteredUsers();
              if (filteredUsersList.length === 0) {
                return `
                  <div class="flex flex-col items-center justify-center text-center py-20 text-slate-400">
                    <i data-lucide="users" style="width:46px;height:46px;" class="mb-4"></i>
                    <p class="text-lg font-semibold text-slate-400">No hay usuarios que coincidan con los filtros</p>
                  </div>
                `;
              }
              return filteredUsersList.map(user => `
                <div class="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center ${user.role === 'admin' ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'}">
                      <i data-lucide="${getRoleIcon(user.role)}" style="width:18px;height:18px;"></i>
                    </div>

                    <div>
                      <p class="font-semibold text-slate-900">${user.name}</p>
                      <p class="text-sm text-slate-400">${user.dni} · ${user.email || ''}</p>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClass(user.role)}">${getRoleLabel(user.role)}</span>
                    <button class="edit-user-btn text-slate-400 hover:text-slate-600" data-dni="${user.dni}" title="Editar">
                      <i data-lucide="pencil" style="width:16px;height:16px;"></i>
                    </button>
                    ${currentUser?.dni !== user.dni ? `
                    <button class="delete-user-btn text-rose-400 hover:text-rose-600" data-dni="${user.dni}" title="Eliminar">
                      <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
                    </button>
                    ` : ''}
                  </div>
                </div>
              `).join('');
            })()}
          </div>
        </section>

        <section id="equipos" class="tab-content hidden pt-6">
          <div class="flex items-center justify-between mb-6">
            <h1 class="text-3xl font-bold text-slate-900">Equipos técnicos</h1>
          </div>

          <div class="flex flex-nowrap items-start gap-4 overflow-x-auto pb-20" style="scrollbar-width: none;">
            ${teamStats.map((team) => `
              <div
                class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex-shrink-0 self-start"
                style="width: clamp(14rem, calc(12rem + ${Math.max(team.technicians.length, 1)} * 0.9rem), 24rem);"
              >
                <div class="flex items-center justify-between mb-3">
                  <h3 class="font-semibold text-slate-900">${team.teamName}</h3>
                  <span class="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600" data-team-count="${team.teamKey}">${team.technicians.length}</span>
                </div>

                <p class="text-xs text-slate-500 mb-3">Incidencias: ${team.assignedCount} (${team.activeCount} activas)</p>

                <div
                  id="team-${team.teamKey}"
                  class="kanban-column tech-column space-y-3 bg-slate-50 rounded-xl p-2"
                  data-team="${team.teamKey}"
                  style="min-height: max(11rem, calc(7.5rem + ${Math.max(team.technicians.length, 1)} * 4.75rem));"
                >
                  ${team.technicians.length === 0 ? `
                    <div class="text-center text-xs text-slate-400 py-4">Sin técnicos</div>
                  ` : `
                    ${team.technicians.map((technician) => `
                      <div class="bg-white border-2 border-slate-200 rounded-xl p-3 cursor-move shadow-sm hover:shadow-md transition technician-card" draggable="true" data-dni="${technician.dni}" data-team="${team.teamKey}">
                        <p class="font-semibold text-sm text-slate-800">${technician.name}</p>
                        <p class="text-xs text-slate-500 mt-1">${technician.dni}</p>
                        <div class="flex gap-2 mt-2">
                          <button class="edit-user-btn text-xs px-2 py-1 rounded text-slate-500 hover:text-slate-700 hover:bg-slate-100" data-dni="${technician.dni}" title="Editar">
                            <i data-lucide="pencil" style="width:12px;height:12px;display:inline;"></i>
                          </button>
                        </div>
                      </div>
                    `).join('')}
                  `}
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <section id="estadisticas" class="tab-content hidden">
          <div class="max-w-5xl mx-auto">
            <h1 class="text-4xl font-bold text-slate-900 mb-8">Estadísticas</h1>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <div class="bg-white rounded-2xl border border-slate-200 p-4 text-center"><p class="text-3xl font-bold text-slate-900">${incidentStats.total}</p><span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">Total incidencias</span></div>
              <div class="bg-white rounded-2xl border border-slate-200 p-4 text-center"><p class="text-3xl font-bold text-slate-900">${formatDays(incidentKpis.averageSolveDays)}</p><span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Tiempo medio de resolución</span></div>
              <div class="bg-white rounded-2xl border border-slate-200 p-4 text-center"><p class="text-3xl font-bold text-slate-900">${incidentKpis.operatorCount > 0 ? incidentKpis.averageClosedPerOperator.toFixed(1) : '0.0'}</p><span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Media incidencias cerradas por operario</span></div>
              <div class="bg-white rounded-2xl border border-slate-200 p-4 text-center"><p class="text-3xl font-bold text-slate-900">${incidentKpis.rejectedCount}</p><span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Incidencias rechazadas</span></div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4 mb-6">
              <div class="bg-white rounded-2xl border border-slate-200 p-4 text-center"><p class="text-3xl font-bold text-slate-900">${incidentStats.creadas}</p><span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Creadas</span></div>
              <div class="bg-white rounded-2xl border border-slate-200 p-4 text-center"><p class="text-3xl font-bold text-slate-900">${incidentStats.enCurso}</p><span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">En curso</span></div>
              <div class="bg-white rounded-2xl border border-slate-200 p-4 text-center"><p class="text-3xl font-bold text-slate-900">${incidentStats.resueltas}</p><span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Resueltas</span></div>
              <div class="bg-white rounded-2xl border border-slate-200 p-4 text-center"><p class="text-3xl font-bold text-slate-900">${incidentStats.cerradas}</p><span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-600">Cerradas</span></div>
              <div class="bg-white rounded-2xl border border-slate-200 p-4 text-center"><p class="text-3xl font-bold text-slate-900">${incidentStats.criticas}</p><span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Criticas</span></div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 p-4">
              <h2 class="text-sm font-bold tracking-wide uppercase text-slate-500 mb-4">Usuarios por rol</h2>
              <div class="space-y-3">
                <div class="flex items-center justify-between"><span class="text-slate-600">Administrador</span><span class="font-semibold text-slate-900">${roleStats.admin}</span></div>
                <div class="flex items-center justify-between"><span class="text-slate-600">Usuario</span><span class="font-semibold text-slate-900">${roleStats.user}</span></div>
                <div class="flex items-center justify-between"><span class="text-slate-600">Operario</span><span class="font-semibold text-slate-900">${roleStats.operator}</span></div>
                <div class="flex items-center justify-between"><span class="text-slate-600">Tecnico</span><span class="font-semibold text-slate-900">${roleStats.technician}</span></div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `;

  lucide.createIcons();
  attachAdminEvents();

  setTimeout(() => {
    if (isInitialLoad) {
      window.scrollTo(0, 0);
      isInitialLoad = false;
    }
    preserveAdminSearchFocus();
  }, 0);

  if (activeTab === 'incidencias') {
    if (adminIncidentMapNeedsRefresh) {
      setTimeout(() => renderAdminIncidentsMap(getFilteredIncidents()), 0);
      adminIncidentMapNeedsRefresh = false;
    }
  }

  if (activeTab !== 'incidencias') {
    const activeButton = document.querySelector(`.tab-btn[data-tab="${activeTab}"]`);
    if (activeButton) {
      activeButton.click();
    }
  }
}

function openTab(target, buttons, contents) {
  activeTab = target;
  contents.forEach(c => c.classList.add('hidden'));
  document.getElementById(target).classList.remove('hidden');

  buttons.forEach(b => {
    b.classList.remove('text-white', 'font-semibold', 'rounded-xl');
    b.classList.add('text-slate-600');
    b.style.background = 'transparent';
  });

  const targetButton = document.querySelector(`.tab-btn[data-tab="${target}"]`);
  if (targetButton) {
    targetButton.classList.remove('text-slate-600');
    targetButton.classList.add('text-white', 'font-semibold', 'rounded-xl');
    targetButton.style.background = '#1468f5';
  }

  if (target === 'incidencias') {
    setTimeout(() => renderAdminIncidentsMap(getFilteredIncidents()), 0);
  }

  // Attach drag-drop for equipment tab
  if (target === 'equipos') {
    setTimeout(() => attachTechnicianDragDrop(), 100);
  }
}

async function deleteUser(dni) {
  const confirmed = confirm(`¿Seguro que quieres eliminar el usuario ${dni}?`);
  if (!confirmed) return;

  const response = await fetch(`/api/users/${encodeURIComponent(dni)}`, { method: 'DELETE' });
  if (!response.ok) {
    const message = await response.text();
    alert(message || 'No se pudo eliminar el usuario');
    return;
  }

  await loadUsers();
  activeTab = 'usuarios';
  renderAdminDashboard();
}

let draggedTechnicianDni = null;

async function updateTechnicianTeam(dni, newTeam) {
  const technician = users.find(u => u.dni === dni);
  if (!technician) return;

  // Use admin-edit endpoint and AdminUserUpdateRequest payload so technicalTeam is applied
  const updatedData = {
    name: technician.name,
    surname: technician.surname || null,
    email: technician.email,
    newDni: technician.dni,
    role: 'technician',
    technicalTeam: newTeam
  };

  const response = await fetch(`/api/users/admin-edit/${encodeURIComponent(dni)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(updatedData)
  });

  if (!response.ok) {
    const message = await response.text();
    alert(message || 'No se pudo actualizar el equipo del técnico');
    return false;
  }

  await loadUsers();
  renderAdminDashboard();
  return true;
}

function attachTechnicianDragDrop() {
  const cards = document.querySelectorAll('.technician-card');
  const columns = document.querySelectorAll('.kanban-column');

  cards.forEach(card => {
    card.addEventListener('dragstart', (event) => {
      draggedTechnicianDni = card.dataset.dni;
      card.classList.add('opacity-50');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', draggedTechnicianDni);
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('opacity-50');
    });
  });

  columns.forEach(column => {
    column.addEventListener('dragover', (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      column.classList.add('bg-blue-100', 'border-blue-300');
    });

    column.addEventListener('dragleave', () => {
      column.classList.remove('bg-blue-100', 'border-blue-300');
    });

    column.addEventListener('drop', async (event) => {
      event.preventDefault();
      column.classList.remove('bg-blue-100', 'border-blue-300');

      if (!draggedTechnicianDni) return;

      const targetTeam = column.dataset.team;
      const sourceTeam = document.querySelector(`.technician-card[data-dni="${draggedTechnicianDni}"]`)?.dataset.team;

      if (sourceTeam !== targetTeam) {
        const technician = users.find(u => u.dni === draggedTechnicianDni);
        if (technician) {
          const targetTeamName = Object.values(teamLabelMap)[Object.keys(teamLabelMap).indexOf(targetTeam)] || targetTeam;
          // Move automatically without interactive confirmation
          await updateTechnicianTeam(draggedTechnicianDni, targetTeam);
        }
      }
      draggedTechnicianDni = null;
    });
  });
}


function attachAdminEvents() {
  const logoutBtn = document.getElementById('logout-btn');
  const switchUserModeBtn = document.getElementById('switch-user-mode-btn');
  const buttons = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  if (switchUserModeBtn) {
    switchUserModeBtn.addEventListener('click', () => {
      localStorage.setItem('activeRole', 'user');
      window.location.href = '/dashboard';
    });
  }

  const editProfileBtn = document.getElementById('edit-profile-btn');
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      window.location.href = `/user-edit?dni=${encodeURIComponent(currentUser.dni)}`;
    });
  }

  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    localStorage.removeItem('currentUser');
    localStorage.removeItem('activeRole');
    window.location.href = '/login';
  });

  buttons.forEach(btn => {
    btn.addEventListener('click', () => openTab(btn.dataset.tab, buttons, contents));
  });

  document.querySelectorAll('.incident-filter-menu-item').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleIncidentFilter(btn.dataset.filterType, btn.dataset.filterValue);
      adminIncidentMapNeedsRefresh = true;
      renderAdminDashboard();
    });
  });

  document.querySelectorAll('.incident-filter-clear-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeIncidentFilters[btn.dataset.filterType] = [];
      adminIncidentMapNeedsRefresh = true;
      renderAdminDashboard();
    });
  });

  document.querySelectorAll('.incident-filter-dropdown').forEach((details) => {
    details.addEventListener('toggle', () => {
      if (details.open) {
        document.querySelectorAll('.incident-filter-dropdown').forEach((other) => {
          if (other !== details) {
            other.open = false;
          }
        });
      }
    });
  });

  document.querySelectorAll('.user-role-filter-menu-item').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleUserRoleFilter(btn.dataset.roleValue);
      renderAdminDashboard();
    });
  });

  document.querySelectorAll('.user-role-filter-clear-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeUserRoleFilters = [];
      renderAdminDashboard();
    });
  });

  document.querySelectorAll('.general-filter-clear-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeIncidentFilters = { priority: [], state: [], team: [] };
      activeUserRoleFilters = [];
      adminIncidentSearchQuery = '';
      adminUserSearchQuery = '';
      adminIncidentMapNeedsRefresh = true;
      renderAdminDashboard();
    });
  });

  const incidentSearchInput = document.getElementById('admin-incident-search-input');
  if (incidentSearchInput) {
    incidentSearchInput.addEventListener('input', (event) => {
      adminIncidentSearchQuery = event.target.value;
      adminIncidentMapNeedsRefresh = false;
      updateAdminIncidentList();
      preserveAdminSearchFocus();
    });
  }

  const userSearchInput = document.getElementById('admin-user-search-input');
  if (userSearchInput) {
    userSearchInput.addEventListener('input', (event) => {
      adminUserSearchQuery = event.target.value;
      updateAdminUserList();
      preserveAdminSearchFocus();
    });
  }

  document.querySelectorAll('.incident-detail-link').forEach(card => {
    card.addEventListener('click', () => {
      const incidentId = card.dataset.incidentId;
      window.location.href = `/incident-detail?id=${incidentId}`;
    });
 });

  document.querySelectorAll('.edit-user-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = `/admin-user-edit?dni=${encodeURIComponent(btn.dataset.dni)}`;
    });
  });

  document.querySelectorAll('.delete-user-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await deleteUser(btn.dataset.dni);
    });
  });

  // Attach drag-drop events if on equipos tab or when it becomes visible
  if (activeTab === 'equipos' || document.querySelector('#equipos:not(.hidden)')) {
    attachTechnicianDragDrop();
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadSessionUser();
    if (currentUser.role !== 'admin') {
      window.location.href = '/login';
      return;
    }

    await Promise.all([loadUsers(), loadIncidents()]);
    renderAdminDashboard();
  } catch (error) {
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  }
});
