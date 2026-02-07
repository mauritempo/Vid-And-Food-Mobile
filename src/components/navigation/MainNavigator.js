import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Importamos las pantallas
import WineSearchScreen from '../screens/HomeStack/HomeScreen'; // Tu antigua Home (lista de vinos)
import HistoryScreen from '../screens/History/HistoryScreen';
import FavoritesScreen from '../screens/Favorites/FavoriteScreen';
import SettingsScreen from '../screen/Profile/SettingScreen';
import { COLORS } from '../../theme/theme';
import MainHomeScreen from '../screens/MAIN/MainScreen';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Este Stack es para la pestaña de Inicio
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      <Stack.Screen name="MainHome" component={MainHomeScreen} />
    </Stack.Navigator>
  );
}

// Este Stack es para la pestaña de Vinos (Lupa)
function WineSearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WineList" component={WineSearchScreen} />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary || 'purple', 
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'WineSearch') iconName = focused ? 'search' : 'search-outline';
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
        name="WineSearch" 
        component={WineSearchStack} 
        options={{ title: 'Explorar' }} 
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