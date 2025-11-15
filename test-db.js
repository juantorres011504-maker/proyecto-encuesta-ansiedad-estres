const mysql = require('mysql2/promise');

async function testDB() {
  try {
    const connection = await mysql.createConnection({
      host: 'nozomi.proxy.rlwy.net',
      user: 'root',
      password: 'BoXwemSdwiItTeObyGZMYjOsuJzKPgil',
      database: 'railway',
      port: 16412,
      ssl: { rejectUnauthorized: false }
    });
    console.log('Conexión exitosa!');
    await connection.end();
  } catch (err) {
    console.error('Error al conectar:', err);
  }
}

testDB();
