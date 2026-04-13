import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FaFiEmoji } from '@/components/ui/fafi-emoji';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useSounds } from '@/contexts/sounds-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { memo, useCallback, useRef } from 'react';
import {
    Animated,
    FlatList,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';

// ─── Animated Card ────────────────────────────────────────────────────────────
function SoundCard({
  item,
  tintColor,
  surface,
  surfaceBorder,
  onPlay,
}: {
  item: { id: string; filename: string };
  tintColor: string;
  surface: string;
  surfaceBorder: string;
  onPlay: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  const name = item.filename.replace(/\.[^/.]+$/, '');
  const ext = item.filename.split('.').pop()?.toUpperCase() ?? '';

  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 10 }}>
      <Pressable
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={onPlay}
        style={[styles.card, { backgroundColor: surface, borderColor: surfaceBorder }]}
      >
        {/* Play button */}
        <View style={[styles.playCircle, { backgroundColor: tintColor }]}>
          <IconSymbol name="play.fill" size={16} color="#fff" />
        </View>

        {/* Track info */}
        <View style={styles.cardBody}>
          <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.trackName}>
            {name}
          </ThemedText>
          <View style={styles.metaRow}>
            <View style={[styles.extBadge, { borderColor: tintColor, backgroundColor: `${tintColor}18` }]}>
              <ThemedText style={[styles.extText, { color: tintColor }]}>{ext}</ThemedText>
            </View>
          </View>
        </View>

        {/* Mini waveform */}
        <MiniWave tintColor={tintColor} />

      </Pressable>
    </Animated.View>
  );
}

const MemoSoundCard = memo(SoundCard);

function MiniWave({ tintColor }: { tintColor: string }) {
  const bars = [5, 13, 8, 17, 10, 15, 7, 12, 5, 11];
  return (
    <View style={styles.waveRow}>
      {bars.map((h, i) => (
        <View
          key={i}
          style={[styles.waveBar, { height: h, backgroundColor: tintColor, opacity: 0.2 + (i % 3) * 0.15 }]}
        />
      ))}
    </View>
  );
}

function EmptyState({ tintColor }: { tintColor: string }) {
  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconWrap, { borderColor: `${tintColor}40` }]}>
        <IconSymbol name="music.note" size={40} color={tintColor} />
      </View>
      <ThemedText style={styles.emptyTitle}>Aucun playback disponible</ThemedText>
      <ThemedText style={styles.emptyHint}>Ajoutez des fichiers mp3 dans assets/playbacks et mettez à jour assets/playbacks/index.ts</ThemedText>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PlaybacksScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { sounds } = useSounds();
  const theme = colorScheme ?? 'light';
  const tintColor = Colors[theme].tint;
  const surface = Colors[theme].surface;
  const surfaceBorder = Colors[theme].surfaceBorder;

  const renderItem = useCallback(
    ({ item }: { item: { id: string; filename: string } }) => (
      <MemoSoundCard
        item={item}
        tintColor={tintColor}
        surface={surface}
        surfaceBorder={surfaceBorder}
        onPlay={() => router.push({ pathname: '/player', params: { id: item.id } })}
      />
    ),
    [router, surface, surfaceBorder, tintColor]
  );

  return (
    <ThemedView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText style={styles.eyebrow}>BIBLIOTHÈQUE</ThemedText>
          <View style={styles.titleRow}>
            <ThemedText type="title" style={styles.title}>Playbacks</ThemedText>
            <FaFiEmoji name="headphones" size={22} style={styles.titleEmoji} />
          </View>
        </View>
        <View style={[styles.countBadge, { borderColor: `${tintColor}50`, backgroundColor: `${tintColor}15` }]}>
          <ThemedText style={[styles.countText, { color: tintColor }]}>{sounds.length}</ThemedText>
        </View>
      </View>

      {/* ── Thin accent line ── */}
      <View style={[styles.accentLine, { backgroundColor: tintColor }]} />

      {/* ── Content ── */}
      {sounds.length === 0 ? (
        <EmptyState tintColor={tintColor} />
      ) : (
        <FlatList
          data={sounds}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 16,
  },
  headerLeft: { gap: 2 },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    opacity: 0.45,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.3 },
  titleEmoji: { marginTop: 2 },
  countBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  countText: { fontSize: 17, fontWeight: '800' },

  // Accent line
  accentLine: {
    height: 2,
    marginHorizontal: 24,
    borderRadius: 2,
    opacity: 0.6,
    marginBottom: 8,
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    gap: 12,
  },
  playCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: { flex: 1 },
  trackName: { fontSize: 15, marginBottom: 5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  extBadge: {
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  extText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  dateText: { fontSize: 11, opacity: 0.5 },

  // Waveform
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 20,
  },
  waveBar: { width: 2.5, borderRadius: 2 },

  // Delete
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,59,48,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 80,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700' },
  emptyHint: { opacity: 0.5, fontSize: 13, textAlign: 'center', paddingHorizontal: 40 },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
  },
});