import React, { useCallback, useContext, useEffect, useState } from 'react';
import WishListContext from './WishListContext';
import AuthContext from './AuthContext';
import * as WineService from '../wineServices'
// Importamos AsyncStorage, pero ya no lo necesitamos para leer el token aquí
// import AsyncStorage from '@react-native-async-storage/async-storage'; 


const WishListProvider = ({ children }) => {
    const { token } = useContext(AuthContext);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);

    // ❌ ELIMINADA ESTA LÍNEA, YA QUE EL TOKEN YA VIENE DEL CONTEXTO:
    // const toknGet = AsyncStorage.getItem(token) 
    
    const loadFavorites = useCallback(async () => {
        if (!token) {
            setFavorites([]);
            return;
        }

        setLoading(true);
        try {
            // ✅ CORRECCIÓN: Usamos la variable 'token' directamente del Contexto
            const data = await WineService.fetchFavourites(token); 
            
            // data expected array of wines or ids — normalize to ids
            const ids = Array.isArray(data) ? data.map((w) => w.id ?? w.wineId ?? w) : [];
            setFavorites(ids);
        } catch (e) {
            console.error('Error cargando favoritos:', e);
            setFavorites([]);
        } finally {
            setLoading(false);
        }
    }, [token]); // La dependencia 'token' es la única que necesitamos

    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    const isFavorite = useCallback((id) => favorites.includes(id), [favorites]);

    const toggleFavorite = useCallback(
        async (id) => {
            if (!token) throw new Error('User not authenticated');

            const wasFav = favorites.includes(id);
            // Optimistic update
            setFavorites((prev) => (wasFav ? prev.filter((x) => x !== id) : [...prev, id]));

            try {
                // ✅ CORRECCIÓN: Usamos la variable 'token' directamente
                if (wasFav) {
                    await WineService.removeFavorite(id, token);
                } else {
                    await WineService.addFavorite(id, token);
                }
            } catch (e) {
                // Revert on error
                console.error('toggleFavorite error:', e);
                setFavorites((prev) => (wasFav ? [...prev, id] : prev.filter((x) => x !== id)));
                throw e;
            }
        },
        [favorites, token]
    );

    const refresh = useCallback(() => loadFavorites(), [loadFavorites]);

    return (
        <WishListContext.Provider value={{ favorites, isFavorite, toggleFavorite, loading, refresh }}>
            {children}
        </WishListContext.Provider>
    );
};

export default WishListProvider;