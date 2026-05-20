import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { History, FileJson, Calendar, X, AlertTriangle } from 'lucide-react-native';
import { THEME } from '../styles/theme';
import { GlassCard } from '../components/GlassCard';
import { useScanStore, ScanDocument } from '../store/useScanStore';

export default function HistoryScreen() {
  const scanHistory = useScanStore((state) => state.scanHistory);
  const [selectedScanForLog, setSelectedScanForLog] = useState<ScanDocument | null>(null);

  const getCategoryColor = (cat?: string) => {
    switch (cat) {
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

  return (
    <LinearGradient
      colors={[THEME.colors.background, THEME.colors.backgroundDark]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <History size={22} color={THEME.colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>Medical Audit Ledger</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {scanHistory.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <AlertTriangle size={32} color={THEME.colors.textDark} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyTitle}>NO AUDITS RECORDED</Text>
              <Text style={styles.emptyDesc}>
                Supply checks are cached in memory. Initiate a package scan verification from the Home dashboard to populate the ledger database.
              </Text>
            </GlassCard>
          ) : (
            scanHistory.map((scan) => {
              const color = getCategoryColor(scan.riskAnalysis?.category);
              return (
                <GlassCard key={scan.id} style={styles.scanCard}>
                  <View style={styles.scanHeader}>
                    <View style={styles.scanTitleCol}>
                      <Text style={styles.brandTitle} numberOfLines={1}>
                        {scan.ocrData?.brandName || 'Unclassified Medication'}
                      </Text>
                      <View style={styles.dateRow}>
                        <Calendar size={10} color={THEME.colors.textDark} style={{ marginRight: 4 }} />
                        <Text style={styles.dateText}>
                          {new Date(scan.createdAt).toLocaleDateString()} at{' '}
                          {new Date(scan.createdAt).toLocaleTimeString()}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.riskBadge, { borderColor: color, backgroundColor: `${color}1A` }]}>
                      <Text style={[styles.riskText, { color }]}>
                        {scan.riskAnalysis?.score || 0} %
                      </Text>
                    </View>
                  </View>

                  <View style={styles.scanSubContent}>
                    <Text style={styles.scanInfoLabel}>NDC: {scan.ocrData?.ndc || 'N/A'}</Text>
                    <Text style={styles.scanInfoLabel}>BATCH: {scan.ocrData?.batchNumber || 'N/A'}</Text>
                  </View>

                  <View style={styles.divider} />

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.inspectButton}
                    onPress={() => setSelectedScanForLog(scan)}
                  >
                    <FileJson size={14} color={THEME.colors.accent} style={{ marginRight: 6 }} />
                    <Text style={styles.inspectText}>INSPECT TRACE TELEMETRY</Text>
                  </TouchableOpacity>
                </GlassCard>
              );
            })
          )}
        </ScrollView>

        {/* Modal JSON Inspector Overlay */}
        <Modal
          visible={selectedScanForLog !== null}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedScanForLog(null)}
        >
          <View style={styles.modalBg}>
            <LinearGradient
              colors={[THEME.colors.backgroundLight, THEME.colors.backgroundDark]}
              style={styles.modalContent}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <FileJson size={18} color={THEME.colors.accent} style={{ marginRight: 8 }} />
                  <Text style={styles.modalTitle}>AI Orchestration Trace</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedScanForLog(null)}
                >
                  <X size={20} color="#FFF" />
                </TouchableOpacity>
              </View>

              {/* Modal Scroll area */}
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={true}>
                <Text style={styles.jsonText}>
                  {JSON.stringify(selectedScanForLog, null, 2)}
                </Text>
              </ScrollView>
            </LinearGradient>
          </View>
        </Modal>
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
  emptyCard: {
    padding: THEME.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 1.5,
    marginBottom: THEME.spacing.xs,
  },
  emptyDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  scanCard: {
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scanTitleCol: {
    flex: 0.8,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 9,
    color: THEME.colors.textDark,
  },
  riskBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riskText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  scanSubContent: {
    flexDirection: 'row',
    marginTop: THEME.spacing.sm,
  },
  scanInfoLabel: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginRight: THEME.spacing.md,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginVertical: THEME.spacing.sm,
  },
  inspectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: THEME.colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  inspectText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.accent,
    letterSpacing: 0.5,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: THEME.spacing.md,
    borderBottomWidth: 0.5,
    borderColor: THEME.colors.border,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    flex: 1,
    marginTop: THEME.spacing.md,
  },
  jsonText: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    fontFamily: 'System',
    lineHeight: 15,
  },
});
