import { useEffect, useRef } from "react"
import { View, StyleSheet, Animated } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const NUM_PARTICLES = 12
const PARTICLE_COLORS = ["#2563EB", "#6366F1", "#8B5CF6", "#EC4899", "#3B82F6", "#A78BFA"]

function Particle({ index }: { index: number }) {
  const x = useRef(new Animated.Value(0)).current
  const y = useRef(new Animated.Value(0)).current
  const op = useRef(new Animated.Value(0)).current
  const sz = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const angle = (index / NUM_PARTICLES) * Math.PI * 2
    const radius = 40 + Math.random() * 50
    const tx = Math.cos(angle) * radius
    const ty = Math.sin(angle) * radius
    const delay = index * 200

    const loop = () => {
      x.setValue(0); y.setValue(0); op.setValue(0); sz.setValue(0)
      Animated.parallel([
        Animated.sequence([
          Animated.timing(op, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0, duration: 800, delay: 200, useNativeDriver: true }),
        ]),
        Animated.timing(x, { toValue: tx, duration: 1400, delay, useNativeDriver: true }),
        Animated.timing(y, { toValue: ty, duration: 1400, delay, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(sz, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
          Animated.timing(sz, { toValue: 0, duration: 1000, delay: 200, useNativeDriver: true }),
        ]),
      ]).start(() => setTimeout(loop, Math.random() * 1000))
    }
    setTimeout(loop, delay)
  }, [])

  const color = PARTICLE_COLORS[index % PARTICLE_COLORS.length]
  const size = 4 + (index % 3) * 2

  return (
    <Animated.View
      style={[
        ps.particle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: op,
          transform: [{ translateX: x }, { translateY: y }, { scale: sz }],
        },
      ]}
    />
  )
}
const ps = StyleSheet.create({
  particle: { position: "absolute", top: "50%", left: "50%", marginLeft: -3, marginTop: -3 },
})

export function GlowBulb() {
  const glowScale = useRef(new Animated.Value(1)).current
  const glowOp = useRef(new Animated.Value(0.4)).current
  const ring2Scale = useRef(new Animated.Value(0.8)).current
  const ring2Op = useRef(new Animated.Value(0)).current
  const iconGlow = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Outer glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowScale, { toValue: 1.3, duration: 1500, useNativeDriver: true }),
          Animated.timing(glowOp, { toValue: 0.15, duration: 1500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(glowScale, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(glowOp, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
        ]),
      ])
    ).start()

    // Second ring
    Animated.loop(
      Animated.sequence([
        Animated.delay(750),
        Animated.parallel([
          Animated.timing(ring2Scale, { toValue: 1.6, duration: 1500, useNativeDriver: true }),
          Animated.timing(ring2Op, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(ring2Scale, { toValue: 0.8, duration: 0, useNativeDriver: true }),
          Animated.timing(ring2Op, { toValue: 0.3, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start()

    // Icon brightness pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconGlow, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(iconGlow, { toValue: 0.7, duration: 1200, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  const iconOpacity = iconGlow.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] })

  return (
    <View style={gb.container}>
      {/* Particles */}
      {Array.from({ length: NUM_PARTICLES }).map((_, i) => (
        <Particle key={i} index={i} />
      ))}

      {/* Outer glow ring */}
      <Animated.View
        style={[gb.glowRing, { transform: [{ scale: glowScale }], opacity: glowOp }]}
      />

      {/* Second expanding ring */}
      <Animated.View
        style={[gb.ring2, { transform: [{ scale: ring2Scale }], opacity: ring2Op }]}
      />

      {/* Core bulb */}
      <View style={gb.core}>
        <View style={gb.innerGlow} />
        <Animated.View style={{ opacity: iconOpacity }}>
          <Ionicons name="bulb" size={40} color="#FCD34D" />
        </Animated.View>
      </View>
    </View>
  )
}

const gb = StyleSheet.create({
  container: { width: 120, height: 120, alignItems: "center", justifyContent: "center" },
  glowRing: {
    position: "absolute",
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 20,
  },
  ring2: {
    position: "absolute",
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 2, borderColor: "#6366F1",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  core: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#FCD34D",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  innerGlow: {
    position: "absolute",
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: "rgba(252,211,77,0.2)",
  },
})
