import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';

import SettingsScreen from './src/components/screen/Profile/SettingScreen';
import AuthContextProvider from './services/context/AuthProvider'; 
import HistoryProvider from './services/context/HistoryProvider';
import MainNavigator from './src/components/navigation/MainNavigator'; 
import ProfileScreen from './src/components/screens/Profile/ProfileScreen';
import WishListProvider from './services/context/WishListProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import WineDetailScreen from './src/components/screens/WineDetail/WineDetailScreen';

const RootStack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthContextProvider>
       <GestureHandlerRootView style={{ flex: 1 }}>
      <WishListProvider>
        <HistoryProvider>
          <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                <RootStack.Screen name="MainTabs" component={MainNavigator} />
                
                <RootStack.Screen 
                    name="Profile" 
                    component={ProfileScreen} 
                    options={{ presentation: 'modal', animation: 'slide_from_bottom' }} 
                />

                {/* VOLVÉ A PONERLA ACÁ: */}
                <RootStack.Screen 
                name="Settings" 
                component={SettingsScreen} 
                options={{ 
                    presentation: 'containedModal', // Esto fuerza a que se encime sobre otros modales
                    animation: 'slide_from_right',
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