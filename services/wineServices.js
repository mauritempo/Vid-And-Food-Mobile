import { fetch } from 'expo/fetch';
import { API_URL } from "@env";
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'vf-token';


export const getWines = async () => {
    try {
        // Usa backticks (`) para que ${API_URL} se evalúe correctamente
        const response = await fetch(`${API_URL}/Wine/all-wines`);

        if (!response.ok) {
            // Un error 404 o 500 entraría aquí
            throw new Error(`Error en la petición al servidor: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching wines:", error);
        // Puedes lanzar el error de nuevo para que el componente que llama lo maneje
        throw error;
    }
};


export const getWineById = async (id) => {
    try {
        // Hacemos la petición GET concatenando el ID
        const response = await fetch(`${API_URL}/wine/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Si usas tokens de autenticación, agrégalos aquí:
                // 'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            // Manejo de errores si el backend devuelve 404 o 500
            throw new Error(`Error HTTP! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data)
        return data; // Retorna el objeto completo del vino (con descripción, etc.)

    } catch (error) {
        console.error("Error en getWineById:", error);
        // Es importante relanzar el error o retornar null para que el componente sepa que falló
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
            // Intenta leer el body para obtener más contexto
            let bodyText = null;
            try {
                bodyText = await response.text();
            } catch (readErr) {
                bodyText = `<no body: ${readErr.message}>`;
            }

            console.error(`addFavorite failed. URL: ${url}, status: ${response.status}`, bodyText);
            throw new Error(`Error agregando a favoritos (status ${response.status}): ${bodyText}`);
        }

        // Si devuelve JSON, parsearlo; si no, devolver true
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
    // IMPORTANTE: Aquí asumo que el endpoint recibe el wineId para borrar la relación.
    // Si tu backend pide el ID de la "relación" en vez del ID del vino, avísame.
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

// --- HISTORIAL ---
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
    // Es clave que 'TOKEN_KEY' y 'AsyncStorage' estén importados.
    // Usamos '??' (nullish coalescing) para que lea del almacenamiento solo si 'token' es null o undefined.
    const tokenToUse = token ?? await AsyncStorage.getItem(TOKEN_KEY); 
    
    // --- ERROR CORREGIDO AQUÍ ---
    // El 'if' no tenía llave de cierre correcta o estaba mal ubicado.
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

        if (!response.ok) {
            // Manejo de errores 401, 403, 500, etc.
            const errorData = await response.json();
            throw new Error(errorData.message || `Error al obtener favoritos: ${response.status}`);
        }
        
        // Es necesario devolver la data si la respuesta fue exitosa
        return await response.json(); 
        
    } catch (error) { // El bloque 'catch' debe incluir la variable de error y llaves
        console.error("Error en fetchFavourites:", error);
        // Puedes relanzar el error o devolver un valor por defecto si falla
        throw error; 
    }
};





// --- HISTORIAL: obtener lista de IDs vistos por el usuario ---
export const fetchHistory = async (token) => {
    // 1. Validar autenticación primero
    if (!token) {
        // En lugar de lanzar un error, devolvemos una lista vacía si no hay token,
        // ya que esto es manejado por el HistoryProvider.
        return []; 
    }
    const url = `${API_URL}/WineUser/history`
    try {
        const response = await fetch(url,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Enviamos el token para autorización
                Authorization: `Bearer ${token}`, 
            },
        });

        // 2. Manejo de errores de la respuesta HTTP
        if (!response.ok) {
            let errorMessage = `Error ${response.status} al obtener historial.`;
            try {
                // Intentar leer el cuerpo como JSON para obtener un mensaje detallado
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // Si falla la lectura de JSON, leer como texto (solo para log)
                const body = await response.text().catch(() => '<no body>');
                console.error(`fetchHistory: Falló la lectura JSON, cuerpo:`, body);
            }
            // Lanzamos un error claro
            throw new Error(errorMessage);
        }

        // 3. Procesar y normalizar los datos
        const data = await response.json();
        
        // El backend debe devolver un array de items (IDs o wrappers de vino)
        if (!Array.isArray(data)) {
             console.warn('fetchHistory: La API no devolvió un array. Devolviendo vacío.');
             return [];
        }

        // 4. Normalizar a array de IDs de vino (strings)
        const ids = data.map((item) => {
            if (typeof item === 'string' || typeof item === 'number') {
                return item.toString(); // Caso 1: Array de IDs puros
            }
            
            // Caso 2: Array de objetos ({ id: 1, ... } o { wine: { id: 1, ... } })
            if (item) {
                // Primero intenta sacar el ID de un objeto 'wine' wrapper (si el backend lo envuelve)
                if (item.wine && (item.wine.id || item.wine._id)) {
                    return (item.wine.id ?? item.wine._id).toString();
                }
                // Si no hay wrapper, intenta usar las propiedades del objeto raíz
                return (item.id ?? item.wineId ?? item._id)?.toString();
            }
            return null;
        }).filter(Boolean); // Filtramos cualquier valor nulo, undefined o cadena vacía

        return ids;

    } catch (e) {
        console.error('Error fatal en fetchHistory:', e);
        // Relanzamos un error para que el componente que llama (HistoryProvider) lo maneje
        throw e;
    }
};