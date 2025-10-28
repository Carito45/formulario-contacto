const express = require('express');
const cors = require('cors');
const db = require('./database');

const app= express();
const PORT = 3000;

//Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

//Ruta para guardar un contacto (POST)
app.post('/api/contactos', (req, res)=> {
    const { nombre, email, mensaje } = req.body;

    //Validación básica
    if (!nombre || !email || !mensaje) {
        return res.status(400).json({
            error :'Todos los campos son obligatorios'
        });
        }
        

        //Insertar en la base de datos
        const sql ='INSERT INTO contactos (nombre, email, mensaje) VALUES (?, ?, ?)';

        db.run(sql, [nombre, email, mensaje], function(err){
            if (err) {
                console.error('Error al guardar:', err);
                return res.status(500).json({ error: 'Error al guardar el contacto'});
            }
            res.json({
                message:'Contacto guardado exitosamente',
                id: this.lastID
            });
        });
    });

    //Ruta para obtener todos los contactos(Get)
    app.get('/api/contactos', (req, res) => {
        const sql ='SELECT * FROM contactos ORDER BY fecha DESC';

        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error('Error al obtener contactos:', err);
                return res.status(500).json({ error: 'Error al obtener contactos'});
            }

            res.json(rows);
        });
    });

    // Ruta para eliminar un contacto (DELETE)
app.delete('/api/contactos/:id', (req, res) => {
  const { id } = req.params;
  
  const sql = 'DELETE FROM contactos WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      console.error('Error al eliminar:', err);
      return res.status(500).json({ error: 'Error al eliminar el contacto' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    
    res.json({ 
      message: 'Contacto eliminado exitosamente',
      id: id
    });
  });
});

// Ruta para actualizar un contacto (PUT)
app.put('/api/contactos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, email, mensaje } = req.body;
  
  // Validación básica
  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ 
      error: 'Todos los campos son obligatorios' 
    });
  }
  
  const sql = 'UPDATE contactos SET nombre = ?, email = ?, mensaje = ? WHERE id = ?';
  
  db.run(sql, [nombre, email, mensaje, id], function(err) {
    if (err) {
      console.error('Error al actualizar:', err);
      return res.status(500).json({ error: 'Error al actualizar el contacto' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    
    res.json({ 
      message: 'Contacto actualizado exitosamente',
      id: id
    });
  });
});

    //Iniciar servidor
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });