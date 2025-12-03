import React, { useState, useEffect, useMemo } from 'react';
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
import Icon from 'react-native-vector-icons/Ionicons';
import WineCard from '../ui/WineCard';
import { COLORS, FONTS, SHADOWS } from '../../../theme/theme';
import { wines } from '../../data/wines';

const SearchScreen = ({ visible, onClose, onWinePress }) => {
    const [searchText, setSearchText] = useState('');
    const [recentSearches, setRecentSearches] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Filtrar vinos basado en el texto de búsqueda
    const filteredWines = useMemo(() => {
        if (!searchText.trim()) return [];

        const searchLower = searchText.toLowerCase();
        return wines.filter(wine =>
            wine.nombre.toLowerCase().includes(searchLower) ||
            wine.bodega.toLowerCase().includes(searchLower) ||
            wine.tipo.toLowerCase().includes(searchLower) ||
            wine.variedad_uva.some(uva =>
                uva.toLowerCase().includes(searchLower)
            )
        );
    }, [searchText]);

    useEffect(() => {
        setIsSearching(searchText.length > 0);
    }, [searchText]);

    const handleSearch = (text) => {
        setSearchText(text);
        if (text.trim() && !recentSearches.includes(text.trim())) {
            setRecentSearches(prev => [text.trim(), ...prev.slice(0, 4)]);
        }
    };

    const handleRecentSearchPress = (search) => {
        setSearchText(search);
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
            <Icon name="time-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.recentSearchText}>{item}</Text>
            <Icon name="arrow-up-outline" size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
    );

    const renderSuggestion = ({ item }) => (
        <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => handleSearch(item)}
            activeOpacity={0.7}
        >
            <Icon name="search-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.suggestionText}>{item}</Text>
        </TouchableOpacity>
    );

    const renderWine = ({ item }) => (
        <WineCard wine={item} onPress={onWinePress} />
    );

    const popularSearches = ['Malbec', 'Cabernet', 'Chardonnay', 'Trapiche', 'Mendoza'];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
        >
            <SafeAreaView style={styles.container}>
                {/* Header con barra de búsqueda */}
                <View style={styles.header}>
                    <View style={styles.searchContainer}>
                        <Icon name="search-outline" size={20} color={COLORS.textSecondary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search wines, grapes, regions..."
                            value={searchText}
                            onChangeText={handleSearch}
                            autoFocus={true}
                            placeholderTextColor={COLORS.textSecondary}
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                                <Icon name="close-circle" size={20} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                {/* Contenido */}
                <View style={styles.content}>
                    {!isSearching ? (
                        // Estado sin búsqueda - mostrar recientes y sugerencias
                        <View style={styles.emptyState}>
                            {recentSearches.length > 0 && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Recent searches</Text>
                                    <FlatList
                                        data={recentSearches}
                                        renderItem={renderRecentSearch}
                                        keyExtractor={(item, index) => `recent-${index}`}
                                    />
                                </View>
                            )}

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Popular searches</Text>
                                <FlatList
                                    data={popularSearches}
                                    renderItem={renderSuggestion}
                                    keyExtractor={(item) => item}
                                />
                            </View>
                        </View>
                    ) : filteredWines.length > 0 ? (
                        // Resultados de búsqueda
                        <FlatList
                            data={filteredWines}
                            renderItem={renderWine}
                            keyExtractor={(item) => item.id.toString()}
                            showsVerticalScrollIndicator={false}
                            ListHeaderComponent={() => (
                                <View style={styles.resultsHeader}>
                                    <Text style={styles.resultsText}>
                                        {filteredWines.length} results for "{searchText}"
                                    </Text>
                                </View>
                            )}
                        />
                    ) : (
                        // Sin resultados
                        <View style={styles.noResultsContainer}>
                            <Icon name="wine-outline" size={64} color={COLORS.textSecondary} />
                            <Text style={styles.noResultsTitle}>No wines found</Text>
                            <Text style={styles.noResultsSubtitle}>
                                Try searching for different wine names, grapes, or regions
                            </Text>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        ...SHADOWS.small,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,

        height: 40,
    },
    searchInput: {
        flex: 1,
        fontSize: FONTS.body,
        color: COLORS.textPrimary,

    },
    clearButton: {

    },
    cancelButton: {

    },
    cancelText: {
        fontSize: FONTS.body,
        color: COLORS.primary,
        fontWeight: '500',
    },
    content: {
        flex: 1,
    },
    emptyState: {
        flex: 1,

    },
    section: {

    },
    sectionTitle: {
        fontSize: FONTS.title,
        fontWeight: 'bold',
        color: COLORS.textPrimary,

    },
    recentSearchItem: {
        flexDirection: 'row',
        alignItems: 'center',

        ...SHADOWS.small,
    },
    recentSearchText: {
        flex: 1,
        fontSize: FONTS.body,
        color: COLORS.textPrimary,

    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',

    },
    suggestionText: {
        fontSize: FONTS.body,
        color: COLORS.textSecondary,

    },
    resultsHeader: {

        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    resultsText: {
        fontSize: FONTS.body,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',

    },
    noResultsTitle: {
        fontSize: FONTS.h2,
        fontWeight: 'bold',
        color: COLORS.textPrimary,

    },
    noResultsSubtitle: {
        fontSize: FONTS.body,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default SearchScreen;