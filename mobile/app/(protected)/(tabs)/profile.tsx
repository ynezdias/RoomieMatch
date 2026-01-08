import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { useState } from 'react'
import api from '@/services/api'
import { useAuth } from '../../../src/context/AuthContext'

export default function ProfileScreen() {
  const { user } = useAuth()

  const [name, setName] = useState(user?.name || '')
  const [university, setUniversity] = useState(user?.university || '')
  const [minBudget, setMinBudget] = useState(
    user?.budget?.min?.toString() || ''
  )
  const [maxBudget, setMaxBudget] = useState(
    user?.budget?.max?.toString() || ''
  )
  const [bio, setBio] = useState(user?.bio || '')

  const saveProfile = async () => {
    try {
      await api.put('/users/profile', {
        name,
        university,
        bio,
        budget: {
          min: Number(minBudget),
          max: Number(maxBudget),
        },
      })

      alert('✅ Profile saved!')
    } catch (err) {
      console.log(err)
      alert('❌ Failed to save profile')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="University"
        value={university}
        onChangeText={setUniversity}
        style={styles.input}
      />

      <TextInput
        placeholder="Min Budget"
        value={minBudget}
        onChangeText={setMinBudget}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Max Budget"
        value={maxBudget}
        onChangeText={setMaxBudget}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Bio"
        value={bio}
        onChangeText={setBio}
        style={[styles.input, { height: 80 }]}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={saveProfile}>
        <Text style={styles.buttonText}>Save Profile</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
})
