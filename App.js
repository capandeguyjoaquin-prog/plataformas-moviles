import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'react-native';

// Importar las pantallas
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#2f95dc',
          tabBarInactiveTintColor: 'gray',
        }}
      >
        <Tab.Screen 
          name="Inicio" 
          component={HomeScreen} 
          options={{ 
            title: 'Inicio',
            tabBarIcon: ({ color, size }) => (
              <Image
                source={require('./assets/casita.png')}
                style={{ width: size * 1.5, height: size * 1.5, tintColor: color }}
                resizeMode="contain"
              />
            ),
          }}
        />
        <Tab.Screen 
          name="Juego" 
          component={GameScreen} 
          options={{ 
            title: 'Juego',
            tabBarIcon: ({ color, size }) => (
              <Image
                source={require('./assets/resortera.png')}
                style={{ width: size * 1.5, height: size * 1.5, tintColor: color }}
                resizeMode="contain"
              />
            ),
          }}
        />
        <Tab.Screen 
          name="Ajustes" 
          component={SettingsScreen} 
          options={{ 
            title: 'Ajustes',
            tabBarIcon: ({ color, size }) => (
              <Image
                source={require('./assets/tuerca.png')}
                style={{ width: size * 1.5, height: size * 1.5, tintColor: color }}
                resizeMode="contain"
              />
            ),
          }}
        />
        
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}