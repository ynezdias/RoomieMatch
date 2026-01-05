import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io('http://192.168.1.159:5000', {
      transports: ['websocket'],
    });
  }

  return socket;
};
import { io, Socket } from 'socket.io-client'
import AsyncStorage from '@react-native-async-storage/async-storage'

let socket: Socket | null = null

export const connectSocket = async () => {
  const token = await AsyncStorage.getItem('token')

  if (!token) return null

  socket = io('http://YOUR_LOCAL_IP:5000', {
    auth: {
      token,
    },
    transports: ['websocket'],
  })

  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const getSocket = () => socket;
