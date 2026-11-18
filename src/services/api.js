import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://plataformas-moviles.onrender.com';
const TIMEOUT_MS = 60000;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithTimeout = async (url, options) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

// El servidor gratuito de Render se "duerme" y tarda hasta 1 minuto en despertar:
// por eso se reintenta si no hay conexion o si responde 502/503/504.
const request = async (path, options = {}) => {
  let response;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      response = await fetchWithTimeout(`${API_URL}${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      });
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('El servidor tardo demasiado en responder. Intenta de nuevo.');
      if (attempt === 2) throw new Error('No se pudo conectar con el servidor. Revisa tu internet e intenta de nuevo.');
      await sleep(3000);
      continue;
    }
    if ([502, 503, 504].includes(response.status) && attempt < 2) {
      await sleep(4000);
      continue;
    }
    break;
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'No se pudo completar la solicitud');
  return body;
};

// Despierta el servidor mientras la persona escribe su usuario.
export const wakeServer = () => {
  fetch(`${API_URL}/api/ranking?limit=1`).catch(() => {});
};

export const login = credentials => request('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify(credentials),
});

export const register = credentials => request('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify(credentials),
});

export const saveSession = async session => {
  await AsyncStorage.setItem('session', JSON.stringify(session));
};

export const submitScore = async puntaje => {
  const session = JSON.parse(await AsyncStorage.getItem('session') || 'null');
  if (!session?.token) {
    throw new Error('La sesion no es valida. Cierra sesion e inicia nuevamente.');
  }

  return request('/api/ranking', {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.token}` },
    body: JSON.stringify({ puntaje }),
  });
};

export const getRanking = (offset = 0, limit = 20) => request(
  `/api/ranking?offset=${offset}&limit=${limit}`
);

export const getWeather = () => request('/api/weather');

const authHeaders = async () => {
  const session = JSON.parse(await AsyncStorage.getItem('session') || 'null');
  if (!session?.token) throw new Error('La sesion no es valida.');
  return { Authorization: `Bearer ${session.token}` };
};

export const registerPushToken = async token => request('/api/push-token', {
  method: 'POST',
  headers: await authHeaders(),
  body: JSON.stringify({ token }),
});

export const unregisterPushToken = async token => request('/api/push-token', {
  method: 'DELETE',
  headers: await authHeaders(),
  body: JSON.stringify({ token }),
});
