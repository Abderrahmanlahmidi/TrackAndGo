# 📦 TC-5 : Liste des Colis Assignés au Livreur

## Task : *"As a driver, I want to see a list of all my assigned packages (Colis) for the day with their addresses to plan my route."*

---

## 📋 Analyse de l'état actuel du projet

Le projet est actuellement dans son état **initial** (template Expo par défaut) :
- ✅ Expo Router configuré avec navigation par Tabs
- ✅ Serveur JSON-Server prêt via Docker (port 3000)
- ✅ TypeScript configuré en mode strict
- ✅ Thème Dark/Light mode déjà supporté via `Themed.tsx`
- ❌ Aucun dossier `services/`, `hooks/`, `types/` n'existe encore
- ❌ Les écrans sont encore les écrans par défaut (Tab One, Tab Two)
- ❌ Aucune donnée n'est consommée depuis l'API

### Structure des données `colis` dans `db.json` :
```json
{
  "id": "1",
  "driverId": "2",
  "barcode": "611469439956",
  "clientName": "Siham Idrissi",
  "phoneNumber": "0780181803",
  "address": "Boulevard Abdelmoumen, Casablanca, Morocco",
  "status": "pending",
  "location": { "lat": 33.5731362, "lng": -7.6259592 },
  "validation": null,
  "incident": null,
  "createdAt": "2026-02-23T12:07:14.597Z"
}
```

**Statuts possibles** : `pending` | `in_transit` | `delivered` | `incident`

---

## 🗺️ Plan des étapes

| # | Étape | Fichiers à créer/modifier |
|---|-------|---------------------------|
| 1 | Créer les types TypeScript | `types/colis.ts` |
| 2 | Configurer le service API | `services/api.ts` |
| 3 | Créer le hook personnalisé | `hooks/useColis.ts` |
| 4 | Créer le composant PackageCard | `components/PackageCard.tsx` |
| 5 | Créer le composant StatusBadge | `components/StatusBadge.tsx` |
| 6 | Créer l'écran "Ma Tournée" | `app/(tabs)/index.tsx` |
| 7 | Mettre à jour la navigation | `app/(tabs)/_layout.tsx` |
| 8 | Configurer les constantes | `constants/Config.ts` |

---

## 🚀 Étape 1 : Créer les types TypeScript

> **Fichier à créer** : `client/types/colis.ts`

Ce fichier définit le typage strict de toutes les données liées aux colis.

```typescript
// types/colis.ts

export type ColisStatus = 'pending' | 'in_transit' | 'delivered' | 'incident';

export interface ColisLocation {
  lat: number;
  lng: number;
}

export interface ColisValidation {
  timestamp: string;
  gpsLocation: ColisLocation;
  photoUri?: string;
}

export interface ColisIncident {
  type: 'absent' | 'damaged' | 'other';
  comment: string;
  photoUri?: string;
  timestamp: string;
}

export interface Colis {
  id: string;
  driverId: string;
  barcode: string;
  clientName: string;
  phoneNumber: string;
  address: string;
  status: ColisStatus;
  location: ColisLocation;
  validation: ColisValidation | null;
  incident: ColisIncident | null;
  createdAt: string;
}
```

---

## 🚀 Étape 2 : Configurer les constantes

> **Fichier à créer** : `client/constants/Config.ts`

```typescript
// constants/Config.ts

import { Platform } from 'react-native';

// Sur Android Emulator, localhost = 10.0.2.2
// Sur un appareil réel, utiliser l'IP locale de votre machine
const getBaseUrl = (): string => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  // iOS simulator ou web
  return 'http://localhost:3000';
};

export const API_BASE_URL = getBaseUrl();

// ID du driver connecté (temporaire - sera remplacé par l'auth plus tard)
// Utiliser n'importe quel driverId existant dans db.json (1 à 50)
export const CURRENT_DRIVER_ID = '1';

// Hauteur fixe de la carte colis pour getItemLayout (optimisation FlatList)
export const PACKAGE_CARD_HEIGHT = 130;
```

---

## 🚀 Étape 3 : Créer le service API

> **Fichier à créer** : `client/services/api.ts`

Ce fichier centralise tous les appels API. On utilise `fetch` natif.

```typescript
// services/api.ts

import { API_BASE_URL } from '@/constants/Config';
import { Colis } from '@/types/colis';

/**
 * Récupère tous les colis assignés à un livreur spécifique.
 * Utilise le filtrage de JSON-Server : ?driverId=X
 */
export const fetchColisByDriver = async (driverId: string): Promise<Colis[]> => {
  const url = `${API_BASE_URL}/colis?driverId=${driverId}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
  }

  const data: Colis[] = await response.json();
  return data;
};

/**
 * Récupère un colis spécifique par son ID.
 */
export const fetchColisById = async (colisId: string): Promise<Colis> => {
  const url = `${API_BASE_URL}/colis/${colisId}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
  }

  const data: Colis = await response.json();
  return data;
};
```

---

## 🚀 Étape 4 : Créer le hook personnalisé `useColis`

> **Fichier à créer** : `client/hooks/useColis.ts`

Ce hook gère le state, le loading, les erreurs, et le rafraîchissement (Pull-to-refresh).

```typescript
// hooks/useColis.ts

import { useState, useEffect, useCallback } from 'react';
import { Colis, ColisStatus } from '@/types/colis';
import { fetchColisByDriver } from '@/services/api';
import { CURRENT_DRIVER_ID } from '@/constants/Config';

interface UseColisReturn {
  colis: Colis[];
  filteredColis: Colis[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  selectedFilter: ColisStatus | 'all';
  setSelectedFilter: (filter: ColisStatus | 'all') => void;
  onRefresh: () => void;
  stats: {
    total: number;
    pending: number;
    inTransit: number;
    delivered: number;
    incident: number;
  };
}

export const useColis = (): UseColisReturn => {
  const [colis, setColis] = useState<Colis[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<ColisStatus | 'all'>('all');

  // Fonction de chargement des données
  const loadColis = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await fetchColisByDriver(CURRENT_DRIVER_ID);
      setColis(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Chargement initial
  useEffect(() => {
    loadColis();
  }, [loadColis]);

  // Pull-to-refresh
  const onRefresh = useCallback(() => {
    loadColis(true);
  }, [loadColis]);

  // Filtrage en temps réel
  const filteredColis = selectedFilter === 'all'
    ? colis
    : colis.filter((item) => item.status === selectedFilter);

  // Statistiques
  const stats = {
    total: colis.length,
    pending: colis.filter((c) => c.status === 'pending').length,
    inTransit: colis.filter((c) => c.status === 'in_transit').length,
    delivered: colis.filter((c) => c.status === 'delivered').length,
    incident: colis.filter((c) => c.status === 'incident').length,
  };

  return {
    colis,
    filteredColis,
    loading,
    refreshing,
    error,
    selectedFilter,
    setSelectedFilter,
    onRefresh,
    stats,
  };
};
```

---

## 🚀 Étape 5 : Créer le composant `StatusBadge`

> **Fichier à créer** : `client/components/StatusBadge.tsx`

Badge coloré qui affiche le statut du colis.

```tsx
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
```

---

## 🚀 Étape 6 : Créer le composant `PackageCard`

> **Fichier à créer** : `client/components/PackageCard.tsx`

Carte qui affiche les informations d'un colis dans la FlatList.

```tsx
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
```

---

## 🚀 Étape 7 : Créer le composant `FilterBar`

> **Fichier à créer** : `client/components/FilterBar.tsx`

Barre de filtres horizontale pour filtrer les colis par statut.

```tsx
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
```

---

## 🚀 Étape 8 : Créer le composant `StatsHeader`

> **Fichier à créer** : `client/components/StatsHeader.tsx`

En-tête avec le résumé statistique de la tournée.

```tsx
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
```

---

## 🚀 Étape 9 : Créer l'écran "Ma Tournée" (l'écran principal)

> **Fichier à modifier** : `client/app/(tabs)/index.tsx`

C'est l'écran principal — remplacer **tout le contenu** par :

```tsx
// app/(tabs)/index.tsx

import React, { useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  View,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import { useColis } from '@/hooks/useColis';
import { Colis } from '@/types/colis';
import PackageCard from '@/components/PackageCard';
import FilterBar from '@/components/FilterBar';
import StatsHeader from '@/components/StatsHeader';
import { PACKAGE_CARD_HEIGHT } from '@/constants/Config';

export default function MaTourneeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const {
    filteredColis,
    loading,
    refreshing,
    error,
    selectedFilter,
    setSelectedFilter,
    onRefresh,
    stats,
  } = useColis();

  // Callback mémorisé pour éviter les re-renders
  const handlePressPackage = useCallback((colis: Colis) => {
    // TODO: Navigation vers l'écran détail du colis
    console.log('Colis sélectionné:', colis.id);
  }, []);

  // Optimisation FlatList : hauteur fixe des items
  const getItemLayout = useCallback(
    (_data: ArrayLike<Colis> | null | undefined, index: number) => ({
      length: PACKAGE_CARD_HEIGHT,
      offset: PACKAGE_CARD_HEIGHT * index,
      index,
    }),
    []
  );

  // Extracteur de clé mémorisé
  const keyExtractor = useCallback((item: Colis) => item.id, []);

  // Rendu de chaque item
  const renderItem = useCallback(
    ({ item }: { item: Colis }) => (
      <PackageCard colis={item} onPress={handlePressPackage} />
    ),
    [handlePressPackage]
  );

  // Écran de chargement
  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: isDark ? '#000' : '#F9FAFB' }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={[styles.loadingText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          Chargement de votre tournée...
        </Text>
      </View>
    );
  }

  // Écran d'erreur
  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: isDark ? '#000' : '#F9FAFB' }]}>
        <FontAwesome name="exclamation-circle" size={48} color="#EF4444" />
        <Text style={[styles.errorTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
          Erreur de connexion
        </Text>
        <Text style={[styles.errorMessage, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          {error}
        </Text>
        <Text
          style={styles.retryText}
          onPress={onRefresh}
        >
          ↻ Réessayer
        </Text>
      </View>
    );
  }

  // Header de la FlatList (Stats + Filtres)
  const ListHeader = (
    <>
      <StatsHeader stats={stats} />
      <FilterBar
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        stats={stats}
      />
    </>
  );

  // Message si la liste est vide (après filtrage)
  const ListEmpty = (
    <View style={styles.emptyContainer}>
      <FontAwesome
        name="inbox"
        size={48}
        color={isDark ? '#4B5563' : '#9CA3AF'}
      />
      <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
        Aucun colis trouvé pour ce filtre
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: isDark ? '#000' : '#F9FAFB' }]}
      edges={['bottom']}
    >
      <FlatList<Colis>
        data={filteredColis}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        // Pull-to-refresh
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
        // Optimisations de performance
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={10}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
  },
  retryText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
    marginTop: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
  },
});
```

---

## 🚀 Étape 10 : Mettre à jour la navigation Tabs

> **Fichier à modifier** : `client/app/(tabs)/_layout.tsx`

Remplacer **tout le contenu** par :

```tsx
// app/(tabs)/_layout.tsx

import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ma Tournée',
          tabBarIcon: ({ color }) => <TabBarIcon name="list-ul" color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Carte',
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
        }}
      />
    </Tabs>
  );
}
```

---

## 🧪 Étape 11 : Lancer et tester

### 1. Lancer le serveur Docker (backend)

```bash
cd server
docker-compose up -d
```

Vérifier que le serveur fonctionne :
```bash
curl http://localhost:3000/colis?driverId=1
```

### 2. Lancer l'application Expo (frontend)

```bash
cd client
npx expo start
```

### 3. Tester sur un appareil / émulateur

- Appuyer sur `a` pour Android ou `i` pour iOS
- Ou scanner le QR code avec **Expo Go**

> ⚠️ **Important** : Si tu utilises Expo Go sur un appareil réel, modifier `Config.ts` et remplacer l'URL par l'adresse IP de ta machine locale :
> ```typescript
> export const API_BASE_URL = 'http://192.168.X.X:3000';
> ```

---

## 📁 Structure finale des fichiers

Après avoir complété toutes les étapes, la structure du projet sera :

```
client/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx        ← Modifié (tabs renommés)
│   │   ├── index.tsx          ← Modifié (écran Ma Tournée)
│   │   └── two.tsx            ← Inchangé (futur écran Carte)
│   ├── _layout.tsx            ← Inchangé
│   ├── modal.tsx              ← Inchangé
│   ├── +html.tsx              ← Inchangé
│   └── +not-found.tsx         ← Inchangé
├── components/
│   ├── FilterBar.tsx          ← Nouveau
│   ├── PackageCard.tsx        ← Nouveau
│   ├── StatsHeader.tsx        ← Nouveau
│   ├── StatusBadge.tsx        ← Nouveau
│   ├── Themed.tsx             ← Inchangé
│   └── ...
├── constants/
│   ├── Colors.ts              ← Inchangé
│   └── Config.ts              ← Nouveau
├── hooks/
│   └── useColis.ts            ← Nouveau
├── services/
│   └── api.ts                 ← Nouveau
├── types/
│   └── colis.ts               ← Nouveau
└── package.json
```

---

## ✅ Checklist de validation

- [ ] Les types TypeScript sont définis dans `types/colis.ts`
- [ ] Le service API est centralisé dans `services/api.ts`
- [ ] Le hook `useColis` gère le state, loading, erreur et filtrage
- [ ] Le composant `PackageCard` affiche les infos du colis (nom, adresse, barcode, téléphone, statut)
- [ ] Le composant `StatusBadge` affiche un badge coloré selon le statut
- [ ] Le composant `FilterBar` permet de filtrer par statut
- [ ] Le composant `StatsHeader` affiche les statistiques de la tournée
- [ ] L'écran `Ma Tournée` utilise une `FlatList` optimisée
- [ ] Le **Pull-to-refresh** fonctionne
- [ ] Le mode **Dark/Light** est supporté
- [ ] Les états **Loading** et **Error** sont gérés correctement
- [ ] La FlatList est optimisée (`React.memo`, `getItemLayout`, `removeClippedSubviews`, etc.)
- [ ] L'architecture respecte le SRP (Single Responsibility Principle)
- [ ] Pas de code dupliqué (DRY)

---

## 🎯 Points techniques importants pour la review

### Optimisations FlatList :
- **`React.memo`** sur `PackageCard`, `StatusBadge`, `FilterBar`, `StatsHeader` → évite les re-renders
- **`getItemLayout`** → permet le scroll instantané sans mesure dynamique
- **`useCallback`** sur `renderItem`, `keyExtractor`, `handlePressPackage` → stabilise les références
- **`removeClippedSubviews`** → libère la mémoire des items hors écran
- **`maxToRenderPerBatch`** + **`windowSize`** → contrôle le nombre d'items rendus

### Architecture :
- **`types/`** → Typage strict TypeScript (SRP)
- **`services/`** → Appels API centralisés (SRP)
- **`hooks/`** → Logique métier séparée de l'UI (SRP)
- **`components/`** → Composants réutilisables (DRY)
- **`constants/`** → Configuration centralisée

### Gestion des erreurs :
- Try/catch dans le hook `useColis`
- Écran d'erreur avec bouton "Réessayer"
- Vérification de `response.ok` dans les services API
