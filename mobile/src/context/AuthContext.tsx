import { createContext, useContext, useState, ReactNode } from 'react'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

import api from '../../services/api'
import { connectSocket, disconnectSocket } from '../sockets'

type AuthContextType = {
  user: any
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password })

      setUser(res.data.user)
      setToken(res.data.token)

      await AsyncStorage.setItem('token', res.data.token)

      // 🔥 CONNECT SOCKET AFTER LOGIN
      await connectSocket(res.data.user._id)

      router.replace('/(protected)/(tabs)/swipe')
    } catch (err) {
      console.log('LOGIN ERROR', err)
      alert('Invalid credentials')
    }
  }

  const logout = async () => {
    setUser(null)
    setToken(null)

    await AsyncStorage.removeItem('token')
    disconnectSocket()

    router.replace('/')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
