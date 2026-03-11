import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, Switch, Pressable, SafeAreaView } from 'react-native'
import { useEffect, useState } from 'react'
import { useAuth } from '../../../src/context/AuthContext'
import { useTheme } from '../../../src/context/ThemeContext'
import API from '../../../services/api'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { LinearGradient } from 'expo-linear-gradient'
import Slider from '@react-native-community/slider'

export default function ProfileScreen() {
  const { logout, user } = useAuth()
  const { colors, isDark } = useTheme()

  const [aboutMe, setAboutMe] = useState('')
  const [city, setCity] = useState('')
  const [university, setUniversity] = useState('')
  const [photo, setPhoto] = useState('')
  const [budget, setBudget] = useState(1000)
  const [smoking, setSmoking] = useState(false)
  const [pets, setPets] = useState(false)
  const [furniture, setFurniture] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await API.get('/profile/me')
      setAboutMe(res.data.aboutMe || '')
      setCity(res.data.city || '')
      setUniversity(res.data.university || '')
      setPhoto(res.data.photo || '')
      setBudget(res.data.budget || 1000)
      setSmoking(res.data.smoking || false)
      setPets(res.data.pets || false)
      setFurniture(res.data.furniture || false)
    } catch (err) {
      console.log('PROFILE LOAD ERROR', err)
    }
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
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
      await API.put('/profile', {
        aboutMe,
        city,
        university,
        photo,
        budget,
        smoking,
        pets,
        furniture
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* PREMIUM HEADER */}
        <View style={{ height: 320, position: 'relative' }}>
          <Image
            source={photo ? { uri: photo } : { uri: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
            style={{ width: '100%', height: '100%', backgroundColor: colors.secondary }}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 180, justifyContent: 'flex-end', padding: 24 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <View>
                <Text style={{ color: 'white', fontSize: 32, fontWeight: '900', letterSpacing: -0.5 }}>
                  {user?.email?.split('@')[0] || 'My Profile'}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600', marginTop: 4 }}>
                  {city || 'Location not set'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={pickImage}
                style={{ backgroundColor: colors.primary, padding: 12, borderRadius: 16, borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)' }}
              >
                <Ionicons name="camera" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
          
          <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 }}>
                <TouchableOpacity onPress={logout} style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 12 }}>
                  <Ionicons name="log-out-outline" size={24} color="#fff" />
                </TouchableOpacity>
             </View>
          </SafeAreaView>
        </View>

        <View style={{ padding: 20, marginTop: -20, backgroundColor: colors.background, borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>
          
          {/* SECTION: ABOUT */}
          <SectionTitle title="About Me" icon="person-outline" colors={colors} />
          <TextInput
            placeholder="Tell us about yourself..."
            placeholderTextColor="#64748b"
            value={aboutMe}
            onChangeText={setAboutMe}
            multiline
            style={{ backgroundColor: colors.inputBackground, color: colors.text, borderRadius: 16, padding: 16, fontSize: 16, minHeight: 120, textAlignVertical: 'top', marginBottom: 24, borderWidth: 1, borderColor: colors.border }}
          />

          {/* SECTION: DETAILS */}
          <SectionTitle title="Common Details" icon="business-outline" colors={colors} />
          <View style={{ backgroundColor: colors.inputBackground, borderRadius: 20, padding: 4, marginBottom: 24, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Ionicons name="location-outline" size={22} color={colors.primary} />
              <TextInput
                placeholder="City (e.g. New York, NY)"
                placeholderTextColor="#64748b"
                value={city}
                onChangeText={setCity}
                style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 12, fontSize: 16, color: colors.text }}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
              <Ionicons name="school-outline" size={22} color={colors.primary} />
              <TextInput
                placeholder="University / Workplace"
                placeholderTextColor="#64748b"
                value={university}
                onChangeText={setUniversity}
                style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 12, fontSize: 16, color: colors.text }}
              />
            </View>
          </View>

          {/* SECTION: PREFERENCES */}
          <SectionTitle title="Preferences" icon="options-outline" colors={colors} />
          
          <View style={{ backgroundColor: colors.inputBackground, borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Monthly Budget</Text>
                <Text style={{ fontSize: 18, fontWeight: '900', color: colors.primary }}>${Math.floor(budget)}</Text>
            </View>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={5000}
              step={50}
              value={budget}
              onValueChange={setBudget}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={isDark ? '#334155' : '#e2e8f0'}
              thumbTintColor={colors.primary}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }}>
            <PreferenceItem icon="flame" label="Smoking" value={smoking} onToggle={setSmoking} activeColor="#ef4444" colors={colors} />
            <PreferenceItem icon="paw" label="Pets" value={pets} onToggle={setPets} activeColor="#eab308" colors={colors} />
            <PreferenceItem icon="bed" label="Furniture" value={furniture} onToggle={setFurniture} activeColor="#3b82f6" colors={colors} />
          </View>

          <TouchableOpacity
            onPress={saveProfile}
            disabled={loading}
            style={{ backgroundColor: colors.primary, paddingVertical: 20, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8, marginBottom: 40 }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '800', marginRight: 10 }}>Save Changes</Text>
                <Ionicons name="checkmark-done" size={24} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

function SectionTitle({ title, icon, colors }: any) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginLeft: 4 }}>
      <Ionicons name={icon} size={20} color="#64748b" style={{ marginRight: 8 }} />
      <Text style={{ fontSize: 14, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>{title}</Text>
    </View>
  )
}

function PreferenceItem({ icon, label, value, onToggle, activeColor, colors }: any) {
  return (
    <View style={{ width: '30%', alignItems: 'center', backgroundColor: colors.inputBackground, paddingVertical: 16, paddingHorizontal: 10, borderRadius: 20, borderWidth: 1, borderColor: value ? activeColor + '40' : colors.border }}>
      <Ionicons name={icon} size={26} color={value ? activeColor : '#64748b'} />
      <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700', marginVertical: 8 }}>{label}</Text>
      <Switch
        trackColor={{ false: '#334155', true: activeColor + '40' }}
        thumbColor={value ? activeColor : '#f4f3f4'}
        onValueChange={onToggle}
        value={value}
      />
    </View>
  )
}
