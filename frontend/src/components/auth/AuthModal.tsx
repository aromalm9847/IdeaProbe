import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import axios from 'axios'

const API = import.meta.env.VITE_API_BASE_URL || 'https://backend-production-603e.up.railway.app'

type ModalMode = 'login' | 'register' | 'forgot' | 'otp_verify' | 'reset_password'
type LoginMethod = 'email' | 'phone'

// ── Defined outside AuthModal to prevent remount on every keystroke ────────────
const PasswordField: React.FC<{
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  show: boolean
  onToggle: () => void
  minLength?: number
  required?: boolean
  autoFocus?: boolean
  extra?: React.ReactNode
}> = ({ label, value, onChange, placeholder = '••••••••', show, onToggle, minLength, required = true, autoFocus = false, extra }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      {extra}
    </div>
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-premium w-full px-4 py-3 pr-11 text-sm"
        required={required}
        minLength={minLength}
        autoFocus={autoFocus}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  </div>
)

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalMode, closeAuthModal, setUser, setGuest } = useAuthStore()

  const [mode, setMode] = useState<ModalMode>(authModalMode as ModalMode)
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email')

  // Form fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [forgotIdentifier, setForgotIdentifier] = useState('')
  const [newPassword, setNewPassword] = useState('')

  // Show/hide password toggles
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpPurpose, setOtpPurpose] = useState<'forgot_password' | 'phone_login' | 'email_otp'>('forgot_password')
  const [devOtp, setDevOtp] = useState('')

  useEffect(() => {
    setMode(authModalMode as ModalMode)
    resetForm()
  }, [authModalMode, isAuthModalOpen])

  if (!isAuthModalOpen) return null

  function resetForm() {
    setError('')
    setSuccess('')
    setOtpCode('')
    setOtpSent(false)
    setFullName('')
    setEmail('')
    setPhone('')
    setPassword('')
    setConfirmPassword('')
    setForgotIdentifier('')
    setNewPassword('')
    setDevOtp('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setShowNewPassword(false)
  }

  function switchMode(m: ModalMode) {
    setMode(m)
    resetForm()
  }

  const getIdentifier = () => loginMethod === 'email' ? email : phone

  // ── Login (email/phone + password) ───────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API}/api/auth/login`, {
        identifier: getIdentifier(),
        password,
      })
      setUser(res.data)
      closeAuthModal()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Register ──────────────────────────────────────────────────────────────

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API}/api/auth/register`, {
        full_name: fullName,
        email: email || '',
        phone: phone || '',
        password,
      })
      setUser(res.data)
      closeAuthModal()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── OTP Login ─────────────────────────────────────────────────────────────

  const handleSendOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const identifier = getIdentifier()
    if (!identifier) { setError('Please enter your email or phone number.'); return }
    setLoading(true)
    setError('')
    const purpose = loginMethod === 'phone' ? 'phone_login' : 'email_otp'
    setOtpPurpose(purpose)
    try {
      const res = await axios.post(`${API}/api/auth/send-otp`, { identifier, purpose })
      setOtpSent(true)
      if (res.data.dev_code) {
        setDevOtp(res.data.dev_code)
        setSuccess(`Dev mode — no email configured. Your OTP is shown below.`)
      } else {
        setSuccess(`OTP sent to your ${loginMethod}. Check and enter below.`)
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API}/api/auth/otp-login`, {
        identifier: getIdentifier(),
        code: otpCode,
      })
      setUser(res.data)
      closeAuthModal()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Forgot Password ───────────────────────────────────────────────────────

  const handleSendForgotOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotIdentifier) { setError('Please enter your email or phone number.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API}/api/auth/send-otp`, {
        identifier: forgotIdentifier,
        purpose: 'forgot_password',
      })
      setOtpSent(true)
      if (res.data.dev_code) {
        setDevOtp(res.data.dev_code)
        setSuccess(`Dev mode — no email configured. Your OTP is shown below.`)
      } else {
        setSuccess('OTP sent! Check your email or phone.')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API}/api/auth/reset-password`, {
        identifier: forgotIdentifier,
        code: otpCode,
        new_password: newPassword,
      })
      setUser(res.data)
      setSuccess('Password reset successfully! Logging you in...')
      setTimeout(() => closeAuthModal(), 1200)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = () => {
    setGuest(true)
    closeAuthModal()
  }

  // ── Shared UI ─────────────────────────────────────────────────────────────

  const MethodToggle = () => (
    <div className="flex rounded-xl overflow-hidden mb-4" style={{ border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(0,0,0,0.3)' }}>
      {(['email', 'phone'] as LoginMethod[]).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => { setLoginMethod(m); setError(''); setOtpSent(false); setSuccess(''); setDevOtp('') }}
          className="flex-1 py-2.5 text-sm font-medium transition-all"
          style={{
            background: loginMethod === m ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
            color: loginMethod === m ? 'white' : '#94a3b8',
          }}
        >
          {m === 'email' ? '✉️ Email' : '📱 Phone'}
        </button>
      ))}
    </div>
  )

  const ErrorMsg = () => error ? (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
      {error}
    </motion.div>
  ) : null

  const SuccessMsg = () => success ? (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
      {success}
    </motion.div>
  ) : null

  const DevOtpBanner = () => devOtp ? (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-lg px-3 py-2.5 text-center"
      style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}>
      <p className="text-xs text-yellow-400 mb-1">Dev mode — OTP code (no email configured)</p>
      <button
        type="button"
        onClick={() => setOtpCode(devOtp)}
        className="font-mono text-xl font-bold tracking-[0.3em] text-yellow-300 hover:text-yellow-100 transition-colors"
        title="Click to auto-fill"
      >
        {devOtp}
      </button>
      <p className="text-xs text-yellow-600 mt-1">Click code to auto-fill</p>
    </motion.div>
  ) : null

  const SubmitBtn = ({ label, loadingLabel }: { label: string; loadingLabel: string }) => (
    <button type="submit" disabled={loading}
      className="btn-premium w-full py-3 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed mt-2">
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {loadingLabel}
        </span>
      ) : label}
    </button>
  )

  const OTPInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">6-Digit OTP Code</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="123456"
        className="input-premium w-full px-4 py-3 text-sm text-center tracking-[0.5em] font-mono"
        maxLength={6}
        required
        autoFocus
      />
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────

  const titles: Record<ModalMode, { title: string; subtitle: string }> = {
    login: { title: 'Welcome back', subtitle: 'Sign in to access your scan history' },
    register: { title: 'Create account', subtitle: 'Join 2,500+ founders validating ideas' },
    forgot: { title: 'Reset password', subtitle: 'Enter your email or phone to receive an OTP' },
    otp_verify: { title: 'Enter OTP', subtitle: 'Check your email or phone for the code' },
    reset_password: { title: 'New password', subtitle: 'Set a new password for your account' },
  }

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeAuthModal()}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-md mx-4"
        >
          {/* Glow */}
          <div className="absolute -inset-4 rounded-3xl opacity-30 blur-2xl"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.5), rgba(139,92,246,0.3), transparent)' }} />

          {/* Card */}
          <div className="relative glass-strong rounded-2xl overflow-hidden"
            style={{ background: 'rgba(10, 10, 20, 0.97)', border: '1px solid rgba(99,102,241,0.25)' }}>

            {/* Header bar */}
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)' }} />

            <div className="p-8">
              {/* Logo + title */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 animate-pulse-glow"
                  style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))', border: '1px solid rgba(99,102,241,0.4)' }}>
                  <span className="text-2xl">🔍</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-white">{titles[mode].title}</h2>
                <p className="text-slate-400 text-sm mt-1">{titles[mode].subtitle}</p>
              </div>

              {/* ── LOGIN FORM ── */}
              {mode === 'login' && (
                <div className="space-y-4">
                  <MethodToggle />
                  {!otpSent ? (
                    <>
                      <form onSubmit={handleLogin} className="space-y-4">
                        {loginMethod === 'email' ? (
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                              placeholder="you@example.com" className="input-premium w-full px-4 py-3 text-sm" required autoFocus />
                          </div>
                        ) : (
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone Number</label>
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                              placeholder="+91 98765 43210" className="input-premium w-full px-4 py-3 text-sm" required autoFocus />
                          </div>
                        )}
                        <PasswordField
                          label="Password"
                          value={password}
                          onChange={setPassword}
                          show={showPassword}
                          onToggle={() => setShowPassword(v => !v)}
                          extra={
                            <button type="button" onClick={() => switchMode('forgot')}
                              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                              Forgot password?
                            </button>
                          }
                        />
                        <ErrorMsg />
                        <SubmitBtn label="Sign In →" loadingLabel="Signing in..." />
                      </form>
                      <button type="button" onClick={handleSendOTPLogin}
                        className="w-full py-2.5 text-sm text-slate-400 hover:text-indigo-300 transition-colors text-center">
                        Or login with OTP code →
                      </button>
                    </>
                  ) : (
                    <form onSubmit={handleOTPLogin} className="space-y-4">
                      <SuccessMsg />
                      <DevOtpBanner />
                      <OTPInput value={otpCode} onChange={setOtpCode} />
                      <ErrorMsg />
                      <SubmitBtn label="Verify & Sign In →" loadingLabel="Verifying..." />
                      <button type="button" onClick={() => { setOtpSent(false); setSuccess(''); setError(''); setDevOtp('') }}
                        className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors text-center mt-1">
                        ← Back to password login
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* ── REGISTER FORM ── */}
              {mode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder="Arjun Sharma" className="input-premium w-full px-4 py-3 text-sm" required autoFocus />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" className="input-premium w-full px-4 py-3 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Phone Number <span className="text-slate-600">(optional if email provided)</span>
                    </label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98765 43210" className="input-premium w-full px-4 py-3 text-sm" />
                  </div>
                  <PasswordField
                    label="Password"
                    value={password}
                    onChange={setPassword}
                    placeholder="At least 6 characters"
                    show={showPassword}
                    onToggle={() => setShowPassword(v => !v)}
                    minLength={6}
                  />
                  <PasswordField
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="Repeat your password"
                    show={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword(v => !v)}
                    minLength={6}
                  />
                  <ErrorMsg />
                  <SubmitBtn label="Create Account →" loadingLabel="Creating account..." />
                </form>
              )}

              {/* ── FORGOT PASSWORD FORM ── */}
              {mode === 'forgot' && (
                <div className="space-y-4">
                  {!otpSent ? (
                    <form onSubmit={handleSendForgotOTP} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Email or Phone Number</label>
                        <input type="text" value={forgotIdentifier} onChange={e => setForgotIdentifier(e.target.value)}
                          placeholder="you@example.com or +91 98765 43210"
                          className="input-premium w-full px-4 py-3 text-sm" required autoFocus />
                      </div>
                      <ErrorMsg />
                      <SubmitBtn label="Send OTP →" loadingLabel="Sending OTP..." />
                    </form>
                  ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <SuccessMsg />
                      <DevOtpBanner />
                      <OTPInput value={otpCode} onChange={setOtpCode} />
                      <PasswordField
                        label="New Password"
                        value={newPassword}
                        onChange={setNewPassword}
                        placeholder="At least 6 characters"
                        show={showNewPassword}
                        onToggle={() => setShowNewPassword(v => !v)}
                        minLength={6}
                      />
                      <ErrorMsg />
                      <SubmitBtn label="Reset Password →" loadingLabel="Resetting..." />
                      <button type="button" onClick={() => { setOtpSent(false); setSuccess(''); setError(''); setDevOtp('') }}
                        className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors text-center mt-1">
                        ← Resend OTP
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* ── DIVIDER + GUEST ── */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <span className="text-xs text-slate-600">or</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              </div>

              <button onClick={handleGuest}
                className="w-full py-2.5 text-sm text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5 border border-white/5 font-medium">
                Continue without account →
              </button>

              {/* ── SWITCH MODE ── */}
              <div className="mt-5 rounded-xl p-3 text-center"
                style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
                {mode === 'login' && (
                  <>
                    <p className="text-sm text-slate-400">New to IdeaProbe?</p>
                    <button onClick={() => switchMode('register')}
                      className="mt-1 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors hover:underline underline-offset-2">
                      ✨ Create a free account →
                    </button>
                  </>
                )}
                {(mode === 'register' || mode === 'forgot') && (
                  <>
                    <p className="text-sm text-slate-400">Already have an account?</p>
                    <button onClick={() => switchMode('login')}
                      className="mt-1 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors hover:underline underline-offset-2">
                      ← Sign in instead
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Close */}
          <button onClick={closeAuthModal}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-white hover:bg-white/10 transition-all">
            ✕
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
