import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { usePartitions } from '@/contexts/partitions-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACTION_BAR_MIN_HEIGHT = 68;

export default function PartitionScanScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { addPartition } = usePartitions();
  const insets = useSafeAreaInsets();

  const [permission, requestPermission] = useCameraPermissions();
  const [scannerEnabled, setScannerEnabled] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [manualInput, setManualInput] = useState('');

  const theme = colorScheme ?? 'light';
  const tintColor = Colors[theme].tint;
  const hasPermission = permission?.granted;

  const onTint = Colors[theme].onTint;
  const surface = Colors[theme].surface;
  const surface2 = Colors[theme].surface2;
  const surfaceBorder = Colors[theme].surfaceBorder;
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  const processScannedData = (data: string) => {
    let title = 'Partition scannée';
    let lyrics = data;

    try {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        title = parsed.title ?? title;
        lyrics = parsed.lyrics ?? data;
      }
    } catch {
      // texte brut
    }

    if (!lyrics.trim()) {
      Alert.alert('QR invalide', 'Le contenu du QR ne contient aucun texte.');
      setScanned(false);
      return;
    }

    const created = addPartition({ title, lyrics });

    Alert.alert('Partition enregistrée', `${created.title} a été ajoutée.`, [
      {
        text: 'Voir',
        onPress: () =>
          router.replace({
            pathname: '/partitions/[id]',
            params: { id: created.id },
          } as any),
      },
      {
        text: 'Retour',
        style: 'cancel',
        onPress: () =>
          router.replace({
            pathname: '/(tabs)/explore',
          } as any),
      },
    ]);
  };

  const onBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);
    setScannerEnabled(false);
    processScannedData(data);
  };

  const onManualSave = () => {
    const payload = manualInput.trim();

    if (!payload) {
      Alert.alert('Erreur', "Entrez le texte ou JSON QR avant d'enregistrer.");
      return;
    }

    processScannedData(payload);
  };

  let cameraContent = null;

  if (hasPermission === undefined) {
    cameraContent = (
      <ThemedText style={styles.subtitle}>
        {"Demande d'autorisation caméra..."}
      </ThemedText>
    );
  } else if (!hasPermission) {
    cameraContent = (
      <ThemedText style={styles.subtitle}>
        Accès caméra refusé. Activez la permission dans les paramètres.
      </ThemedText>
    );
  } else if (scannerEnabled) {
    cameraContent = (
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={onBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {cameraContent}

      <View
        style={[
          styles.bottomPanel,
          {
            backgroundColor: Colors[theme].bg2,
            borderTopColor: Colors[theme].border,
            paddingBottom: 18 + insets.bottom + ACTION_BAR_MIN_HEIGHT,
          },
        ]}
      >
        <ThemedText style={styles.title}>
          Scan QR / Saisie manuelle
        </ThemedText>

        <ThemedText style={styles.subtitle}>
          Scannez un QR code contenant un JSON {'{ "title":"...","lyrics":"..." }'} ou du texte simple.
        </ThemedText>

        <Pressable
          style={[styles.buttonPrimary, { backgroundColor: tintColor, marginBottom: 10 }]}
          onPress={() => {
            if (hasPermission) {
              setScanned(false);
              setScannerEnabled(true);
            } else {
              Alert.alert(
                'Permission requise',
                'La caméra est nécessaire pour scanner le QR code.'
              );
            }
          }}
        >
          <ThemedText style={[styles.buttonText, { color: onTint }]}>
            Activer le scanner QR
          </ThemedText>
        </Pressable>

        <TextInput
          style={[styles.input, { borderColor: surfaceBorder, backgroundColor: surface2, color: Colors[theme].text }]}
          multiline
          value={manualInput}
          onChangeText={setManualInput}
          placeholder='{ "title":"...","lyrics":"..." }'
          placeholderTextColor={Colors[theme].muted}
        />
      </View>

      <View
        style={[
          styles.actionBar,
          {
            backgroundColor: Colors[theme].bg2,
            borderTopColor: Colors[theme].border,
            paddingBottom: 12 + insets.bottom,
          },
        ]}
      >
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.buttonGhost, { flex: 1, borderColor: surfaceBorder, backgroundColor: surface }]}
            onPress={() => router.replace({ pathname: '/(tabs)/explore' } as any)}
          >
            <ThemedText style={styles.buttonGhostText}>Annuler</ThemedText>
          </Pressable>
          <Pressable
            style={[styles.buttonPrimary, { flex: 1, backgroundColor: tintColor }]}
            onPress={onManualSave}
          >
            <ThemedText style={[styles.buttonText, { color: onTint }]}>Enregistrer</ThemedText>
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 18,
    borderTopWidth: 1,
  },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    minHeight: 68,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.75,
  },
  input: {
    minHeight: 80,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    textAlignVertical: 'top',
  },
  buttonPrimary: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonGhost: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '800',
  },
  buttonGhostText: {
    fontWeight: '800',
    opacity: 0.9,
  },
});
