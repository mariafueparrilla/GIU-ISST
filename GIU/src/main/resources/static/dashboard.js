const storedUser = JSON.parse(localStorage.getItem('currentUser'));

const roleMap = {
  admin: 'Admin',
  user: 'Usuario'
};

const dashboardConfig = {
  appTitle: 'urFIX',
  userName: storedUser?.name || 'Usuario',
  userRole: roleMap[storedUser?.role] || 'Usuario',
  primaryColor: '#1468f5'
};

function renderDashboard() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="min-h-full bg-surface-50">
      <!-- Barra superior -->
      <header class="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:${dashboardConfig.primaryColor};">
            <i data-lucide="map-pin" style="width:18px;height:18px;color:white;"></i>
          </div>
          <span class="font-mono-brand text-xl font-bold text-slate-900">${dashboardConfig.appTitle}</span>
        </div>

        <div class="flex items-center gap-3 text-sm text-slate-600">
          <i data-lucide="user-circle-2" style="width:18px;height:18px;"></i>
          <span>${dashboardConfig.userName}</span>
          <span class="px-2 py-1 rounded-full bg-brand-100 text-brand-600 font-medium">${dashboardConfig.userRole}</span>
          <button id="logout-btn" class="ml-2 text-slate-500 hover:text-slate-700">
            <i data-lucide="log-out" style="width:18px;height:18px;"></i>
          </button>
        </div>
      </header>

      <!-- Menú -->
      <nav class="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-6 text-sm">
        <button class="flex items-center gap-2 px-3 py-2 rounded-xl text-white font-semibold" style="background:${dashboardConfig.primaryColor};">
          <i data-lucide="folder-open" style="width:16px;height:16px;"></i>
          Mis incidencias
        </button>

        <button id="new-incident-nav-btn" class="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <i data-lucide="plus-circle" style="width:16px;height:16px;"></i>
            Nueva incidencia
        </button>
      </nav>

      <!-- Contenido principal -->
      <main class="px-8 py-8">
        <div class="flex items-center justify-between mb-8">
          <h1 class="text-3xl font-bold text-slate-900">
            Mis incidencias <span class="text-slate-400 text-xl">(0)</span>
          </h1>

          <button id="new-incident-main-btn"
                    class="px-5 py-3 rounded-xl text-white font-semibold flex items-center gap-2 shadow-sm hover:opacity-90"
                    style="background:${dashboardConfig.primaryColor};">
            <i data-lucide="plus" style="width:18px;height:18px;"></i>
            Nueva
          </button>
        </div>

        <div class="flex flex-col items-center justify-center text-center py-24 text-slate-400">
          <i data-lucide="file-text" style="width:52px;height:52px;" class="mb-4"></i>
          <p class="text-lg font-medium">No has reportado incidencias</p>
          <p class="text-sm mt-1">Pulsa el botón "Nueva" para crear una</p>
        </div>
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

document.addEventListener('DOMContentLoaded', renderDashboard);