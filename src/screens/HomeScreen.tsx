import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck, Heart, Users, Activity, ScanLine } from 'lucide-react-native';
import { THEME } from '../styles/theme';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../navigation/types';

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<'MainApp'>>();

  return (
    <LinearGradient
      colors={[THEME.colors.background, THEME.colors.backgroundDark]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>SYSTEM OPERATOR</Text>
              <Text style={styles.titleText}>PharmaGuard Dashboard</Text>
            </View>
            <View style={styles.activeDotContainer}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>AGENT CORE ACTIVE</Text>
            </View>
          </View>

          {/* Master Call to Action Panel */}
          <GlassCard style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View style={styles.heroIconContainer}>
                <ScanLine size={28} color={THEME.colors.primary} />
              </View>
              <Text style={styles.heroTitle}>Autonomous Verification</Text>
            </View>
            <Text style={styles.heroDesc}>
              Upload or snap pharmaceutical packaging to trigger real-time multimodal OCR text extraction, regulatory checks, Bayesian risk assessments, and simulated crisis Containment actions.
            </Text>
            <PrimaryButton
              title="INITIATE MEDICATION SCAN"
              variant="emerald"
              onPress={() => navigation.navigate('UploadMedicine')}
              style={styles.heroButton}
            />
          </GlassCard>

          {/* Metrics Grid */}
          <Text style={styles.sectionTitle}>Global Health Security Vectors</Text>
          <View style={styles.grid}>
            <GlassCard style={styles.gridCard}>
              <ShieldCheck size={22} color={THEME.colors.primary} style={styles.cardIcon} />
              <Text style={styles.metricVal}>98.4%</Text>
              <Text style={styles.metricLabel}>Security Rating</Text>
            </GlassCard>

            <GlassCard style={styles.gridCard}>
              <Activity size={22} color={THEME.colors.accent} style={styles.cardIcon} />
              <Text style={styles.metricVal}>142</Text>
              <Text style={styles.metricLabel}>Total Scans</Text>
            </GlassCard>
          </View>

          <View style={[styles.grid, { marginTop: THEME.spacing.sm }]}>
            <GlassCard style={styles.gridCard}>
              <Users size={22} color={THEME.colors.warning} style={styles.cardIcon} />
              <Text style={styles.metricVal}>1.2%</Text>
              <Text style={styles.metricLabel}>Exposure Rate</Text>
            </GlassCard>

            <GlassCard style={styles.gridCard}>
              <Heart size={22} color={THEME.colors.danger} style={styles.cardIcon} />
              <Text style={styles.metricVal}>3</Text>
              <Text style={styles.metricLabel}>Active recalls</Text>
            </GlassCard>
          </View>

          {/* Guidelines Glass Panel */}
          <GlassCard style={styles.guidelineCard}>
            <Text style={styles.guideTitle}>Challenge 1 — Content-to-Action Protocol</Text>
            <Text style={styles.guideDesc}>
              This agentic interface coordinates visual scanning text extraction against FDA and GS1 Electronic blockchain ledgers, calculating community exposure indexes and executing SMS containment broadcasts.
            </Text>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: THEME.spacing.md,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
  },
  welcomeText: {
    fontSize: 10,
    color: THEME.colors.accent,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 2,
  },
  activeDotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.accent,
    marginRight: 6,
  },
  activeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: THEME.colors.accent,
    letterSpacing: 0.5,
  },
  heroCard: {
    marginBottom: THEME.spacing.lg,
    padding: THEME.spacing.lg,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  heroIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.md,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  heroDesc: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
    marginBottom: THEME.spacing.lg,
  },
  heroButton: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 1,
    marginBottom: THEME.spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridCard: {
    flex: 0.485,
    padding: THEME.spacing.md,
  },
  cardIcon: {
    marginBottom: THEME.spacing.xs,
  },
  metricVal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginVertical: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  guidelineCard: {
    marginTop: THEME.spacing.lg,
    padding: THEME.spacing.md,
  },
  guideTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: THEME.colors.accent,
    marginBottom: 6,
  },
  guideDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
  },
});
