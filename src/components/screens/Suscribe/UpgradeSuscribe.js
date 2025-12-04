import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert } from 'react-native';

// Asegúrate de ajustar las rutas de importación:
import AuthContext from '../../../../services/context/AuthContext';
import { upgradeToSommelier } from '../../../../services/UserService';
// Asumo que tienes una forma de navegar, podrías inyectarla con useNavigation si fuera necesario.

const UpgradeScreen = ({ navigation }) => {
    // Necesitas el token y la función para actualizar el usuario localmente (onLogin)
    const { token, user, onLogin } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgrade = async () => {
        if (!token) {
            Alert.alert("Error", "Debes iniciar sesión para actualizar tu suscripción.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await upgradeToSommelier(token);

            const updatedUser = {
                ...user,
                role: 'Sommelier'
            };
            onLogin(updatedUser, response.token || token);

            Alert.alert(
                "¡Éxito!",
                "Tu suscripción ha sido actualizada a Sommelier. ¡Ahora tienes acceso a funciones exclusivas!"
            );

            if (navigation) {
                navigation.goBack();
            }

        } catch (error) {
            Alert.alert("Error de Pago/Servidor", error.message || "No se pudo completar la transacción.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Actualizar a Suscripción Sommelier</Text>
            <Text style={styles.price}>Precio: $9.99/mes (simulado)</Text>

            <View style={styles.buttonContainer}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#A00" />
                ) : (
                    <Button
                        title="Pagar y Actualizar Rol"
                        onPress={handleUpgrade}
                        color="#A00"
                        disabled={!user} // Deshabilitar si el usuario no está cargado
                    />
                )}
            </View>
            <Text style={styles.note}>
                Al presionar, se actualizará tu rol en la cuenta a 'Sommelier'.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    price: {
        fontSize: 18,
        color: '#333',
        marginBottom: 30,
    },
    buttonContainer: {
        width: '80%',
        marginVertical: 20,
    },
    note: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 12,
        color: '#666',
    }
});

export default UpgradeScreen;