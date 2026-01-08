import { Stack } from 'expo-router'
import { AuthProvider } from '../../src/context/AuthContext'

export default function ChatLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  )
}
