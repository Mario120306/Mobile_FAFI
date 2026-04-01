import { FaFiEmoji } from '@/components/ui/fafi-emoji';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

export function HelloWave() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const swing = Animated.sequence([
      Animated.timing(progress, {
        toValue: 1,
        duration: 140,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(progress, {
        toValue: -1,
        duration: 220,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(progress, {
        toValue: 0,
        duration: 160,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(swing, { iterations: 4 }).start();
  }, [progress]);

  const rotate = progress.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-20deg', '0deg', '20deg'],
  });

  return (
    <Animated.View style={[styles.wrap, { transform: [{ rotate }] }]}>
      <FaFiEmoji name="wave" size={26} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: -6,
  },
});
