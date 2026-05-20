import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ShieldAlert, Award, FileText, AlertTriangle } from 'lucide-react-native';
import { THEME } from '../styles/theme';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { RiskGauge } from '../components/RiskGauge';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../navigation/types';
import { useScanStore } from '../store/useScanStore';

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp<'RiskDashboard'>>();
  const activeScanData = useScanStore((state) => state.activeScanData);

  if (!activeScanData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No active scan profile resolved.</Text>
      </View>
    );
  }

  const { ocrData, riskAnalysis, clinicalImpact } = activeScanData;
  const score = riskAnalysis?.score || 0;
  const category = riskAnalysis?.category || 'safe';
  const discrepancies = riskAnalysis?.discrepancyLogs || [];

  const getThemeColor = () => {
    if (score > 50) return THEME.colors.danger;
    if (score > 15) return THEME.colors.warning;
    return THEME.colors.primary;
  };

  const themeColor = getThemeColor();

  return (
    <LinearGradient
      colors={[THEME.colors.background, THEME.colors.backgroundDark]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Risk Grading Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Top Panel - Radial Speedometer Gauge */}
          <GlassCard style={styles.gaugeCard}>
            <RiskGauge score={score} category={category} />
            <Text style={styles.confidenceText}>
              AI Certainty Score: {riskAnalysis?.confidence}%
            </Text>
          </GlassCard>

          {/* Extracted package metadata */}
          <Text style={styles.sectionTitle}>MEDICINE DETAILS FOUND</Text>
          <GlassCard style={styles.metaCard}>
            <View style={styles.metaRow}>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>MEDICINE NAME</Text>
                <Text style={styles.metaValue}>{ocrData?.brandName}</Text>
              </View>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>MANUFACTURER</Text>
                <Text style={styles.metaValue} numberOfLines={1}>{ocrData?.manufacturer}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.metaRow}>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>BATCH NUMBER</Text>
                <Text style={styles.metaValue}>{ocrData?.batchNumber}</Text>
              </View>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>SERIAL NUMBER</Text>
                <Text style={styles.metaValue}>{ocrData?.serialNumber}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.metaRow}>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>EXPIRATION DATE</Text>
                <Text style={[styles.metaValue, score > 15 && score <= 50 && { color: THEME.colors.warning }]}>
                  {ocrData?.expiryDate}
                </Text>
              </View>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>PRODUCT CODE (NDC)</Text>
                <Text style={styles.metaValue}>{ocrData?.ndc}</Text>
              </View>
            </View>
          </GlassCard>

          {/* Anomaly / Discrepancy Logs */}
          <Text style={styles.sectionTitle}>SUSPICIOUS ISSUES DETECTED</Text>
          {discrepancies.length === 0 ? (
            <GlassCard style={[styles.discrepancyCard, { borderColor: THEME.colors.primary }]}>
              <View style={styles.cardHeaderRow}>
                <Award size={18} color={THEME.colors.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.cardTitle, { color: THEME.colors.primary }]}>
                  ALL PARAMETERS VALIDATED
                </Text>
              </View>
              <Text style={styles.cardDesc}>
                Supply chain registry checks, visual typography templates, and expiration date margins perfectly verify manufacturer template profiles. Safe for patient allocation.
              </Text>
            </GlassCard>
          ) : (
            discrepancies.map((log, idx) => {
              // Simplify technical log fields
              const getSimpleFieldName = (field: string) => {
                if (field === 'fontFamilyMatch') return 'FAKE FONT DETECTED';
                if (field === 'logoDisplacementMm') return 'INCORRECT LOGO POSITION';
                if (field === 'batchNumber') return 'BATCH RECORD MISMATCH';
                if (field === 'expiryDate') return 'EXPIRATION DATE MISMATCH';
                if (field === 'serialNumber') return 'INVALID SERIAL NUMBER';
                return 'PACKAGING MISMATCH';
              };

              return (
                <GlassCard key={idx} style={[styles.discrepancyCard, { borderColor: log.severity === 'high' ? THEME.colors.danger : THEME.colors.warning }]}>
                  <View style={styles.cardHeaderRow}>
                    <AlertTriangle size={16} color={log.severity === 'high' ? THEME.colors.danger : THEME.colors.warning} style={{ marginRight: 8 }} />
                    <Text style={[styles.cardTitle, { color: log.severity === 'high' ? THEME.colors.danger : THEME.colors.warning }]}>
                      ISSUE: {getSimpleFieldName(log.field)}
                    </Text>
                  </View>
                  <View style={styles.logDetail}>
                    <Text style={styles.logLabel}>WHAT THE CAMERA SAW:</Text>
                    <Text style={styles.logVal}>{log.extractedValue}</Text>
                  </View>
                  <View style={styles.logDetail}>
                    <Text style={styles.logLabel}>WHAT THE OFFICIAL RECORD SAYS:</Text>
                    <Text style={styles.logVal}>{log.registryValue}</Text>
                  </View>
                </GlassCard>
              );
            })
          )}

          {/* Clinical impact details if high risk */}
          {score > 50 && (
            <>
              <Text style={styles.sectionTitle}>HEALTH & SAFETY WARNINGS</Text>
              <GlassCard style={[styles.discrepancyCard, { borderColor: THEME.colors.danger, backgroundColor: 'rgba(255, 23, 68, 0.03)' }]}>
                <View style={styles.cardHeaderRow}>
                  <ShieldAlert size={18} color={THEME.colors.danger} style={{ marginRight: 8 }} />
                  <Text style={[styles.cardTitle, { color: THEME.colors.danger }]}>
                    DANGER LEVEL: {clinicalImpact?.severityLevel.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.cardDesc}>{clinicalImpact?.therapeuticInactionRisk}</Text>
                {clinicalImpact?.contaminantRisk.suspectedToxins.length! > 0 && (
                  <View style={styles.contaminantWrapper}>
                    <Text style={styles.contaminantLabel}>DANGEROUS INGREDIENTS FOUND:</Text>
                    <Text style={styles.contaminantValue}>
                      {clinicalImpact?.contaminantRisk.suspectedToxins.join(', ')}
                    </Text>
                  </View>
                )}
              </GlassCard>
            </>
          )}

          {/* Containment action triggers */}
          <PrimaryButton
            title="VIEW SYSTEMIC CONTAINMENT PROTOCOLS"
            variant={score > 50 ? 'danger' : 'emerald'}
            onPress={() => navigation.navigate('ActionRecommendation')}
            style={styles.ctaButton}
          />
          
          <PrimaryButton
            title="RETURN TO HOME"
            variant="subdued"
            onPress={() => navigation.navigate('MainApp')}
            style={styles.homeButton}
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.md,
    height: 56,
    borderBottomWidth: 1,
    borderColor: THEME.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
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
  gaugeCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.lg,
  },
  confidenceText: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: THEME.spacing.xs,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 1.5,
    marginBottom: THEME.spacing.sm,
    marginTop: THEME.spacing.xs,
  },
  metaCard: {
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaCol: {
    flex: 0.48,
  },
  metaLabel: {
    fontSize: 9,
    color: THEME.colors.textDark,
    fontWeight: 'bold',
  },
  metaValue: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '600',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginVertical: THEME.spacing.sm,
  },
  discrepancyCard: {
    padding: THEME.spacing.md,
    borderWidth: 1,
    marginBottom: THEME.spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cardDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
  logDetail: {
    marginBottom: 6,
  },
  logLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: THEME.colors.textDark,
  },
  logVal: {
    fontSize: 12,
    color: '#FFF',
    marginTop: 2,
  },
  contaminantWrapper: {
    marginTop: THEME.spacing.sm,
    borderTopWidth: 0.5,
    borderColor: THEME.colors.border,
    paddingTop: THEME.spacing.sm,
  },
  contaminantLabel: {
    fontSize: 9,
    color: THEME.colors.danger,
    fontWeight: 'bold',
  },
  contaminantValue: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
    marginTop: 2,
  },
  ctaButton: {
    marginTop: THEME.spacing.md,
  },
  homeButton: {
    marginTop: THEME.spacing.sm,
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
