// import axios from 'axios'

// const API = axios.create({
//   baseURL: 'http://localhost:5000',
// })

// API.interceptors.request.use((req) => {
//   const token = localStorage.getItem('token')
//   if (token) {
//     req.headers.Authorization = `Bearer ${token}`
//   }
//   return req
// })

// export default API
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

// ⚡ IMPORTANT: replace with your computer IP if testing on a real device
const API_BASE_URL = 'http://localhost:5000'

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default api


