// Referencias a elementos del DOM
const form = document.getElementById('contactForm');
const mensajeResultado = document.getElementById('mensaje-resultado');
const btnCargar = document.getElementById('btnCargar');
const listaContactos = document.getElementById('listaContactos');

// URL base de la API
const API_URL = 'http://localhost:3000/api/contactos';

// Enviar formulario
form.addEventListener('submit', async (e) => {
  e.preventDefault(); // Evita que la página se recargue
  
  // Obtener datos del formulario
  const datos = {
    nombre: document.getElementById('nombre').value,
    email: document.getElementById('email').value,
    mensaje: document.getElementById('mensaje').value
  };
  
  try {
    // Enviar datos al servidor
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    });
    
    const resultado = await response.json();
    
    if (response.ok) {
      // Éxito
      mostrarMensaje('✅ ' + resultado.message, 'exito');
      form.reset(); // Limpiar formulario
      cargarContactos(); // Actualizar lista
    } else {
      // Error del servidor
      mostrarMensaje('❌ ' + resultado.error, 'error');
    }
    
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('❌ Error al conectar con el servidor', 'error');
  }
});

// Cargar lista de contactos
btnCargar.addEventListener('click', cargarContactos);

async function cargarContactos() {
  try {
    const response = await fetch(API_URL);
    const contactos = await response.json();
    
    if (contactos.length === 0) {
      listaContactos.innerHTML = '<p style="text-align: center; color: #999;">No hay contactos aún</p>';
      return;
    }
    
    // Mostrar contactos
    listaContactos.innerHTML = contactos.map(contacto => `
  <div class="contacto-card">
    <div class="contacto-header">
      <h3>${contacto.nombre}</h3>
      <button class="btn-eliminar" onclick="eliminarContacto(${contacto.id})">
        🗑️ Eliminar
      </button>
    </div>
    <p><strong>Email:</strong> ${contacto.email}</p>
    <p><strong>Mensaje:</strong> ${contacto.mensaje}</p>
    <p class="contacto-fecha">📅 ${formatearFecha(contacto.fecha)}</p>
  </div>
`).join('');

  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('❌ Error al cargar contactos', 'error');
  }
}

// Mostrar mensaje de éxito/error
function mostrarMensaje(texto, tipo) {
  mensajeResultado.textContent = texto;
  mensajeResultado.className = `mensaje ${tipo}`;
  
  // Ocultar después de 5 segundos
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

// Cargar contactos al iniciar
cargarContactos();

// Función para eliminar contacto
async function eliminarContacto(id) {
  // Confirmar antes de eliminar
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
      cargarContactos(); // Recargar lista
    } else {
      mostrarMensaje('❌ ' + resultado.error, 'error');
    }
    
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('❌ Error al eliminar el contacto', 'error');
  }
}