import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-6 ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer Ring */}
        <motion.div
          className="absolute inset-0 border-2 border-rose-100 rounded-full"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {/* Inner Ring */}
        <motion.div
          className="absolute inset-2 border-2 border-gold/40 border-t-gold rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        {/* Center Heart/Dot */}
        <motion.div
          className="absolute inset-[42%] bg-rose-500 rounded-full shadow-lg shadow-rose-200"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </div>

      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs font-elegant uppercase tracking-[0.4em] text-neutral-400 font-bold"
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}
