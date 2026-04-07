import { useState } from "react"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SplashAnimation } from "../src/components/SplashAnimation"

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false)

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <StatusBar style={splashDone ? "dark" : "light"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerTintColor: "#0F172A",
          headerTitleStyle: { fontWeight: "700", fontSize: 17 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: "#F8FAFC" },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="scan" options={{ title: "New Analysis" }} />
        <Stack.Screen name="report" options={{ title: "Your Report" }} />
        <Stack.Screen name="history" options={{ title: "Scan History" }} />
        <Stack.Screen name="auth" options={{ title: "", headerTransparent: true }} />
      </Stack>

      {/* Premium opening splash — renders on top until animation completes */}
      {!splashDone && <SplashAnimation onFinish={() => setSplashDone(true)} />}
    </GestureHandlerRootView>
  )
}
