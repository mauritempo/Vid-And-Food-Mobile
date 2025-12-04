import { createContext } from 'react';

const HistoryContext = createContext({
    history: [],
    isInHistory: (id) => false,
    toggleHistoryLocal: async (id) => { },
    refreshHistory: async () => { },
});

export default HistoryContext;
