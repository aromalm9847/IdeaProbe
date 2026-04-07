import { useRef, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from "react-native"
import { Tabs } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { colors } from "../../src/theme"

const { width } = Dimensions.get("window")

const TABS = [
  { name: "index",   icon: "home-outline",   iconOn: "home",   label: "Home"    },
  { name: "scan",    icon: "rocket-outline",  iconOn: "rocket", label: "Scan",   special: true },
  { name: "history", icon: "time-outline",    iconOn: "time",   label: "History" },
  { name: "account", icon: "person-outline",  iconOn: "person", label: "Account" },
]

function TabItem({ tab, focused, onPress }: {
  tab: typeof TABS[0]; focused: boolean; onPress: () => void
}) {
  const scale   = useRef(new Animated.Value(1)).current
  const pillOp  = useRef(new Animated.Value(focused ? 1 : 0)).current
  const iconY   = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: focused ? 1.08 : 1, friction: 7, tension: 120, useNativeDriver: true }),
      Animated.timing(pillOp, { toValue: focused ? 1 : 0, duration: 180, useNativeDriver: false }),
      Animated.spring(iconY, { toValue: focused ? -2 : 0, friction: 7, tension: 120, useNativeDriver: true }),
    ]).start()
  }, [focused])

  if (tab.special) {
    return (
      <TouchableOpacity style={s.specialWrap} onPress={onPress} activeOpacity={0.88}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <LinearGradient colors={["#2563EB", "#4F46E5"]} style={s.specialBtn}>
            <Ionicons name="rocket" size={22} color="#fff" />
          </LinearGradient>
        </Animated.View>
        <Text style={[s.label, focused && s.labelOn]}>{tab.label}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity style={s.tabItem} onPress={onPress} activeOpacity={0.75}>
      <Animated.View style={{ transform: [{ scale }, { translateY: iconY }] }}>
        <Animated.View style={[
          s.iconPill,
          { opacity: pillOp, backgroundColor: focused ? "#EFF6FF" : "transparent" }
        ]}>
          <Ionicons
            name={(focused ? tab.iconOn : tab.icon) as any}
            size={21}
            color={focused ? colors.primary : "#94A3B8"}
          />
        </Animated.View>
      </Animated.View>
      <Text style={[s.label, focused && s.labelOn]}>{tab.label}</Text>
    </TouchableOpacity>
  )
}

function FloatingTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[s.barWrap, { bottom: insets.bottom + 12 }]} pointerEvents="box-none">
      <View style={s.bar}>
        {state.routes.map((route: any, i: number) => {
          const tab = TABS[i] ?? TABS[0]
          const focused = state.index === i
          const onPress = () => {
            const ev = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true })
            if (!focused && !ev.defaultPrevented) navigation.navigate(route.name)
          }
          return (
            <TabItem key={route.key} tab={tab} focused={focused} onPress={onPress} />
          )
        })}
      </View>
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen name="index"   options={{ title: "Home"    }} />
      <Tabs.Screen name="scan"    options={{ title: "Scan"    }} />
      <Tabs.Screen name="history" options={{ title: "History" }} />
      <Tabs.Screen name="account" options={{ title: "Account" }} />
    </Tabs>
  )
}

const BAR_RADIUS = 26

const s = StyleSheet.create({
  barWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
  },
  bar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: BAR_RADIUS,
    paddingVertical: 8,
    paddingHorizontal: 8,
    width: "100%",
    alignItems: "center",
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 18,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
    gap: 3,
  },
  iconPill: {
    width: 44,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    color: "#94A3B8",
    letterSpacing: 0.2,
  },
  labelOn: {
    color: colors.primary,
    fontWeight: "700",
  },
  specialWrap: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 2,
    gap: 4,
  },
  specialBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 12,
    marginTop: -14,
  },
})
