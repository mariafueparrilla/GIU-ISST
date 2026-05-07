let currentUser = null;
let incidentDetail = null;
let map = null;
let reportDraftImages = [];
let suppressOperatorReviewBlock = false;

const leafletZIndexFix = document.createElement("style");
leafletZIndexFix.textContent = `
  .leaflet-container,
  .leaflet-pane,
  .leaflet-top,
  .leaflet-bottom {
    z-index: 0 !important;
  }
`;
document.head.appendChild(leafletZIndexFix);

const roleMap = {
  admin: "Admin",
  user: "Usuario",
  operator: "Operario",
  technician: "Tecnico",
};

const stateLabelMap = {
  creada: "Creada",
  asignada: "Asignada",
  en_curso: "En curso",
  resuelta: "Resuelta",
  rechazada: "Rechazada",
  cerrada: "Cerrada",
};

const priorityColorMap = {
  baja: "bg-slate-100 text-slate-700",
  media: "bg-blue-100 text-blue-700",
  alta: "bg-orange-100 text-orange-700",
  critica: "bg-red-100 text-red-700",
};

const stateColorMap = {
  creada: "bg-amber-100 text-amber-700",
  asignada: "bg-teal-100 text-teal-700",
  en_curso: "bg-blue-100 text-blue-700",
  resuelta: "bg-emerald-100 text-emerald-700",
  rechazada: "bg-red-100 text-red-700",
  cerrada: "bg-slate-200 text-slate-700",
};

function getIncidentIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function loadSessionUser() {
  const response = await fetch("/api/auth/me", { credentials: "same-origin" });
  if (!response.ok) {
    throw new Error("Sesion no valida");
  }

  currentUser = await response.json();
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
}

async function loadIncidentDetail() {
  const incidentId = getIncidentIdFromURL();
  if (!incidentId) {
    throw new Error("ID de incidencia no proporcionado");
  }

  const response = await fetch(`/api/incidents/${encodeURIComponent(incidentId)}`, {
    credentials: "same-origin"
  });
  
  if (!response.ok) {
    throw new Error("No se pudo cargar la incidencia");
  }

  incidentDetail = await response.json();
  if (incidentDetail?.state !== 'resuelta') {
    suppressOperatorReviewBlock = false;
  }
}

function initMap() {
  // Wait for Leaflet library to load
  if (typeof L === 'undefined') {
    setTimeout(initMap, 100);
    return;
  }

  if (!incidentDetail || !incidentDetail.ubicacion) {
    return;
  }

  const mapElement = document.getElementById("incident-map");
  if (!mapElement) {
    return;
  }

  const lat = incidentDetail.ubicacion.latitud;
  const lng = incidentDetail.ubicacion.longitud;

  // Inicializar mapa con Leaflet
  map = L.map(mapElement).setView([lat, lng], 15);

  // Agregar capa de OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  // Agregar marcador
  L.marker([lat, lng], {
    title: incidentDetail.title
  }).addTo(map);
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }) + " " + date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderReportImagePreviews() {
  const container = document.getElementById("detail-report-image-previews");
  if (!container) return;

  if (reportDraftImages.length === 0) {
    container.innerHTML = '<p class="text-sm text-slate-400">Todavia no has seleccionado imágenes.</p>';
    return;
  }

  container.innerHTML = reportDraftImages.map((img, idx) => `
    <div class="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <img src="data:${img.mimeType};base64,${img.imageData}" alt="Informe ${idx + 1}" class="w-full h-32 object-cover" />
      <button type="button" data-idx="${idx}" class="remove-detail-report-image-btn absolute top-2 right-2 rounded-full bg-white/90 p-1 text-slate-700 shadow hover:bg-white">
        <i data-lucide="x" style="width:14px;height:14px;"></i>
      </button>
      <p class="px-2 py-1 text-xs text-slate-500 bg-slate-50 truncate">${img.filename}</p>
    </div>
  `).join("");

  lucide.createIcons();

  document.querySelectorAll(".remove-detail-report-image-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const idx = Number(button.dataset.idx);
      reportDraftImages.splice(idx, 1);
      renderReportImagePreviews();
    });
  });
}

function openDetailReportModal() {
  reportDraftImages = [];
  const modal = document.getElementById("detail-report-modal");
  const description = document.getElementById("detail-report-description");
  const imagesInput = document.getElementById("detail-report-images-input");

  if (!modal) return;
  if (description) description.value = "";
  if (imagesInput) imagesInput.value = "";

  renderReportImagePreviews();
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeDetailReportModal() {
  reportDraftImages = [];
  const modal = document.getElementById("detail-report-modal");
  const description = document.getElementById("detail-report-description");
  const imagesInput = document.getElementById("detail-report-images-input");

  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
  if (description) description.value = "";
  if (imagesInput) imagesInput.value = "";
}

async function addDetailReportImages(files) {
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      alert("Solo se permiten archivos de imagen");
      continue;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no puede exceder 5MB");
      continue;
    }

    if (reportDraftImages.length >= 3) {
      alert("El informe admite como máximo 3 imágenes");
      break;
    }

    const base64 = await fileToBase64(file);
    reportDraftImages.push({
      filename: file.name,
      mimeType: file.type,
      imageData: base64,
      fileSize: file.size
    });
  }

  renderReportImagePreviews();
}

async function submitTechnicianDetailReport() {
  if (!incidentDetail?.id) return;
  if (reportDraftImages.length === 0) {
    alert("Debes adjuntar al menos una imagen");
    return;
  }

  const submitBtn = document.getElementById("detail-report-submit");
  const description = document.getElementById("detail-report-description")?.value?.trim() || "";
  if (submitBtn) submitBtn.disabled = true;

  try {
    const reportResponse = await fetch(`/api/incidents/${encodeURIComponent(incidentDetail.id)}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        description,
        images: reportDraftImages
      })
    });

    if (!reportResponse.ok) {
      let message = "No se pudo guardar el informe";
      try {
        const errorData = await reportResponse.json();
        if (errorData.message) message = errorData.message;
      } catch {
        try {
          message = await reportResponse.text();
        } catch {
          // keep default
        }
      }
      alert(message);
      return;
    }

    incidentDetail.operatorReviewComment = null;
    incidentDetail.operatorReviewDate = null;
    incidentDetail.operatorReviewDni = null;
    suppressOperatorReviewBlock = true;
    renderIncidentDetail();

    const resolveResponse = await fetch(`/api/incidents/${encodeURIComponent(incidentDetail.id)}/team-state`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ state: "RESUELTA" })
    });

    if (!resolveResponse.ok) {
      let message = "El informe se guardó, pero no se pudo marcar la incidencia como resuelta";
      try {
        const errorData = await resolveResponse.json();
        if (errorData.message) message = errorData.message;
      } catch {
        try {
          message = await resolveResponse.text();
        } catch {
          // keep default
        }
      }
      alert(message);
      return;
    }

    closeDetailReportModal();
    await loadIncidentDetail();
    renderIncidentDetail();
  } catch (error) {
    console.error(error);
    alert(error.message || "No se pudo guardar el informe");
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

function renderIncidentDetail() {
  const app = document.getElementById("app");

  const previewImages = incidentDetail.images && incidentDetail.images.length > 0
    ? incidentDetail.images.map((img, idx) => `
        <div class="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <img src="data:${img.mimeType};base64,${img.imageData}" alt="Imagen ${idx + 1}" class="w-full h-auto object-cover max-h-48" />
          <p class="text-xs text-slate-400 px-2 py-1 bg-slate-50">${img.filename}</p>
        </div>
      `).join("")
    : `<div class="text-center py-12 text-slate-400">No hay imágenes disponibles</div>`;

  app.innerHTML = `
    <div class="min-h-full bg-surface-50">
      <header class="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button id="back-btn" class="text-slate-600 hover:text-slate-900">
            <i data-lucide="arrow-left" style="width:18px;height:18px;"></i>
          </button>
          <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:#1468f5;">
            <i data-lucide="map-pin" style="width:18px;height:18px;color:white;"></i>
          </div>
          <span class="font-mono-brand text-xl font-bold text-slate-900">urFIX</span>
        </div>

        <div class="flex items-center gap-3 text-sm text-slate-600">
          <i data-lucide="user-circle-2" style="width:18px;height:18px;"></i>
          <span>${currentUser?.name || "Usuario"}</span>
          <button id="logout-btn" class="ml-2 text-slate-500 hover:text-slate-700">
            <i data-lucide="log-out" style="width:18px;height:18px;"></i>
          </button>
        </div>
      </header>

      <main class="px-6 py-8">
        <div class="max-w-4xl mx-auto">
          <!-- Titulo y estado -->
          <div class="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-slate-200">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h1 class="text-3xl font-bold text-slate-900">${incidentDetail.title}</h1>
                <p class="text-sm text-slate-500 mt-1">#${incidentDetail.id}</p>
              </div>
              <div class="flex items-center gap-2 flex-wrap justify-end">
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${priorityColorMap[incidentDetail.priority] || 'bg-slate-100'}">
                  ${incidentDetail.priority?.toUpperCase() || 'N/A'}
                </span>
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${stateColorMap[incidentDetail.state] || 'bg-slate-100'}">
                  ${stateLabelMap[incidentDetail.state] || incidentDetail.state}
                </span>
              </div>
            </div>

            <p class="text-slate-600 mb-4">${incidentDetail.description}</p>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p class="text-slate-500 font-medium">Categoría</p>
                <p class="text-slate-900">${incidentDetail.category?.toUpperCase() || 'N/A'}</p>
              </div>
              <div>
                <p class="text-slate-500 font-medium">Creador</p>
                <p class="text-slate-900">${incidentDetail.creatorDni || incidentDetail.creatorName}</p>
              </div>
              <div>
                <p class="text-slate-500 font-medium">Fecha de creación</p>
                <p class="text-slate-900">${formatDate(incidentDetail.creationInstant)}</p>
              </div>
              <div>
                <p class="text-slate-500 font-medium">Equipo asignado</p>
                <p class="text-slate-900">${incidentDetail.assignedTeam?.toUpperCase() || 'Sin asignar'}</p>
              </div>
            </div>
          </div>

          <!-- Imágenes -->
          <div class="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-slate-200">
            <h2 class="text-xl font-bold text-slate-900 mb-4">Imágenes</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              ${previewImages}
            </div>
          </div>

          <!-- Ubicación y mapa -->
          <div class="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-slate-200">
            <h2 class="text-xl font-bold text-slate-900 mb-4">Ubicacion</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div class="space-y-3 text-sm">
                  <div>
                    <p class="text-slate-500 font-medium">Municipio</p>
                    <p class="text-slate-900">${incidentDetail.ubicacion.municipio}</p>
                  </div>
                  <div>
                    <p class="text-slate-500 font-medium">Calle</p>
                    <p class="text-slate-900">${incidentDetail.ubicacion.calle}, ${incidentDetail.ubicacion.numero}</p>
                  </div>
                  <div>
                    <p class="text-slate-500 font-medium">Código postal</p>
                    <p class="text-slate-900">${incidentDetail.ubicacion.codigoPostal}</p>
                  </div>
                  <div>
                    <p class="text-slate-500 font-medium">Dirección formateada</p>
                    <p class="text-slate-900">${incidentDetail.ubicacion.formattedAddress || 'No disponible'}</p>
                  </div>
                  <div>
                    <p class="text-slate-500 font-medium">Coordenadas</p>
                    <p class="text-slate-900">${incidentDetail.ubicacion.latitud.toFixed(4)}, ${incidentDetail.ubicacion.longitud.toFixed(4)}</p>
                  </div>
                </div>
              </div>

              <div>
                <div id="incident-map" class="rounded-xl border border-slate-200"></div>
              </div>
            </div>
          </div>

          <!-- Hitos temporales -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
            <h2 class="text-xl font-bold text-slate-900 mb-4">Hitos</h2>
            
            <div class="space-y-3 text-sm">
              <div>
                <p class="text-slate-500 font-medium">Creacion</p>
                <p class="text-slate-900">${formatDate(incidentDetail.creationInstant)} - ${incidentDetail.creatorDni || incidentDetail.creatorName || '-'}</p>
              </div>
              ${incidentDetail.asignationDate ? `<div>
                <p class="text-slate-500 font-medium">Asignación</p>
                <p class="text-slate-900">${formatDate(incidentDetail.asignationDate)} - ${incidentDetail.assignerDni || '-'}</p>
              </div>` : ''}
              ${incidentDetail.resolutionDate ? `<div>
                <p class="text-slate-500 font-medium">Resolución</p>
                <p class="text-slate-900">${formatDate(incidentDetail.resolutionDate)} - ${incidentDetail.resolverDni || '-'}</p>
              </div>` : ''}
              ${incidentDetail.rejectionDate ? `<div>
                <p class="text-slate-500 font-medium">Rechazo</p>
                <p class="text-slate-900">${formatDate(incidentDetail.rejectionDate)} - ${incidentDetail.rejecterDni || '-'}</p>
              </div>` : ''}
              ${incidentDetail.closingDate ? `<div>
                <p class="text-slate-500 font-medium">Cierre</p>
                <p class="text-slate-900">${formatDate(incidentDetail.closingDate)} - ${incidentDetail.closerDni || '-'}</p>
              </div>` : ''}
            </div>
          </div>

          ${incidentDetail.report ? `
          <!-- Informe técnico -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
            <div class="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 class="text-xl font-bold text-slate-900">Informe técnico</h2>
                <p class="text-sm text-slate-500 mt-1">${formatDate(incidentDetail.report.reportInstant)} - ${incidentDetail.report.senderName || incidentDetail.report.senderDni || '-'}</p>
              </div>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Reporte del técnico</span>
            </div>

            ${incidentDetail.report.description ? `<p class="text-slate-700 mb-4 whitespace-pre-line">${incidentDetail.report.description}</p>` : `<p class="text-slate-400 mb-4">Sin descripción adicional</p>`}

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              ${(incidentDetail.report.images || []).map((img, idx) => `
                <div class="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                  <img src="data:${img.mimeType};base64,${img.imageData}" alt="Informe ${idx + 1}" class="w-full h-auto object-cover max-h-48" />
                  <p class="text-xs text-slate-400 px-2 py-1 bg-slate-50">${img.filename}</p>
                </div>
              `).join("")}
            </div>
          </div>
          ` : ''}

          ${incidentDetail.operatorReviewComment && !suppressOperatorReviewBlock ? `
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
            <h2 class="text-xl font-bold text-slate-900 mb-4">Comentario del operario</h2>
            <div class="rounded-2xl bg-amber-50 border border-amber-200 p-4">
              <p class="text-sm text-amber-700 font-semibold mb-1">${formatDate(incidentDetail.operatorReviewDate)} - ${incidentDetail.operatorReviewDni || '-'}</p>
              <p class="text-slate-700 whitespace-pre-line">${incidentDetail.operatorReviewComment}</p>
            </div>
          </div>
          ` : ''}

          ${currentUser?.role === 'operator' && incidentDetail.state === 'resuelta' ? `
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
            <h2 class="text-xl font-bold text-slate-900 mb-4">Revisión de resolución</h2>
            <p class="text-sm text-slate-500 mb-4">Comprueba el informe técnico antes de confirmar o rechazar la resolución.</p>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2" for="operator-review-comment">Motivo del rechazo</label>
                <textarea id="operator-review-comment" rows="4" class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700" placeholder="Escribe por qué la incidencia vuelve al equipo técnico"></textarea>
              </div>

              <div class="flex flex-wrap gap-3">
                <button id="confirm-resolution-btn" type="button" class="px-4 py-3 rounded-xl text-white font-semibold" style="background:#1468f5;">Confirmar y cerrar</button>
                <button id="reject-resolution-btn" type="button" class="px-4 py-3 rounded-xl text-white font-semibold" style="background:#b91c1c;">No concluida</button>
              </div>
            </div>
          </div>
          ` : ''}

          ${currentUser?.role === 'operator' && (incidentDetail.state === 'CREADA' || incidentDetail.state === 'creada') ? `
          <!-- Acciones del operario -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 class="text-xl font-bold text-slate-900 mb-4">Validar y Asignar</h2>
            
            <form id="operator-validation-form" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Prioridad</label>
                  <select id="operator-priority-select" class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700" required>
                    <option value="">Selecciona prioridad</option>
                    <option value="BAJA">Baja</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta</option>
                    <option value="CRITICA">Crítica</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Equipo Técnico</label>
                  <select id="operator-team-select" class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-surface-50 text-sm text-slate-700" required>
                    <option value="">Selecciona equipo</option>
                    <option value="ALUMBRADO">Alumbrado</option>
                    <option value="LIMPIEZA">Limpieza</option>
                    <option value="MOVILIDAD">Movilidad</option>
                    <option value="AGUA">Agua</option>
                    <option value="RESIDUOS">Residuos</option>
                    <option value="MOBILIARIO">Mobiliario</option>
                    <option value="OTROS">Otros</option>
                  </select>
                </div>
              </div>
              
              <div class="flex gap-3 pt-4">
                <button id="validate-incident-btn" type="button" class="px-4 py-3 rounded-xl text-white font-semibold" style="background:#0f766e;">
                  <i data-lucide="check-circle" style="width:16px;height:16px;display:inline;margin-right:6px;"></i>
                  Validar y Asignar
                </button>
                <button id="reject-incident-btn" type="button" class="px-4 py-3 rounded-xl text-white font-semibold" style="background:#b91c1c;">
                  <i data-lucide="x-circle" style="width:16px;height:16px;display:inline;margin-right:6px;"></i>
                  Rechazar incidencia
                </button>
              </div>
            </form>
          </div>
          ` : ''}

          ${currentUser?.role === 'technician' && incidentDetail.state === 'en_curso' ? `
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
            <h2 class="text-xl font-bold text-slate-900 mb-2">Accion tecnica</h2>
            <p class="text-sm text-slate-500 mb-4">Completa el informe técnico para marcar la incidencia como resuelta.</p>
            <button id="tech-fill-report-btn" type="button" class="px-4 py-3 rounded-xl text-white font-semibold" style="background:#1468f5;">Rellenar informe</button>
          </div>
          ` : ''}
        </div>

        <div id="detail-report-modal" class="fixed inset-0 z-[9999] hidden items-center justify-center bg-slate-950/60 px-4">
          <div class="relative z-[10000] w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
              <div>
                <h2 class="text-xl font-bold text-slate-900">Rellenar informe</h2>
                <p class="text-sm text-slate-500">Completa el informe técnico antes de marcar la incidencia como resuelta.</p>
              </div>
              <button id="detail-report-close" type="button" class="text-slate-500 hover:text-slate-900">
                <i data-lucide="x" style="width:20px;height:20px;"></i>
              </button>
            </div>

            <div class="p-6 space-y-5 overflow-y-auto flex-1">
              <div>
                <label for="detail-report-description" class="block text-sm font-semibold text-slate-700 mb-2">Descripción del informe</label>
                <textarea id="detail-report-description" rows="4" class="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Describe brevemente lo que has comprobado o reparado"></textarea>
              </div>

              <div>
                <label for="detail-report-images-input" class="block text-sm font-semibold text-slate-700 mb-2">Imágenes obligatorias</label>
                <input id="detail-report-images-input" type="file" accept="image/*" multiple class="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100" />
                <p class="mt-2 text-xs text-slate-400">Minimo 1 y máximo 3 imágenes.</p>
              </div>

              <div>
                <p class="text-sm font-semibold text-slate-700 mb-3">Previsualización</p>
                <div id="detail-report-image-previews" class="grid grid-cols-1 sm:grid-cols-3 gap-3"></div>
              </div>
            </div>

            <div class="flex flex-wrap justify-end gap-3 px-6 py-4 border-t border-slate-200 flex-shrink-0">
              <button id="detail-report-cancel" type="button" class="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50">Cancelar</button>
              <button id="detail-report-submit" type="button" class="px-4 py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600">Guardar informe</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  lucide.createIcons();
  attachDetailEvents();
  setTimeout(initMap, 200);
}

async function updateIncidentState(incidentId, state, fallbackMessage) {
  const response = await fetch(`/api/incidents/${encodeURIComponent(incidentId)}/state`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ state })
  });

  if (!response.ok) {
    const message = await response.text();
    alert(message || fallbackMessage);
    return false;
  }

  return true;
}

function attachDetailEvents() {
  const backBtn = document.getElementById("back-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const validateBtn = document.getElementById("validate-incident-btn");
  const rejectBtn = document.getElementById("reject-incident-btn");
  const confirmResolutionBtn = document.getElementById("confirm-resolution-btn");
  const rejectResolutionBtn = document.getElementById("reject-resolution-btn");
  const reviewComment = document.getElementById("operator-review-comment");
  const techFillReportBtn = document.getElementById("tech-fill-report-btn");
  const detailReportModal = document.getElementById("detail-report-modal");
  const detailReportClose = document.getElementById("detail-report-close");
  const detailReportCancel = document.getElementById("detail-report-cancel");
  const detailReportSubmit = document.getElementById("detail-report-submit");
  const detailReportImagesInput = document.getElementById("detail-report-images-input");

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.history.back();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      localStorage.removeItem("currentUser");
      window.location.href = "/login";
    });
  }

  if (validateBtn) {
    validateBtn.addEventListener("click", async () => {
      if (validateBtn.disabled) {
        return;
      }
      const priority = document.getElementById("operator-priority-select")?.value;
      const team = document.getElementById("operator-team-select")?.value;
      
      if (!priority || !team) {
        alert("Debes seleccionar prioridad y equipo");
        return;
      }

      validateBtn.disabled = true;
      try {
        const response = await fetch(`/api/incidents/${encodeURIComponent(incidentDetail.id)}/operator-validate`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ priority, team })
        });

        if (!response.ok) {
          const message = await response.text();
          alert(message || 'No se pudo validar y asignar la incidencia');
          return;
        }

        window.location.href = '/operator-dashboard';
      } finally {
        validateBtn.disabled = false;
      }
    });
  }

  if (rejectBtn) {
    rejectBtn.addEventListener("click", async () => {
      rejectBtn.disabled = true;
      try {
        await updateIncidentState(incidentDetail.id, 'RECHAZADA', 'No se pudo rechazar la incidencia');
        window.location.href = '/operator-dashboard';
      } finally {
        rejectBtn.disabled = false;
      }
    });
  }

  if (confirmResolutionBtn) {
    confirmResolutionBtn.addEventListener("click", async () => {
      confirmResolutionBtn.disabled = true;
      try {
        const response = await fetch(`/api/incidents/${encodeURIComponent(incidentDetail.id)}/review-resolution`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ approved: true, comment: '' })
        });

        if (!response.ok) {
          const message = await response.text();
          alert(message || 'No se pudo confirmar la resolucion');
          return;
        }

        window.location.href = '/operator-dashboard';
      } finally {
        confirmResolutionBtn.disabled = false;
      }
    });
  }

  if (rejectResolutionBtn) {
    rejectResolutionBtn.addEventListener("click", async () => {
      const comment = reviewComment?.value?.trim() || '';
      if (!comment) {
        alert('Debes escribir un motivo para rechazar la resolución');
        return;
      }

      rejectResolutionBtn.disabled = true;
      try {
        const response = await fetch(`/api/incidents/${encodeURIComponent(incidentDetail.id)}/review-resolution`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ approved: false, comment })
        });

        if (!response.ok) {
          const message = await response.text();
          alert(message || 'No se pudo rechazar la resolución');
          return;
        }

        window.location.href = '/operator-dashboard';
      } finally {
        rejectResolutionBtn.disabled = false;
      }
    });
  }

  if (techFillReportBtn) {
    techFillReportBtn.addEventListener("click", openDetailReportModal);
  }

  if (detailReportModal) {
    detailReportModal.addEventListener("click", (event) => {
      if (event.target === detailReportModal) {
        closeDetailReportModal();
      }
    });
  }

  if (detailReportClose) {
    detailReportClose.addEventListener("click", closeDetailReportModal);
  }

  if (detailReportCancel) {
    detailReportCancel.addEventListener("click", closeDetailReportModal);
  }

  if (detailReportSubmit) {
    detailReportSubmit.addEventListener("click", submitTechnicianDetailReport);
  }

  if (detailReportImagesInput) {
    detailReportImagesInput.addEventListener("change", async (event) => {
      const files = Array.from(event.target.files || []);
      await addDetailReportImages(files);
      detailReportImagesInput.value = "";
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadSessionUser();
    await loadIncidentDetail();
    renderIncidentDetail();
  } catch (error) {
    console.error(error);
    alert(error.message || "Error cargando la incidencia");
    window.history.back();
  }
});
