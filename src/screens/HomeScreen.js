import React from 'react';
import { ImageBackground, Text, StyleSheet } from 'react-native';

const HomeScreen = () => {
  return (
    <ImageBackground
      style={styles.container}
      source={require('../../assets/WhatsApp Image 2026-06-17 at 20.34.26.jpeg')}
      resizeMode="stretch"
    >
     
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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