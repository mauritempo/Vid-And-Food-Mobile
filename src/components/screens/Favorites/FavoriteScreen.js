import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import AuthContext from '../../../../services/context/AuthContext';
import * as WineService from '../../../../services/wineServices';
import * as AuthService from '../../../../services/AuthService';
import SubscribeScreen from '../Suscribe/SuscribeScreen'; 
import CustomNavbar from '../../common/ui/nav-bar/CustomNavbar';
import WineCard from '../../ui/WineCard';
import { COLORS } from '../../../theme/theme';

const FavoritesScreen = ({ navigation }) => {
  const { token, isAuthenticated, user } = useContext(AuthContext); 

  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. VERIFICACIÓN DE ROL ROBUSTA (CAMBIO APLICADO AQUÍ)
  // Obtenemos el rol del objeto user (prioridad) o del token decodificado
  const currentRole = user?.role || AuthService.decodeToken(token)?.role;

  // LOGS DE DEPURACIÓN: Mira tu terminal (Metro bundler) para ver estos valores
  console.log("DEBUG ROL - Usuario Context:", user); 
  console.log("DEBUG ROL - Rol detectado string:", currentRole);

  // Verificamos ignorando mayúsculas/minúsculas
  const hasSommelierAccess = 
      isAuthenticated && 
      currentRole && 
      currentRole.toString().toLowerCase() === 'sommelier';

  console.log("DEBUG ROL - ¿Tiene acceso?:", hasSommelierAccess);


  // 2. FUNCIÓN DE CARGA DE DATOS
  const loadFavourites = useCallback(async () => {
    // Si no está autenticado o no tiene token aún, esperamos.
    if (!isAuthenticated || !token) {
        setLoading(false);
        return;
    }

    // Si no tiene acceso, paramos (la UI se encargará de mostrar la pantalla de suscripción)
    if (!hasSommelierAccess) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Cargando favoritos con token:", token ? "Token OK" : "Sin Token"); 
      const rawData = await WineService.fetchFavourites(token); 
      console.log("Data cruda del backend favoritos:", rawData); 

      let normalized = [];
      
      if (Array.isArray(rawData)) {
          normalized = rawData.map(w => ({
            ...w,
            // Fallbacks seguros
            winery: w.wineryName || w.winery || 'Bodega Desconocida',
            id: w.id ? w.id.toString() : (w.wineId ? w.wineId.toString() : Math.random().toString()),
          }));
      } else {
          console.warn("El backend no devolvió un array:", rawData);
      }

      setFavourites(normalized);
    } catch (e) {
      console.error('Error cargando favoritos:', e);
      setError('No se pudieron cargar tus favoritos.');
      setFavourites([]);
    } finally {
      setLoading(false);
    }
  }, [hasSommelierAccess, token, isAuthenticated]);

  // 3. EFECTO: Recargar al enfocar
  useFocusEffect(
    useCallback(() => {
      loadFavourites();
    }, [loadFavourites])
  );

  // 4. LÓGICA DE FILTRADO
  const filteredFavorites = useMemo(() => {
    let result = favourites;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(wine => 
        (wine.name && wine.name.toLowerCase().includes(query)) ||
        (wine.winery && wine.winery.toLowerCase().includes(query))
      );
    }
    return result;
  }, [favourites, searchQuery]);

  // --- RENDERIZADO ---

  // A. BLOQUEO DE ACCESO (PRIORIDAD 1)
  // Si no tiene acceso, mostramos SubscribeScreen INMEDIATAMENTE
  if (!hasSommelierAccess && !loading) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <SubscribeScreen navigation={navigation} />
        </SafeAreaView>
      );
  }

  // B. LOADING (PRIORIDAD 2)
  if (loading) {
      return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
  }

  // C. PANTALLA PRINCIPAL
  const renderWineItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <WineCard 
        wine={item} 
        onPress={() => navigation.navigate('WineDetail', { wineData: item })} 
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: COLORS.white || '#fff' }} edges={['top']}>
        <CustomNavbar 
            showFilters={false} 
            onSearchChange={setSearchQuery} 
            onProfilePress={() => navigation.navigate('Profile')} 
        />
      </SafeAreaView>

      <View style={styles.content}>
        {/* Manejo visual de error dentro del layout */}
        {error && (
            <Text style={{color: 'red', textAlign: 'center', margin: 10}}>{error}</Text>
        )}

        <FlatList
          data={filteredFavorites}
          renderItem={renderWineItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.center}>
              <Text style={{ color: '#888', marginTop: 20, fontSize: 16 }}>
                 {!error ? "No tienes vinos favoritos aún." : ""}
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 80 },
  cardContainer: { marginBottom: 16 }
});

export default FavoritesScreen;