import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';

export default function Index() {
  const { login } = useAuth();
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 32, marginBottom: 20 }}>Login</Text>

      <TextInput
        placeholder="Email"
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 20, padding: 10 }}
      />

      <TouchableOpacity
        onPress={() => login('test@test.com', '1234')}
        style={{ backgroundColor: 'black', padding: 15 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/register')}
        style={{ marginTop: 15 }}
      >
        <Text style={{ textAlign: 'center' }}>
          Don’t have an account? Register
        </Text>
      </TouchableOpacity>
    </View>
  );
}
