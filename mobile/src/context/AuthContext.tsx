import React, { createContext, useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'

type User = {
  id: string
  email: string
}

type AuthContextType = {
  user: User | null
  token: string | null
  login: (token: string, user: User) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAuth = async () => {
      const storedToken = await AsyncStorage.getItem('token')
      const storedUser = await AsyncStorage.getItem('user')

      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }

      setLoading(false)
    }

    loadAuth()
  }, [])

  const login = async (newToken: string, newUser: User) => {
    await AsyncStorage.setItem('token', newToken)
    await AsyncStorage.setItem('user', JSON.stringify(newUser))

    setToken(newToken)
    setUser(newUser)

    router.replace('/(protected)/(tabs)/swipe')
  }

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'user'])
    setToken(null)
    setUser(null)
    router.replace('/')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
