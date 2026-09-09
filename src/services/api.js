import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'No se pudo completar la solicitud');
  return body;
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
  return request('/api/ranking', {
    method: 'POST',
    headers: { Authorization: `Bearer ${session?.token || ''}` },
    body: JSON.stringify({ puntaje }),
  });
};