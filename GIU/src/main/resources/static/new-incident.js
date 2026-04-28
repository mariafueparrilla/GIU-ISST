let currentUser = null;

const roleMap = {
  admin: 'Admin',
  user: 'Usuario',
  operator: 'Operario',
  technician: 'Tecnico'
};

async function loadSessionUser() {
  const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error('Sesion no valida');
  }

  currentUser = await response.json();
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function getRoleHomePath() {
  const activeRole = localStorage.getItem('activeRole');
  const roleToUse = activeRole || currentUser?.role;

  if (roleToUse === 'admin') return '/admin-dashboard';
  if (roleToUse === 'operator') return '/operator-dashboard';
  if (roleToUse === 'technician') return '/technician-profile';
  return '/dashboard';
}

function renderNewIncident() {
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
        <button id="back-dashboard-btn" class="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <i data-lucide="file-text" style="width:16px;height:16px;"></i>
          Mis incidencias
        </button>

        <button class="flex items-center gap-2 px-3 py-2 rounded-xl text-white font-semibold" style="background:#1468f5;">
          <i data-lucide="plus-circle" style="width:16px;height:16px;"></i>
          Nueva incidencia
        </button>
      </nav>

      <main class="px-8 py-6">
        <div class="max-w-2xl mx-auto">
          <h1 class="text-3xl font-bold text-slate-900 mb-6">Reportar incidencia</h1>

          <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <form id="incident-form" class="space-y-5">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Titulo</label>
                <input id="incident-title" type="text" maxlength="160" required class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Descripcion</label>
                <textarea id="incident-description" maxlength="1000" required class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700 min-h-[120px] resize-none"></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Categoria</label>
                  <select id="incident-category" class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700" required>
                    <option value="ALUMBRADO">ALUMBRADO</option>
                    <option value="LIMPIEZA">LIMPIEZA</option>
                    <option value="MOVILIDAD">MOVILIDAD</option>
                    <option value="AGUA">AGUA</option>
                    <option value="RESIDUOS">RESIDUOS</option>
                    <option value="MOBILIARIO">MOBILIARIO</option>
                    <option value="OTROS">OTROS</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Prioridad</label>
                  <select id="incident-priority" class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700" required>
                    <option value="BAJA">BAJA</option>
                    <option value="MEDIA">MEDIA</option>
                    <option value="ALTA">ALTA</option>
                    <option value="CRITICA">CRITICA</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Municipio</label>
                  <input id="ubicacion-municipio" type="text" required class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Calle</label>
                  <input id="ubicacion-calle" type="text" required class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700" />
                </div>
              </div>

              <div class="grid grid-cols-4 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Numero</label>
                  <input id="ubicacion-numero" type="number" required class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Codigo postal</label>
                  <input id="ubicacion-cp" type="text" maxlength="5" inputmode="numeric" pattern="[0-9]{5}" required class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Latitud</label>
                  <input id="ubicacion-lat" type="number" step="any"  min="-90" max="90" required class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Longitud</label>
                  <input id="ubicacion-lon" type="number" step="any" min="-180" max="180" required class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700" />
                </div>
              </div>

              <button type="submit" class="w-full py-3 rounded-xl text-white font-bold text-sm transition hover:opacity-90 flex items-center justify-center gap-2" style="background:#1468f5;">
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
  const form = document.getElementById('incident-form');

  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  });

  backDashboardBtn.addEventListener('click', () => {
    window.location.href = getRoleHomePath();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      title: document.getElementById('incident-title').value.trim(),
      description: document.getElementById('incident-description').value.trim(),
      category: document.getElementById('incident-category').value,
      priority: document.getElementById('incident-priority').value,
      ubicacion: {
        municipio: document.getElementById('ubicacion-municipio').value.trim(),
        calle: document.getElementById('ubicacion-calle').value.trim(),
        numero: Number(document.getElementById('ubicacion-numero').value),
        codigoPostal: Number(document.getElementById('ubicacion-cp').value),
        latitud: Number(document.getElementById('ubicacion-lat').value),
        longitud: Number(document.getElementById('ubicacion-lon').value)
      }
    };

    const response = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      alert('No se pudo crear la incidencia');
      return;
    }

    window.location.href = getRoleHomePath();
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadSessionUser();
    renderNewIncident();
  } catch (error) {
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  }
});
