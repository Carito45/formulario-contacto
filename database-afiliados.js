const sqlite3 = require('sqlite3').verbose();

// Crear o conectar a la base de datos
const db = new sqlite3.Database('./afiliados.db', (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('✅ Conectado a la base de datos de afiliados');
  }
});

// Crear tabla de afiliados
db.run(`
  CREATE TABLE IF NOT EXISTS afiliados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_completo TEXT NOT NULL,
    dni TEXT NOT NULL UNIQUE,
    fecha_nacimiento DATE,
    edad INTEGER NOT NULL,
    sexo TEXT NOT NULL,
    telefono TEXT,
    email TEXT,
    direccion TEXT NOT NULL,
    numero_afiliado TEXT NOT NULL,
    obra_social TEXT,
    plan TEXT,
    diagnostico TEXT,
    fecha_ingreso DATE NOT NULL,
    fecha_egreso DATE,
    medico_tratante TEXT,
    observaciones TEXT,
    archivo_adjunto TEXT,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('Error al crear tabla:', err);
  } else {
    console.log('✅ Tabla afiliados lista');
  }
});

module.exports = db;