import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function MatchScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 It’s a Match!</Text>

      <TouchableOpacity onPress={() => router.back()} style={styles.button}>
        <Text style={styles.buttonText}>Continue Swiping</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#ff4d4d',
    padding: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
