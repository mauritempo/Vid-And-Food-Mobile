import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'vf-token';
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const getWineOfMonth = async () => {
    try {
        const response = await fetch(`${API_URL}/Wine/wine-of-month`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });
        if (!response.ok) throw new Error('Error al obtener el vino del mes');
        return await response.json();
    } catch (error) {
        console.error("Error en getWineOfMonth:", error);
        throw error;
    }
};

export const getWines = async () => {
    try {
        console.log(`${API_URL}/Wine/all-wines`)
        const response = await fetch(`${API_URL}/Wine/all-wines`);
        console.log(response)

        if (!response.ok) {
            throw new Error(`Error en la petición al servidor: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching wines:", error);
        throw error;
    }
};

export const addReview = async (wineId, { score, comment }, token) => {
    const tokenToUse = token ?? await AsyncStorage.getItem(TOKEN_KEY);

    if (!tokenToUse) {
        throw new Error("Token de autenticación no proporcionado.");
    }

    const url = `${API_URL}/Wine/${wineId}/rate`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenToUse}`,
            },
            body: JSON.stringify({
                score: score,
                review: comment // El backend probablemente espera "review" o "comment" en el DTO
            }),
        });

        if (!response.ok) {
            // Manejo robusto de errores (texto o json)
            const errorText = await response.text();
            let errorMessage = `Error ${response.status}`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorJson.title || errorText;
            } catch (e) {
                errorMessage = errorText;
            }
            console.error("❌ Error enviando reseña:", errorMessage);
            throw new Error(errorMessage);
        }

        // Si devuelve 200 OK
        return true;

    } catch (error) {
        console.error("Excepción en addReview:", error);
        throw error;
    }
};


export const getWineById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/wine/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error HTTP! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data)
        return data;

    } catch (error) {
        console.error("Error en getWineById:", error);
        throw error;
    }
};

export const addFavorite = async (wineId, token) => {
    const tokenToUse = token ?? await AsyncStorage.getItem(TOKEN_KEY);
    if (!tokenToUse) throw new Error('Token de autenticación no proporcionado.');

    try {
        const url = `${API_URL}/WineUser/${wineId}/favorite`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenToUse}`,
            },
        });

        if (!response.ok) {
            let bodyText = null;
            try {
                bodyText = await response.text();
            } catch (readErr) {
                bodyText = `<no body: ${readErr.message}>`;
            }

            console.error(`addFavorite failed. URL: ${url}, status: ${response.status}`, bodyText);
            throw new Error(`Error agregando a favoritos (status ${response.status}): ${bodyText}`);
        }

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            return await response.json();
        }
        return true;
    } catch (err) {
        console.error('addFavorite exception:', err);
        throw err;
    }
};

export const removeFavorite = async (wineId, token) => {
    try {
        const tokenToUse = token ?? await AsyncStorage.getItem(TOKEN_KEY);
        const url = `${API_URL}/WineUser/${wineId}/favorite`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenToUse}`,
            },
        });

        console.log(tokenToUse)

        if (!response.ok) {
            let bodyText = null;
            try {
                bodyText = await response.text();
            } catch (readErr) {
                bodyText = `<no body: ${readErr.message}>`;
            }
            console.error(`removeFavorite failed. URL: ${url}, status: ${response.status}`, bodyText);
            throw new Error(`Error eliminando de favoritos (status ${response.status}): ${bodyText}`);
        }

        return true;
    } catch (err) {
        console.error('removeFavorite exception:', err);
        throw err;
    }
};

export const addHistory = async (wineId, token) => {
    try {
        const tokenToUse = token ?? await AsyncStorage.getItem(TOKEN_KEY);
        if (!tokenToUse) throw new Error('Token de autenticación no proporcionado.');

        const url = `${API_URL}/WineUser/${wineId}/history`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenToUse}`,
            },
        });

        if (!response.ok) {
            let bodyText = null;
            try { bodyText = await response.text(); } catch (e) { bodyText = `<no body: ${e.message}>`; }
            console.error(`addHistory failed. URL: ${url}, status: ${response.status}`, bodyText);
            throw new Error(`Error agregando al historial (status ${response.status}): ${bodyText}`);
        }

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) return await response.json();
        return true;
    } catch (err) {
        console.error('addHistory exception:', err);
        throw err;
    }
};

export const removeHistory = async (wineId, token) => {
    try {
        const tokenToUse = token ?? await AsyncStorage.getItem(TOKEN_KEY);
        const url = `${API_URL}/WineUser/${wineId}/history`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenToUse}`,
            },
        });

        if (!response.ok) {
            let bodyText = null;
            try { bodyText = await response.text(); } catch (e) { bodyText = `<no body: ${e.message}>`; }
            console.error(`removeHistory failed. URL: ${url}, status: ${response.status}`, bodyText);
            throw new Error(`Error eliminando del historial (status ${response.status}): ${bodyText}`);
        }

        return true;
    } catch (err) {
        console.error('removeHistory exception:', err);
        throw err;
    }
};



export const fetchFavourites = async (token) => {
    const tokenToUse = token ?? await AsyncStorage.getItem(TOKEN_KEY);

    if (!tokenToUse) {
        throw new Error("Token de autenticación no proporcionado.");
    }

    try {
        const response = await fetch(`${API_URL}/WineUser/favorites`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenToUse}`,
            },
        });

        const responseText = await response.text();

        if (!response.ok) {
            let errorMessage = `Error ${response.status}`;
            try {
                const errorJson = JSON.parse(responseText);
                errorMessage = errorJson.message || errorJson.title || responseText;
            } catch (e) {
                errorMessage = responseText;
            }
            throw new Error(errorMessage);
        }

        try {
            return JSON.parse(responseText);
        } catch (e) {
            console.error("El servidor devolvió 200 OK pero no es un JSON válido:", responseText);
            // Si la respuesta es vacía o texto plano, retornamos array vacío para no romper la app
            return [];
        }

    } catch (error) {
        console.error("Error en fetchFavourites:", error);
        throw error;
    }
};

export const fetchHistory = async (token) => {
    if (!token) {
        return [];
    }
    const url = `${API_URL}/WineUser/history`
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            let errorMessage = `Error ${response.status} al obtener historial.`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                const body = await response.text().catch(() => '<no body>');
                console.error(`fetchHistory: Falló la lectura JSON, cuerpo:`, body);
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            console.warn('fetchHistory: La API no devolvió un array. Devolviendo vacío.');
            return [];
        }

        const ids = data.map((item) => {
            if (typeof item === 'string' || typeof item === 'number') {
                return item.toString();
            }

            if (item) {
                if (item.wine && (item.wine.id || item.wine._id)) {
                    return (item.wine.id ?? item.wine._id).toString();
                }
                return (item.id ?? item.wineId ?? item._id)?.toString();
            }
            return null;
        }).filter(Boolean);

        return ids;

    } catch (e) {
        console.error('Error fatal en fetchHistory:', e);
        throw e;
    }
};