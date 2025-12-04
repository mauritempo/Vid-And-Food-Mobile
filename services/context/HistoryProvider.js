import React, { useCallback, useContext, useEffect, useState } from 'react';
import HistoryContext from './HistoryContext';
import AuthContext from './AuthContext';
import { fetchHistory, addHistory, removeHistory } from '../wineServices';

const HistoryProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [history, setHistory] = useState([]);

  const loadInitialHistory = useCallback(async () => {
    if (!token) {
      setHistory([]);
      return;
    }

    try {
      const data = await fetchHistory(token);
      const ids = Array.isArray(data) ? data.map((id) => id.toString()) : [];
      setHistory(ids);
    } catch (e) {
      console.error('Error cargando historial inicial:', e);
      setHistory([]);
    }
  }, [token]);

  useEffect(() => {
    loadInitialHistory();
  }, [loadInitialHistory]);

  const isInHistory = useCallback(
    (id) => history.includes(id.toString()),
    [history]
  );

  const toggleHistoryLocal = useCallback(
    async (id) => {
      if (!token) throw new Error('User not authenticated');

      const strId = id.toString();
      const wasIn = history.includes(strId);

      setHistory((prev) =>
        wasIn ? prev.filter((x) => x !== strId) : [...prev, strId]
      );

      try {
        if (wasIn) {
          await removeHistory(strId, token);
        } else {
          await addHistory(strId, token);
        }
      } catch (e) {
        console.error('toggleHistoryLocal error:', e);
        setHistory((prev) =>
          wasIn ? [...prev, strId] : prev.filter((x) => x !== strId)
        );
        throw e;
      }
    },
    [history, token]
  );

  const refreshHistory = useCallback(() => loadInitialHistory(), [
    loadInitialHistory,
  ]);

  return (
    <HistoryContext.Provider
      value={{ history, isInHistory, toggleHistoryLocal, refreshHistory }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export default HistoryProvider;
