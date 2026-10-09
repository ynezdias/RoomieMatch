import { Platform } from 'react-native'

const localApiUrl = Platform.OS === 'android'
  ? 'http://10.0.2.2:5000/api'
  : 'http://localhost:5000/api'

const webApiUrl = Platform.OS === 'web' && !__DEV__ && typeof window !== 'undefined'
  ? `${window.location.origin}/api` : localApiUrl
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || webApiUrl).replace(/\/+$/, '')
export const SOCKET_URL = (process.env.EXPO_PUBLIC_SOCKET_URL || API_URL.replace(/\/api$/, '')).replace(/\/+$/, '')
