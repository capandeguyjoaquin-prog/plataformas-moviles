import React from 'react';
import { ImageBackground, Text, StyleSheet} from 'react-native';

const SettingsScreen = () => {
  return (
    
    <ImageBackground
          style={styles.container}
          source={require('../../assets/fondomadera.jpeg')}
          resizeMode="stretch"
        ></ImageBackground>
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
});

export default SettingsScreen;