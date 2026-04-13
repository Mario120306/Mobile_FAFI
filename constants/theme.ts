/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const BRAND = {
  accent: '#c8f135',
  accent2: '#3b82f6',
  accent3: '#f59e0b',
} as const;

const DARK = {
  background: '#0e0e0e',
  bg2: '#141414',
  bg3: '#1a1a1a',
  text: '#f0ede6',
  muted: '#6b6b6b',
  border: 'rgba(255,255,255,0.07)',
  surface: 'rgba(255,255,255,0.03)',
  surface2: 'rgba(255,255,255,0.04)',
  surfaceBorder: 'rgba(255,255,255,0.07)',
  onTint: '#0e0e0e',
} as const;

const LIGHT = {
  background: '#ffffff',
  bg2: '#f3f4f6',
  bg3: '#e5e7eb',
  text: '#0f172a',
  muted: '#475569',
  border: 'rgba(15,23,42,0.12)',
  surface: 'rgba(15,23,42,0.03)',
  surface2: 'rgba(15,23,42,0.05)',
  surfaceBorder: 'rgba(15,23,42,0.10)',
  onTint: '#0e0e0e',
} as const;

export const Colors = {
  light: {
    text: LIGHT.text,
    background: LIGHT.background,
    tint: BRAND.accent,
    icon: LIGHT.muted,
    tabIconDefault: LIGHT.muted,
    tabIconSelected: BRAND.accent,
    bg2: LIGHT.bg2,
    bg3: LIGHT.bg3,
    muted: LIGHT.muted,
    border: LIGHT.border,
    accent2: BRAND.accent2,
    accent3: BRAND.accent3,
    surface: LIGHT.surface,
    surface2: LIGHT.surface2,
    surfaceBorder: LIGHT.surfaceBorder,
    onTint: LIGHT.onTint,
  },
  dark: {
    text: DARK.text,
    background: DARK.background,
    tint: BRAND.accent,
    icon: DARK.muted,
    tabIconDefault: DARK.muted,
    tabIconSelected: BRAND.accent,
    bg2: DARK.bg2,
    bg3: DARK.bg3,
    muted: DARK.muted,
    border: DARK.border,
    accent2: BRAND.accent2,
    accent3: BRAND.accent3,
    surface: DARK.surface,
    surface2: DARK.surface2,
    surfaceBorder: DARK.surfaceBorder,
    onTint: DARK.onTint,
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
