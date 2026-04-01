import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <ThemedText style={styles.eyebrow}>MODAL</ThemedText>
        <ThemedText type="title" style={styles.title}>Paramètres</ThemedText>
        <ThemedText style={styles.subtitle}>{"Retournez à l'accueil quand vous voulez."}</ThemedText>

        <Link href="/" dismissTo style={styles.link}>
          <ThemedText style={styles.linkText}>Fermer</ThemedText>
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
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 3, opacity: 0.5, marginBottom: 10 },
  title: { marginBottom: 8 },
  subtitle: { opacity: 0.7, marginBottom: 18 },
  link: {
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#c8f135',
  },
  linkText: {
    fontWeight: '900',
    color: '#0e0e0e',
  },
});
