// Configuración de la pantalla de registro
const registerConfig = {
  appTitle: 'urFIX',
  appSubtitle: 'Gestión de incidencias urbanas',
  primaryColor: '#1468f5',
  surfaceColor: '#ffffff',
  textColor: '#0f172a'
};

/**
 * Muestra una notificación flotante en pantalla.
 * @param {string} message - Texto del mensaje.
 * @param {string} type - Tipo: success, error o info.
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

  setTimeout(() => {
    toast.classList.remove('toast-enter');
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Genera una contraseña aleatoria de la longitud indicada.
 * @param {number} length - Longitud de la contraseña.
 * @returns {string} contraseña generada.
 */
function generatePassword(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let password = '';

  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
}

/**
 * Renderiza la pantalla de registro.
 */
function renderRegister() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="h-full w-full flex items-center justify-center p-4"
         style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);">
      <div class="w-full max-w-md fade-in">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
               style="background:${registerConfig.primaryColor};">
            <i data-lucide="user-plus" style="width:32px;height:32px;color:white;"></i>
          </div>

          <h1 class="font-mono-brand text-3xl font-bold text-white tracking-tight">
            ${registerConfig.appTitle}
          </h1>

          <p class="text-slate-400 mt-1 text-sm">
            Crear nueva cuenta
          </p>
        </div>

        <div class="rounded-2xl shadow-2xl p-8"
             style="background:${registerConfig.surfaceColor};">
          <h2 class="text-xl font-bold mb-6"
              style="color:${registerConfig.textColor};">
            Registro
          </h2>

          <form id="register-form" class="space-y-4">
            <div>
              <label for="reg-dni" class="block text-sm font-semibold mb-1.5 text-slate-600">
                DNI
              </label>
              <input
                id="reg-dni"
                type="text"
                placeholder="12345678A"
                maxlength="9"
                class="w-full px-4 py-3 rounded-xl border-2 border-surface-200 focus:border-brand-500 transition text-sm bg-surface-50"
                required
              >
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="reg-name" class="block text-sm font-semibold mb-1.5 text-slate-600">
                  Nombre
                </label>
                <input
                  id="reg-name"
                  type="text"
                  placeholder="Juan"
                  class="w-full px-4 py-3 rounded-xl border-2 border-surface-200 focus:border-brand-500 transition text-sm bg-surface-50"
                  required
                >
              </div>

              <div>
                <label for="reg-surname" class="block text-sm font-semibold mb-1.5 text-slate-600">
                  Apellidos
                </label>
                <input
                  id="reg-surname"
                  type="text"
                  placeholder="García López"
                  class="w-full px-4 py-3 rounded-xl border-2 border-surface-200 focus:border-brand-500 transition text-sm bg-surface-50"
                  required
                >
              </div>
            </div>

            <div>
              <label for="reg-email" class="block text-sm font-semibold mb-1.5 text-slate-600">
                Correo electrónico
              </label>
              <input
                id="reg-email"
                type="email"
                placeholder="juan@email.com"
                class="w-full px-4 py-3 rounded-xl border-2 border-surface-200 focus:border-brand-500 transition text-sm bg-surface-50"
                required
              >
            </div>

            <div>
              <label for="reg-role" class="block text-sm font-semibold mb-1.5 text-slate-600">
                Rol
              </label>
              <select
                id="reg-role"
                class="w-full px-4 py-3 rounded-xl border-2 border-surface-200 focus:border-brand-500 transition text-sm bg-surface-50"
                required
              >
                <option value="user">Usuario</option>
                <option value="operator">Operario</option>
                <option value="technician">Técnico</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div>
              <label for="reg-password" class="block text-sm font-semibold mb-1.5 text-slate-600">
                Contraseña
              </label>

              <div class="flex gap-2">
                <input
                  id="reg-password"
                  type="text"
                  placeholder="Genera o escribe una contraseña"
                  class="flex-1 px-4 py-3 rounded-xl border-2 border-surface-200 focus:border-brand-500 transition text-sm bg-surface-50"
                  required
                >
                <button
                  type="button"
                  id="generate-password-btn"
                  class="px-4 py-3 rounded-xl text-white font-semibold text-sm transition hover:opacity-90 whitespace-nowrap"
                  style="background:${registerConfig.primaryColor};"
                >
                  Generar
                </button>
              </div>

              <p class="text-xs text-slate-400 mt-2">
                Puedes escribir tu propia contraseña o generar una automáticamente.
              </p>
            </div>

            <button
              type="submit"
              class="w-full py-3 rounded-xl text-white font-bold text-sm transition hover:opacity-90 flex items-center justify-center gap-2"
              style="background:${registerConfig.primaryColor};"
            >
              <i data-lucide="user-plus" style="width:18px;height:18px;"></i>
              Crear cuenta
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-slate-500">
              ¿Ya tienes cuenta?
              <a href="login.html" class="font-bold hover:underline" style="color:${registerConfig.primaryColor};">
                Inicia sesión
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Inicializa iconos
  lucide.createIcons();

  // Añade eventos a botones y formulario
  attachRegisterEvents();
}

/**
 * Añade la lógica del formulario de registro:
 * - generar contraseña
 * - validar datos
 * - simular creación de usuario
 */
function attachRegisterEvents() {
  const generateBtn = document.getElementById('generate-password-btn');
  const passwordInput = document.getElementById('reg-password');
  const registerForm = document.getElementById('register-form');

  // Genera una contraseña automáticamente y la coloca en el input
  generateBtn.addEventListener('click', () => {
    passwordInput.value = generatePassword();
    showToast('Contraseña generada correctamente', 'info');
  });

  // Valida y procesa el formulario
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const dni = document.getElementById('reg-dni').value.trim().toUpperCase();
    const name = document.getElementById('reg-name').value.trim();
    const surname = document.getElementById('reg-surname').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const role = document.getElementById('reg-role').value;
    const password = passwordInput.value.trim();

    // Validación básica del DNI
    if (!/^\d{8}[A-Z]$/.test(dni)) {
      showToast('El DNI debe tener 8 números y una letra mayúscula', 'error');
      return;
    }

    // Validación básica de longitud mínima de contraseña
    if (password.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    // Simulación del objeto usuario que luego se enviaría al backend
    const newUser = {
      dni,
      name,
      surname,
      email,
      role,
      password
    };

    console.log('Usuario registrado:', newUser);

    showToast('Cuenta creada con éxito', 'success');

    // Redirección simulada al login
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1200);
  });
}

// Espera a que cargue el DOM antes de renderizar
document.addEventListener('DOMContentLoaded', renderRegister);