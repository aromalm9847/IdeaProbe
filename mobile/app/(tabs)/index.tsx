import { useRef, useEffect } from "react"
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Animated, StatusBar,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useAuthStore } from "../../src/store/authStore"
import { useScanStore } from "../../src/store/useScanStore"
import { colors, shadow, verdict as verdictColors, verdictLight } from "../../src/theme"
import { usePressScale } from "../../src/hooks/useEntrance"
import { GlowBulb } from "../../src/components/GlowBulb"

const FEATURES = [
  { icon: "trending-up-outline", label: "Market Trends",    color: "#2563EB" },
  { icon: "people-outline",      label: "Competitors",      color: "#7C3AED" },
  { icon: "bulb-outline",        label: "Innovation Score", color: "#D97706" },
  { icon: "earth-outline",       label: "Deep Research",    color: "#16A34A" },
]

export default function HomeScreen() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const { user } = useAuthStore()
  const { history } = useScanStore()

  // Entrance
  const fade  = useRef(new Animated.Value(0)).current
  const slideY = useRef(new Animated.Value(20)).current
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,   { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, friction: 9, tension: 80, useNativeDriver: true }),
    ]).start()
  }, [])

  // Orb float
  const orb1 = useRef(new Animated.Value(0)).current
  const orb2 = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(orb1, { toValue: 1, duration: 4000, useNativeDriver: true }),
      Animated.timing(orb1, { toValue: 0, duration: 4000, useNativeDriver: true }),
    ])).start()
    setTimeout(() => Animated.loop(Animated.sequence([
      Animated.timing(orb2, { toValue: 1, duration: 3500, useNativeDriver: true }),
      Animated.timing(orb2, { toValue: 0, duration: 3500, useNativeDriver: true }),
    ])).start(), 2000)
  }, [])
  const orb1Y = orb1.interpolate({ inputRange: [0, 1], outputRange: [0, -18] })
  const orb2Y = orb2.interpolate({ inputRange: [0, 1], outputRange: [0, 14] })

  const { scale: ctaScale, onPressIn, onPressOut } = usePressScale(0.95)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const firstName = user?.full_name?.split(" ")[0] || null

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Decorative orbs (behind everything) */}
      <Animated.View style={[s.orb1, { transform: [{ translateY: orb1Y }] }]} />
      <Animated.View style={[s.orb2, { transform: [{ translateY: orb2Y }] }]} />

      {/* ── FIXED HEADER ────────────────────────────── */}
      <View style={[s.header, { paddingTop: insets.top + 4 }]}>
        <View>
          <Text style={s.logoText}>IdeaProbe</Text>
          <Text style={s.logoSub}>AI Startup Validator</Text>
        </View>
        {user ? (
          <TouchableOpacity onPress={() => router.push("/(tabs)/account")} activeOpacity={0.8}>
            <LinearGradient colors={["#2563EB", "#6366F1"]} style={s.avatar}>
              <Text style={s.avatarText}>{user.full_name?.[0]?.toUpperCase() || "U"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => router.push("/auth")} activeOpacity={0.8}>
            <View style={s.signInChip}>
              <Ionicons name="person-outline" size={13} color={colors.primary} />
              <Text style={s.signInText}>Sign In</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* ── SCROLLABLE CONTENT ──────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, { paddingBottom: 120 }]}
      >
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slideY }] }}>

          {/* Greeting */}
          {firstName && (
            <Text style={s.greeting}>{greeting}, {firstName} 👋</Text>
          )}

          {/* Hero card */}
          <View style={[s.heroCard, shadow.md]}>
            <LinearGradient
              colors={["#EFF6FF", "#EEF2FF", "#F0F9FF"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.heroGrad}
            >
              <View style={s.heroLeft}>
                <View style={s.badge}>
                  <View style={s.badgeDot} />
                  <Text style={s.badgeText}>4 AI Agents · 60s</Text>
                </View>
                <Text style={s.heroH1}>Validate Your</Text>
                <Text style={s.heroH2}>Startup Idea</Text>
                <Text style={s.heroSub}>Real data · Real insights · Free</Text>

                <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
                  <TouchableOpacity
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    onPress={() => router.push("/(tabs)/scan")}
                    activeOpacity={1}
                  >
                    <LinearGradient
                      colors={["#2563EB", "#4F46E5"]}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={[s.heroBtn, shadow.glow]}
                    >
                      <Text style={s.heroBtnText}>Start Analysis</Text>
                      <Ionicons name="arrow-forward" size={14} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              </View>
              <View style={s.heroBulb}>
                <GlowBulb />
              </View>
            </LinearGradient>
          </View>

          {/* Feature pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.pillsRow}
            style={{ marginBottom: 24 }}
          >
            {FEATURES.map((f) => (
              <View key={f.label} style={[s.pill, shadow.sm]}>
                <View style={[s.pillIcon, { backgroundColor: f.color + "18" }]}>
                  <Ionicons name={f.icon as any} size={15} color={f.color} />
                </View>
                <Text style={s.pillText}>{f.label}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Recent scans */}
          {history.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionRow}>
                <Text style={s.sectionTitle}>Recent Scans</Text>
                <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
                  <Text style={s.seeAll}>View all →</Text>
                </TouchableOpacity>
              </View>
              {history.slice(0, 3).map((entry) => {
                const vColor = verdictColors[entry.verdict as keyof typeof verdictColors] || colors.muted
                const vLight = verdictLight[entry.verdict as keyof typeof verdictLight] || "#F1F5F9"
                return (
                  <TouchableOpacity
                    key={entry.scan_id}
                    style={[s.histCard, shadow.sm]}
                    activeOpacity={0.8}
                    onPress={() => {
                      useScanStore.setState({ report: entry.report, ideaText: entry.idea_text, scanStatus: "complete" })
                      router.push("/report")
                    }}
                  >
                    <View style={[s.scoreChip, { backgroundColor: vLight }]}>
                      <Text style={[s.scoreNum, { color: vColor }]}>{entry.score}</Text>
                      <Text style={[s.scoreLabel, { color: vColor }]}>{entry.verdict}</Text>
                    </View>
                    <Text style={s.histIdea} numberOfLines={2}>{entry.idea_text}</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                  </TouchableOpacity>
                )
              })}
            </View>
          )}

          {/* Empty state CTA */}
          {history.length === 0 && (
            <View style={[s.emptyCard, shadow.sm]}>
              <LinearGradient colors={["#EFF6FF", "#EEF2FF"]} style={s.emptyIcon}>
                <Ionicons name="bulb-outline" size={28} color={colors.primary} />
              </LinearGradient>
              <Text style={s.emptyTitle}>No analyses yet</Text>
              <Text style={s.emptyText}>Run your first startup idea validation and see your results here.</Text>
            </View>
          )}

        </Animated.View>
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8FAFC" },

  orb1: {
    position: "absolute", width: 280, height: 280, borderRadius: 140,
    backgroundColor: "rgba(99,102,241,0.07)", top: -60, right: -80,
  },
  orb2: {
    position: "absolute", width: 220, height: 220, borderRadius: 110,
    backgroundColor: "rgba(37,99,235,0.06)", bottom: 180, left: -70,
  },

  // Header
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1, borderBottomColor: "#F1F5F9",
    shadowColor: "#1E293B", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 3,
    zIndex: 10,
  },
  logoText: { fontSize: 22, fontWeight: "800", color: "#0F172A", letterSpacing: -0.8 },
  logoSub:  { fontSize: 11, color: "#94A3B8", marginTop: 1, fontWeight: "500" },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  signInChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "rgba(99,102,241,0.2)",
  },
  signInText: { color: colors.primary, fontWeight: "700", fontSize: 13 },

  // Scroll
  scroll: { padding: 16 },
  greeting: { fontSize: 15, color: colors.textSub, fontWeight: "500", marginBottom: 14, marginLeft: 2 },

  // Hero card
  heroCard: { borderRadius: 24, overflow: "hidden", marginBottom: 20 },
  heroGrad: { padding: 22, flexDirection: "row", alignItems: "center" },
  heroLeft: { flex: 1, paddingRight: 8 },
  heroBulb: { width: 90, alignItems: "center" },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12,
    alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: "rgba(99,102,241,0.15)",
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  badgeText: { color: colors.primary, fontSize: 10, fontWeight: "700", letterSpacing: 0.3 },
  heroH1: { fontSize: 26, fontWeight: "800", color: "#0F172A", letterSpacing: -0.8 },
  heroH2: { fontSize: 26, fontWeight: "800", color: colors.primary, letterSpacing: -0.8, marginBottom: 8 },
  heroSub: { fontSize: 12, color: colors.textSub, marginBottom: 18 },
  heroBtn: {
    flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start",
    borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12,
  },
  heroBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  // Pills
  pillsRow: { gap: 8, paddingVertical: 2 },
  pill: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9,
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#F1F5F9",
  },
  pillIcon: { width: 26, height: 26, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  pillText: { color: colors.text, fontWeight: "600", fontSize: 12 },

  // Section
  section: { marginBottom: 8 },
  sectionRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#0F172A" },
  seeAll: { color: colors.primary, fontWeight: "600", fontSize: 13 },

  // History card
  histCard: {
    backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16,
    flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10,
  },
  scoreChip: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, alignItems: "center", minWidth: 52 },
  scoreNum: { fontSize: 20, fontWeight: "800" },
  scoreLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 0.4, marginTop: 1 },
  histIdea: { flex: 1, color: colors.textSub, fontSize: 13, lineHeight: 19 },

  // Empty
  emptyCard: {
    backgroundColor: "#FFFFFF", borderRadius: 20, padding: 28,
    alignItems: "center", gap: 10, marginTop: 8,
  },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: "#0F172A", fontWeight: "700", fontSize: 16 },
  emptyText: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: "center" },
})
