import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import api from '../../services/api'

export default function Register() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const handleRegister = async () => {
    try {
      await api.post('/auth/register', {
        name,
        email,
        password,
      })
      await api.post('/auth/login', { email, password })

      alert('Account created. Please login.')
      router.replace('/')
    } catch (err: any) {
      console.log('REGISTER ERROR:', err.response?.data || err.message)
      alert(JSON.stringify(err.response?.data || err.message))
    }
  }

  return (
    <LinearGradient colors={['#020617', '#0f172a', '#1e293b']} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#f8fafc" />
          </TouchableOpacity>

          <View style={styles.header}>
              <View style={styles.logoContainer}>
                  <Ionicons name="person-add" size={40} color="#ce0000" />
              </View>
              <Text style={styles.title}>Join RoomieMatch</Text>
              <Text style={styles.subtitle}>Create an account to find your perfect roommate</Text>
          </View>

          <View style={styles.form}>
              <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                      placeholder="Full Name"
                      placeholderTextColor="#64748b"
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                  />
              </View>

              <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                      placeholder="Email"
                      placeholderTextColor="#64748b"
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                  />
              </View>

              <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                      placeholder="Password"
                      placeholderTextColor="#64748b"
                      secureTextEntry
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                  />
              </View>

              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                  <LinearGradient 
                      colors={['#ce0000', '#990000']} 
                      start={{ x: 0, y: 0 }} 
                      end={{ x: 1, y: 0 }}
                      style={styles.gradientButton}
                  >
                      <Text style={styles.buttonText}>Sign Up</Text>
                  </LinearGradient>
              </TouchableOpacity>

              <View style={styles.footer}>
                  <Text style={styles.footerText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => router.back()}>
                      <Text style={styles.link}>Login</Text>
                  </TouchableOpacity>
              </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(206, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(206, 0, 0, 0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    color: '#f8fafc',
    fontSize: 16,
    paddingVertical: 14,
  },
  button: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#ce0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 15,
  },
  link: {
    color: '#ce0000',
    fontSize: 15,
    fontWeight: '700',
  },
});
