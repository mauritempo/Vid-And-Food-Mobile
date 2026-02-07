import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView, // <--- Importamos esto
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../../../../services/context/AuthContext';
import { upgradeToSommelier, downgradeToUser } from '../../../../services/UserService';
import { useRoute } from '@react-navigation/native';
import LoginRequired from '../../screen/LoguinRequired';

const SettingsScreen = ({ navigation }) => {
  const { user, token, onLogin } = useContext(AuthContext);
  const route = useRoute();

  const [membership, setMembership] = useState(user?.role || 'User');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && route.params?.from === 'RestrictedArea') {
      if (navigation.canGoBack()) navigation.goBack();
    }
  }, [user, route.params, navigation]);

  useEffect(() => {
    if (user?.role) setMembership(user.role);
  }, [user]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Configuración</Text>
        </View>
        <LoginRequired navigation={navigation} message="Inicia sesión para gestionar tu cuenta." />
      </SafeAreaView>
    );
  }

  const currentRole = user.role;
  const isChanging = currentRole !== membership;

  const handleSave = async () => {
    if (!token) return;
    if (!isChanging) return;

    const isDowngrade = currentRole === 'Sommelier' && membership === 'User';

    if (isDowngrade) {
      Alert.alert(
        'Confirmar Baja',
        '¿Estás seguro? Perderás acceso a tus favoritos.',
        [
          { text: 'No, mantener', style: 'cancel', onPress: () => setMembership(currentRole) },
          { text: 'Sí, bajar a User', style: 'destructive', onPress: () => executePlanChange('User') }
        ]
      );
      return;
    }

    executePlanChange('Sommelier');
  };

  const executePlanChange = async (targetPlan) => {
    setSaving(true);
    try {
      let response = targetPlan === 'Sommelier' 
        ? await upgradeToSommelier(token) 
        : await downgradeToUser(token);

      onLogin({ ...user, role: targetPlan }, response?.token || token); 
      Alert.alert('Éxito', `Tu plan ahora es ${targetPlan}`);
    } catch (err) {
      Alert.alert('Error', 'No se pudo procesar el cambio.');
      setMembership(currentRole);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Fijo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Contenido Scrolleable (Aquí está la solución) */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Correo electrónico</Text>
        <View style={styles.readonlyBox}><Text style={styles.readonlyText}>{user.email}</Text></View>

        <Text style={[styles.label, { marginTop: 16 }]}>Nombre</Text>
        <View style={styles.readonlyBox}><Text style={styles.readonlyText}>{user.name || 'Usuario'}</Text></View>

        <Text style={[styles.label, { marginTop: 24 }]}>Tipo de Suscripción</Text>
        <View style={styles.membershipRow}>
          {['User', 'Sommelier'].map((plan) => (
            <TouchableOpacity
              key={plan}
              style={[styles.membershipPill, membership === plan && styles.membershipPillActive]}
              onPress={() => setMembership(plan)}
            >
              <Text style={[styles.membershipText, membership === plan && styles.membershipTextActive]}>{plan}</Text>
              {currentRole === plan && <Text style={[styles.membershipTag, membership === plan && { color: '#EEE' }]}> (Actual)</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.helperText}>
          {membership === 'Sommelier' 
            ? 'Activarás favoritos e historial ilimitado.' 
            : 'Volverás al plan básico. Se bloquearán funciones premium.'}
        </Text>

        {/* BOTÓN DINÁMICO: Aparece solo si cambias algo */}
        {isChanging && (
          <TouchableOpacity
            style={[styles.saveButton, membership === 'User' && { backgroundColor: '#FF3B30' }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Confirmar Cambio a {membership}</Text>}
          </TouchableOpacity>
        )}
        
        <View style={{ height: 100 }} /> 
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  backButton: { padding: 4 },
  content: { flex: 1, paddingHorizontal: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#333', marginTop: 15 },
  readonlyBox: { backgroundColor: '#F4F5F7', borderRadius: 10, padding: 12 },
  readonlyText: { color: '#555' },
  membershipRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  membershipPill: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#CCC', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  membershipPillActive: { backgroundColor: '#000', borderColor: '#000' },
  membershipText: { fontWeight: '600', color: '#333' },
  membershipTextActive: { color: '#FFF' },
  membershipTag: { fontSize: 10, marginLeft: 4, color: '#666' },
  helperText: { fontSize: 13, color: '#888', marginTop: 15, fontStyle: 'italic', textAlign: 'center' },
  saveButton: { marginTop: 30, backgroundColor: '#000', borderRadius: 12, height: 55, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default SettingsScreen;