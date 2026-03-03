// components/StatusBadge.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ColisStatus } from '@/types/colis';

interface StatusBadgeProps {
  status: ColisStatus;
}

const STATUS_CONFIG: Record<ColisStatus, { label: string; color: string; bgColor: string }> = {
  pending: {
    label: 'En attente',
    color: '#92400E',
    bgColor: '#FEF3C7',
  },
  in_transit: {
    label: 'En transit',
    color: '#1E40AF',
    bgColor: '#DBEAFE',
  },
  delivered: {
    label: 'Livré',
    color: '#065F46',
    bgColor: '#D1FAE5',
  },
  incident: {
    label: 'Incident',
    color: '#991B1B',
    bgColor: '#FEE2E2',
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.bgColor }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default React.memo(StatusBadge);
