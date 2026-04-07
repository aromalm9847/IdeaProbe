import { useEffect, useRef } from "react"
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

const { width, height } = Dimensions.get("window")

interface Props {
  onFinish: () => void
}

export function SplashAnimation({ onFinish }: Props) {
  // Core
  const screenOpacity = useRef(new Animated.Value(1)).current

  // Logo
  const logoScale = useRef(new Animated.Value(0.3)).current
  const logoOpacity = useRef(new Animated.Value(0)).current
  const logoRotate = useRef(new Animated.Value(-8)).current

  // Ripple rings
  const ring1Scale = useRef(new Animated.Value(1)).current
  const ring1Opacity = useRef(new Animated.Value(0.6)).current
  const ring2Scale = useRef(new Animated.Value(1)).current
  const ring2Opacity = useRef(new Animated.Value(0.4)).current

  // Glow pulse
  const glowPulse = useRef(new Animated.Value(0)).current

  // Text
  const titleOpacity = useRef(new Animated.Value(0)).current
  const titleY = useRef(new Animated.Value(22)).current
  const taglineOpacity = useRef(new Animated.Value(0)).current
  const taglineY = useRef(new Animated.Value(14)).current

  // Divider line
  const lineWidth = useRef(new Animated.Value(0)).current

  // Loading dots
  const dot1 = useRef(new Animated.Value(0.15)).current
  const dot2 = useRef(new Animated.Value(0.15)).current
  const dot3 = useRef(new Animated.Value(0.15)).current

  // Bottom label
  const bottomOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const run = () => {
      // --- Phase 1: Logo pops in with spring (t=0ms) ---
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(logoRotate, {
          toValue: 0,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start()

      // --- Phase 1b: Ripple rings (t=0ms) ---
      Animated.parallel([
        Animated.timing(ring1Scale, {
          toValue: 2.2,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(ring1Opacity, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]).start()

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(ring2Scale, {
            toValue: 2.8,
            duration: 1000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(ring2Opacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start()
      }, 180)

      // --- Phase 2: Glow pulse loop (t=300ms) ---
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowPulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
            Animated.timing(glowPulse, { toValue: 0, duration: 1100, useNativeDriver: true }),
          ])
        ).start()
      }, 300)

      // --- Phase 3: Title slides up (t=480ms) ---
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(titleOpacity, {
            toValue: 1,
            duration: 520,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(titleY, {
            toValue: 0,
            duration: 520,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start()
      }, 480)

      // --- Phase 4: Divider line expands (t=700ms) ---
      setTimeout(() => {
        Animated.timing(lineWidth, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false, // width animation needs layout
        }).start()
      }, 700)

      // --- Phase 5: Tagline (t=820ms) ---
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(taglineOpacity, {
            toValue: 1,
            duration: 450,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(taglineY, {
            toValue: 0,
            duration: 450,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start()
      }, 820)

      // --- Phase 6: Staggered loading dots (t=1100ms) ---
      const dotLoop = (dot: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, { toValue: 1, duration: 360, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0.15, duration: 360, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            Animated.delay(Math.max(0, 720 - delay)),
          ])
        )

      setTimeout(() => {
        dotLoop(dot1, 0).start()
        dotLoop(dot2, 240).start()
        dotLoop(dot3, 480).start()
      }, 1100)

      // --- Phase 7: Bottom label (t=1000ms) ---
      setTimeout(() => {
        Animated.timing(bottomOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start()
      }, 1000)

      // --- Phase 8: Fade out entire screen (t=2800ms) ---
      setTimeout(() => {
        Animated.timing(screenOpacity, {
          toValue: 0,
          duration: 600,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) onFinish()
        })
      }, 2800)
    }

    run()
  }, [])

  const glowSize = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [120, 160] })
  const glowOpacity = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.18] })
  const logoRotateDeg = logoRotate.interpolate({ inputRange: [-8, 0], outputRange: ["-8deg", "0deg"] })
  const linePct = lineWidth.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] })

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.wrap, { opacity: screenOpacity }]}>
      {/* White base */}
      <View style={StyleSheet.absoluteFill} />

      {/* Very subtle tinted gradient corners */}
      <LinearGradient
        colors={["rgba(239,246,255,0.9)", "rgba(255,255,255,0)", "rgba(255,255,255,0)", "rgba(238,242,255,0.7)"]}
        locations={[0, 0.4, 0.6, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Background decorative blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      {/* Center stage */}
      <View style={styles.stage}>

        {/* Ripple rings */}
        <Animated.View
          style={[
            styles.ring,
            { transform: [{ scale: ring1Scale }], opacity: ring1Opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            styles.ring2,
            { transform: [{ scale: ring2Scale }], opacity: ring2Opacity },
          ]}
        />

        {/* Glow halo behind logo */}
        <Animated.View
          style={[
            styles.glowHalo,
            {
              width: glowSize,
              height: glowSize,
              borderRadius: 999,
              opacity: glowOpacity,
            },
          ]}
        />

        {/* Logo pill */}
        <Animated.View
          style={{
            transform: [{ scale: logoScale }, { rotate: logoRotateDeg }],
            opacity: logoOpacity,
          }}
        >
          <LinearGradient
            colors={["#1E3A8A", "#2563EB", "#4F46E5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoPill}
          >
            {/* Inner highlight */}
            <View style={styles.logoHighlight} />
            <Ionicons name="bulb" size={48} color="#FFFFFF" />
          </LinearGradient>
        </Animated.View>

        {/* Brand name */}
        <Animated.View
          style={{ opacity: titleOpacity, transform: [{ translateY: titleY }], marginTop: 28 }}
        >
          <Text style={styles.brand}>IdeaProbe</Text>
        </Animated.View>

        {/* Animated divider line */}
        <View style={styles.lineTrack}>
          <Animated.View style={[styles.lineBar, { width: linePct }]} />
        </View>

        {/* Tagline */}
        <Animated.View
          style={{ opacity: taglineOpacity, transform: [{ translateY: taglineY }] }}
        >
          <Text style={styles.tagline}>AI · STARTUP VALIDATOR</Text>
        </Animated.View>

        {/* Loading dots */}
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, { opacity: dot1 }]} />
          <Animated.View style={[styles.dot, { opacity: dot2 }]} />
          <Animated.View style={[styles.dot, { opacity: dot3 }]} />
        </View>
      </View>

      {/* Bottom powered-by */}
      <Animated.View style={[styles.bottom, { opacity: bottomOpacity }]}>
        <View style={styles.bottomInner}>
          <View style={styles.bottomDot} />
          <Text style={styles.bottomText}>Powered by GPT-4 & Real-time Data</Text>
        </View>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    zIndex: 9999,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  blob1: {
    position: "absolute",
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: "rgba(37,99,235,0.035)",
    top: -100,
    right: -120,
  },
  blob2: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(99,102,241,0.04)",
    bottom: 80,
    left: -100,
  },
  stage: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
    borderColor: "rgba(37,99,235,0.35)",
  },
  ring2: {
    borderColor: "rgba(99,102,241,0.25)",
  },
  glowHalo: {
    position: "absolute",
    backgroundColor: "#2563EB",
  },
  logoPill: {
    width: 108,
    height: 108,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
    elevation: 20,
    overflow: "hidden",
  },
  logoHighlight: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 50,
    height: 20,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    transform: [{ rotate: "-20deg" }],
  },
  brand: {
    fontSize: 40,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -1.8,
    textAlign: "center",
  },
  lineTrack: {
    width: 180,
    height: 1.5,
    backgroundColor: "rgba(148,163,184,0.2)",
    borderRadius: 1,
    marginTop: 14,
    marginBottom: 12,
    overflow: "hidden",
  },
  lineBar: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 1,
  },
  tagline: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
    letterSpacing: 3,
    textAlign: "center",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 44,
    gap: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#2563EB",
  },
  bottom: {
    position: "absolute",
    bottom: 52,
  },
  bottomInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  bottomDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#CBD5E1",
  },
  bottomText: {
    fontSize: 11.5,
    color: "#94A3B8",
    fontWeight: "500",
    letterSpacing: 0.3,
  },
})
