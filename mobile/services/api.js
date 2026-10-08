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
import { API_URL } from './config'

const API = axios.create({
  baseURL: API_URL,
  timeout: 20000,
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
