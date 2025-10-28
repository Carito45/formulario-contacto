const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database-afiliados');

const app = express();
const PORT = 3001; // Puerto diferente para no conflictuar

// Crear carpeta para archivos si no existe
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configurar multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF, imágenes y documentos de Word'));
    }
  }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public-afiliados'));
app.use('/uploads', express.static('uploads'));

// Ruta para crear un afiliado (POST)
app.post('/api/afiliados', upload.single('archivo'), (req, res) => {
  const {
    nombre_completo,
    dni,
    fecha_nacimiento,
    edad,
    sexo,
    telefono,
    email,
    direccion,
    numero_afiliado,
    obra_social,
    plan,
    diagnostico,
    fecha_ingreso,
    fecha_egreso,
    medico_tratante,
    observaciones
  } = req.body;
  
  // Validación de campos obligatorios
  if (!nombre_completo || !dni || !edad || !sexo || !direccion || !numero_afiliado || !fecha_ingreso) {
    return res.status(400).json({ 
      error: 'Los campos obligatorios son: nombre completo, DNI, edad, sexo, dirección, número de afiliado y fecha de ingreso' 
    });
  }
  
  const archivo_adjunto = req.file ? req.file.filename : null;
  
  const sql = `INSERT INTO afiliados (
    nombre_completo, dni, fecha_nacimiento, edad, sexo, telefono, email, 
    direccion, numero_afiliado, obra_social, plan, diagnostico, 
    fecha_ingreso, fecha_egreso, medico_tratante, observaciones, archivo_adjunto
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [
    nombre_completo, dni, fecha_nacimiento, edad, sexo, telefono, email,
    direccion, numero_afiliado, obra_social, plan, diagnostico,
    fecha_ingreso, fecha_egreso, medico_tratante, observaciones, archivo_adjunto
  ], function(err) {
    if (err) {
      console.error('Error al guardar:', err);
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Ya existe un afiliado con ese DNI' });
      }
      return res.status(500).json({ error: 'Error al guardar el afiliado' });
    }
    
    res.json({ 
      message: 'Afiliado registrado exitosamente',
      id: this.lastID 
    });
  });
});

// Ruta para obtener todos los afiliados (GET)
app.get('/api/afiliados', (req, res) => {
  const sql = 'SELECT * FROM afiliados ORDER BY fecha_registro DESC';
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error al obtener afiliados:', err);
      return res.status(500).json({ error: 'Error al obtener afiliados' });
    }
    
    res.json(rows);
  });
});

// Ruta para actualizar un afiliado (PUT)
app.put('/api/afiliados/:id', upload.single('archivo'), (req, res) => {
  const { id } = req.params;
  const {
    nombre_completo, dni, fecha_nacimiento, edad, sexo, telefono, email,
    direccion, numero_afiliado, obra_social, plan, diagnostico,
    fecha_ingreso, fecha_egreso, medico_tratante, observaciones
  } = req.body;
  
  if (!nombre_completo || !dni || !edad || !sexo || !direccion || !numero_afiliado || !fecha_ingreso) {
    return res.status(400).json({ 
      error: 'Todos los campos obligatorios deben estar completos' 
    });
  }
  
  const archivo_adjunto = req.file ? req.file.filename : req.body.archivo_actual;
  
  const sql = `UPDATE afiliados SET 
    nombre_completo = ?, dni = ?, fecha_nacimiento = ?, edad = ?, sexo = ?, 
    telefono = ?, email = ?, direccion = ?, numero_afiliado = ?, 
    obra_social = ?, plan = ?, diagnostico = ?, fecha_ingreso = ?, 
    fecha_egreso = ?, medico_tratante = ?, observaciones = ?, archivo_adjunto = ?
    WHERE id = ?`;
  
  db.run(sql, [
    nombre_completo, dni, fecha_nacimiento, edad, sexo, telefono, email,
    direccion, numero_afiliado, obra_social, plan, diagnostico,
    fecha_ingreso, fecha_egreso, medico_tratante, observaciones, archivo_adjunto, id
  ], function(err) {
    if (err) {
      console.error('Error al actualizar:', err);
      return res.status(500).json({ error: 'Error al actualizar el afiliado' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Afiliado no encontrado' });
    }
    
    res.json({ 
      message: 'Afiliado actualizado exitosamente',
      id: id
    });
  });
});

// Ruta para eliminar un afiliado (DELETE)
app.delete('/api/afiliados/:id', (req, res) => {
  const { id } = req.params;
  
  // Primero obtener el archivo para eliminarlo
  db.get('SELECT archivo_adjunto FROM afiliados WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error al buscar afiliado' });
    }
    
    // Eliminar archivo si existe
    if (row && row.archivo_adjunto) {
      const filePath = path.join(uploadsDir, row.archivo_adjunto);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Eliminar de la base de datos
    const sql = 'DELETE FROM afiliados WHERE id = ?';
    
    db.run(sql, [id], function(err) {
      if (err) {
        console.error('Error al eliminar:', err);
        return res.status(500).json({ error: 'Error al eliminar el afiliado' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Afiliado no encontrado' });
      }
      
      res.json({ 
        message: 'Afiliado eliminado exitosamente',
        id: id
      });
    });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🏥 Servidor de afiliados corriendo en http://localhost:${PORT}`);
});