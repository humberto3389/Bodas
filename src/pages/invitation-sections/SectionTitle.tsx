import { motion } from 'framer-motion';

export function SectionTitle({ children, subtitle }: { children: React.ReactNode, subtitle?: string }) {

    return (
        <div className="mb-8 sm:mb-16 text-center relative px-4">
            {/* Halo decorativo de título sutil */}
            <div className="absolute inset-0 -z-10 flex justify-center items-center pointer-events-none">
                <div className="w-[300px] h-[300px] bg-theme-accent/20 blur-[100px] rounded-full" />
            </div>
            {subtitle && (
                <motion.span
                    initial={{ opacity: 0, letterSpacing: '0.1em' }}
                    whileInView={{ opacity: 1, letterSpacing: '0.4em' }}
                    viewport={{ once: true }}
                    className="block text-[10px] sm:text-xs font-elegant uppercase text-theme-accent mb-4 tracking-[0.4em] font-bold"
                >
                    {subtitle}
                </motion.span>
            )}

            <div className="relative inline-block">
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`font-elegant text-theme-text pb-2 font-bold tracking-tight relative group`}
                    style={{ fontSize: 'var(--font-size-3xl)' }}
                >
                    {children}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-theme-accent via-theme-accent/50 to-theme-accent rounded-full opacity-30 group-hover:w-24 transition-all duration-700" />
                </motion.h2>

                {/* Decorative Elements */}
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    whileInView={{ width: '80px', opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 1 }}
                    className={`h-[1px] bg-theme-accent rounded-full mx-auto mt-4`}
                />
            </div>
        </div>
    );
}
