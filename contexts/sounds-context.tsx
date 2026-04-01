import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface Sound {
  id: string;
  filename: string;
  uri: string;
  createdAt: number;
}

interface SoundsContextType {
  sounds: Sound[];
  addSound: (sound: { filename: string; uri: string }) => void;
  removeSound: (id: string) => void;
}

const SoundsContext = createContext<SoundsContextType | undefined>(undefined);

export function SoundsProvider({ children }: { children: React.ReactNode }) {
  const [sounds, setSounds] = useState<Sound[]>([]);

  const addSound = useCallback((sound: { filename: string; uri: string }) => {
    const newSound: Sound = {
      id: String(Date.now()),
      filename: sound.filename,
      uri: sound.uri,
      createdAt: Date.now(),
    };
    setSounds((prev) => [...prev, newSound]);
  }, []);

  const removeSound = useCallback((id: string) => {
    setSounds((prev) => prev.filter((sound) => sound.id !== id));
  }, []);

  const value = useMemo(() => ({ sounds, addSound, removeSound }), [sounds, addSound, removeSound]);

  return (
    <SoundsContext.Provider value={value}>
      {children}
    </SoundsContext.Provider>
  );
}

export function useSounds() {
  const context = useContext(SoundsContext);
  if (!context) {
    throw new Error('useSounds must be used within SoundsProvider');
  }
  return context;
}
