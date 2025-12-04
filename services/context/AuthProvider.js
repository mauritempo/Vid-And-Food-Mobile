import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native"; // <--- Importamos componentes nativos
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from "./AuthContext";
import * as authService from "../AuthService";

const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Inicializamos en null. El useEffect se encarga de llenarlo después.
  const [token, setToken] = useState(null); 
  const [loading, setLoading] = useState(true);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");

  // 1. CARGA INICIAL
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("vf-user");
        const savedToken = await AsyncStorage.getItem("vf-token");

        if (savedUser && savedToken) {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
        }
      } catch (error) {
        console.error("Error cargando sesión", error);
        await AsyncStorage.removeItem("vf-user");
        await AsyncStorage.removeItem("vf-token");
      } finally {
        // Pequeño delay para que no parpadee si la carga es muy rápida
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    loadSession();
  }, []);

  const isAuthenticated = !!token;

  const onLogin = (userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);
  };

  const onLogout = () => {
    setUser(null);
    setToken(null);
  };

  // 2. GUARDADO DE DATOS (PERSISTENCIA)
  useEffect(() => {
    const saveSession = async () => {
        try {
            if (user && token) {
                await AsyncStorage.setItem("vf-user", JSON.stringify(user));
                await AsyncStorage.setItem("vf-token", token);
            } else if (!loading) {
                // Solo borramos si ya terminó de cargar la app (para no borrar al inicio por error)
                await AsyncStorage.removeItem("vf-user");
                await AsyncStorage.removeItem("vf-token");
            }
        } catch (error) {
            console.error("Error guardando sesión", error);
        }
    };
    saveSession();
  }, [user, token, loading]);

  const loginRequest = async ({ email, password }) => {
    const loginUser = await authService.loginRequest({ email, password });
    const tokenValue = loginUser.token

    if (!tokenValue) {
      throw new Error("No se recibió token desde el backend");
    }

    const userData = { email }
    onLogin(userData, tokenValue);
    return { user: userData, token: tokenValue };
  };

  const registerRequest = async ({ email, password, fullName }) => {
    const registerUser = await authService.registerRequest({ email, password, fullName })
    
    const loginData = await authService.loginRequest({ email, password });
    const tokenValue = loginData.token;

    if (!tokenValue) {
      throw new Error("No se recibió token desde el backend");
    }
    
    const userData = {
      id: registerUser.id,
      email: registerUser.email,
      name: registerUser.fullName,
      role: registerUser.role,
      isActive: registerUser.isActive,
    };

    onLogin(userData, tokenValue);
    return { user: userData , token: tokenValue };
  };

  const openAuthModal = (mode = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const switchMode = () => {
    setAuthModalMode((prev) => (prev === "login" ? "register" : "login"));
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
        // REEMPLAZO DEL GLOBAL LOADER:
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#fff' }}>
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