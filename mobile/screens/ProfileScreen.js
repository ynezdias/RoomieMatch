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
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FA',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F1F3F6',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 14,
    color: '#111',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
