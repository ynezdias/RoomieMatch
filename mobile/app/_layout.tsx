import { useEffect } from 'react'
import { Platform } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { palette } from '@/constants/design'
import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AuthProvider } from '../src/context/AuthContext'
import { ThemeProvider } from '../src/context/ThemeContext'

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.colorScheme = 'dark'
      document.documentElement.style.backgroundColor = palette.canvas
      document.body.style.backgroundColor = palette.canvas
      const style = document.createElement('style')
      style.textContent = `input, textarea { color-scheme: dark; }
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus {
          -webkit-text-fill-color: ${palette.ink}; caret-color: ${palette.ink};
          transition: background-color 99999s ease-out 0s;
        }`
      document.head.appendChild(style)
      return () => style.remove()
    }
  }, [])
  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: palette.canvas }}
    >
      <AuthProvider>
        <ThemeProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: palette.canvas },
            }}
          />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  )
}
//edited
