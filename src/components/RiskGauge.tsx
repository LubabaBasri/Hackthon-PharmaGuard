import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { THEME } from '../styles/theme';

interface RiskGaugeProps {
  score: number;
  category: 'safe' | 'low_risk' | 'moderate_risk' | 'high_risk' | 'critical_danger';
}

export function RiskGauge({ score, category }: RiskGaugeProps) {
  const radius = 80;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = () => {
    switch (category) {
      case 'safe':
        return THEME.colors.primary;
      case 'low_risk':
      case 'moderate_risk':
        return THEME.colors.warning;
      case 'high_risk':
      case 'critical_danger':
      default:
        return THEME.colors.danger;
    }
  };

  const color = getColor();

  const getLabel = () => {
    return category.replace('_', ' ').toUpperCase();
  };

  return (
    <View style={styles.container}>
      <View style={styles.gaugeWrapper}>
        <Svg width={200} height={200} viewBox="0 0 200 200">
          <Circle
            cx="100"
            cy="100"
            r={radius}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx="100"
            cy="100"
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            transform="rotate(-90 100 100)"
          />
        </Svg>
        <View style={styles.textWrapper}>
          <Text style={styles.scoreText}>{score}</Text>
          <Text style={styles.totalText}>/ 100</Text>
        </View>
      </View>
      <View style={[styles.badge, { backgroundColor: `${color}1A`, borderColor: color }]}>
        <Text style={[styles.badgeText, { color }]}>{getLabel()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: THEME.spacing.md,
  },
  gaugeWrapper: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  textWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
  },
  totalText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: -4,
  },
  badge: {
    marginTop: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
