import { ASSET_PARTITIONS } from '@/assets/partitions';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FaFiEmoji } from '@/components/ui/fafi-emoji';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { usePartitions } from '@/contexts/partitions-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { readTextAsset } from '@/utils/asset-text';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function PartitionDetailsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { id, kind } = useLocalSearchParams<{ id?: string; kind?: 'scanned' | 'asset' }>();
  const { getPartitionById, removePartition, updatePartitionTitle } = usePartitions();
  const theme = colorScheme ?? 'light';
  const tintColor = Colors[theme].tint;
  const surface = Colors[theme].surface;
  const surface2 = Colors[theme].surface2;
  const surfaceBorder = Colors[theme].surfaceBorder;

  const effectiveKind: 'scanned' | 'asset' = kind === 'asset' ? 'asset' : 'scanned';
  const scannedPartition = id && effectiveKind === 'scanned' ? getPartitionById(id) : undefined;
  const assetPartition = useMemo(
    () => (id && effectiveKind === 'asset' ? ASSET_PARTITIONS.find((p) => p.id === id) : undefined),
    [effectiveKind, id]
  );

  const [assetLyrics, setAssetLyrics] = useState<string>('');
  const [assetLoading, setAssetLoading] = useState(false);
  const title = effectiveKind === 'asset' ? assetPartition?.title : scannedPartition?.title;
  const lyrics = effectiveKind === 'asset' ? assetLyrics : scannedPartition?.lyrics;
  const [titleDraft, setTitleDraft] = useState('');

  useEffect(() => {
    if (scannedPartition) {
      setTitleDraft(scannedPartition.title);
    }
  }, [scannedPartition]);

  useEffect(() => {
    let cancelled = false;

    async function loadAssetText() {
      if (effectiveKind !== 'asset' || !assetPartition) return;
      setAssetLoading(true);
      try {
        const text = await readTextAsset(assetPartition.source);
        if (!cancelled) setAssetLyrics(text);
      } catch {
        if (!cancelled) setAssetLyrics('Impossible de lire cette partition.');
      } finally {
        if (!cancelled) setAssetLoading(false);
      }
    }

    loadAssetText();
    return () => {
      cancelled = true;
    };
  }, [assetPartition, effectiveKind]);

  const canSaveTitle = useMemo(() => {
    if (!scannedPartition) return false;
    const next = titleDraft.trim();
    return next.length > 0 && next !== scannedPartition.title;
  }, [scannedPartition, titleDraft]);

  if (!id) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <ThemedText>Partition non trouvée</ThemedText>
      </ThemedView>
    );
  }

  if (effectiveKind === 'scanned' && !scannedPartition) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <ThemedText>Partition introuvable</ThemedText>
      </ThemedView>
    );
  }

  if (effectiveKind === 'asset' && !assetPartition) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <ThemedText>Partition introuvable</ThemedText>
      </ThemedView>
    );
  }

  const saveTitle = () => {
    if (effectiveKind !== 'scanned' || !scannedPartition || !canSaveTitle) return;
    updatePartitionTitle(scannedPartition.id, titleDraft);
  };

  const handleDelete = () => {
    if (effectiveKind !== 'scanned' || !scannedPartition) return;
    removePartition(scannedPartition.id);
    router.replace('/(tabs)/explore');
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.topTint, { backgroundColor: Colors[theme].surface2, borderBottomColor: Colors[theme].border }]} />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.logoWrap, { borderColor: Colors[theme].border, backgroundColor: Colors[theme].surface2 }]}>
            <FaFiEmoji name="headphones" size={18} />
          </View>
          <View style={styles.headerTitleWrap}>
            <ThemedText style={styles.eyebrow}>PARTITION</ThemedText>
            <ThemedText type="title" style={styles.title} numberOfLines={1}>
              {title ?? ''}
            </ThemedText>
          </View>
        </View>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: `${tintColor}22`, borderColor: `${tintColor}55` }]}
        >
          <IconSymbol name="xmark" size={18} color={tintColor} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {effectiveKind === 'scanned' ? (
          <View style={[styles.titleCard, { backgroundColor: surface, borderColor: surfaceBorder }]}>
            <ThemedText style={styles.fieldLabel}>Titre</ThemedText>
            <View style={styles.titleRow}>
              <TextInput
                value={titleDraft}
                onChangeText={setTitleDraft}
                placeholder="Titre de la partition"
                placeholderTextColor={Colors[theme].muted}
                selectionColor={tintColor}
                style={[
                  styles.titleInput,
                  { color: Colors[theme].text, borderColor: surfaceBorder, backgroundColor: surface2 },
                ]}
                returnKeyType="done"
                onSubmitEditing={saveTitle}
                blurOnSubmit
              />
              <Pressable
                onPress={saveTitle}
                disabled={!canSaveTitle}
                style={[
                  styles.saveBtn,
                  {
                    borderColor: canSaveTitle ? `${tintColor}55` : surfaceBorder,
                    backgroundColor: canSaveTitle ? `${tintColor}18` : surface,
                  },
                ]}
              >
                <ThemedText style={[styles.saveBtnText, { color: canSaveTitle ? tintColor : Colors[theme].muted }]}>
                  OK
                </ThemedText>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={[styles.lyricsCard, { backgroundColor: surface, borderColor: surfaceBorder }]}>
          <ThemedText style={styles.lyricsText}>
            {effectiveKind === 'asset'
              ? assetLoading
                ? 'Chargement…'
                : (lyrics || 'Aucun texte enregistré.')
              : (lyrics || 'Aucun texte enregistré.')}
          </ThemedText>
        </View>
        {effectiveKind === 'scanned' ? (
          <Pressable style={styles.deleteBtn} onPress={handleDelete}>
            <ThemedText style={styles.deleteBtnText}>Supprimer</ThemedText>
          </Pressable>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 0, paddingHorizontal: 24 },
  topTint: {
    height: 18,
    marginHorizontal: -24,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, paddingRight: 10 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  logoWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: { flex: 1, gap: 2 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 3, opacity: 0.45 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  content: { flex: 1 },
  contentInner: { paddingBottom: 24 },
  titleCard: {
    marginTop: 10,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  fieldLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 2.5, opacity: 0.55 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  titleInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtn: {
    height: 44,
    minWidth: 52,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { fontWeight: '900', letterSpacing: 0.4 },
  lyricsCard: {
    marginTop: 10,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  lyricsText: { fontSize: 15, lineHeight: 24, opacity: 0.95 },
  deleteBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    borderColor: 'rgba(255,59,48,0.35)',
    backgroundColor: 'rgba(255,59,48,0.10)',
  },
  deleteBtnText: { fontWeight: '800', color: '#ff3b30', letterSpacing: 0.2 },
});