// Referencias a elementos del DOM
const form = document.getElementById('contactForm');
const mensajeResultado = document.getElementById('mensaje-resultado');
const btnCargar = document.getElementById('btnCargar');
const listaContactos = document.getElementById('listaContactos');

// Variable para guardar todos los contactos
let todosLosContactos = [];

// URL base de la API
const API_URL = 'http://localhost:3000/api/contactos';

// Enviar formulario
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const datos = {
    nombre: document.getElementById('nombre').value,
    email: document.getElementById('email').value,
    mensaje: document.getElementById('mensaje').value
  };
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    });
    
    const resultado = await response.json();
    
    if (response.ok) {
      mostrarMensaje('✅ ' + resultado.message, 'exito');
      form.reset();
      cargarContactos();
    } else {
      mostrarMensaje('❌ ' + resultado.error, 'error');
    }
    
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('❌ Error al conectar con el servidor', 'error');
  }
});

// Cargar lista de contactos
async function cargarContactos() {
  try {
    const response = await fetch(API_URL);
    const contactos = await response.json();
    
    todosLosContactos = contactos;
    mostrarContactos(contactos);
    
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('❌ Error al cargar contactos', 'error');
  }
}

// Función para mostrar contactos
function mostrarContactos(contactos) {
  const resultadosDiv = document.getElementById('resultadosBusqueda');
  
  if (contactos.length === 0) {
    listaContactos.innerHTML = '<div class="no-resultados">No se encontraron contactos</div>';
    resultadosDiv.textContent = '';
    return;
  }
  
  resultadosDiv.textContent = `Mostrando ${contactos.length} contacto${contactos.length !== 1 ? 's' : ''}`;
  
  listaContactos.innerHTML = contactos.map(contacto => `
    <div class="contacto-card">
      <div class="contacto-header">
        <h3>${contacto.nombre}</h3>
        <div class="contacto-botones">
          <button class="btn-editar" onclick="abrirModalEditar(${contacto.id}, '${contacto.nombre.replace(/'/g, "\\'")}', '${contacto.email}', '${contacto.mensaje.replace(/'/g, "\\'")}')">
            ✏️ Editar
          </button>
          <button class="btn-eliminar" onclick="eliminarContacto(${contacto.id})">
            🗑️ Eliminar
          </button>
        </div>
      </div>
      <p><strong>Email:</strong> ${contacto.email}</p>
      <p><strong>Mensaje:</strong> ${contacto.mensaje}</p>
      <p class="contacto-fecha">📅 ${formatearFecha(contacto.fecha)}</p>
    </div>
  `).join('');
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
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Función para eliminar contacto
async function eliminarContacto(id) {
  if (!confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    
    const resultado = await response.json();
    
    if (response.ok) {
      mostrarMensaje('✅ ' + resultado.message, 'exito');
      cargarContactos();
    } else {
      mostrarMensaje('❌ ' + resultado.error, 'error');
    }
    
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('❌ Error al eliminar el contacto', 'error');
  }
}

// Abrir modal de edición
function abrirModalEditar(id, nombre, email, mensaje) {
  document.getElementById('editarId').value = id;
  document.getElementById('editarNombre').value = nombre;
  document.getElementById('editarEmail').value = email;
  document.getElementById('editarMensaje').value = mensaje;
  
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
  const datos = {
    nombre: document.getElementById('editarNombre').value,
    email: document.getElementById('editarEmail').value,
    mensaje: document.getElementById('editarMensaje').value
  };
  
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    });
    
    const resultado = await response.json();
    
    if (response.ok) {
      mostrarMensaje('✅ ' + resultado.message, 'exito');
      cerrarModalEditar();
      cargarContactos();
    } else {
      mostrarMensaje('❌ ' + resultado.error, 'error');
    }
    
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('❌ Error al actualizar el contacto', 'error');
  }
});

// Función de búsqueda
function buscarContactos(termino) {
  const terminoLower = termino.toLowerCase().trim();
  
  if (terminoLower === '') {
    mostrarContactos(todosLosContactos);
    return;
  }
  
  const contactosFiltrados = todosLosContactos.filter(contacto => {
    return contacto.nombre.toLowerCase().includes(terminoLower) ||
           contacto.email.toLowerCase().includes(terminoLower) ||
           contacto.mensaje.toLowerCase().includes(terminoLower);
  });
  
  mostrarContactos(contactosFiltrados);
}

// Escuchar eventos de búsqueda
document.getElementById('campoBusqueda').addEventListener('input', (e) => {
  buscarContactos(e.target.value);
});

// Limpiar búsqueda al cargar contactos nuevos
btnCargar.addEventListener('click', () => {
  document.getElementById('campoBusqueda').value = '';
  cargarContactos();
});

// Cargar contactos al iniciar
cargarContactos();