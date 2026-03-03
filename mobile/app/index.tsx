import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const { width } = Dimensions.get('window')

export default function LandingPage() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#020617', '#0f172a', '#1e293b']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['#ce0000', '#990000']}
            style={styles.logoGradient}
          >
            <Ionicons name="home" size={44} color="#fff" />
          </LinearGradient>
        </View>

        <Text style={styles.title}>RoomieMatch</Text>
        <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>
              
            </Text>
        </View>

        <Text style={styles.description}>
        </Text>

        <View style={styles.buttons}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/onboarding')}
            style={styles.primaryButton}
          >
            <LinearGradient
              colors={['#ce0000', '#990000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.primaryText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={18} color="#020617" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => router.push('/login')}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryText}>
              Already a member? <Text style={styles.loginLink}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 30,
    elevation: 20,
    shadowColor: '#ce0000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-10deg' }],
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 10,
  },
  subtitleContainer: {
    backgroundColor: 'rgba(206, 0, 0, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#ce0000',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  buttons: {
    width: '100%',
    paddingHorizontal: 10,
  },
  primaryButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#ce0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  primaryText: {
    color: '#020617',
    fontSize: 18,
    fontWeight: '800',
  },
  secondaryButton: {
    paddingVertical: 10,
  },
  secondaryText: {
    color: '#94a3b8',
    fontSize: 15,
    textAlign: 'center',
  },
  loginLink: {
    color: '#fff',
    fontWeight: '700',
  },
})
