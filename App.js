import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Modal,
  Platform,
  ActivityIndicator, // Para mostrar spinner de carga
  Text,
  Button
} from 'react-native';

import { getWines } from './src/services/wineServices';

// Librería de Safe Area
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Componentes
import CustomNavbar from './src/components/ui/nav-bar/CustomNavbar';
import Wines from './src/components/wines/Wines';
import GenericSidebarFilter from './src/components/common/generic-sideBar-filter';

// Utilidades y Tema
import applyFilters from './src/utils/ApplyFilters';
import { COLORS } from './src/theme/theme';

// --- IMPORTANTE: Importamos el servicio, NO el mock data ---
// import { wines } from './src/data/wines'; <--- ELIMINADO

// Configuración de Filtros (Se mantiene igual)
const wineFilters = [
  {
    id: "price",
    type: "range",
    title: "Precio",
    isCollapsed: false,
    options: { min: 0, max: 20000, step: 100, unit: "ARS" },
  },
  {
    id: "brand",
    type: "checkbox",
    title: "Bodega",
    isCollapsed: false,
    options: [
      { id: "catena", value: "catena", label: "Catena Zapata", count: 15 },
      { id: "trapiche", value: "trapiche", label: "Trapiche", count: 23 },
      { id: "norton", value: "norton", label: "Norton", count: 18 },
      { id: "alamos", value: "alamos", label: "Alamos", count: 12 },
      { id: "rutini", value: "rutini", label: "Rutini", count: 9 },
    ],
  },
  {
    id: "type",
    type: "checkbox",
    title: "Tipo de Vino",
    isCollapsed: true,
    options: [
      { id: "tinto", value: "tinto", label: "Tinto", count: 45 },
      { id: "blanco", value: "blanco", label: "Blanco", count: 28 },
      { id: "rosado", value: "rosado", label: "Rosado", count: 15 },
      { id: "espumante", value: "espumante", label: "Espumante", count: 8 },
    ],
  },
  {
    id: "rating",
    type: "rating",
    title: "Puntuación",
    isCollapsed: false,
    options: [
      { value: 5, label: "5 estrellas" },
      { value: 4, label: "4 estrellas" },
      { value: 3, label: "3 estrellas" },
      { value: 2, label: "2 estrellas" },
      { value: 1, label: "1 estrella" },
    ],
  },
  {
    id: "region",
    type: "checkbox",
    title: "Región",
    isCollapsed: true,
    options: [
      { id: "mendoza", value: "mendoza", label: "Mendoza", count: 42 },
      { id: "sanjuan", value: "sanjuan", label: "San Juan", count: 18 },
      { id: "salta", value: "salta", label: "Salta", count: 15 },
      { id: "rionegro", value: "rionegro", label: "Río Negro", count: 8 },
      { id: "neuquen", value: "neuquen", label: "Neuquén", count: 5 },
    ],
  },
];

const App = () => {
  // 1. Estados para manejo de datos asíncronos
  const [wines, setWines] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 2. Efecto para cargar datos al iniciar la app
  useEffect(() => {
    fetchWinesData();
  }, []);

  const fetchWinesData = async () => {
    try {
        setLoading(true);
        setError(null);
        const data = await getWines(); // Llamada al backend
        setWines(data);
    } catch (err) {
        console.error(err);
        setError("No pudimos conectar con la bodega.");
    } finally {
        setLoading(false);
    }
  };

  // 3. Lógica de filtrado (Ahora depende de 'wines' del estado)
  const filteredWines = useMemo(() => {
    let result = wines;

    // A. Filtrar por texto
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        
        result = result.filter(wine => {
            const name = (wine.name || "").toLowerCase();
            const winery = (wine.winery || "").toLowerCase();
            return name.includes(query) || winery.includes(query);
        });
    }

    // B. Filtrar por categorías
    return applyFilters(result, filters);
  }, [wines, filters, searchQuery]); // <--- Agregamos 'wines' a dependencias

  const handleResetFilters = () => {
      setFilters({});
  };

  const handleApplyFilters = () => {
      setShowFilters(false);
  };

  // 4. Renderizado condicional (Loading / Error)
  if (loading) {
    return (
        <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary || "#000"} />
            <Text style={styles.loadingText}>Cargando vinos...</Text>
        </View>
    );
  }

  if (error) {
    return (
        <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Reintentar" onPress={fetchWinesData} />
        </View>
    );
  }

  // 5. Renderizado Principal (Cuando hay datos)
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="transparent" 
          translucent 
        />
        
        <SafeAreaView style={{ backgroundColor: COLORS.white || '#fff' }} edges={['top']}>
          <CustomNavbar 
              onToggleFilters={() => setShowFilters(true)}
              showFilters={showFilters}
              onSearchChange={(text) => setSearchQuery(text)}
              onProfilePress={() => console.log("Profile")}
          />
        </SafeAreaView>

        <View style={styles.content}>
          <Wines 
              wines={filteredWines} 
              onWinePress={(wine) => console.log("Selected:", wine.name)}
          />
        </View>

        <Modal
          visible={showFilters}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowFilters(false)}
        >
            <GenericSidebarFilter
              filters={wineFilters}
              title="Filtrar Vinos"
              value={filters}
              onChange={setFilters}
              onClose={handleApplyFilters}
              onResetAll={handleResetFilters}
              rangeDebounceMs={100}
            />
        </Modal>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#FAFAFA',
  },
  content: {
    flex: 1,
  },
  // Estilos nuevos para Loading/Error
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginBottom: 20,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  }
});

export default App;