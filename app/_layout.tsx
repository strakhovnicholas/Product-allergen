import { Stack, router, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from '../src/context/AuthContext';

function RootNavigation() {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const inTabs = pathname.startsWith('/(tabs)');
    const inLogin = pathname === '/login';

    const inRegisterFlow =
      pathname === '/register' ||
      pathname === '/profile-step-1' ||
      pathname === '/profile-step-2';

    if (!isAuthenticated) {
      if (!inLogin && !inRegisterFlow) {
        router.replace('/register');
      }
      return;
    }

    if (isAuthenticated && (inLogin || inRegisterFlow)) {
      router.replace('/(tabs)');
      return;
    }

    if (isAuthenticated && inTabs) {
      return;
    }
  }, [isAuthenticated, isLoading, pathname]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="register" />
      <Stack.Screen name="profile-step-1" />
      <Stack.Screen name="profile-step-2" />
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}