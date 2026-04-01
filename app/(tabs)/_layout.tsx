import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useLoading } from '@/contexts/loading-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isLoading } = useLoading();
  const insets = useSafeAreaInsets();
  const extraBottomPadding = 8;
  const tabBarBaseHeight = 56;
  const theme = colorScheme ?? 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[theme].tint,
        tabBarInactiveTintColor: Colors[theme].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          display: isLoading ? 'none' : 'flex',
          backgroundColor: Colors[theme].bg2,
          borderTopColor: Colors[theme].border,
          borderTopWidth: 1,
          height: tabBarBaseHeight + insets.bottom + extraBottomPadding,
          paddingBottom: insets.bottom + extraBottomPadding,
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Partition',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="music.note" color={color} />,
        }}
      />
      <Tabs.Screen
        name="playbacks"
        options={{
          title: 'Playbacks',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="speaker.wave.2.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
