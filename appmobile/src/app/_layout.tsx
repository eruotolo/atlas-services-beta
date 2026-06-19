import '../../global.css';

import { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/features/auth/context/AuthContext';
import { AuthGateProvider } from '@/features/auth/context/AuthGateContext';
import { RegisterGateSheet } from '@/features/auth/components/RegisterGateSheet';
import { LocaleProvider } from '@/features/i18n/context/LocaleContext';
import { CountryProvider } from '@/features/country/context/CountryContext';
import { NotificationProvider } from '@/features/messages/context/NotificationContext';
import { SocketProvider } from '@/features/messages/context/SocketContext';
import { InAppNotificationBanner } from '@/features/messages/components/InAppNotificationBanner';
import { queryClient } from '@/shared/lib/queryClient';
import { registerPushToken } from '@/features/notifications/lib/registerPushToken';

function AppStateRefresher(): null {
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void queryClient.invalidateQueries();
      }
    });
    return () => sub.remove();
  }, []);
  return null;
}

function PushTokenRegistrar(): null {
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    if (isAuthenticated) {
      void registerPushToken();
    }
  }, [isAuthenticated]);
  return null;
}

export default function RootLayout(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <LocaleProvider>
          <CountryProvider>
            <AuthProvider>
              <AuthGateProvider>
                <NotificationProvider>
                  <SocketProvider>
                    <AppStateRefresher />
                    <PushTokenRegistrar />
                    <Stack screenOptions={{ headerShown: false }}>
                      <Stack.Screen name="index" />
                      <Stack.Screen name="(auth)" />
                      <Stack.Screen name="(auth)/forgot-password" options={{ animation: 'slide_from_right' }} />
                      <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
                      <Stack.Screen name="service/[slug]" options={{ animation: 'slide_from_right' }} />
                      <Stack.Screen name="chat/[id]" options={{ animation: 'slide_from_right' }} />
                      <Stack.Screen name="profile/edit" options={{ animation: 'slide_from_right' }} />
                      <Stack.Screen name="profile/password" options={{ animation: 'slide_from_right' }} />
                      <Stack.Screen name="profile/addresses" options={{ animation: 'slide_from_right' }} />
                      <Stack.Screen name="profile/my-services" options={{ animation: 'slide_from_right' }} />
                      <Stack.Screen name="profile/leads" options={{ animation: 'slide_from_right' }} />
                      <Stack.Screen name="profile/kyc" options={{ animation: 'slide_from_right' }} />
                      <Stack.Screen name="publish/index" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
                      <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
                    </Stack>
                    <RegisterGateSheet />
                    <InAppNotificationBanner />
                  </SocketProvider>
                </NotificationProvider>
              </AuthGateProvider>
            </AuthProvider>
          </CountryProvider>
        </LocaleProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
