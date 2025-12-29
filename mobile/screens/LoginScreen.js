import { View, Text, TextInput, Button } from 'react-native';
import API from '../services/api';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    const res = await API.post('/auth/login', { email, password });
    console.log(res.data);
  };

  return (
    <View>
      <Text>Login</Text>
      <TextInput placeholder="Email" onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} />
      <Button title="Login" onPress={login} />
    </View>
  );
}

const login = async () => {
  const res = await API.post('/auth/login', { email, password });
  await AsyncStorage.setItem('token', res.data.token);
};
