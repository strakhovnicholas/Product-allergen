import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import AddScreen from '../screens/AddScreen';
import DiaryScreen from '../screens/DiaryScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ReportsScreen from '../screens/ReportsScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#2F6690',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'ellipse';

            if (route.name === 'Главная') iconName = 'home';
            else if (route.name === 'Дневник') iconName = 'book';
            else if (route.name === 'Добавить') iconName = 'add-circle';
            else if (route.name === 'Отчёты') iconName = 'stats-chart';
            else if (route.name === 'Профиль') iconName = 'person';

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Главная" component={HomeScreen} />
        <Tab.Screen name="Дневник" component={DiaryScreen} />
        <Tab.Screen name="Добавить" component={AddScreen} />
        <Tab.Screen name="Отчёты" component={ReportsScreen} />
        <Tab.Screen name="Профиль" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}