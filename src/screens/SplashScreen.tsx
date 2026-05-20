import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck } from 'lucide-react-native';
import { THEME } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../navigation/types';

export default function SplashScreen() {
  const navigation = useNavigation<NavigationProp<'Splash'>>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('MainApp');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={[THEME.colors.background, THEME.colors.backgroundDark]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <ShieldCheck size={64} color={THEME.colors.primary} />
        </View>
        <Text style={styles.title}>PHARMAGUARD AI</Text>
        <Text style={styles.subtitle}>Autonomous Medicine Intelligence & Response</Text>
      </View>
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={THEME.colors.accent} />
        <Text style={styles.loadingText}>INITIALIZING AI COGNITIVE CORE...</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 230, 118, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: THEME.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 3,
    marginBottom: THEME.spacing.xs,
  },
  subtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    letterSpacing: 0.5,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 9,
    color: THEME.colors.accent,
    letterSpacing: 1.5,
    marginTop: THEME.spacing.sm,
    fontWeight: '600',
  },
});
