import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import api from '../../services/api'

export default function Register() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const handleRegister = async () => {
    try {
      await api.post('/api/auth/register', {
        name,
        email,
        password,
      })
      await api.post('/api/auth/login', { email, password })

      alert('Account created. Please login.')
      router.replace('/')
    }catch (err: any) {
      console.log('REGISTER ERROR:', err.response?.data || err.message)
      alert(JSON.stringify(err.response?.data || err.message))
}
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 32, marginBottom: 20 }}>Register</Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

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
        onPress={handleRegister}
        style={{ backgroundColor: 'black', padding: 15 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.back()}
        style={{ marginTop: 15 }}
      >
        <Text style={{ textAlign: 'center' }}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </View>
  )
}
