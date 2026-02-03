import { motion } from 'framer-motion';
import type { Padrino } from '../../hooks/usePadrinos';

interface PadrinosSectionProps {
    clientId: string;
    padrinos?: Padrino[];
}

// Generate initials from name
function getInitials(name: string): string {
    return name
        .split(' ')
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join('');
}

export function PadrinosSection({ clientId, padrinos: propPadrinos }: PadrinosSectionProps) {
    // ✅ USAR DATOS DEL BFF si están disponibles
    const activePadrinos = propPadrinos?.filter(p => p.is_active) || [];

    // Don't render if no active padrinos
    if (activePadrinos.length === 0) return null;

    return (
        <section id="padrinos" className="py-24 relative overflow-hidden">
            {/* Fondo sutil diferenciador */}
            <div className="absolute inset-0 bg-stone-50/50" />

            <div className="section-container relative z-10">
                {/* Section Header */}
                <div className="text-center mb-20 relative">
                    <div className="absolute inset-0 -z-10 flex justify-center items-center pointer-events-none">
                        <div className="w-[300px] h-[300px] bg-rose-100/40 blur-[80px] rounded-full" />
                    </div>
                    <motion.div
                        className="inline-flex flex-col items-center gap-2 mb-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-rose-600/70">
                            Corte de Honor
                        </span>
                        <div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
                    </motion.div>

                    <motion.h2
                        className="text-5xl sm:text-7xl font-elegant font-bold text-slate-900 mb-6 leading-tight"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        Nuestros Padrinos
                    </motion.h2>

                    <motion.p
                        className="text-xl text-slate-800/60 font-light max-w-2xl mx-auto italic"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        viewport={{ once: true }}
                    >
                        "Las personas especiales que iluminan nuestro camino"
                    </motion.p>
                </div>

                {/* Padrinos Grid - Cards más grandes */}
                <div className={`grid gap-10 ${activePadrinos.length === 1
                    ? 'grid-cols-1 max-w-md mx-auto'
                    : activePadrinos.length === 2
                        ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
                        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    }`}>
                    {activePadrinos.map((padrino, index) => (
                        <motion.div
                            key={padrino.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15, duration: 0.7 }}
                            className="group"
                        >
                            <div className="relative bg-white/70 backdrop-blur-md p-10 flex flex-col items-center text-center h-full shadow-[0_15px_45px_-15px_rgba(30,27,75,0.15)] hover:shadow-[0_25px_60px_-10px_rgba(30,27,75,0.25)] transition-all duration-500 rounded-[2.5rem] border border-white/80">

                                {/* Photo Frame */}
                                <div className="relative mb-8">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-200 to-rose-300 blur-lg opacity-30 group-hover:opacity-60 transition-opacity duration-700" />

                                    {padrino.photo_url ? (
                                        <div className="relative w-36 h-36 rounded-full overflow-hidden border-[6px] border-white shadow-xl group-hover:scale-105 transition-transform duration-700">
                                            <img
                                                src={padrino.photo_url}
                                                alt={padrino.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative w-36 h-36 rounded-full bg-stone-100 flex items-center justify-center border-[6px] border-white shadow-xl group-hover:scale-105 transition-transform duration-700">
                                            <span className="text-4xl font-elegant font-bold text-stone-300">
                                                {getInitials(padrino.name)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Decorative Ring */}
                                    <div className="absolute -inset-2 rounded-full border border-rose-200/50 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-700" />
                                </div>

                                {/* Role Badge */}
                                <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-400/10 to-amber-400/10 text-[11px] font-black uppercase tracking-[0.2em] text-rose-600 mb-5 border border-rose-200/30 shadow-inner">
                                    {padrino.role}
                                </span>

                                {/* Name */}
                                <h3 className="font-elegant text-4xl text-slate-900 font-bold mb-4 leading-none">
                                    {padrino.name}
                                </h3>

                                {/* Description */}
                                {padrino.description && (
                                    <p className="text-base text-stone-500 font-light leading-relaxed max-w-xs">
                                        {padrino.description}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
