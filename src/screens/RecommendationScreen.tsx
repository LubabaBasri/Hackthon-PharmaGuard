import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ShieldAlert, CheckCircle, Info, ArrowRight } from 'lucide-react-native';
import { THEME } from '../styles/theme';
import { GlassCard } from '../components/GlassCard';
import { ActionCard } from '../components/ActionCard';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../navigation/types';
import { useScanStore } from '../store/useScanStore';
import { runLocalSimulationExecution } from '../api/agentSimulator';

export default function RecommendationScreen() {
  const navigation = useNavigation<NavigationProp<'ActionRecommendation'>>();
  const activeScanData = useScanStore((state) => state.activeScanData);
  const updateActiveScan = useScanStore((state) => state.updateActiveScan);
  const [slideUnlocked, setSlideUnlocked] = useState(false);

  if (!activeScanData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No active scan profile resolved.</Text>
      </View>
    );
  }

  const { actionsPlan = [], riskAnalysis } = activeScanData;
  const score = riskAnalysis?.score || 0;

  const handleAuthorizeActions = async () => {
    setSlideUnlocked(true);
    navigation.navigate('ActionSimulation');

    // Check if this is a real pipeline scan (UUID or local_ prefix) vs a mock scan
    const mockIdMap: Record<string, 'SAFE_DRUG' | 'EXPIRED_BATCH' | 'COUNTERFEIT_PACKAGING' | 'TOXIC_CONTAMINANT'> = {
      scan_safe_singulair: 'SAFE_DRUG',
      scan_expired_lipitor: 'EXPIRED_BATCH',
      scan_fake_singulair: 'COUNTERFEIT_PACKAGING',
      scan_toxic_contaminant: 'TOXIC_CONTAMINANT',
    };
    const scenarioKey = mockIdMap[activeScanData.id];

    if (scenarioKey) {
      // Demo mode: run the mock simulation execution
      await runLocalSimulationExecution(scenarioKey, (delta) => {
        updateActiveScan(delta);
      });
    } else {
      // Real pipeline mode: data is already in the ScanDocument from Gemini
      // Just transition the status to show the simulation results
      updateActiveScan({ status: 'simulating' });
      await new Promise<void>(r => setTimeout(r, 2000));
      updateActiveScan({ status: 'completed' });
    }
  };

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
          <Text style={styles.headerTitle}>Action Formulator</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* HITL Intervention Header */}
          {score > 50 ? (
            <GlassCard style={[styles.hitlPanel, { borderColor: THEME.colors.danger }]}>
              <View style={styles.hitlTitleRow}>
                <ShieldAlert size={20} color={THEME.colors.danger} style={{ marginRight: 8 }} />
                <Text style={[styles.hitlTitle, { color: THEME.colors.danger }]}>
                  HUMAN INTERVENTIONAL LOCK ACTIVE
                </Text>
              </View>
              <Text style={styles.hitlDesc}>
                Risk rating ({score}%) exceeds the 50% safety guard threshold. Systemic notifications and API dispatches are frozen awaiting manual inspector validation.
              </Text>
            </GlassCard>
          ) : (
            <GlassCard style={[styles.hitlPanel, { borderColor: THEME.colors.primary }]}>
              <View style={styles.hitlTitleRow}>
                <CheckCircle size={20} color={THEME.colors.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.hitlTitle, { color: THEME.colors.primary }]}>
                  STANDARD SAFETY THRESHOLD PASS
                </Text>
              </View>
              <Text style={styles.hitlDesc}>
                Risk metrics calculated below warning ranges. No interventional blocks active. Authorize standard usage verification protocols.
              </Text>
            </GlassCard>
          )}

          {/* Checklist of formulated actions */}
          <Text style={styles.sectionTitle}>FORMULATED CONTAINMENT RESPONSE PLANS</Text>
          <View style={styles.list}>
            {actionsPlan.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Text style={styles.emptyText}>No immediate action containment required.</Text>
              </GlassCard>
            ) : (
              actionsPlan.map((act) => (
                <ActionCard
                  key={act.actionId}
                  type={act.type}
                  title={act.title}
                  recipientName={act.recipientName}
                  recipientEndpoint={act.recipientEndpoint}
                  messagePayload={act.messagePayload}
                  priority={act.priority}
                />
              ))
            )}
          </View>

          {/* Interactive Slide-to-Approve trigger panel */}
          <GlassCard style={styles.sliderCard}>
            <Text style={styles.sliderInstruction}>
              {score > 50 
                ? 'OVERRIDE SAFETY LOCKS & INITIATE SIMULATION' 
                : 'DISPATCH TRANSACTION SIGNALS'}
            </Text>
            
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.sliderButton, slideUnlocked && { backgroundColor: THEME.colors.primary }]}
              onPress={handleAuthorizeActions}
            >
              <View style={[styles.sliderThumb, slideUnlocked && { left: 'auto', right: 4 }]}>
                <ArrowRight size={20} color={THEME.colors.background} />
              </View>
              <Text style={[styles.sliderButtonText, slideUnlocked && { color: THEME.colors.background }]}>
                {slideUnlocked ? 'AUTHORIZED DISPATCH' : 'PRESS TO DISPATCH CONTAINMENT'}
              </Text>
            </TouchableOpacity>

            <View style={styles.infoRow}>
              <Info size={12} color={THEME.colors.textDark} style={{ marginRight: 6 }} />
              <Text style={styles.infoText}>
                Authorization executes real-time smart-contract supply chain updates and models local health improvements.
              </Text>
            </View>
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
  hitlPanel: {
    padding: THEME.spacing.md,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.01)',
    marginBottom: THEME.spacing.lg,
  },
  hitlTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  hitlTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  hitlDesc: {
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
  list: {
    marginBottom: THEME.spacing.lg,
  },
  emptyCard: {
    alignItems: 'center',
    padding: THEME.spacing.md,
  },
  emptyText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  sliderCard: {
    padding: THEME.spacing.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  sliderInstruction: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.accent,
    letterSpacing: 1.5,
    marginBottom: THEME.spacing.md,
  },
  sliderButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: THEME.colors.backgroundLight,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sliderThumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 4,
  },
  sliderButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: THEME.colors.textSecondary,
    letterSpacing: 0.5,
    paddingLeft: 30,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: THEME.spacing.md,
    paddingHorizontal: 8,
  },
  infoText: {
    fontSize: 9,
    color: THEME.colors.textDark,
    lineHeight: 13,
    flex: 1,
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
