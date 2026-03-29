import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2F6690',
        tabBarInactiveTintColor: '#98A2B3',
        tabBarStyle: {
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Главная',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="diary"
        options={{
          title: 'Дневник',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          title: 'Добавить',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: 'Отчёты',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}