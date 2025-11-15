const pool = require('./db'); // tu archivo db.js

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión exitosa a la base de datos!');
        
        // Opcional: probar una consulta simple
        const [rows] = await connection.query('SELECT NOW() AS fechaActual;');
        console.log('Hora actual en DB:', rows[0].fechaActual);

        connection.release();
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos:', error.message);
    }
}

testConnection();
