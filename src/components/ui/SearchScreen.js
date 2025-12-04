import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Modal,
    SafeAreaView,
    Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Usamos Ionicons de expo que ya tenes instalado
// Ajusta esta ruta si WineCard está en otra carpeta, por ejemplo '../../wines/WineCard'
import WineCard from '../wines/WineCard'; 
import { COLORS, FONTS } from '../../theme/theme';

const SearchScreen = ({ visible, onClose, onWinePress, wines = [] }) => {
    const [searchText, setSearchText] = useState('');
    const [recentSearches, setRecentSearches] = useState([]);
    const [filteredWines, setFilteredWines] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Lógica de búsqueda en tiempo real usando los vinos recibidos por props
    useEffect(() => {
        const query = searchText.toLowerCase().trim();
        setIsSearching(query.length > 0);

        if (query.length > 0 && wines.length > 0) {
            const results = wines.filter(wine => {
                const name = (wine.name || "").toLowerCase();
                const winery = (wine.winery || "").toLowerCase();
                // Puedes agregar más campos aquí (región, tipo, etc.)
                return name.includes(query) || winery.includes(query);
            });
            setFilteredWines(results);
        } else {
            setFilteredWines([]);
        }
    }, [searchText, wines]);

    const handleSearch = (text) => {
        setSearchText(text);
    };

    const handleRecentSearchPress = (search) => {
        setSearchText(search);
    };

    const addToRecentAndClose = (wine) => {
        // Guardar búsqueda reciente si no existe
        if (searchText.trim() && !recentSearches.includes(searchText.trim())) {
            setRecentSearches(prev => [searchText.trim(), ...prev.slice(0, 4)]);
        }
        onWinePress(wine);
    };

    const clearSearch = () => {
        setSearchText('');
        Keyboard.dismiss();
    };

    const renderRecentSearch = ({ item }) => (
        <TouchableOpacity
            style={styles.recentSearchItem}
            onPress={() => handleRecentSearchPress(item)}
            activeOpacity={0.7}
        >
            <Ionicons name="time-outline" size={20} color={COLORS.textSecondary || '#666'} />
            <Text style={styles.recentSearchText}>{item}</Text>
            <Ionicons name="arrow-up-outline" size={20} color={COLORS.textSecondary || '#666'} />
        </TouchableOpacity>
    );

    const renderWine = ({ item }) => (
        // Asegúrate de que WineCard acepte 'onPress'
        <View style={{ marginVertical: 8, marginHorizontal: 16 }}>
             <WineCard wine={item} onPress={() => addToRecentAndClose(item)} />
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                {/* Header con barra de búsqueda */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}>
                         <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                    </TouchableOpacity>

                    <View style={styles.searchContainer}>
                        <Ionicons name="search-outline" size={20} color={COLORS.textSecondary || '#999'} style={{ marginRight: 8 }} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar vinos, bodegas..."
                            value={searchText}
                            onChangeText={handleSearch}
                            autoFocus={true}
                            placeholderTextColor={COLORS.textSecondary || '#999'}
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={clearSearch}>
                                <Ionicons name="close-circle" size={20} color={COLORS.textSecondary || '#999'} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Contenido */}
                <View style={styles.content}>
                    {!isSearching ? (
                        <View style={styles.emptyState}>
                            {recentSearches.length > 0 && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Búsquedas recientes</Text>
                                    <FlatList
                                        data={recentSearches}
                                        renderItem={renderRecentSearch}
                                        keyExtractor={(item, index) => `recent-${index}`}
                                    />
                                </View>
                            )}
                        </View>
                    ) : (
                        <FlatList
                            data={filteredWines}
                            renderItem={renderWine}
                            keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={() => (
                                <View style={styles.noResultsContainer}>
                                    <Ionicons name="wine-outline" size={64} color="#ccc" />
                                    <Text style={styles.noResultsTitle}>No encontramos vinos</Text>
                                    <Text style={styles.noResultsSubtitle}>
                                        Intenta con otro nombre o bodega.
                                    </Text>
                                </View>
                            )}
                        />
                    )}
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background || '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        marginRight: 12,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    content: {
        flex: 1,
    },
    emptyState: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    recentSearchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    recentSearchText: {
        flex: 1,
        fontSize: 16,
        color: '#555',
        marginLeft: 12,
    },
    noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    noResultsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
    },
    noResultsSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
    },
});

export default SearchScreen;