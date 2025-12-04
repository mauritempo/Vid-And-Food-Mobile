import { fetch } from 'expo/fetch';
import { API_URL } from "@env";
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

export const addFavorite = async (wineId) => {
    const response = await fetch(`${API_URL}/WineUser/${wineId}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error("Error agregando a favoritos");
    return response.json(); // O response.text() si no devuelve JSON
};

export const removeFavorite = async (wineId) => {
    // IMPORTANTE: Aquí asumo que el endpoint recibe el wineId para borrar la relación.
    // Si tu backend pide el ID de la "relación" en vez del ID del vino, avísame.
    const response = await fetch(`${API_URL}/WineUser/${wineId}/favorite`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error("Error eliminando de favoritos");
    // Los delete a veces no devuelven nada, así que retornamos true
    return true; 
};

// --- HISTORIAL ---
export const addHistory = async (wineId) => {
    const response = await fetch(`${API_URL}/WineUser/${wineId}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error("Error agregando al historial");
    return response.json();
};

export const removeHistory = async (wineId) => {
    const response = await fetch(`${API_URL}/WineUser/${wineId}/history`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error("Error eliminando del historial");
    return true;
};
