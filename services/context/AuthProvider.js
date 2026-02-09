import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from './AuthContext';
import {
  loginRequest as loginApi,
  registerRequest as registerApi,
  decodeToken,
  mapClaimsToUser,
} from '../AuthService';

const USER_KEY = 'vf-user';
const TOKEN_KEY = 'vf-token';

const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para el Modal de Autenticación
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  // 1. CARGAR SESIÓN AL INICIAR APP
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedUser = await AsyncStorage.getItem(USER_KEY);
        const savedToken = await AsyncStorage.getItem(TOKEN_KEY);

        if (savedUser && savedToken) {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
        }
      } catch (error) {
        console.error('Error cargando sesión', error);
        await AsyncStorage.removeItem(USER_KEY);
        await AsyncStorage.removeItem(TOKEN_KEY);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };

    loadSession();
  }, []);

  const isAuthenticated = !!token;

  const onLogin = (userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);
  };

  const onLogout = async () => {
    setUser(null);
    setToken(null);
    try {
      await AsyncStorage.removeItem(USER_KEY);
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error("Error al limpiar storage en logout", e);
    }
  };

  // 2. GUARDAR SESIÓN AUTOMÁTICAMENTE CUANDO CAMBIA USER O TOKEN
  useEffect(() => {
    const saveSession = async () => {
      try {
        if (user && token) {
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
          await AsyncStorage.setItem(TOKEN_KEY, token);
        } else if (!loading) {
          // Si no hay user/token y ya terminó de cargar, limpiar storage
          await AsyncStorage.removeItem(USER_KEY);
          await AsyncStorage.removeItem(TOKEN_KEY);
        }
      } catch (error) {
        console.error('Error guardando sesión', error);
      }
    };
    saveSession();
  }, [user, token, loading]);

  const updateSession = (newToken) => {
    if (!newToken) return;

    console.log("Actualizando sesión en caliente (updateSession)...");
    
    setToken(newToken);

    try {
      const claims = decodeToken(newToken);
      const updatedUser = mapClaimsToUser(claims);
      
      if (updatedUser) {
        setUser(prevUser => ({
            ...prevUser, 
            ...updatedUser 
        }));
      }
    } catch (e) {
      console.error("Error actualizando claims de usuario en updateSession", e);
    }
  };

  // 3. API REQUESTS
  const loginRequest = async ({ email, password }) => {
    try {
      const loginResponse = await loginApi({ email, password });
      const tokenValue = loginResponse.token;

      if (!tokenValue) {
        throw new Error('No se recibió token desde el backend');
      }

      const claims = decodeToken(tokenValue);
      const mapped = mapClaimsToUser(claims) || {
        id: claims?.sub ?? null,
        email,
        role: 'User',
      };

      console.log('LOGIN MOBILE - userData mapeado:', mapped);
      onLogin(mapped, tokenValue);

      return { user: mapped, token: tokenValue };
    } catch (error) {
      throw error;
    }
  };

  const registerRequest = async ({ email, password, fullName }) => {
    await registerApi({ email, password, fullName });
    return loginRequest({ email, password });
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const switchMode = () => {
    setAuthModalMode((prev) => (prev === 'login' ? 'register' : 'login'));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        onLogin,
        onLogout,
        
        // Función nueva expuesta:
        updateSession, 
        
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        switchMode,
        loginRequest,
        registerRequest,
      }}
    >
      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
          }}
        >
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ marginTop: 10 }}>Cargando sesión...</Text>
        </View>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;