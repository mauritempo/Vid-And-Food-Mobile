import React, { useCallback, useContext, useEffect, useState } from 'react';
import WishListContext from './WishListContext';
import AuthContext from './AuthContext';
import {
  fetchFavourites,
  addFavorite,
  removeFavorite,
} from '../wineServices';

const WishListProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadFavorites = useCallback(async () => {
    if (!token) {
      setFavorites([]);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchFavourites(token);

      const ids = Array.isArray(data)
        ? data.map((w) => (w.id ?? w.wineId ?? w).toString())
        : [];

      setFavorites(ids);
    } catch (e) {
      console.error('Error cargando favoritos:', e);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const isFavorite = useCallback(
    (id) => favorites.includes(id.toString()),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (id) => {
      if (!token) throw new Error('User not authenticated');

      const strId = id.toString();
      const wasFav = favorites.includes(strId);

      setFavorites((prev) =>
        wasFav ? prev.filter((x) => x !== strId) : [...prev, strId]
      );

      try {
        if (wasFav) {
          await removeFavorite(strId, token);
        } else {
          await addFavorite(strId, token);
        }
      } catch (e) {
        console.error('toggleFavorite error:', e);
        setFavorites((prev) =>
          wasFav ? [...prev, strId] : prev.filter((x) => x !== strId)
        );
        throw e;
      }
    },
    [favorites, token]
  );

  const refresh = useCallback(() => loadFavorites(), [loadFavorites]);

  return (
    <WishListContext.Provider
      value={{ favorites, isFavorite, toggleFavorite, loading, refresh }}
    >
      {children}
    </WishListContext.Provider>
  );
};

export default WishListProvider;
