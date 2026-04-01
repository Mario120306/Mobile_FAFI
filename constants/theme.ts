/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Palette aligned with the design reference in app/(tabs)/index.tsx
const BRAND = {
  bg: '#0e0e0e',
  bg2: '#141414',
  bg3: '#1a1a1a',
  text: '#f0ede6',
  muted: '#6b6b6b',
  border: 'rgba(255,255,255,0.07)',
  accent: '#c8f135',
  accent2: '#3b82f6',
  accent3: '#f59e0b',
} as const;

export const Colors = {
  // Keep both modes but make them visually consistent with the reference design.
  light: {
    text: BRAND.text,
    background: BRAND.bg,
    tint: BRAND.accent,
    icon: BRAND.muted,
    tabIconDefault: BRAND.muted,
    tabIconSelected: BRAND.accent,
    bg2: BRAND.bg2,
    bg3: BRAND.bg3,
    muted: BRAND.muted,
    border: BRAND.border,
    accent2: BRAND.accent2,
    accent3: BRAND.accent3,
  },
  dark: {
    text: BRAND.text,
    background: BRAND.bg,
    tint: BRAND.accent,
    icon: BRAND.muted,
    tabIconDefault: BRAND.muted,
    tabIconSelected: BRAND.accent,
    bg2: BRAND.bg2,
    bg3: BRAND.bg3,
    muted: BRAND.muted,
    border: BRAND.border,
    accent2: BRAND.accent2,
    accent3: BRAND.accent3,
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
