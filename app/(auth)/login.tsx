"use client"

import { useState } from "react"
import { View, StyleSheet, ScrollView, Alert } from "react-native"
import { TextInput, Button, Text } from "react-native-paper"
import { useRouter } from "expo-router"
import { useAuthStore } from "@/store/auth"

export default function LoginScreen() {
  const router = useRouter()
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    try {
      await login(email, password)
      router.replace("/(app)/dashboard")
    } catch (error) {
      Alert.alert("Login Failed", error instanceof Error ? error.message : "Unknown error")
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="displaySmall" style={styles.title}>
          Mana Aarogyam
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Rural Healthcare Management
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
          style={styles.input}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          right={
            <TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />
          }
          editable={!isLoading}
          style={styles.input}
        />

        <Button mode="contained" onPress={handleLogin} loading={isLoading} disabled={isLoading} style={styles.button}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>

        <Button mode="text" onPress={() => router.push("/(auth)/register")} disabled={isLoading}>
          Don't have an account? Register
        </Button>
      </View>

      <View style={styles.demoCredentials}>
        <Text variant="labelSmall" style={styles.demoLabel}>
          Demo Credentials:
        </Text>
        <Text variant="labelSmall">Email: doctor@clinic.com</Text>
        <Text variant="labelSmall">Password: password123</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    color: "#0D9488",
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#666",
  },
  form: {
    marginBottom: 30,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  demoCredentials: {
    backgroundColor: "#E0F2F1",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  demoLabel: {
    fontWeight: "bold",
    marginBottom: 4,
    color: "#0D9488",
  },
})
