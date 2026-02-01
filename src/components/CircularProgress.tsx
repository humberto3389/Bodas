import { motion } from 'framer-motion'

interface CircularProgressProps {
  progress: number // 0-100
  size?: number // tamaño en píxeles (por defecto 40)
}

export function CircularProgress({ progress = 0, size = 40 }: CircularProgressProps) {
  const circumference = 2 * Math.PI * 45 // radius = 45
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg className="absolute inset-0" viewBox="0 0 100 100" style={{ width: size, height: size }}>
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-slate-200"
        />
      </svg>

      {/* Progress circle */}
      <svg
        className="absolute inset-0 transform -rotate-90"
        viewBox="0 0 100 100"
        style={{ width: size, height: size }}
      >
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>

      {/* Progress text */}
      <span className="relative text-xs font-semibold text-slate-700" style={{ fontSize: size * 0.25 }}>
        {progress}%
      </span>
    </div>
  )
}
