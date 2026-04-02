# FaFi - Gestionnaire de partitions et playbacks

FaFi est une application mobile créée avec Expo (React Native) pour gérer des partitions musicales, enregistrer des lyrics, scanner du texte et lire des playbacks.

## Fonctionnalités principales

- CRUD de partitions : création, modification, suppression.
- Stockage local via `AsyncStorage` (`@react-native-async-storage/async-storage`).
- Listing et tri pour afficher les partitions les plus récentes.
- Scanner et sauvegarder du texte en tant que partition.
- Navigation multi-écrans avec le router Expo (file-based routing).

## Architecture

- `app/` : écran et navigation.
  - `app/(tabs)/` : écran principal, explore, playbacks.
  - `app/partitions/` : scan et détails de partition.
- `contexts/partitions-context.tsx` : état global des partitions + persistance.
- `components/ui/` : composants UI réutilisables.
- `hooks/` : utilitaires pour schéma de couleurs.
- `constants/theme.ts` : thème couleur et styles.

## Stockage et limites

- Partitions stockées sous `STORAGE_KEY = '@fafi_partitions'`.
- Sérialisé en JSON via `AsyncStorage.setItem` / `getItem`.
- Aucune limite applicative fixée dans le code (pas de `MAX_PARTITIONS`).
- Limite dépend du quota de l’appareil et `AsyncStorage` (en pratique, potentiellement quelques Mo selon plateforme).

### Se prémunir des erreurs d’espace

- Gérer les exceptions sur `AsyncStorage.setItem` et `getItem`.
- Supprimer les partitions inutiles.
- En cas de quota atteint, afficher un message à l’utilisateur et proposer suppression.

## Installation

1. Cloner le dépôt

   ```bash
   git clone <repo-url>
   cd FaFi
   ```

2. Installer les dépendances

   ```bash
   npm install
   ```

3. Lancer le projet

   ```bash
   npx expo start
   ```

4. Ouvrir sur Android/iOS/Web via le CLI Expo.

## Structure de données

Partition (interface) :

- `id: string`
- `title: string`
- `lyrics: string`
- `createdAt: number`

Les partitions sont maintenues en mémoire dans le contexte puis persistées en local.

## Flux principal

1. Au démarrage, `PartitionsProvider` charge `@fafi_partitions` et hydrate l’état.
2. Ajout/modification/suppression met à jour l’état puis écrit dans `AsyncStorage`.
3. Le composant `app/(tabs)/explore.tsx` affiche la liste.
4. Les écrans `app/partitions/[id].tsx` et `app/partitions/scan.tsx` permettent gestion et scan.

## Comment l’application a été conçue

- centralisation du modèle (partition) dans un contexte React pour simplifier l’accès depuis tous les écrans.
- persistance transparente via effet `useEffect` sur `partitions`.
- protection minimale : conversion, sanitization côté lecture (title et lyrics) pour garder les données saines.
- UX simple : interface plateforme native, actions de suppression et navigation directe.

## Contributions

- Faire un fork et ouvrir un PR.
- Ajouter tests et typages TypeScript.
- Valider compatibilité Android/iOS/web.

## Commandes utiles

- `npm start` / `npx expo start`
- `npm run android` / `npm run ios` (selon configuration)
- `npm run lint`, `npm run format`

---

Ce README explique le fonctionnement de l’application et les choix de conception par rapport au stockage de partitions et à l’architecture contextuelle. En cas d’évolution, documenter les nouvelles routes ou le nouveau modèle de données ici. 
