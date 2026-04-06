import { View, StyleSheet, ViewStyle } from "react-native"

interface Props {
  children: React.ReactNode
  style?: ViewStyle
}

export function LiquidCard({ children, style }: Props) {
  return (
    <View style={[lc.outer, style]}>
      <View style={lc.inner}>{children}</View>
    </View>
  )
}

const lc = StyleSheet.create({
  outer: {
    borderRadius: 24,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  inner: {
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    overflow: "hidden",
  },
})
