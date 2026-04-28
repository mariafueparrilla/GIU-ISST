const params = new URLSearchParams(window.location.search);
const dni = (params.get('dni') || '').toUpperCase();

let currentUser = null;
let targetUser = null;

const roleMap = {
  admin: 'Administrador',
  user: 'Usuario',
  operator: 'Operario',
  technician: 'Tecnico'
};

const technicalTeams = [
  { value: 'alumbrado', label: 'Alumbrado' },
  { value: 'limpieza', label: 'Limpieza' },
  { value: 'movilidad', label: 'Movilidad' },
  { value: 'agua', label: 'Agua' },
  { value: 'residuos', label: 'Residuos' },
  { value: 'mobiliario', label: 'Mobiliario' },
  { value: 'otros', label: 'Otros' }
];

async function loadSessionUser() {
  const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error('Sesion no valida');
  }

  currentUser = await response.json();
}

async function loadTargetUser() {
  if (!dni) {
    throw new Error('DNI no proporcionado');
  }

  const response = await fetch(`/api/users/${encodeURIComponent(dni)}`);
  if (!response.ok) {
    throw new Error('Usuario no encontrado');
  }

  targetUser = await response.json();
}

function renderEditPage() {
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
          <i data-lucide="shield" style="width:16px;height:16px;"></i>
          <span>${currentUser.name}</span>
          <span class="px-2 py-1 rounded-full bg-brand-100 text-brand-600 font-medium">${roleMap[currentUser.role] || 'Administrador'}</span>
          <button id="logout-btn" class="ml-2 text-slate-500 hover:text-slate-700">
            <i data-lucide="log-out" style="width:18px;height:18px;"></i>
          </button>
        </div>
      </header>

      <main class="px-6 py-8">
        <div class="max-w-2xl mx-auto">
          <div class="flex items-center justify-between mb-6">
            <h1 class="text-3xl font-bold text-slate-900">Editar usuario</h1>
            <button id="back-btn" class="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100">
              Volver
            </button>
          </div>

          <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <form id="edit-user-form" class="space-y-5">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">DNI</label>
                <input
                  type="text"
                  value="${targetUser.dni}"
                  disabled
                  class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-100 text-sm text-slate-500"
                >
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Nombre</label>
                <input
                  id="name"
                  type="text"
                  value="${targetUser.name}"
                  required
                  class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700"
                >
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input
                  id="email"
                  type="email"
                  value="${targetUser.email || ''}"
                  required
                  class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700"
                >
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Rol</label>
                <select
                  id="role"
                  class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700"
                >
                  <option value="admin" ${targetUser.role === 'admin' ? 'selected' : ''}>Administrador</option>
                  <option value="user" ${targetUser.role === 'user' ? 'selected' : ''}>Usuario</option>
                  <option value="operator" ${targetUser.role === 'operator' ? 'selected' : ''}>Operario</option>
                  <option value="technician" ${targetUser.role === 'technician' ? 'selected' : ''}>Tecnico</option>
                </select>
              </div>

              <div id="technical-team-wrapper" class="${targetUser.role === 'technician' ? '' : 'hidden'}">
                <label class="block text-sm font-semibold text-slate-700 mb-2">Equipo tecnico</label>
                <select
                  id="technicalTeam"
                  class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700"
                >
                  <option value="">Selecciona un equipo</option>
                  ${technicalTeams.map(team => `<option value="${team.value}" ${targetUser.technicalTeam === team.value ? 'selected' : ''}>${team.label}</option>`).join('')}
                </select>
              </div>

              <div class="flex gap-3 pt-2">
                <button
                  type="button"
                  id="cancel-btn"
                  class="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  class="px-5 py-3 rounded-xl text-white font-semibold hover:opacity-90"
                  style="background:#1468f5;"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  `;

  lucide.createIcons();
  attachEvents();
}

function attachEvents() {
  const backBtn = document.getElementById('back-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const form = document.getElementById('edit-user-form');
  const roleSelect = document.getElementById('role');
  const technicalTeamWrapper = document.getElementById('technical-team-wrapper');
  const technicalTeamSelect = document.getElementById('technicalTeam');

  const refreshTeamVisibility = () => {
    const isTechnician = roleSelect.value === 'technician';
    technicalTeamWrapper.classList.toggle('hidden', !isTechnician);
    technicalTeamSelect.required = isTechnician;
    if (!isTechnician) {
      technicalTeamSelect.value = '';
    }
  };

  roleSelect.addEventListener('change', refreshTeamVisibility);
  refreshTeamVisibility();

  const goBack = () => {
    window.location.href = '/admin-dashboard';
  };

  backBtn.addEventListener('click', goBack);
  cancelBtn.addEventListener('click', goBack);

  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const role = document.getElementById('role').value;
    const technicalTeam = technicalTeamSelect.value;

    if (!name || !email) {
      alert('Nombre y email son obligatorios');
      return;
    }

    if (role === 'technician' && !technicalTeam) {
      alert('Selecciona un equipo tecnico para el tecnico');
      return;
    }

    const response = await fetch(`/api/users/${encodeURIComponent(dni)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        role,
        technicalTeam: role === 'technician' ? technicalTeam : null
      })
    });

    if (!response.ok) {
      alert('No se pudo actualizar el usuario');
      return;
    }

    window.location.href = '/admin-dashboard';
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadSessionUser();
    if (currentUser.role !== 'admin') {
      window.location.href = '/login';
      return;
    }

    await loadTargetUser();
    renderEditPage();
  } catch (error) {
    window.location.href = '/admin-dashboard';
  }
});
