import  { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
// Ajusta esta ruta a donde tengas tus colores
import { COLORS } from '../../../theme/theme'; 
import { registerUser } from '../../../../services/UserService';
// Importamos el servicio que creamos en el paso 1

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = name.length > 0 && email.length > 0 && password.length > 0;

  const handleRegister = async () => {
    if (!isValid) return;
    
    setLoading(true);
    try {
      await registerUser({ name, email, password });
      
      Alert.alert(
        '¡Éxito!',
        'Usuario registrado correctamente. Ahora puedes iniciar sesión.',
        [
          { text: 'OK', onPress: () => navigation.goBack() } // Vuelve al login al terminar
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con botón para volver */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Cuenta</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.content, { justifyContent: 'center' }]}>
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Ionicons name="person-add-outline" size={50} color={COLORS.primary} />
          <Text style={styles.welcomeTitle}>Regístrate</Text>
          <Text style={styles.welcomeSubtitle}>
            Completa tus datos para comenzar
          </Text>
        </View>

        {/* Input Nombre */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            placeholder="Nombre completo"
            value={name}
            onChangeText={setName}
            style={styles.input}
            autoCapitalize="words"
          />
        </View>

        {/* Input Email */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Input Password */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />
        </View>

        {/* Botón Registrar */}
        <TouchableOpacity
          style={[
            styles.registerButton,
            {
              opacity: isValid ? 1 : 0.6,
              backgroundColor: isValid ? COLORS.primary : '#999',
            },
          ]}
          onPress={handleRegister}
          disabled={loading || !isValid}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.registerButtonText}>Crear Cuenta</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={{ marginTop: 20, alignSelf: 'center' }} 
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#666' }}>
            ¿Ya tienes cuenta?{' '}
            <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>
              Inicia Sesión
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
  welcomeTitle: { fontSize: 28, fontWeight: 'bold', color: '#333', marginTop: 10 },
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
  registerButton: {
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
  registerButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default RegisterScreen;