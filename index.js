// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./config/db');
const verifyToken = require('./middleware/auth');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require('path');
app.use(express.static(path.join(__dirname, 'html_code')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html_code', 'login.html'));
});

// Registro de usuario
app.post('/register', async (req, res) => {
  try {
    const { nombre, correo, contrasena, numero_control } = req.body;

    console.log('Datos recibidos:', { nombre, correo, contrasena, numero_control }); // 👈

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    await db.query('CALL sp_registrar_usuario(?, ?, ?, ?)', [
      nombre,
      correo,
      hashedPassword,
      numero_control
    ]);

    res.status(200).json({ mensaje: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error('Error en /register:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});


// Inicio de sesión
app.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const [rows] = await db.query('CALL sp_iniciar_sesion(?)', [correo]);
    console.log('Resultado de sp_iniciar_sesion:', rows);

    if (rows.length === 0 || rows[0].length === 0) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos' });
    }

    const user = rows[0][0];
    
    const isPasswordValid = await bcrypt.compare(contrasena, user.contrasena);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, nombre: user.nombre } });
  } catch (error) {
    console.error('Error en /login:', error); // 👈 log completo del error
    res.status(500).json({ error: error.message });
  }
});


// Obtener encuesta de estrés
app.get('/encuesta/estres', async (req, res) => {
  try {
    const [rows] = await db.query('CALL sp_obtener_encuesta_estres()');
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener encuesta de ansiedad
app.get('/encuesta/ansiedad', async (req, res) => {
  try {
    const [rows] = await db.query('CALL sp_obtener_encuesta_ansiedad()');
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Registrar resultado (protegido)
app.post('/resultados', verifyToken, async (req, res) => {
  const { respuestas, tipoEncuesta } = req.body; // tipoEncuesta: 'ansiedad' o 'estres'

  if (!Array.isArray(respuestas)) {
    return res.status(400).json({ error: 'Respuestas inválidas o no enviadas' });
  }

  if (!tipoEncuesta || (tipoEncuesta !== 'ansiedad' && tipoEncuesta !== 'estres')) {
    return res.status(400).json({ error: 'Tipo de encuesta inválido o no especificado' });
  }

  try {
    await db.query('CALL sp_registrar_respuestas_y_calcular(?, ?, ?)', [
      req.userId,
      JSON.stringify(respuestas),
      tipoEncuesta
    ]);
    res.status(201).json({ message: 'Resultado registrado correctamente' });
  } catch (error) {
    if (error.sqlState === '45000') {
      res.status(400).json({ error: error.message }); // Ya completó encuesta en 14 días
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});


// Obtener datos del perfil (protegido)
app.get('/perfil', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.query('CALL sp_obtener_datos_usuario(?)', [req.userId]);

        const datosUsuario = rows[0][0];
        const encuestas = rows[1][0];
        const estresResultado = rows[2][0] || null;
        const ansiedadResultado = rows[3][0] || null;

        res.json({
            nombre: datosUsuario.nombre,
            correo: datosUsuario.correo,
            numero_control: datosUsuario.numero_control,
            totalEncuestas: encuestas.totalEncuestas || 0,
            estresEncuestas: encuestas.estresEncuestas || 0,
            ansiedadEncuestas: encuestas.ansiedadEncuestas || 0,
            resultadoEstres: estresResultado,
            resultadoAnsiedad: ansiedadResultado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});


// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
// Abre login.html al inicir el servidor
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html_code', 'login.html'));
});
