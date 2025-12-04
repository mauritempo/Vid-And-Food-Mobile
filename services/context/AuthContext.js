import { createContext } from "react";

const AuthContext = createContext({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,

    onLogin: () => {},
    onLogout: () => {},

    isAuthModalOpen: false,
    authModalMode: "login", 
    openAuthModal: () => {},
    closeAuthModal: () => {},
    switchMode: () => {},

    loginRequest: async () => {},
    registerRequest: async () => {},
});

export default AuthContext;