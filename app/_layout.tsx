import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';

function RootNavigation() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile-setup" />
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