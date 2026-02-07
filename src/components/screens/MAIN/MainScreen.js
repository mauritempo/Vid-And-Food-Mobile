import React, { useEffect, useState } from 'react';
import { 
    View, Text, StyleSheet, ImageBackground, TouchableOpacity, 
    ScrollView, ActivityIndicator, Image, FlatList, Dimensions, Linking 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../theme/theme';
import { getWineOfMonth } from '../../../../services/wineServices';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.72;

const MainHomeScreen = ({ navigation }) => {
    const [featuredWines, setFeaturedWines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const data = await getWineOfMonth();
                const winesArray = Array.isArray(data) ? data : [data];
                setFeaturedWines(winesArray);
            } catch (e) {
                console.error("Error fetching featured wines:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    const openWebsite = () => {
        Linking.openURL('https://www.vidandfood.com');
    };

    const renderFeaturedCard = ({ item }) => (
        <TouchableOpacity 
            style={styles.verticalCard}
            onPress={() => navigation.navigate('WineDetail', { wineData: item })}
            activeOpacity={0.9}
        >
            <View style={styles.imageContainer}>
                <Image 
                    source={{ uri: item?.imageUrl || 'https://via.placeholder.com/300x450' }} 
                    style={styles.verticalImage} 
                />
                <View style={styles.badge}>
                    <Ionicons name="ribbon" size={12} color="#FFF" />
                    <Text style={styles.badgeText}>ELITE</Text>
                </View>
            </View>
            
            <View style={styles.cardFooter}>
                <Text style={styles.wineName} numberOfLines={1}>{item?.name || 'Reserva Especial'}</Text>
                <Text style={styles.wineryName}>{item?.winery || 'Bodega Boutique'}</Text>
                
                <View style={styles.priceRow}>
                    <Text style={styles.price}>
                        {item?.price ? `$${item.price.toLocaleString('es-AR')}` : 'Consultar'}
                    </Text>
                    <View style={styles.ratingBox}>
                        <Ionicons name="star" size={12} color="#B8860B" />
                        <Text style={styles.ratingText}>{item?.rating || '4.8'}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
            {/* --- HERO SECTION --- */}
            <ImageBackground 
                source={{ uri: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1000' }} 
                style={styles.hero}
            >
                <View style={styles.overlay}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.brand}>Vid & Food</Text>
                        <View style={styles.divider} />
                        <Text style={styles.tagline}>SABER BEBER, SABER VIVIR</Text>
                    </View>
                </View>
            </ImageBackground>

            <View style={styles.body}>
                {/* --- SECCIÓN DE CONFIANZA (STATS) --- */}
                <View style={styles.trustSection}>
                    <Text style={styles.trustText}>
                        <Text style={styles.boldText}>Miles de personas</Text> confían en <Text style={styles.goldText}>Vid & Food</Text> para encontrar el maridaje perfecto.
                    </Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>10k+</Text>
                            <Text style={styles.statLabel}>Usuarios</Text>
                        </View>
                        <View style={[styles.statItem, styles.statDivider]}>
                            <Text style={styles.statNumber}>500+</Text>
                            <Text style={styles.statLabel}>Etiquetas</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>IA</Text>
                            <Text style={styles.statLabel}>Sommelier</Text>
                        </View>
                    </View>
                </View>

                {/* --- CARRUSEL SECCIÓN --- */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Selección del Sommelier</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('WineSearch')}>
                        <Text style={styles.seeAll}>Ver todos</Text>
                    </TouchableOpacity>
                </View>
                
                {loading ? (
                    <ActivityIndicator color={COLORS.primary || '#722F37'} style={{ marginVertical: 60 }} />
                ) : (
                    <FlatList
                        data={featuredWines}
                        renderItem={renderFeaturedCard}
                        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={CARD_WIDTH + 20}
                        decelerationRate="fast"
                        contentContainerStyle={styles.carouselContainer}
                    />
                )}

                {/* --- SECCIÓN IA DE MARIDAJE --- */}
                <TouchableOpacity style={styles.aiCard} onPress={openWebsite} activeOpacity={0.9}>
                    <View style={styles.aiContent}>
                        <View style={styles.aiHeader}>
                            <Ionicons name="sparkles" size={20} color="#D4AF37" />
                            <Text style={styles.aiBadge}>TECNOLOGÍA IA</Text>
                        </View>
                        <Text style={styles.aiTitle}>Encuentra tu maridaje perfecto</Text>
                        <Text style={styles.aiDescription}>
                            Nuestra Inteligencia Artificial avanzada analiza perfiles de sabor para recomendarte la combinación ideal. Disponible en nuestra web.
                        </Text>
                        <View style={styles.aiLink}>
                            <Text style={styles.aiLinkText}>Probar Sommelier IA</Text>
                            <Ionicons name="arrow-forward" size={16} color="#D4AF37" />
                        </View>
                    </View>
                </TouchableOpacity>

                {/* --- FOOTER --- */}
                <View style={styles.footerCard}>
                    <Text style={styles.footerTitle}>Nuestra Bodega Digital</Text>
                    <TouchableOpacity style={styles.webButton} onPress={openWebsite}>
                        <Ionicons name="globe-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={styles.webButtonText}>www.vidandfood.com</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ height: 60 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    hero: { height: 320, justifyContent: 'center', alignItems: 'center' },
    overlay: { backgroundColor: 'rgba(0,0,0,0.5)', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    logoContainer: { alignItems: 'center' },
    brand: { color: '#FFF', fontSize: 48, fontWeight: 'bold', letterSpacing: 4, textTransform: 'uppercase' },
    divider: { height: 2, width: 40, backgroundColor: '#D4AF37', marginVertical: 10 },
    tagline: { color: '#EEE', fontSize: 12, letterSpacing: 3, fontWeight: '300' },
    body: { paddingVertical: 20, marginTop: -40, borderTopLeftRadius: 40, borderTopRightRadius: 40, backgroundColor: '#FFF' },
    
    // TRUST SECTION
    trustSection: { paddingHorizontal: 25, paddingVertical: 20, alignItems: 'center' },
    trustText: { textAlign: 'center', fontSize: 16, color: '#444', lineHeight: 24, marginBottom: 20 },
    boldText: { fontWeight: 'bold', color: '#1A1A1A' },
    goldText: { color: '#722F37', fontWeight: 'bold' },
    statsRow: { flexDirection: 'row', backgroundColor: '#F9F9F9', borderRadius: 20, padding: 20, width: '100%', justifyContent: 'space-around' },
    statItem: { alignItems: 'center' },
    statDivider: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#EEE', paddingHorizontal: 20 },
    statNumber: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    statLabel: { fontSize: 12, color: '#888', marginTop: 4 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginVertical: 20 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
    seeAll: { color: '#722F37', fontWeight: '600', fontSize: 14 },

    carouselContainer: { paddingLeft: 25, paddingRight: 10, paddingBottom: 20 },
    verticalCard: {
        width: CARD_WIDTH,
        backgroundColor: '#FFF',
        borderRadius: 24,
        marginRight: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#F5F5F5'
    },
    imageContainer: { width: '100%', height: 280, backgroundColor: '#FDFDFD', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
    verticalImage: { width: '100%', height: '100%', resizeMode: 'contain', marginTop: 10 },
    badge: { position: 'absolute', top: 15, left: 15, backgroundColor: '#000', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold', marginLeft: 4, letterSpacing: 1 },
    
    cardFooter: { padding: 18 },
    wineName: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 4 },
    wineryName: { fontSize: 13, color: '#777', marginBottom: 12 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    price: { fontSize: 17, fontWeight: '800', color: '#722F37' },
    ratingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F1D1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    ratingText: { fontSize: 12, fontWeight: 'bold', color: '#B8860B', marginLeft: 3 },

    // AI CARD
    aiCard: { marginHorizontal: 25, marginBottom: 30, backgroundColor: '#1A1A1A', borderRadius: 24, overflow: 'hidden', elevation: 5 },
    aiContent: { padding: 25 },
    aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    aiBadge: { color: '#D4AF37', fontSize: 10, fontWeight: 'bold', marginLeft: 8, letterSpacing: 2 },
    aiTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    aiDescription: { color: '#AAA', fontSize: 14, lineHeight: 20, marginBottom: 20 },
    aiLink: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    aiLinkText: { color: '#D4AF37', fontWeight: 'bold', fontSize: 14 },

    footerCard: { marginHorizontal: 25, padding: 25, backgroundColor: '#F9F9F9', borderRadius: 24, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#DDD' },
    footerTitle: { color: '#1A1A1A', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
    webButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 12 },
    webButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});

export default MainHomeScreen;