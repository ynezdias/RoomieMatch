import { io, Socket } from 'socket.io-client'
import AsyncStorage from '@react-native-async-storage/async-storage'

let socket: Socket | null = null

export const connectSocket = async () => {
  if (socket) return socket

  const token = await AsyncStorage.getItem('token')

  if (!token) {
    console.log('❌ No token — socket not connected')
    return null
  }

  socket = io('http://YOUR_BACKEND_IP:5000', {
    auth: {
      token,
    },
    transports: ['websocket'],
  })

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket?.id)
  })

  socket.on('disconnect', () => {
    console.log('⚠️ Socket disconnected')
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
