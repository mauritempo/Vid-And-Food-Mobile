import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../../../theme/theme';
import AuthContext from '../../../../services/context/AuthContext';

const API_URL = process.env.API_URL;

const ProfileScreen = ({ navigation }) => {
  const { loginRequest, onLogout, loading, user } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isValid = email.length > 0 && password.length > 0;

  const handleLogin = async () => {
    try {
      console.log('FETCH A:', `${API_URL}/User/login`, { email, password });
      await loginRequest({ email, password });
      console.log('Login OK', email);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', e.message || 'Error al iniciar sesión');
    }
  };

  const handleRegister = () => {
    Alert.alert('Registro', 'Aquí iría tu navegación a la pantalla de registro.');
  };

  if (user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {(user.name || user.fullName || user.email || 'U')
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>
            <Text style={styles.userName}>
              {user.name || user.fullName || 'Usuario'}
            </Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>

          <View style={styles.menuContainer}>
            {/* ÚNICO ITEM: CONFIGURACIÓN */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={22} color="#333" />
              <Text style={styles.menuText}>Configuración</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={[styles.content, { justifyContent: 'center' }]}>
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Ionicons name="wine" size={60} color={COLORS.primary} />
          <Text style={styles.welcomeTitle}>Bienvenido</Text>
          <Text style={styles.welcomeSubtitle}>
            Inicia sesión para guardar tus favoritos
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[
            styles.loginButton,
            {
              opacity: isValid ? 1 : 0.6,
              backgroundColor: isValid ? COLORS.primary : '#999',
            },
          ]}
          onPress={handleLogin}
          disabled={loading || !isValid}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.loginButtonText}>Ingresar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={{ marginTop: 20 }} onPress={handleRegister}>
          <Text style={{ color: '#666' }}>
            ¿No tienes cuenta?{' '}
            <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>
              Regístrate
            </Text>
          </Text>
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
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, padding: 24 },

  avatarContainer: { alignItems: 'center', marginBottom: 40 },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: COLORS.primary },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#666', marginTop: 4 },
  menuContainer: { marginBottom: 30 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuText: { flex: 1, marginLeft: 16, fontSize: 16, color: '#333' },
  logoutButton: {
    backgroundColor: '#FFF0F0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: { color: '#E91E63', fontWeight: 'bold', fontSize: 16 },

  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  welcomeSubtitle: { fontSize: 14, color: '#888', marginTop: 5 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 16,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: '100%', color: '#333' },
  loginButton: {
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  loginButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default ProfileScreen;
