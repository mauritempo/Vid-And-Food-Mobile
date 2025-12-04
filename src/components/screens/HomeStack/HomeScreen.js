import React, { useState, useMemo, useEffect } from 'react';
import { 
    View, 
    StyleSheet, 
    StatusBar, 
    ActivityIndicator, 
    Text, 
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getWines } from '../../../../services/wineServices'; 
import CustomNavbar from '../../common/ui/nav-bar/CustomNavbar';
import WineCard from '../../ui/WineCard';
import { COLORS } from '../../../theme/theme'; 

const HomeScreen = ({ navigation }) => { 
    const [wines, setWines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({});
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { fetchWinesData(); }, []);

    const fetchWinesData = async () => {
        try {
            setLoading(true);
            const rawData = await getWines();
            
            const normalizedData = rawData.map(wine => ({
                ...wine,
                winery: wine.wineryName || wine.winery || "Bodega Desconocida",
                id: wine.id ? wine.id.toString() : Math.random().toString()
            }));

            setWines(normalizedData);
        } catch (err) {
            console.error("Error fetching wines:", err);
            setError("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const filteredWines = useMemo(() => {
        let result = wines;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(wine => 
                (wine.name && wine.name.toLowerCase().includes(query)) ||
                (wine.winery && wine.winery.toLowerCase().includes(query))
            );
        }
        
        return result;
    }, [wines, searchQuery, filters]);

    const renderWineItem = ({ item }) => (
        <View style={styles.cardContainer}>
            <WineCard 
                wine={item} 
                onPress={() => navigation.navigate('WineDetail', { wineData: item })}
            />
        </View>
    );

    if (loading) return <ActivityIndicator size="large" style={styles.center} color={COLORS.primary} />;
    if (error) return <View style={styles.center}><Text>{error}</Text></View>;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            
            <SafeAreaView style={{ backgroundColor: COLORS.white || '#fff' }} edges={['top']}>
                <CustomNavbar 
                    onToggleFilters={() => setShowFilters(true)}
                    showFilters={showFilters}
                    onSearchChange={setSearchQuery}
                    onProfilePress={() => navigation.navigate('Profile')} 
                />
            </SafeAreaView>

            <View style={styles.content}>
                <FlatList
                    data={filteredWines}
                    renderItem={renderWineItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                        <View style={styles.center}>
                            <Text style={{ color: '#888', marginTop: 20 }}>
                                {loading ? 'Cargando...' : 'No se encontraron vinos'}
                            </Text>
                        </View>
                    )}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    content: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 80,
    },
    cardContainer: {
        marginBottom: 16,
    }
});

export default HomeScreen;