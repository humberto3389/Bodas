import { motion } from 'framer-motion';

export function SectionTitle({ children, color = 'gold', subtitle }: { children: React.ReactNode, color?: 'rose' | 'amber' | 'gold', subtitle?: string }) {
    const colorClasses = {
        rose: 'from-rose-400/20 via-rose-600 to-rose-400/20',
        amber: 'from-rose-400/20 via-amber-500 to-rose-400/20',
        gold: 'from-rose-400/20 via-amber-600 to-rose-400/20'
    };

    const gradientText = {
        rose: 'from-slate-900 via-rose-500 to-slate-800',
        amber: 'from-slate-900 via-amber-500 to-slate-800',
        gold: 'from-slate-900 via-amber-500 to-slate-800'
    };

    return (
        <div className="mb-16 text-center relative">
            {/* Halo decorativo de título */}
            <div className="absolute inset-0 -z-10 flex justify-center items-center pointer-events-none">
                <div className="w-[350px] h-[350px] bg-rose-100/40 blur-[90px] rounded-full" />
            </div>
            {subtitle && (
                <motion.span
                    initial={{ opacity: 0, letterSpacing: '0.1em' }}
                    whileInView={{ opacity: 1, letterSpacing: '0.4em' }}
                    viewport={{ once: true }}
                    className="block text-[10px] sm:text-xs font-elegant uppercase text-slate-900/60 mb-4 tracking-[0.4em] font-black"
                >
                    {subtitle}
                </motion.span>
            )}

            <div className="relative inline-block">
                <motion.h2
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className={`font-brush text-5xl sm:text-7xl bg-gradient-to-r ${gradientText[color]} bg-clip-text text-transparent pb-2`}
                >
                    {children}
                </motion.h2>

                {/* Decorative Elements */}
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    whileInView={{ width: '100%', opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 1 }}
                    className={`h-0.5 bg-gradient-to-r ${colorClasses[color]} rounded-full mt-2`}
                />

                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-2 border-gold rounded-full shadow-sm"
                />
            </div>
        </div>
    );
}
