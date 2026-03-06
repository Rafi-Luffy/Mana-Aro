"use client"

import { useEffect, useState } from "react"
import { View, StyleSheet, FlatList, Alert } from "react-native"
import { Card, Text, Button, FAB, Searchbar, Dialog, Portal, TextInput } from "react-native-paper"
import { useDataStore } from "@/store/data"

export default function PatientsScreen() {
  const { patients, addPatient } = useDataStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredPatients, setFilteredPatients] = useState(patients)
  const [visible, setVisible] = useState(false)
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    phone: "",
    village: "",
  })

  useEffect(() => {
    const filtered = patients.filter(
      (p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.phone.includes(searchQuery),
    )
    setFilteredPatients(filtered)
  }, [searchQuery, patients])

  const handleAddPatient = async () => {
    if (!newPatient.name || !newPatient.age || !newPatient.phone) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    try {
      await addPatient({
        ...newPatient,
        age: Number.parseInt(newPatient.age),
        medicalHistory: [],
      })
      setNewPatient({ name: "", age: "", phone: "", village: "" })
      setVisible(false)
      Alert.alert("Success", "Patient added successfully")
    } catch (error) {
      Alert.alert("Error", "Failed to add patient")
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search patients..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <FlatList
        data={filteredPatients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.patientCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.patientName}>
                {item.name}
              </Text>
              <Text variant="bodySmall">Age: {item.age} years</Text>
              <Text variant="bodySmall">Phone: {item.phone}</Text>
              <Text variant="bodySmall">Village: {item.village}</Text>
              <Button mode="outlined" style={styles.viewButton}>
                View Details
              </Button>
            </Card.Content>
          </Card>
        )}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      />

      <FAB icon="plus" onPress={() => setVisible(true)} style={styles.fab} color="#fff" />

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Add New Patient</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              value={newPatient.name}
              onChangeText={(text) => setNewPatient({ ...newPatient, name: text })}
              style={styles.input}
            />
            <TextInput
              label="Age"
              value={newPatient.age}
              onChangeText={(text) => setNewPatient({ ...newPatient, age: text })}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label="Phone"
              value={newPatient.phone}
              onChangeText={(text) => setNewPatient({ ...newPatient, phone: text })}
              keyboardType="phone-pad"
              style={styles.input}
            />
            <TextInput
              label="Village"
              value={newPatient.village}
              onChangeText={(text) => setNewPatient({ ...newPatient, village: text })}
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Cancel</Button>
            <Button onPress={handleAddPatient}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchbar: {
    elevation: 0,
  },
  listContent: {
    padding: 12,
  },
  patientCard: {
    marginBottom: 12,
  },
  patientName: {
    fontWeight: "bold",
    color: "#0D9488",
    marginBottom: 8,
  },
  viewButton: {
    marginTop: 12,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#0D9488",
  },
  input: {
    marginBottom: 12,
  },
})
