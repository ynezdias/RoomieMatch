import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function LandingPage() {
  const router = useRouter()

  return (
    <LinearGradient
      colors={['#020617', '#020617', '#0f172a']}
      style={styles.container}
    >
      {/* LOGO / ICON */}
      <View style={styles.iconWrapper}>
        <Ionicons name="home-outline" size={64} color="#22c55e" />
      </View>

      {/* TITLE */}
      <Text style={styles.title}>RoomieMatch</Text>

      {/* TAGLINE */}
      <Text style={styles.subtitle}>
        Find roommates who actually match your lifestyle
      </Text>

      {/* DESCRIPTION */}
      <Text style={styles.description}>
        Swipe, connect, and live better together.  
        Smart matching for students and professionals.
      </Text>

      {/* BUTTONS */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.primaryText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.secondaryText}>
            Already have an account? Log in
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  )
}//edited

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    backgroundColor: '#020617',
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#22c55e',
    textAlign: 'center',
    marginBottom: 18,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  buttons: {
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 18,
  },
  primaryText: {
    color: '#020617',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
})
