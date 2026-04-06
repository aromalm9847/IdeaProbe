import { useEffect, useRef, useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Alert, Linking } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useScanStore } from "../src/store/useScanStore"
import { colors, shadow, verdict as verdictColors, verdictLight, verdictShadow } from "../src/theme"
import { useEntrance } from "../src/hooks/useEntrance"
import { LiquidCard } from "../src/components/LiquidCard"
import { GlowText } from "../src/components/GlowText"
import { downloadReportPDF } from "../src/services/pdfService"

const WHATSAPP_NUMBER = "919035514817"
const WHATSAPP_MSG = encodeURIComponent("Hi, I just analyzed my startup idea on IdeaProbe and would like a business consultation.")

function AnimatedScore({ score }: { score: number }) {
  const anim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.5)).current
  const color = score >= 80 ? colors.green : score >= 62 ? colors.blue : score >= 42 ? colors.yellow : colors.red
  const glowShadow = score >= 80 ? shadow.glowGreen : score >= 62 ? shadow.glow : score >= 42 ? shadow.glowYellow : shadow.glowRed
  const bgColor = score >= 80 ? "#F0FDF4" : score >= 62 ? "#EFF6FF" : score >= 42 ? "#FFFBEB" : "#FEF2F2"

  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, { toValue: score, duration: 1400, useNativeDriver: false }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start()
  }, [score])

  return (
    <Animated.View style={[rs.outer, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[rs.circle, { backgroundColor: bgColor + "CC", borderColor: color + "60" }, glowShadow]}>
        <View style={[rs.innerGlow, { backgroundColor: color + "15" }]} />
        <Animated.Text style={[rs.num, { color }]}>
          {anim.interpolate({ inputRange: [0, score || 1], outputRange: ["0", String(score)] })}
        </Animated.Text>
        <Text style={[rs.max, { color }]}>/100</Text>
      </View>
    </Animated.View>
  )
}
const rs = StyleSheet.create({
  outer: { alignItems: "center", marginVertical: 8 },
  circle: { width: 130, height: 130, borderRadius: 65, borderWidth: 2.5, alignItems: "center", justifyContent: "center" },
  innerGlow: { position: "absolute", width: 90, height: 90, borderRadius: 45 },
  num: { fontSize: 52, fontWeight: "800", lineHeight: 58 },
  max: { fontSize: 15, fontWeight: "600", opacity: 0.6 },
})

export default function ReportScreen() {
  const router = useRouter()
  const { report, ideaText, resetScan } = useScanStore()
  const { opacity, translateY } = useEntrance(0)
  const [pdfLoading, setPdfLoading] = useState(false)

  if (!report) {
    return (
      <View style={s.empty}>
        <Ionicons name="document-outline" size={48} color={colors.muted} />
        <Text style={s.emptyTitle}>No report available</Text>
        <TouchableOpacity onPress={() => router.push("/scan")}>
          <LinearGradient colors={["#2563EB", "#4F46E5"]} style={[s.emptyBtn, shadow.glow]}>
            <Text style={s.emptyBtnText}>Start a New Scan</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    )
  }

  const vColor = verdictColors[report.verdict as keyof typeof verdictColors] || colors.muted
  const vLight = verdictLight[report.verdict as keyof typeof verdictLight] || colors.bg

  const handlePDF = async () => {
    setPdfLoading(true)
    try {
      await downloadReportPDF(ideaText, report)
    } catch (e) {
      Alert.alert("Error", "Could not generate PDF. Please try again.")
    } finally {
      setPdfLoading(false)
    }
  }

  const handleWhatsApp = () => {
    Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`)
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ opacity, transform: [{ translateY }] }}>

        {/* Score hero */}
        <LinearGradient colors={["#EFF6FF", "#F5F3FF", "#F8FAFC"]} style={s.hero}>
          <Text style={s.ideaPreview} numberOfLines={2}>{ideaText}</Text>
          <AnimatedScore score={report.score} />
          <View style={[s.verdictPill, { borderColor: vColor + "40", backgroundColor: vColor + "15" }]}>
            <View style={[s.verdictDot, { backgroundColor: vColor }]} />
            <Text style={[s.verdictText, { color: vColor }]}>{report.verdict}</Text>
          </View>
          {report.industry && <Text style={s.industryText}>{report.industry}</Text>}
        </LinearGradient>

        {/* Action buttons */}
        <View style={s.actionRow}>
          <TouchableOpacity style={[s.actionBtn, shadow.sm]} onPress={handlePDF} disabled={pdfLoading}>
            <LinearGradient colors={["#6366F1", "#4F46E5"]} style={s.actionGrad}>
              <Ionicons name={pdfLoading ? "hourglass-outline" : "download-outline"} size={18} color="#fff" />
              <Text style={s.actionText}>{pdfLoading ? "Generating..." : "Download PDF"}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionBtn, shadow.sm]} onPress={handleWhatsApp}>
            <LinearGradient colors={["#16A34A", "#15803D"]} style={s.actionGrad}>
              <Ionicons name="logo-whatsapp" size={18} color="#fff" />
              <Text style={s.actionText}>Get Consultation</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Risk */}
        {report.biggest_risk && (
          <View style={s.section}>
            <LiquidCard>
              <View style={{ padding: 16 }}>
                <View style={s.riskRow}>
                  <View style={s.riskIcon}>
                    <Ionicons name="warning-outline" size={18} color={colors.yellow} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.riskTitle}>Biggest Risk</Text>
                    <Text style={s.riskText}>{report.biggest_risk}</Text>
                  </View>
                </View>
              </View>
            </LiquidCard>
          </View>
        )}

        {/* Market */}
        {report.market && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>MARKET OPPORTUNITY</Text>
            <View style={s.marketRow}>
              {[
                { label: "TAM", value: report.market.tam_usd, color: "#7C3AED", grad: ["#F5F3FF", "#EDE9FE"] as [string, string] },
                { label: "SAM", value: report.market.sam_usd, color: "#2563EB", grad: ["#EFF6FF", "#DBEAFE"] as [string, string] },
                { label: "SOM", value: report.market.som_usd, color: "#16A34A", grad: ["#F0FDF4", "#DCFCE7"] as [string, string] },
              ].map((m) => (
                <TouchableOpacity key={m.label} style={s.marketCell}>
                  <LinearGradient colors={m.grad} style={[s.marketGrad, shadow.sm]}>
                    <Text style={[s.marketLabel, { color: m.color }]}>{m.label}</Text>
                    <Text style={[s.marketValue, { color: m.color }]}>{m.value || "—"}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* What's working */}
        {report.whats_working?.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>WHAT'S WORKING</Text>
            <LiquidCard>
              <View style={{ padding: 16 }}>
                {report.whats_working.map((item, i) => (
                  <View key={i} style={[s.checkRow, i < report.whats_working.length - 1 && { borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)", paddingBottom: 12, marginBottom: 12 }]}>
                    <View style={s.checkIcon}><Ionicons name="checkmark" size={13} color={colors.green} /></View>
                    <Text style={s.checkText}>{item}</Text>
                  </View>
                ))}
              </View>
            </LiquidCard>
          </View>
        )}

        {/* Competitors */}
        {report.competitors?.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>COMPETITORS ({report.competitors.length})</Text>
            {report.competitors.map((c, i) => (
              <LiquidCard key={i} style={{ marginBottom: 10 }}>
                <View style={{ padding: 16 }}>
                  <View style={s.compTop}>
                    <LinearGradient colors={["#EFF6FF", "#DBEAFE"]} style={s.compAvatar}>
                      <Text style={s.compAvatarText}>{c.name[0]}</Text>
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={s.compName}>{c.name}</Text>
                      <Text style={s.compPrice}>{c.pricing}</Text>
                    </View>
                  </View>
                  <Text style={s.fieldLabel}>Weakness</Text>
                  <Text style={s.fieldText}>{c.weakness}</Text>
                  <LinearGradient colors={["#EFF6FF", "#E0F2FE"]} style={s.edgeBox}>
                    <Text style={s.edgeLabel}>⚡ Your Edge</Text>
                    <Text style={s.edgeText}>{c.your_fix}</Text>
                  </LinearGradient>
                </View>
              </LiquidCard>
            ))}
          </View>
        )}

        {/* Trends */}
        {report.search_trends?.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>SEARCH TRENDS</Text>
            <LiquidCard>
              <View style={{ padding: 16 }}>
                {report.search_trends.map((t, i) => (
                  <View key={i} style={[s.trendRow, i < report.search_trends.length - 1 && { borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)", paddingBottom: 12, marginBottom: 12 }]}>
                    <View style={[s.trendIcon, { backgroundColor: t.is_rising ? "#F0FDF4" : "#FEF2F2" }]}>
                      <Ionicons name={t.is_rising ? "trending-up" : "trending-down"} size={15} color={t.is_rising ? colors.green : colors.red} />
                    </View>
                    <Text style={s.trendKw}>{t.keyword}</Text>
                    <View style={[s.trendBadge, { backgroundColor: t.is_rising ? "#F0FDF4" : "#FEF2F2" }]}>
                      <Text style={[s.trendDir, { color: t.is_rising ? colors.green : colors.red }]}>{t.trend_direction}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </LiquidCard>
          </View>
        )}

        {/* Playbook */}
        {report.fix_playbook?.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>ACTION PLAYBOOK</Text>
            <LiquidCard>
              <View style={{ padding: 16 }}>
                {report.fix_playbook.map((step, i) => (
                  <View key={i} style={[s.stepRow, i < report.fix_playbook.length - 1 && { marginBottom: 14 }]}>
                    <LinearGradient colors={["#2563EB", "#4F46E5"]} style={s.stepNum}>
                      <Text style={s.stepNumText}>{i + 1}</Text>
                    </LinearGradient>
                    <Text style={s.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            </LiquidCard>
          </View>
        )}

        {/* Innovation */}
        {(report.innovation?.ideas?.length ?? 0) > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>INNOVATION OPPORTUNITIES</Text>
            {report.innovation!.ideas.slice(0, 3).map((idea, i) => (
              <LiquidCard key={i} style={{ marginBottom: 10 }}>
                <View style={{ padding: 16 }}>
                  <View style={s.ideaTop}>
                    <Text style={s.ideaFeature}>{idea.feature}</Text>
                    <View style={s.ideaBadges}>
                      <View style={s.fBadge}><Text style={s.fBadgeText}>F {idea.feasibility}</Text></View>
                      <View style={s.iBadge}><Text style={s.iBadgeText}>I {idea.impact}</Text></View>
                    </View>
                  </View>
                  <Text style={s.ideaDesc}>{idea.description}</Text>
                  {idea.implementation_effort && (
                    <View style={s.effortRow}>
                      <Ionicons name="time-outline" size={12} color={colors.muted} />
                      <Text style={s.effortText}>{idea.implementation_effort} effort · {idea.time_to_build}</Text>
                    </View>
                  )}
                </View>
              </LiquidCard>
            ))}
          </View>
        )}

        {/* Deep research */}
        {report.deep_research?.executive_summary && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>MARKET RESEARCH</Text>
            <LiquidCard>
              <View style={{ padding: 16 }}>
                <Text style={s.researchText}>{report.deep_research.executive_summary}</Text>
              </View>
            </LiquidCard>
          </View>
        )}

        {/* WhatsApp consultation card */}
        <View style={s.section}>
          <TouchableOpacity onPress={handleWhatsApp} activeOpacity={0.9}>
            <LinearGradient colors={["#F0FDF4", "#DCFCE7"]} style={[s.waCard, shadow.sm]}>
              <View style={s.waIcon}>
                <Ionicons name="logo-whatsapp" size={24} color="#16A34A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.waTitle}>Talk to an Expert</Text>
                <Text style={s.waSub}>Get a personalized growth strategy for your idea</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#16A34A" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bottom actions */}
        <View style={s.section}>
          <TouchableOpacity onPress={handlePDF} disabled={pdfLoading}>
            <LinearGradient colors={["#6366F1", "#4F46E5"]} style={[s.bottomBtn, shadow.glow]}>
              <Ionicons name="download-outline" size={18} color="#fff" />
              <Text style={s.bottomBtnText}>{pdfLoading ? "Generating PDF..." : "Download Full Report PDF"}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={[s.newScanBtn, shadow.sm]} onPress={() => { resetScan(); router.replace("/scan") }}>
            <LinearGradient colors={["#2563EB", "#4F46E5"]} style={s.newScanGrad}>
              <Ionicons name="rocket-outline" size={18} color="#fff" />
              <Text style={s.bottomBtnText}>Analyze Another Idea</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={[s.histBtn, shadow.sm]} onPress={() => router.push("/history")}>
            <Text style={s.histBtnText}>View Scan History</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </Animated.View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20 },
  empty: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  emptyTitle: { color: colors.textSub, fontSize: 17, fontWeight: "600" },
  emptyBtn: { borderRadius: 16, paddingHorizontal: 24, paddingVertical: 14 },
  emptyBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  hero: { borderRadius: 24, padding: 24, marginTop: 8, alignItems: "center", gap: 12, marginBottom: 16 },
  ideaPreview: { color: colors.textSub, fontSize: 13, textAlign: "center", lineHeight: 19 },
  verdictPill: { flexDirection: "row", alignItems: "center", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, gap: 8, overflow: "hidden", borderWidth: 1 },
  verdictDot: { width: 8, height: 8, borderRadius: 4 },
  verdictText: { fontWeight: "700", fontSize: 14, letterSpacing: 0.5 },
  industryText: { color: colors.muted, fontSize: 12 },
  actionRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  actionBtn: { flex: 1, borderRadius: 14, overflow: "hidden" },
  actionGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 13, gap: 7 },
  actionText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  section: { marginBottom: 16 },
  sectionLabel: { color: colors.muted, fontSize: 10, fontWeight: "700", letterSpacing: 1.5, marginBottom: 10 },
  riskRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  riskIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#FEF9C3", alignItems: "center", justifyContent: "center" },
  riskTitle: { color: colors.yellow, fontWeight: "700", fontSize: 13, marginBottom: 3 },
  riskText: { color: "#78350F", fontSize: 13, lineHeight: 19 },
  marketRow: { flexDirection: "row", gap: 10 },
  marketCell: { flex: 1, borderRadius: 16, overflow: "hidden" },
  marketGrad: { borderRadius: 16, padding: 14, alignItems: "center" },
  marketLabel: { fontSize: 10, fontWeight: "700", marginBottom: 5 },
  marketValue: { fontSize: 14, fontWeight: "800", textAlign: "center" },
  checkRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#F0FDF4", alignItems: "center", justifyContent: "center", marginTop: 1 },
  checkText: { color: colors.textSub, fontSize: 13, flex: 1, lineHeight: 20 },
  compTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  compAvatar: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  compAvatarText: { color: colors.primary, fontWeight: "800", fontSize: 17 },
  compName: { color: colors.text, fontWeight: "700", fontSize: 15 },
  compPrice: { color: colors.muted, fontSize: 12, marginTop: 1 },
  fieldLabel: { color: colors.muted, fontSize: 10, fontWeight: "600", marginBottom: 3 },
  fieldText: { color: colors.textSub, fontSize: 13, lineHeight: 19, marginBottom: 12 },
  edgeBox: { borderRadius: 12, padding: 12 },
  edgeLabel: { color: colors.primary, fontSize: 11, fontWeight: "700", marginBottom: 3 },
  edgeText: { color: "#1E3A8A", fontSize: 13, lineHeight: 19 },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  trendIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  trendKw: { color: colors.text, fontSize: 13, fontWeight: "500", flex: 1 },
  trendBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  trendDir: { fontSize: 11, fontWeight: "600" },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  stepNum: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center", marginTop: 1 },
  stepNumText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  stepText: { color: colors.textSub, fontSize: 13, flex: 1, lineHeight: 20 },
  ideaTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8, gap: 8 },
  ideaFeature: { color: colors.text, fontWeight: "700", fontSize: 15, flex: 1 },
  ideaBadges: { flexDirection: "row", gap: 4 },
  fBadge: { backgroundColor: "#F0FDF4", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  fBadgeText: { color: colors.green, fontSize: 11, fontWeight: "600" },
  iBadge: { backgroundColor: "#EFF6FF", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  iBadgeText: { color: colors.blue, fontSize: 11, fontWeight: "600" },
  ideaDesc: { color: colors.textSub, fontSize: 13, lineHeight: 19 },
  effortRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 4 },
  effortText: { color: colors.muted, fontSize: 11 },
  researchText: { color: colors.textSub, fontSize: 13, lineHeight: 21 },
  waCard: { borderRadius: 18, padding: 16, flexDirection: "row", alignItems: "center", gap: 14 },
  waIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#DCFCE7", alignItems: "center", justifyContent: "center" },
  waTitle: { color: "#15803D", fontWeight: "700", fontSize: 14 },
  waSub: { color: "#166534", fontSize: 12, marginTop: 2 },
  bottomBtn: { borderRadius: 18, overflow: "hidden", marginBottom: 10 },
  newScanBtn: { borderRadius: 18, overflow: "hidden", marginBottom: 10 },
  newScanGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 17, gap: 10 },
  bottomBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  histBtn: { backgroundColor: colors.surface, borderRadius: 18, paddingVertical: 15, alignItems: "center" },
  histBtnText: { color: colors.textSub, fontWeight: "600", fontSize: 14 },
})
