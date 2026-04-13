import { PLAYBACK_TRACKS, PlaybackTrack } from '@/assets/playbacks';
import React, { createContext, useContext, useMemo, useState } from 'react';

export interface Sound extends PlaybackTrack {}

interface SoundsContextType {
  sounds: Sound[];
}

const SoundsContext = createContext<SoundsContextType | undefined>(undefined);

export function SoundsProvider({ children }: { children: React.ReactNode }) {
  const [sounds] = useState<Sound[]>(PLAYBACK_TRACKS);

  const value = useMemo(() => ({ sounds }), [sounds]);

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
