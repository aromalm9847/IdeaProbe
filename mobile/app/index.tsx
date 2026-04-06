import { useRef, useEffect } from "react"
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated, Dimensions } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useAuthStore } from "../src/store/authStore"
import { useScanStore } from "../src/store/useScanStore"
import { colors, shadow, verdict as verdictColors, verdictLight } from "../src/theme"
import { useEntrance, usePressScale } from "../src/hooks/useEntrance"
import { GlowBulb } from "../src/components/GlowBulb"
import { GlowText } from "../src/components/GlowText"
import { LiquidCard } from "../src/components/LiquidCard"

const { width } = Dimensions.get("window")

function GlowButton({ onPress, children }: { onPress: () => void; children: React.ReactNode }) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.95)
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  )
}

const FEATURES = [
  { icon: "trending-up-outline", label: "Market Trends", color: "#2563EB" },
  { icon: "people-outline", label: "Competitors", color: "#7C3AED" },
  { icon: "bulb-outline", label: "Innovation", color: "#D97706" },
  { icon: "earth-outline", label: "Deep Research", color: "#16A34A" },
]

export default function HomeScreen() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { history } = useScanStore()
  const { opacity, translateY } = useEntrance(0)

  // Background orb animations
  const orb1 = useRef(new Animated.Value(0)).current
  const orb2 = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(orb1, { toValue: 1, duration: 4000, useNativeDriver: true }),
      Animated.timing(orb1, { toValue: 0, duration: 4000, useNativeDriver: true }),
    ])).start()
    Animated.loop(Animated.sequence([
      Animated.delay(2000),
      Animated.timing(orb2, { toValue: 1, duration: 3500, useNativeDriver: true }),
      Animated.timing(orb2, { toValue: 0, duration: 3500, useNativeDriver: true }),
    ])).start()
  }, [])

  const orb1Y = orb1.interpolate({ inputRange: [0, 1], outputRange: [0, -20] })
  const orb2Y = orb2.interpolate({ inputRange: [0, 1], outputRange: [0, 15] })

  return (
    <View style={s.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={["#EEF2FF", "#F0F9FF", "#F8FAFC"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating orbs */}
      <Animated.View style={[s.orb1, { transform: [{ translateY: orb1Y }] }]} />
      <Animated.View style={[s.orb2, { transform: [{ translateY: orb2Y }] }]} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <Animated.View style={[s.nav, { opacity, transform: [{ translateY }] }]}>
          <View>
            <GlowText
              text="IdeaProbe"
              style={s.logo}
            />
            <Text style={s.logoTag}>AI Startup Validator</Text>
          </View>
          {user ? (
            <TouchableOpacity onPress={() => router.push("/history")}>
              <LinearGradient colors={["#2563EB", "#6366F1"]} style={[s.avatar, shadow.glow]}>
                <Text style={s.avatarText}>{user.full_name?.[0]?.toUpperCase() || "U"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => router.push("/auth")}>
              <View style={s.signInChip}>
                <Text style={s.signInText}>Sign In</Text>
              </View>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Hero section */}
        <Animated.View style={[s.heroSection, { opacity, transform: [{ translateY }] }]}>
          {/* Glowing bulb */}
          <View style={s.bulbWrap}>
            <GlowBulb />
          </View>

          {/* Badge */}
          <View style={s.badge}>
            <View style={s.badgeDot} />
            <Text style={s.badgeText}>4 AI Agents · 40+ Sources · 60s</Text>
          </View>

          {/* Title with glow */}
          <GlowText text="Validate Your" style={s.heroLine1} />
          <GlowText text="Startup Idea" style={s.heroLine2} />

          <Text style={s.heroSub}>
            Get a detailed score, market analysis, competitors,{"\n"}and actionable insights — free.
          </Text>

          {/* CTA */}
          <GlowButton onPress={() => router.push("/scan")}>
            <LinearGradient
              colors={["#2563EB", "#4F46E5", "#7C3AED"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[s.ctaBtn, shadow.glow]}
            >
              <Ionicons name="rocket-outline" size={20} color="#fff" />
              <Text style={s.ctaText}>Start Free Analysis</Text>
              <View style={s.ctaArrow}>
                <Ionicons name="arrow-forward" size={15} color="#fff" />
              </View>
            </LinearGradient>
          </GlowButton>
        </Animated.View>

        {/* Feature pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pillScroll} contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}>
          {FEATURES.map((f) => (
            <View key={f.label} style={[s.pill, shadow.sm]}>
              <View style={[s.pillIcon, { backgroundColor: f.color + "18" }]}>
                <Ionicons name={f.icon as any} size={16} color={f.color} />
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
              <TouchableOpacity onPress={() => router.push("/history")}>
                <Text style={s.seeAll}>View all →</Text>
              </TouchableOpacity>
            </View>
            {history.slice(0, 3).map((entry, i) => {
              const vColor = verdictColors[entry.verdict as keyof typeof verdictColors] || colors.muted
              const vLight = verdictLight[entry.verdict as keyof typeof verdictLight] || "#F1F5F9"
              return (
                <TouchableOpacity
                  key={entry.scan_id}
                  activeOpacity={0.8}
                  onPress={() => {
                    useScanStore.setState({ report: entry.report, ideaText: entry.idea_text, scanStatus: "complete" })
                    router.push("/report")
                  }}
                >
                  <LiquidCard style={{ marginBottom: 10 }}>
                    <View style={s.histInner}>
                      <Text style={s.histIdea} numberOfLines={2}>{entry.idea_text}</Text>
                      <View style={[s.scorePill, { backgroundColor: vLight }]}>
                        <Text style={[s.scoreNum, { color: vColor }]}>{entry.score}</Text>
                        <Text style={[s.scoreVerdict, { color: vColor }]}>{entry.verdict}</Text>
                      </View>
                    </View>
                  </LiquidCard>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {/* Quick links */}
        <View style={s.section}>
          {!user && (
            <TouchableOpacity onPress={() => router.push("/auth")}>
              <LiquidCard style={{ marginBottom: 10 }}>
                <View style={s.linkInner}>
                  <View style={[s.linkIcon, { backgroundColor: "#EFF6FF" }]}>
                    <Ionicons name="person-add-outline" size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.linkTitle}>Create Account</Text>
                    <Text style={s.linkSub}>Save your history across devices</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                </View>
              </LiquidCard>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => router.push("/history")}>
            <LiquidCard style={{ marginBottom: 10 }}>
              <View style={s.linkInner}>
                <View style={[s.linkIcon, { backgroundColor: "#F0FDF4" }]}>
                  <Ionicons name="time-outline" size={18} color={colors.green} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.linkTitle}>Scan History</Text>
                  <Text style={s.linkSub}>{history.length} scan{history.length !== 1 ? "s" : ""} stored</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </View>
            </LiquidCard>
          </TouchableOpacity>
          {user && (
            <TouchableOpacity onPress={logout}>
              <LiquidCard>
                <View style={s.linkInner}>
                  <View style={[s.linkIcon, { backgroundColor: "#FEF2F2" }]}>
                    <Ionicons name="log-out-outline" size={18} color={colors.red} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.linkTitle}>Sign out</Text>
                    <Text style={s.linkSub}>{user.full_name}</Text>
                  </View>
                </View>
              </LiquidCard>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Floating action button */}
      <View style={s.fab}>
        <GlowButton onPress={() => router.push("/scan")}>
          <LinearGradient colors={["#2563EB", "#4F46E5"]} style={[s.fabBtn, shadow.glow]}>
            <Ionicons name="add" size={28} color="#fff" />
          </LinearGradient>
        </GlowButton>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  orb1: {
    position: "absolute", width: 300, height: 300, borderRadius: 150,
    backgroundColor: "rgba(99,102,241,0.08)",
    top: -80, right: -80,
    shadowColor: "#6366F1", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 60,
  },
  orb2: {
    position: "absolute", width: 250, height: 250, borderRadius: 125,
    backgroundColor: "rgba(37,99,235,0.07)",
    bottom: 200, left: -80,
    shadowColor: "#2563EB", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 50,
  },
  nav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 56, marginBottom: 8 },
  logo: { fontSize: 28, fontWeight: "800", color: colors.text, letterSpacing: -0.5 },
  logoTag: { fontSize: 12, color: colors.muted, marginTop: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  signInChip: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9, backgroundColor: "rgba(239,246,255,0.95)", borderWidth: 1, borderColor: "rgba(99,102,241,0.2)" },
  signInText: { color: colors.primary, fontWeight: "700", fontSize: 13 },
  heroSection: { alignItems: "center", paddingHorizontal: 24, paddingVertical: 16 },
  bulbWrap: { marginBottom: 20 },
  badge: { flexDirection: "row", alignItems: "center", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: "rgba(239,246,255,0.95)", marginBottom: 16, borderWidth: 1, borderColor: "rgba(99,102,241,0.2)", gap: 8 },
  badgeDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.primary },
  badgeText: { color: colors.primary, fontSize: 12, fontWeight: "600" },
  heroLine1: { fontSize: 36, fontWeight: "800", color: colors.text, letterSpacing: -1, textAlign: "center" },
  heroLine2: { fontSize: 36, fontWeight: "800", color: colors.primary, letterSpacing: -1, textAlign: "center", marginBottom: 14 },
  heroSub: { fontSize: 14, color: colors.textSub, lineHeight: 22, textAlign: "center", marginBottom: 28 },
  ctaBtn: { flexDirection: "row", alignItems: "center", borderRadius: 18, paddingVertical: 17, paddingHorizontal: 28, gap: 10 },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  ctaArrow: { width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center" },
  pillScroll: { marginBottom: 12 },
  pill: { flexDirection: "row", alignItems: "center", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 11, backgroundColor: "rgba(255,255,255,0.92)", borderWidth: 1, borderColor: "rgba(255,255,255,0.95)", gap: 8 },
  pillIcon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  pillText: { color: colors.text, fontWeight: "600", fontSize: 13 },
  section: { paddingHorizontal: 20, marginBottom: 8, marginTop: 8 },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  seeAll: { color: colors.primary, fontWeight: "600", fontSize: 13 },
  histInner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  histIdea: { color: colors.textSub, fontSize: 13, flex: 1, lineHeight: 19 },
  scorePill: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, alignItems: "center" },
  scoreNum: { fontSize: 22, fontWeight: "800" },
  scoreVerdict: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  linkInner: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  linkIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  linkTitle: { color: colors.text, fontWeight: "600", fontSize: 14 },
  linkSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  fab: { position: "absolute", bottom: 28, right: 24 },
  fabBtn: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center" },
})
