import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { THEME } from '../styles/theme';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'emerald' | 'cyan' | 'danger' | 'subdued';
}

export function PrimaryButton({ title, variant = 'emerald', style, ...props }: PrimaryButtonProps) {
  const getColors = () => {
    switch (variant) {
      case 'cyan':
        return { bg: THEME.colors.accent, text: THEME.colors.background };
      case 'danger':
        return { bg: THEME.colors.danger, text: THEME.colors.text };
      case 'subdued':
        return { bg: THEME.colors.backgroundLight, text: THEME.colors.textSecondary };
      case 'emerald':
      default:
        return { bg: THEME.colors.primary, text: THEME.colors.background };
    }
  };

  const colors = getColors();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.btn, { backgroundColor: colors.bg }, style]}
      {...props}
    >
      <Text style={[styles.btnText, { color: colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: THEME.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  btnText: {
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
