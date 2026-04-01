import { useLoading } from '@/contexts/loading-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { memo, useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

// ─── Palette EnDasmu ────────────────────────────────────────────────────────
const C = {
  bg:      '#0e0e0e',
  bg2:     '#141414',
  bg3:     '#1a1a1a',
  text:    '#f0ede6',
  muted:   '#6b6b6b',
  border:  'rgba(255,255,255,0.07)',
  accent:  '#c8f135',   // vert citron signature
  accent2: '#3b82f6',   // bleu
  accent3: '#f59e0b',   // ambre
};

// ─── Static data ─────────────────────────────────────────────────────────────
const STATS = [
  { value: '50+', label: 'Chants' },
  { value: '45',   label: 'Membres' },
  { value: '12',   label: 'Événements' },
];

const FEATURES = [
  {
    icon: '🎵',
    title: 'Partitions',
    desc: 'Tout le répertoire choral',
    route: '/(tabs)/explore' as const,
    iconBg: 'rgba(200,241,53,0.12)',
  },
  {
    icon: '🎧',
    title: 'Playbacks',
    desc: 'Répétitions guidées',
    route: '/(tabs)/playbacks' as const,
    iconBg: 'rgba(59,130,246,0.12)',
  },
];

const CARDS = [
  { image: require('@/assets/images/photo1.jpg'), label: 'Firaisankina', bg: ['#1a2a1a', '#2d4a1e'] as [string, string] },
  { image: require('@/assets/images/photo2.jpg'), label: 'Fifaliana', bg: ['#0d1a2e', '#1e3048'] as [string, string] },
  { image: require('@/assets/images/photo3.jpg'), label: 'Fitiavana', bg: ['#2a1a1a', '#4a2e1e'] as [string, string] },
  { image: require('@/assets/images/photo4.jpg'), label: 'Fiderana', bg: ['#1a1a2a', '#2e1e4a'] as [string, string] },
];

const AVATARS = ['#7c3aed', '#db2777', '#059669', '#d97706'];

// ─── Animated dots loader ─────────────────────────────────────────────────────
const DotsLoader = memo(function DotsLoader() {
  const d1 = useRef(new Animated.Value(0)).current;
  const d2 = useRef(new Animated.Value(0)).current;
  const d3 = useRef(new Animated.Value(0)).current;
  const dots = [d1, d2, d3];

  useEffect(() => {
    const anim = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, { toValue: -10, duration: 320, delay, useNativeDriver: USE_NATIVE_DRIVER }),
          Animated.timing(dot, { toValue: 0,   duration: 320, useNativeDriver: USE_NATIVE_DRIVER }),
          Animated.timing(dot, { toValue: 0, duration: 0, delay: 600 - delay, useNativeDriver: USE_NATIVE_DRIVER }),
        ])
      );
    Animated.parallel(dots.map((d, i) => anim(d, i * 150))).start();
  }, []);

  return (
    <View style={s.dotsRow}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={[s.dot, { transform: [{ translateY: d }] }]} />
      ))}
    </View>
  );
});

// ─── Pulsing ring around logo ─────────────────────────────────────────────────
const PulseRing = memo(function PulseRing() {
  const scale1 = useRef(new Animated.Value(1)).current;
  const opac1  = useRef(new Animated.Value(0.6)).current;
  const scale2 = useRef(new Animated.Value(1)).current;
  const opac2  = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = (scale: Animated.Value, opac: Animated.Value, delay: number, baseOpacity: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scale, { toValue: 1.55, duration: 1200, delay, useNativeDriver: USE_NATIVE_DRIVER }),
            Animated.timing(opac,  { toValue: 0,    duration: 1200, delay, useNativeDriver: USE_NATIVE_DRIVER }),
          ]),
          Animated.parallel([
            Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: USE_NATIVE_DRIVER }),
            Animated.timing(opac,  { toValue: baseOpacity, duration: 0, useNativeDriver: USE_NATIVE_DRIVER }),
          ]),
        ])
      );
    Animated.parallel([
      pulse(scale1, opac1, 0, 0.6),
      pulse(scale2, opac2, 600, 0.3),
    ]).start();
  }, []);

  return (
    <View style={s.pulseWrap} pointerEvents="none">
      <Animated.View style={[s.pulseRing, { transform: [{ scale: scale1 }], opacity: opac1 }]} />
      <Animated.View style={[s.pulseRing, { transform: [{ scale: scale2 }], opacity: opac2 }]} />
    </View>
  );
});

// ─── Floating blob (decorative circle) ──────────────────────────────────────
const Blob = memo(function Blob({
  size, color, top, left, right, bottom, opacity = 0.35,
}: {
  size: number; color: string; opacity?: number;
  top?: number; left?: number; right?: number; bottom?: number;
}) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size, height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        top, left, right, bottom,
        opacity,
      }}
    />
  );
});

// ─── Stat item ───────────────────────────────────────────────────────────────
const StatItem = memo(function StatItem({ value, label, last }: { value: string; label: string; last?: boolean }) {
  return (
    <View style={[s.statItem, !last && s.statItemBorder]}>
      <Text style={s.statNum}>{value}</Text>
      <Text style={s.statLbl}>{label}</Text>
    </View>
  );
});

// ─── Media card ──────────────────────────────────────────────────────────────
const MediaCard = memo(function MediaCard({ image, label, bg }: typeof CARDS[0]) {
  return (
    <View style={s.mediaCard}>
      <LinearGradient colors={bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.mediaCardGrad}>
        <Image source={image} style={s.mediaPhoto} contentFit="cover" cachePolicy="memory-disk" />
      </LinearGradient>
      <View style={s.mediaOverlay}>
        <Text style={s.mediaLabel}>{label}</Text>
      </View>
    </View>
  );
});

// ─── Feature card ────────────────────────────────────────────────────────────
const FeatureCard = memo(function FeatureCard({
  feature, onPress,
}: { feature: typeof FEATURES[0]; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.featureCard, pressed && { opacity: 0.75 }]}>
      <View style={[s.featureIconBubble, { backgroundColor: feature.iconBg }]}>
        <Text style={s.featureEmoji}>{feature.icon}</Text>
      </View>
      <Text style={s.featureTitle}>{feature.title}</Text>
      <Text style={s.featureDesc}>{feature.desc}</Text>
    </Pressable>
  );
});

// ─── Avatar stack ─────────────────────────────────────────────────────────────
const AvatarStack = memo(function AvatarStack() {
  return (
    <View style={s.avatarRow}>
      {AVATARS.map((bg, i) => (
        <View key={i} style={[s.avatar, { backgroundColor: bg, marginLeft: i === 0 ? 0 : -8 }]}>
          <Text style={s.avatarLetter}>{String.fromCharCode(65 + i)}</Text>
        </View>
      ))}
      <View style={s.avatarCount}>
        <Text style={s.avatarCountTxt}>+41</Text>
      </View>
    </View>
  );
});

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const { isLoading, setIsLoading } = useLoading();

  // ── Splash anims ──
  const logoFade    = useRef(new Animated.Value(0)).current;
  const logoScale   = useRef(new Animated.Value(0.75)).current;
  const nameFade    = useRef(new Animated.Value(0)).current;
  const nameSlide   = useRef(new Animated.Value(16)).current;
  const tagFade     = useRef(new Animated.Value(0)).current;
  const tagSlide    = useRef(new Animated.Value(12)).current;
  const dotsFade    = useRef(new Animated.Value(0)).current;
  const splashFade  = useRef(new Animated.Value(1)).current;  // for exit

  // ── Content anims ──
  const contentFade = useRef(new Animated.Value(0)).current;
  const heroFade    = useRef(new Animated.Value(0)).current;
  const heroSlide   = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    // 1. Logo pop-in
    Animated.parallel([
      Animated.timing(logoFade,  { toValue: 1, duration: 420, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start();

    // 2. Name slides up (after 350ms)
    const tName = setTimeout(() => {
      Animated.parallel([
        Animated.timing(nameFade,  { toValue: 1, duration: 350, useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(nameSlide, { toValue: 0, duration: 350, useNativeDriver: USE_NATIVE_DRIVER }),
      ]).start();
    }, 350);

    // 3. Tagline slides up (after 550ms)
    const tTag = setTimeout(() => {
      Animated.parallel([
        Animated.timing(tagFade,  { toValue: 1, duration: 350, useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(tagSlide, { toValue: 0, duration: 350, useNativeDriver: USE_NATIVE_DRIVER }),
      ]).start();
    }, 550);

    // 4. Dots appear (after 800ms)
    const tDots = setTimeout(() => {
      Animated.timing(dotsFade, { toValue: 1, duration: 300, useNativeDriver: USE_NATIVE_DRIVER }).start();
    }, 800);

    // 5. Exit splash (after 2000ms)
    const tExit = setTimeout(() => {
      Animated.timing(splashFade, { toValue: 0, duration: 400, useNativeDriver: USE_NATIVE_DRIVER }).start(() => {
        setIsLoading(false);
        Animated.parallel([
          Animated.timing(contentFade, { toValue: 1, duration: 400, useNativeDriver: USE_NATIVE_DRIVER }),
          Animated.timing(heroFade,    { toValue: 1, duration: 520, useNativeDriver: USE_NATIVE_DRIVER }),
          Animated.timing(heroSlide,   { toValue: 0, duration: 520, useNativeDriver: USE_NATIVE_DRIVER }),
        ]).start();
      });
    }, 2000);

    return () => {
      clearTimeout(tName);
      clearTimeout(tTag);
      clearTimeout(tDots);
      clearTimeout(tExit);
    };
  }, []);

  // ── SPLASH ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Animated.View style={[s.splashBg, { opacity: splashFade }]}>
        {/* blobs décoratifs */}
        <Blob size={320} color="#c8f135" top={-100} right={-100} opacity={0.10} />
        <Blob size={200} color="#3b82f6" bottom={-60} left={-60} opacity={0.10} />
        <Blob size={120} color="#f59e0b" top={SCREEN_H * 0.4} left={SCREEN_W * 0.6} opacity={0.08} />

        {/* Logo + rings pulsants */}
        <View style={s.splashLogoWrap}>
          <PulseRing />
          <Animated.View style={[
            s.splashLogoCircle,
            { opacity: logoFade, transform: [{ scale: logoScale }] },
          ]}>
            <Image
              source={require('@/assets/images/logo_fafi.png')}
              style={s.splashLogoImg}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          </Animated.View>
        </View>

        {/* Nom — slide up */}
        <Animated.Text style={[
          s.splashName,
          { opacity: nameFade, transform: [{ translateY: nameSlide }] },
        ]}>
          Fa<Text style={{ color: C.accent }}>Fi</Text>
        </Animated.Text>

        {/* Tagline — slide up décalé */}
        <Animated.Text style={[
          s.splashTagline,
          { opacity: tagFade, transform: [{ translateY: tagSlide }] },
        ]}>
          "Ny foko mankalaza"
        </Animated.Text>

        {/* Dots — fade in après tagline */}
        <Animated.View style={{ opacity: dotsFade }}>
          <DotsLoader />
        </Animated.View>
      </Animated.View>
    );
  }

  // ── MAIN ────────────────────────────────────────────────────────────────────
  return (
    <Animated.View style={{ flex: 1, opacity: contentFade, backgroundColor: C.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <View style={s.hero}>
          {/* blobs */}
          <Blob size={260} color="#c8f135" top={-60}  right={-60}  opacity={0.22} />
          <Blob size={160} color="#3b82f6" top={160}  right={30}   opacity={0.18} />
          <Blob size={100} color="#f59e0b" top={100}  left={20}    opacity={0.14} />

          {/* navbar */}
          <View style={s.navbar}>
            <Text style={s.navLogo}>Fa<Text style={{ color: C.accent }}>Fi</Text></Text>
            <Pressable style={s.navCta}>
              <Text style={s.navCtaTxt}>STK</Text>
            </Pressable>
          </View>

          <Animated.View style={{ opacity: heroFade, transform: [{ translateY: heroSlide }] }}>

            {/* badge */}
            <View style={s.heroBadge}>
              <View style={s.heroBadgeDot} />
              <Text style={s.heroBadgeTxt}>PLATEFORME CHORALE</Text>
            </View>

            {/* title */}
            <Text style={s.heroTitle}>
              Feo sy Ako{'\n'}
              <Text style={{ color: C.accent }}>Fiderana</Text>
              <Text style={{ color: C.muted }}>.</Text>
            </Text>

            {/* sub */}
            <Text style={s.heroSub}>
              “Tsara ny misaotra an’i Jehovah… ny mitory ny famindram-pony isa-maraina… amin’ny lokanga folo sy amin’ny valiha ary amin’ny feon-kira.”
              Salamo 92:2-3
            </Text>

            {/* actions */}
            <View style={s.heroActions}>
              <Link href="/modal" asChild>
                <Pressable style={({ pressed }) => [s.btnPrimary, pressed && { opacity: 0.85 }]}>
                  <Text style={s.btnPrimaryTxt}>Commencer</Text>
                </Pressable>
              </Link>
             
            </View>

            {/* avatar + badge */}
            <View style={s.heroMeta}>
              <AvatarStack />
              <View style={s.heroPriceBadge}>
                <Text style={s.heroPriceIcon}>🎵</Text>
                <View>
                  <Text style={s.heroPriceLbl}>Hira</Text>
                  <Text style={s.heroPriceVal}>50+</Text>
                </View>
              </View>
            </View>

          </Animated.View>
        </View>

        {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
        <View style={s.statsBar}>
          {STATS.map((st, i) => (
            <StatItem key={i} {...st} last={i === STATS.length - 1} />
          ))}
        </View>

        {/* ── TRENDING ──────────────────────────────────────────────────────── */}
        <View style={s.section}>
          {/* header */}
          <View style={s.sectionHeader}>
            <View>
              <Text style={s.sectionTag}>Collection populaire</Text>
              <Text style={s.sectionTitle}>Une petite description de notre groupe.</Text>
            </View>
          </View>

          {/* 2×2 card grid */}
          <View style={s.mediaGrid}>
            {CARDS.map((card, i) => <MediaCard key={i} {...card} />)}
          </View>

          {/* description */}
          <Text style={s.trendingDesc}>
            Découvrez les partitions et playbacks les plus utilisés par les membres du chœur. Mis à jour a chaque utilisateur.
          </Text>
        </View>

        {/* ── FEATURES ──────────────────────────────────────────────────────── */}
        <View style={[s.section, { paddingTop: 0 }]}>
          <Text style={s.sectionTag}>Fonctionnalités</Text>
          <View style={s.featuresRow}>
            {FEATURES.map((f, i) => (
              <FeatureCard
                key={i}
                feature={f}
                onPress={() => router.push(f.route)}
              />
            ))}
          </View>
        </View>

        {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
        <View style={s.ctaWrap}>
          <LinearGradient
            colors={['#141414', '#1a1a1a']}
            style={s.ctaBanner}
          >
            <Blob size={220} color="#c8f135" top={-60} right={-60} opacity={0.1} />
            <Text style={s.ctaTitle}>
              Rejoignez{'\n'}<Text style={{ color: C.accent }}>FaFi</Text> aujourd'hui.
            </Text>
            <Text style={s.ctaSub}>
              "Ny foko mankalaza" — Gérez vos partition et vos playbacks  pour facilite les repetitions.
            </Text>
          </LinearGradient>
        </View>

        {/* ── FOOTER ────────────────────────────────────────────────────────── */}
        <View style={s.footer}>
          <Text style={s.footerLogo}>Fa<Text style={{ color: C.accent }}>Fi</Text></Text>
          <Text style={s.footerSub}>"Inty aho hiraho aho"</Text>
        </View>

      </ScrollView>
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const CARD_SIZE = (SCREEN_W - 48 - 10) / 2;

const s = StyleSheet.create({

  // ── SPLASH ──
  splashBg: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  splashLogoWrap: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  pulseWrap: {
    position: 'absolute',
    width: 130,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
    borderColor: C.accent,
  },
  splashLogoCircle: {
    width: 120, height: 120,
    borderRadius: 60,
    backgroundColor: '#141414',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(200,241,53,0.3)',
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 14,
  },
  splashLogoImg: { width: 76, height: 76 },
  splashName: {
    fontSize: 40,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -1.5,
    marginBottom: 8,
  },
  splashTagline: {
    fontSize: 12,
    color: C.muted,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 44,
  },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: {
    width: 9, height: 9,
    borderRadius: 5,
    backgroundColor: C.accent,
  },

  // ── HERO ──
  hero: {
    paddingTop: 0,
    paddingHorizontal: 24,
    paddingBottom: 0,
    overflow: 'hidden',
    minHeight: 480,
    justifyContent: 'flex-end',
    backgroundColor: C.bg,
  },

  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 58,
    paddingBottom: 32,
  },
  navLogo: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.5,
  },
  navCta: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  navCtaTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
  },

  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(200,241,53,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(200,241,53,0.25)',
    borderRadius: 50,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 20,
  },
  heroBadgeDot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: C.accent,
  },
  heroBadgeTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: C.accent,
    letterSpacing: 1.5,
  },

  heroTitle: {
    fontSize: 52,
    fontWeight: '900',
    color: C.text,
    letterSpacing: -2.5,
    lineHeight: 52,
    marginBottom: 16,
  },
  heroSub: {
    fontSize: 14,
    color: C.muted,
    lineHeight: 22,
    marginBottom: 28,
    maxWidth: 300,
  },

  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 32,
  },
  btnPrimary: {
    backgroundColor: C.accent,
    borderRadius: 50,
    paddingHorizontal: 26,
    paddingVertical: 14,
  },
  btnPrimaryTxt: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0e0e0e',
  },
  btnGhost: {},
  btnGhostTxt: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },

  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 32,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 34, height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: { fontSize: 12, fontWeight: '700', color: '#fff' },
  avatarCount: {
    marginLeft: 6,
    backgroundColor: C.bg3,
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  avatarCountTxt: { fontSize: 11, fontWeight: '600', color: C.muted },

  heroPriceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.bg3,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  heroPriceIcon: { fontSize: 20 },
  heroPriceLbl: { fontSize: 10, color: C.muted, fontWeight: '500' },
  heroPriceVal: { fontSize: 18, fontWeight: '800', color: C.text, letterSpacing: -0.5 },

  // ── STATS BAR ──
  statsBar: {
    flexDirection: 'row',
    backgroundColor: C.bg2,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.border,
    paddingVertical: 22,
    paddingHorizontal: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statItemBorder: {
    borderRightWidth: 1,
    borderRightColor: C.border,
  },
  statNum: {
    fontSize: 32,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -1.5,
    lineHeight: 36,
  },
  statLbl: {
    fontSize: 11,
    color: C.muted,
    fontWeight: '500',
    marginTop: 2,
  },

  // ── SECTION ──
  section: {
    paddingHorizontal: 24,
    paddingTop: 36,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  sectionTag: {
    fontSize: 10,
    fontWeight: '700',
    color: C.accent,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -1.2,
    lineHeight: 34,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: C.muted,
  },

  // ── MEDIA GRID ──
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  mediaCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
    position: 'relative',
  },
  mediaCardGrad: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPhoto: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  mediaOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  mediaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  trendingDesc: {
    fontSize: 13,
    color: C.muted,
    lineHeight: 20,
    marginTop: 20,
  },

  // ── FEATURES ──
  featuresRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  featureCard: {
    flex: 1,
    backgroundColor: C.bg2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    padding: 18,
  },
  featureIconBubble: {
    width: 48, height: 48,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureEmoji: { fontSize: 22 },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 11,
    color: C.muted,
    lineHeight: 16,
  },

  // ── CTA ──
  ctaWrap: {
    paddingHorizontal: 24,
    paddingTop: 36,
  },
  ctaBanner: {
    borderRadius: 24,
    padding: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
  },
  ctaTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -1.2,
    lineHeight: 38,
    marginBottom: 12,
  },
  ctaSub: {
    fontSize: 13,
    color: C.muted,
    lineHeight: 20,
  },

  // ── FOOTER ──
  footer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: C.border,
    marginTop: 32,
  },
  footerLogo: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.5,
  },
  footerSub: {
    fontSize: 11,
    color: C.muted,
    fontStyle: 'italic',
  },
});