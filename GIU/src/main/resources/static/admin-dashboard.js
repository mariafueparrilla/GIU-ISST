let currentUser = null;
let users = [];
let activeTab = 'incidencias';

const roleMap = {
  admin: 'Administrador',
  user: 'Usuario',
  operator: 'Operario',
  technician: 'Tecnico'
};

const demoStats = {
  total: 0,
  pendientes: 0,
  enProgreso: 0,
  resueltas: 0,
  cerradas: 0,
  urgentes: 0,
  categorias: [
    { nombre: 'Via publica', valor: 0, icon: 'construction' },
    { nombre: 'Alumbrado', valor: 0, icon: 'lightbulb' },
    { nombre: 'Zonas verdes', valor: 0, icon: 'trees' },
    { nombre: 'Agua', valor: 0, icon: 'droplets' },
    { nombre: 'Residuos', valor: 0, icon: 'trash-2' },
    { nombre: 'Otros', valor: 0, icon: 'help-circle' }
  ]
};

function getUserRoleStats(userList) {
  return {
    admin: userList.filter(u => u.role === 'admin').length,
    user: userList.filter(u => u.role === 'user').length,
    operator: userList.filter(u => u.role === 'operator').length,
    technician: userList.filter(u => u.role === 'technician').length
  };
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
  const response = await fetch('/api/auth/me');
  if (!response.ok) {
    throw new Error('Sesion no valida');
  }

  currentUser = await response.json();
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

async function loadUsers() {
  const response = await fetch('/api/users');
  if (!response.ok) {
    throw new Error('No se pudieron cargar usuarios');
  }

  users = await response.json();
}

function renderAdminDashboard() {
  const app = document.getElementById('app');
  const roleStats = getUserRoleStats(users);

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

        <button class="tab-btn flex items-center gap-2 text-slate-600 hover:text-slate-900 px-2 py-2" data-tab="estadisticas">
          <i data-lucide="bar-chart-3" style="width:16px;height:16px;"></i>
          Estadisticas
        </button>
      </nav>

      <main class="px-3 py-6">
        <section id="incidencias" class="tab-content">
          <div class="flex items-center justify-between mb-8">
            <h1 class="text-3xl font-bold text-slate-900">
              Incidencias <span class="text-slate-400 text-xl">(0)</span>
            </h1>
          </div>

          <div class="flex flex-col items-center justify-center text-center py-20 text-slate-400">
            <i data-lucide="inbox" style="width:46px;height:46px;" class="mb-4"></i>
            <p class="text-lg font-semibold text-slate-400">No hay incidencias</p>
            <p class="text-sm mt-1">Ajusta los filtros o espera nuevos reportes</p>
          </div>
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
                  <span class="px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClass(user.role)}">
                    ${getRoleLabel(user.role)}
                  </span>

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

        <section id="estadisticas" class="tab-content hidden">
          <div class="max-w-5xl mx-auto">
            <h1 class="text-4xl font-bold text-slate-900 mb-8">Estadisticas</h1>

            <div class="grid grid-cols-6 gap-4 mb-6">
              <div class="bg-white rounded-2xl border border-slate-200 p-4 text-center">
                <p class="text-3xl font-bold text-slate-900">${demoStats.total}</p>
                <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">Total</span>
              </div>

              <div class="bg-white rounded-2xl border border-slate-200 p-4 text-center">
                <p class="text-3xl font-bold text-slate-900">${demoStats.pendientes}</p>
                <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Pendientes</span>
              </div>

              <div class="bg-white rounded-2xl border border-slate-200 p-4 text-center">
                <p class="text-3xl font-bold text-slate-900">${demoStats.enProgreso}</p>
                <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">En progreso</span>
              </div>

              <div class="bg-white rounded-2xl border border-slate-200 p-4 text-center">
                <p class="text-3xl font-bold text-slate-900">${demoStats.resueltas}</p>
                <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Resueltas</span>
              </div>

              <div class="bg-white rounded-2xl border border-slate-200 p-4 text-center">
                <p class="text-3xl font-bold text-slate-900">${demoStats.cerradas}</p>
                <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-600">Cerradas</span>
              </div>

              <div class="bg-white rounded-2xl border border-slate-200 p-4 text-center">
                <p class="text-3xl font-bold text-slate-900">${demoStats.urgentes}</p>
                <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Urgentes</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white rounded-2xl border border-slate-200 p-4">
                <h2 class="text-sm font-bold tracking-wide uppercase text-slate-500 mb-4">Por categoria</h2>

                <div class="space-y-3">
                  ${demoStats.categorias.map(cat => `
                    <div class="flex items-center justify-between border-b border-slate-100 pb-2 last:border-b-0">
                      <div class="flex items-center gap-2 text-slate-600">
                        <i data-lucide="${cat.icon}" style="width:15px;height:15px;"></i>
                        <span>${cat.nombre}</span>
                      </div>
                      <span class="font-semibold text-slate-900">${cat.valor}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="bg-white rounded-2xl border border-slate-200 p-4">
                <h2 class="text-sm font-bold tracking-wide uppercase text-slate-500 mb-4">Usuarios por rol</h2>

                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 text-slate-600">
                      <i data-lucide="shield" style="width:15px;height:15px;"></i>
                      <span>Administrador</span>
                    </div>
                    <span class="font-semibold text-slate-900">${roleStats.admin}</span>
                  </div>

                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 text-slate-600">
                      <i data-lucide="user" style="width:15px;height:15px;"></i>
                      <span>Usuario</span>
                    </div>
                    <span class="font-semibold text-slate-900">${roleStats.user}</span>
                  </div>

                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 text-slate-600">
                      <i data-lucide="wrench" style="width:15px;height:15px;"></i>
                      <span>Operario</span>
                    </div>
                    <span class="font-semibold text-slate-900">${roleStats.operator}</span>
                  </div>

                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 text-slate-600">
                      <i data-lucide="briefcase" style="width:15px;height:15px;"></i>
                      <span>Tecnico</span>
                    </div>
                    <span class="font-semibold text-slate-900">${roleStats.technician}</span>
                  </div>
                </div>
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

async function editUser(dni) {
  window.location.href = `/admin-user-edit?dni=${encodeURIComponent(dni)}`;
}

async function deleteUser(dni) {
  const confirmed = confirm(`¿Seguro que quieres eliminar el usuario ${dni}?`);
  if (!confirmed) {
    return;
  }

  const response = await fetch(`/api/users/${encodeURIComponent(dni)}`, {
    method: 'DELETE'
  });

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
  const buttons = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  });

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      openTab(btn.dataset.tab, buttons, contents);
    });
  });

  document.querySelectorAll('.edit-user-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await editUser(btn.dataset.dni);
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

    await loadUsers();
    renderAdminDashboard();
  } catch (error) {
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  }
});
