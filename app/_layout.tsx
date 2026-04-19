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

    const inAuth =
      currentSegment === 'login' ||
      currentSegment === 'register' ||
      currentSegment === 'profile-step-1' ||
      currentSegment === 'profile-step-2';

    const inTabs = currentSegment === '(tabs)';

    if (!isAuthenticated && !inAuth) {
      setTimeout(() => {
        router.replace('/register');
      }, 0);
      return;
    }

    if (isAuthenticated && inAuth) {
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 0);
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
      <Stack.Screen name="profile-step-1" />
      <Stack.Screen name="profile-step-2" />
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