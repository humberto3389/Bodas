import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-6 ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Warm outer halo */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-300/30 via-rose-300/20 to-amber-200/30 blur-2xl"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Inner rose halo */}
        <motion.div
          className="absolute inset-2 rounded-full bg-gradient-to-br from-rose-400/20 to-amber-400/20 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.3, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Minimalist center dot */}
        <motion.div
          className="absolute inset-[42%] rounded-full bg-gradient-to-br from-rose-400 to-amber-400"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs tracking-[0.4em] text-slate-500 uppercase font-medium"
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}
