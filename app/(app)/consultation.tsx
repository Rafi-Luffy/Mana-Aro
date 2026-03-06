"use client"

import { useState } from "react"
import { View, StyleSheet, FlatList } from "react-native"
import { Card, Text, Button, TextInput } from "react-native-paper"

export default function ConsultationScreen() {
  const [messages, setMessages] = useState<any[]>([])
  const [messageText, setMessageText] = useState("")

  const handleSendMessage = () => {
    if (messageText.trim()) {
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          text: messageText,
          sender: "user",
          timestamp: new Date(),
        },
      ])
      setMessageText("")
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Remote Consultation
        </Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.messageContainer, item.sender === "user" ? styles.userMessage : styles.doctorMessage]}>
            <Card style={styles.messageCard}>
              <Card.Content>
                <Text variant="bodySmall">{item.text}</Text>
                <Text variant="labelSmall" style={styles.timestamp}>
                  {item.timestamp.toLocaleTimeString()}
                </Text>
              </Card.Content>
            </Card>
          </View>
        )}
        contentContainerStyle={styles.messagesList}
        scrollEnabled={true}
      />

      <View style={styles.inputContainer}>
        <View style={styles.callButtons}>
          <Button icon="phone" mode="contained" style={styles.callButton} onPress={() => {}}>
            Audio Call
          </Button>
          <Button icon="video" mode="contained" style={styles.callButton} onPress={() => {}}>
            Video Call
          </Button>
        </View>

        <View style={styles.messageInput}>
          <TextInput
            placeholder="Type message..."
            value={messageText}
            onChangeText={setMessageText}
            style={styles.input}
            multiline
          />
          <Button icon="send" mode="contained" onPress={handleSendMessage} style={styles.sendButton}>
            Send
          </Button>
        </View>
      </View>
    </View>
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
  messagesList: {
    padding: 12,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 12,
    flexDirection: "row",
  },
  userMessage: {
    justifyContent: "flex-end",
  },
  doctorMessage: {
    justifyContent: "flex-start",
  },
  messageCard: {
    maxWidth: "80%",
  },
  timestamp: {
    marginTop: 4,
    color: "#999",
  },
  inputContainer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    padding: 12,
  },
  callButtons: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },
  callButton: {
    flex: 1,
  },
  messageInput: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
  },
  sendButton: {
    marginBottom: 0,
  },
})
