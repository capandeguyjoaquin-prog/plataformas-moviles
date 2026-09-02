import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text } from 'react-native';

const SettingsScreen = ({ navigation }) => {
  return (
    
    <ImageBackground
          style={styles.container}
          source={require('../../assets/fondomadera.jpeg')}
          resizeMode="stretch"
        >
      <Pressable style={styles.homeButton} onPress={() => navigation.popToTop()}>
        <Text style={styles.homeButtonText}>Volver al inicio</Text>
      </Pressable>
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
  },
  homeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;