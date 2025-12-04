import {
  View,
  FlatList,
  Text,
  StyleSheet,
  RefreshControl,
  StatusBar,
} from 'react-native';
import WineCard from '../common/ui/WineCard';  
import { COLORS, FONTS } from '../../theme/theme';

const Wines = ({
  wines,
  onWinePress,
  onRefresh,
  refreshing = false,
  ListHeaderComponent
}) => {

  const renderWineCard = ({ item }) => (
    <View style={{ flex: 1, paddingHorizontal: 6 }}>
      <WineCard
        wine={item}
        onPress={() => onWinePress(item)}
      />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerWrapper}>
      {ListHeaderComponent}

      {/* Header de Resultados más limpio */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Nuestra Selección</Text>
        <Text style={styles.resultsCount}>
          {wines.length} etiquetas
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <FlatList
        data={wines}
        renderItem={renderWineCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row} 
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Sin resultados</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          ) : undefined
        }
        contentContainerStyle={[
          styles.listContent,
          wines.length === 0 && styles.emptyListContainer,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', 
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    paddingTop: 10,
  },
  row: {
    justifyContent: 'space-between', 
  },
  headerWrapper: {
    marginBottom: 16,
    paddingHorizontal: 6, 
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 10,
    marginBottom: 10,
  },
  resultsTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold, 
    color: COLORS.textPrimary || '#111',
  },
  resultsCount: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary || '#888',
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
});

export default Wines;