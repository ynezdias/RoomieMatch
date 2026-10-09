import { displayFont } from '@/constants/design'
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { Button, FormNotice } from '@/components/app-ui';
import api from '../services/api';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (loading) return;
    setError('');
    if (!email.trim() || !password) { setError('Please enter your email and password.'); return; }
    
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      await login(res.data.token, res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.msg === 'Invalid credentials' ? 'Wrong password. Check your email and try again.' : err.response?.data?.msg || 'Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#100E11', '#100E11', '#2C2026']} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <View style={styles.header}>
            <View style={styles.logoContainer}>
                <Ionicons name="home" size={40} color="#F27886" />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Log in to continue your roommate search</Text>
        </View>

        <View style={styles.form}>
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
                    autoComplete="current-password"
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

            <View style={{ marginTop: 12 }}><Button title="Login" onPress={handleLogin} loading={loading} loadingLabel="Signing in…" /></View>
            <FormNotice message={error} />

            <View style={styles.footer}>
                <Text style={styles.footerText}>Don&apos;t have an account? </Text>
                <Pressable onPress={() => router.push('/register')}>
                    <Text style={styles.link}>Create Account</Text>
                </Pressable>
            </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: { width: '100%', maxWidth: 520, alignSelf: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
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
    fontFamily: displayFont, fontSize: 32,
    fontWeight: '800',
    color: '#F5EEEE',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: displayFont, fontSize: 16,
    color: '#AEA6AB',
    textAlign: 'center',
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
