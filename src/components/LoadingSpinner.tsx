import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28'
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-8 ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-400/20 to-amber-400/20 blur-xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Rotating outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-tr from-rose-500 via-rose-400 to-amber-500 bg-clip-border"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)'
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Counter-rotating inner ring */}
        <motion.div
          className="absolute inset-3 rounded-full border-2 border-transparent bg-gradient-to-bl from-amber-400 via-rose-400 to-rose-500 bg-clip-border"
          style={{
            maskImage: 'linear-gradient(to top, transparent 0%, black 25%, black 75%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 25%, black 75%, transparent 100%)'
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />

        {/* Center pulsing dot */}
        <motion.div
          className="absolute inset-[38%] rounded-full bg-gradient-to-br from-rose-500 to-amber-500 shadow-lg"
          animate={{
            scale: [1, 1.3, 1],
            boxShadow: [
              '0 0 20px rgba(244, 63, 94, 0.5)',
              '0 0 40px rgba(245, 158, 11, 0.8)',
              '0 0 20px rgba(244, 63, 94, 0.5)'
            ]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-elegant tracking-[0.3em] text-slate-600 font-medium"
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}
