import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native'
import { useEffect, useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import api from '../../../services/api'
import { useAuth } from '../../../src/context/AuthContext'

const MAX_ABOUT_LENGTH = 200

export default function ProfileScreen() {
  const { user } = useAuth()

  const [about, setAbout] = useState('')
  const [university, setUniversity] = useState('')
  const [city, setCity] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  /* ===================== LOAD PROFILE ===================== */

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get('/api/profile/me')
        const p = res.data

        setAbout(p?.aboutMe || '')
        setUniversity(p?.university || '')
        setCity(p?.city || '')
        setPhoto(p?.photo || null)
      } catch (err) {
        console.log('No profile yet')
      }
    }

    loadProfile()
  }, [])

  const completion =
    [about, university, city, photo].filter(Boolean).length / 4

  /* ===================== IMAGE PICKER ===================== */

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    })

    if (!result.canceled) {
      setPhoto(result.assets[0].uri)
    }
  }

  /* ===================== SAVE PROFILE ===================== */

  const saveProfile = async () => {
    if (!about || !university || !city) {
      Alert.alert('Incomplete Profile', 'Please fill all required fields.')
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

      Alert.alert('Success', 'Profile saved successfully')
    } catch (err: any) {
      console.log(err.response?.data || err.message)
      Alert.alert('Error', 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  /* ===================== UI ===================== */

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
        <Image
          source={{
            uri:
              photo ||
              `https://ui-avatars.com/api/?name=${user?.name || 'User'}`,
          }}
          style={styles.avatar}
        />
        <Text style={styles.editPhoto}>Edit Photo</Text>
      </TouchableOpacity>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${completion * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        Profile completion: {Math.round(completion * 100)}%
      </Text>

      <Text style={styles.label}>About Me *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        multiline
        maxLength={MAX_ABOUT_LENGTH}
        value={about}
        onChangeText={setAbout}
      />
      <Text style={styles.charCount}>
        {about.length}/{MAX_ABOUT_LENGTH}
      </Text>

      <Text style={styles.label}>University *</Text>
      <TextInput
        style={styles.input}
        value={university}
        onChangeText={setUniversity}
      />

      <Text style={styles.label}>City *</Text>
      <TextInput
        style={styles.input}
        value={city}
        onChangeText={setCity}
      />

      <TouchableOpacity
        style={[styles.button, saving && { opacity: 0.6 }]}
        onPress={saveProfile}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? 'Saving...' : 'Save Profile'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f9fafb', flexGrow: 1 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 20 },
  avatarContainer: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  editPhoto: { marginTop: 6, color: '#555' },
  progressBar: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4 },
  progressFill: { height: '100%', backgroundColor: '#000' },
  progressText: { fontSize: 12, marginBottom: 20 },
  label: { fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textArea: { height: 120 },
  charCount: { textAlign: 'right', fontSize: 12 },
  button: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
})
