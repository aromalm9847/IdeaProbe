import React, { useEffect, useRef, useState } from 'react'

const GIS_SRC = 'https://accounts.google.com/gsi/client'

declare global {
  interface Window {
    google?: any
    __gsiScriptLoading?: Promise<void>
  }
}

function loadGsi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.google?.accounts?.id) return Promise.resolve()
  if (window.__gsiScriptLoading) return window.__gsiScriptLoading
  window.__gsiScriptLoading = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GIS_SRC}"]`) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('GIS load failed')))
      return
    }
    const s = document.createElement('script')
    s.src = GIS_SRC
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('GIS load failed'))
    document.head.appendChild(s)
  })
  return window.__gsiScriptLoading
}

interface Props {
  onCredential: (idToken: string) => void
  onError?: (msg: string) => void
  text?: 'signin_with' | 'signup_with' | 'continue_with'
}

export const GoogleSignInButton: React.FC<Props> = ({ onCredential, onError, text = 'continue_with' }) => {
  const ref = useRef<HTMLDivElement>(null)
  const onCredentialRef = useRef(onCredential)
  const onErrorRef = useRef(onError)
  const [unconfigured, setUnconfigured] = useState(false)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

  // Keep latest callbacks in refs so the init effect can stay stable.
  useEffect(() => { onCredentialRef.current = onCredential }, [onCredential])
  useEffect(() => { onErrorRef.current = onError }, [onError])

  useEffect(() => {
    if (!clientId) { setUnconfigured(true); return }
    let cancelled = false
    loadGsi()
      .then(() => {
        if (cancelled || !ref.current || !window.google?.accounts?.id) return
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (resp: { credential?: string }) => {
            if (resp?.credential) onCredentialRef.current(resp.credential)
            else onErrorRef.current?.('Google sign-in was cancelled.')
          },
          ux_mode: 'popup',
          auto_select: false,
        })
        window.google.accounts.id.renderButton(ref.current, {
          theme: 'outline',
          size: 'large',
          text,
          shape: 'pill',
          logo_alignment: 'left',
          width: ref.current.clientWidth || 320,
        })
      })
      .catch(() => onErrorRef.current?.('Could not load Google sign-in.'))
    return () => { cancelled = true }
  }, [clientId, text])

  if (unconfigured) return null
  return <div ref={ref} className="w-full flex justify-center" />
}
