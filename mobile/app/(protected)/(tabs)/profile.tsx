import { View, Text, TextInput, Button, Alert } from 'react-native'
import { useState } from 'react'
import api from '@/services/api'
import * as ImagePicker from 'expo-image-picker'

export default function ProfileScreen() {
  const [aboutMe, setAboutMe] = useState('')
  const [university, setUniversity] = useState('')
  const [city, setCity] = useState('')
  const [minBudget, setMinBudget] = useState('')
  const [maxBudget, setMaxBudget] = useState('')

  const saveProfile = async () => {
    try {
      await api.post('/users/profile', {
        aboutMe,
        university,
        city,
        budget: {
          min: Number(minBudget),
          max: Number(maxBudget),
        },
      })

      Alert.alert('✅ Profile saved')
    } catch (err) {
      console.log(err)
      Alert.alert('❌ Failed to save profile')
    }
  }
  const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
  })

  if (!result.canceled) {
    const formData = new FormData()

    formData.append('photo', {
      uri: result.assets[0].uri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as any)

    await api.post('/users/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }
}

  return (
    <View style={{ padding: 20 }}>
      <Text>About Me</Text>
      <TextInput onChangeText={setAboutMe} />

      <Text>University</Text>
      <TextInput onChangeText={setUniversity} />

      <Text>City</Text>
      <TextInput onChangeText={setCity} />

      <Text>Budget Min</Text>
      <TextInput keyboardType="numeric" onChangeText={setMinBudget} />

      <Text>Budget Max</Text>
      <TextInput keyboardType="numeric" onChangeText={setMaxBudget} />

      <Button title="Save Profile" onPress={saveProfile} />
      <Button title="Upload Photo" onPress={pickImage} />

    </View>
  )
}


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#fff',
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 12,
//   },
//   button: {
//     backgroundColor: 'black',
//     padding: 15,
//     borderRadius: 12,
//     marginTop: 10,
//   },
//   buttonText: {
//     color: 'white',
//     textAlign: 'center',
//     fontSize: 16,
//   },
// })
