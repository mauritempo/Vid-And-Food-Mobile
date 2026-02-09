import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SettingsScreen from './src/components/screen/Profile/SettingScreen';
import AuthContextProvider from './services/context/AuthProvider'; 
import HistoryProvider from './services/context/HistoryProvider';
import MainNavigator from './src/components/navigation/MainNavigator'; 
import ProfileScreen from './src/components/screens/Profile/ProfileScreen';
import WishListProvider from './services/context/WishListProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import WineDetailScreen from './src/components/screens/WineDetail/WineDetailScreen';
import RegisterScreen from './src/components/screens/Register/RegisterScreen';

const RootStack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthContextProvider>
       <GestureHandlerRootView style={{ flex: 1 }}>
      <WishListProvider>
        <HistoryProvider>
          <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                
                {/* 1. TUS TABS PRINCIPALES */}
                <RootStack.Screen name="MainTabs" component={MainNavigator} />
                
                {/* 2. PERFIL (MODAL) */}
                <RootStack.Screen 
                    name="Profile" 
                    component={ProfileScreen} 
                    options={{ 
                        presentation: 'modal', 
                        animation: 'slide_from_bottom' 
                    }} 
                />

                {/* 3. REGISTRO - CORREGIDO */}
                {/* Al poner 'fullScreenModal', forzamos a que se monte ENCIMA del modal de Perfil */}
                <RootStack.Screen 
                    name="Register" 
                    component={RegisterScreen}
                    options={{ 
                        presentation: 'fullScreenModal', 
                        animation: 'slide_from_bottom'
                    }} 
                />

                {/* 4. SETTINGS - CORREGIDO */}
                {/* 'containedModal' a veces falla dependiendo de la versión, 
                     es más seguro usar 'modal' o 'fullScreenModal' para apilar modales */}
                <RootStack.Screen 
                    name="Settings" 
                    component={SettingsScreen} 
                    options={{ 
                        presentation: 'modal', // Esto hará que aparezca como otra carta encima
                        animation: 'slide_from_right', // O la animación que prefieras
                        headerShown: false 
                    }} 
                />
                
                <RootStack.Screen name="WineDetail" component={WineDetailScreen} />
            </RootStack.Navigator>
          </NavigationContainer>
        </HistoryProvider>
      </WishListProvider>
 </GestureHandlerRootView>
    </AuthContextProvider>
  );
}