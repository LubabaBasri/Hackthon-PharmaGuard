import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck, Cpu, ArrowRightLeft, Landmark } from 'lucide-react-native';
import { THEME } from '../styles/theme';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../navigation/types';
import { useScanStore } from '../store/useScanStore';

export default function SimulationScreen() {
  const navigation = useNavigation<NavigationProp<'ActionSimulation'>>();
  const activeScanData = useScanStore((state) => state.activeScanData);
  const resetScan = useScanStore((state) => state.resetScan);

  if (!activeScanData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No active scan profile resolved.</Text>
      </View>
    );
  }

  const { status, simulation } = activeScanData;
  const isSimulating = status === 'simulating';

  const beforeMetrics = simulation?.stateChange.metricsBefore || {
    exposureRisk: 80,
    distributorLiabilityScore: 70,
    patientRecoveryChance: 20,
    supplyChainTrustRating: 40,
  };

  const afterMetrics = simulation?.stateChange.metricsAfter || {
    exposureRisk: 5,
    distributorLiabilityScore: 10,
    patientRecoveryChance: 98,
    supplyChainTrustRating: 75,
  };

  const ledgerTxs = simulation?.stateChange.ledgerTransactionsSimulated || [];

  const renderProgressBar = (label: string, beforeVal: number, afterVal: number, color: string) => {
    return (
      <View style={styles.barBlock}>
        <View style={styles.barLabelsRow}>
          <Text style={styles.barLabelText}>{label}</Text>
          <View style={styles.valComparison}>
            <Text style={styles.beforeValText}>{beforeVal}%</Text>
            <ArrowRightLeft size={10} color={THEME.colors.textDark} style={{ marginHorizontal: 6 }} />
            <Text style={[styles.afterValText, { color }]}>{afterVal}%</Text>
          </View>
        </View>
        <View style={styles.barShell}>
          {/* Before Bar */}
          <View
            style={[
              styles.barTrack,
              { width: `${beforeVal}%`, backgroundColor: THEME.colors.border },
            ]}
          />
          {/* After Bar - overlay glowing */}
          <View
            style={[
              styles.barFill,
              { width: `${afterVal}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[THEME.colors.background, THEME.colors.backgroundDark]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Cpu size={22} color={THEME.colors.accent} style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>System State Simulator</Text>
        </View>

        {isSimulating ? (
          <View style={styles.loaderArea}>
            <ActivityIndicator size="large" color={THEME.colors.accent} />
            <Text style={styles.loaderTitle}>MODELING CONTAINMENT ECOSYSTEM DELTAS...</Text>
            <Text style={styles.loaderDesc}>
              Executing smart contracts, formulating SMS cell broadcast loads, and predicting Bayesian public exposure mitigations.
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Simulation Header Glass panel */}
            <GlassCard style={styles.successPanel}>
              <View style={styles.successHeader}>
                <ShieldCheck size={24} color={THEME.colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.successTitle}>MITIGATION MODEL RESOLVED</Text>
              </View>
              <Text style={styles.successDesc}>
                Executing containment procedures blocks localized consumer access vectors, dropping regulatory distributor liabilities and guaranteeing positive clinical recoveries.
              </Text>
            </GlassCard>

            {/* Before vs After State Change */}
            <Text style={styles.sectionTitle}>SYSTEM STATE TRANSITIONS (BEFORE vs AFTER)</Text>
            <GlassCard style={styles.metricsCard}>
              {renderProgressBar(
                'COMMUNITY EXPOSURE HAZARD',
                beforeMetrics.exposureRisk,
                afterMetrics.exposureRisk,
                THEME.colors.primary // Drops exposure -> primary success
              )}
              {renderProgressBar(
                'DISTRIBUTOR SYSTEM LIABILITY',
                beforeMetrics.distributorLiabilityScore,
                afterMetrics.distributorLiabilityScore,
                THEME.colors.primary // Drops liability -> primary success
              )}
              {renderProgressBar(
                'PATIENT THERAPEUTIC RECOVERY CHANCE',
                beforeMetrics.patientRecoveryChance,
                afterMetrics.patientRecoveryChance,
                THEME.colors.accent // Rises recovery -> accent intelligence
              )}
              {renderProgressBar(
                'SUPPLY CHAIN NETWORK TRUST',
                beforeMetrics.supplyChainTrustRating,
                afterMetrics.supplyChainTrustRating,
                THEME.colors.primary // Rises trust -> primary success
              )}
            </GlassCard>

            {/* Simulated Blockchain Registry Transactions */}
            <Text style={styles.sectionTitle}>SIMULATED GS1 SUPPLY BLOCKCHAIN LEDGERS</Text>
            {ledgerTxs.map((tx, idx) => (
              <GlassCard key={idx} style={styles.txCard}>
                <View style={styles.txHeaderRow}>
                  <Landmark size={14} color={THEME.colors.accent} style={{ marginRight: 6 }} />
                  <Text style={styles.txTitle}>{tx.actionApplied}</Text>
                </View>
                <View style={styles.txDetailRow}>
                  <Text style={styles.txDetailLabel}>TRANSACTION HASH:</Text>
                  <Text style={styles.txDetailValue} numberOfLines={1}>{tx.transactionHash}</Text>
                </View>
                <View style={styles.txDetailRow}>
                  <Text style={styles.txDetailLabel}>NOTIFIED BLOCK NODES:</Text>
                  <Text style={styles.txDetailValue}>{tx.nodesNotified.join(', ')}</Text>
                </View>
              </GlassCard>
            ))}

            {/* Completion Button back home */}
            <PrimaryButton
              title="DISPATCH CONTAINMENT DISPATCHES"
              variant="emerald"
              onPress={() => {
                resetScan();
                navigation.navigate('MainApp');
              }}
              style={styles.ctaButton}
            />
          </ScrollView>
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderBottomWidth: 1,
    borderColor: THEME.colors.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  content: {
    padding: THEME.spacing.md,
    paddingBottom: 40,
  },
  loaderArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: THEME.spacing.xl,
  },
  loaderTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.accent,
    letterSpacing: 1.5,
    marginTop: THEME.spacing.lg,
    textAlign: 'center',
  },
  loaderDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: THEME.spacing.sm,
  },
  successPanel: {
    padding: THEME.spacing.md,
    borderColor: THEME.colors.primary,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 230, 118, 0.02)',
    marginBottom: THEME.spacing.lg,
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  successTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.primary,
    letterSpacing: 1.5,
  },
  successDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 1.5,
    marginBottom: THEME.spacing.sm,
  },
  metricsCard: {
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
  },
  barBlock: {
    marginBottom: THEME.spacing.md,
  },
  barLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  barLabelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.textDark,
  },
  valComparison: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  beforeValText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  afterValText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  barShell: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 0.5,
    borderColor: THEME.colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  barTrack: {
    height: '100%',
    position: 'absolute',
    left: 0,
    opacity: 0.3,
  },
  barFill: {
    height: '100%',
    position: 'absolute',
    left: 0,
  },
  txCard: {
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  txHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  txTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  txDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  txDetailLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: THEME.colors.textDark,
  },
  txDetailValue: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    flex: 0.7,
    textAlign: 'right',
  },
  ctaButton: {
    marginTop: THEME.spacing.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#090D10',
  },
  errorText: {
    color: '#FFF',
    fontSize: 14,
  },
});
