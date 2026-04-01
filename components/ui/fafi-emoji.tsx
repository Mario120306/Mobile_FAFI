import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { memo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

export type FaFiEmojiName = 'music' | 'headphones' | 'wave';

export const FaFiEmoji = memo(function FaFiEmoji({
  name,
  size = 22,
  style,
}: {
  name: FaFiEmojiName;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const tintColor = Colors[theme].tint;

  const box = {
    width: size,
    height: size,
    borderRadius: Math.round(size * 0.35),
  };

  if (name === 'wave') {
    return (
      <View
        accessibilityRole="image"
        accessibilityLabel="Wave"
        style={[styles.box, box, { borderColor: `${tintColor}55`, backgroundColor: `${tintColor}14` }, style]}
      >
        <View style={styles.waveRow}>
          <View style={[styles.waveBar, { height: Math.round(size * 0.22), backgroundColor: tintColor }]} />
          <View style={[styles.waveBar, { height: Math.round(size * 0.42), backgroundColor: tintColor, opacity: 0.9 }]} />
          <View style={[styles.waveBar, { height: Math.round(size * 0.28), backgroundColor: tintColor, opacity: 0.75 }]} />
        </View>
      </View>
    );
  }

  const iconName = name === 'music' ? 'music.note' : 'headphones';

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={name}
      style={[styles.box, box, { borderColor: `${tintColor}55`, backgroundColor: `${tintColor}14` }, style]}
    >
      <IconSymbol name={iconName} size={Math.round(size * 0.55)} color={tintColor} />
    </View>
  );
});

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  waveBar: {
    width: 2,
    borderRadius: 2,
  },
});
