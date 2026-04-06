import axios from 'axios'
import type { ScanRequest, ScanResponse } from '../types'

export const API_BASE = 'https://ideaprobe-production-825e.up.railway.app'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120_000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.message = 'Network error — please check your connection.'
    }
    return Promise.reject(error)
  }
)

export const submitScan = (body: ScanRequest, token?: string) =>
  api.post<ScanResponse>('/api/scan', body, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

export const getScan = (id: number) =>
  api.get<ScanResponse>(`/api/scan/${id}`)

export const loginUser = (identifier: string, password: string) =>
  api.post('/api/auth/login', { identifier, password })

export const registerUser = (data: {
  full_name: string
  email: string
  password: string
}) => api.post('/api/auth/register', data)

export const getUserHistory = (token: string) =>
  api.get('/api/auth/scan-history', {
    headers: { Authorization: `Bearer ${token}` },
  })
