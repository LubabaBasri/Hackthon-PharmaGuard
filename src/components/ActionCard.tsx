import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertCircle, ChevronDown, ChevronRight, Mail, Phone, ShieldAlert, Globe } from 'lucide-react-native';
import { THEME } from '../styles/theme';

interface ActionCardProps {
  type: 'patient_quarantine' | 'supplier_alert' | 'regulatory_report' | 'manufacturer_audit' | 'broadcast_warning';
  title: string;
  recipientName: string;
  recipientEndpoint: string;
  messagePayload: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export function ActionCard({ type, title, recipientName, recipientEndpoint, messagePayload, priority }: ActionCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getPriorityColor = () => {
    switch (priority) {
      case 'critical':
        return THEME.colors.danger;
      case 'high':
        return THEME.colors.warning;
      case 'medium':
      case 'low':
      default:
        return THEME.colors.accent;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'patient_quarantine':
        return <AlertCircle size={20} color={getPriorityColor()} />;
      case 'supplier_alert':
        return <Mail size={20} color={getPriorityColor()} />;
      case 'regulatory_report':
        return <ShieldAlert size={20} color={getPriorityColor()} />;
      case 'broadcast_warning':
        return <Phone size={20} color={getPriorityColor()} />;
      case 'manufacturer_audit':
      default:
        return <Globe size={20} color={getPriorityColor()} />;
    }
  };

  const priorityColor = getPriorityColor();

  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setExpanded(!expanded)}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${priorityColor}15` }]}>
            {getIcon()}
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <Text style={styles.subtitle}>{recipientName}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.priorityBadge, { borderColor: priorityColor }]}>
            <Text style={[styles.priorityText, { color: priorityColor }]}>
              {priority.toUpperCase()}
            </Text>
          </View>
          {expanded ? (
            <ChevronDown size={20} color={THEME.colors.textSecondary} />
          ) : (
            <ChevronRight size={20} color={THEME.colors.textSecondary} />
          )}
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ENDPOINT:</Text>
            <Text style={styles.detailValue}>{recipientEndpoint}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>PAYLOAD ALERT:</Text>
          </View>
          <View style={styles.payloadBox}>
            <Text style={styles.payloadText}>{messagePayload}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.glassBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.sm,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: THEME.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    marginLeft: THEME.spacing.md,
    flex: 1,
    paddingRight: THEME.spacing.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: THEME.spacing.sm,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  expandedContent: {
    paddingHorizontal: THEME.spacing.md,
    paddingBottom: THEME.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginBottom: THEME.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.textDark,
  },
  detailValue: {
    fontSize: 11,
    color: THEME.colors.accent,
    fontWeight: '500',
  },
  payloadBox: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
    padding: THEME.spacing.sm,
    marginTop: 4,
  },
  payloadText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
});
