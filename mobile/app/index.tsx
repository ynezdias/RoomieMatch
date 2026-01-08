import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { useAuth } from '../src/context/AuthContext'
import { useState } from 'react'
import { useRouter } from 'expo-router'

export default function Index() {
  const { login } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 32, marginBottom: 20 }}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 20, padding: 10 }}
      />

      <TouchableOpacity
        onPress={() => login(email, password)}
        style={{ backgroundColor: 'black', padding: 15 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/register')}
        style={{ marginTop: 15 }}
      >
        <Text style={{ textAlign: 'center' }}>
          Don’t have an account? Register
        </Text>
      </TouchableOpacity>
    </View>
  )
}
