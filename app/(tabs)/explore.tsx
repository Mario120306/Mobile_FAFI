import { ASSET_PARTITIONS } from '@/assets/partitions';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FaFiEmoji } from '@/components/ui/fafi-emoji';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { usePartitions } from '@/contexts/partitions-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    FlatList,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';

function PartitionCard({
  item,
  tintColor,
  surface,
  surfaceBorder,
  onPress,
  onDelete,
}: {
  item: { id: string; title: string; createdAt?: number; kind: 'scanned' | 'asset' };
  tintColor: string;
  surface: string;
  surfaceBorder: string;
  onPress: () => void;
  onDelete?: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  const subtitle = useMemo(() => {
    if (item.kind === 'asset') return 'STOCKÉE';
    if (!item.createdAt) return '';
    return new Date(item.createdAt).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, [item.createdAt, item.kind]);

  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 10 }}>
      <Pressable
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={onPress}
        style={[styles.card, { backgroundColor: surface, borderColor: surfaceBorder }]}
      >
        <View style={[styles.playCircle, { backgroundColor: tintColor }]}> 
          <IconSymbol name="music.note" size={16} color="#fff" />
        </View>
        <View style={styles.cardBody}>
          <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.trackName}>
            {item.title}
          </ThemedText>
          {!!subtitle && <ThemedText style={styles.dateText}>{subtitle}</ThemedText>}
        </View>
        {onDelete ? (
          <Pressable onPress={onDelete} hitSlop={10} style={styles.deleteBtn}>
            <IconSymbol name="trash" size={16} color="#ff3b30" />
          </Pressable>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const MemoPartitionCard = memo(PartitionCard);

function EmptyState({ tintColor, mode }: { tintColor: string; mode: 'scanned' | 'asset' }) {
  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconWrap, { borderColor: `${tintColor}40` }]}> 
        <IconSymbol name="music.note" size={40} color={tintColor} />
      </View>
      <ThemedText style={styles.emptyTitle}>Aucune partition</ThemedText>
      {mode === 'scanned' ? (
        <ThemedText style={styles.emptyHint}>Appuyez sur + pour scanner un QR code de paroles</ThemedText>
      ) : (
        <ThemedText style={styles.emptyHint}>Les partitions stockées dans l’application apparaissent ici</ThemedText>
      )}
    </View>
  );
}

export default function PartitionsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { partitions, removePartition } = usePartitions();
  const theme = colorScheme ?? 'light';
  const tintColor = Colors[theme].tint;
  const surface = Colors[theme].surface;
  const surfaceBorder = Colors[theme].surfaceBorder;
  const [menu, setMenu] = useState<'scanned' | 'asset'>('scanned');

  const scannedData = useMemo(
    () => partitions.map((p) => ({ ...p, kind: 'scanned' as const })),
    [partitions]
  );

  const assetData = useMemo(
    () => ASSET_PARTITIONS.map((p) => ({ id: p.id, title: p.title, kind: 'asset' as const })),
    []
  );

  const data = menu === 'scanned' ? scannedData : assetData;

  const handleDelete = useCallback((id: string, title: string) => {
    Alert.alert('Supprimer', `Supprimer "${title}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => removePartition(id) },
    ]);
  }, [removePartition]);

  const renderItem = useCallback(
    ({ item }: { item: { id: string; title: string; createdAt?: number; kind: 'scanned' | 'asset' } }) => (
      <MemoPartitionCard
        item={item}
        tintColor={tintColor}
        surface={surface}
        surfaceBorder={surfaceBorder}
        onPress={() =>
          router.push({
            pathname: '/partitions/[id]',
            params: { id: item.id, kind: item.kind },
          })
        }
        onDelete={
          item.kind === 'scanned' ? () => handleDelete(item.id, item.title) : undefined
        }
      />
    ),
    [handleDelete, router, surface, surfaceBorder, tintColor]
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText style={styles.eyebrow}>BIBLIOTHÈQUE</ThemedText>
          <View style={styles.titleRow}>
            <ThemedText type="title" style={styles.title}>Partitions</ThemedText>
            <FaFiEmoji name="music" size={22} style={styles.titleEmoji} />
          </View>
        </View>
        <View style={[styles.countBadge, { borderColor: `${tintColor}50`, backgroundColor: `${tintColor}15` }]}> 
          <ThemedText style={[styles.countText, { color: tintColor }]}>{data.length}</ThemedText>
        </View>
      </View>
      <View style={[styles.accentLine, { backgroundColor: tintColor }]} />

      {/* ── Menu selector ── */}
      <View style={styles.menuRow}>
        <Pressable
          onPress={() => setMenu('scanned')}
          style={[
            styles.menuPill,
            { borderColor: surfaceBorder, backgroundColor: menu === 'scanned' ? `${tintColor}18` : surface },
          ]}
        >
          <ThemedText style={[styles.menuText, { color: menu === 'scanned' ? tintColor : Colors[theme].text }]}>Scannées</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setMenu('asset')}
          style={[
            styles.menuPill,
            { borderColor: surfaceBorder, backgroundColor: menu === 'asset' ? `${tintColor}18` : surface },
          ]}
        >
          <ThemedText style={[styles.menuText, { color: menu === 'asset' ? tintColor : Colors[theme].text }]}>Stockées</ThemedText>
        </Pressable>
      </View>

      {data.length === 0 ? (
        <EmptyState tintColor={tintColor} mode={menu} />
      ) : (
        <FlatList
          data={data}
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

      {menu === 'scanned' ? (
        <Pressable
          style={[styles.fab, { backgroundColor: tintColor }]}
          onPress={() => router.push({ pathname: '/partitions/scan' } as any)}
        >
          <IconSymbol name="plus" size={28} color="#fff" />
        </Pressable>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 16,
  },
  headerLeft: { gap: 2 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 3, opacity: 0.45 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.3 },
  titleEmoji: { marginTop: 2 },
  countBadge: { width: 42, height: 42, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  countText: { fontSize: 17, fontWeight: '800' },
  accentLine: { height: 2, marginHorizontal: 24, borderRadius: 2, opacity: 0.6, marginBottom: 8 },
  menuRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
  },
  menuPill: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { fontWeight: '900', letterSpacing: 0.2 },
  listContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  playCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  cardBody: { flex: 1 },
  trackName: { fontSize: 15, marginBottom: 5 },
  dateText: { fontSize: 11, opacity: 0.5 },
  deleteBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,59,48,0.10)', justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, paddingBottom: 80 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 24, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '700' },
  emptyHint: { opacity: 0.5, fontSize: 13, textAlign: 'center', paddingHorizontal: 40 },
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




