import React, { useContext, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HistoryContext from '../../../../services/context/HistoryContext';
import WineCard from '../../ui/WineCard';
import { getWines } from '../../../../services/wineServices';
import CustomNavbar from '../../common/ui/nav-bar/CustomNavbar';
import { COLORS } from '../../../theme/theme';

const HistoryScreen = ({ navigation }) => {
  const { history } = useContext(HistoryContext);  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!history || history.length === 0) {
        setItems([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const allWines = await getWines();

        const historyIdSet = new Set(history.map((id) => id.toString()));

        const normalized = (allWines || [])
          .filter((w) => w.id && historyIdSet.has(w.id.toString()))
          .map((w) => ({
            ...w,
            winery: w.wineryName || w.winery || 'Bodega Desconocida',
            id: w.id.toString(),
          }));

        setItems(normalized);
      } catch (e) {
        console.error('Error cargando historial:', e);
        setError(e.message || 'Error al cargar historial');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [history]);

  const filtered = useMemo(() => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((w) => {
      const name = (w.name || '').toLowerCase();
      const winery = (w.winery || '').toLowerCase();
      return name.includes(q) || winery.includes(q);
    });
  }, [items, searchQuery]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <SafeAreaView
          style={{ backgroundColor: COLORS.white || '#fff' }}
          edges={['top']}
        >
          <CustomNavbar
            showFilters={false}
            onSearchChange={setSearchQuery}
            onProfilePress={() => navigation.navigate('Profile')}
          />
        </SafeAreaView>

        <View style={styles.center}>
          <Text style={{ color: 'red', textAlign: 'center', margin: 16 }}>
            {error}
          </Text>
        </View>
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
          showFilters={false}
          onSearchChange={setSearchQuery}
          onProfilePress={() => navigation.navigate('Profile')}
        />
      </SafeAreaView>

      <View style={styles.content}>
        <FlatList
          data={filtered}
          renderItem={renderWineItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.center}>
              <Text style={{ color: '#888', marginTop: 20 }}>
                No hay historial.
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

export default HistoryScreen;
