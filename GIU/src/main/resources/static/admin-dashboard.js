let currentUser = null;
let users = [];
let incidents = [];
let activeTab = 'incidencias';

const roleMap = {
  admin: 'Administrador',
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

const allStates = ['CREADA', 'VALIDADA', 'ASIGNADA', 'EN_CURSO', 'RESUELTA', 'CERRADA'];

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

  return `
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold text-slate-900">
        Incidencias <span class="text-slate-400 text-xl">(${incidents.length})</span>
      </h1>
      <button id="new-incident-admin-btn" class="px-4 py-2 rounded-xl text-white font-semibold" style="background:#1468f5;">Nueva</button>
    </div>

    <div class="space-y-4">
      ${incidents.map(incident => `
        <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between gap-4">
            <div>
              <h3 class="font-semibold text-slate-900">${incident.title}</h3>
              <p class="text-sm text-slate-600 mt-1">${incident.description}</p>
              <p class="text-xs text-slate-400 mt-2">
                #${incident.id} · ${incident.creatorDni} · ${incident.category.toUpperCase()} · ${incident.priority.toUpperCase()} · ${incident.ubicacion.municipio}, ${incident.ubicacion.calle} ${incident.ubicacion.numero}
              </p>
              <p class="text-xs text-slate-400 mt-1">Equipo tecnico: ${(incident.assignedTeam || 'sin_asignar').toUpperCase()}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">${stateLabelMap[incident.state] || incident.state}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderAdminDashboard() {
  const app = document.getElementById('app');
  const roleStats = getUserRoleStats(users);
  const incidentStats = getIncidentStats(incidents);
  const teamStats = getTechnicalTeamStats(users, incidents);

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
          <i data-lucide="users-round" style="width:16px;height:16px;"></i>
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
          <div class="flex items-center justify-between mb-6">
            <h1 class="text-3xl font-bold text-slate-900">
              Usuarios <span class="text-slate-400 text-xl">(${users.length})</span>
            </h1>
          </div>

          <div class="space-y-4">
            ${users.map(user => `
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
                  <button class="delete-user-btn text-rose-400 hover:text-rose-600" data-dni="${user.dni}" title="Eliminar">
                    <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <section id="equipos" class="tab-content hidden">
          <div class="flex items-center justify-between mb-6">
            <h1 class="text-3xl font-bold text-slate-900">Equipos tecnicos</h1>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${teamStats.map((team) => `
              <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="font-semibold text-slate-900">${team.teamName}</h3>
                  <span class="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">${team.technicians.length} tecnicos</span>
                </div>

                <p class="text-sm text-slate-500 mb-3">Incidencias asignadas: ${team.assignedCount} · Activas: ${team.activeCount}</p>

                ${team.technicians.length === 0 ? `
                  <p class="text-sm text-slate-400">No hay tecnicos en este equipo</p>
                ` : `
                  <div class="space-y-2">
                    ${team.technicians.map((technician) => `
                      <div class="flex items-center justify-between border border-slate-200 rounded-xl px-3 py-2">
                        <div>
                          <p class="text-sm font-medium text-slate-800">${technician.name}</p>
                          <p class="text-xs text-slate-400">${technician.dni}</p>
                        </div>
                        <button class="edit-user-btn text-slate-500 hover:text-slate-700" data-dni="${technician.dni}" title="Editar tecnico">
                          <i data-lucide="pencil" style="width:15px;height:15px;"></i>
                        </button>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>
            `).join('')}
          </div>
        </section>

        <section id="estadisticas" class="tab-content hidden">
          <div class="max-w-5xl mx-auto">
            <h1 class="text-4xl font-bold text-slate-900 mb-8">Estadisticas</h1>
            <div class="grid grid-cols-6 gap-4 mb-6">
              <div class="bg-white rounded-2xl border border-slate-200 p-4 text-center"><p class="text-3xl font-bold text-slate-900">${incidentStats.total}</p><span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">Total</span></div>
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

  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    localStorage.removeItem('currentUser');
    localStorage.removeItem('activeRole');
    window.location.href = '/login';
  });

  buttons.forEach(btn => {
    btn.addEventListener('click', () => openTab(btn.dataset.tab, buttons, contents));
  });

  const newIncidentAdminBtn = document.getElementById('new-incident-admin-btn');
  if (newIncidentAdminBtn) {
    newIncidentAdminBtn.addEventListener('click', () => {
      window.location.href = '/new-incident';
    });
  }

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
