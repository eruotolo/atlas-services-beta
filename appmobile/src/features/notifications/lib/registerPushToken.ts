import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiClient } from '@/shared/lib/apiClient';

// Do not configure Push Notifications in Expo Go on Android
const isExpoGoAndroid = Platform.OS === 'android' && Constants.appOwnership === 'expo';

let Notifications: typeof import('expo-notifications') | null = null;

if (!isExpoGoAndroid) {
    try {
        Notifications = require('expo-notifications');
        Notifications?.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });
    } catch {
        // Fallback for missing native implementations
    }
}

export async function registerPushToken(): Promise<string | null> {
    if (!Device.isDevice) return null;
    const isExpoGoAndroid = Platform.OS === 'android' && Constants.appOwnership === 'expo';
    if (isExpoGoAndroid || !Notifications) return null;

    const { status: existing } = await Notifications.getPermissionsAsync();
    const finalStatus =
        existing === 'granted'
            ? existing
            : (await Notifications.requestPermissionsAsync()).status;

    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Hireeo',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
        });
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
    if (!projectId) return null;

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

    try {
        // Backend UpdateUserDto accepts avatar/nombre/telefono; pushToken requires Gemini to add it
        await apiClient.patch('/users/me', { pushToken: token });
    } catch {
        // Non-fatal: notifications may still work locally even if token isn't persisted
    }

    return token;
}
