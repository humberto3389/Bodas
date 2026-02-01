import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  id: string
  type: ToastType
  message: string
  duration?: number
  onClose: (id: string) => void
}

export function Toast({ id, type, message, duration = 3500, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration)
    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-amber-500',
  }[type]

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ⓘ',
    warning: '⚠',
  }[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: 100 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 20, x: 100 }}
      className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[320px] backdrop-blur-sm`}
    >
      <div className="text-xl font-bold flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <p className="font-medium text-sm">{message}</p>
      </div>
    </motion.div>
  )
}

interface ToastContainerProps {
  toasts: Array<{
    id: string
    type: ToastType
    message: string
    duration?: number
  }>
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-auto">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onClose={onClose}
          />
        ))}
      </div>
    </AnimatePresence>
  )
}
