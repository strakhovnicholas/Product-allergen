import { Stack, router, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from '../src/context/AuthContext';

function RootNavigation() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const currentSegment = segments[0];
    const inTabsGroup = currentSegment === '(tabs)';
    const inLogin = currentSegment === 'login';
    const inRegister = currentSegment === 'register';
    const inProfileSetup = currentSegment === 'profile-setup';

    if (!isAuthenticated) {
      if (!inLogin && !inRegister) {
        router.replace('/register');
      }
      return;
    }

    if (isAuthenticated && (inLogin || inRegister)) {
      router.replace('/(tabs)');
      return;
    }

    if (isAuthenticated && inProfileSetup) {
      return;
    }

    if (isAuthenticated && inTabsGroup) {
      return;
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F5F7FB',
        }}
      >
        <ActivityIndicator size="large" color="#2F6690" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="register" />
      <Stack.Screen name="login" />
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="add-common" />
      <Stack.Screen name="add-symptom" />
      <Stack.Screen name="add-medicine" />
      <Stack.Screen name="add-food" />
      <Stack.Screen name="add-note" />
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