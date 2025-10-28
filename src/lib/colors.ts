export const AIRBNB_PRIMARY = '#d71f33';

export const CLASS_COLORS = {
  'HOTEL': '#0ea5e9',
  'HOSTEL': '#10b981',
  'HOSTERIA Y/O POSADA': '#f59e0b',
  'CABAÑAS': '#8b5cf6',
  'CAMPING': '#22c55e',
  'NO CATEGORIZADO': '#6b7280',
  
} as const;

export const colors = {
  // === COLORES PRINCIPALES ===
  primary: '#d71f33',
  primaryForeground: '#ffffff',
  secondary: '#E64A5A',
  secondaryForeground: '#ffffff',

  // === TEMA CLARO ===
  light: {
    background: '#FAFAF9',    // Fondo Principal (Body)
    foreground: '#1C1917',   // Títulos y Texto Fuerte
    card: '#F5F5F4',         // Fondos de Secciones (Cards)
    cardForeground: '#1C1917',
    border: '#E7E5E4',       // Bordes y Divisores
    muted: '#E7E5E4',        // Bordes y Divisores
    mutedForeground: '#A8A29E', // Texto Sutil
  },

  // === TEMA OSCURO ===
  dark: {
    background: '#1C1917',   // Fondo Principal (Body)
    foreground: '#FAFAF9',   // Títulos y Texto Fuerte
    card: '#44403C',         // Fondos de Secciones (Cards)
    cardForeground: '#E7E5E4', // Texto Principal
    border: '#57534E',       // Bordes y Divisores
    muted: '#57534E',        // Bordes y Divisores
    mutedForeground: '#A8A29E', // Texto Sutil
  },
} as const;

// Clases CSS personalizadas para Tailwind v4
export const colorClasses = {
  // Colores principales
  primary: 'text-primary bg-primary border-primary',
  secondary: 'text-secondary bg-secondary border-secondary',
  
  // Tema Claro
  light: {
    background: 'bg-background',
    foreground: 'text-foreground',
    card: 'bg-card text-card-foreground',
    border: 'border-border',
    muted: 'text-muted-foreground',
  },
  
  // Tema Oscuro
  dark: {
    background: 'dark:bg-background',
    foreground: 'dark:text-foreground',
    card: 'dark:bg-card dark:text-card-foreground',
    border: 'dark:border-border',
    muted: 'dark:text-muted-foreground',
  },
} as const;

// Utilidades para componentes
export const componentStyles = {
  button: {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
  },
  card: {
    base: 'bg-card text-card-foreground border border-border',
    light: 'bg-card-light text-title-light border-light',
    dark: 'dark:bg-card-dark dark:text-title-dark dark:border-dark',
  },
  input: {
    base: 'border-input bg-background text-foreground',
    light: 'border-light bg-background-light text-text-light',
    dark: 'dark:border-dark dark:bg-background-dark dark:text-text-dark',
  },
} as const;