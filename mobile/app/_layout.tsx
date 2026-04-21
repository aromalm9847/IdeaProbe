import { useState } from "react"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { SplashAnimation } from "../src/components/SplashAnimation"

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false)

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
        <StatusBar style={splashDone ? "dark" : "light"} />
        <Stack screenOptions={{ headerShown: false }}>
          {/* Tab group — home, scan, history, account */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Fullscreen modal screens */}
          <Stack.Screen
            name="auth"
            options={{
              headerShown: false,
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="report"
            options={{
              headerShown: true,
              title: "Your Report",
              headerStyle: { backgroundColor: "#FFFFFF" },
              headerTintColor: "#0F172A",
              headerTitleStyle: { fontWeight: "700", fontSize: 17 },
              headerShadowVisible: false,
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="forgot-password"
            options={{
              headerShown: true,
              title: "Reset Password",
              headerStyle: { backgroundColor: "#FFFFFF" },
              headerTintColor: "#0F172A",
              headerTitleStyle: { fontWeight: "700", fontSize: 17 },
              headerShadowVisible: false,
              animation: "slide_from_right",
            }}
          />
        </Stack>

        {/* Opening splash — full-screen overlay, auto-dismisses */}
        {!splashDone && <SplashAnimation onFinish={() => setSplashDone(true)} />}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}
