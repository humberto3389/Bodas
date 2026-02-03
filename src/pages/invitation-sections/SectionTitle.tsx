import { motion } from 'framer-motion';

export function SectionTitle({ children, subtitle }: { children: React.ReactNode, subtitle?: string }) {

    return (
        <div className="mb-16 text-center relative">
            {/* Halo decorativo de título sutil */}
            <div className="absolute inset-0 -z-10 flex justify-center items-center pointer-events-none">
                <div className="w-[300px] h-[300px] bg-rose-50/50 blur-[80px] rounded-full" />
            </div>
            {subtitle && (
                <motion.span
                    initial={{ opacity: 0, letterSpacing: '0.1em' }}
                    whileInView={{ opacity: 1, letterSpacing: '0.4em' }}
                    viewport={{ once: true }}
                    className="block text-[10px] sm:text-xs font-elegant uppercase text-rose-500 mb-4 tracking-[0.4em] font-bold"
                >
                    {subtitle}
                </motion.span>
            )}

            <div className="relative inline-block">
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`font-elegant text-5xl sm:text-6xl text-slate-900 pb-2 font-bold tracking-tight`}
                >
                    {children}
                </motion.h2>

                {/* Decorative Elements */}
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    whileInView={{ width: '60px', opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 1 }}
                    className={`h-1 bg-rose-600 rounded-full mx-auto mt-4`}
                />
            </div>
        </div>
    );
}
