import { useState, useEffect } from "react"
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet,
  Animated,
} from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import * as Google from "expo-auth-session/providers/google"
import * as WebBrowser from "expo-web-browser"
import { useAuthStore } from "../src/store/authStore"
import { loginUser, registerUser, googleLogin } from "../src/api/client"
import { colors, shadow } from "../src/theme"
import { useEntrance, usePressScale } from "../src/hooks/useEntrance"

WebBrowser.maybeCompleteAuthSession()

export default function AuthScreen() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [identifier, setIdentifier] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { opacity, translateY } = useEntrance(0)
  const { scale, onPressIn, onPressOut } = usePressScale()
  const switchMode = (m: "login" | "register") => {
    setMode(m)
    setError("")
  }

  // ── Google Sign-In ──────────────────────────────────────────────────────
  const [, googleResponse, promptGoogle] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  })

  useEffect(() => {
    if (googleResponse?.type === "success") {
      const idToken = googleResponse.params?.id_token
      if (!idToken) { setError("Google sign-in returned no token."); return }
      ;(async () => {
        setLoading(true)
        try {
          const res = await googleLogin(idToken)
          setUser(res.data)
          router.replace("/(tabs)")
        } catch (e: any) {
          setError(e?.response?.data?.detail || "Google sign-in failed.")
        } finally {
          setLoading(false)
        }
      })()
    } else if (googleResponse?.type === "error") {
      setError("Google sign-in was cancelled.")
    }
  }, [googleResponse, setUser, router])

  const handleGoogle = async () => {
    setError("")
    if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
      setError("Google sign-in not configured.")
      return
    }
    try {
      await promptGoogle()
    } catch (e: any) {
      setError(e?.message || "Could not open Google sign-in.")
    }
  }

  const handleSubmit = async () => {
    setError("")
    if (mode === "login") {
      if (!identifier || !password) { setError("Please fill in all fields."); return }
    } else {
      if (!fullName || !email || !password) { setError("Please fill in all fields."); return }
    }
    setLoading(true)
    try {
      const res = mode === "login"
        ? await loginUser(identifier, password)
        : await registerUser({ full_name: fullName, email, password })
      setUser(res.data)
      router.replace("/(tabs)")
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } }; message?: string }
      setError(err?.response?.data?.detail || err?.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      {/* Background gradient */}
      <LinearGradient colors={["#EFF6FF", "#F5F3FF", "#FFFFFF"]} style={StyleSheet.absoluteFill} />

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View style={{ opacity, transform: [{ translateY }] }}>

          {/* Logo */}
          <View style={s.logoSection}>
            <View style={[s.logoIcon, shadow.glow]}>
              <LinearGradient colors={["#1e1b4b", "#312e81"]} style={s.logoIconGrad}>
                {/* Glow circle behind bulb */}
                <View style={s.bulbGlow} />
                {/* Bulb icon */}
                <Ionicons name="bulb" size={28} color="#f59e0b" style={{ zIndex: 2 }} />
                {/* Sparkles */}
                <View style={[s.sparkle, { top: 6, right: 8, width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#a5b4fc" }]} />
                <View style={[s.sparkle, { top: 10, right: 5, width: 3.5, height: 3.5, borderRadius: 1.75, backgroundColor: "#a5b4fc" }]} />
                <View style={[s.sparkle, { top: 4, right: 12, width: 3, height: 3, borderRadius: 1.5, backgroundColor: "#a5b4fc" }]} />
                <View style={[s.sparkle, { top: 6, left: 8, width: 4, height: 4, borderRadius: 2, backgroundColor: "#fde68a" }]} />
                <View style={[s.sparkle, { top: 10, left: 5, width: 3, height: 3, borderRadius: 1.5, backgroundColor: "#fde68a" }]} />
              </LinearGradient>
            </View>
            <Text style={s.logoText}>IdeaProbe</Text>
            <Text style={s.logoSub}>
              {mode === "login" ? "Welcome back 👋" : "Join IdeaProbe today"}
            </Text>
          </View>

          {/* Toggle switch */}
          <View style={s.toggleWrap}>
            <TouchableOpacity
              style={s.toggleOption}
              onPress={() => switchMode("login")}
              activeOpacity={0.9}
            >
              {mode === "login" && <View style={s.toggleSlider} />}
              <Text style={[s.toggleText, mode === "login" && s.toggleTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.toggleOption}
              onPress={() => switchMode("register")}
              activeOpacity={0.9}
            >
              {mode === "register" && <View style={s.toggleSlider} />}
              <Text style={[s.toggleText, mode === "register" && s.toggleTextActive]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Card */}
          <View style={[s.card, shadow.md]}>

            {/* Full name (register only) */}
            {mode === "register" && (
              <View style={s.fieldWrap}>
                <Text style={s.fieldLabel}>Full Name</Text>
                <View style={s.inputRow}>
                  <View style={s.iconWrap}>
                    <Ionicons name="person-outline" size={17} color={colors.primary} />
                  </View>
                  <TextInput
                    style={s.input}
                    placeholder="Your full name"
                    placeholderTextColor={colors.dim}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            {/* Email / phone */}
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>
                {mode === "login" ? "Email or Phone" : "Email Address"}
              </Text>
              <View style={s.inputRow}>
                <View style={s.iconWrap}>
                  <Ionicons name="mail-outline" size={17} color={colors.primary} />
                </View>
                <TextInput
                  style={s.input}
                  placeholder={mode === "login" ? "email or phone" : "you@example.com"}
                  placeholderTextColor={colors.dim}
                  value={mode === "login" ? identifier : email}
                  onChangeText={mode === "login" ? setIdentifier : setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password */}
            <View style={[s.fieldWrap, { marginBottom: 0 }]}>
              <View style={s.fieldLabelRow}>
                <Text style={s.fieldLabel}>Password</Text>
                {mode === "login" && (
                  <TouchableOpacity onPress={() => router.push("/forgot-password")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={s.forgotLink}>Forgot password?</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={s.inputRow}>
                <View style={s.iconWrap}>
                  <Ionicons name="lock-closed-outline" size={17} color={colors.primary} />
                </View>
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.dim}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPass(v => !v)}
                  style={s.eyeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPass ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={colors.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Error */}
          {error ? (
            <View style={[s.errorBox, shadow.sm]}>
              <Ionicons name="warning-outline" size={16} color={colors.red} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Submit button */}
          <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={1}
            >
              <LinearGradient
                colors={loading ? ["#94A3B8", "#94A3B8"] : ["#2563EB", "#4F46E5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[s.submitBtn, !loading && shadow.glow]}
              >
                {loading ? (
                  <ActivityIndicator color="rgba(255,255,255,0.9)" />
                ) : (
                  <View style={s.submitInner}>
                    <Ionicons name={mode === "login" ? "log-in-outline" : "person-add-outline"} size={18} color="#fff" />
                    <Text style={s.submitText}>
                      {mode === "login" ? "Sign In" : "Create Account"}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Divider */}
          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Google Sign-In */}
          <TouchableOpacity
            style={[s.googleBtn, shadow.sm]}
            onPress={handleGoogle}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-google" size={18} color="#DB4437" />
            <Text style={s.googleText}>
              {mode === "login" ? "Continue with Google" : "Sign up with Google"}
            </Text>
          </TouchableOpacity>

          {/* Guest */}
          <TouchableOpacity style={[s.guestBtn, shadow.sm]} onPress={() => router.replace("/(tabs)")}>
            <Ionicons name="person-outline" size={16} color={colors.textSub} />
            <Text style={s.guestText}>Continue without account</Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const TOGGLE_H = 52

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 32, justifyContent: "center" },

  // Logo
  logoSection: { alignItems: "center", marginBottom: 28, gap: 10 },
  logoIcon: { width: 72, height: 72, borderRadius: 22, overflow: "hidden" },
  logoIconGrad: { flex: 1, alignItems: "center", justifyContent: "center", position: "relative" },
  bulbGlow: { position: "absolute", width: 44, height: 44, borderRadius: 22, backgroundColor: "#6366f1", opacity: 0.25, top: 14, left: 14 },
  sparkle: { position: "absolute" },
  logoText: { fontSize: 30, fontWeight: "800", color: colors.text, letterSpacing: -0.5 },
  logoSub: { fontSize: 15, color: colors.textSub, textAlign: "center" },

  // Toggle
  toggleWrap: {
    flexDirection: "row",
    height: TOGGLE_H,
    backgroundColor: "#E8F0FE",
    borderRadius: TOGGLE_H / 2,
    padding: 4,
    marginBottom: 20,
    position: "relative",
  },
  toggleSlider: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: (TOGGLE_H - 8) / 2,
    backgroundColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  toggleOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    borderRadius: (TOGGLE_H - 8) / 2,
  },
  toggleText: { fontSize: 14, fontWeight: "600", color: "#64748B" },
  toggleTextActive: { color: "#FFFFFF" },

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    gap: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.8)",
  },

  // Fields
  fieldWrap: { gap: 8, marginBottom: 4 },
  fieldLabelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  fieldLabel: { fontSize: 13, fontWeight: "700", color: colors.textSub, marginLeft: 2 },
  forgotLink: { fontSize: 12, fontWeight: "600", color: colors.primary, marginRight: 2 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  iconWrap: {
    width: 28,
    alignItems: "center",
  },
  input: { flex: 1, fontSize: 15, color: colors.text, padding: 0 },
  eyeBtn: { padding: 2 },

  // Error
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: { color: colors.red, fontSize: 13, flex: 1, lineHeight: 18 },

  // Submit
  submitBtn: { borderRadius: 18, paddingVertical: 17, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  submitInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  // Divider
  dividerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E2E8F0" },
  dividerText: { color: colors.muted, fontSize: 13 },

  // Google
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 15,
    gap: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  googleText: { color: colors.text, fontWeight: "700", fontSize: 14 },

  // Guest
  guestBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 15,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  guestText: { color: colors.textSub, fontWeight: "600", fontSize: 14 },
})
