import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    ScrollView, 
    TouchableOpacity, 
    StatusBar,
    ActivityIndicator,
    Alert // <--- Faltaba este import para los errores
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../../theme/theme'; 

// Importa tu servicio aquí
import { 
    getWineById, 
    addFavorite, 
    removeFavorite, 
    addHistory, 
    removeHistory 
} from '../../../../services/wineServices'; 

// Datos de ejemplo para reseñas
const DUMMY_REVIEWS = [
    { id: 1, user: "Carlos M.", rating: 5, comment: "Excelente vino, muy equilibrado." },
    { id: 2, user: "Ana G.", rating: 4, comment: "Buen cuerpo, ideal para carnes." },
    { id: 3, user: "Pedro L.", rating: 4.5, comment: "Una sorpresa muy agradable." },
];

const WineDetailScreen = ({ route, navigation }) => {
    // 1. Recibimos la data parcial del Home
    const { wineData: initialData } = route.params || {};
    const insets = useSafeAreaInsets();
    
    // 2. Estado combinado (inicial + fetch)
    const [wine, setWine] = useState(initialData || {});
    const [loading, setLoading] = useState(true);

    // Estados de UI
    const [isFavorite, setIsFavorite] = useState(false);
    const [isInHistory, setIsInHistory] = useState(false);

    // 3. EFECTO: Llamar al backend para buscar el detalle completo (descripción, etc.)
    useEffect(() => {
        const fetchFullDetails = async () => {
            if (initialData?.id) {
                try {
                    setLoading(true);
                    // Llamada al servicio con el ID
                    const fullData = await getWineById(initialData.id);
                    
                    // Mezclamos la data nueva con la que ya teníamos
                    setWine(prev => ({ ...prev, ...fullData }));
                } catch (error) {
                    console.error("Error trayendo detalles del vino:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchFullDetails();
    }, [initialData?.id]);

    // 4. EFECTO: Sincronizar estados de Fav/Historial si el backend los devuelve
    useEffect(() => {
        if (wine) {
            if (wine.isFavorite !== undefined) setIsFavorite(wine.isFavorite);
            if (wine.isInHistory !== undefined) setIsInHistory(wine.isInHistory);
        }
    }, [wine]);

    // 5. MAPEO DE VARIABLES (Para que la UI entienda tu Backend)
    const {
        name = "Nombre Desconocido",
        wineryName: winery = "Bodega Desconocida",
        price = 0,
        imageUrl: rawImage,
        regionName,
        averageScore: rating = 0,
        grapeNames: type = "Vino",
        vintageYear,
        description: backendDescription
    } = wine || {};

    // Lógica de visualización
    const image = rawImage || "https://via.placeholder.com/150";
    const region = regionName ? regionName : "Mendoza, Argentina";
    const displayName = vintageYear ? `${name} ${vintageYear}` : name;
    
    const descriptionText = backendDescription 
        ? backendDescription 
        : "Cargando descripción detallada o no disponible para este vino...";

    // 6. HELPER: Renderizar Estrellas
    const renderStars = (score) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons 
                    key={i} 
                    name={i <= score ? "star" : "star-outline"} 
                    size={14} 
                    color="#FFD700" 
                    style={{ marginRight: 2 }}
                />
            );
        }
        return stars;
    };

    // --- LÓGICA DE FAVORITOS (Optimista) ---
    const handleToggleFavorite = async () => {
        const wineId = wine.id || initialData.id;
        if (!wineId) return;

        const previousState = isFavorite; 
        setIsFavorite(!previousState); // UI Inmediata

        try {
            if (previousState) {
                await removeFavorite(wineId);
                console.log("Eliminado de favoritos");
            } else {
                await addFavorite(wineId);
                console.log("Agregado a favoritos");
            }
        } catch (error) {
            console.error("Error en favoritos:", error);
            setIsFavorite(previousState); // Revertir
            Alert.alert("Error", "No se pudo actualizar favoritos. Revisa tu conexión.");
        }
    };

    // --- LÓGICA DE HISTORIAL (Optimista) ---
    const handleToggleHistory = async () => {
        const wineId = wine.id || initialData.id;
        if (!wineId) return;

        const previousState = isInHistory;
        setIsInHistory(!previousState); // UI Inmediata

        try {
            if (previousState) {
                await removeHistory(wineId);
                console.log("Eliminado del historial");
            } else {
                await addHistory(wineId);
                console.log("Agregado al historial");
            }
        } catch (error) {
            console.error("Error en historial:", error);
            setIsInHistory(previousState); // Revertir
            Alert.alert("Error", "No se pudo actualizar el historial.");
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }} 
            >
                {/* 1. HERO IMAGE (Rectangular) */}
                <View style={styles.imageContainer}>
                    <TouchableOpacity 
                        style={[styles.backButton, { top: insets.top + 10 }]} 
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>

                    <Image 
                        source={{ uri: image }} 
                        style={styles.wineImage} 
                        resizeMode="cover" 
                    />
                </View>

                {/* 2. DETALLES */}
                <View style={styles.detailsContainer}>
                    
                    {/* Header */}
                    <View style={styles.headerRow}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={styles.wineryLabel}>{winery.toUpperCase()}</Text>
                            <Text style={styles.wineName}>{displayName}</Text>
                        </View>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Text style={styles.ratingText}>{rating}</Text>
                        </View>
                    </View>

                    {/* Tags */}
                    <View style={styles.tagsContainer}>
                        <View style={styles.tag}>
                            <Ionicons name="location-outline" size={14} color="#666" />
                            <Text style={styles.tagText}>{region}</Text>
                        </View>
                        <View style={styles.tag}>
                            <Ionicons name="wine-outline" size={14} color="#666" />
                            <Text style={styles.tagText}>{type}</Text>
                        </View>
                        {loading && (
                            <View style={[styles.tag, { backgroundColor: '#fff' }]}>
                                <ActivityIndicator size="small" color={COLORS.primary} />
                            </View>
                        )}
                    </View>

                    <View style={styles.divider} />

                    {/* Descripción */}
                    <Text style={styles.sectionTitle}>Descripción</Text>
                    <Text style={styles.descriptionText}>{descriptionText}</Text>
                    
                    <View style={styles.divider} />

                    {/* 3. SECCIÓN RATINGS */}
                    <View style={styles.reviewsSection}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                            <Text style={styles.sectionTitle}>Reseñas</Text>
                            <View style={styles.reviewCountBadge}>
                                <Text style={styles.reviewCountText}>{DUMMY_REVIEWS.length}</Text>
                            </View>
                        </View>

                        {/* Lista de reseñas */}
                        {DUMMY_REVIEWS.map((review) => (
                            <View key={review.id} style={styles.reviewItem}>
                                <View style={styles.reviewHeader}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={styles.avatarPlaceholder}>
                                            <Text style={styles.avatarText}>{review.user.charAt(0)}</Text>
                                        </View>
                                        <Text style={styles.reviewUser}>{review.user}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row' }}>
                                        {renderStars(review.rating)}
                                    </View>
                                </View>
                                <Text style={styles.reviewComment}>{review.comment}</Text>
                            </View>
                        ))}
                    </View>
                    
                </View>
            </ScrollView>

            {/* 4. FOOTER (Fijo) */}
            <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Precio</Text>
                    <Text style={styles.priceValue}>$ {price.toLocaleString()}</Text>
                </View>

                <View style={styles.footerActions}>
                    <TouchableOpacity 
                        style={[styles.actionIconBtn, isInHistory && styles.actionIconBtnActive]} 
                        onPress={handleToggleHistory}
                        activeOpacity={0.7}
                    >
                        <Ionicons 
                            name={isInHistory ? "time" : "time-outline"} 
                            size={24} 
                            color={isInHistory ? COLORS.primary : "#666"} 
                        />
                        <Text style={[styles.actionBtnText, isInHistory && styles.actionBtnTextActive]}>Historial</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.actionIconBtn, styles.favBtnMargin]} 
                        onPress={handleToggleFavorite}
                        activeOpacity={0.7}
                    >
                         <Ionicons 
                            name={isFavorite ? "heart" : "heart-outline"} 
                            size={24} 
                            color={isFavorite ? "#E91E63" : "#666"} 
                        />
                        <Text style={[styles.actionBtnText, isFavorite && { color: "#E91E63" }]}>Favorito</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    // IMAGEN (Estilo Rectangular Banner)
    imageContainer: {
        height: 350, 
        width: '100%', 
        backgroundColor: '#EBEBEB',
        overflow: 'hidden', 
    },
    wineImage: {
        width: '100%', 
        height: '100%',
        resizeMode: 'cover', // Recorta la imagen para llenar el rectángulo
    },
    backButton: {
        position: 'absolute',
        left: 20,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 8,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        elevation: 2,
    },
    // DETALLES
    detailsContainer: {
        flex: 1,
        backgroundColor: '#FFF',
        marginTop: -50, // Sube sobre la imagen
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        paddingHorizontal: 24,
        paddingTop: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 5,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    wineryLabel: {
        fontSize: 13,
        color: '#999',
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
    },
    wineName: {
        fontSize: 26,
        fontWeight: '800',
        color: '#222',
        lineHeight: 32,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9E5',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    ratingText: {
        marginLeft: 4,
        fontWeight: 'bold',
        color: '#333',
        fontSize: 16,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        marginRight: 10,
        marginBottom: 8,
    },
    tagText: {
        marginLeft: 6,
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#EEEEEE',
        marginVertical: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#222',
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 16,
        color: '#555',
        lineHeight: 26,
    },
    // ESTILOS RESEÑAS
    reviewsSection: {
        marginBottom: 20,
    },
    reviewCountBadge: {
        backgroundColor: '#EEEEEE',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 8,
        marginBottom: 8, 
    },
    reviewCountText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
    },
    reviewItem: {
        marginBottom: 16,
        backgroundColor: '#FAFAFA', 
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        fontWeight: 'bold',
        color: '#666',
    },
    reviewUser: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#333',
    },
    reviewComment: {
        color: '#555',
        fontSize: 14,
        lineHeight: 22,
    },
    // FOOTER
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 20,
    },
    priceContainer: { flex: 1 },
    priceLabel: { fontSize: 13, color: '#999', fontWeight: '600' },
    priceValue: { fontSize: 26, fontWeight: '800', color: '#222' },
    footerActions: { flexDirection: 'row', alignItems: 'center' },
    actionIconBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        minWidth: 70,
    },
    actionIconBtnActive: { backgroundColor: '#EFEFEF' },
    favBtnMargin: { marginLeft: 12 },
    actionBtnText: {
        fontSize: 11,
        marginTop: 4,
        color: '#666',
        fontWeight: '600',
    },
    actionBtnTextActive: { color: COLORS.primary }
});

export default WineDetailScreen;