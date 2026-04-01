import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useSounds } from '@/contexts/sounds-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Image, Pressable, StyleSheet, View } from 'react-native';

export default function PlayerScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { sounds, removeSound } = useSounds();
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const lastStatusUpdateAt = useRef(0);

  const soundItem = sounds.find((sound) => sound.id === id);
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  useEffect(() => {
    const load = async () => {
      if (!soundItem) return;
      try {
        setIsLoading(true);
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });
        const { sound } = await Audio.Sound.createAsync(
          { uri: soundItem.uri },
          { shouldPlay: true, volume: 1.0 }
        );
        await sound.setVolumeAsync(1.0);
        await sound.setProgressUpdateIntervalAsync(250);
        soundRef.current = sound;
        setIsPlaying(true);
        sound.setOnPlaybackStatusUpdate(async (status) => {
          if (!status.isLoaded) return;
          const nextPosition = status.positionMillis ?? 0;
          const nextDuration = status.durationMillis ?? 0;
          const nextProgress = nextDuration > 0 ? nextPosition / nextDuration : 0;
          setPositionMs(nextPosition);
          setDurationMs(nextDuration);
          if (nextDuration > 0) {
            const now = Date.now();
            if (now - lastStatusUpdateAt.current >= 200) {
              lastStatusUpdateAt.current = now;
              progressAnim.setValue(nextProgress);
            }
          }
          if (status.didJustFinish) {
            setIsPlaying(false);
            await sound.unloadAsync();
            soundRef.current = null;
          }
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        Alert.alert('Erreur', `Impossible de charger ce son: ${message}`);
      } finally {
        setIsLoading(false);
      }
    };
    load();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [progressAnim, soundItem]);

  const handleTogglePlay = async () => {
    if (!soundRef.current) return;
    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.setVolumeAsync(1.0);
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de changer la lecture');
    }
  };

  const handleStop = async () => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.stopAsync();
      setIsPlaying(false);
      setPositionMs(0);
      progressAnim.setValue(0);
    } catch {
      Alert.alert('Erreur', "Impossible d'arrêter la lecture");
    }
  };

  const formatTime = (totalMs: number) => {
    const totalSeconds = Math.floor(totalMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const handleDelete = () => {
    if (!soundItem) return;
    Alert.alert('Supprimer', `Supprimer "${soundItem.filename}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          removeSound(soundItem.id);
          router.back();
        },
      },
    ]);
  };

  const handleSeek = async (locationX: number) => {
    if (!soundRef.current || durationMs <= 0 || trackWidth <= 0) return;
    const ratio = Math.min(Math.max(locationX / trackWidth, 0), 1);
    const nextPosition = Math.floor(durationMs * ratio);
    try {
      await soundRef.current.setPositionAsync(nextPosition);
      setPositionMs(nextPosition);
      progressAnim.setValue(ratio);
    } catch {
      Alert.alert('Erreur', 'Impossible de modifier la position');
    }
  };

  const progressX = useMemo(() => Animated.multiply(progressAnim, trackWidth), [progressAnim, trackWidth]);
  const progressThumbX = useMemo(() => Animated.subtract(progressX, 7), [progressX]);
  const name = soundItem?.filename.replace(/\.[^/.]+$/, '') ?? '';
  const ext = soundItem?.filename.split('.').pop()?.toUpperCase() ?? '';

  if (!soundItem) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.eyebrow}>LECTURE</ThemedText>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <IconSymbol name="xmark" size={16} color={tintColor} />
          </Pressable>
        </View>
        <View style={styles.notFoundWrap}>
          <ThemedText style={styles.notFoundTitle}>Son introuvable</ThemedText>
          <Pressable style={[styles.backBtn, { borderColor: tintColor }]} onPress={() => router.back()}>
            <ThemedText style={[styles.backBtnText, { color: tintColor }]}>← Retour</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <ThemedText style={styles.eyebrow}>EN LECTURE</ThemedText>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <IconSymbol name="xmark" size={16} color={tintColor} />
        </Pressable>
      </View>

      {/* ── Album art placeholder ── */}
      <View style={[styles.artWrap, { borderColor: `${tintColor}30` }]}>
        <View style={[styles.artInner, { backgroundColor: `${tintColor}12` }]}>
          <IconSymbol name="music.note" size={56} color={tintColor} />
        </View>
        <View style={[styles.ring, styles.ring1, { borderColor: `${tintColor}18` }]} />
        <View style={[styles.ring, styles.ring2, { borderColor: `${tintColor}10` }]} />
      </View>

      {/* ── Track info ── */}
      <View style={styles.trackInfo}>
        <View style={[styles.extBadge, { borderColor: tintColor, backgroundColor: `${tintColor}15` }]}>
          <ThemedText style={[styles.extText, { color: tintColor }]}>{ext}</ThemedText>
        </View>
        <ThemedText type="defaultSemiBold" style={styles.trackName} numberOfLines={2}>
          {name}
        </ThemedText>
      </View>

      {/* ── Progress bar ── */}
      <View style={styles.progressSection}>
        <Pressable
          onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
          onPress={(event) => handleSeek(event.nativeEvent.locationX)}
          style={styles.progressTrack}
        >
          <Animated.View style={[styles.progressFill, { width: progressX, backgroundColor: tintColor }]} />
          <Animated.View
            style={[
              styles.progressThumb,
              {
                backgroundColor: tintColor,
                transform: [{ translateX: progressThumbX }],
              },
            ]}
          />
        </Pressable>
        <View style={styles.timeRow}>
          <ThemedText style={styles.timeText}>{formatTime(positionMs)}</ThemedText>
          <ThemedText style={styles.timeText}>{formatTime(durationMs)}</ThemedText>
        </View>
      </View>

      {/* ── Controls ── */}
      <View style={styles.controls}>
        <Pressable
          style={[styles.sideBtn, { borderColor: `${tintColor}40` }]}
          onPress={handleStop}
          disabled={isLoading}
        >
          <IconSymbol name="stop.fill" size={18} color={tintColor} />
        </Pressable>

        <Pressable
          style={[styles.playBtn, { backgroundColor: tintColor, opacity: isLoading ? 0.5 : 1 }]}
          onPress={handleTogglePlay}
          disabled={isLoading}
        >
          <IconSymbol
            name={isPlaying ? 'pause.fill' : 'play.fill'}
            size={30}
            color="#fff"
          />
        </Pressable>

        <Pressable
          style={[styles.sideBtn, { borderColor: 'rgba(255,59,48,0.35)' }]}
          onPress={handleDelete}
        >
          <IconSymbol name="trash" size={18} color="#ff3b30" />
        </Pressable>
      </View>

      {/* ── Footer card ── */}
      <View style={[styles.footerCard, { borderColor: `${tintColor}22`, backgroundColor: `${tintColor}08` }]}>

        {/* Ligne du haut : vignette + infos */}
        <View style={styles.footerTop}>
          {/* Miniature image */}
          <View style={[styles.footerThumb, { borderColor: `${tintColor}35` }]}>
            <Image
              source={require('../assets/images/logo_fafi.png')}
              style={styles.footerThumbImage}
              resizeMode="cover"
            />
            {/* Badge waveform en bas à droite */}
            <View style={[styles.thumbBadge, { backgroundColor: `${tintColor}DD` }]}>
              <IconSymbol name="waveform" size={9} color="#fff" />
            </View>
          </View>

          {/* Infos texte */}
          <View style={styles.footerMeta}>
            <ThemedText style={[styles.footerMetaLabel, { color: tintColor }]}>FICHIER AUDIO</ThemedText>
            <ThemedText style={styles.footerMetaName} numberOfLines={2}>{name}</ThemedText>
            <View style={styles.footerMetaRow}>
              <View style={[styles.footerMetaPill, { borderColor: `${tintColor}40`, backgroundColor: `${tintColor}12` }]}>
                <IconSymbol name="doc.fill" size={9} color={tintColor} />
                <ThemedText style={[styles.footerMetaSmall, { color: tintColor }]}>{ext}</ThemedText>
              </View>
              <View style={[styles.footerMetaPill, { borderColor: `${tintColor}40`, backgroundColor: `${tintColor}12` }]}>
                <IconSymbol name="clock" size={9} color={tintColor} />
                <ThemedText style={[styles.footerMetaSmall, { color: tintColor }]}>{formatTime(durationMs)}</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Séparateur */}
        <View style={[styles.footerDivider, { backgroundColor: `${tintColor}18` }]} />

        {/* Ligne stats */}
        <View style={styles.footerStats}>
          <View style={styles.footerStatItem}>
            <IconSymbol name="play.circle.fill" size={16} color={tintColor} />
            <ThemedText style={styles.footerStatLabel}>Position</ThemedText>
            <ThemedText style={[styles.footerStatValue, { color: tintColor }]}>
              {formatTime(positionMs)}
            </ThemedText>
          </View>

          <View style={[styles.footerStatDivider, { backgroundColor: `${tintColor}20` }]} />

          <View style={styles.footerStatItem}>
            <IconSymbol name="timer" size={16} color={tintColor} />
            <ThemedText style={styles.footerStatLabel}>Durée totale</ThemedText>
            <ThemedText style={[styles.footerStatValue, { color: tintColor }]}>
              {formatTime(durationMs)}
            </ThemedText>
          </View>

          <View style={[styles.footerStatDivider, { backgroundColor: `${tintColor}20` }]} />

          <View style={styles.footerStatItem}>
            <IconSymbol name="waveform.path" size={16} color={tintColor} />
            <ThemedText style={styles.footerStatLabel}>Format</ThemedText>
            <ThemedText style={[styles.footerStatValue, { color: tintColor }]}>{ext}</ThemedText>
          </View>
        </View>

      </View>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28, paddingBottom: 36 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 8,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    opacity: 0.4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Art
  artWrap: {
    marginTop: 28,
    alignSelf: 'center',
    width: 200,
    height: 200,
    borderRadius: 40,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artInner: {
    width: 160,
    height: 160,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
  },
  ring1: { width: 220, height: 220, borderRadius: 50 },
  ring2: { width: 260, height: 260, borderRadius: 60 },

  // Track info
  trackInfo: {
    marginTop: 32,
    alignItems: 'center',
    gap: 10,
  },
  extBadge: {
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  extText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  trackName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
  },

  // Progress
  progressSection: {
    marginTop: 36,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.10)',
    overflow: 'visible',
    position: 'relative',
    justifyContent: 'center',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressThumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: -7,
    top: -5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  timeText: {
    fontSize: 12,
    opacity: 0.6,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // Controls
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginTop: 44,
  },
  sideBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtn: {
    width: 76,
    height: 76,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  // ── Footer card ──
  footerCard: {
    marginTop: 32,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },

  // Top row
  footerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  // Thumbnail
  footerThumb: {
    width: 76,
    height: 76,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  footerThumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Meta
  footerMeta: {
    flex: 1,
    gap: 5,
  },
  footerMetaLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    opacity: 0.5,
  },
  footerMetaName: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 18,
  },
  footerMetaRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  footerMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  footerMetaSmall: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Divider
  footerDivider: {
    height: 1,
    borderRadius: 1,
  },

  // Stats
  footerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  footerStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.4,
    letterSpacing: 0.3,
  },
  footerStatValue: {
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  footerStatDivider: {
    width: 1,
    height: 34,
    borderRadius: 1,
  },

  // Not found
  notFoundWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  notFoundTitle: { fontSize: 18, fontWeight: '700', opacity: 0.6 },
  backBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtnText: { fontWeight: '600' },
});