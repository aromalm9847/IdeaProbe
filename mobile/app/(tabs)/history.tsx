import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useScanStore } from "../../src/store/useScanStore"
import { colors, shadow, verdict as verdictColors, verdictLight } from "../../src/theme"

export default function HistoryScreen() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const { history, clearHistory } = useScanStore()

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── FIXED HEADER ── */}
      <View style={[s.header, { paddingTop: insets.top + 4 }]}>
        <View>
          <Text style={s.headerTitle}>History</Text>
          <Text style={s.headerSub}>
            {history.length === 0 ? "No scans yet" : `${history.length} scan${history.length !== 1 ? "s" : ""}`}
          </Text>
        </View>
        {history.length > 0 && (
          <TouchableOpacity style={s.clearBtn} onPress={clearHistory} activeOpacity={0.75}>
            <Ionicons name="trash-outline" size={14} color={colors.red} />
            <Text style={s.clearText}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── CONTENT ── */}
      {history.length === 0 ? (
        <View style={s.empty}>
          <LinearGradient colors={["#EFF6FF", "#EEF2FF"]} style={s.emptyIcon}>
            <Ionicons name="time-outline" size={30} color={colors.primary} />
          </LinearGradient>
          <Text style={s.emptyTitle}>No scans yet</Text>
          <Text style={s.emptySub}>Your analysis history will appear here</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/scan")} activeOpacity={0.85}>
            <LinearGradient colors={["#2563EB", "#4F46E5"]} style={[s.emptyBtn, shadow.glow]}>
              <Ionicons name="rocket-outline" size={16} color="#fff" />
              <Text style={s.emptyBtnText}>Analyze an Idea</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[s.scroll, { paddingBottom: 120 }]}
        >
          {history.map((entry) => {
            const vColor = verdictColors[entry.verdict as keyof typeof verdictColors] || colors.muted
            const vLight = verdictLight[entry.verdict as keyof typeof verdictLight] || "#F1F5F9"
            return (
              <TouchableOpacity
                key={entry.scan_id}
                style={[s.card, shadow.sm]}
                activeOpacity={0.8}
                onPress={() => {
                  useScanStore.setState({ report: entry.report, ideaText: entry.idea_text, scanStatus: "complete" })
                  router.push("/report")
                }}
              >
                {/* Score + verdict */}
                <View style={s.cardTop}>
                  <View style={[s.scorePill, { backgroundColor: vLight }]}>
                    <Text style={[s.scoreNum, { color: vColor }]}>{entry.score}</Text>
                    <Text style={[s.scoreLabel, { color: vColor }]}>{entry.verdict}</Text>
                  </View>
                  <View style={s.cardMeta}>
                    <View style={s.dateRow}>
                      <Ionicons name="time-outline" size={11} color={colors.muted} />
                      <Text style={s.dateText}>
                        {new Date(entry.scanned_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={17} color={colors.dim} />
                  </View>
                </View>

                {/* Idea text */}
                <Text style={s.ideaText} numberOfLines={3}>{entry.idea_text}</Text>
              </TouchableOpacity>
            )
          })}

          {/* New scan CTA */}
          <TouchableOpacity onPress={() => router.push("/(tabs)/scan")} activeOpacity={0.85}>
            <LinearGradient
              colors={["#2563EB", "#4F46E5"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[s.newBtn, shadow.glow]}
            >
              <Ionicons name="add-circle-outline" size={19} color="#fff" />
              <Text style={s.newBtnText}>New Analysis</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  )
}

const s = StyleSheet.create({
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
  headerSub: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  clearBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#FEF2F2", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
  },
  clearText: { color: colors.red, fontSize: 12, fontWeight: "600" },

  // Empty
  empty: {
    flex: 1, alignItems: "center", justifyContent: "center",
    padding: 32, gap: 12,
  },
  emptyIcon: { width: 72, height: 72, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: "#0F172A", fontSize: 18, fontWeight: "700" },
  emptySub: { color: colors.muted, fontSize: 13, textAlign: "center" },
  emptyBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 16, paddingHorizontal: 24, paddingVertical: 13, marginTop: 6,
  },
  emptyBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  // Scroll
  scroll: { padding: 16 },

  // Card
  card: {
    backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, marginBottom: 12,
  },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  scorePill: { flexDirection: "row", alignItems: "center", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
  scoreNum: { fontSize: 22, fontWeight: "800" },
  scoreLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.4 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 10 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  dateText: { color: colors.muted, fontSize: 11 },
  ideaText: { color: "#475569", fontSize: 13, lineHeight: 20 },

  // New btn
  newBtn: {
    borderRadius: 18, flexDirection: "row", alignItems: "center",
    justifyContent: "center", paddingVertical: 17, gap: 9, marginTop: 4,
  },
  newBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
})
