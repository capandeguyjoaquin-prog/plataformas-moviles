require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());
const pool = mysql.createPool({ host: process.env.DB_HOST || 'localhost', port: process.env.DB_PORT || 3306, user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'plataformas_moviles', waitForConnections: true, connectionLimit: 10 });
const tokenFor = user => jwt.sign({ id: user.id, nombre: user.nombre }, process.env.JWT_SECRET || 'cambia-esta-clave');
let weatherCache = { expiresAt: 0, value: null };
const auth = (request, response, next) => {
  try { request.user = jwt.verify(request.headers.authorization?.replace('Bearer ', ''), process.env.JWT_SECRET || 'cambia-esta-clave'); next(); }
  catch { response.status(401).json({ error: 'Sesion no valida' }); }
};

app.get('/api/weather', async (_request, response) => {
  if (!process.env.METEOSOURCE_API_KEY) {
    return response.status(503).json({ error: 'El clima no esta configurado en el servidor' });
  }

  if (weatherCache.value && weatherCache.expiresAt > Date.now()) {
    return response.json(weatherCache.value);
  }

  try {
    const weatherResponse = await fetch('https://www.meteosource.com/api/v1/free/point?lat=-34.6037&lon=-58.3816&sections=current&timezone=America%2FArgentina%2FBuenos_Aires&language=en&units=metric', {
      headers: { 'X-API-Key': process.env.METEOSOURCE_API_KEY },
    });
    const weather = await weatherResponse.json();
    if (!weatherResponse.ok) {
      return response.status(weatherResponse.status).json({ error: weather.detail || 'No se pudo consultar el clima' });
    }

    const result = {
      icon: weather.current?.icon_num || 1,
      summary: weather.current?.summary || 'Weather unavailable',
      temperature: weather.current?.temperature ?? null,
    };
    weatherCache = { value: result, expiresAt: Date.now() + 10 * 60 * 1000 };
    return response.json(result);
  } catch (error) {
    return response.status(502).json({ error: 'No se pudo consultar el servicio meteorologico' });
  }
});

app.post('/api/auth/register', async (request, response) => {
  try {
    const { nombre, password } = request.body;
    if (!nombre || !password || password.length < 6) return response.status(400).json({ error: 'Nombre y contrasena valida son obligatorios' });
    const [existing] = await pool.query('SELECT id FROM usuarios WHERE nombre = ?', [nombre]);
    if (existing.length) return response.status(409).json({ error: 'Ese nombre ya esta registrado' });
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO usuarios (nombre, password_hash) VALUES (?, ?)', [nombre, hash]);
    const user = { id: result.insertId, nombre };
    response.status(201).json({ token: tokenFor(user), user });
  } catch (error) { response.status(500).json({ error: 'Error al crear la cuenta' }); }
});

app.post('/api/auth/login', async (request, response) => {
  try {
    const [rows] = await pool.query('SELECT id, nombre, password_hash FROM usuarios WHERE nombre = ?', [request.body.nombre]);
    if (!rows.length || !(await bcrypt.compare(request.body.password || '', rows[0].password_hash))) return response.status(401).json({ error: 'Nombre o contrasena incorrectos' });
    const user = { id: rows[0].id, nombre: rows[0].nombre };
    response.json({ token: tokenFor(user), user });
  } catch { response.status(500).json({ error: 'Error al iniciar sesion' }); }
});

app.post('/api/ranking', auth, async (request, response) => {
  const puntaje = Number(request.body.puntaje);
  if (!Number.isInteger(puntaje) || puntaje < 0) return response.status(400).json({ error: 'Puntaje invalido' });
  try { await pool.query('INSERT INTO ranking (nombre, puntaje) VALUES (?, ?)', [request.user.nombre, puntaje]); response.status(201).json({ ok: true }); }
  catch { response.status(500).json({ error: 'No se pudo guardar el puntaje' }); }
});

app.get('/api/ranking', async (_request, response) => {
  try { const [rows] = await pool.query('SELECT ROW_NUMBER() OVER (ORDER BY puntaje DESC) AS posicion, nombre, puntaje FROM ranking ORDER BY puntaje DESC'); response.json(rows); }
  catch { response.status(500).json({ error: 'No se pudo consultar el ranking' }); }
});

app.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log(`API lista en el puerto ${process.env.PORT || 3000}`));