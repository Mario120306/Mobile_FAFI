import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface Partition {
  id: string;
  title: string;
  lyrics: string;
  createdAt: number;
}

interface PartitionsContextType {
  partitions: Partition[];
  addPartition: (data: { title: string; lyrics: string }) => Partition;
  updatePartitionTitle: (id: string, title: string) => void;
  getPartitionById: (id: string) => Partition | undefined;
  removePartition: (id: string) => void;
}

const PartitionsContext = createContext<PartitionsContextType | undefined>(undefined);

const STORAGE_KEY = '@fafi_partitions';

export function PartitionsProvider({ children }: { children: React.ReactNode }) {
  const [partitions, setPartitions] = useState<Partition[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw) as unknown;

          if (Array.isArray(data)) {
            const sanitized: Partition[] = data
              .map((item) => {
                const record = item as Partial<Partition> & { [k: string]: unknown };
                const createdAt = typeof record.createdAt === 'number' ? record.createdAt : Date.now();
                const title = typeof record.title === 'string' ? record.title.trim() : '';

                return {
                  id: typeof record.id === 'string' ? record.id : String(createdAt),
                  title: title || `Partition ${new Date(createdAt).toLocaleString()}`,
                  lyrics: typeof record.lyrics === 'string' ? record.lyrics : '',
                  createdAt,
                };
              })
              .sort((a, b) => b.createdAt - a.createdAt);

            setPartitions(sanitized);
          } else {
            setPartitions([]);
          }
        }
      } catch {
        setPartitions([]);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(partitions));
      } catch {
        // ignore
      }
    })();
  }, [hydrated, partitions]);

  const addPartition = useCallback((data: { title: string; lyrics: string }) => {
    const newItem: Partition = {
      id: String(Date.now()),
      title: data.title.trim() || `Partition ${new Date().toLocaleString()}`,
      lyrics: data.lyrics,
      createdAt: Date.now(),
    };
    setPartitions((prev) => [newItem, ...prev]);
    return newItem;
  }, []);

  const updatePartitionTitle = useCallback((id: string, title: string) => {
    const nextTitle = title.trim();
    if (!nextTitle) return;

    setPartitions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title: nextTitle } : p))
    );
  }, []);

  const getPartitionById = useCallback(
    (id: string) => partitions.find((p) => p.id === id),
    [partitions]
  );

  const removePartition = useCallback((id: string) => {
    setPartitions((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const value = useMemo(
    () => ({ partitions, addPartition, updatePartitionTitle, getPartitionById, removePartition }),
    [partitions, addPartition, updatePartitionTitle, getPartitionById, removePartition]
  );

  return (
    <PartitionsContext.Provider value={value}>
      {children}
    </PartitionsContext.Provider>
  );
}

export function usePartitions() {
  const context = useContext(PartitionsContext);
  if (!context) throw new Error('usePartitions must be used within PartitionsProvider');
  return context;
}
