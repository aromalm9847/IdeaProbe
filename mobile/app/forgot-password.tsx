import { useState } from "react"
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native"
import { useRouter, Stack } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useAuthStore } from "../src/store/authStore"
import { sendOtp, resetPassword } from "../src/api/client"
import { colors, shadow } from "../src/theme"

type Step = "request" | "reset"

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const { setUser } = useAuthStore()

  const [step, setStep] = useState<Step>("request")
  const [identifier, setIdentifier] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [devCode, setDevCode] = useState("")

  const handleSendOtp = async () => {
    setError(""); setInfo("")
    if (!identifier.trim()) { setError("Enter your email or phone."); return }
    setLoading(true)
    try {
      const res = await sendOtp(identifier.trim(), "forgot_password")
      const dev = (res.data as { dev_code?: string }).dev_code
      if (dev) {
        setDevCode(dev)
        setInfo("Dev mode — no email configured. Use the code below.")
      } else {
        setInfo("OTP sent. Check your email or phone.")
      }
      setStep("reset")
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Could not send OTP. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    setError("")
    if (code.length !== 6) { setError("Enter the 6-digit code."); return }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return }
    setLoading(true)
    try {
      const res = await resetPassword(identifier.trim(), code, newPassword)
      setUser(res.data)
      router.replace("/(tabs)")
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Reset failed. Check the code and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: "Reset Password", headerShown: true }} />
      <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <LinearGradient colors={["#EFF6FF", "#F5F3FF", "#FFFFFF"]} style={StyleSheet.absoluteFill} />

        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={s.header}>
            <View style={[s.iconBubble, shadow.glow]}>
              <Ionicons name="lock-open-outline" size={28} color="#fff" />
            </View>
            <Text style={s.title}>
              {step === "request" ? "Reset your password" : "Enter the code"}
            </Text>
            <Text style={s.subtitle}>
              {step === "request"
                ? "Enter your email or phone to receive a 6-digit code."
                : `Sent to ${identifier}. Code expires in 10 minutes.`}
            </Text>
          </View>

          <View style={[s.card, shadow.md]}>
            {step === "request" ? (
              <View style={s.fieldWrap}>
                <Text style={s.fieldLabel}>Email or Phone</Text>
                <View style={s.inputRow}>
                  <Ionicons name="mail-outline" size={17} color={colors.primary} />
                  <TextInput
                    style={s.input}
                    placeholder="you@example.com or +91 98765 43210"
                    placeholderTextColor={colors.dim}
                    value={identifier}
                    onChangeText={setIdentifier}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
            ) : (
              <>
                {devCode ? (
                  <TouchableOpacity onPress={() => setCode(devCode)} style={s.devBanner}>
                    <Text style={s.devLabel}>Dev OTP (tap to fill)</Text>
                    <Text style={s.devCode}>{devCode}</Text>
                  </TouchableOpacity>
                ) : null}

                <View style={s.fieldWrap}>
                  <Text style={s.fieldLabel}>6-Digit Code</Text>
                  <View style={s.inputRow}>
                    <Ionicons name="keypad-outline" size={17} color={colors.primary} />
                    <TextInput
                      style={[s.input, s.codeInput]}
                      placeholder="123456"
                      placeholderTextColor={colors.dim}
                      value={code}
                      onChangeText={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                </View>

                <View style={s.fieldWrap}>
                  <Text style={s.fieldLabel}>New Password</Text>
                  <View style={s.inputRow}>
                    <Ionicons name="lock-closed-outline" size={17} color={colors.primary} />
                    <TextInput
                      style={[s.input, { flex: 1 }]}
                      placeholder="At least 6 characters"
                      placeholderTextColor={colors.dim}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPass}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowPass(v => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={18} color={colors.muted} />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>

          {info ? (
            <View style={[s.infoBox, shadow.sm]}>
              <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
              <Text style={s.infoText}>{info}</Text>
            </View>
          ) : null}

          {error ? (
            <View style={[s.errorBox, shadow.sm]}>
              <Ionicons name="warning-outline" size={16} color={colors.red} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity onPress={step === "request" ? handleSendOtp : handleReset} disabled={loading} activeOpacity={0.85}>
            <LinearGradient
              colors={loading ? ["#94A3B8", "#94A3B8"] : ["#2563EB", "#4F46E5"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[s.submitBtn, !loading && shadow.glow]}
            >
              {loading ? (
                <ActivityIndicator color="rgba(255,255,255,0.9)" />
              ) : (
                <View style={s.submitInner}>
                  <Ionicons name={step === "request" ? "send-outline" : "checkmark-outline"} size={18} color="#fff" />
                  <Text style={s.submitText}>{step === "request" ? "Send OTP" : "Reset Password"}</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {step === "reset" && (
            <TouchableOpacity onPress={() => { setStep("request"); setCode(""); setNewPassword(""); setDevCode(""); setInfo("") }} style={s.secondaryBtn}>
              <Text style={s.secondaryText}>← Use a different email/phone</Text>
            </TouchableOpacity>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 },

  header: { alignItems: "center", marginBottom: 24, gap: 10 },
  iconBubble: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    backgroundColor: colors.primary,
  },
  title: { fontSize: 22, fontWeight: "800", color: colors.text, textAlign: "center" },
  subtitle: { fontSize: 14, color: colors.textSub, textAlign: "center", paddingHorizontal: 16 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    gap: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.8)",
  },

  fieldWrap: { gap: 8 },
  fieldLabel: { fontSize: 13, fontWeight: "700", color: colors.textSub, marginLeft: 2 },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F8FAFC", borderRadius: 14,
    borderWidth: 1, borderColor: "#E2E8F0",
    paddingHorizontal: 14, paddingVertical: 13, gap: 10,
  },
  input: { flex: 1, fontSize: 15, color: colors.text, padding: 0 },
  codeInput: { letterSpacing: 6, fontWeight: "700", textAlign: "center" },

  devBanner: {
    backgroundColor: "#FEF9C3",
    borderColor: "#FDE68A",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
  },
  devLabel: { fontSize: 11, color: "#92400E", marginBottom: 4 },
  devCode: { fontSize: 22, fontWeight: "800", letterSpacing: 6, color: "#92400E" },

  infoBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#EFF6FF", borderRadius: 14,
    padding: 12, gap: 10, marginBottom: 12,
    borderWidth: 1, borderColor: "#BFDBFE",
  },
  infoText: { color: colors.primary, fontSize: 13, flex: 1 },

  errorBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FEF2F2", borderRadius: 14,
    padding: 14, gap: 10, marginBottom: 14,
    borderWidth: 1, borderColor: "#FECACA",
  },
  errorText: { color: colors.red, fontSize: 13, flex: 1, lineHeight: 18 },

  submitBtn: { borderRadius: 18, paddingVertical: 17, alignItems: "center", justifyContent: "center" },
  submitInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  secondaryBtn: { paddingVertical: 14, alignItems: "center" },
  secondaryText: { color: colors.textSub, fontSize: 13, fontWeight: "600" },
})
