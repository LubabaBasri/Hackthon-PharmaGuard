import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, Loader2, Circle } from 'lucide-react-native';
import { THEME } from '../styles/theme';

interface TimelineStepProps {
  title: string;
  description: string;
  status: 'pending' | 'running' | 'done';
  isLast?: boolean;
}

export function TimelineStep({ title, description, status, isLast = false }: TimelineStepProps) {
  const getIcon = () => {
    switch (status) {
      case 'done':
        return <CheckCircle2 size={20} color={THEME.colors.primary} />;
      case 'running':
        return <Loader2 size={20} color={THEME.colors.accent} style={styles.rotate} />;
      case 'pending':
      default:
        return <Circle size={20} color={THEME.colors.textDark} />;
    }
  };

  const getTextStyle = () => {
    switch (status) {
      case 'done':
        return { color: THEME.colors.text, fontWeight: '600' as const };
      case 'running':
        return { color: THEME.colors.accent, fontWeight: 'bold' as const };
      case 'pending':
      default:
        return { color: THEME.colors.textSecondary };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.indicatorCol}>
        <View style={styles.iconWrapper}>{getIcon()}</View>
        {!isLast && (
          <View
            style={[
              styles.line,
              { backgroundColor: status === 'done' ? THEME.colors.primary : THEME.colors.border },
            ]}
          />
        )}
      </View>
      <View style={styles.contentCol}>
        <Text style={[styles.title, getTextStyle()]}>{title}</Text>
        <Text style={styles.desc}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: 70,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 32,
  },
  iconWrapper: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  contentCol: {
    flex: 1,
    paddingLeft: THEME.spacing.md,
    paddingBottom: THEME.spacing.lg,
  },
  title: {
    fontSize: 15,
    marginBottom: 4,
  },
  desc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
  },
  rotate: {
    transform: [{ rotate: '45deg' }], // Simulated active spinner layout fallback
  },
});
