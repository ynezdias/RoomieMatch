import { Slot, useRouter } from 'expo-router'
import { useAuth } from '@/src/context/AuthContext'
import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'

export default function ProtectedLayout() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/')
    }
  }, [loading, user])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return <Slot />
}
