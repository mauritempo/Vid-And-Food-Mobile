import React from 'react'; // Ya no necesitas useContext ni AuthContext aquí
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Nota: Ya no importamos AuthContext porque la protección está DENTRO de las pantallas
import HomeScreen from '../screens/HomeStack/HomeScreen';
import WineDetailScreen from '../screens/WineDetail/WineDetailScreen';
import HistoryScreen from '../screens/History/HistoryScreen';
import FavoritesScreen from '../screens/Favorites/FavoriteScreen';

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
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  // 1. ELIMINAMOS handleProtectedTabPress
  // Queremos que el usuario SI entre a la pestaña para ver el mensaje de "Login Requerido"

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
        // 2. ELIMINAMOS LA PROP 'listeners' AQUÍ
      />

      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ title: 'Historial' }}
        // 3. ELIMINAMOS LA PROP 'listeners' AQUÍ TAMBIÉN
      />
    </Tab.Navigator>
  );
}