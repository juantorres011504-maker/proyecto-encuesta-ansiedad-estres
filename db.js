const mysql = require('mysql2/promise');
require('dotenv').config();

// Verificar variables de entorno
console.log('Variables de entorno:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? '****' : undefined,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test de conexión rápida
async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS resultado');
    console.log('Conexión a DB exitosa, prueba SQL:', rows);
  } catch (error) {
    console.error('Error conectando a la DB:', error);
  }
}

testConnection();

module.exports = pool;
