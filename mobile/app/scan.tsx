import { useState, useEffect, useRef } from "react"
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Animated,
} from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useScanStore } from "../src/store/useScanStore"
import { useAuthStore } from "../src/store/authStore"
import { colors, shadow } from "../src/theme"
import { useEntrance, usePressScale } from "../src/hooks/useEntrance"

const STEPS = ["Market Research", "Competitor Analysis", "Innovation Scoring", "Deep Research", "Finalizing Report"]

function ProgressStep({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  const pulse = useRef(new Animated.Value(1)).current
  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.15, duration: 700, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start()
    } else {
      pulse.stopAnimation()
      pulse.setValue(1)
    }
  }, [active])
  return (
    <View style={ps.row}>
      <Animated.View style={[ps.dot,
        done && ps.dotDone,
        active && ps.dotActive,
        active && { transform: [{ scale: pulse }] }
      ]}>
        {done
          ? <Ionicons name="checkmark" size={10} color="#fff" />
          : active
          ? <View style={ps.dotInner} />
          : null
        }
      </Animated.View>
      <Text style={[ps.label, done && ps.labelDone, active && ps.labelActive]}>{label}</Text>
    </View>
  )
}
const ps = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 12 },
  dot: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.dim, alignItems: "center", justifyContent: "center" },
  dotActive: { backgroundColor: colors.primary },
  dotDone: { backgroundColor: colors.green },
  dotInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  label: { fontSize: 13, color: colors.muted },
  labelActive: { color: colors.primary, fontWeight: "600" },
  labelDone: { color: colors.green, fontWeight: "500" },
})

export default function ScanScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { scanStatus, ideaText, error, report, submitScan, resetScan } = useScanStore()
  const [localIdea, setLocalIdea] = useState("")
  const [activeStep, setActiveStep] = useState(0)
  const { opacity, translateY } = useEntrance(0)
  const { scale, onPressIn, onPressOut } = usePressScale()

  // Always reset when entering scan screen so user can start fresh
  useEffect(() => {
    resetScan()
    setLocalIdea("")
  }, [])
  const focused = useRef(new Animated.Value(0)).current

  const isLoading = scanStatus === "pending" || scanStatus === "processing"

  // Cycle steps while loading
  useEffect(() => {
    if (!isLoading) { setActiveStep(0); return }
    const interval = setInterval(() => setActiveStep((s) => Math.min(s + 1, STEPS.length - 1)), 18000)
    return () => clearInterval(interval)
  }, [isLoading])

  const hasSubmitted = useRef(false)
  useEffect(() => {
    if (scanStatus === "complete" && report && hasSubmitted.current) {
      router.replace("/report")
    }
  }, [scanStatus, report])

  const onFocus = () => Animated.timing(focused, { toValue: 1, duration: 200, useNativeDriver: false }).start()
  const onBlur = () => Animated.timing(focused, { toValue: 0, duration: 200, useNativeDriver: false }).start()

  const borderColor = focused.interpolate({ inputRange: [0, 1], outputRange: [colors.border, colors.primary] })

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <Animated.View style={{ opacity, transform: [{ translateY }] }}>
          {/* Header card */}
          <LinearGradient colors={["#EFF6FF", "#F8FAFC"]} style={[s.headerCard, shadow.sm]}>
            <Text style={s.headerTitle}>What's your idea?</Text>
            <Text style={s.headerSub}>Be specific — the more detail you give, the more accurate your analysis will be.</Text>
          </LinearGradient>

          {/* Input */}
          <Animated.View style={[s.inputWrap, shadow.sm, { borderColor }]}>
            <TextInput
              style={s.input}
              placeholder="Describe your startup idea in detail. Include the problem, target market, and how you plan to solve it..."
              placeholderTextColor={colors.dim}
              value={localIdea}
              onChangeText={setLocalIdea}
              multiline
              editable={!isLoading}
              maxLength={2000}
              textAlignVertical="top"
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <View style={s.inputFooter}>
              <Text style={s.counter}>{localIdea.length}/2000 characters</Text>
              {localIdea.length > 0 && (
                <TouchableOpacity onPress={() => setLocalIdea("")}>
                  <Text style={s.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          {/* Error */}
          {scanStatus === "failed" && error && (
            <View style={[s.errorBox, shadow.sm]}>
              <View style={s.errorIcon}>
                <Ionicons name="warning-outline" size={20} color={colors.red} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.errorTitle}>Analysis Failed</Text>
                <Text style={s.errorMsg}>{error}</Text>
              </View>
            </View>
          )}

          {/* Loading progress */}
          {isLoading && (
            <View style={[s.progressCard, shadow.md]}>
              <View style={s.progressHeader}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={s.progressTitle}>Analyzing your idea...</Text>
              </View>
              <Text style={s.progressSub}>This typically takes 60–90 seconds</Text>
              <View style={s.divider} />
              {STEPS.map((step, i) => (
                <ProgressStep
                  key={step}
                  label={step}
                  active={i === activeStep && isLoading}
                  done={i < activeStep}
                />
              ))}
            </View>
          )}

          {/* CTA */}
          {!isLoading && (
            <Animated.View style={{ transform: [{ scale }] }}>
              <TouchableOpacity
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={() => {
                  if (!localIdea.trim()) return
                  hasSubmitted.current = true
                  submitScan(localIdea.trim(), user?.access_token)
                }}
                disabled={!localIdea.trim()}
                activeOpacity={1}
              >
                <LinearGradient
                  colors={localIdea.trim() ? ["#2563EB", "#4F46E5"] : ["#E2E8F0", "#E2E8F0"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[s.analyzeBtn, localIdea.trim() && shadow.glow]}
                >
                  <Ionicons name="rocket-outline" size={20} color={localIdea.trim() ? "#fff" : colors.muted} />
                  <Text style={[s.analyzeBtnText, !localIdea.trim() && { color: colors.muted }]}>
                    Analyze My Idea
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}

          {scanStatus !== "idle" && !isLoading && (
            <TouchableOpacity style={s.resetBtn} onPress={() => { resetScan(); setLocalIdea("") }}>
              <Text style={s.resetText}>← Start over</Text>
            </TouchableOpacity>
          )}

          {/* What you get */}
          {scanStatus === "idle" && (
            <View style={[s.featuresCard, shadow.sm]}>
              <Text style={s.featuresTitle}>What you'll receive</Text>
              <View style={s.featuresGrid}>
                {[
                  { icon: "speedometer-outline", label: "Viability Score", color: "#2563EB" },
                  { icon: "bar-chart-outline", label: "Market Sizing", color: "#7C3AED" },
                  { icon: "people-outline", label: "Competitor Map", color: "#D97706" },
                  { icon: "bulb-outline", label: "Innovation Ideas", color: "#16A34A" },
                  { icon: "earth-outline", label: "Regional Analysis", color: "#0891B2" },
                  { icon: "list-outline", label: "Action Playbook", color: "#DC2626" },
                ].map((f) => (
                  <View key={f.label} style={s.featureItem}>
                    <View style={[s.featureIcon, { backgroundColor: f.color + "15" }]}>
                      <Ionicons name={f.icon as any} size={18} color={f.color} />
                    </View>
                    <Text style={s.featureLabel}>{f.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20 },
  headerCard: { borderRadius: 20, padding: 20, marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: 6 },
  headerSub: { fontSize: 14, color: colors.textSub, lineHeight: 21 },
  inputWrap: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1.5, overflow: "hidden", marginBottom: 16 },
  input: { padding: 18, fontSize: 15, color: colors.text, minHeight: 160, lineHeight: 23 },
  inputFooter: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 18, paddingBottom: 12 },
  counter: { color: colors.muted, fontSize: 12 },
  clearText: { color: colors.primary, fontSize: 12, fontWeight: "600" },
  errorBox: { backgroundColor: "#FEF2F2", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "flex-start", marginBottom: 16, gap: 12 },
  errorIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center" },
  errorTitle: { color: colors.red, fontWeight: "700", fontSize: 14, marginBottom: 2 },
  errorMsg: { color: "#7F1D1D", fontSize: 13, lineHeight: 19 },
  progressCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, marginBottom: 16 },
  progressHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  progressTitle: { color: colors.text, fontWeight: "700", fontSize: 16 },
  progressSub: { color: colors.muted, fontSize: 12, marginBottom: 16 },
  divider: { height: 1, backgroundColor: colors.borderLight, marginBottom: 16 },
  analyzeBtn: { borderRadius: 18, paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 },
  analyzeBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  resetBtn: { alignItems: "center", paddingVertical: 10 },
  resetText: { color: colors.muted, fontSize: 14 },
  featuresCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, marginTop: 8 },
  featuresTitle: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 16 },
  featuresGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  featureItem: { width: "46%", flexDirection: "row", alignItems: "center", gap: 10 },
  featureIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  featureLabel: { color: colors.textSub, fontSize: 13, fontWeight: "500", flex: 1 },
})
