import { getAuthToken } from '#/services/auth-storage'
import axios from 'axios'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5051'

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
})

httpClient.interceptors.request.use((config) => {
  const token = getAuthToken()

  if (token && !config.headers.has('Authorization'))
    config.headers.setAuthorization(`Bearer ${token}`)

  return config
})
