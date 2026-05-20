import { COLORS } from './colors';

export const THEME = {
  colors: COLORS,
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    mono: 'System',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: {
      color: COLORS.text,
      fontSize: 26,
      fontWeight: 'bold' as const,
      letterSpacing: 0.5,
    },
    h2: {
      color: COLORS.text,
      fontSize: 20,
      fontWeight: 'bold' as const,
    },
    h3: {
      color: COLORS.text,
      fontSize: 16,
      fontWeight: '600' as const,
    },
    body: {
      color: COLORS.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    caption: {
      color: COLORS.textDark,
      fontSize: 12,
    },
    mono: {
      color: COLORS.accent,
      fontSize: 11,
      fontFamily: 'System',
    }
  }
};
