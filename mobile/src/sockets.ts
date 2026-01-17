import { io, Socket } from 'socket.io-client'
import AsyncStorage from '@react-native-async-storage/async-storage'

let socket: Socket | null = null

const SOCKET_URL = 'http://192.168.1.105:5000' // same as API base URL

export const connectSocket = async (userId: string) => {
  if (socket) return socket

  const token = await AsyncStorage.getItem('token')

  if (!token) {
    console.log('❌ No token — socket not connected')
    return null
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
  })

  socket.on('connect', () => {
    console.log('🟢 Socket connected')
    socket?.emit('join', userId)
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
