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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import SubscribeScreen from '../Suscribe/SuscribeScreen';
import CustomNavbar from '../../common/ui/nav-bar/CustomNavbar';
import WineCard from '../../ui/WineCard';

import { COLORS } from '../../../theme/theme';

// ---------------------------------------------------------
// CORRECCIÓN 1: Importar fetchFavourites (para obtener lista), no addFavorite
// ---------------------------------------------------------
import { fetchFavourites } from '../../../../services/wineServices'; 
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
    if (!isAuthenticated || !token || !isSommelier) {
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
      console.error('Error cargando favoritos:', e);
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

  // CASO 1: NO ESTÁ LOGUEADO
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

  // CASO 2: LOGUEADO PERO NO ES SOMMELIER
  if (!isSommelier) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <SubscribeScreen navigation={navigation} />
      </SafeAreaView>
    );
  }

  // UI NORMAL
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 80 },
  cardContainer: { marginBottom: 16 },
});

export default FavoritesScreen;