let currentUser = null;
let selectedImages = [];
let mapPicker = null;
let selectedLocation = null;
let locationValidated = false;
let mapMarker = null;

const roleMap = {
  admin: 'Admin',
  user: 'Usuario',
  operator: 'Operario',
  technician: 'Tecnico'
};

async function loadSessionUser() {
  const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error('Sesión no válida');
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

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function addImagesToForm(files) {
  for (const file of files) {
    // Validar tipo de archivo y tamaño
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen');
      continue;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      alert('La imagen no puede exceder 5MB');
      continue;
    }

    if (selectedImages.length >= 3) {
      alert('Se puede subir máximo 3 imágenes');
      break;
    }

    try {
      const base64 = await fileToBase64(file);
      selectedImages.push({
        filename: file.name,
        mimeType: file.type,
        imageData: base64,
        fileSize: file.size
      });
    } catch (error) {
      alert('Error al procesar la imagen');
      console.error(error);
    }
  }

  renderImagePreviews();
}

function renderImagePreviews() {
  const container = document.getElementById('image-previews');
  if (!container) return;

  if (selectedImages.length === 0) {
    container.innerHTML = '<p class="text-slate-400 text-sm">No hay imágenes seleccionadas</p>';
    return;
  }

  container.innerHTML = selectedImages.map((img, idx) => `
    <div class="relative rounded-lg overflow-hidden border border-slate-200">
      <img src="data:${img.mimeType};base64,${img.imageData}" alt="Preview ${idx + 1}" class="w-full h-32 object-cover" />
      <button type="button" data-idx="${idx}" class="remove-image-btn absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition">
        <i data-lucide="x" style="width:14px;height:14px;"></i>
      </button>
      <p class="text-xs text-slate-500 px-2 py-1 bg-slate-50 truncate">${img.filename}</p>
    </div>
  `).join('');

  lucide.createIcons();

  document.querySelectorAll('.remove-image-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = Number(btn.dataset.idx);
      selectedImages.splice(idx, 1);
      renderImagePreviews();
    });
  });
}

function initMapPicker() {
  // Wait for Leaflet library to load
  if (typeof L === 'undefined') {
    setTimeout(initMapPicker, 100);
    return;
  }

  const mapElement = document.getElementById('map-picker');
  if (!mapElement) return;

  // Centro inicial por defecto (Madrid)
  let defaultCenter = { lat: 40.4168, lng: -3.7038 };
  let mapReady = false;

  // Inicializar mapa con Leaflet
  mapPicker = L.map(mapElement).setView([defaultCenter.lat, defaultCenter.lng], 13);

  // Agregar capa de OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(mapPicker);

  // Crear marcador inicial
  mapMarker = L.marker([defaultCenter.lat, defaultCenter.lng], {
  draggable: true,
  title: 'Ubicación de la incidencia'
  }).addTo(mapPicker);

// La ubicación inicial es solo visual. No cuenta como ubicación válida.
selectedLocation = null;
locationValidated = false;
  selectedLocation = defaultCenter;

  function updateLocationFromMarker() {
    const position = mapMarker.getLatLng();
    selectedLocation = { lat: position.lat, lng: position.lng };
    locationValidated = true;
    
    // Actualizar campos de lat/lon
    const latInput = document.getElementById('ubicacion-lat');
    const lonInput = document.getElementById('ubicacion-lon');
    
    if (latInput) latInput.value = selectedLocation.lat.toFixed(6);
    if (lonInput) lonInput.value = selectedLocation.lng.toFixed(6);
    
    // Usar OpenStreetMap Nominatim para reverse geocoding (sin API key requerida)
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${selectedLocation.lat}&lon=${selectedLocation.lng}`, {
      headers: { 'Accept': 'application/json' }
    })
      .then(res => res.json())
      .then(data => {
        const addressData = data.address || {};
        
        // Autocomplete los campos de dirección individual
        const municipioInput = document.getElementById('ubicacion-municipio');
        const calleInput = document.getElementById('ubicacion-calle');
        const numeroInput = document.getElementById('ubicacion-numero');
        const cpInput = document.getElementById('ubicacion-cp');
        const addressInput = document.getElementById('ubicacion-formatted-address');
        const placeIdInput = document.getElementById('ubicacion-place-id');
        
        // Municipio: buscar city, town, village, o county
        if (municipioInput) {
          municipioInput.value = addressData.city || addressData.town || addressData.village || addressData.county || '';
        }
        
        // Calle: road o highway
        if (calleInput) {
          calleInput.value = addressData.road || addressData.highway || '';
        }
        
        // Número: house_number
        if (numeroInput) {
          numeroInput.value = addressData.house_number || '';
        }
        
        // Código postal
        if (cpInput) {
          cpInput.value = addressData.postcode || '';
        }
        
        // Dirección formateada y placeId
        if (addressInput) {
          addressInput.value = data.display_name || '';
        }
        if (placeIdInput) {
          placeIdInput.value = data.osm_id || '';
        }
      })
      .catch(err => {
        // Si falla el reverse geocoding, solo mostramos las coordenadas
        console.warn('Reverse geocoding no disponible:', err);
        const addressInput = document.getElementById('ubicacion-formatted-address');
        if (addressInput) {
          addressInput.value = `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`;
        }
      });
  }

  // Actualizar cuando el marcador se arrastra
  mapMarker.on('dragend', updateLocationFromMarker);

  // Permitir hacer click en el mapa para establecer la ubicacion
  mapPicker.on('click', (event) => {
    mapMarker.setLatLng(event.latlng);
    updateLocationFromMarker();
  });

  // Solicitar ubicacion actual del usuario
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        // Centrar mapa en la ubicacion del usuario
        mapPicker.setView([userLat, userLng], 16);
        mapMarker.setLatLng([userLat, userLng]);
        
        selectedLocation = { lat: userLat, lng: userLng };
        updateLocationFromMarker();
      },
      (error) => {
        // Si hay error o el usuario deniega permiso, usar ubicacion por defecto
        console.warn('Geolocation no disponible o denegada:', error);
        updateLocationFromMarker();
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  } else {
    // Navegador no soporta geolocation
    console.warn('Geolocation no soportada en este navegador');
    updateLocationFromMarker();
  }
}

async function validateTypedAddress() {
  const municipio = document.getElementById('ubicacion-municipio').value.trim();
  const calle = document.getElementById('ubicacion-calle').value.trim();
  const numero = document.getElementById('ubicacion-numero').value.trim();
  const cp = document.getElementById('ubicacion-cp').value.trim();

  if (!municipio || !calle || !numero || !cp) {
    alert('Debes completar municipio, calle, número y código postal');
    return false;
  }

  const query = `${calle} ${numero}, ${cp}, ${municipio}, España`;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=es&q=${encodeURIComponent(query)}`,
      { headers: { 'Accept': 'application/json' } }
    );

    const results = await response.json();

    if (!results || results.length === 0) {
      alert('No se ha podido localizar la dirección indicada en el mapa');
      return false;
    }

    const result = results[0];
    const lat = Number(result.lat);
    const lon = Number(result.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      alert('La dirección no devuelve coordenadas válidas');
      return false;
    }

    // Comunidad de Madrid aproximada
    if (lat < 39.8 || lat > 41.2 || lon < -4.6 || lon > -3.0) {
      alert('La ubicación indicada está fuera del área de trabajo permitida');
      return false;
    }

    selectedLocation = { lat, lng: lon };
    locationValidated = true;

    document.getElementById('ubicacion-lat').value = lat.toFixed(6);
    document.getElementById('ubicacion-lon').value = lon.toFixed(6);
    document.getElementById('ubicacion-formatted-address').value = result.display_name || query;
    document.getElementById('ubicacion-place-id').value = result.osm_id || '';

    if (mapPicker && mapMarker) {
      mapPicker.setView([lat, lon], 17);
      mapMarker.setLatLng([lat, lon]);
    }

    return true;
  } catch (error) {
    console.error(error);
    alert('Error al validar la dirección en el mapa');
    return false;
  }
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
        <div class="max-w-3xl mx-auto">
          <h1 class="text-3xl font-bold text-slate-900 mb-6">Reportar incidencia</h1>

          <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <form id="incident-form" class="space-y-5">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Título</label>
                <input id="incident-title" type="text" maxlength="160" required class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Descripcion</label>
                <textarea id="incident-description" maxlength="1000" required class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700 min-h-[120px] resize-none"></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Categoría</label>
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
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Imágenes (máximo 3)</label>
                <div id="drag-drop-zone" class="border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 text-center cursor-pointer hover:border-brand-500 hover:bg-blue-50 transition">
                  <input id="image-input" type="file" multiple accept="image/*" class="hidden" />
                  <div class="flex flex-col items-center gap-2">
                    <i data-lucide="cloud-upload" style="width:24px;height:24px;color:#64748b;"></i>
                    <p class="text-sm font-semibold text-slate-700">Arrastra imágenes aqui</p>
                    <p class="text-xs text-slate-500">o haz clic para seleccionar</p>
                  </div>
                </div>
                <div id="image-previews" class="mt-3 grid grid-cols-3 gap-3">
                  <p class="text-slate-400 text-sm">No hay imágenes seleccionadas</p>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Ubicación en el mapa</label>
                <div id="map-picker" class="rounded-xl border border-slate-200"></div>
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

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Número</label>
                  <input id="ubicacion-numero" type="number" required class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Código postal</label>
                  <input id="ubicacion-cp" type="text" maxlength="5" inputmode="numeric" pattern="[0-9]{5}" required class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700" />
                </div>
              </div>

              <!-- Campos ocultos para latitud y longitud -->
              <input id="ubicacion-lat" type="hidden" required />
              <input id="ubicacion-lon" type="hidden" required />

              <!-- Campos ocultos para formattedAddress y placeId -->
              <input id="ubicacion-formatted-address" type="hidden" />
              <input id="ubicacion-place-id" type="hidden" />

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
  setTimeout(initMapPicker, 200);
}

function attachNewIncidentEvents() {
  const logoutBtn = document.getElementById('logout-btn');
  const backDashboardBtn = document.getElementById('back-dashboard-btn');
  const form = document.getElementById('incident-form');
  const dragDropZone = document.getElementById('drag-drop-zone');
  const imageInput = document.getElementById('image-input');

  ['ubicacion-municipio', 'ubicacion-calle', 'ubicacion-numero', 'ubicacion-cp'].forEach(id => {
  const input = document.getElementById(id);
  if (!input) return;

  input.addEventListener('input', () => {
    locationValidated = false;
    selectedLocation = null;

    document.getElementById('ubicacion-lat').value = '';
    document.getElementById('ubicacion-lon').value = '';
    document.getElementById('ubicacion-formatted-address').value = '';
    document.getElementById('ubicacion-place-id').value = '';
  });
});


  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  });

  backDashboardBtn.addEventListener('click', () => {
    window.location.href = getRoleHomePath();
  });

  // Manejo del drag-drop
  dragDropZone.addEventListener('click', () => imageInput.click());

  dragDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragDropZone.classList.add('border-brand-500', 'bg-blue-50');
  });

  dragDropZone.addEventListener('dragleave', () => {
    dragDropZone.classList.remove('border-brand-500', 'bg-blue-50');
  });

  dragDropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dragDropZone.classList.remove('border-brand-500', 'bg-blue-50');
    await addImagesToForm(Array.from(e.dataTransfer.files));
  });

  imageInput.addEventListener('change', async (e) => {
    await addImagesToForm(Array.from(e.target.files));
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!locationValidated) {
    const addressOk = await validateTypedAddress();
    if (!addressOk) {
      return;
    }
  }

    const payload = {
      title: document.getElementById('incident-title').value.trim(),
      description: document.getElementById('incident-description').value.trim(),
      category: document.getElementById('incident-category').value,
      ubicacion: {
        municipio: document.getElementById('ubicacion-municipio').value.trim(),
        calle: document.getElementById('ubicacion-calle').value.trim(),
        numero: Number(document.getElementById('ubicacion-numero').value),
        codigoPostal: Number(document.getElementById('ubicacion-cp').value),
        latitud: Number(document.getElementById('ubicacion-lat').value),
        longitud: Number(document.getElementById('ubicacion-lon').value),
        formattedAddress: document.getElementById('ubicacion-formatted-address').value || null,
        placeId: document.getElementById('ubicacion-place-id').value || null
      },
      images: selectedImages
    };

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.text();
        alert('Error: ' + (error || 'No se pudo crear la incidencia'));
        return;
      }

      window.location.href = getRoleHomePath();
    } catch (error) {
      alert('Error al enviar la incidencia');
      console.error(error);
    }
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

