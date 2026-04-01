import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FaFiEmoji } from '@/components/ui/fafi-emoji';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { usePartitions } from '@/contexts/partitions-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function PartitionDetailsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getPartitionById, removePartition, updatePartitionTitle } = usePartitions();
  const theme = colorScheme ?? 'light';
  const tintColor = Colors[theme].tint;

  const partition = id ? getPartitionById(id) : undefined;
  const [titleDraft, setTitleDraft] = useState('');

  useEffect(() => {
    if (partition) {
      setTitleDraft(partition.title);
    }
  }, [partition]);

  const canSaveTitle = useMemo(() => {
    if (!partition) return false;
    const next = titleDraft.trim();
    return next.length > 0 && next !== partition.title;
  }, [partition, titleDraft]);

  if (!id) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <ThemedText>Partition non trouvée</ThemedText>
      </ThemedView>
    );
  }

  if (!partition) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <ThemedText>Partition introuvable</ThemedText>
      </ThemedView>
    );
  }

  const saveTitle = () => {
    if (!partition || !canSaveTitle) return;
    updatePartitionTitle(partition.id, titleDraft);
  };

  const handleDelete = () => {
    if (!partition) return;
    removePartition(partition.id);
    router.replace('/(tabs)/explore');
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.topTint} />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoWrap}>
            <FaFiEmoji name="headphones" size={18} />
          </View>
          <View style={styles.headerTitleWrap}>
            <ThemedText style={styles.eyebrow}>PARTITION</ThemedText>
            <ThemedText type="title" style={styles.title} numberOfLines={1}>{partition.title}</ThemedText>
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
        <View style={styles.titleCard}>
          <ThemedText style={styles.fieldLabel}>Titre</ThemedText>
          <View style={styles.titleRow}>
            <TextInput
              value={titleDraft}
              onChangeText={setTitleDraft}
              placeholder="Titre de la partition"
              placeholderTextColor="rgba(240,237,230,0.45)"
              selectionColor={tintColor}
              style={styles.titleInput}
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
                  borderColor: canSaveTitle ? `${tintColor}55` : 'rgba(255,255,255,0.10)',
                  backgroundColor: canSaveTitle ? `${tintColor}18` : 'rgba(255,255,255,0.03)',
                },
              ]}
            >
              <ThemedText style={[styles.saveBtnText, { color: canSaveTitle ? tintColor : 'rgba(240,237,230,0.55)' }]}>
                OK
              </ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={styles.lyricsCard}>
          <ThemedText style={styles.lyricsText}>{partition.lyrics || 'Aucun texte enregistré.'}</ThemedText>
        </View>
        <Pressable style={styles.deleteBtn} onPress={handleDelete}>
          <ThemedText style={styles.deleteBtnText}>Supprimer</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 0, paddingHorizontal: 24 },
  topTint: {
    height: 18,
    marginHorizontal: -24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
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
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.04)',
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
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
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
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: '#f0ede6',
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
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
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