import { View, Text, FlatList, TextInput, Pressable, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { connectSocket } from '@/src/sockets';
import { useAuth } from '@/src/context/AuthContext';

export default function ChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [socket, setSocket] = useState<any>(null);

  const matchId = 'MATCH_ID_HERE'; // later from route params

  useEffect(() => {
    loadMessages();

    connectSocket().then((sock) => {
      setSocket(sock);
      sock.emit('joinMatch', matchId);

      sock.on('newMessage', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });
    });
  }, []);

  const loadMessages = async () => {
    const res = await api.get(`/chat/${matchId}`);
    setMessages(res.data);
  };

  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit('sendMessage', {
      matchId,
      senderId: user.id,
      text,
    });

    setText('');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Text style={item.sender._id === user.id ? styles.me : styles.them}>
            {item.text}
          </Text>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type..."
          style={styles.input}
        />
        <Pressable onPress={sendMessage}>
          <Text style={styles.send}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  me: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
    color: '#fff',
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
  },
  them: {
    alignSelf: 'flex-start',
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
