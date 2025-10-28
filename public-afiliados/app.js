// Referencias a elementos del DOM
const form = document.getElementById('afiliadoForm');
const mensajeResultado = document.getElementById('mensaje-resultado');
const btnCargar = document.getElementById('btnCargar');
const listaAfiliados = document.getElementById('listaAfiliados');

// Variable para guardar todos los afiliados
let todosLosAfiliados = [];

// URL base de la API
const API_URL = 'http://localhost:3001/api/afiliados';

// Enviar formulario de registro
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(form);
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });
    
    const resultado = await response.json();
    
    if (response.ok) {
      mostrarMensaje('✅ ' + resultado.message, 'exito');
      form.reset();
      cargarAfiliados();
    } else {
      mostrarMensaje('❌ ' + resultado.error, 'error');
    }
    
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('❌ Error al conectar con el servidor', 'error');
  }
});

// Cargar lista de afiliados
async function cargarAfiliados() {
  try {
    const response = await fetch(API_URL);
    const afiliados = await response.json();
    
    todosLosAfiliados = afiliados;
    mostrarAfiliados(afiliados);
    
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('❌ Error al cargar afiliados', 'error');
  }
}

// Función para mostrar afiliados
function mostrarAfiliados(afiliados) {
  const resultadosDiv = document.getElementById('resultadosBusqueda');
  
  if (afiliados.length === 0) {
    listaAfiliados.innerHTML = '<div class="no-resultados">No se encontraron afiliados</div>';
    resultadosDiv.textContent = '';
    return;
  }
  
  resultadosDiv.textContent = `Mostrando ${afiliados.length} afiliado${afiliados.length !== 1 ? 's' : ''}`;
  
  listaAfiliados.innerHTML = afiliados.map(afiliado => {
    const estadoInternacion = afiliado.fecha_egreso ? 
      '<span class="estado-internacion estado-egresado">Egresado</span>' : 
      '<span class="estado-internacion estado-activo">En Internación</span>';
    
    const archivoBtn = afiliado.archivo_adjunto ? 
      `<a href="/uploads/${afiliado.archivo_adjunto}" target="_blank" class="btn-ver-archivo">📎 Ver Archivo</a>` : 
      '';
    
    return `
      <div class="afiliado-card">
        <div class="afiliado-header">
          <div class="afiliado-info">
            <h3>${afiliado.nombre_completo}</h3>
            <p class="subtitulo">DNI: ${afiliado.dni} | Afiliado N°: ${afiliado.numero_afiliado}</p>
            ${estadoInternacion}
          </div>
          <div class="afiliado-botones">
            ${archivoBtn}
            <button class="btn-editar" onclick='abrirModalEditar(${JSON.stringify(afiliado).replace(/'/g, "&#39;")})'>
              ✏️ Editar
            </button>
            <button class="btn-eliminar" onclick="eliminarAfiliado(${afiliado.id})">
              🗑️ Eliminar
            </button>
          </div>
        </div>
        
        <div class="afiliado-detalles">
          <div class="detalle-item">
            <strong>Edad:</strong>
            <span>${afiliado.edad} años</span>
          </div>
          
          <div class="detalle-item">
            <strong>Sexo:</strong>
            <span>${afiliado.sexo}</span>
          </div>
          
          <div class="detalle-item">
            <strong>Teléfono:</strong>
            <span>${afiliado.telefono || 'No registrado'}</span>
          </div>
          
          <div class="detalle-item">
            <strong>Email:</strong>
            <span>${afiliado.email || 'No registrado'}</span>
          </div>
          
          <div class="detalle-item">
            <strong>Dirección:</strong>
            <span>${afiliado.direccion}</span>
          </div>
          
          <div class="detalle-item">
            <strong>Obra Social:</strong>
            <span>${afiliado.obra_social || 'No especificada'} ${afiliado.plan ? '- ' + afiliado.plan : ''}</span>
          </div>
          
          <div class="detalle-item">
            <strong>Fecha de Ingreso:</strong>
            <span>${formatearFecha(afiliado.fecha_ingreso)}</span>
          </div>
          
          <div class="detalle-item">
            <strong>Fecha de Egreso:</strong>
            <span>${afiliado.fecha_egreso ? formatearFecha(afiliado.fecha_egreso) : 'En internación'}</span>
          </div>
          
          ${afiliado.diagnostico ? `
            <div class="detalle-item" style="grid-column: 1 / -1;">
              <strong>Diagnóstico:</strong>
              <span>${afiliado.diagnostico}</span>
            </div>
          ` : ''}
          
          ${afiliado.medico_tratante ? `
            <div class="detalle-item">
              <strong>Médico Tratante:</strong>
              <span>${afiliado.medico_tratante}</span>
            </div>
          ` : ''}
          
          ${afiliado.observaciones ? `
            <div class="detalle-item" style="grid-column: 1 / -1;">
              <strong>Observaciones:</strong>
              <span>${afiliado.observaciones}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Mostrar mensaje de éxito/error
function mostrarMensaje(texto, tipo) {
  mensajeResultado.textContent = texto;
  mensajeResultado.className = `mensaje ${tipo}`;
  
  setTimeout(() => {
    mensajeResultado.className = 'mensaje oculto';
  }, 5000);
}

// Formatear fecha
function formatearFecha(fechaStr) {
  if (!fechaStr) return '';
  const fecha = new Date(fechaStr + 'T00:00:00');
  return fecha.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Función para eliminar afiliado
async function eliminarAfiliado(id) {
  if (!confirm('¿Estás seguro de que quieres eliminar este afiliado? Esta acción no se puede deshacer.')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    
    const resultado = await response.json();
    
    if (response.ok) {
      mostrarMensaje('✅ ' + resultado.message, 'exito');
      cargarAfiliados();
    } else {
      mostrarMensaje('❌ ' + resultado.error, 'error');
    }
    
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('❌ Error al eliminar el afiliado', 'error');
  }
}

// Abrir modal de edición
function abrirModalEditar(afiliado) {
  document.getElementById('editarId').value = afiliado.id;
  document.getElementById('editarNombreCompleto').value = afiliado.nombre_completo;
  document.getElementById('editarDni').value = afiliado.dni;
  document.getElementById('editarFechaNacimiento').value = afiliado.fecha_nacimiento || '';
  document.getElementById('editarEdad').value = afiliado.edad;
  document.getElementById('editarSexo').value = afiliado.sexo;
  document.getElementById('editarTelefono').value = afiliado.telefono || '';
  document.getElementById('editarEmail').value = afiliado.email || '';
  document.getElementById('editarDireccion').value = afiliado.direccion;
  document.getElementById('editarNumeroAfiliado').value = afiliado.numero_afiliado;
  document.getElementById('editarObraSocial').value = afiliado.obra_social || '';
  document.getElementById('editarPlan').value = afiliado.plan || '';
  document.getElementById('editarDiagnostico').value = afiliado.diagnostico || '';
  document.getElementById('editarFechaIngreso').value = afiliado.fecha_ingreso;
  document.getElementById('editarFechaEgreso').value = afiliado.fecha_egreso || '';
  document.getElementById('editarMedicoTratante').value = afiliado.medico_tratante || '';
  document.getElementById('editarObservaciones').value = afiliado.observaciones || '';
  document.getElementById('editarArchivoActual').value = afiliado.archivo_adjunto || '';
  
  // Mostrar info del archivo actual
  const archivoInfo = document.getElementById('archivoActualInfo');
  if (afiliado.archivo_adjunto) {
    archivoInfo.innerHTML = `<small style="color: #666;">Archivo actual: <a href="/uploads/${afiliado.archivo_adjunto}" target="_blank">${afiliado.archivo_adjunto}</a></small>`;
  } else {
    archivoInfo.innerHTML = '<small style="color: #666;">Sin archivo adjunto</small>';
  }
  
  document.getElementById('modalEditar').classList.remove('oculto');
}

// Cerrar modal de edición
function cerrarModalEditar() {
  document.getElementById('modalEditar').classList.add('oculto');
  document.getElementById('formEditar').reset();
}

// Cerrar modal al hacer click fuera
document.getElementById('modalEditar').addEventListener('click', (e) => {
  if (e.target.id === 'modalEditar') {
    cerrarModalEditar();
  }
});

// Manejar envío del formulario de edición
document.getElementById('formEditar').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('editarId').value;
  const formData = new FormData();
  
  formData.append('nombre_completo', document.getElementById('editarNombreCompleto').value);
  formData.append('dni', document.getElementById('editarDni').value);
  formData.append('fecha_nacimiento', document.getElementById('editarFechaNacimiento').value);
  formData.append('edad', document.getElementById('editarEdad').value);
  formData.append('sexo', document.getElementById('editarSexo').value);
  formData.append('telefono', document.getElementById('editarTelefono').value);
  formData.append('email', document.getElementById('editarEmail').value);
  formData.append('direccion', document.getElementById('editarDireccion').value);
  formData.append('numero_afiliado', document.getElementById('editarNumeroAfiliado').value);
  formData.append('obra_social', document.getElementById('editarObraSocial').value);
  formData.append('plan', document.getElementById('editarPlan').value);
  formData.append('diagnostico', document.getElementById('editarDiagnostico').value);
  formData.append('fecha_ingreso', document.getElementById('editarFechaIngreso').value);
  formData.append('fecha_egreso', document.getElementById('editarFechaEgreso').value);
  formData.append('medico_tratante', document.getElementById('editarMedicoTratante').value);
  formData.append('observaciones', document.getElementById('editarObservaciones').value);
  formData.append('archivo_actual', document.getElementById('editarArchivoActual').value);
  
  const archivoInput = document.getElementById('editarArchivo');
  if (archivoInput.files[0]) {
    formData.append('archivo', archivoInput.files[0]);
  }
  
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      body: formData
    });
    
    const resultado = await response.json();
    
    if (response.ok) {
      mostrarMensaje('✅ ' + resultado.message, 'exito');
      cerrarModalEditar();
      cargarAfiliados();
    } else {
      mostrarMensaje('❌ ' + resultado.error, 'error');
    }
    
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('❌ Error al actualizar el afiliado', 'error');
  }
});

// Función de búsqueda
function buscarAfiliados(termino) {
  const terminoLower = termino.toLowerCase().trim();
  
  if (terminoLower === '') {
    mostrarAfiliados(todosLosAfiliados);
    return;
  }
  
  const afiliadosFiltrados = todosLosAfiliados.filter(afiliado => {
    return afiliado.nombre_completo.toLowerCase().includes(terminoLower) ||
           afiliado.dni.includes(terminoLower) ||
           afiliado.numero_afiliado.toLowerCase().includes(terminoLower) ||
           (afiliado.obra_social && afiliado.obra_social.toLowerCase().includes(terminoLower));
  });
  
  mostrarAfiliados(afiliadosFiltrados);
}

// Escuchar eventos de búsqueda
document.getElementById('campoBusqueda').addEventListener('input', (e) => {
  buscarAfiliados(e.target.value);
});

// Limpiar búsqueda al cargar afiliados nuevos
btnCargar.addEventListener('click', () => {
  document.getElementById('campoBusqueda').value = '';
  cargarAfiliados();
});

// Cargar afiliados al iniciar
cargarAfiliados();