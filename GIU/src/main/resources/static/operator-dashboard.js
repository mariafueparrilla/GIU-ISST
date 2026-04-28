let currentUser = null;
let incidents = [];
let currentOperatorView = 'pending';

const TEAM_OPTIONS = [
  { value: 'ALUMBRADO', label: 'Alumbrado' },
  { value: 'LIMPIEZA', label: 'Limpieza' },
  { value: 'MOVILIDAD', label: 'Movilidad' },
  { value: 'AGUA', label: 'Agua' },
  { value: 'RESIDUOS', label: 'Residuos' },
  { value: 'MOBILIARIO', label: 'Mobiliario' },
  { value: 'OTROS', label: 'Otros' }
];

const stateLabelMap = {
  creada: 'Creada',
  validada: 'Validada',
  asignada: 'Asignada',
  en_curso: 'En curso',
  resuelta: 'Resuelta',
  rechazada: 'Rechazada',
  cerrada: 'Cerrada'
};

function getOperatorStats(incidentList) {
  return {
    total: incidentList.length,
    validated: incidentList.filter((incident) => incident.state === 'validada').length,
    rejected: incidentList.filter((incident) => incident.state === 'rechazada').length,
    pending: incidentList.filter((incident) => incident.state === 'creada').length,
    assigned: incidentList.filter((incident) => incident.state === 'asignada').length,
    inProgress: incidentList.filter((incident) => incident.state === 'en_curso').length,
    resolved: incidentList.filter((incident) => incident.state === 'resuelta').length
  };
}

function getOperatorViewConfig(view) {
  if (view === 'all') {
    return {
      title: 'Todas las incidencias',
      state: null,
      empty: 'No hay incidencias'
    };
  }

  if (view === 'validated') {
    return {
      title: 'Validadas',
      state: 'validada',
      empty: 'No hay incidencias validadas'
    };
  }

  if (view === 'rejected') {
    return {
      title: 'Rechazadas',
      state: 'rechazada',
      empty: 'No hay incidencias rechazadas'
    };
  }

  if (view === 'assigned') {
    return {
      title: 'Asignadas',
      state: 'asignada',
      empty: 'No hay incidencias asignadas'
    };
  }

  if (view === 'in_progress') {
    return {
      title: 'En curso',
      state: 'en_curso',
      empty: 'No hay incidencias en curso'
    };
  }

  if (view === 'resolved') {
    return {
      title: 'Resueltas',
      state: 'resuelta',
      empty: 'No hay incidencias resueltas'
    };
  }

  return {
    title: 'Pendientes',
    state: 'creada',
    empty: 'No hay incidencias pendientes'
  };
}

async function loadSessionUser() {
  const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error('Sesion no valida');
  }

  currentUser = await response.json();
  if (currentUser.role !== 'operator') {
    window.location.href = '/dashboard';
    return;
  }

  localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

async function loadIncidents() {
  const response = await fetch('/api/incidents', { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error('No se pudieron cargar incidencias');
  }

  incidents = await response.json();
}

function getIncidentsByState(state) {
  return incidents.filter((incident) => incident.state === state);
}

function getVisibleIncidents(viewConfig) {
  if (viewConfig.state === null) {
    return incidents;
  }

  return getIncidentsByState(viewConfig.state);
}

function renderIncidentCard(incident) {
  const isCreada = incident.state === 'creada';
  const isValidada = incident.state === 'validada';
  const isResolved = incident.state === 'resuelta';
  const isRejected = incident.state === 'rechazada';
  const isClosed = incident.state === 'cerrada';
  const canAssign = incident.state === 'validada' || incident.state === 'asignada' || incident.state === 'en_curso';
  const isFinal = isClosed || isRejected;

  return `
    <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 class="font-semibold text-slate-900">${incident.title}</h3>
          <p class="text-sm text-slate-600 mt-1">${incident.description}</p>
          <p class="text-xs text-slate-400 mt-2">#${incident.id} · ${incident.creatorDni} · Estado: ${stateLabelMap[incident.state] || incident.state}</p>
          <p class="text-xs text-slate-400 mt-1">Categoria reportada: ${incident.category?.toUpperCase() || '-'}</p>
          <p class="text-xs text-slate-400 mt-1">Equipo actual: ${(incident.assignedTeam || 'sin_asignar').toUpperCase()}</p>
        </div>

        <div class="flex items-center gap-2 flex-wrap justify-end">
          ${isResolved ? `
            <button class="confirm-resolution-btn px-3 py-2 rounded-xl text-white text-sm font-semibold" style="background:#7c3aed;" data-id="${incident.id}">
              Confirmar resolución
            </button>
            <button class="reopen-team-btn px-3 py-2 rounded-xl text-white text-sm font-semibold" style="background:#0f766e;" data-id="${incident.id}">
              No concluida
            </button>
          ` : ''}
          ${isCreada ? `
            <button class="validate-btn px-3 py-2 rounded-xl text-white text-sm font-semibold" style="background:#0f766e;" data-id="${incident.id}">
              Validar
            </button>
            <button class="reject-btn px-3 py-2 rounded-xl text-white text-sm font-semibold" style="background:#b91c1c;" data-id="${incident.id}">
              Rechazar
            </button>
          ` : ''}
          ${isValidada ? `
            <select class="team-select px-3 py-2 rounded-xl border border-slate-300 text-sm" data-id="${incident.id}">
              ${TEAM_OPTIONS.map((team) => `<option value="${team.value}" ${incident.assignedTeam?.toUpperCase() === team.value ? 'selected' : ''}>${team.label}</option>`).join('')}
            </select>
            <button class="assign-btn px-3 py-2 rounded-xl text-white text-sm font-semibold" style="background:#1468f5;" data-id="${incident.id}">
              Asignar
            </button>
          ` : ''}
          ${canAssign && !isValidada && !isResolved && !isFinal ? `
            <select class="team-select px-3 py-2 rounded-xl border border-slate-300 text-sm" data-id="${incident.id}">
              ${TEAM_OPTIONS.map((team) => `<option value="${team.value}" ${incident.assignedTeam?.toUpperCase() === team.value ? 'selected' : ''}>${team.label}</option>`).join('')}
            </select>
            <button class="assign-btn px-3 py-2 rounded-xl text-white text-sm font-semibold" style="background:#1468f5;" data-id="${incident.id}">
              Asignar
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderOperatorDashboard() {
  const app = document.getElementById('app');
  const stats = getOperatorStats(incidents);
  const viewConfig = getOperatorViewConfig(currentOperatorView);
  const visibleIncidents = getVisibleIncidents(viewConfig);

  const viewButtons = [
    { key: 'pending', label: `Pendientes (${stats.pending})` },
    { key: 'validated', label: `Validadas (${stats.validated})` },
    { key: 'rejected', label: `Rechazadas (${stats.rejected})` },
    { key: 'assigned', label: `Asignadas (${stats.assigned})` },
    { key: 'in_progress', label: `En curso (${stats.inProgress})` },
    { key: 'resolved', label: `Resueltas (${stats.resolved})` },
    { key: 'all', label: `Todas (${stats.total})` }
  ];

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
          <span>${currentUser?.name || 'Operario'}</span>
          <span class="px-2 py-1 rounded-full bg-sky-100 text-sky-700 font-medium">Operario</span>
          <button id="logout-btn" class="ml-2 text-slate-500 hover:text-slate-700">
            <i data-lucide="log-out" style="width:18px;height:18px;"></i>
          </button>
        </div>
      </header>

      <main class="px-5 py-6">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-3xl font-bold text-slate-900">Revision y asignacion</h1>
          <span class="text-sm text-slate-500">Pendientes de gestion: ${visibleIncidents.length}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <p class="text-xs uppercase tracking-wide text-slate-400 font-semibold">Total</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">${stats.total}</p>
          </div>
          <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <p class="text-xs uppercase tracking-wide text-slate-400 font-semibold">Validadas</p>
            <p class="text-2xl font-bold text-emerald-600 mt-1">${stats.validated}</p>
          </div>
          <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <p class="text-xs uppercase tracking-wide text-slate-400 font-semibold">Rechazadas</p>
            <p class="text-2xl font-bold text-rose-600 mt-1">${stats.rejected}</p>
          </div>
          <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <p class="text-xs uppercase tracking-wide text-slate-400 font-semibold">Pendientes</p>
            <p class="text-2xl font-bold text-amber-600 mt-1">${stats.pending}</p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 mb-6">
          ${viewButtons.map((button) => `
            <button class="operator-view-btn px-4 py-2 rounded-xl text-sm font-semibold ${currentOperatorView === button.key ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}" data-view="${button.key}">${button.label}</button>
          `).join('')}
        </div>

        <div class="space-y-4">
          <h2 class="text-xl font-bold text-slate-900 mb-3">${viewConfig.title}</h2>
          ${visibleIncidents.length === 0 ? `
            <div class="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400">
              ${viewConfig.empty}
            </div>
          ` : visibleIncidents.map((incident) => renderIncidentCard(incident)).join('')}
        </div>
      </main>
    </div>
  `;

  lucide.createIcons();
  attachEvents();
}

async function assignIncidentToTeam(incidentId, team) {
  const response = await fetch(`/api/incidents/${encodeURIComponent(incidentId)}/assign-team`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ team })
  });

  if (!response.ok) {
    const message = await response.text();
    alert(message || 'No se pudo asignar la incidencia al equipo');
    return;
  }

  await loadIncidents();
  renderOperatorDashboard();
}

async function updateOperatorIncidentState(incidentId, state, fallbackMessage) {
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

  await loadIncidents();
  renderOperatorDashboard();
  return true;
}

async function validateIncident(incidentId) {
  await updateOperatorIncidentState(incidentId, 'VALIDADA', 'No se pudo validar la incidencia');
}

async function rejectIncident(incidentId) {
  await updateOperatorIncidentState(incidentId, 'RECHAZADA', 'No se pudo rechazar la incidencia');
}

async function confirmResolutionIncident(incidentId) {
  await updateOperatorIncidentState(incidentId, 'CERRADA', 'No se pudo confirmar la resolución');
}

async function reopenToTeamIncident(incidentId) {
  await updateOperatorIncidentState(incidentId, 'ASIGNADA', 'No se pudo devolver la incidencia al equipo');
}

function attachEvents() {
  const logoutBtn = document.getElementById('logout-btn');
  const switchUserModeBtn = document.getElementById('switch-user-mode-btn');
  const viewButtons = document.querySelectorAll('.operator-view-btn');

  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    localStorage.removeItem('currentUser');
    localStorage.removeItem('activeRole');
    window.location.href = '/login';
  });

  switchUserModeBtn.addEventListener('click', () => {
    localStorage.setItem('activeRole', 'user');
    window.location.href = '/dashboard';
  });

  viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      currentOperatorView = button.dataset.view || 'pending';
      renderOperatorDashboard();
    });
  });

  document.querySelectorAll('.assign-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const incidentId = button.dataset.id;
      const select = document.querySelector(`.team-select[data-id="${incidentId}"]`);
      if (!select) {
        return;
      }
      await assignIncidentToTeam(incidentId, select.value);
    });
  });

  document.querySelectorAll('.validate-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      if (button.disabled) {
        return;
      }
      await validateIncident(button.dataset.id);
    });
  });

  document.querySelectorAll('.reject-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      if (button.disabled) {
        return;
      }
      await rejectIncident(button.dataset.id);
    });
  });

  document.querySelectorAll('.confirm-resolution-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      if (button.disabled) {
        return;
      }
      await confirmResolutionIncident(button.dataset.id);
    });
  });

  document.querySelectorAll('.reopen-team-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      if (button.disabled) {
        return;
      }
      await reopenToTeamIncident(button.dataset.id);
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadSessionUser();
    await loadIncidents();
    renderOperatorDashboard();
  } catch (error) {
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  }
});
