import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { submitScan as apiSubmit, getScan, API_BASE } from '../api/client'
import axios from 'axios'
import type { ReportData, HistoryEntry } from '../types'

type ScanStatus = 'idle' | 'pending' | 'processing' | 'complete' | 'failed'

async function wakeupBackend() {
  try {
    await axios.get(`${API_BASE}/health`, { timeout: 60_000 })
  } catch {
    // ignore
  }
}

interface ScanStore {
  scanId: number | null
  scanStatus: ScanStatus
  ideaText: string
  report: ReportData | null
  error: string | null
  history: HistoryEntry[]
  pollingInterval: ReturnType<typeof setInterval> | null
  pollingTimeout: ReturnType<typeof setTimeout> | null

  setIdea: (text: string) => void
  submitScan: (idea: string, token?: string) => Promise<void>
  pollScan: () => Promise<void>
  startPolling: () => void
  stopPolling: () => void
  resetScan: () => void
  addToHistory: (entry: HistoryEntry) => void
  clearHistory: () => void
}

export const useScanStore = create<ScanStore>()(
  persist(
    (set, get) => ({
      scanId: null,
      scanStatus: 'idle',
      ideaText: '',
      report: null,
      error: null,
      history: [],
      pollingInterval: null,
      pollingTimeout: null,

      setIdea: (text) => set({ ideaText: text }),

      submitScan: async (idea, token) => {
        set({ scanStatus: 'pending', ideaText: idea, report: null, error: null })
        await wakeupBackend()
        try {
          const res = await apiSubmit({ idea_text: idea }, token)
          set({ scanId: res.data.scan_id, scanStatus: 'pending' })
          get().startPolling()
        } catch (e: unknown) {
          const err = e as { response?: { data?: { detail?: string } }; message?: string }
          set({
            scanStatus: 'failed',
            error: err?.response?.data?.detail || err?.message || 'Failed to start scan.',
          })
        }
      },

      pollScan: async () => {
        const { scanId } = get()
        if (!scanId) return
        try {
          const res = await getScan(scanId)
          const { status, report, error } = res.data
          if (status === 'complete' && report) {
            set({ scanStatus: 'complete', report })
            get().stopPolling()
            get().addToHistory({
              scan_id: scanId,
              idea_text: get().ideaText,
              score: report.score,
              verdict: report.verdict,
              scanned_at: new Date().toISOString(),
              report,
            })
          } else if (status === 'failed') {
            set({ scanStatus: 'failed', error: error || 'Scan failed.' })
            get().stopPolling()
          } else {
            set({ scanStatus: status as ScanStatus })
          }
        } catch {
          // network error — keep polling
        }
      },

      startPolling: () => {
        const interval = setInterval(() => get().pollScan(), 3000)
        const timeout = setTimeout(() => {
          get().stopPolling()
          if (get().scanStatus !== 'complete') {
            set({ scanStatus: 'failed', error: 'Taking too long. Please try again.' })
          }
        }, 180_000)
        set({ pollingInterval: interval, pollingTimeout: timeout })
      },

      stopPolling: () => {
        const { pollingInterval, pollingTimeout } = get()
        if (pollingInterval) clearInterval(pollingInterval)
        if (pollingTimeout) clearTimeout(pollingTimeout)
        set({ pollingInterval: null, pollingTimeout: null })
      },

      resetScan: () => {
        get().stopPolling()
        set({ scanId: null, scanStatus: 'idle', ideaText: '', report: null, error: null })
      },

      addToHistory: (entry) => {
        set((state) => ({
          history: [entry, ...state.history.slice(0, 19)], // keep last 20
        }))
      },

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'ideaprobe-scans',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ history: state.history }),
    }
  )
)
