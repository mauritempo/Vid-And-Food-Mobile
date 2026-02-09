
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = "vf-token";
const API_URL = process.env.EXPO_PUBLIC_API_URL;


export const upgradeToSommelier = async (token) => {
    // 1. Obtener el token actual para la cabecera
    const tokenToUse = token ?? await AsyncStorage.getItem(TOKEN_KEY);

    if (!tokenToUse) {
        throw new Error("Token de autenticación no proporcionado.");
    }

    try {
        const response = await fetch(`${API_URL}/User/upgrade-to-sommelier`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${tokenToUse}`,
            },
        });

        // 2. Parseamos la respuesta
        const text = await response.text();
        let data = null;
        
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            console.warn('No se pudo parsear JSON, body:', text);
        }

        if (!response.ok) {
            throw new Error(data?.message || `Error al actualizar la suscripción: ${response.status}`);
        }

        // --- CORRECCIÓN AQUÍ ---
        // 3. Si el backend devolvió un nuevo token, lo guardamos
        if (data && data.token) {
            console.log('Nuevo token recibido, actualizando Storage...');
            await AsyncStorage.setItem(TOKEN_KEY, data.token);
        }
        // -----------------------

        return data ?? { success: true };

    } catch (error) {
        console.error("Error en upgradeToSommelier:", error);
        throw error;
    }
};

export const downgradeToUser = async (token) => {
    const tokenToUse = token ?? await AsyncStorage.getItem(TOKEN_KEY);

    if (!tokenToUse) {
        throw new Error("Token de autenticación no proporcionado.");
    }

    try {
        const response = await fetch(`${API_URL}/User/downgrade-to-user`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${tokenToUse}`,
            },
        });

        const text = await response.text();
        let data = null;

        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            console.warn('No se pudo parsear JSON en downgrade, body:', text);
        }

        if (!response.ok) {
            throw new Error(data?.message || `Error al dar de baja la suscripción: ${response.status}`);
        }

        // --- CORRECCIÓN AQUÍ ---
        // Si al hacer downgrade también cambia el token (ej. cambian los roles en el token JWT)
        if (data && data.token) {
            console.log('Nuevo token recibido tras downgrade, actualizando Storage...');
            await AsyncStorage.setItem(TOKEN_KEY, data.token);
        }
        // -----------------------

        return data ?? { success: true };

    } catch (error) {
        console.error("Error en downgradeToUser:", error);
        throw error;
    }
};
export const registerUser = async ({ fullName, email, password }) => {
  try {
    const response = await fetch(`${API_URL}/User/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName,
        email,
        password,
        // Agrega aquí otros campos si tu backend los pide (ej. role: 'User')
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al registrar el usuario');
    }

    return data;
  } catch (error) {
    console.error('Registration Error:', error);
    throw error;
  }
};