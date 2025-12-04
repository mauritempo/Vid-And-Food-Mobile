import { createContext } from 'react';

const WishListContext = createContext({
    favorites: [],
    isFavorite: (id) => false,
    toggleFavorite: async (id) => { },
    refresh: async () => { },
});

export default WishListContext;
