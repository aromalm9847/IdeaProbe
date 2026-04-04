import axios from 'axios'
import type { ScanRequest, ScanResponse, LeaderboardEntry, MRRRequest, MRRResponse, ExampleReport } from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
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

export const getLeaderboard = () =>
  api.get<LeaderboardEntry[]>('/api/leaderboard')

export const getMRREstimate = (body: MRRRequest) =>
  api.post<MRRResponse>('/api/mrr-estimate', body)

export const getExamples = () =>
  api.get<ExampleReport[]>('/api/examples')

export const getExampleBySlug = (slug: string) =>
  api.get<ExampleReport>(`/api/examples/${slug}`)
