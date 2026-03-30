// Configuración visual y textual de la pantalla de login
const loginConfig = {
  appTitle: 'urFIX',
  appSubtitle: 'Gestión de incidencias urbanas',
  loginWelcome: 'Bienvenido de nuevo',
  primaryColor: '#1468f5',
  surfaceColor: '#ffffff',
  textColor: '#0f172a'
};

// Usuarios de ejemplo para probar el login sin backend real
const demoUsers = [
  {
    dni: '12345678A',
    password: 'admin123',
    name: 'Noelia',
    role: 'admin'
  },
  {
    dni: '87654321B',
    password: 'user123',
    name: 'María',
    role: 'user'
  }
];

/**
 * Muestra una notificación flotante.
 * @param {string} message - Mensaje a mostrar.
 * @param {string} type - Tipo de mensaje: success, error o info.
 */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');

  const colors = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-brand-600'
  };

  const icons = {
    success: 'check-circle',
    error: 'alert-circle',
    info: 'info'
  };

  toast.className = `${colors[type]} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 toast-enter text-sm font-medium max-w-sm`;
  toast.innerHTML = `
    <i data-lucide="${icons[type]}" style="width:18px;height:18px;flex-shrink:0;"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  lucide.createIcons({ nodes: [toast] });

  // El toast desaparece automáticamente después de 3 segundos
  setTimeout(() => {
    toast.classList.remove('toast-enter');
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Renderiza la interfaz completa del login dentro del contenedor principal.
 */
function renderLogin() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="h-full w-full flex items-center justify-center p-4"
         style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);">
      <div class="w-full max-w-md fade-in">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
               style="background:${loginConfig.primaryColor};">
            <i data-lucide="map-pin" style="width:32px;height:32px;color:white;"></i>
          </div>

          <h1 class="font-mono-brand text-3xl font-bold text-white tracking-tight">
            ${loginConfig.appTitle}
          </h1>

          <p class="text-slate-400 mt-1 text-sm">
            ${loginConfig.appSubtitle}
          </p>
        </div>

        <div class="rounded-2xl shadow-2xl p-8"
             style="background:${loginConfig.surfaceColor};">
          <h2 class="text-xl font-bold mb-6"
              style="color:${loginConfig.textColor};">
            ${loginConfig.loginWelcome}
          </h2>

          <form id="login-form" class="space-y-4">
            <div>
              <label for="login-dni" class="block text-sm font-semibold mb-1.5 text-slate-600">
                DNI
              </label>
              <input
                id="login-dni"
                type="text"
                placeholder="12345678A"
                maxlength="9"
                class="w-full px-4 py-3 rounded-xl border-2 border-surface-200 focus:border-brand-500 transition text-sm bg-surface-50"
                required
              >
            </div>

            <div>
              <label for="login-pw" class="block text-sm font-semibold mb-1.5 text-slate-600">
                Contraseña
              </label>
              <div class="relative">
                <input
                  id="login-pw"
                  type="password"
                  placeholder="••••••••••"
                  class="w-full px-4 py-3 rounded-xl border-2 border-surface-200 focus:border-brand-500 transition text-sm bg-surface-50 pr-12"
                  required
                >
                <button
                  type="button"
                  id="toggle-pw"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Mostrar u ocultar contraseña"
                >
                  <i data-lucide="eye" style="width:18px;height:18px;"></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              class="w-full py-3 rounded-xl text-white font-bold text-sm transition hover:opacity-90 flex items-center justify-center gap-2"
              style="background:${loginConfig.primaryColor};"
            >
              <i data-lucide="log-in" style="width:18px;height:18px;"></i>
              Iniciar sesión
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-slate-500">
              ¿No tienes cuenta?
              <a href="register.html" class="font-bold hover:underline" style="color:${loginConfig.primaryColor};">
                Regístrate
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Inicializa los iconos Lucide
  lucide.createIcons();

  // Conecta la lógica JS con los elementos recién renderizados
  attachLoginEvents();
}

/**
 * Añade los eventos al formulario de login:
 * - mostrar/ocultar contraseña
 * - enviar formulario y validar usuario
 */
function attachLoginEvents() {
  const togglePwBtn = document.getElementById('toggle-pw');
  const passwordInput = document.getElementById('login-pw');
  const loginForm = document.getElementById('login-form');

  // Cambia el input entre password y text
  togglePwBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';

    // Cambia también el icono
    togglePwBtn.innerHTML = `
      <i data-lucide="${isPassword ? 'eye-off' : 'eye'}" style="width:18px;height:18px;"></i>
    `;
    lucide.createIcons({ nodes: [togglePwBtn] });
  });

  // Gestiona el envío del formulario
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const dni = document.getElementById('login-dni').value.trim().toUpperCase();
    const password = document.getElementById('login-pw').value;

    // Busca si existe un usuario con ese DNI y contraseña
    const user = demoUsers.find(u => u.dni === dni && u.password === password);

    if (user) {
      showToast(`¡Hola, ${user.name}!`, 'success');

      // Guarda el usuario actual para que el dashboard pueda leerlo
      localStorage.setItem('currentUser', JSON.stringify(user));

      // Redirección simulada al dashboard
      setTimeout(() => {
        if (user.role === 'admin') {
          window.location.href = 'admin-dashboard.html';
        } else {
          window.location.href = 'dashboard.html';
        }
      }, 1000);
    } else {
      showToast('DNI o contraseña incorrectos', 'error');
    }
  });
}

// Espera a que cargue el DOM antes de pintar el login
document.addEventListener('DOMContentLoaded', renderLogin);