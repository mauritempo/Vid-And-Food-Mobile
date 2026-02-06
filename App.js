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

const RootStack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthContextProvider>
      <WishListProvider>
        <HistoryProvider>
          <NavigationContainer>
            <StatusBar barStyle="dark-content" />

            <RootStack.Navigator screenOptions={{ headerShown: false }}>

              <RootStack.Screen
                name="MainTabs"
                component={MainNavigator}
              />

              <RootStack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                  headerShown: false
                }}
              />
              
              
            </RootStack.Navigator>
          </NavigationContainer>
        </HistoryProvider>
      </WishListProvider>
    </AuthContextProvider>
  );
}