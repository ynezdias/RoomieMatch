import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import api from '@/services/api';
import io from 'socket.io-client';

const socket = io('http://192.168.1.159:5000', {
  transports: ['websocket'],
});

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    fetchMessages();

    socket.emit('join', matchId);

    socket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('message');
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/chat/${matchId}`);
      setMessages(res.data);
    } catch (err) {
      console.log('CHAT FETCH ERROR', err);
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      await api.post('/chat', { matchId, text });
      setText('');
    } catch (err) {
      console.log('SEND ERROR', err);
    }
  };

  const renderItem = ({ item }: any) => {
    const isMe = item.sender === 'ME'; // later from auth

    return (
      <View
        style={[
          styles.bubble,
          isMe ? styles.myBubble : styles.theirBubble,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* CHAT HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerText}>💬 Chat</Text>
      </View>

      {/* MESSAGES */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      {/* INPUT */}
      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a message…"
          style={styles.input}
        />
        <Pressable onPress={sendMessage} style={styles.sendBtn}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },

  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  list: {
    padding: 12,
  },

  bubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },

  myBubble: {
    backgroundColor: '#ff5864',
    alignSelf: 'flex-end',
  },

  theirBubble: {
    backgroundColor: '#e5e5ea',
    alignSelf: 'flex-start',
  },

  messageText: {
    color: '#000',
    fontSize: 16,
  },

  inputRow: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },

  input: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  sendBtn: {
    marginLeft: 10,
    justifyContent: 'center',
  },

  sendText: {
    color: '#ff5864',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
