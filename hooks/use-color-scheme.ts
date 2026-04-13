import { useContext } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import { ThemeModeContext } from '@/contexts/theme-mode-context';

export function useColorScheme() {
	const systemScheme = useSystemColorScheme();
	const themeContext = useContext(ThemeModeContext);
	return themeContext?.colorScheme ?? systemScheme;
}
