import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import api from '@/services/api'
import { connectSocket } from '@/src/sockets'
import { useAuth } from '@/src/context/AuthContext'

export default function ChatScreen() {
  const { user } = useAuth()
  const { matchId } = useLocalSearchParams() // Remove generic if causing issues, or verify type
  // const { matchId } = useLocalSearchParams<{ matchId: string }>() // This is fine usually

  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')

  const socketRef = useRef<any>(null)

  /* ===================== GUARD ===================== */

  if (!user || !matchId) {
    return (
      <View style={styles.center}>
        <Text>Loading chat...</Text>
      </View>
    )
  }

  /* ===================== LOAD MESSAGES ===================== */

  const loadMessages = async () => {
    try {
      const res = await api.get(`/chat/${matchId}`)
      setMessages(res.data)
    } catch (err) {
      console.log('❌ LOAD CHAT ERROR', err)
    }
  }

  /* ===================== SOCKET ===================== */

  useEffect(() => {
    let mounted = true

    loadMessages()

    connectSocket(user._id).then((socket) => {
      if (!mounted || !socket) return

      socketRef.current = socket
      socket.emit('joinMatch', matchId)

      socket.on('newMessage', (msg) => {
        setMessages((prev) => [...prev, msg])
      })
    })

    return () => {
      mounted = false
      if (socketRef.current) {
        socketRef.current.off('newMessage')
      }
    }
  }, [matchId, user._id])

  /* ===================== SEND ===================== */

  const sendMessage = () => {
    if (!text.trim() || !socketRef.current) return

    socketRef.current.emit('sendMessage', {
      matchId,
      senderId: user._id,
      text,
    })

    setText('')
  }

  /* ===================== UI ===================== */

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const isMe =
            item.sender === user._id ||
            item.sender?._id === user._id

          return (
            <Text style={isMe ? styles.me : styles.them}>
              {item.text}
            </Text>
          )
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          style={styles.input}
        />
        <Pressable onPress={sendMessage}>
          <Text style={styles.send}>Send</Text>
        </Pressable>
      </View>
    </View>
  )
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  me: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
    color: '#fff',
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
    maxWidth: '80%',
  },
  them: {
    alignSelf: 'flex-start',
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
    maxWidth: '80%',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
  },
  send: {
    marginLeft: 10,
    color: '#007AFF',
    fontWeight: 'bold',
  },
})
