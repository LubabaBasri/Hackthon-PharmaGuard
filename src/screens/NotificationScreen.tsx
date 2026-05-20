import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, ShieldAlert, AlertTriangle, Info } from 'lucide-react-native';
import { THEME } from '../styles/theme';
import { GlassCard } from '../components/GlassCard';

export default function NotificationScreen() {
  const mockNotifications = [
    {
      id: '1',
      title: 'Global WHO Drug Advisory Alert',
      desc: 'Cough syrup guaifenesin batches B-TOXIC-WHO are flagged for severe chemical DEG contamination in active liquid bases.',
      time: '2 hours ago',
      severity: 'critical',
    },
    {
      id: '2',
      title: 'Counterfeit Influx Intercepted',
      desc: 'Local coordinates in Austin, TX reports intercepted packaging duplicates of Singulair 10mg containing Helvetica bold font modifications.',
      time: '1 day ago',
      severity: 'high',
    },
    {
      id: '3',
      title: 'GS1 Verification Protocol Update',
      desc: 'Active GS1 supply chain validator nodes compiled smart contract integrity checks to enforce strict manufacturing geographic compliance.',
      time: '3 days ago',
      severity: 'low',
    },
  ];

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { color: THEME.colors.danger, icon: <ShieldAlert size={18} color={THEME.colors.danger} /> };
      case 'high':
        return { color: THEME.colors.warning, icon: <AlertTriangle size={18} color={THEME.colors.warning} /> };
      case 'low':
      default:
        return { color: THEME.colors.accent, icon: <Info size={18} color={THEME.colors.accent} /> };
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
          <Bell size={22} color={THEME.colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>System Safety Alerts</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {mockNotifications.map((notif) => {
            const sev = getSeverityStyle(notif.severity);
            return (
              <GlassCard key={notif.id} style={[styles.notifCard, { borderLeftColor: sev.color }]}>
                <View style={styles.notifHeaderRow}>
                  <View style={styles.notifHeaderLeft}>
                    {sev.icon}
                    <Text style={styles.notifTitle} numberOfLines={1}>{notif.title}</Text>
                  </View>
                  <Text style={styles.timeText}>{notif.time}</Text>
                </View>
                <Text style={styles.notifDesc}>{notif.desc}</Text>
              </GlassCard>
            );
          })}
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
  notifCard: {
    padding: THEME.spacing.md,
    borderLeftWidth: 3,
    marginBottom: THEME.spacing.sm,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notifHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.8,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 8,
    flex: 1,
  },
  timeText: {
    fontSize: 9,
    color: THEME.colors.textDark,
  },
  notifDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
});
