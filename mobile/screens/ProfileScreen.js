import { View, Text, TextInput, Button } from 'react-native';
import { useState } from 'react';
import API from '../services/api';

export default function ProfileScreen() {
  const [aboutMe, setAboutMe] = useState('');
  const [university, setUniversity] = useState('');
  const [city, setCity] = useState('');

  const saveProfile = async () => {
    await API.post('/profile', {
      aboutMe,
      university,
      city
    });
    alert("Profile Saved");
  };

  return (
    <View>
      <Text>Create Profile</Text>
      <TextInput placeholder="About Me" onChangeText={setAboutMe} />
      <TextInput placeholder="University" onChangeText={setUniversity} />
      <TextInput placeholder="City" onChangeText={setCity} />
      <Button title="Save Profile" onPress={saveProfile} />
    </View>
  );
}
