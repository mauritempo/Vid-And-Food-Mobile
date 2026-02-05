import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { COLORS } from '../../theme/theme';

const LoginRequired = ({ navigation, message, onLoginPress }) => {
  return (
    <View style={styles.container}>
      <Ionicons 
        name="lock-closed-outline" 
        size={60} // Un poco más pequeño para que respire
        color="#DDD" 
        style={{ marginBottom: 15 }}
      />

      <Text style={styles.title}>Acceso Restringido</Text>
      
      <Text style={styles.message}>
        {message || "Debes iniciar sesión para acceder a esta sección."}
      </Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => {
            // Si pasamos una función para cerrar el modal antes de irnos, la ejecutamos
            if (onLoginPress) onLoginPress();
            navigation.navigate('Profile', { from: 'RestrictedArea' }); 
        }}
      >
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // QUITAMOS EL FLEX: 1 QUE CONGELA LA PANTALLA
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    // QUITAMOS EL FONDO BLANCO (lo pondrá el Modal)
    backgroundColor: 'transparent', 
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    color: '#666',
    marginBottom: 25,
    lineHeight: 20,
  },
  button: {
    backgroundColor: COLORS.primary || '#6200EE',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginRequired;