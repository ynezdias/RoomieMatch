import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import { useEffect, useState } from 'react'
import { useAuth } from '../../../src/context/AuthContext'
import API from '../../../services/api'
import { Ionicons } from '@expo/vector-icons'

export default function ProfileScreen() {
  const { logout } = useAuth()

  const [aboutMe, setAboutMe] = useState('')
  const [city, setCity] = useState('')
  const [university, setUniversity] = useState('')
  const [photo, setPhoto] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await API.get('/profile')
      setAboutMe(res.data.aboutMe || '')
      setCity(res.data.city || '')
      setUniversity(res.data.university || '')
      setPhoto(res.data.photo || '')
    } catch (err) {
      console.log('PROFILE LOAD ERROR', err)
    }
  }

  const saveProfile = async () => {
    try {
      await API.put('/profile', {
        aboutMe,
        city,
        university,
        photo,
      })
      alert('Profile saved!')
    } catch (err) {
      console.log('PROFILE SAVE ERROR', err)
    }
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* LOGOUT BUTTON */}
      <TouchableOpacity
        onPress={logout}
        style={{ position: 'absolute', top: 40, right: 20 }}
      >
        <Ionicons name="log-out-outline" size={26} color="red" />
      </TouchableOpacity>

      <Text style={{ fontSize: 26, marginBottom: 20 }}>Your Profile</Text>

      {photo ? (
        <Image
          source={{ uri: photo }}
          style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 20 }}
        />
      ) : null}

      <TextInput
        placeholder="About Me"
        value={aboutMe}
        onChangeText={setAboutMe}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      <TextInput
        placeholder="City"
        value={city}
        onChangeText={setCity}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      <TextInput
        placeholder="University"
        value={university}
        onChangeText={setUniversity}
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />

      <TouchableOpacity
        onPress={saveProfile}
        style={{ backgroundColor: 'black', padding: 15 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          Save Profile
        </Text>
      </TouchableOpacity>
    </View>
  )
}
