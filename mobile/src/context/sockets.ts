import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const connectSocket = async () => {
  const token = await AsyncStorage.getItem('token');

  return io('http://localhost:5000', {
    auth: { token },
  });
};
