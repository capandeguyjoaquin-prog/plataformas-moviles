/* import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ImageBackground, Button } from 'react-native';
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const MyStack = createNativeStackNavigator({
  screens: {
    Home: HomeScreen,
    Game: GameScreen,
  },
});

export default function App() {
  return (
    <View style={styles.container}>
      <ImageBackground
              source={require('./assets/fondomadera.jpeg')}
              style={styles.background}
              resizeMode="stretch"
            >
           
            </ImageBackground>

        <>
            <Text>
                Este es el Home
            </Text>
            <HorizontalScrollView></HorizontalScrollView>
            <Btn texto="Jugar" presionado={() => navigation.navigate("juegopantalla")}></Btn>
            
        </>
        <>
      <NavigationContainer>
        <Stack.Navigator>
          {}
          {isAuthenticated ? (
            <>
              <Stack.Screen name="Home" component={Home} />

            </>
          ) :   (
            
            <>


            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </>

      <StatusBar style="auto" />
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  boton: {
    color: '#ffffff'
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
*/
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

// Importar las pantallas
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
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
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Inicio' }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ title: 'Perfil' }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Ajustes' }}
        />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}