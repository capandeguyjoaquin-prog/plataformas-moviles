import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

const HomeScreen = ({ navigation, user, onLogout }) => {
  return (
    <ImageBackground
      style={styles.container}
      source={require('../../assets/WhatsApp Image 2026-06-17 at 20.34.26.jpeg')}
      resizeMode="stretch"
    >
      <View style={styles.menu}>
        <Text style={styles.welcome}></Text>
        <Pressable style={styles.button} onPress={() => navigation.navigate('Juego')}>
          <Text style={styles.buttonText}>Jugar</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => navigation.navigate('Ajustes')}>
          <Text style={styles.buttonText}>Ajustes</Text>
        </Pressable>
        <Pressable style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.buttonText}>Cerrar sesion</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    gap: 12,
    transform: [{ translateY: 100 }],
  },
  button: {
    minWidth: 160,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: 'rgba(232, 145, 54, 0.92)',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  welcome: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowRadius: 4,
  },
  logoutButton: {
    minWidth: 160,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: 'rgba(120, 40, 30, 0.92)',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
  },
});

export default HomeScreen;