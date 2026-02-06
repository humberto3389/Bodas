import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: { circle: 40, stroke: 1.5, dot: 4 },
    md: { circle: 64, stroke: 2, dot: 6 },
    lg: { circle: 96, stroke: 3, dot: 8 }
  }

  const { circle, stroke, dot } = sizeMap[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-6 ${className}`}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: circle, height: circle }}
      >
        {/* Background static thin ring */}
        <svg
          width={circle}
          height={circle}
          viewBox={`0 0 ${circle} ${circle}`}
          className="absolute inset-0 opacity-10"
        >
          <circle
            cx={circle / 2}
            cy={circle / 2}
            r={(circle - stroke) / 2}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
          />
        </svg>

        {/* Animated drawing ring */}
        <motion.svg
          width={circle}
          height={circle}
          viewBox={`0 0 ${circle} ${circle}`}
          className="absolute inset-0 text-rose-500/80"
          initial={{ rotate: -90 }}
          animate={{ rotate: 270 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <motion.circle
            cx={circle / 2}
            cy={circle / 2}
            r={(circle - stroke) / 2}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            initial={{ pathLength: 0.1, opacity: 0.3 }}
            animate={{
              pathLength: [0.1, 0.5, 0.1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.svg>

        {/* Pulsing center glow */}
        <motion.div
          className="rounded-full bg-rose-500/10 blur-xl"
          style={{ width: circle * 1.5, height: circle * 1.5, position: 'absolute' }}
          animate={{
            scale: [0.8, 1.1, 0.8],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Very subtle center dot */}
        <motion.div
          className="rounded-full bg-rose-500/40"
          style={{ width: dot, height: dot }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {text && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="relative overflow-hidden">
            <motion.p
              className="text-[10px] tracking-[0.5em] text-slate-400 uppercase font-light"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {text}
            </motion.p>
            {/* Horizontal shimmer line */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <motion.div
            className="h-[0.5px] bg-rose-500/30"
            initial={{ width: 0 }}
            animate={{ width: 32 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
        </motion.div>
      )}
    </div>
  )
}
