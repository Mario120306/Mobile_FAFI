import { useContext, useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { ThemeModeContext } from '@/contexts/theme-mode-context';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();
  const themeContext = useContext(ThemeModeContext);
  const resolved = themeContext?.colorScheme ?? colorScheme;

  if (hasHydrated) {
    return resolved;
  }

  return 'light';
}
