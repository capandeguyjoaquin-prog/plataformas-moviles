import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/LoginScreen';

// Importar las pantallas
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = React.useState(null);

  if (!session) {
    return <LoginScreen onLogin={setSession} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Inicio" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Inicio">
          {props => <HomeScreen {...props} user={session.user} onLogout={() => setSession(null)} />}
        </Stack.Screen>
        <Stack.Screen name="Juego" component={GameScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Ajustes" component={SettingsScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}