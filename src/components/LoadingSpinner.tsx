import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-40 h-40'
  }

  const ringSize = {
    sm: { outer: 'w-20 h-20', middle: 'w-14 h-14', inner: 'w-8 h-8' },
    md: { outer: 'w-28 h-28', middle: 'w-20 h-20', inner: 'w-12 h-12' },
    lg: { outer: 'w-40 h-40', middle: 'w-28 h-28', inner: 'w-16 h-16' }
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-8 ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Ambient glow background */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Outer ring - slowest rotation */}
        <motion.div
          className={`absolute inset-0 ${ringSize[size].outer} mx-auto my-auto`}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-full h-full rounded-full border-[3px] border-transparent bg-gradient-to-r from-rose-500 via-purple-500 to-transparent bg-clip-border" style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)'
          }} />
        </motion.div>

        {/* Middle ring - medium rotation */}
        <motion.div
          className={`absolute inset-0 ${ringSize[size].middle} mx-auto my-auto`}
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-full h-full rounded-full border-[3px] border-transparent bg-gradient-to-r from-purple-500 via-indigo-500 to-transparent bg-clip-border" style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)'
          }} />
        </motion.div>

        {/* Inner ring - fastest rotation */}
        <motion.div
          className={`absolute inset-0 ${ringSize[size].inner} mx-auto my-auto`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-full h-full rounded-full border-[2px] border-transparent bg-gradient-to-r from-indigo-500 via-rose-500 to-transparent bg-clip-border" />
        </motion.div>

        {/* Center dot with pulse */}
        <motion.div
          className="absolute inset-0 w-3 h-3 mx-auto my-auto rounded-full bg-gradient-to-br from-rose-400 to-purple-500 shadow-lg shadow-purple-500/50"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm tracking-[0.3em] text-slate-600 uppercase font-semibold"
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}
