import React, { useContext, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

// Imports de Servicios
import { getWines, fetchHistory, removeHistory } from '../../../../services/wineServices'; 

// Imports de Contexto
import AuthContext from '../../../../services/context/AuthContext';

// Imports de Componentes
import WineCard from '../../ui/WineCard';
import CustomNavbar from '../../common/ui/nav-bar/CustomNavbar';
import { COLORS } from '../../../theme/theme';
import LoginRequired from '../../screen/LoguinRequired';

const HistoryScreen = ({ navigation }) => {
  const { isAuthenticated, token } = useContext(AuthContext);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- LÓGICA DE ELIMINACIÓN OPTIMISTA ---
  const handleDeleteItem = (wineId) => {
    Alert.alert(
      "Eliminar del historial",
      "¿Estás seguro de que quieres quitar este vino de tu historial?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: async () => {
            const previousItems = [...items];
            setItems(prev => prev.filter(wine => wine.id !== wineId));
            try {
              await removeHistory(wineId, token);
            } catch (e) {
              setItems(previousItems);
              Alert.alert('Error', 'No se pudo eliminar.');
            }
          } 
        }
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated || !token) {
        setItems([]);
        return;
      }

      const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
          const historyIds = await fetchHistory(token);
          if (!historyIds || historyIds.length === 0) {
            setItems([]);
            setLoading(false);
            return;
          }
          const allWines = await getWines();
          const historyIdSet = new Set(historyIds.map((id) => id.toString()));

          const normalized = (allWines || [])
            .filter((w) => w.id && historyIdSet.has(w.id.toString()))
            .map((w) => ({
              ...w,
              winery: w.wineryName || w.winery || 'Bodega Desconocida',
              id: w.id.toString(),
            }));

          setItems(normalized.reverse()); 
        } catch (e) {
          console.error('Error cargando historial:', e);
          setError('No se pudo actualizar el historial.');
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }, [isAuthenticated, token])
  );

  const filtered = useMemo(() => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((w) => {
      const name = (w.name || '').toLowerCase();
      const winery = (w.winery || '').toLowerCase();
      return name.includes(q) || winery.includes(q);
    });
  }, [items, searchQuery]);

  // --- RENDER ACCIÓN DE SWIPE ---
  const renderRightActions = (id) => (
    <TouchableOpacity 
      style={styles.deleteBox} 
      onPress={() => handleDeleteItem(id)}
      activeOpacity={0.8}
    >
      <Ionicons name="trash-outline" size={28} color="#FFF" />
      <Text style={styles.deleteText}>Eliminar</Text>
    </TouchableOpacity>
  );

  const renderWineItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item.id)}
      rightThreshold={40}
    >
      <View style={styles.cardContainer}>
        <WineCard
          wine={item}
          onPress={() => navigation.navigate('WineDetail', { wineData: item })}
        />
      </View>
    </Swipeable>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <CustomNavbar showSearch={false} onProfilePress={() => navigation.navigate('Profile')} />
        <LoginRequired navigation={navigation} message="Inicia sesión para ver tu historial." />
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <SafeAreaView style={{ backgroundColor: COLORS.white || '#fff' }} edges={['top']}>
          <CustomNavbar showFilters={false} onSearchChange={setSearchQuery} onProfilePress={() => navigation.navigate('Profile')} />
        </SafeAreaView>

        <View style={styles.content}>
          {loading && items.length === 0 ? (
            <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
          ) : (
            <FlatList
              data={filtered}
              renderItem={renderWineItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.center}>
                  <Text style={{ color: '#888', marginTop: 20 }}>No has visto ningún vino recientemente.</Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 80 },
  cardContainer: { marginBottom: 16, backgroundColor: '#FAFAFA' },
  deleteBox: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    height: '88%', // Ajustado para que no tape el margen inferior
    borderRadius: 16,
    marginLeft: 10,
  },
  deleteText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 4,
  },
});

export default HistoryScreen;