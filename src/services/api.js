import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.5.251:3000';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Configura EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

const getNombre = user =>
  user.user_metadata?.nombre || user.email || 'Jugador';

export const login = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) throw error;

  return {
    session: data.session,
    user: {
      id: data.user.id,
      email: data.user.email,
      nombre: getNombre(data.user),
    },
  };
};

export const register = async ({ email, password, nombre }) => {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { nombre: nombre.trim() },
    },
  });

  if (error) throw error;

  return {
    session: data.session,
    user: {
      id: data.user.id,
      email: data.user.email,
      nombre: getNombre(data.user),
    },
  };
};

export const saveSession = async () => {
  // Supabase persiste la sesión usando AsyncStorage.
};

export const submitScore = async puntaje => {
  if (!Number.isInteger(puntaje) || puntaje < 0) {
    throw new Error('Puntaje invalido');
  }

  const { data, error } = await supabase.rpc('guardar_puntaje', {
    nuevo_puntaje: puntaje,
  });

  if (error) throw error;
  return data;
};

export const getRanking = async (offset = 0, limit = 20) => {
  if (
    !Number.isInteger(offset) ||
    offset < 0 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    throw new Error('Paginacion invalida');
  }

  const { data, error } = await supabase
    .from('ranking')
    .select('id, usuario_id, puntaje, usuarios(nombre)')
    .order('puntaje', { ascending: false })
    .order('id', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return data.map(row => ({
    id: row.id,
    nombre: row.usuarios?.nombre || 'Jugador',
    puntaje: row.puntaje,
  }));
};

export const getWeather = async () => {
  const response = await fetch(`${API_URL}/api/weather`);
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.error || 'No se pudo consultar el clima');
  }

  return body;
};