import React, {
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import SubscribeScreen from '../Suscribe/SuscribeScreen';
import CustomNavbar from '../../common/ui/nav-bar/CustomNavbar';
import WineCard from '../../ui/WineCard';
import { COLORS } from '../../../theme/theme';

import { fetchFavourites, toggleFavorite } from '../../../../services/wineServices'; 
import AuthContext from '../../../../services/context/AuthContext';
import LoginRequired from '../../screen/LoguinRequired';

const FavoritesScreen = ({ navigation }) => {
  const { token, isAuthenticated, user } = useContext(AuthContext);

  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Calculamos el rol y el permiso
  const role = user?.role;
  const isSommelier = role === 'Sommelier' || role === 'Admin';

  // 2. Función de carga robusta
  const loadFavourites = useCallback(async () => {
    // Si no está logueado o no es sommelier, limpiamos y salimos
    if (!isAuthenticated || !token || !isSommelier) {
        setFavourites([]);
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const rawData = await fetchFavourites(token);
      const normalized = Array.isArray(rawData)
        ? rawData.map((w) => ({
            ...w,
            winery: w.wineryName || w.winery || 'Bodega Desconocida',
            id: (w.id ?? w.wineId ?? Math.random()).toString(),
          }))
        : [];
      setFavourites(normalized);
    } catch (e) {
      
      setError('No se pudieron cargar tus favoritos.');
      setFavourites([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, isSommelier]); // Dependencias críticas

  // 3. EFECTO 1: Cuando la pantalla gana foco (navegación)
  useFocusEffect(
    useCallback(() => {
      loadFavourites();
    }, [loadFavourites])
  );

  // 4. EFECTO 2: Reactividad inmediata al cambio de rol (Upgrade en caliente)
  // Esto asegura que si el contexto cambia de "User" a "Sommelier" mientras estamos aquí, recargue.
  useEffect(() => {
    if (isSommelier) {
        loadFavourites();
    }
  }, [isSommelier]); // Solo escuchamos cambios en el permiso

  // --- Handlers ---

  const handleDeleteFavorite = async (wineId) => {
    try {
      // Optimistic Update: Quitamos de la lista visualmente primero
      const previousFavorites = [...favourites];
      setFavourites(prev => prev.filter(item => item.id !== wineId));
      
      try {
          await toggleFavorite(wineId, token); 
      } catch (apiError) {
          // Si falla la API, revertimos
          setFavourites(previousFavorites);
          Alert.alert('Error', 'No se pudo eliminar de favoritos');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderRightActions = (id) => (
    <TouchableOpacity 
      style={styles.deleteBox} 
      onPress={() => handleDeleteFavorite(id)}
      activeOpacity={0.8}
    >
      <Ionicons name="heart-dislike-outline" size={28} color="#FFF" />
      <Text style={styles.deleteText}>Quitar</Text>
    </TouchableOpacity>
  );

  const renderWineItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item.id)}
      rightThreshold={40}
      friction={2}
    >
      <View style={styles.cardContainer}>
        <WineCard
          wine={item}
          onPress={() => navigation.navigate('WineDetail', { wineData: item })}
        />
      </View>
    </Swipeable>
  );

  const filteredFavorites = useMemo(() => {
    let result = favourites;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (wine) =>
          (wine.name && wine.name.toLowerCase().includes(query)) ||
          (wine.winery && wine.winery.toLowerCase().includes(query))
      );
    }
    return result;
  }, [favourites, searchQuery]);

  // --- RENDERIZADO ---

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <CustomNavbar 
            showSearch={false} 
            onProfilePress={() => navigation.navigate('Profile')} 
        />
        <LoginRequired 
            navigation={navigation}
            message="Inicia sesión para ver tus vinos favoritos."
        />
      </SafeAreaView>
    );
  }

  // Si NO es sommelier, mostramos la pantalla de suscripción
  if (!isSommelier) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <SubscribeScreen navigation={navigation} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView
        style={{ backgroundColor: COLORS.white || '#fff' }}
        edges={['top']}
      >
        <CustomNavbar
          showSearch={true}
          onSearchChange={setSearchQuery}
          onProfilePress={() => navigation.navigate('Profile')}
        />
      </SafeAreaView>

      <View style={styles.content}>
        {/* Loading Indicator superpuesto si está cargando pero ya tenemos datos (refresh) o pantalla vacía */}
        {loading && favourites.length === 0 ? (
           <View style={styles.center}>
             <ActivityIndicator size="large" color={COLORS.primary} />
           </View>
        ) : (
           <>
                {error && (
                  <Text style={{ color: 'red', textAlign: 'center', margin: 10 }}>
                    {error}
                  </Text>
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
                        {!error ? 'No tienes vinos favoritos aún.' : ''}
                      </Text>
                    </View>
                  )}
                />
           </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 80 },
  cardContainer: { 
    marginBottom: 16, 
    backgroundColor: '#fff', 
    borderRadius: 12 
  },
  deleteBox: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: '88%', 
    borderRadius: 16,
    marginLeft: 10,
  },
  deleteText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default FavoritesScreen;