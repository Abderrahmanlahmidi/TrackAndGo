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
