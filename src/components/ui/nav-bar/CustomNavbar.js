import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Animated,
    Keyboard,
    Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SHADOWS } from '../../../theme/theme';

const CustomNavbar = ({
    onToggleFilters,
    onSearchChange, // Nueva prop para manejar el texto
    onProfilePress,
    showFilters,
}) => {
    const [isSearching, setIsSearching] = useState(false);
    const [searchText, setSearchText] = useState('');
    const inputRef = useRef(null);

    // Función para activar la búsqueda
    const handleStartSearch = () => {
        setIsSearching(true);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    // Función para cancelar/cerrar búsqueda
    const handleCancelSearch = () => {
        setIsSearching(false);
        setSearchText('');
        onSearchChange && onSearchChange(''); // Limpiar filtro
        Keyboard.dismiss();
    };

    const handleChangeText = (text) => {
        setSearchText(text);
        onSearchChange && onSearchChange(text);
    };

    return (
        <View style={styles.navbar}>
            {!isSearching ? (
                // --- VISTA NORMAL (Logo + Iconos) ---
                <>
                    <View style={styles.leftSection}>
                        <TouchableOpacity
                            style={[styles.iconButton, showFilters && styles.activeFilter]}
                            onPress={onToggleFilters}
                        >
                            <Icon
                                name="options-outline"
                                size={24}
                                color={showFilters ? COLORS.primary : COLORS.textPrimary}
                            />
                        </TouchableOpacity>
                        
                        {/* Logo centrado o alineado a izquierda según prefieras */}
                        <Text style={styles.logo}>Vid & Food</Text>
                    </View>

                    <View style={styles.rightSection}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={handleStartSearch}
                        >
                            <Icon name="search-outline" size={24} color={COLORS.textPrimary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.profileButton}
                            onPress={onProfilePress}
                        >
                            {/* Puedes poner una imagen real aquí si tienes url del usuario */}
                            <Icon name="person-circle-outline" size={28} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                // --- VISTA BÚSQUEDA (Input + Cerrar) ---
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputWrapper}>
                        <Icon name="search" size={20} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
                        <TextInput
                            ref={inputRef}
                            style={styles.searchInput}
                            placeholder="Buscar Malbec, Bodega..."
                            placeholderTextColor="#999"
                            value={searchText}
                            onChangeText={handleChangeText}
                            returnKeyType="search"
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={() => handleChangeText('')}>
                                <Icon name="close-circle" size={18} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity onPress={handleCancelSearch} style={styles.cancelButton}>
                        <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        backgroundColor: COLORS.white || '#fff', // Fondo blanco limpio
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        height: 60, // Altura estándar
        // Sombra sutil solo en iOS/Android
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
            android: { elevation: 4 },
        }),
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    logo: {
        fontSize: 20,
        fontFamily: FONTS.bold, // Asegúrate de tener fuentes cargadas, sino usa fontWeight
        color: COLORS.textPrimary,
        letterSpacing: -0.5,
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    activeFilter: {
        backgroundColor: COLORS.lightPrimary || '#EFEFEF', // Un fondo suave si está activo
    },
    profileButton: {
        marginLeft: 4,
    },
    
    // Estilos de Búsqueda
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5', // Gris muy claro para el input
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 40,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: COLORS.textPrimary,
        paddingVertical: 0, // Fix para centrar texto en Android
        height: '100%',
    },
    cancelButton: {
        paddingHorizontal: 4,
    },
    cancelText: {
        color: COLORS.primary || '#007AFF',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default CustomNavbar;