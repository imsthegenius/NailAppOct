import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type ConnectionStatus = {
  internet: boolean;
  supabase: boolean;
  message: string;
  isUsingProxy?: boolean;
};

type Props = {
  status: ConnectionStatus;
  onRetry: () => void;
  onDismiss: () => void;
};

const severityStyles = {
  error: {
    container: {
      backgroundColor: 'rgba(255, 59, 48, 0.1)',
      borderColor: 'rgba(255, 59, 48, 0.35)',
    },
    icon: 'alert-circle-outline' as const,
    iconColor: '#FF3B30',
  },
  warning: {
    container: {
      backgroundColor: 'rgba(255, 204, 0, 0.12)',
      borderColor: 'rgba(255, 204, 0, 0.4)',
    },
    icon: 'warning-outline' as const,
    iconColor: '#FF9F0A',
  },
  info: {
    container: {
      backgroundColor: 'rgba(10, 132, 255, 0.12)',
      borderColor: 'rgba(10, 132, 255, 0.4)',
    },
    icon: 'information-circle-outline' as const,
    iconColor: '#0A84FF',
  },
};

export function ConnectionStatusBanner({ status, onRetry, onDismiss }: Props) {
  const severity: keyof typeof severityStyles = !status.internet
    ? 'error'
    : !status.supabase
      ? 'warning'
      : 'info';

  const severityStyle = severityStyles[severity];

  return (
    <View style={[styles.container, severityStyle.container]}>
      <View style={styles.leading}>
        <Ionicons
          name={severityStyle.icon}
          size={20}
          color={severityStyle.iconColor}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>
          {!status.internet
            ? 'No internet connection'
            : !status.supabase
              ? 'Service disruption detected'
              : 'Connected via proxy'}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {status.message}
        </Text>
        {status.isUsingProxy && severity !== 'info' ? (
          <Text style={styles.subtle}>
            Cloudflare proxy fallback active. Contact support if this persists.
          </Text>
        ) : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={onRetry}
          style={[styles.iconButton, styles.primaryAction]}
        >
          <Ionicons name="refresh" size={18} color="#0A84FF" />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={onDismiss}
          style={[styles.iconButton, styles.dismissAction]}
        >
          <Ionicons name="close" size={18} color="rgba(0,0,0,0.6)" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginTop: 12,
    gap: 12,
  },
  leading: {
    width: 24,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  message: {
    fontSize: 13,
    color: '#333',
  },
  subtle: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.55)',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    padding: 6,
    borderRadius: 12,
  },
  primaryAction: {
    backgroundColor: 'rgba(10, 132, 255, 0.12)',
  },
  dismissAction: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});

export default ConnectionStatusBanner;
