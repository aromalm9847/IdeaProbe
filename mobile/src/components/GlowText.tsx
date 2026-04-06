import { useEffect, useRef } from "react"
import { Animated, Text, StyleSheet, View } from "react-native"

export function GlowText({ text, style }: { text: string; style?: any }) {
  const glow = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  const opacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] })
  const scale = glow.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.005, 1] })

  return (
    <View>
      {/* Glow layer behind */}
      <Animated.Text
        style={[
          s.glowLayer,
          style,
          {
            opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] }),
            transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }) }],
          },
        ]}
      >
        {text}
      </Animated.Text>
      {/* Main text */}
      <Animated.Text style={[style, { opacity, transform: [{ scale }] }]}>
        {text}
      </Animated.Text>
    </View>
  )
}

const s = StyleSheet.create({
  glowLayer: {
    position: "absolute",
    textShadowColor: "#2563EB",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
})
