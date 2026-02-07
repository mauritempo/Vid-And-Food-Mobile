import React, {
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity, // Agregado
  Alert,           // Agregado
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Agregado
import { Swipeable } from 'react-native-gesture-handler'; // Agregado

import SubscribeScreen from '../Suscribe/SuscribeScreen';
import CustomNavbar from '../../common/ui/nav-bar/CustomNavbar';
import WineCard from '../../ui/WineCard';
import { COLORS } from '../../../theme/theme';

// Importamos el servicio para eliminar (Asegúrate de que toggleFavorite o remove existan)
import { fetchFavourites, toggleFavorite } from '../../../../services/wineServices'; 
import AuthContext from '../../../../services/context/AuthContext';
import LoginRequired from '../../screen/LoguinRequired';

const FavoritesScreen = ({ navigation }) => {
  const { token, isAuthenticated, user } = useContext(AuthContext);

  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const role = user?.role;
  const isSommelier = role === 'Sommelier' || role === 'Admin';

  const loadFavourites = useCallback(async () => {
    if (!isAuthenticated || !token || !isSommelier) return;

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
  }, [isAuthenticated, token, isSommelier]);

  useFocusEffect(
    useCallback(() => {
      loadFavourites();
    }, [loadFavourites])
  );

  const handleDeleteFavorite = async (wineId) => {
    try {
      await removeFavorite(wineId, token); 

    } catch (e) {
      Alert.alert('Error', 'No se pudo eliminar de favoritos');
      loadFavourites(); 
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
      friction={2} // Hace que el deslizamiento se sienta más "pesado" y premium
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

  // Renderizados condicionales (isAuthenticated, isSommelier, loading)...
  // (Mantener igual que en tu código original hasta el FlatList)

  if (!isAuthenticated) { /* ... igual ... */ }
  if (!isSommelier) { /* ... igual ... */ }
  if (loading && favourites.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
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
        <FlatList
          data={filteredFavorites}
          renderItem={renderWineItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.center}>
              <Text style={{ color: '#888', marginTop: 20, fontSize: 16 }}>
                {!error ? 'No tienes vinos favoritos aún.' : 'Error al cargar.'}
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
  cardContainer: { 
    marginBottom: 16, 
    backgroundColor: '#fff', 
    borderRadius: 12 // Recomendado para que el Swipeable no se vea raro
  },
  // --- Estilos para el Swipeable ---
   deleteBox: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '88%', // Ajustado para que no tape el margen inferior
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