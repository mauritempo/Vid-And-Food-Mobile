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

import AuthContext from '../../../../services/context/AuthContext';
import { upgradeToSommelier } from '../../../../services/UserService';
import { COLORS } from '../../../theme/theme';

const SettingsScreen = ({ navigation }) => {
  const { user, token, onLogin } = useContext(AuthContext);

  const [membership, setMembership] = useState(user?.role || 'User');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.role) {
      setMembership(user.role);
    }
  }, [user]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Configuración</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.contentCenter}>
          <Text style={{ textAlign: 'center', color: '#666' }}>
            Debes iniciar sesión para ver tu configuración.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentRole = user.role;

  const handleSelectMembership = (plan) => {
    setMembership(plan);
  };

  const handleSave = async () => {
    if (!token) {
      Alert.alert('Error', 'Debes iniciar sesión para actualizar tu suscripción.');
      return;
    }

    if (currentRole === membership) {
      Alert.alert(
        'Sin cambios',
        'No realizaste ningún cambio en tu tipo de suscripción.'
      );
      return;
    }

    const isUserToSommelier = currentRole === 'User' && membership === 'Sommelier';
    if (!isUserToSommelier) {
      Alert.alert(
        'Cambio no disponible',
        'Desde esta pantalla solo podés actualizar tu suscripción de Usuario a Sommelier.'
      );
      setMembership(currentRole);
      return;
    }

    setSaving(true);
    try {
      const response = await upgradeToSommelier(token);

      const newToken = response?.token || token;
      const updatedUser = { ...user, role: 'Sommelier' };

      onLogin(updatedUser, newToken);

      Alert.alert(
        'Suscripción actualizada',
        'Ahora sos Sommelier en Vid & Food. Disfrutá de los beneficios de tu nueva suscripción.'
      );
    } catch (err) {
      Alert.alert(
        'No se pudo actualizar tu suscripción',
        err.message || 'Ocurrió un error al actualizar tu tipo de membresía.'
      );
      setMembership(currentRole);
    } finally {
      setSaving(false);
    }
  };

  const membershipPlans =
    currentRole === 'Admin'
      ? ['User', 'Sommelier', 'Admin']
      : ['User', 'Sommelier'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Email */}
        <Text style={styles.label}>Correo electrónico</Text>
        <View style={styles.readonlyBox}>
          <Text style={styles.readonlyText}>{user.email}</Text>
        </View>
        <Text style={styles.helperText}>
          El email se utiliza para iniciar sesión y comunicaciones.
        </Text>

        {/* Nombre */}
        <Text style={[styles.label, { marginTop: 16 }]}>Nombre y apellido</Text>
        <View style={styles.readonlyBox}>
          <Text style={styles.readonlyText}>
            {user.name || user.fullName || 'Sin nombre'}
          </Text>
        </View>

        {/* Suscripción */}
        <Text style={[styles.label, { marginTop: 24 }]}>Suscripción</Text>
        <View style={styles.membershipRow}>
          {membershipPlans.map((plan) => {
            const isSelected = membership === plan;
            const isCurrent = currentRole === plan;

            let tagText = '';
            if (isCurrent) tagText = '(actual)';
            else if (currentRole === 'User' && plan === 'Sommelier')
              tagText = '(actualizar)';

            return (
              <TouchableOpacity
                key={plan}
                style={[
                  styles.membershipPill,
                  isSelected && styles.membershipPillActive,
                ]}
                onPress={() => handleSelectMembership(plan)}
              >
                <Text
                  style={[
                    styles.membershipText,
                    isSelected && styles.membershipTextActive,
                  ]}
                >
                  {plan}
                </Text>
                {tagText ? (
                  <Text
                    style={[
                      styles.membershipTag,
                      isSelected && styles.membershipTextActive,
                    ]}
                  >
                    {' '}
                    {tagText}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.helperText}>
          El tipo de membresía define beneficios como historial ampliado, bodega
          y recomendaciones avanzadas.
        </Text>

        {/* Botón guardar */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar cambios</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },

  content: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  contentCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#333' },
  readonlyBox: {
    backgroundColor: '#F4F5F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  readonlyText: { color: '#555' },
  helperText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },

  membershipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  membershipPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CCC',
    flexDirection: 'row',
    alignItems: 'center',
  },
  membershipPillActive: {
    backgroundColor: COLORS.primary || '#000',
    borderColor: COLORS.primary || '#000',
  },
  membershipText: { color: '#333', fontSize: 14 },
  membershipTextActive: { color: '#FFF' },
  membershipTag: { fontSize: 11, color: '#777' },

  saveButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary || '#000',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default SettingsScreen;
