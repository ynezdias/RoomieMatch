import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

// api.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem('token')
//   console.log('🪪 TOKEN SENT:', token)

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }

//   return config
// })

const api = axios.create({
  baseURL: 'http://localhost:5000',
})

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api
