import { create } from 'zustand'
import { submitScan as apiSubmit, getScan } from '../api/client'
import type { ReportData } from '../types'

type ScanStatus = 'idle' | 'pending' | 'processing' | 'complete' | 'failed'

interface ScanStore {
  scanId: number | null
  scanStatus: ScanStatus
  ideaText: string
  report: ReportData | null
  error: string | null
  pollingInterval: ReturnType<typeof setInterval> | null
  pollingTimeout: ReturnType<typeof setTimeout> | null

  setIdea: (text: string) => void
  submitScan: (idea: string) => Promise<void>
  pollScan: () => Promise<void>
  startPolling: () => void
  stopPolling: () => void
  resetScan: () => void
}

export const useScanStore = create<ScanStore>((set, get) => ({
  scanId: null,
  scanStatus: 'idle',
  ideaText: '',
  report: null,
  error: null,
  pollingInterval: null,
  pollingTimeout: null,

  setIdea: (text) => set({ ideaText: text }),

  submitScan: async (idea) => {
    set({ scanStatus: 'pending', ideaText: idea, report: null, error: null })
    try {
      const res = await apiSubmit({ idea_text: idea })
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
      if (status === 'complete') {
        set({ scanStatus: 'complete', report: report ?? null })
        get().stopPolling()
      } else if (status === 'failed') {
        set({ scanStatus: 'failed', error: error || 'Scan failed.' })
        get().stopPolling()
      } else {
        set({ scanStatus: status as ScanStatus })
      }
    } catch {
      // network error — keep polling silently
    }
  },

  startPolling: () => {
    const interval = setInterval(() => get().pollScan(), 3000)
    const timeout = setTimeout(() => {
      get().stopPolling()
      if (get().scanStatus !== 'complete') {
        set({ scanStatus: 'failed', error: 'This is taking longer than expected. Try refreshing.' })
      }
    }, 120_000)
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
}))
