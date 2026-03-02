// components/PackageCard.tsx

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colis } from '@/types/colis';
import StatusBadge from './StatusBadge';
import { useColorScheme } from './useColorScheme';
import Colors from '@/constants/Colors';

interface PackageCardProps {
  colis: Colis;
  onPress?: (colis: Colis) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ colis, onPress }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          borderColor: isDark ? '#2C2C2E' : '#E5E7EB',
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
      onPress={() => onPress?.(colis)}
    >
      {/* En-tête : Barcode + Status */}
      <View style={styles.header}>
        <View style={styles.barcodeContainer}>
          <FontAwesome
            name="barcode"
            size={14}
            color={isDark ? '#9CA3AF' : '#6B7280'}
          />
          <Text
            style={[styles.barcode, { color: isDark ? '#9CA3AF' : '#6B7280' }]}
            numberOfLines={1}
          >
            {colis.barcode}
          </Text>
        </View>
        <StatusBadge status={colis.status} />
      </View>

      {/* Nom du client */}
      <Text
        style={[styles.clientName, { color: isDark ? '#F9FAFB' : '#111827' }]}
        numberOfLines={1}
      >
        {colis.clientName}
      </Text>

      {/* Adresse */}
      <View style={styles.addressRow}>
        <FontAwesome
          name="map-marker"
          size={14}
          color={isDark ? '#60A5FA' : '#3B82F6'}
          style={styles.addressIcon}
        />
        <Text
          style={[styles.address, { color: isDark ? '#D1D5DB' : '#4B5563' }]}
          numberOfLines={2}
        >
          {colis.address}
        </Text>
      </View>

      {/* Téléphone */}
      <View style={styles.phoneRow}>
        <FontAwesome
          name="phone"
          size={12}
          color={isDark ? '#9CA3AF' : '#6B7280'}
          style={styles.phoneIcon}
        />
        <Text
          style={[styles.phone, { color: isDark ? '#9CA3AF' : '#6B7280' }]}
        >
          {colis.phoneNumber}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    // Ombre pour iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Ombre pour Android
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  barcodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  barcode: {
    fontSize: 12,
    fontFamily: 'SpaceMono',
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  addressIcon: {
    marginRight: 8,
    marginTop: 2,
    width: 14,
  },
  address: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneIcon: {
    marginRight: 8,
    width: 14,
  },
  phone: {
    fontSize: 12,
  },
});

// React.memo pour éviter les re-renders inutiles dans la FlatList
export default React.memo(PackageCard);
