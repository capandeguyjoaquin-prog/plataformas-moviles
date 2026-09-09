import React, { useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { login, register, saveSession } from '../services/api';

export default function LoginScreen({ onLogin }) {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!nombre.trim() || password.length < 6) {
      setError('Ingresa un nombre y una contrasena de al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const session = await (isRegistering ? register : login)({ nombre: nombre.trim(), password });
      await saveSession(session);
      onLogin(session);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground style={styles.container} source={require('../../assets/fondomadera.jpeg')} resizeMode="cover">
      <View style={styles.panel}>
        <Text style={styles.title}>Plataformas moviles</Text>
        <Text style={styles.subtitle}>{isRegistering ? 'Crear cuenta' : 'Iniciar sesion'}</Text>
        <TextInput style={styles.input} placeholder="Nombre de usuario" value={nombre} onChangeText={setNombre} autoCapitalize="words" />
        <TextInput style={styles.input} placeholder="Contrasena" value={password} onChangeText={setPassword} secureTextEntry />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Conectando...' : isRegistering ? 'Registrarme' : 'Entrar'}</Text>
        </Pressable>
        <Pressable onPress={() => { setIsRegistering(value => !value); setError(''); }}>
          <Text style={styles.switchText}>{isRegistering ? 'Ya tengo una cuenta' : 'Crear una cuenta'}</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  panel: { width: '100%', maxWidth: 380, padding: 24, borderRadius: 16, backgroundColor: 'rgba(20, 15, 10, 0.86)' },
  title: { color: '#f1aa45', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: '#fff', fontSize: 20, textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 13, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: '#e89136', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  switchText: { color: '#f1aa45', textAlign: 'center', marginTop: 18, fontSize: 15 },
  error: { color: '#ffb3a7', marginBottom: 10, textAlign: 'center' },
});