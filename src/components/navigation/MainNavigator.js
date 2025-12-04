import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/theme'; // Asegúrate que esta ruta exista o comenta la línea

// Importa el contexto
import AuthContext from '../../../services/context/AuthContext';

// Pantallas
import HomeScreen from '../screens/HomeStack/HomeScreen';
import WineDetailScreen from '../screens/WineDetail/WineDetailScreen';
import HistoryScreen from '../screens/History/HistoryScreen';
import FavoritesScreen from '../screens/Favorites/FavoriteScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// --- 1. El Stack del Home (Lista -> Detalle) ---
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

// --- 2. El Tab Navigator Principal ---
export default function MainNavigator() {
  // Consumimos el contexto para saber si está logueado y para abrir el modal
  const { isAuthenticated, openAuthModal } = useContext(AuthContext);

  // Esta función intercepta el clic en la pestaña
  const handleProtectedTabPress = (e) => {
    if (!isAuthenticated) {
      e.preventDefault(); // <--- DETIENE LA NAVEGACIÓN A LA PANTALLA
      openAuthModal('login'); // Abre el modal de login (o register si prefieres)
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: 'purple', // O COLORS.primary
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
      {/* Home es público, no necesita listener */}
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack} 
        options={{ title: 'Inicio' }} 
      />

      {/* Favoritos: Protegido */}
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        options={{ title: 'Favoritos' }}
        listeners={{
          tabPress: handleProtectedTabPress, // <--- AQUÍ APLICAMOS LA LÓGICA
        }}
      />

      {/* Historial: Protegido */}
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ title: 'Historial' }}
        listeners={{
          tabPress: handleProtectedTabPress, // <--- AQUÍ APLICAMOS LA LÓGICA
        }}
      />
    </Tab.Navigator>
  );
}