let currentUser = null;
let incidentDetail = null;

const roleMap = {
  admin: 'Admin',
  operator: 'Operario',
  technician: 'Tecnico',
  user: 'Usuario'
};

function getIncidentIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function loadSessionUser() {
  const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error('Sesión no válida');
  }

  currentUser = await response.json();
}

async function loadIncidentDetail() {
  const incidentId = getIncidentIdFromURL();
  if (!incidentId) {
    throw new Error('ID de incidencia no proporcionado');
  }

  const response = await fetch(`/api/incidents/${encodeURIComponent(incidentId)}`, {
    credentials: 'same-origin'
  });

  if (!response.ok) {
    throw new Error('No se pudo cargar la incidencia');
  }

  incidentDetail = await response.json();
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) + ' ' + date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getPdfImageFormat(mimeType) {
  if (!mimeType) return 'JPEG';
  if (mimeType.toLowerCase().includes('png')) return 'PNG';
  return 'JPEG';
}

function renderCreateReport() {
  const app = document.getElementById('app');
  const now = formatDate(new Date().toISOString());
  const knownDescription = incidentDetail.report?.description || incidentDetail.description || '';
  const knownResolution = incidentDetail.report ? 'Informe ya registrado. Ajusta la descripción de resolución si procede.' : '';

  app.innerHTML = `
    <div class="min-h-full bg-surface-50">
      <header class="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button id="back-btn" class="text-slate-600 hover:text-slate-900">
            <i data-lucide="arrow-left" style="width:18px;height:18px;"></i>
          </button>
          <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:#1468f5;">
            <i data-lucide="file-text" style="width:18px;height:18px;color:white;"></i>
          </div>
          <span class="font-mono-brand text-xl font-bold text-slate-900">Crear informe</span>
        </div>

        <div class="flex items-center gap-3 text-sm text-slate-600">
          <i data-lucide="user-circle-2" style="width:18px;height:18px;"></i>
          <span>${currentUser?.name || 'Usuario'}</span>
          <span class="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs">${roleMap[currentUser?.role] || 'N/A'}</span>
        </div>
      </header>

      <main class="px-6 py-8">
        <div class="max-w-5xl mx-auto space-y-6">
          <div class="bg-white rounded-3xl p-6 page-card border border-slate-200">
            <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 class="text-3xl font-bold text-slate-900 mb-1">Informe de incidencia</h1>
                <p class="text-slate-500">#${incidentDetail.id} · ${incidentDetail.title}</p>
              </div>
              <div class="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                Fecha informe: <span class="font-semibold text-slate-900">${now}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.6fr]">
            <div class="space-y-6">
              <section class="bg-white rounded-3xl p-6 page-card border border-slate-200">
                <h2 class="text-xl font-bold text-slate-900 mb-4">Datos de la incidencia</h2>
                <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <label class="block">
                    <span class="text-slate-600">Título</span>
                    <input id="report-title" type="text" value="${incidentDetail.title || ''}" class="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800" />
                  </label>
                  <label class="block">
                    <span class="text-slate-600">Categoría</span>
                    <input id="report-category" type="text" value="${incidentDetail.category?.toUpperCase() || ''}" class="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800" />
                  </label>
                  <label class="block">
                    <span class="text-slate-600">Prioridad</span>
                    <select id="report-priority" class="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800">
                      <option value="">Selecciona prioridad</option>
                      <option value="BAJA" ${incidentDetail.priority === 'baja' ? 'selected' : ''}>Baja</option>
                      <option value="MEDIA" ${incidentDetail.priority === 'media' ? 'selected' : ''}>Media</option>
                      <option value="ALTA" ${incidentDetail.priority === 'alta' ? 'selected' : ''}>Alta</option>
                      <option value="CRITICA" ${incidentDetail.priority === 'critica' ? 'selected' : ''}>Crítica</option>
                    </select>
                  </label>
                  <label class="block">
                    <span class="text-slate-600">Equipo técnico</span>
                    <select id="report-team" class="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800">
                      <option value="">Selecciona equipo</option>
                      <option value="ALUMBRADO" ${incidentDetail.assignedTeam === 'alumbrado' ? 'selected' : ''}>Alumbrado</option>
                      <option value="LIMPIEZA" ${incidentDetail.assignedTeam === 'limpieza' ? 'selected' : ''}>Limpieza</option>
                      <option value="MOVILIDAD" ${incidentDetail.assignedTeam === 'movilidad' ? 'selected' : ''}>Movilidad</option>
                      <option value="AGUA" ${incidentDetail.assignedTeam === 'agua' ? 'selected' : ''}>Agua</option>
                      <option value="RESIDUOS" ${incidentDetail.assignedTeam === 'residuos' ? 'selected' : ''}>Residuos</option>
                      <option value="MOBILIARIO" ${incidentDetail.assignedTeam === 'mobiliario' ? 'selected' : ''}>Mobiliario</option>
                      <option value="OTROS" ${incidentDetail.assignedTeam === 'otros' ? 'selected' : ''}>Otros</option>
                    </select>
                  </label>
                </div>

                <div class="mt-6 grid grid-cols-1 gap-4">
                  <label class="block">
                    <span class="text-slate-600">Descripción original</span>
                    <textarea id="report-incident-description" rows="4" class="mt-2 w-full rounded-3xl border border-slate-300 px-4 py-3 text-sm text-slate-800">${incidentDetail.description || ''}</textarea>
                  </label>
                  <label class="block">
                    <span class="text-slate-600">Resolución / Observaciones</span>
                    <textarea id="report-resolution" rows="5" placeholder="Describe cómo se resolvió la incidencia" class="mt-2 w-full rounded-3xl border border-slate-300 px-4 py-3 text-sm text-slate-800">${knownResolution}</textarea>
                  </label>
                </div>
              </section>

              <section class="bg-white rounded-3xl p-6 page-card border border-slate-200">
                <h2 class="text-xl font-bold text-slate-900 mb-4">Resumen previo</h2>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div class="rounded-3xl bg-slate-50 p-4">
                    <p class="text-slate-500 text-xs uppercase font-semibold">Creador</p>
                    <p class="mt-2 text-slate-900">${incidentDetail.creatorDni || 'N/A'}</p>
                  </div>
                  <div class="rounded-3xl bg-slate-50 p-4">
                    <p class="text-slate-500 text-xs uppercase font-semibold">Fecha creación</p>
                    <p class="mt-2 text-slate-900">${formatDate(incidentDetail.creationInstant)}</p>
                  </div>
                  <div class="rounded-3xl bg-slate-50 p-4">
                    <p class="text-slate-500 text-xs uppercase font-semibold">Estado actual</p>
                    <p class="mt-2 text-slate-900">${incidentDetail.state?.toUpperCase() || 'N/A'}</p>
                  </div>
                  <div class="rounded-3xl bg-slate-50 p-4">
                    <p class="text-slate-500 text-xs uppercase font-semibold">Ubicación</p>
                    <p class="mt-2 text-slate-900">${incidentDetail.ubicacion?.municipio || '-'} / ${incidentDetail.ubicacion?.calle || '-'} ${incidentDetail.ubicacion?.numero || ''}</p>
                  </div>
                </div>
              </section>
            </div>

            <aside class="space-y-6">
              <section class="bg-white rounded-3xl p-6 page-card border border-slate-200">
                <h2 class="text-xl font-bold text-slate-900 mb-4">Información extra</h2>
                <div class="space-y-3 text-sm text-slate-600">
                  <p><span class="font-semibold text-slate-900">Dirección:</span> ${incidentDetail.ubicacion?.formattedAddress || 'No disponible'}</p>
                  <p><span class="font-semibold text-slate-900">Coordenadas:</span> ${incidentDetail.ubicacion?.latitud?.toFixed(4) || '-'}, ${incidentDetail.ubicacion?.longitud?.toFixed(4) || '-'}</p>
                  <p><span class="font-semibold text-slate-900">Informe técnico existente:</span> ${incidentDetail.report ? 'Sí' : 'No'}</p>
                  <p class="text-slate-500">Puedes actualizar cualquier campo antes de descargar el PDF.</p>
                </div>
              </section>

              <section class="bg-white rounded-3xl p-6 page-card border border-slate-200">
                <h2 class="text-xl font-bold text-slate-900 mb-4">Imágenes de incidencia</h2>
                <div class="grid grid-cols-1 gap-3">
                  ${(incidentDetail.images || []).map(img => `
                    <div class="rounded-3xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img src="data:${img.mimeType};base64,${img.imageData}" alt="Imagen informe" class="w-full h-40 object-cover" />
                      <div class="px-4 py-3 text-xs text-slate-500">${img.filename}</div>
                    </div>
                  `).join('')}
                </div>
              </section>
            </aside>
          </div>

          <div class="bg-white rounded-3xl p-6 page-card border border-slate-200 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-slate-700 font-semibold">Una vez confirmes los cambios, el informe se descargará como PDF listo para compartir.</p>
            </div>
            <div class="flex flex-wrap gap-3">
              <button id="cancel-report-btn" class="px-5 py-3 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-50">Volver</button>
              <button id="generate-pdf-btn" class="px-5 py-3 rounded-2xl bg-brand-600 text-white font-semibold hover:bg-brand-500">Descargar PDF</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  lucide.createIcons();
  attachCreateReportEvents();
}

function getFieldValue(fieldId) {
  return document.getElementById(fieldId)?.value?.trim() || '';
}

function getReportContent() {
  return {
    title: getFieldValue('report-title'),
    category: getFieldValue('report-category'),
    priority: getFieldValue('report-priority'),
    team: getFieldValue('report-team'),
    incidentDescription: getFieldValue('report-incident-description'),
    resolutionDescription: getFieldValue('report-resolution'),
    reportDate: formatDate(new Date().toISOString())
  };
}

async function generatePdf() {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    alert('No se pudo generar el PDF. Intenta recargar la página.');
    return;
  }

  const meta = getReportContent();
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setFontSize(18);
  doc.text('Informe de incidencia', 15, 20);

  doc.setFontSize(11);
  const lines = [
    `ID incidencia: ${incidentDetail.id}`,
    `Título: ${meta.title}`,
    `Categoría: ${meta.category}`,
    `Prioridad: ${meta.priority}`,
    `Equipo técnico: ${meta.team}`,
    `Fecha informe: ${meta.reportDate}`,
    `Estado actual: ${incidentDetail.state?.toUpperCase() || 'N/A'}`,
    `Ubicación: ${incidentDetail.ubicacion?.formattedAddress || '-'} (${incidentDetail.ubicacion?.latitud?.toFixed(4) || '-'}, ${incidentDetail.ubicacion?.longitud?.toFixed(4) || '-'})`,
    `Creador: ${incidentDetail.creatorDni || 'N/A'}`,
    `Fecha de creación: ${formatDate(incidentDetail.creationInstant)}`
  ];

  doc.text(doc.splitTextToSize(lines.join('\n'), 180), 15, 32);

  let nextY = 32 + lines.length * 6 + 8;
  doc.setFontSize(12);
  doc.text('Descripción de la incidencia', 15, nextY);
  doc.setFontSize(10);
  nextY += 6;
  doc.text(doc.splitTextToSize(meta.incidentDescription || 'No hay descripción', 180), 15, nextY);

  const resolutionLines = doc.splitTextToSize(meta.resolutionDescription || 'No hay texto de resolución', 180);
  nextY += resolutionLines.length * 6 + 10;
  doc.setFontSize(12);
  doc.text('Resolución / Observaciones', 15, nextY);
  doc.setFontSize(10);
  nextY += 6;
  doc.text(resolutionLines, 15, nextY);

  const imageList = incidentDetail.images || [];
  for (const img of imageList) {
    if (nextY > 240) {
      doc.addPage();
      nextY = 20;
    }

    try {
      const mime = getPdfImageFormat(img.mimeType);
      const imgDataUrl = `data:${img.mimeType};base64,${img.imageData}`;
      doc.addImage(imgDataUrl, mime, 15, nextY, 180, 100, undefined, 'FAST');
      nextY += 105;
    } catch (error) {
      console.warn('No se pudo incrustar imagen en PDF:', error);
    }
  }

  const filename = `informe-incidencia-${incidentDetail.id}.pdf`;
  doc.save(filename);
}

function attachCreateReportEvents() {
  const backBtn = document.getElementById('back-btn');
  const cancelBtn = document.getElementById('cancel-report-btn');
  const generateBtn = document.getElementById('generate-pdf-btn');

  if (backBtn) {
    backBtn.addEventListener('click', () => window.history.back());
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => window.history.back());
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', async () => {
      generateBtn.disabled = true;
      await generatePdf();
      generateBtn.disabled = false;
    });
  }
}

async function verifyAccess() {
  if (!currentUser) {
    throw new Error('Acceso no autorizado');
  }

  if (!['admin', 'operator'].includes(currentUser.role)) {
    throw new Error('Solo los operarios y administradores pueden crear informes');
  }

  if (incidentDetail.state !== 'resuelta') {
    throw new Error('Solo se puede crear un informe para incidencias resueltas');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadSessionUser();
    await loadIncidentDetail();
    await verifyAccess();
    renderCreateReport();
  } catch (error) {
    console.error(error);
    alert(error.message || 'Error cargando la página de informe');
    window.location.href = '/';
  }
});
