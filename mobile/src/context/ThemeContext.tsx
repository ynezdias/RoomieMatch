import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LightColors = {
    background: '#FFFFFF',
    text: '#000000',
    primary: '#4CAF50',
    secondary: '#E0E0E0',
    bubbleSelf: '#4CAF50',
    bubbleOther: '#F0F0F0',
    inputBackground: '#F9F9F9',
    border: '#E0E0E0',
    error: '#FF5252'
};

const DarkColors = {
    background: '#121212',
    text: '#FFFFFF',
    primary: '#4CAF50',
    secondary: '#333333',
    bubbleSelf: '#388E3C', // Slightly darker green
    bubbleOther: '#333333',
    inputBackground: '#1E1E1E',
    border: '#333333',
    error: '#FF5252'
};

const ThemeContext = createContext({
    isDark: false,
    colors: LightColors,
    toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
    const systemScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemScheme === 'dark');

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const saved = await AsyncStorage.getItem('theme');
            if (saved) {
                setIsDark(saved === 'dark');
            }
        } catch (e) {
            console.log('Failed to load theme');
        }
    };

    const toggleTheme = async () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    };

    const colors = isDark ? DarkColors : LightColors;

    return (
        <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
