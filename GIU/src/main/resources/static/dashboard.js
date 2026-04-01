let currentUser = null;
let myIncidents = [];

const roleMap = {
  admin: 'Admin',
  user: 'Usuario',
  operator: 'Operario',
  technician: 'Tecnico'
};

const stateLabelMap = {
  creada: 'Creada',
  validada: 'Validada',
  asignada: 'Asignada',
  en_curso: 'En curso',
  resuelta: 'Resuelta',
  cerrada: 'Cerrada'
};

async function loadSessionUser() {
  const response = await fetch('/api/auth/me');
  if (!response.ok) {
    throw new Error('Sesion no valida');
  }

  currentUser = await response.json();
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

async function loadMyIncidents() {
  const response = await fetch('/api/incidents/my');
  if (!response.ok) {
    throw new Error('No se pudieron cargar incidencias');
  }

  myIncidents = await response.json();
}

function renderDashboard() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="min-h-full bg-surface-50">
      <header class="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:#1468f5;">
            <i data-lucide="map-pin" style="width:18px;height:18px;color:white;"></i>
          </div>
          <span class="font-mono-brand text-xl font-bold text-slate-900">urFIX</span>
        </div>

        <div class="flex items-center gap-3 text-sm text-slate-600">
          <i data-lucide="user-circle-2" style="width:18px;height:18px;"></i>
          <span>${currentUser?.name || 'Usuario'}</span>
          <span class="px-2 py-1 rounded-full bg-brand-100 text-brand-600 font-medium">${roleMap[currentUser?.role] || 'Usuario'}</span>
          <button id="logout-btn" class="ml-2 text-slate-500 hover:text-slate-700">
            <i data-lucide="log-out" style="width:18px;height:18px;"></i>
          </button>
        </div>
      </header>

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

        ${myIncidents.length === 0
          ? `<div class="flex flex-col items-center justify-center text-center py-24 text-slate-400">
              <i data-lucide="file-text" style="width:52px;height:52px;" class="mb-4"></i>
              <p class="text-lg font-medium">No has reportado incidencias</p>
              <p class="text-sm mt-1">Pulsa el boton Nueva para crear una</p>
            </div>`
          : `<div class="space-y-4">
              ${myIncidents.map(incident => `
                <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div class="flex items-center justify-between">
                    <h2 class="text-lg font-semibold text-slate-900">${incident.title}</h2>
                    <span class="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600">${stateLabelMap[incident.state] || incident.state}</span>
                  </div>
                  <p class="text-sm text-slate-600 mt-2">${incident.description}</p>
                  <div class="text-xs text-slate-400 mt-3">
                    ${incident.category.toUpperCase()} · ${incident.priority.toUpperCase()} · ${incident.ubicacion.municipio}, ${incident.ubicacion.calle} ${incident.ubicacion.numero}
                  </div>
                </div>
              `).join('')}
            </div>`}
      </main>
    </div>
  `;

  lucide.createIcons();
  attachDashboardEvents();
}

function attachDashboardEvents() {
  const logoutBtn = document.getElementById('logout-btn');
  const newIncidentNavBtn = document.getElementById('new-incident-nav-btn');
  const newIncidentMainBtn = document.getElementById('new-incident-main-btn');

  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  });

  newIncidentNavBtn.addEventListener('click', () => {
    window.location.href = '/new-incident';
  });

  newIncidentMainBtn.addEventListener('click', () => {
    window.location.href = '/new-incident';
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadSessionUser();
    if (currentUser.role === 'admin') {
      window.location.href = '/admin-dashboard';
      return;
    }
    await loadMyIncidents();
    renderDashboard();
  } catch (error) {
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  }
});
