const db = require('./db'); // o './config/db' según tu ruta

async function test() {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS resultado');
    console.log('Conexión exitosa, prueba:', rows);
  } catch (error) {
    console.error('Error conectando a la DB:', error);
  }
}

test();
