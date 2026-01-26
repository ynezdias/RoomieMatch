import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
})

API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default API
//edited