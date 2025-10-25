const sqlite3 = require ('sqlite3').verbose();

/*crear o conectar a la base de datos*/
const db = new sqlite3.Database('./contactos.db', (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
    } else {
        console.log('✅Conectado a la base de datos SQLite');
    }
    });

    //crear tabla si no existe
    db.run(`
        CREATE TABLE IF NOT EXISTS contactos (
            id INTEGER PRIMARY KEY AUTOINCREMENT ,
            nombre Text NOT NULL,
            email Text NOT NULL,
            mensaje  Text NOT NULL,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
        , (err)=> {
           if (err){
            console.error('Error al crear tabla:', err);
        } else {
            console.log('✅Tabla de contactos lista');
        }
        });

        module.exports= db;
