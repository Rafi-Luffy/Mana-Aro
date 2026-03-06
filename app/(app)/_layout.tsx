import { Tabs } from "expo-router"
import { MaterialCommunityIcons } from "@expo/vector-icons"

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#0D9488",
        tabBarInactiveTintColor: "#999",
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: "Patients",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-multiple" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="consultation"
        options={{
          title: "Consultation",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="chat" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="cog" size={24} color={color} />,
        }}
      />
    </Tabs>
  )
}
