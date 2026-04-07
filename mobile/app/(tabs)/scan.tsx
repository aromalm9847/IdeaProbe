import { useState, useEffect, useRef } from "react"
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet,
  Animated, StatusBar,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useScanStore } from "../../src/store/useScanStore"
import { useAuthStore } from "../../src/store/authStore"
import { colors, shadow } from "../../src/theme"
import { usePressScale } from "../../src/hooks/useEntrance"

const STEPS = [
  { label: "Market Research",    icon: "trending-up-outline"  },
  { label: "Competitor Analysis", icon: "people-outline"       },
  { label: "Innovation Scoring", icon: "bulb-outline"          },
  { label: "Deep Research",      icon: "earth-outline"         },
  { label: "Finalizing Report",  icon: "checkmark-done-outline"},
]

function StepRow({ step, active, done }: { step: typeof STEPS[0]; active: boolean; done: boolean }) {
  const pulse = useRef(new Animated.Value(1)).current
  useEffect(() => {
    if (active) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulse, { toValue: 1.2, duration: 650, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,   duration: 650, useNativeDriver: true }),
      ])).start()
    } else {
      pulse.stopAnimation(); pulse.setValue(1)
    }
  }, [active])

  const bg = done ? "#DCFCE7" : active ? "#EFF6FF" : "#F8FAFC"
  const dotBg = done ? colors.green : active ? colors.primary : "#CBD5E1"
  const labelColor = done ? colors.green : active ? colors.primary : colors.muted

  return (
    <View style={ps.row}>
      <Animated.View style={[ps.dot, { backgroundColor: dotBg }, active && { transform: [{ scale: pulse }] }]}>
        {done
          ? <Ionicons name="checkmark" size={11} color="#fff" />
          : active
          ? <View style={ps.dotInner} />
          : <Ionicons name={step.icon as any} size={10} color="#fff" />
        }
      </Animated.View>
      <View style={[ps.textWrap, { backgroundColor: bg }]}>
        <Text style={[ps.label, { color: labelColor }]}>{step.label}</Text>
        {active && <Text style={ps.activeSub}>In progress…</Text>}
        {done   && <Text style={[ps.activeSub, { color: colors.green }]}>Complete</Text>}
      </View>
    </View>
  )
}
const ps = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 12 },
  dot: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  dotInner: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#fff" },
  textWrap: { flex: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9 },
  label: { fontSize: 13, fontWeight: "600" },
  activeSub: { fontSize: 11, color: colors.primary, marginTop: 2 },
})

export default function ScanScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user } = useAuthStore()
  const { scanStatus, error, report, submitScan, resetScan } = useScanStore()
  const [localIdea, setLocalIdea] = useState("")
  const [activeStep, setActiveStep] = useState(0)
  const { scale, onPressIn, onPressOut } = usePressScale()
  const focused = useRef(new Animated.Value(0)).current
  const hasSubmitted = useRef(false)

  useEffect(() => { resetScan(); setLocalIdea("") }, [])

  const isLoading = scanStatus === "pending" || scanStatus === "processing"

  useEffect(() => {
    if (!isLoading) { setActiveStep(0); return }
    const iv = setInterval(() => setActiveStep(s => Math.min(s + 1, STEPS.length - 1)), 18000)
    return () => clearInterval(iv)
  }, [isLoading])

  useEffect(() => {
    if (scanStatus === "complete" && report && hasSubmitted.current) {
      router.push("/report")
    }
  }, [scanStatus, report])

  const borderColor = focused.interpolate({ inputRange: [0, 1], outputRange: ["#E2E8F0", colors.primary] })
  const onFocus = () => Animated.timing(focused, { toValue: 1, duration: 200, useNativeDriver: false }).start()
  const onBlur  = () => Animated.timing(focused, { toValue: 0, duration: 200, useNativeDriver: false }).start()

  const canSubmit = localIdea.trim().length > 0 && !isLoading

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── FIXED HEADER ── */}
      <View style={[s.header, { paddingTop: insets.top + 4 }]}>
        <View>
          <Text style={s.headerTitle}>New Analysis</Text>
          <Text style={s.headerSub}>Describe your startup idea</Text>
        </View>
        {isLoading && (
          <View style={s.loadingChip}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={s.loadingChipText}>Analyzing…</Text>
          </View>
        )}
      </View>

      {/* ── CONTENT ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[s.scroll, { paddingBottom: 120 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* Input card */}
          <View style={[s.inputCard, shadow.sm]}>
            <Text style={s.inputLabel}>Your Idea</Text>
            <Animated.View style={[s.inputBorder, { borderColor }]}>
              <TextInput
                style={s.input}
                placeholder={"Describe the problem you're solving, your target market, and your solution...\n\nExample: An app that helps freelancers track unpaid invoices and automate payment reminders."}
                placeholderTextColor="#CBD5E1"
                value={localIdea}
                onChangeText={setLocalIdea}
                multiline
                editable={!isLoading}
                maxLength={2000}
                textAlignVertical="top"
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </Animated.View>
            <View style={s.inputMeta}>
              <Text style={s.charCount}>{localIdea.length}/2000</Text>
              {localIdea.length > 0 && !isLoading && (
                <TouchableOpacity onPress={() => setLocalIdea("")}>
                  <Text style={s.clearBtn}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Error */}
          {scanStatus === "failed" && error && (
            <View style={[s.errorBox, shadow.sm]}>
              <View style={s.errorIcon}>
                <Ionicons name="warning-outline" size={18} color={colors.red} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.errorTitle}>Analysis Failed</Text>
                <Text style={s.errorMsg}>{error}</Text>
              </View>
            </View>
          )}

          {/* Loading steps */}
          {isLoading && (
            <View style={[s.stepsCard, shadow.md]}>
              <View style={s.stepsHeader}>
                <LinearGradient colors={["#EFF6FF", "#EEF2FF"]} style={s.stepsIconWrap}>
                  <Ionicons name="analytics-outline" size={18} color={colors.primary} />
                </LinearGradient>
                <View>
                  <Text style={s.stepsTitle}>Analyzing your idea</Text>
                  <Text style={s.stepsSub}>60–90 seconds · 4 AI agents</Text>
                </View>
              </View>
              <View style={s.stepsDivider} />
              {STEPS.map((step, i) => (
                <StepRow
                  key={step.label}
                  step={step}
                  active={i === activeStep && isLoading}
                  done={i < activeStep}
                />
              ))}
            </View>
          )}

          {/* Analyze button */}
          {!isLoading && (
            <Animated.View style={{ transform: [{ scale }] }}>
              <TouchableOpacity
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={() => {
                  if (!canSubmit) return
                  hasSubmitted.current = true
                  submitScan(localIdea.trim(), user?.access_token)
                }}
                disabled={!canSubmit}
                activeOpacity={1}
              >
                <LinearGradient
                  colors={canSubmit ? ["#2563EB", "#4F46E5"] : ["#E2E8F0", "#E2E8F0"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[s.analyzeBtn, canSubmit && shadow.glow]}
                >
                  <Ionicons name="rocket" size={19} color={canSubmit ? "#fff" : colors.muted} />
                  <Text style={[s.analyzeBtnText, !canSubmit && { color: colors.muted }]}>
                    Analyze My Idea
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}

          {scanStatus !== "idle" && !isLoading && (
            <TouchableOpacity style={s.resetRow} onPress={() => { resetScan(); setLocalIdea("") }}>
              <Ionicons name="refresh-outline" size={14} color={colors.muted} />
              <Text style={s.resetText}>Start over</Text>
            </TouchableOpacity>
          )}

          {/* What you get */}
          {scanStatus === "idle" && (
            <View style={[s.featCard, shadow.sm]}>
              <Text style={s.featTitle}>What you'll receive</Text>
              <View style={s.featGrid}>
                {[
                  { icon: "speedometer-outline", label: "Viability Score", color: "#2563EB" },
                  { icon: "bar-chart-outline",   label: "Market Sizing",   color: "#7C3AED" },
                  { icon: "people-outline",      label: "Competitor Map",  color: "#D97706" },
                  { icon: "bulb-outline",        label: "Innovation Ideas",color: "#16A34A" },
                  { icon: "earth-outline",       label: "Regional Analysis",color: "#0891B2"},
                  { icon: "list-outline",        label: "Action Playbook", color: "#DC2626" },
                ].map((f) => (
                  <View key={f.label} style={s.featItem}>
                    <View style={[s.featIcon, { backgroundColor: f.color + "15" }]}>
                      <Ionicons name={f.icon as any} size={16} color={f.color} />
                    </View>
                    <Text style={s.featLabel}>{f.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  loadingChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#EFF6FF", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
  },
  loadingChipText: { color: colors.primary, fontWeight: "600", fontSize: 12 },

  // Scroll
  scroll: { padding: 16 },

  // Input
  inputCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: "700", color: "#475569", marginBottom: 10 },
  inputBorder: { borderWidth: 1.5, borderRadius: 16, overflow: "hidden" },
  input: { padding: 16, fontSize: 14, color: "#0F172A", minHeight: 160, lineHeight: 22 },
  inputMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, paddingHorizontal: 2 },
  charCount: { color: "#94A3B8", fontSize: 12 },
  clearBtn: { color: colors.primary, fontSize: 12, fontWeight: "600" },

  // Error
  errorBox: {
    backgroundColor: "#FEF2F2", borderRadius: 16, padding: 14,
    flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 14,
  },
  errorIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center" },
  errorTitle: { color: colors.red, fontWeight: "700", fontSize: 13, marginBottom: 2 },
  errorMsg: { color: "#7F1D1D", fontSize: 12, lineHeight: 18 },

  // Steps
  stepsCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 18, marginBottom: 14 },
  stepsHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  stepsIconWrap: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  stepsTitle: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  stepsSub: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  stepsDivider: { height: 1, backgroundColor: "#F1F5F9", marginBottom: 14 },

  // Button
  analyzeBtn: {
    borderRadius: 18, paddingVertical: 18,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, marginBottom: 12,
  },
  analyzeBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  resetRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 10, marginBottom: 8,
  },
  resetText: { color: "#94A3B8", fontSize: 13 },

  // Features
  featCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 18, marginTop: 4 },
  featTitle: { fontSize: 14, fontWeight: "700", color: "#0F172A", marginBottom: 14 },
  featGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  featItem: { width: "46%", flexDirection: "row", alignItems: "center", gap: 10 },
  featIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  featLabel: { color: "#475569", fontSize: 12, fontWeight: "500", flex: 1 },
})
