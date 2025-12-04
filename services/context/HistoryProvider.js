import React, { useCallback, useContext, useEffect, useState } from 'react';
import HistoryContext from './HistoryContext';
import AuthContext from './AuthContext';
import * as WineService from '../wineServices' // Asegúrate de que esta ruta sea correcta

const HistoryProvider = ({ children }) => {
    const { token } = useContext(AuthContext);
    const [history, setHistory] = useState([]);

    // 🆕 FUNCIÓN PARA CARGAR EL HISTORIAL DESDE EL BACKEND 🆕
    const loadInitialHistory = useCallback(async () => {
        if (!token) {
            setHistory([]);
            return;
        }
        
        try {
            // Llamamos al nuevo servicio
            const historyIds = await WineService.fetchHistory(token)
            setHistory(historyIds);
        } catch (e) {
            console.error('Error cargando historial inicial:', e);
            setHistory([]); // Fallback a vacío
        }
    }, [token]);


    // 🔄 EFECTO PARA CARGAR AL INICIO DE SESIÓN 🔄
    useEffect(() => {
        loadInitialHistory();
    }, [token, loadInitialHistory]); // Se ejecuta al montar o cuando el token cambia.


    const isInHistory = useCallback((id) => history.includes(id), [history]);

    // Usamos loadInitialHistory para la función refresh
    const refreshHistory = useCallback(() => {
        loadInitialHistory();
    }, [loadInitialHistory]); 


    const toggleHistoryLocal = useCallback(
        async (id) => {
            if (!token) throw new Error('User not authenticated');

            const wasIn = history.includes(id);
            setHistory((prev) => (wasIn ? prev.filter((x) => x !== id) : [...prev, id]));

            try {
                if (wasIn) {
                    await WineService.removeHistory(id, token);
                } else {
                    await WineService.addHistory(id, token);
                }
            } catch (e) {
                console.error('toggleHistoryLocal error:', e);
                setHistory((prev) => (wasIn ? [...prev, id] : prev.filter((x) => x !== id)));
                throw e;
            }
        },
        [history, token]
    );

    return (
        <HistoryContext.Provider value={{ history, isInHistory, toggleHistoryLocal, refreshHistory }}>
            {children}
        </HistoryContext.Provider>
    );
};

export default HistoryProvider;