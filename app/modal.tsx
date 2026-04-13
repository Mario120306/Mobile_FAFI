import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ModalScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const tintColor = Colors[theme].tint;
  return (
    <ThemedView style={styles.container}>
      <View style={[styles.card, { backgroundColor: Colors[theme].surface, borderColor: Colors[theme].surfaceBorder }]}>
        <ThemedText style={styles.eyebrow}>MODAL</ThemedText>
        <ThemedText type="title" style={styles.title}>Paramètres</ThemedText>
        <ThemedText style={styles.subtitle}>{"Retournez à l'accueil quand vous voulez."}</ThemedText>

        <Link href="/" dismissTo asChild>
          <Pressable style={[styles.linkInner, { backgroundColor: tintColor }]}>
            <ThemedText style={[styles.linkText, { color: Colors[theme].onTint }]}>Fermer</ThemedText>
          </Pressable>
        </Link>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 3, opacity: 0.5, marginBottom: 10 },
  title: { marginBottom: 8 },
  subtitle: { opacity: 0.7, marginBottom: 18 },
  linkInner: {
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkText: {
    fontWeight: '900',
  },
});
