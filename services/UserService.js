
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = "vf-token";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const upgradeToSommelier = async (token) => {
    const tokenToUse = token ?? await AsyncStorage.getItem(TOKEN_KEY);
    console.log('Token que se usa en Authorization:', tokenToUse);

    if (!tokenToUse) {
        throw new Error("Token de autenticación no proporcionado (pasar token o guardarlo en AsyncStorage).");
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

        const text = await response.text();
        AsyncStorage.setItem(tokenToUse)
        console.log('upgradeToSommelier status:', response.status);
        console.log('upgradeToSommelier raw body:', text);

        let data = null;
        if (text) {
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.warn('No se pudo parsear JSON, body:', text);
            }
        }

        if (!response.ok) {
            throw new Error(data?.message || `Error al actualizar la suscripción: ${response.status}`);
        }

        return data ?? { success: true };

    } catch (error) {
        console.error("Error en upgradeToSommelier:", error);
        throw error;
    }
};


export const downgradeToUser = async (token) => {
    const tokenToUse = token ?? await AsyncStorage.getItem(TOKEN_KEY);
    console.log('Token que se usa en Authorization (Downgrade):', tokenToUse);

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
        console.log('downgradeToUser status:', response.status);
        console.log('downgradeToUser raw body:', text);

        let data = null;
        if (text) {
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.warn('No se pudo parsear JSON en downgrade, body:', text);
            }
        }

        if (!response.ok) {
            throw new Error(data?.message || `Error al dar de baja la suscripción: ${response.status}`);
        }

        return data ?? { success: true };

    } catch (error) {
        console.error("Error en downgradeToUser:", error);
        throw error;
    }
};