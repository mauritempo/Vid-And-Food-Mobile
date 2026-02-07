import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
// ✅ CORRECTO
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../../theme/theme';

import { getWineById, addHistory, addReview } from '../../../../services/wineServices';

import AuthContext from '../../../../services/context/AuthContext';
import WishListContext from '../../../../services/context/WishListContext';
import HistoryContext from '../../../../services/context/HistoryContext';
import LoginRequired from '../../screen/LoguinRequired';

const WineDetailScreen = ({ route, navigation }) => {
    console.log("RUTA ACTUAL:", route.name, "DATOS RECIBIDOS:", route.params?.wineData?.name);
    const { wineData: initialData } = route.params || {};
    const insets = useSafeAreaInsets();

    const [wine, setWine] = useState(initialData || {});
    // 1. NUEVO ESTADO PARA LAS RESEÑAS
    const [reviews, setReviews] = useState([]); 
    const [loading, setLoading] = useState(true);

    // Estados para la reseña (Modal)
    const [modalVisible, setModalVisible] = useState(false);
    const [userRating, setUserRating] = useState(1);
    const [userReviewText, setUserReviewText] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const [showLoginModal, setShowLoginModal] = useState(false);

    const { isAuthenticated, token, user } = useContext(AuthContext);
    const { isFavorite: isFavInContext, toggleFavorite } = useContext(WishListContext);
    const { isInHistory: isInHistoryInContext, toggleHistoryLocal } = useContext(HistoryContext);

    const currentUserId = user?.id || user?.userId;

    useFocusEffect(
        useCallback(() => {
            if (!initialData?.id || !isAuthenticated || !token) return;
            const timer = setTimeout(async () => {
                try {
                    await addHistory(initialData.id, token);
                } catch (error) { console.error(error); }
            }, 5000);
            return () => clearTimeout(timer);
        }, [initialData?.id, isAuthenticated, token])
    );

    const handleCloseLogin = () => {
        setShowLoginModal(false);
    };

    const handleToggleFavorite = async () => {
        if (!wineIdForActions) return;
        
        if (!isAuthenticated) { 
            setShowLoginModal(false);
            setTimeout(() => {
                setShowLoginModal(true);
            }, 50); 
            return; 
        }

        try { 
            await toggleFavorite(wineIdForActions); 
        } catch (e) { 
            console.error("Error en favoritos:", e); 
        }
    };

    const fetchFullDetails = async () => {
        if (initialData?.id) {
            try {
                setLoading(true);
                const response = await getWineById(initialData.id);

                const actualWineData = response.wine ? response.wine : response;
                const actualReviews = response.reviews || []; 

                setWine(prev => ({ ...prev, ...actualWineData }));
                setReviews(actualReviews); 

            } catch (error) { 
                console.error("Error trayendo detalles:", error); 
            } finally { 
                setLoading(false); 
            }
        }
    };

    const handleDeleteReview = (wineId) => {
        Alert.alert(
            "Eliminar reseña",
            "¿Estás seguro de que quieres borrar tu comentario?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Eliminar", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            await deleteReview(wineId, token); // Llamada al endpoint [HttpDelete("{WineId:guid}/rate-delete")]
                            Alert.alert("Éxito", "Reseña eliminada.");
                            fetchFullDetails(); // Recargamos para actualizar la lista
                        } catch (e) {
                            Alert.alert("Error", "No se pudo eliminar la reseña.");
                        }
                    } 
                }
            ]
        );
    };

    const handleEditReview = (existingReview) => {
        setUserRating(existingReview.score);
        setUserReviewText(existingReview.review || existingReview.comment);
        setModalVisible(true); 

    };

    

    useEffect(() => {
        fetchFullDetails();
    }, [initialData?.id]);

    // Desestructuración
    const {
        name = "Nombre Desconocido",
        wineryName, price, imageUrl: rawImage, regionName, averageScore: rating = 0,
        grapes = [], grapeNames, vintageYear, description, notesTaste, aroma
    } = wine || {};

    const image = rawImage || "https://via.placeholder.com/150";
    const displayRegion = regionName || "Mendoza, Argentina";
    const displayWinery = wineryName || initialData?.winery || "Bodega Desconocida";
    const displayType = (grapes && Array.isArray(grapes) && grapes.length > 0) ? grapes.map(g => g.name || g.Name).join(', ') : (grapeNames || "Vino Tinto");
    const displayName = vintageYear ? `${name} ${vintageYear}` : name;
    const descriptionText = description && description.trim() !== "" ? description : `Disfruta de este excelente ${displayType} de la región de ${displayRegion}.`;

    const renderStars = (score) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(<Ionicons key={i} name={i <= score ? "star" : "star-outline"} size={14} color="#FFD700" style={{ marginRight: 2 }} />);
        }
        return stars;
    };

    const renderInteractiveStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <TouchableOpacity key={i} onPress={() => setUserRating(i)}>
                    <Ionicons name={i <= userRating ? "star" : "star-outline"} size={32} color="#FFD700" style={{ marginHorizontal: 4 }} />
                </TouchableOpacity>
            );
        }
        return <View style={{ flexDirection: 'row', marginVertical: 10 }}>{stars}</View>;
    };

    const handleSubmitReview = async () => {
        if (userReviewText.trim().length === 0) {
            Alert.alert("Reseña vacía", "Por favor escribe un comentario sobre el vino.");
            return;
        }

        const targetId = wine.id || initialData.id;
        if (!targetId) return;

        setIsSubmittingReview(true);

        try {
            await addReview(
                targetId,
                { score: userRating, comment: userReviewText },
                token
            );

            setIsSubmittingReview(false);
            setModalVisible(false);
            setUserReviewText('');
            setUserRating(5);

            Alert.alert(
                "¡Gracias!",
                "Tu reseña ha sido enviada exitosamente.",
                [{ text: "OK", onPress: () => fetchFullDetails() }]
            );

        } catch (error) {
            console.error("Error al enviar reseña:", error);
            setIsSubmittingReview(false);
            Alert.alert("Error", error.message || "No se pudo enviar la reseña.");
        }
    };

    const wineIdForActions = wine.id || initialData.id;
    const isFav = wineIdForActions ? isFavInContext(wineIdForActions) : false;
    const isHist = wineIdForActions ? isInHistoryInContext(wineIdForActions) : false;
const handleCloseModal = () => {
    setShowLoginModal(false);
};
   
    

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: image }} style={styles.wineImage} resizeMode="cover" />
                </View>

                <View style={styles.detailsContainer}>
                    <View style={styles.headerRow}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={styles.wineryLabel}>{displayWinery.toUpperCase()}</Text>
                            <Text style={styles.wineName}>{displayName}</Text>
                        </View>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Text style={styles.ratingText}>{rating}</Text>
                        </View>
                    </View>

                    <View style={styles.tagsContainer}>
                        <View style={styles.tag}>
                            <Ionicons name="location-outline" size={14} color="#666" />
                            <Text style={styles.tagText}>{displayRegion}</Text>
                        </View>
                        <View style={styles.tag}>
                            <Ionicons name="wine-outline" size={14} color="#666" />
                            <Text style={styles.tagText}>{displayType}</Text>
                        </View>
                        {loading && (
                            <View style={[styles.tag, { backgroundColor: '#fff' }]}>
                                <ActivityIndicator size="small" color={COLORS.primary} />
                            </View>
                        )}
                    </View>

                    <View style={styles.divider} />

                    {(aroma || notesTaste) && (
                        <>
                            <Text style={styles.sectionTitle}>Perfil Sensorial</Text>
                            <View style={styles.sensoryContainer}>
                                {aroma ? (<View style={styles.sensoryItem}><View style={[styles.sensoryIconBox, { backgroundColor: '#F3E5F5' }]}><MaterialCommunityIcons name="flower-tulip-outline" size={24} color="#9C27B0" /></View><View style={{ flex: 1 }}><Text style={styles.sensoryLabel}>Aroma</Text><Text style={styles.sensoryValue}>{aroma}</Text></View></View>) : null}
                                {notesTaste ? (<View style={[styles.sensoryItem, { marginTop: 12 }]}><View style={[styles.sensoryIconBox, { backgroundColor: '#E3F2FD' }]}><MaterialCommunityIcons name="water-outline" size={24} color="#2196F3" /></View><View style={{ flex: 1 }}><Text style={styles.sensoryLabel}>En Boca</Text><Text style={styles.sensoryValue}>{notesTaste}</Text></View></View>) : null}
                            </View>
                            <View style={styles.divider} />
                        </>
                    )}

                    <Text style={styles.sectionTitle}>Descripción</Text>
                    <Text style={styles.descriptionText}>{descriptionText}</Text>

                    <View style={styles.divider} />

                    {/* --- SECCIÓN DE RESEÑAS --- */}
                    <View style={styles.reviewsSection}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                            <Text style={styles.sectionTitle}>Reseñas</Text>
                            <View style={styles.reviewCountBadge}>
                                <Text style={styles.reviewCountText}>{reviews.length}</Text>
                            </View>
                        </View>

                        {/* 4. RENDERIZADO DE LA LISTA O MENSAJE VACÍO */}
                       {reviews && reviews.length > 0 ? (
                            reviews.map((item) => {
                                const isMyReview = user && (item.userId === user.id || item.userId === user.userId);

                                return (
                                    <View key={item.id} style={[styles.reviewItem, isMyReview && styles.myReviewItem]}>
                                        <View style={styles.reviewHeader}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                                <View style={styles.avatarPlaceholder}>
                                                    <Text style={styles.avatarText}>
                                                        {item.userName ? item.userName.charAt(0).toUpperCase() : 'U'}
                                                    </Text>
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Text style={styles.reviewUser}>
                                                            {item.userName || "Anónimo"}
                                                        </Text>
                                                        {isMyReview && <Text style={styles.myBadge}> (Tú)</Text>}
                                                    </View>
                                                    {item.isSommelierReview && (
                                                        <Text style={{ fontSize: 10, color: COLORS.primary, fontWeight: 'bold' }}>Sommelier</Text>
                                                    )}
                                                </View>
                                            </View>

                                            {/* BOTONES DE ACCIÓN: Solo se muestran si es mi reseña */}
                                            {isMyReview && (
                                                <View style={styles.actionButtons}>
                                                    <TouchableOpacity 
                                                        onPress={() => handleEditReview(item)} 
                                                        style={{ marginRight: 15 }}
                                                    >
                                                        <Ionicons name="create-outline" size={20} color="#666" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => handleDeleteReview(wine.id)}>
                                                        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>

                                        <View style={{ flexDirection: 'row', marginVertical: 5 }}>
                                            {renderStars(item.score)}
                                        </View>

                                        <Text style={styles.reviewComment}>
                                            {item.review || item.comment || ""}
                                        </Text>
                                    </View>
                                );
                            })
                        ) : (
                            <View style={styles.emptyReviewsContainer}>
                                <Ionicons name="chatbubble-ellipses-outline" size={40} color="#DDD" />
                                <Text style={styles.emptyReviewsText}>No hay reseñas todavía.</Text>
                                <Text style={styles.emptyReviewsSubText}>¡Sé el primero en opinar!</Text>
                            </View>
                        )}

                        {isAuthenticated && (
                            <TouchableOpacity style={styles.addReviewButton} onPress={() => setModalVisible(true)}>
                                <Ionicons name="create-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                                <Text style={styles.addReviewButtonText}>Escribir una reseña</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Precio</Text>
                    <Text style={styles.priceValue}>$ {price.toLocaleString()}</Text>
                </View>
                <View style={styles.footerActions}>
                    <TouchableOpacity style={[styles.actionIconBtn, styles.favBtnMargin]} onPress={handleToggleFavorite} activeOpacity={0.7}>
                        <Ionicons name={isFav ? "heart" : "heart-outline"} size={24} color={isFav ? "#E91E63" : "#666"} />
                        <Text style={[styles.actionBtnText, isFav && { color: "#E91E63" }]}>Favorito</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Calificar Vino</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalSubtitle}>¿Qué te pareció este vino?</Text>
                        <View style={styles.starsInputContainer}>{renderInteractiveStars()}</View>
                        <Text style={styles.labelInput}>Tu opinión</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Comparte tu experiencia..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                            value={userReviewText}
                            onChangeText={setUserReviewText}
                        />
                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview} disabled={isSubmittingReview}>
                            {isSubmittingReview ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Enviar Reseña</Text>}
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            <Modal 
                animationType="slide" 
                transparent={true} 
                visible={showLoginModal} 
                onRequestClose={handleCloseModal}
            >
                <View style={styles.loginModalWrapper}>
                    <View style={styles.loginModalContent}>
                        <View style={styles.modalHandle} />
                        
                        <TouchableOpacity 
                            onPress={handleCloseModal}
                            style={styles.closeModalBtn}
                            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                        >
                            <Ionicons name="close" size={26} color="#333" />
                        </TouchableOpacity>

                        {/* Contenedor con altura automática para evitar el cuelgue */}
                        <View style={{ paddingBottom: 20 }}>
                            <LoginRequired 
                                navigation={navigation} 
                                onLoginPress={handleCloseModal}
                                message="Guarda tus vinos favoritos iniciando sesión."
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F9F9' },
    imageContainer: { height: 350, width: '100%', backgroundColor: '#EBEBEB', overflow: 'hidden' },
    wineImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    detailsContainer: { flex: 1, backgroundColor: '#FFF', marginTop: -50, borderTopLeftRadius: 35, borderTopRightRadius: 35, paddingHorizontal: 24, paddingTop: 30, shadowColor: "#000", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 5 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    wineryLabel: { fontSize: 13, color: '#999', fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
    wineName: { fontSize: 26, fontWeight: '800', color: '#222', lineHeight: 32 },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9E5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
    ratingText: { marginLeft: 4, fontWeight: 'bold', color: '#333', fontSize: 16 },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
    tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F7FA', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginRight: 10, marginBottom: 8 },
    tagText: { marginLeft: 6, color: '#666', fontSize: 14, fontWeight: '500' },
    divider: { height: 1, backgroundColor: '#EEEEEE', marginVertical: 24 },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: '#222', marginBottom: 12 },
    descriptionText: { fontSize: 16, color: '#555', lineHeight: 26 },
    sensoryContainer: { backgroundColor: '#FAFAFA', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F0F0F0' },
    sensoryItem: { flexDirection: 'row', alignItems: 'center' },
    sensoryIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    sensoryLabel: { fontSize: 12, color: '#888', fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
    sensoryValue: { fontSize: 15, color: '#333', fontWeight: '500', lineHeight: 20 },
    reviewsSection: { marginBottom: 20 },
    reviewCountBadge: { backgroundColor: '#EEEEEE', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8, marginBottom: 8 },
    reviewCountText: { fontSize: 12, fontWeight: 'bold', color: '#666' },
    reviewItem: { marginBottom: 16, backgroundColor: '#FAFAFA', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0' },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    avatarPlaceholder: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    avatarText: { fontWeight: 'bold', color: '#666' },
    reviewUser: { fontWeight: 'bold', fontSize: 15, color: '#333' },
    reviewComment: { color: '#555', fontSize: 14, lineHeight: 22 },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 20 },
    priceContainer: { flex: 1 },
    priceLabel: { fontSize: 13, color: '#999', fontWeight: '600' },
    priceValue: { fontSize: 26, fontWeight: '800', color: '#222' },
    footerActions: { flexDirection: 'row', alignItems: 'center' },
    actionIconBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#F5F5F5', minWidth: 70 },
    actionIconBtnActive: { backgroundColor: '#EFEFEF' },
    favBtnMargin: { marginLeft: 12 },
    actionBtnText: { fontSize: 11, marginTop: 4, color: '#666', fontWeight: '600' },
    actionBtnTextActive: { color: COLORS.primary },
    addReviewButton: { flexDirection: 'row', backgroundColor: COLORS.primary || '#000', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    addReviewButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#FFF', borderRadius: 20, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    modalSubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 10 },
    starsInputContainer: { alignItems: 'center', marginBottom: 20 },
    labelInput: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
    textInput: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 12, height: 100, textAlignVertical: 'top', fontSize: 15, color: '#333', marginBottom: 24 },
    submitButton: { backgroundColor: COLORS.primary || '#000', borderRadius: 12, marginBottom: 12, paddingVertical: 14, alignItems: 'center' },
    submitButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

    myReviewItem: {
        borderColor: COLORS.primary,
        borderWidth: 1,
        backgroundColor: '#FFF9FA',
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
    },
    myBadge: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
    },
    
    // 6. ESTILOS PARA ESTADO VACÍO
    emptyReviewsContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
    emptyReviewsText: { fontSize: 16, color: '#888', fontWeight: '600', marginTop: 8 },
    emptyReviewsSubText: { fontSize: 14, color: '#AAA', marginTop: 4 }.color,

  loginModalWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end', 
},
loginModalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: 400, 
    maxHeight: '90%', 
    paddingTop: 15,
},
    modalHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#DDD',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 10,
    },
    closeModalBtn: {
        position: 'absolute',
        right: 20,
        top: 20,
        zIndex: 10,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        padding: 4,
    },
});

export default WineDetailScreen;


