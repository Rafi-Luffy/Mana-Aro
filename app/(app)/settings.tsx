"use client"

import { useState } from "react"
import { View, StyleSheet, ScrollView, Alert } from "react-native"
import { Card, Text, Button, Switch, Divider, List } from "react-native-paper"
import { useAuthStore } from "@/store/auth"
import { useRouter } from "expo-router"

export default function SettingsScreen() {
  const { logout, user } = useAuthStore()
  const router = useRouter()
  const [notifications, setNotifications] = useState(true)
  const [offlineMode, setOfflineMode] = useState(true)
  const [language, setLanguage] = useState("en")

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Logout",
        onPress: async () => {
          await logout()
          router.replace("/(auth)/login")
        },
      },
    ])
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Settings
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Title title="Account" />
        <Card.Content>
          <Text variant="bodySmall">Email: {user?.email}</Text>
          <Text variant="bodySmall">Role: {user?.role}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Preferences" />
        <Card.Content>
          <View style={styles.settingRow}>
            <Text variant="bodySmall">Enable Notifications</Text>
            <Switch value={notifications} onValueChange={setNotifications} />
          </View>
          <Divider style={styles.divider} />
          <View style={styles.settingRow}>
            <Text variant="bodySmall">Offline Mode</Text>
            <Switch value={offlineMode} onValueChange={setOfflineMode} />
          </View>
          <Divider style={styles.divider} />
          <List.Item title="Language" description={language === "en" ? "English" : "Telugu"} onPress={() => {}} />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Data Management" />
        <Card.Content>
          <Button mode="outlined" style={styles.button}>
            Export Data
          </Button>
          <Button mode="outlined" style={styles.button}>
            Sync Now
          </Button>
          <Button mode="outlined" style={styles.button}>
            Clear Cache
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="About" />
        <Card.Content>
          <Text variant="bodySmall">Mana Aarogyam v1.0.0</Text>
          <Text variant="bodySmall">Rural Healthcare Management System</Text>
          <Text variant="bodySmall" style={styles.marginTop}>
            © 2025 Mana Aarogyam. All rights reserved.
          </Text>
        </Card.Content>
      </Card>

      <Button mode="contained" onPress={handleLogout} style={styles.logoutButton} buttonColor="#EF4444">
        Logout
      </Button>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontWeight: "bold",
    color: "#0D9488",
  },
  card: {
    margin: 12,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 8,
  },
  button: {
    marginBottom: 8,
  },
  marginTop: {
    marginTop: 12,
  },
  logoutButton: {
    margin: 12,
    marginBottom: 24,
  },
})
