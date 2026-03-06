"use client"

import { Stack } from "expo-router"
import { PaperProvider } from "react-native-paper"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import { useAuthStore } from "@/store/auth"

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { isInitialized, initialize } = useAuthStore()

  useEffect(() => {
    const prepare = async () => {
      try {
        await initialize()
      } catch (e) {
        console.warn(e)
      } finally {
        SplashScreen.hideAsync()
      }
    }

    prepare()
  }, [])

  if (!isInitialized) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
          </Stack>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
