import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native'
import { useEffect, useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import api from '../../../services/api'
import { useAuth } from '../../../src/context/AuthContext'

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME!
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET!

export default function ProfileScreen() {
  const { user, logout } = useAuth()

  const [about, setAbout] = useState('')
  const [university, setUniversity] = useState('')
  const [city, setCity] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get('/api/profile/me')
        const p = res.data
        if (p) {
          setAbout(p.aboutMe || '')
          setUniversity(p.university || '')
          setCity(p.city || '')
          setPhoto(p.photo || null)
        }
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const uploadToCloudinary = async (uri: string) => {
    const data = new FormData()
    data.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any)
    data.append('upload_preset', UPLOAD_PRESET)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: data,
      }
    )

    const json = await res.json()
    return json.secure_url
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    })

    if (!result.canceled) {
      const cloudUrl = await uploadToCloudinary(result.assets[0].uri)
      setPhoto(cloudUrl)
    }
  }

  const saveProfile = async () => {
    if (!about || !university || !city) {
      Alert.alert('Fill all fields')
      return
    }

    try {
      setSaving(true)
      await api.put('/api/profile', {
        aboutMe: about,
        university,
        city,
        photo,
      })
      Alert.alert('Saved!')
    } catch {
      Alert.alert('Error saving profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} />
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={{ color: '#ef4444' }}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={pickImage} style={styles.avatarWrap}>
        <Image
          source={{
            uri:
              photo ||
              `https://ui-avatars.com/api/?name=${user?.name || 'User'}`,
          }}
          style={styles.avatar}
        />
        <Text style={{ color: '#9ca3af' }}>Change photo</Text>
      </TouchableOpacity>

      <TextInput
        placeholder="About me"
        value={about}
        onChangeText={setAbout}
        style={styles.input}
      />
      <TextInput
        placeholder="University"
        value={university}
        onChangeText={setUniversity}
        style={styles.input}
      />
      <TextInput
        placeholder="City"
        value={city}
        onChangeText={setCity}
        style={styles.input}
      />

      <TouchableOpacity style={styles.save} onPress={saveProfile}>
        {saving ? <ActivityIndicator /> : <Text>Save</Text>}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#0b0b0f', flexGrow: 1 },
  logout: { alignSelf: 'flex-end', marginBottom: 10 },
  avatarWrap: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  input: {
    backgroundColor: '#111827',
    color: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  save: {
    backgroundColor: '#22c55e',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
})
