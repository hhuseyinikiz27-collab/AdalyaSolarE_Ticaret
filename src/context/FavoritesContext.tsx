'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  favoriteIds: number[];
  isFavorite: (productId: number) => boolean;
  toggle: (productId: number) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favoriteIds: [],
  isFavorite: () => false,
  toggle: async () => {},
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    if (user) {
      api.favorites.getIds().then(setFavoriteIds).catch(() => {});
    } else {
      setFavoriteIds([]);
    }
  }, [user]);

  const isFavorite = useCallback((productId: number) => favoriteIds.includes(productId), [favoriteIds]);

  const toggle = useCallback(async (productId: number) => {
    if (!user) return;
    const result = await api.favorites.toggle(productId);
    setFavoriteIds((prev) =>
      result.isFavorite ? [...prev, productId] : prev.filter((id) => id !== productId)
    );
  }, [user]);

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
