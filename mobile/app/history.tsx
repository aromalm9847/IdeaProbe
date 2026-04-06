import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useScanStore } from "../src/store/useScanStore"
import { colors, shadow, verdict as verdictColors, verdictLight } from "../src/theme"
import { useEntrance } from "../src/hooks/useEntrance"

export default function HistoryScreen() {
  const router = useRouter()
  const { history, clearHistory } = useScanStore()
  const { opacity, translateY } = useEntrance(0)

  if (history.length === 0) {
    return (
      <View style={s.empty}>
        <LinearGradient colors={["#EFF6FF", "#F5F3FF"]} style={s.emptyIcon}>
          <Ionicons name="time-outline" size={32} color={colors.primary} />
        </LinearGradient>
        <Text style={s.emptyTitle}>No scans yet</Text>
        <Text style={s.emptySub}>Your analysis history will appear here</Text>
        <TouchableOpacity onPress={() => router.push("/scan")}>
          <LinearGradient colors={["#2563EB", "#4F46E5"]} style={[s.emptyBtn, shadow.glow]}>
            <Text style={s.emptyBtnText}>Analyze an Idea</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ opacity, transform: [{ translateY }] }}>
        <View style={s.topRow}>
          <Text style={s.count}>{history.length} scan{history.length !== 1 ? "s" : ""}</Text>
          <TouchableOpacity style={s.clearBtn} onPress={clearHistory}>
            <Ionicons name="trash-outline" size={14} color={colors.red} />
            <Text style={s.clearText}>Clear all</Text>
          </TouchableOpacity>
        </View>

        {history.map((entry, i) => {
          const vColor = verdictColors[entry.verdict as keyof typeof verdictColors] || colors.muted
          const vLight = verdictLight[entry.verdict as keyof typeof verdictLight] || colors.bg
          return (
            <Animated.View key={entry.scan_id}>
              <TouchableOpacity
                style={[s.card, shadow.sm]}
                activeOpacity={0.8}
                onPress={() => {
                  useScanStore.setState({ report: entry.report, ideaText: entry.idea_text, scanStatus: "complete" })
                  router.push("/report")
                }}
              >
                <View style={s.cardTop}>
                  <View style={[s.scorePill, { backgroundColor: vLight }]}>
                    <Text style={[s.scoreNum, { color: vColor }]}>{entry.score}</Text>
                    <Text style={[s.scoreLabel, { color: vColor }]}>{entry.verdict}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                </View>
                <Text style={s.ideaText} numberOfLines={3}>{entry.idea_text}</Text>
                <View style={s.cardFooter}>
                  <Ionicons name="time-outline" size={12} color={colors.muted} />
                  <Text style={s.dateText}>
                    {new Date(entry.scanned_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )
        })}

        <TouchableOpacity onPress={() => router.push("/scan")}>
          <LinearGradient colors={["#2563EB", "#4F46E5"]} style={[s.newBtn, shadow.glow]}>
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={s.newBtnText}>New Analysis</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20 },
  empty: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", padding: 32, gap: 14 },
  emptyIcon: { width: 72, height: 72, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: colors.text, fontSize: 20, fontWeight: "700" },
  emptySub: { color: colors.muted, fontSize: 14 },
  emptyBtn: { borderRadius: 16, paddingHorizontal: 28, paddingVertical: 14, marginTop: 4 },
  emptyBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  count: { color: colors.text, fontSize: 18, fontWeight: "700" },
  clearBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#FEF2F2", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  clearText: { color: colors.red, fontSize: 13, fontWeight: "600" },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 18, marginBottom: 12 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  scorePill: { flexDirection: "row", alignItems: "center", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
  scoreNum: { fontSize: 24, fontWeight: "800" },
  scoreLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  ideaText: { color: colors.textSub, fontSize: 13, lineHeight: 20, marginBottom: 12 },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 5 },
  dateText: { color: colors.muted, fontSize: 12 },
  newBtn: { borderRadius: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 18, gap: 10, marginTop: 4 },
  newBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
})
