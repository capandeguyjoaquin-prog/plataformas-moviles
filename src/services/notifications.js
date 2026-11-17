import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerPushToken, unregisterPushToken } from './api';

// Mostrar la notificacion aunque la app este abierta.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function setupPushNotifications() {
  if (!Device.isDevice) return null; // no funciona en emuladores

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Ranking',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#e89136',
    });
  }

  const { status: current } = await Notifications.getPermissionsAsync();
  let status = current;
  if (current !== 'granted') {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== 'granted') return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  await AsyncStorage.setItem('pushToken', token);
  await registerPushToken(token);
  return token;
}

export async function removePushToken() {
  const token = await AsyncStorage.getItem('pushToken');
  if (!token) return;
  await unregisterPushToken(token);
  await AsyncStorage.removeItem('pushToken');
}
