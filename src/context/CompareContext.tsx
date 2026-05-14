'use client';

import { createContext, useContext, useState } from 'react';
import { Product } from '@/types';

interface CompareContextType {
  items: Product[];
  add: (p: Product) => void;
  remove: (id: number) => void;
  clear: () => void;
  isIn: (id: number) => boolean;
}

const CompareContext = createContext<CompareContextType>({
  items: [], add: () => {}, remove: () => {}, clear: () => {}, isIn: () => false,
});

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  const add = (p: Product) => {
    setItems(prev => {
      if (prev.find(x => x.id === p.id)) return prev;
      if (prev.length >= 3) return prev;
      return [...prev, p];
    });
  };

  const remove = (id: number) => setItems(prev => prev.filter(x => x.id !== id));
  const clear = () => setItems([]);
  const isIn = (id: number) => items.some(x => x.id === id);

  return (
    <CompareContext.Provider value={{ items, add, remove, clear, isIn }}>
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => useContext(CompareContext);
