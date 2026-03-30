const storedUser = JSON.parse(localStorage.getItem('currentUser'));

const roleMap = {
  admin: 'Administrador',
  user: 'Usuario'
};

const demoUsers = [
  {
    dni: '12345678A',
    password: 'admin123',
    name: 'Noelia',
    email: 'noelia@urfix.com',
    role: 'admin'
  },
  {
    dni: '87654321B',
    password: 'user123',
    name: 'María',
    email: 'maria@urfix.com',
    role: 'user'
  }
];

const demoStats = {
  total: 0,
  pendientes: 0,
  enProgreso: 0,
  resueltas: 0,
  cerradas: 0,
  urgentes: 0,
  categorias: [
    { nombre: 'Vía pública', valor: 0, icon: 'construction' },
    { nombre: 'Alumbrado', valor: 0, icon: 'lightbulb' },
    { nombre: 'Zonas verdes', valor: 0, icon: 'trees' },
    { nombre: 'Agua', valor: 0, icon: 'droplets' },
    { nombre: 'Residuos', valor: 0, icon: 'trash-2' },
    { nombre: 'Otros', valor: 0, icon: 'help-circle' }
  ]
};


if (!storedUser || storedUser.role !== 'admin') {
  window.location.href = 'login.html';
}

function getUserRoleStats(users) {
  return {
    admin: users.filter(u => u.role === 'admin').length,
    user: users.filter(u => u.role === 'user').length,
    operator: users.filter(u => u.role === 'operator').length,
    technician: users.filter(u => u.role === 'technician').length
  };
}

const roleStats = getUserRoleStats(demoUsers);

const adminConfig = {
  appTitle: 'urFIX',
  userName: storedUser?.name || 'Admin',
  userRole: roleMap[storedUser?.role] || 'Administrador',
  primaryColor: '#1468f5'
};

function renderAdminDashboard() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="min-h-full bg-surface-50">
      <!-- Barra superior -->
      <header class="w-full bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:${adminConfig.primaryColor};">
            <i data-lucide="map-pin" style="width:18px;height:18px;color:white;"></i>
          </div>
          <span class="font-mono-brand text-xl font-bold text-slate-900">${adminConfig.appTitle}</span>
        </div>

        <div class="flex items-center gap-3 text-sm text-slate-600">
          <i data-lucide="shield" style="width:16px;height:16px;"></i>
          <span>${adminConfig.userName}</span>
          <span class="px-2 py-1 rounded-full bg-brand-100 text-brand-600 font-medium">${adminConfig.userRole}</span>
          <button id="logout-btn" class="ml-2 text-slate-500 hover:text-slate-700">
            <i data-lucide="log-out" style="width:18px;height:18px;"></i>
          </button>
        </div>
      </header>

      <!-- Menú -->
      <nav class="bg-white border-b border-slate-200 px-3 py-2 flex items-center gap-4 text-sm">
        <button class="tab-btn flex items-center gap-2 px-3 py-2 rounded-xl text-white font-semibold" style="background:${adminConfig.primaryColor};" data-tab="incidencias">
          <i data-lucide="list" style="width:16px;height:16px;"></i>
          Incidencias
        </button>

        <button class="tab-btn flex items-center gap-2 text-slate-600 hover:text-slate-900 px-2 py-2" data-tab="usuarios">
          <i data-lucide="users" style="width:16px;height:16px;"></i>
          Usuarios
        </button>

        <button class="tab-btn flex items-center gap-2 text-slate-600 hover:text-slate-900 px-2 py-2" data-tab="estadisticas">
          <i data-lucide="bar-chart-3" style="width:16px;height:16px;"></i>
          Estadísticas
        </button>
      </nav>

      <!-- Contenido -->
      <main class="px-3 py-6">
        <!-- Toolbar incidencias -->
        <section id="incidencias" class="tab-content">
          <div class="flex items-center justify-between mb-8">
            <h1 class="text-3xl font-bold text-slate-900">
              Incidencias <span class="text-slate-400 text-xl">(0)</span>
            </h1>

            <div class="flex items-center gap-3">
              <div class="relative">
                <input
                  type="text"
                  placeholder="Buscar..."
                  class="pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-sm w-48"
                >
                <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style="width:16px;height:16px;"></i>
              </div>

              <select class="px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-700">
                <option>Estado: Todos</option>
              </select>

              <select class="px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-700">
                <option>Prioridad: Todas</option>
              </select>
            </div>
          </div>

          <div class="flex flex-col items-center justify-center text-center py-20 text-slate-400">
            <i data-lucide="inbox" style="width:46px;height:46px;" class="mb-4"></i>
            <p class="text-lg font-semibold text-slate-400">No hay incidencias</p>
            <p class="text-sm mt-1">Ajusta los filtros o espera nuevos reportes</p>
          </div>
        </section>

        <!-- Usuarios -->
        <section id="usuarios" class="tab-content hidden">
            <div class="flex items-center justify-between mb-6">
                <h1 class="text-3xl font-bold text-slate-900">
                Usuarios <span class="text-slate-400 text-xl">(${demoUsers.length})</span>
                </h1>
            </div>

            <div class="space-y-4">
                ${demoUsers.map(user => `
                <div class="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
                    <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center ${
                        user.role === 'admin'
                        ? 'bg-violet-100 text-violet-600'
                        : 'bg-blue-100 text-blue-600'
                    }">
                        <i data-lucide="${user.role === 'admin' ? 'shield' : 'user'}" style="width:18px;height:18px;"></i>
                    </div>

                    <div>
                        <p class="font-semibold text-slate-900">${user.name}</p>
                        <p class="text-sm text-slate-400">${user.dni}${user.email ? ` · ${user.email}` : ''}</p>
                    </div>
                    </div>

                    <div class="flex items-center gap-3">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin'
                        ? 'bg-violet-100 text-violet-700'
                        : user.role === 'operator'
                        ? 'bg-sky-100 text-sky-700'
                        : 'bg-blue-100 text-blue-700'
                    }">
                        ${
                        user.role === 'admin'
                            ? 'Administrador'
                            : user.role === 'operator'
                            ? 'Operario'
                            : 'Usuario'
                        }
                    </span>

                    <button class="text-slate-400 hover:text-slate-600" title="Editar">
                        <i data-lucide="pencil" style="width:16px;height:16px;"></i>
                    </button>

                    <button class="text-rose-400 hover:text-rose-600" title="Eliminar">
                        <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
                    </button>
                    </div>
                </div>
                `).join('')}
            </div>
            </section>


        <!-- Estadísticas -->
        <section id="estadisticas" class="tab-content hidden">
            <div class="max-w-5xl mx-auto">
                <h1 class="text-4xl font-bold text-slate-900 mb-8">Estadísticas</h1>

                <!-- Tarjetas resumen -->
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

                <!-- Bloques inferiores -->
                <div class="grid grid-cols-2 gap-4">
                <!-- Por categoría -->
                <div class="bg-white rounded-2xl border border-slate-200 p-4">
                    <h2 class="text-sm font-bold tracking-wide uppercase text-slate-500 mb-4">Por categoría</h2>

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

                <!-- Usuarios por rol -->
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
                        <span>Técnico</span>
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
}

function attachAdminEvents() {
  const logoutBtn = document.getElementById('logout-btn');

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  });

  const buttons = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      contents.forEach(c => c.classList.add('hidden'));
      document.getElementById(target).classList.remove('hidden');

      buttons.forEach(b => {
        b.classList.remove('text-white', 'font-semibold', 'rounded-xl');
        b.classList.add('text-slate-600');
        b.style.background = 'transparent';
      });

      btn.classList.remove('text-slate-600');
      btn.classList.add('text-white', 'font-semibold', 'rounded-xl');
      btn.style.background = adminConfig.primaryColor;
    });
  });
}

document.addEventListener('DOMContentLoaded', renderAdminDashboard);