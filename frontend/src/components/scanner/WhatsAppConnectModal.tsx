import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle } from 'lucide-react'

const WHATSAPP_URL =
  'https://wa.me/919035514817?text=Hi%20I%20just%20generated%20my%20IdeaProbe%20report%20and%20would%20like%20a%20free%20business%20consultation'

interface Props {
  visible: boolean
  onClose: () => void
}

export const WhatsAppConnectModal: React.FC<Props> = ({ visible, onClose }) => {
  const handleWhatsApp = () => {
    window.open(WHATSAPP_URL, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="wa-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          style={{ background: 'rgba(5,5,10,0.80)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            key="wa-card"
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="relative w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Green glow */}
            <div
              className="absolute -inset-6 rounded-3xl opacity-20 blur-3xl pointer-events-none"
              style={{ background: 'radial-gradient(circle, #22c55e 0%, #16a34a 60%, transparent 80%)' }}
            />

            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: 'rgba(10,10,20,0.99)', border: '1px solid rgba(99,102,241,0.25)' }}
            >
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)' }} />

              <button
                onClick={onClose}
                className="absolute top-3.5 right-3.5 w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={14} />
              </button>

              <div className="p-6 text-center">
                <div
                  className="w-13 h-13 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    width: 52, height: 52,
                    background: 'rgba(34,197,94,0.12)',
                    border: '1px solid rgba(34,197,94,0.28)',
                  }}
                >
                  <MessageCircle size={22} className="text-green-400" />
                </div>

                <h3 className="text-lg font-bold text-white mb-1">Connect With Us</h3>
                <p className="text-slate-500 text-xs mb-5">We'll help you turn this report into a real business</p>

                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] mb-3"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    boxShadow: '0 4px 18px rgba(34,197,94,0.38)',
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp Chat
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-2 rounded-xl text-xs text-slate-600 hover:text-slate-400 hover:bg-white/5 border border-white/5 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
