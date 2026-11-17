import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/LoginScreen';

// Importar las pantallas
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import RankingScreen from './src/screens/RankingScreen';
import { setupPushNotifications, removePushToken } from './src/services/notifications';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = React.useState(null);

  React.useEffect(() => {
    if (!session) return;
    setupPushNotifications().catch(error => console.log('Notificaciones no disponibles:', error.message));
  }, [session]);

  const handleLogout = async () => {
    try { await removePushToken(); } catch {}
    setSession(null);
  };

  if (!session) {
    return <LoginScreen onLogin={setSession} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Inicio" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Inicio">
          {props => <HomeScreen {...props} user={session.user} onLogout={handleLogout} />}
        </Stack.Screen>
        <Stack.Screen name="Juego" component={GameScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Ranking" component={RankingScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}