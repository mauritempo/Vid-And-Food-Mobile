import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../../../../services/context/AuthContext';
import { upgradeToSommelier } from '../../../../services/UserService';
import { COLORS } from '../../../theme/theme';

const SubscribeScreen = () => {
    const { token, refreshUser } = useContext(AuthContext); // Asumo que tienes refreshUser para actualizar el rol en la app
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            await upgradeToSommelier(token);
            setModalVisible(false);
            Alert.alert(
                "¡Felicidades Sommelier!", 
                "Tu suscripción se ha activado correctamente.",
                [{ text: "Excelente", onPress: () => refreshUser && refreshUser() }]
            );
        } catch (e) {
            console.error('Upgrade error:', e);
            Alert.alert("Error", "No pudimos procesar tu suscripción. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const BenefitItem = ({ icon, text }) => (
        <View style={styles.benefitRow}>
            <Ionicons name={icon} size={22} color={COLORS.primary || "#722F37"} />
            <Text style={styles.benefitText}>{text}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Ionicons name="ribbon-outline" size={80} color="#722F37" style={{ marginBottom: 20 }} />
            
            <Text style={styles.title}>Membresía Sommelier</Text>
            <Text style={styles.subtitle}>Eleva tu pasión por el vino al siguiente nivel.</Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Beneficios Exclusivos:</Text>
                <BenefitItem icon="star" text="Acceso completo al catálogo de bodegas." />
                <BenefitItem icon="heart" text="Guarda tus vinos favoritos ilimitadamente." />
                <BenefitItem icon="list" text="Historial detallado de catas y visitas." />
                <BenefitItem icon="checkmark-circle" text="Reseñas y puntuaciones verificadas." />
                
                <TouchableOpacity 
                    style={styles.subscribeBtn} 
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.subscribeBtnText}>Mejorar mi cuenta</Text>
                </TouchableOpacity>
            </View>

            {/* MODAL DE CONFIRMACIÓN */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.confirmTitle}>¿Confirmar Suscripción?</Text>
                        <Text style={styles.confirmMsg}>
                            Al confirmar, tu cuenta pasará a ser de nivel **Sommelier**. Podrás acceder a todas las funciones restringidas.
                        </Text>
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.modalBtn, styles.cancelBtn]} 
                                onPress={() => setModalVisible(false)}
                                disabled={loading}
                            >
                                <Text style={styles.cancelBtnText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.modalBtn, styles.confirmBtn]} 
                                onPress={handleUpgrade}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.confirmBtnText}>Confirmar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#FDFCFB',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    card: {
        width: '100%',
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#F0E6E6',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 20,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    benefitText: {
        fontSize: 15,
        color: '#555',
        marginLeft: 12,
    },
    subscribeBtn: {
        backgroundColor: '#722F37', // Color vino tinto
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    subscribeBtnText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: 'bold',
    },
    // Estilos del Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
    },
    confirmTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    confirmMsg: {
        textAlign: 'center',
        color: '#666',
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
    },
    modalBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelBtn: {
        backgroundColor: '#EEE',
    },
    confirmBtn: {
        backgroundColor: '#722F37',
    },
    cancelBtnText: {
        color: '#666',
        fontWeight: '600',
    },
    confirmBtnText: {
        color: '#FFF',
        fontWeight: '600',
    },
});

export default SubscribeScreen;