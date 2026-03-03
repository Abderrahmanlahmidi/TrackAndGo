// components/StatsHeader.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from './useColorScheme';

interface StatsHeaderProps {
  stats: {
    total: number;
    pending: number;
    inTransit: number;
    delivered: number;
    incident: number;
  };
}

const StatsHeader: React.FC<StatsHeaderProps> = ({ stats }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const deliveryRate = stats.total > 0
    ? Math.round((stats.delivered / stats.total) * 100)
    : 0;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
      {/* Progression */}
      <View style={styles.progressSection}>
        <Text style={[styles.progressTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
          Ma Tournée
        </Text>
        <Text style={[styles.progressSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          {stats.delivered}/{stats.total} colis livrés
        </Text>
        {/* Barre de progression */}
        <View style={[styles.progressBar, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${deliveryRate}%`,
                backgroundColor: deliveryRate === 100 ? '#10B981' : '#3B82F6',
              },
            ]}
          />
        </View>
        <Text style={[styles.progressPercent, { color: isDark ? '#60A5FA' : '#2563EB' }]}>
          {deliveryRate}%
        </Text>
      </View>

      {/* Mini stats */}
      <View style={styles.statsRow}>
        <StatItem
          icon="clock-o"
          label="En attente"
          value={stats.pending}
          color="#F59E0B"
          isDark={isDark}
        />
        <StatItem
          icon="truck"
          label="En transit"
          value={stats.inTransit}
          color="#3B82F6"
          isDark={isDark}
        />
        <StatItem
          icon="check-circle"
          label="Livrés"
          value={stats.delivered}
          color="#10B981"
          isDark={isDark}
        />
        <StatItem
          icon="exclamation-triangle"
          label="Incidents"
          value={stats.incident}
          color="#EF4444"
          isDark={isDark}
        />
      </View>
    </View>
  );
};

interface StatItemProps {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  value: number;
  color: string;
  isDark: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, color, isDark }) => (
  <View style={styles.statItem}>
    <FontAwesome name={icon} size={16} color={color} />
    <Text style={[styles.statValue, { color: isDark ? '#F9FAFB' : '#111827' }]}>
      {value}
    </Text>
    <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});

export default React.memo(StatsHeader);
