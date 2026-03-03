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
