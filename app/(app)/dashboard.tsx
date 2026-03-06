"use client"

import { useEffect, useState } from "react"
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native"
import { Card, Text, Button } from "react-native-paper"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useDataStore } from "@/store/data"

export default function DashboardScreen() {
  const { patients, visits, getStats } = useDataStore()
  const [stats, setStats] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const data = await getStats()
    setStats(data)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadStats()
    setRefreshing(false)
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Dashboard
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Card.Content>
            <View style={styles.statContent}>
              <MaterialCommunityIcons name="account-multiple" size={32} color="#0D9488" />
              <Text variant="headlineSmall" style={styles.statNumber}>
                {patients.length}
              </Text>
              <Text variant="labelSmall">Total Patients</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <View style={styles.statContent}>
              <MaterialCommunityIcons name="calendar-check" size={32} color="#059669" />
              <Text variant="headlineSmall" style={styles.statNumber}>
                {visits.length}
              </Text>
              <Text variant="labelSmall">Total Visits</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <View style={styles.statContent}>
              <MaterialCommunityIcons name="pill" size={32} color="#F59E0B" />
              <Text variant="headlineSmall" style={styles.statNumber}>
                {stats?.medicinesUsed || 0}
              </Text>
              <Text variant="labelSmall">Medicines Used</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <View style={styles.statContent}>
              <MaterialCommunityIcons name="trending-up" size={32} color="#EF4444" />
              <Text variant="headlineSmall" style={styles.statNumber}>
                {stats?.avgVisitTime || 0}m
              </Text>
              <Text variant="labelSmall">Avg Visit Time</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.card}>
        <Card.Title title="Recent Activity" />
        <Card.Content>
          {visits.slice(0, 5).map((visit: any) => (
            <View key={visit.id} style={styles.activityItem}>
              <Text variant="bodySmall">{visit.patientName}</Text>
              <Text variant="labelSmall" style={styles.activityTime}>
                {new Date(visit.date).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Quick Actions" />
        <Card.Content>
          <Button mode="contained" style={styles.actionButton}>
            Add New Patient
          </Button>
          <Button mode="outlined" style={styles.actionButton}>
            Start Consultation
          </Button>
          <Button mode="outlined" style={styles.actionButton}>
            View Reports
          </Button>
        </Card.Content>
      </Card>
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    marginBottom: 16,
    marginHorizontal: "1%",
  },
  statContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  statNumber: {
    marginTop: 8,
    fontWeight: "bold",
    color: "#0D9488",
  },
  card: {
    margin: 12,
  },
  activityItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  activityTime: {
    color: "#999",
    marginTop: 4,
  },
  actionButton: {
    marginBottom: 8,
  },
})
