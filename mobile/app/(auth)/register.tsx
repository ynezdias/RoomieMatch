import { displayFont } from '@/constants/design'
import { View, Text, TextInput, TouchableOpacity, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Button, FormNotice } from '@/components/app-ui';
import api from '../../services/api'
import { useAuth } from '@/src/context/AuthContext'

export default function Register() {
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('');
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('')

  const handleRegister = async () => {
    if (loading) return
    setError('')
    if (!name.trim() || !email.trim() || password.length < 8) {
      setError('Enter your name, email, and a password of at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
      })
      await login(res.data.token, res.data.user)
      router.replace('/(protected)/(tabs)/profile')
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Could not create your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <LinearGradient colors={['#100E11', '#100E11', '#2C2026']} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#F5EEEE" />
          </TouchableOpacity>

          <View style={styles.header}>
              <View style={styles.logoContainer}>
                  <Ionicons name="person-add" size={40} color="#F27886" />
              </View>
              <Text style={styles.title}>Join RoomieMatch</Text>
              <Text style={styles.subtitle}>Create an account to find your perfect roommate</Text>
          </View>

          <View style={styles.form}>
              <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#AEA6AB" style={styles.inputIcon} />
                  <TextInput
                      accessibilityLabel="Full Name"
                      autoComplete="name"
                      placeholder="Full Name"
                      placeholderTextColor="#AEA6AB"
                      style={styles.input}
                      value={name}
                      onChangeText={(value) => { setName(value); setError(''); }}
                  />
              </View>

              <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#AEA6AB" style={styles.inputIcon} />
                  <TextInput
                      accessibilityLabel="Email"
                    keyboardType="email-address"
                    autoComplete="email"
                    autoCorrect={false}
                    placeholder="Email"
                      placeholderTextColor="#AEA6AB"
                      style={styles.input}
                      value={email}
                      onChangeText={(value) => { setEmail(value); setError(''); }}
                      autoCapitalize="none"
                  />
              </View>

              <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#AEA6AB" style={styles.inputIcon} />
                  <TextInput
                      placeholder="Password"
                      placeholderTextColor="#AEA6AB"
                      secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    accessibilityLabel="Password"
                      style={styles.input}
                      value={password}
                      onChangeText={(value) => { setPassword(value); setError(''); }}
                  />
                <Pressable accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  accessibilityState={{ checked: showPassword }}
                  onPress={() => setShowPassword((visible) => !visible)}
                  style={styles.passwordToggle}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#AEA6AB" />
                </Pressable>
              </View>

            <View style={{ marginTop: 12 }}><Button title="Sign Up" onPress={handleRegister} loading={loading} loadingLabel="Creating account…" /></View>
            <FormNotice message={error} />

              <View style={styles.footer}>
                  <Text style={styles.footerText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => router.replace('/login')}>
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
  scrollContent: { width: '100%', maxWidth: 520, alignSelf: 'center',
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
    backgroundColor: '#2C2026',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2C2026',
  },
  title: {
    fontFamily: displayFont, fontSize: 28,
    fontWeight: '800',
    color: '#F5EEEE',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: displayFont, fontSize: 15,
    color: '#AEA6AB',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3038',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  passwordToggle: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  input: {
    minWidth: 0,
    flex: 1,
    backgroundColor: 'transparent',
    color: '#F5EEEE',
    fontFamily: displayFont, fontSize: 16,
    paddingVertical: 14,
  },
  button: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#C93B4F',
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
    fontFamily: displayFont, fontSize: 18,
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
    color: '#AEA6AB',
    fontFamily: displayFont, fontSize: 15,
  },
  link: {
    color: '#F27886',
    fontFamily: displayFont, fontSize: 15,
    fontWeight: '700',
  },
});
