// components/FilterBar.tsx

import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { ColisStatus } from '@/types/colis';
import { useColorScheme } from './useColorScheme';

type FilterOption = ColisStatus | 'all';

interface FilterBarProps {
  selectedFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  stats: {
    total: number;
    pending: number;
    inTransit: number;
    delivered: number;
    incident: number;
  };
}

const FILTERS: { key: FilterOption; label: string; statKey: keyof FilterBarProps['stats'] }[] = [
  { key: 'all', label: 'Tous', statKey: 'total' },
  { key: 'pending', label: 'En attente', statKey: 'pending' },
  { key: 'in_transit', label: 'En transit', statKey: 'inTransit' },
  { key: 'delivered', label: 'Livrés', statKey: 'delivered' },
  { key: 'incident', label: 'Incidents', statKey: 'incident' },
];

const FilterBar: React.FC<FilterBarProps> = ({ selectedFilter, onFilterChange, stats }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map((filter) => {
        const isActive = selectedFilter === filter.key;
        const count = stats[filter.statKey];

        return (
          <Pressable
            key={filter.key}
            style={[
              styles.filterButton,
              {
                backgroundColor: isActive
                  ? (isDark ? '#3B82F6' : '#2563EB')
                  : (isDark ? '#1C1C1E' : '#F3F4F6'),
                borderColor: isActive
                  ? 'transparent'
                  : (isDark ? '#2C2C2E' : '#E5E7EB'),
              },
            ]}
            onPress={() => onFilterChange(filter.key)}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: isActive
                    ? '#FFFFFF'
                    : (isDark ? '#D1D5DB' : '#4B5563'),
                },
              ]}
            >
              {filter.label}
            </Text>
            <View
              style={[
                styles.countBadge,
                {
                  backgroundColor: isActive
                    ? 'rgba(255,255,255,0.2)'
                    : (isDark ? '#2C2C2E' : '#E5E7EB'),
                },
              ]}
            >
              <Text
                style={[
                  styles.countText,
                  {
                    color: isActive
                      ? '#FFFFFF'
                      : (isDark ? '#9CA3AF' : '#6B7280'),
                  },
                ]}
              >
                {count}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  countBadge: {
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export default React.memo(FilterBar);
