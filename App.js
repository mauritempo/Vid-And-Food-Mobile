import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';

// Importamos el Provider y el Navegador que acabamos de crear
import AuthContextProvider from './services/context/AuthProvider'; // Asegúrate que sea el Provider, no el Context
import MainNavigator from './src/components/navigation/MainNavigator'; // <--- AJUSTA LA RUTA A DONDE GUARDASTE EL ARCHIVO DE ARRIBA
import ProfileScreen from './src/components/screens/Profile/ProfileScreen';

const RootStack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthContextProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" />
        
        {/* Usamos un RootStack para manejar los Tabs y los Modales globales (como Perfil) */}
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          
          {/* La pantalla principal ahora es tu sistema de TABS */}
          <RootStack.Screen 
            name="MainTabs" 
            component={MainNavigator} 
          />

          {/* Perfil queda fuera de los tabs, accesible como modal */}
          <RootStack.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ 
                presentation: 'modal', 
                animation: 'slide_from_bottom',
                headerShown: false // O true si quieres header en el perfil
            }}
          />

        </RootStack.Navigator>
      </NavigationContainer>
    </AuthContextProvider>
  );
}