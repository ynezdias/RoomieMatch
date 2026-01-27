// import axios from 'axios'
// import AsyncStorage from '@react-native-async-storage/async-storage'

// const API = axios.create({
//   baseURL: 'http://localhost:5000/api',
// })

// API.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem('token')
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config
// })

// export default API
// //edited

import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const API = axios.create({
  baseURL: Platform.select({
    web: 'http://localhost:5000/api',
    default: 'http://192.168.1.159:5000/api', // 👈 your Expo IP
  }),
})

API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default API
