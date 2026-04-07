import { useRef, useEffect } from "react"
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated, StatusBar } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useAuthStore } from "../../src/store/authStore"
import { useScanStore } from "../../src/store/useScanStore"
import { colors, shadow } from "../../src/theme"

interface MenuRowProps {
  icon: string
  label: string
  sub?: string
  color?: string
  onPress: () => void
  danger?: boolean
  value?: string
}

function MenuRow({ icon, label, sub, color, onPress, danger, value }: MenuRowProps) {
  const ic = danger ? colors.red : (color ?? colors.primary)
  return (
    <TouchableOpacity style={r.row} onPress={onPress} activeOpacity={0.75}>
      <View style={[r.iconWrap, { backgroundColor: ic + "14" }]}>
        <Ionicons name={icon as any} size={18} color={ic} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[r.rowLabel, danger && { color: colors.red }]}>{label}</Text>
        {sub && <Text style={r.rowSub}>{sub}</Text>}
      </View>
      {value
        ? <Text style={r.rowValue}>{value}</Text>
        : <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
      }
    </TouchableOpacity>
  )
}
const r = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingVertical: 14, paddingHorizontal: 18,
  },
  iconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontSize: 14, fontWeight: "600", color: "#0F172A" },
  rowSub: { fontSize: 12, color: "#94A3B8", marginTop: 1 },
  rowValue: { fontSize: 13, color: "#94A3B8", fontWeight: "500" },
})

function Section({ children }: { children: React.ReactNode }) {
  return <View style={a.section}>{children}</View>
}

export default function AccountScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { history, clearHistory } = useScanStore()

  const fade = useRef(new Animated.Value(0)).current
  const slide = useRef(new Animated.Value(16)).current
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, friction: 9, tension: 80, useNativeDriver: true }),
    ]).start()
  }, [])

  const initials = user?.full_name
    ? user.full_name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "G"

  return (
    <View style={a.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── FIXED HEADER ── */}
      <View style={[a.header, { paddingTop: insets.top + 4 }]}>
        <Text style={a.headerTitle}>Account</Text>
        {user && (
          <View style={a.verifiedChip}>
            <View style={a.verifiedDot} />
            <Text style={a.verifiedText}>Active</Text>
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[a.scroll, { paddingBottom: 120 }]}
      >
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>

          {/* Avatar card */}
          {user ? (
            <LinearGradient
              colors={["#1E3A8A", "#2563EB", "#4F46E5"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={[a.avatarCard, shadow.md]}
            >
              <View style={a.avatarInner}>
                <View style={a.avatarCircle}>
                  <Text style={a.avatarInitials}>{initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={a.avatarName}>{user.full_name}</Text>
                  <Text style={a.avatarEmail}>{user.email}</Text>
                </View>
                <View style={a.scanBadge}>
                  <Text style={a.scanBadgeNum}>{history.length}</Text>
                  <Text style={a.scanBadgeLabel}>Scans</Text>
                </View>
              </View>
              {/* Decorative highlight */}
              <View style={a.cardHighlight} />
            </LinearGradient>
          ) : (
            <View style={[a.guestCard, shadow.sm]}>
              <View style={a.guestAvatarWrap}>
                <LinearGradient colors={["#EFF6FF", "#EEF2FF"]} style={a.guestAvatar}>
                  <Ionicons name="person-outline" size={28} color={colors.primary} />
                </LinearGradient>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={a.guestTitle}>Guest User</Text>
                <Text style={a.guestSub}>Sign in to save your scans across devices</Text>
              </View>
            </View>
          )}

          {/* Stats row */}
          {user && (
            <View style={[a.statsRow, shadow.sm]}>
              <View style={a.statItem}>
                <Text style={a.statNum}>{history.length}</Text>
                <Text style={a.statLabel}>Total Scans</Text>
              </View>
              <View style={a.statDivider} />
              <View style={a.statItem}>
                <Text style={a.statNum}>
                  {history.filter(h => h.verdict === "VALIDATED" || h.verdict === "PROMISING").length}
                </Text>
                <Text style={a.statLabel}>Promising</Text>
              </View>
              <View style={a.statDivider} />
              <View style={a.statItem}>
                <Text style={a.statNum}>
                  {history.length > 0
                    ? Math.round(history.reduce((s, h) => s + (h.score ?? 0), 0) / history.length)
                    : 0}
                </Text>
                <Text style={a.statLabel}>Avg Score</Text>
              </View>
            </View>
          )}

          {/* Account menu */}
          {user ? (
            <>
              <Text style={a.groupLabel}>Account</Text>
              <Section>
                <MenuRow
                  icon="person-outline"
                  label="Profile"
                  sub={user.email}
                  onPress={() => {}}
                />
                <View style={a.rowDivider} />
                <MenuRow
                  icon="notifications-outline"
                  label="Notifications"
                  sub="Manage alerts"
                  color="#7C3AED"
                  onPress={() => {}}
                />
              </Section>

              <Text style={a.groupLabel}>Data</Text>
              <Section>
                <MenuRow
                  icon="time-outline"
                  label="Scan History"
                  sub={`${history.length} saved`}
                  color="#16A34A"
                  value={`${history.length}`}
                  onPress={() => router.push("/(tabs)/history")}
                />
                <View style={a.rowDivider} />
                <MenuRow
                  icon="trash-outline"
                  label="Clear History"
                  sub="Remove all local scans"
                  color="#D97706"
                  onPress={clearHistory}
                />
              </Section>

              <Text style={a.groupLabel}>Sign Out</Text>
              <Section>
                <MenuRow
                  icon="log-out-outline"
                  label="Sign Out"
                  sub={user.full_name}
                  onPress={logout}
                  danger
                />
              </Section>
            </>
          ) : (
            <>
              <Text style={a.groupLabel}>Get Started</Text>
              <Section>
                <MenuRow
                  icon="log-in-outline"
                  label="Sign In"
                  sub="Access your saved scans"
                  onPress={() => router.push("/auth")}
                />
                <View style={a.rowDivider} />
                <MenuRow
                  icon="person-add-outline"
                  label="Create Account"
                  sub="Free · No credit card needed"
                  color="#16A34A"
                  onPress={() => router.push("/auth")}
                />
              </Section>
            </>
          )}

          <Text style={a.groupLabel}>About</Text>
          <Section>
            <MenuRow
              icon="information-circle-outline"
              label="About IdeaProbe"
              sub="Version 1.0.0"
              color="#0891B2"
              onPress={() => {}}
            />
            <View style={a.rowDivider} />
            <MenuRow
              icon="shield-checkmark-outline"
              label="Privacy Policy"
              color="#6366F1"
              onPress={() => {}}
            />
          </Section>

          <Text style={a.footerText}>IdeaProbe · AI-powered startup validator</Text>
        </Animated.View>
      </ScrollView>
    </View>
  )
}

const a = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8FAFC" },

  // Header
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1, borderBottomColor: "#F1F5F9",
    shadowColor: "#1E293B", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 3,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#0F172A", letterSpacing: -0.5 },
  verifiedChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#F0FDF4", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  verifiedDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#16A34A" },
  verifiedText: { color: "#16A34A", fontSize: 12, fontWeight: "600" },

  // Scroll
  scroll: { padding: 16 },

  // Avatar card (logged in)
  avatarCard: {
    borderRadius: 22, padding: 20, marginBottom: 14, overflow: "hidden",
    shadowColor: "#2563EB", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 12,
  },
  avatarInner: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatarCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.35)",
  },
  avatarInitials: { color: "#fff", fontWeight: "800", fontSize: 20 },
  avatarName: { color: "#fff", fontWeight: "700", fontSize: 17 },
  avatarEmail: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 },
  scanBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)", borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  scanBadgeNum: { color: "#fff", fontWeight: "800", fontSize: 22 },
  scanBadgeLabel: { color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: "600", marginTop: 1 },
  cardHighlight: {
    position: "absolute", top: 8, left: 8, width: 80, height: 20,
    borderRadius: 12, backgroundColor: "rgba(255,255,255,0.14)",
    transform: [{ rotate: "-15deg" }],
  },

  // Guest card
  guestCard: {
    backgroundColor: "#FFFFFF", borderRadius: 22, padding: 20,
    flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14,
  },
  guestAvatarWrap: {},
  guestAvatar: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  guestTitle: { fontSize: 17, fontWeight: "700", color: "#0F172A" },
  guestSub: { fontSize: 12, color: "#94A3B8", marginTop: 3, lineHeight: 18 },

  // Stats
  statsRow: {
    backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16,
    flexDirection: "row", alignItems: "center", marginBottom: 20,
  },
  statItem: { flex: 1, alignItems: "center", gap: 3 },
  statNum: { fontSize: 26, fontWeight: "800", color: "#0F172A" },
  statLabel: { fontSize: 11, color: "#94A3B8", fontWeight: "500" },
  statDivider: { width: 1, height: 40, backgroundColor: "#F1F5F9" },

  // Group
  groupLabel: { fontSize: 11, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.8, marginBottom: 8, marginLeft: 4, textTransform: "uppercase" },
  section: {
    backgroundColor: "#FFFFFF", borderRadius: 18, marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#1E293B", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  rowDivider: { height: 1, backgroundColor: "#F8FAFC", marginHorizontal: 18 },

  // Footer
  footerText: { textAlign: "center", fontSize: 12, color: "#CBD5E1", marginTop: 8 },
})
