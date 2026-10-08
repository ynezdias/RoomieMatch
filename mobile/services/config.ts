import { Platform } from 'react-native'

const localApiUrl = Platform.OS === 'android'
  ? 'http://10.0.2.2:5000/api'
  : 'http://localhost:5000/api'

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || localApiUrl).replace(/\/+$/, '')
export const SOCKET_URL = (process.env.EXPO_PUBLIC_SOCKET_URL || API_URL.replace(/\/api$/, '')).replace(/\/+$/, '')
