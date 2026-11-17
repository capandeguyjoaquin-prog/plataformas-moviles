require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Supabase = Postgres. Se conecta con la cadena de conexion (DATABASE_URL), no con la anon key.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
});

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

const isExpoToken = token => typeof token === 'string' && /^Expo(nent)?PushToken\[.+\]$/.test(token);

// Envia notificaciones a traves del servicio de Expo y limpia los tokens que ya no existen.
async function sendPush(messages) {
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    try {
      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(chunk),
      });
      const body = await res.json();
      const tickets = body.data || [];
      const dead = chunk
        .filter((_, idx) => tickets[idx]?.status === 'error' && tickets[idx]?.details?.error === 'DeviceNotRegistered')
        .map(message => message.to);
      if (dead.length) await pool.query('DELETE FROM push_tokens WHERE token = ANY($1)', [dead]);
    } catch (error) {
      console.error('Error al enviar notificaciones push:', error);
    }
  }
}

// Avisa a quienes tenian mas puntaje que tu record anterior y ahora quedaron por debajo del nuevo.
async function notifySurpassed(user, anterior, nuevo) {
  try {
    const { rows } = await pool.query(
      `SELECT t.token, r.puntaje
       FROM ranking r
       INNER JOIN push_tokens t ON t.usuario_id = r.usuario_id
       WHERE r.usuario_id <> $1 AND r.puntaje > $2 AND r.puntaje < $3`,
      [user.id, anterior, nuevo]
    );
    if (!rows.length) return;
    await sendPush(rows.map(row => ({
      to: row.token,
      sound: 'default',
      channelId: 'default',
      priority: 'high',
      title: '¡Te superaron en el ranking!',
      body: `${user.nombre} hizo ${nuevo} puntos y te pasó. Tu mejor puntaje: ${row.puntaje}.`,
      data: { tipo: 'ranking_superado' },
    })));
  } catch (error) {
    console.error('Error al notificar superados:', error);
  }
}

app.post('/api/auth/register', async (request, response) => {
  try {
    const { nombre, password } = request.body;
    if (!nombre || !password || password.length < 6) return response.status(400).json({ error: 'Nombre y contrasena valida son obligatorios' });
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO usuarios (nombre, password_hash) VALUES ($1, $2) RETURNING id',
      [nombre, hash]
    );
    const user = { id: rows[0].id, nombre };
    response.status(201).json({ token: tokenFor(user), user });
  } catch (error) {
    if (error.code === '23505') return response.status(409).json({ error: 'Ese nombre ya esta registrado' });
    console.error('Error al crear la cuenta:', error);
    response.status(500).json({ error: 'Error al crear la cuenta' });
  }
});

app.post('/api/auth/login', async (request, response) => {
  try {
    const { rows } = await pool.query('SELECT id, nombre, password_hash FROM usuarios WHERE nombre = $1', [request.body.nombre]);
    if (!rows.length || !(await bcrypt.compare(request.body.password || '', rows[0].password_hash))) return response.status(401).json({ error: 'Nombre o contrasena incorrectos' });
    const user = { id: rows[0].id, nombre: rows[0].nombre };
    response.json({ token: tokenFor(user), user });
  } catch (error) {
    console.error('Error al iniciar sesion:', error);
    response.status(500).json({ error: 'Error al iniciar sesion' });
  }
});

app.post('/api/ranking', auth, async (request, response) => {
  const puntaje = Number(request.body?.puntaje);
  if (!Number.isInteger(puntaje) || puntaje < 0) return response.status(400).json({ error: 'Puntaje invalido' });
  try {
    const previo = await pool.query('SELECT puntaje FROM ranking WHERE usuario_id = $1', [request.user.id]);
    const anterior = previo.rows[0]?.puntaje ?? 0;
    await pool.query(
      `INSERT INTO ranking (usuario_id, puntaje) VALUES ($1, $2)
       ON CONFLICT (usuario_id) DO UPDATE SET puntaje = GREATEST(ranking.puntaje, EXCLUDED.puntaje)`,
      [request.user.id, puntaje]
    );
    response.status(201).json({ ok: true });
    if (puntaje > anterior) notifySurpassed(request.user, anterior, puntaje);
  } catch (error) {
    console.error('Error al guardar el puntaje:', error);
    response.status(500).json({ error: 'No se pudo guardar el puntaje' });
  }
});

app.post('/api/push-token', auth, async (request, response) => {
  const token = request.body?.token;
  if (!isExpoToken(token)) return response.status(400).json({ error: 'Token invalido' });
  try {
    await pool.query(
      `INSERT INTO push_tokens (token, usuario_id) VALUES ($1, $2)
       ON CONFLICT (token) DO UPDATE SET usuario_id = EXCLUDED.usuario_id`,
      [token, request.user.id]
    );
    response.json({ ok: true });
  } catch (error) {
    console.error('Error al guardar el token push:', error);
    response.status(500).json({ error: 'No se pudo guardar el token' });
  }
});

app.delete('/api/push-token', auth, async (request, response) => {
  try {
    await pool.query('DELETE FROM push_tokens WHERE token = $1 AND usuario_id = $2', [request.body?.token, request.user.id]);
    response.json({ ok: true });
  } catch (error) {
    console.error('Error al borrar el token push:', error);
    response.status(500).json({ error: 'No se pudo borrar el token' });
  }
});

app.get('/api/ranking', async (request, response) => {
  const offset = Number(request.query.offset ?? 0);
  const limit = Number(request.query.limit ?? 20);
  if (!Number.isInteger(offset) || offset < 0 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    return response.status(400).json({ error: 'Paginacion invalida' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT MIN(r.id) AS id, u.nombre, MAX(r.puntaje) AS puntaje
       FROM ranking r
       INNER JOIN usuarios u ON u.id = r.usuario_id
       GROUP BY u.id, u.nombre
       ORDER BY puntaje DESC, id ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    response.json(rows);
  } catch (error) {
    console.error('Error al consultar el ranking:', error);
    response.status(500).json({ error: 'No se pudo consultar el ranking' });
  }
});

app.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log(`API lista en el puerto ${process.env.PORT || 3000}`));
