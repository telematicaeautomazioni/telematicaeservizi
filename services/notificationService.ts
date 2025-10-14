
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabaseService } from './supabaseService';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async registerForPushNotifications(userId: string): Promise<string | null> {
    try {
      console.log('Registering for push notifications...');

      // Check if device is physical
      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return null;
      }

      // Get existing permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission not granted for push notifications');
        return null;
      }

      // Get push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // This will be automatically set by Expo
      });

      const token = tokenData.data;
      console.log('Push token obtained:', token);

      // Save token to database
      await supabaseService.updatePushToken(userId, token);

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  async unregisterPushNotifications(userId: string): Promise<void> {
    try {
      console.log('Unregistering push notifications...');
      await supabaseService.updatePushToken(userId, null);
    } catch (error) {
      console.error('Error unregistering push notifications:', error);
    }
  }

  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  addNotificationResponseReceivedListener(
    callback: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Show immediately
    });
  }
}

export const notificationService = NotificationService.getInstance();
