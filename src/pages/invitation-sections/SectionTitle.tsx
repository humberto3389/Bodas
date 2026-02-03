import { motion } from 'framer-motion';

export function SectionTitle({ children, color = 'gold', subtitle }: { children: React.ReactNode, color?: 'rose' | 'amber' | 'gold', subtitle?: string }) {
    const colorClasses = {
        rose: 'bg-hati-accent',
        amber: 'bg-hati-accent',
        gold: 'bg-hati-accent'
    };

    const textColors = {
        rose: 'text-gray-900',
        amber: 'text-gray-900',
        gold: 'text-gray-900'
    };

    return (
        <div className="mb-12 text-center relative">
            {subtitle && (
                <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="block text-[10px] sm:text-xs uppercase text-gray-400 mb-3 tracking-[0.3em] font-bold"
                >
                    {subtitle}
                </motion.span>
            )}

            <div className="relative inline-block">
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`text-2xl sm:text-3xl font-bold uppercase tracking-tight ${textColors[color]} pb-1`}
                >
                    {children}
                </motion.h2>

                {/* Decorative Elements */}
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    whileInView={{ width: '40px', opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 1 }}
                    className={`h-0.5 ${colorClasses[color]} mx-auto mt-4 rounded-full`}
                />
            </div>
        </div>
    );
}
