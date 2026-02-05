import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AuthContext from '../../../services/context/AuthContext';
import { upgradeToSommelier } from '../../../services/UserService';
import { COLORS } from '../../theme/theme';
import { useRoute } from '@react-navigation/native';


const SettingsScreen = ({ navigation }) => {
  const { user, token, onLogin } = useContext(AuthContext);

  const [membership, setMembership] = useState(user?.role || 'User');
  const [saving, setSaving] = useState(false);

   useEffect(() => {
        if (user && useRoute.params?.from === 'RestrictedArea') {
        // Si hay usuario Y venimos de una zona restringida, volvemos atrás
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
        }
    }, [user, useRoute.params, navigation]);

  useEffect(() => {
    if (user?.role) {
      setMembership(user.role);
    }
  }, [user]);

  // ---------------------------------------------------------
  // 2. LÓGICA DE PROTECCIÓN (Visualmente consistente)
  // ---------------------------------------------------------
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Configuración</Text>
          <View style={{ width: 24 }} />
        </View>
        
        {/* Usamos el componente estandarizado */}
        <LoginRequired 
            navigation={navigation} 
            message="Inicia sesión para gestionar tu suscripción y datos." 
        />
      </SafeAreaView>
    );
  }

  const currentRole = user.role;

  const handleSelectMembership = (plan) => {
    // Evitar que un Admin se baje el rango por error, o lógica visual simple
    setMembership(plan);
  };

  // ---------------------------------------------------------
  // 3. LÓGICA DE NEGOCIO (El Upgrade real)
  // ---------------------------------------------------------
  const handleSave = async () => {
    if (!token) return;

    // Si no hubo cambios
    if (currentRole === membership) {
      Alert.alert('Sin cambios', 'Tu suscripción ya es ' + membership);
      return;
    }

    // Validación: Solo permitimos Upgrade de User -> Sommelier en la app
    // (Opcional: podrías permitir downgrade si tu backend lo soporta)
    const isUpgrade = currentRole === 'User' && membership === 'Sommelier';
    
    if (!isUpgrade && currentRole !== 'Admin') { 
       // Si intenta otra cosa y no es admin
       Alert.alert('Acción no permitida', 'Por ahora solo puedes mejorar tu plan a Sommelier.');
       setMembership(currentRole);
       return;
    }

    setSaving(true);
    try {
      // Llamada al backend
      const response = await upgradeToSommelier(token);

      // Actualizamos el Contexto Global para que "FavoritesScreen" se desbloquee automáticamente
      const newToken = response?.token || token;
      const updatedUser = { ...user, role: 'Sommelier' };
      
      onLogin(updatedUser, newToken); 

      Alert.alert(
        '¡Felicidades!',
        'Ahora eres Sommelier. Ya puedes acceder a tus vinos Favoritos.',
        [
            { 
                text: 'Ir a Favoritos', 
                onPress: () => navigation.navigate('Favorites') // Opcional: llevarlo directo
            },
            { text: 'OK' }
        ]
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo procesar la suscripción. Intenta nuevamente.');
      setMembership(currentRole); // Revertir visualmente
    } finally {
      setSaving(false);
    }
  };

  const membershipPlans = ['User', 'Sommelier']; 
  // Ocultamos Admin de la UI de selección normal para que no se confundan

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Datos de Usuario */}
        <Text style={styles.label}>Correo electrónico</Text>
        <View style={styles.readonlyBox}>
            <Text style={styles.readonlyText}>{user.email}</Text>
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>Nombre</Text>
        <View style={styles.readonlyBox}>
            <Text style={styles.readonlyText}>{user.name || user.fullName || 'Usuario'}</Text>
        </View>

        {/* Selección de Plan */}
        <Text style={[styles.label, { marginTop: 24 }]}>Tipo de Suscripción</Text>
        <View style={styles.membershipRow}>
          {membershipPlans.map((plan) => {
            const isSelected = membership === plan;
            const isCurrent = currentRole === plan;

            return (
              <TouchableOpacity
                key={plan}
                style={[
                  styles.membershipPill,
                  isSelected && styles.membershipPillActive,
                ]}
                onPress={() => handleSelectMembership(plan)}
              >
                <Text style={[
                    styles.membershipText,
                    isSelected && styles.membershipTextActive
                ]}>
                  {plan}
                </Text>
                {isCurrent && (
                    <Text style={[
                        styles.membershipTag, 
                        isSelected && { color: '#EEE' }
                    ]}> (Actual)</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.helperText}>
          Al ser Sommelier desbloquearás la sección de Favoritos y recomendaciones premium.
        </Text>

        <TouchableOpacity
          style={[styles.saveButton, { opacity: saving ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>
                {currentRole === membership ? 'Guardar' : 'Actualizar Plan'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ... Tus estilos se mantienen igual ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#333' },
  readonlyBox: {
    backgroundColor: '#F4F5F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  readonlyText: { color: '#555' },
  helperText: { fontSize: 12, color: '#888', marginTop: 8, fontStyle: 'italic' },
  membershipRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  membershipPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CCC',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF'
  },
  membershipPillActive: {
    backgroundColor: COLORS.primary || '#000',
    borderColor: COLORS.primary || '#000',
  },
  membershipText: { color: '#333', fontSize: 14, fontWeight: '500' },
  membershipTextActive: { color: '#FFF' },
  membershipTag: { fontSize: 12, marginLeft: 4, color: '#666' },
  saveButton: {
    marginTop: 30,
    backgroundColor: COLORS.primary || '#000',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default SettingsScreen;