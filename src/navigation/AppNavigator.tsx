import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home as HomeIcon, History as HistoryIcon, Bell } from 'lucide-react-native';
import { RootStackParamList, BottomTabParamList } from './types';
import { THEME } from '../styles/theme';

// Screens
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import UploadScreen from '../screens/UploadScreen';
import OcrScreen from '../screens/OcrScreen';
import DashboardScreen from '../screens/DashboardScreen';
import RecommendationScreen from '../screens/RecommendationScreen';
import SimulationScreen from '../screens/SimulationScreen';
import NotificationScreen from '../screens/NotificationScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: THEME.colors.backgroundDark,
          borderTopColor: THEME.colors.border,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: THEME.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') {
            return <HomeIcon size={size} color={color} />;
          } else if (route.name === 'History') {
            return <HistoryIcon size={size} color={color} />;
          } else if (route.name === 'Notifications') {
            return <Bell size={size} color={color} />;
          }
          return null;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Notifications" component={NotificationScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: THEME.colors.background },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="MainApp" component={BottomTabNavigator} />
      <Stack.Screen name="UploadMedicine" component={UploadScreen} />
      <Stack.Screen name="OcrAnalysis" component={OcrScreen} />
      <Stack.Screen name="RiskDashboard" component={DashboardScreen} />
      <Stack.Screen name="ActionRecommendation" component={RecommendationScreen} />
      <Stack.Screen name="ActionSimulation" component={SimulationScreen} />
    </Stack.Navigator>
  );
}
