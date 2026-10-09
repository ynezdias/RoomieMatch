import React, { createContext, useContext, useState, useEffect } from 'react'
import { palette as p } from '@/constants/design'
import AsyncStorage from '@react-native-async-storage/async-storage'

const LightColors = {
  background: '#FFFFFF',
  text: '#000000',
  primary: p.primary,
  secondary: '#E0E0E0',
  bubbleSelf: '#ce0000',
  bubbleOther: '#F0F0F0',
  inputBackground: '#F9F9F9',
  border: '#E0E0E0',
  error: p.error,
}

const DarkColors = {
  background: p.canvas,
  text: p.ink,
  primary: p.primary,
  secondary: p.sage,
  bubbleSelf: p.dark, // Slightly darker red
  bubbleOther: p.surface,
  inputBackground: p.surface,
  border: p.line,
  error: p.error,
}

const ThemeContext = createContext({
  isDark: false,
  colors: LightColors,
  toggleTheme: () => {},
})

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = 'dark'
  const [isDark, setIsDark] = useState(systemScheme === 'dark')

  useEffect(() => {
    loadTheme()
  }, [])

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('theme')
      if (saved === 'dark') {
        setIsDark(saved === 'dark')
      }
    } catch {
      console.log('Failed to load theme')
    }
  }

  const toggleTheme = async () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  const colors = isDark ? DarkColors : LightColors

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
