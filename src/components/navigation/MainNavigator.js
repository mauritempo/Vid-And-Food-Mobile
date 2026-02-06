import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeStack/HomeScreen';
import WineDetailScreen from '../screens/WineDetail/WineDetailScreen';
import HistoryScreen from '../screens/History/HistoryScreen';
import FavoritesScreen from '../screens/Favorites/FavoriteScreen';
import SettingsScreen from '../screen/Profile/SettingScreen';

// 1. IMPORTA TU PANTALLA AQUÍ (Ajusta la ruta si es necesario)

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="WineList" 
        component={HomeScreen} 
        options={{ headerShown: false }} 
      />
      
      <Stack.Screen 
        name="WineDetail" 
        component={WineDetailScreen} 
        options={{ title: 'Detalle del Vino', headerBackTitle: 'Volver' }} 
      />

      {/* 2. ESTA ES LA LÍNEA QUE TE FALTA. Sin esto, el error 'NAVIGATE' no se va */}
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ 
            headerShown: false,
            animation: 'slide_from_right' 
        }} 
      />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: 'purple', 
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'History') iconName = focused ? 'time' : 'time-outline';
          else if (route.name === 'Favorites') iconName = focused ? 'heart' : 'heart-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack} 
        options={{ title: 'Inicio' }} 
      />

      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        options={{ title: 'Favoritos' }}
      />

      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ title: 'Historial' }}
      />
    </Tab.Navigator>
  );
}