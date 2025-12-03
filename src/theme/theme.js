// theme/theme.js
// Tema adaptado para React Native

export const COLORS = {
  primary: '#5D001E', // Borgoña profundo
  secondary: '#004225', // Verde oscuro
  accent: '#D4AF37', // Dorado apagado
  background: '#FDFBF5', // Marfil
  textPrimary: '#212121',
  textSecondary: '#757575',
  white: '#FFFFFF',
  black: '#000000',
  lightGray: '#F5F5F5',
  board: '#a52a2a',
  darkGreen: '#1A3305',
  grey: '#1A1A1A',
  green: '#284907',
  red: '#8B3944',
};


export const FONTS = {
  // Para React Native, las fuentes se manejan diferente
  // Estas serían las fuentes del sistema o custom fonts cargadas
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
  
  // Tamaños de fuente
  small: 12,
  body: 14,
  title: 16,
  h3: 18,
  h2: 20,
  h1: 24,
  large: 28,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};