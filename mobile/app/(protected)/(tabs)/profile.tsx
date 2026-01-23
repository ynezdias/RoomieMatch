import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { useEffect, useState } from 'react'
import { useAuth } from '../../../src/context/AuthContext'
import API from '../../../services/api'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { LinearGradient } from 'expo-linear-gradient'

export default function ProfileScreen() {
  const { logout, user } = useAuth()

  const [aboutMe, setAboutMe] = useState('')
  const [city, setCity] = useState('')
  const [university, setUniversity] = useState('')
  const [photo, setPhoto] = useState('')
  const [loading, setLoading] = useState(false)

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

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      // If base64 is available, construct the data URI
      if (result.assets[0].base64) {
        setPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
      } else {
        setPhoto(result.assets[0].uri);
      }
    }
  };

  const saveProfile = async () => {
    setLoading(true)
    try {
      // Check if photo is too large or invalid if needed
      await API.put('/profile', {
        aboutMe,
        city,
        university,
        photo,
      })
      Alert.alert('Success', 'Profile updated successfully!')
    } catch (err) {
      console.log('PROFILE SAVE ERROR', err)
      Alert.alert('Error', 'Failed to save profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={{ padding: 20, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white' }}>Profile</Text>
          <TouchableOpacity onPress={logout} style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: 8, borderRadius: 12 }}>
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity onPress={pickImage} style={{ position: 'relative' }}>
            <Image
              source={photo ? { uri: photo } : { uri: 'https://via.placeholder.com/150' }}
              style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#22c55e', backgroundColor: '#cbd5e1' }}
            />
            <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#22c55e', padding: 8, borderRadius: 20, borderWidth: 2, borderColor: '#1e293b' }}>
              <Ionicons name="camera" size={20} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginTop: 12 }}>
            {user?.email?.split('@')[0] || 'User'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 }}>
          
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#64748b', marginBottom: 8, marginLeft: 4 }}>About Me</Text>
          <TextInput
            placeholder="Tell us about yourself..."
            value={aboutMe}
            onChangeText={setAboutMe}
            multiline
            style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 15, fontSize: 16, minHeight: 100, textAlignVertical: 'top', marginBottom: 20 }}
          />

          <Text style={{ fontSize: 16, fontWeight: '600', color: '#64748b', marginBottom: 8, marginLeft: 4 }}>City</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 15, marginBottom: 20 }}>
            <Ionicons name="location-outline" size={20} color="#94a3b8" />
            <TextInput
              placeholder="e.g. New York, NY"
              value={city}
              onChangeText={setCity}
              style={{ flex: 1, paddingVertical: 15, paddingHorizontal: 10, fontSize: 16 }}
            />
          </View>

          <Text style={{ fontSize: 16, fontWeight: '600', color: '#64748b', marginBottom: 8, marginLeft: 4 }}>University / Workplace</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 15, marginBottom: 30 }}>
            <Ionicons name="school-outline" size={20} color="#94a3b8" />
            <TextInput
              placeholder="e.g. State University"
              value={university}
              onChangeText={setUniversity}
              style={{ flex: 1, paddingVertical: 15, paddingHorizontal: 10, fontSize: 16 }}
            />
          </View>

          <TouchableOpacity
            onPress={saveProfile}
            disabled={loading}
            style={{ backgroundColor: '#0f172a', paddingVertical: 18, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginRight: 8 }}>Save Changes</Text>
                <Ionicons name="checkmark-circle-outline" size={22} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}
