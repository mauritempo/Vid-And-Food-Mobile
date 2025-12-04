import React, { useContext } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import AuthContext from '../../../../services/context/AuthContext';
import { upgradeToSommelier } from '../../../../services/UserService';

const SubscribeScreen = () => {
    const { token } = useContext(AuthContext);

    const handlePress = async () => {
        try {
            await upgradeToSommelier(token);
        } catch (e) {
            console.error('Upgrade press error:', e);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🍷 Acceso Restringido 🍷</Text>
            <Text style={styles.message}>
                Esta función está disponible solo para usuarios con la suscripción **Sommelier**.
            </Text>
            <Button
                title="Ver Opciones de Suscripción"
                onPress={handlePress}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#A00',
    },
    message: {
        textAlign: 'center',
        marginBottom: 30,
        fontSize: 16,
        color: '#666',
    },
});

export default SubscribeScreen;