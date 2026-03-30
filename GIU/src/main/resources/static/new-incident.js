const storedUser = JSON.parse(localStorage.getItem('currentUser'));

if (!storedUser || storedUser.role !== 'user') {
  window.location.href = 'login.html';
}

const roleMap = {
  admin: 'Admin',
  user: 'Usuario'
};

const incidentConfig = {
  appTitle: 'urFIX',
  userName: storedUser?.name || 'Usuario',
  userRole: roleMap[storedUser?.role] || 'Usuario',
  primaryColor: '#1468f5'
};

function renderNewIncident() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="min-h-full bg-surface-50">
      <!-- Barra superior -->
      <header class="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:${incidentConfig.primaryColor};">
            <i data-lucide="map-pin" style="width:18px;height:18px;color:white;"></i>
          </div>
          <span class="font-mono-brand text-xl font-bold text-slate-900">${incidentConfig.appTitle}</span>
        </div>

        <div class="flex items-center gap-3 text-sm text-slate-600">
          <i data-lucide="user-circle-2" style="width:18px;height:18px;"></i>
          <span>${incidentConfig.userName}</span>
          <span class="px-2 py-1 rounded-full bg-brand-100 text-brand-600 font-medium">${incidentConfig.userRole}</span>
          <button id="logout-btn" class="ml-2 text-slate-500 hover:text-slate-700">
            <i data-lucide="log-out" style="width:18px;height:18px;"></i>
          </button>
        </div>
      </header>

      <!-- Menú -->
      <nav class="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-6 text-sm">
        <button id="back-dashboard-btn" class="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <i data-lucide="file-text" style="width:16px;height:16px;"></i>
          Mis incidencias
        </button>

        <button class="flex items-center gap-2 px-3 py-2 rounded-xl text-white font-semibold" style="background:${incidentConfig.primaryColor};">
          <i data-lucide="plus-circle" style="width:16px;height:16px;"></i>
          Nueva incidencia
        </button>
      </nav>

      <!-- Contenido -->
      <main class="px-8 py-6">
        <div class="max-w-xl mx-auto">
          <h1 class="text-3xl font-bold text-slate-900 mb-6">Reportar incidencia</h1>

          <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <form id="incident-form" class="space-y-5">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Categoría</label>
                <select id="incident-category" class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700">
                  <option>🚧 Vía pública</option>
                  <option>💡 Alumbrado</option>
                  <option>🌳 Zonas verdes</option>
                  <option>💧 Agua</option>
                  <option>🗑️ Residuos</option>
                  <option>❓ Otros</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Dirección</label>
                <input
                  id="incident-address"
                  type="text"
                  placeholder="Calle Mayor 15, Madrid"
                  class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
                <textarea
                  id="incident-description"
                  placeholder="Describe brevemente la incidencia..."
                  maxlength="300"
                  class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700 min-h-[120px] resize-none"
                ></textarea>
                <div class="text-right text-xs text-slate-400 mt-2">
                  <span id="description-counter">0</span>/300
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Foto (referencia)</label>
                <label for="incident-photo" class="block border border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer bg-surface-50 hover:bg-slate-50 transition">
                  <div class="flex flex-col items-center text-slate-400">
                    <i data-lucide="camera" style="width:28px;height:28px;" class="mb-3"></i>
                    <p class="text-sm font-medium">Haz clic para seleccionar una foto</p>
                    <p class="text-xs mt-1">La foto se usa como referencia visual</p>
                  </div>
                  <input id="incident-photo" type="file" accept="image/*" class="hidden" />
                </label>
              </div>

              <button
                type="submit"
                class="w-full py-3 rounded-xl text-white font-bold text-sm transition hover:opacity-90 flex items-center justify-center gap-2"
                style="background:${incidentConfig.primaryColor};"
              >
                <i data-lucide="send" style="width:18px;height:18px;"></i>
                Enviar incidencia
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  `;

  lucide.createIcons();
  attachNewIncidentEvents();
}

function attachNewIncidentEvents() {
  const logoutBtn = document.getElementById('logout-btn');
  const backDashboardBtn = document.getElementById('back-dashboard-btn');
  const description = document.getElementById('incident-description');
  const counter = document.getElementById('description-counter');
  const form = document.getElementById('incident-form');

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  });

  backDashboardBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });

  description.addEventListener('input', () => {
    counter.textContent = description.value.length;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Incidencia enviada correctamente');
    window.location.href = 'dashboard.html';
  });
}

document.addEventListener('DOMContentLoaded', renderNewIncident);