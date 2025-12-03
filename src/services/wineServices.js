import * as Expo from 'expo';
import { fetch } from 'expo/fetch';

const API_URL = 'https://qggz0z4d-5122.brs.devtunnels.ms/api'; // Nota: Añadí el puerto 5122 también, si es necesario globalmente

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