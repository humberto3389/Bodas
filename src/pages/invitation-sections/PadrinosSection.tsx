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

export function PadrinosSection({ padrinos: propPadrinos }: Omit<PadrinosSectionProps, 'clientId'>) {
    // ✅ USAR DATOS DEL BFF si están disponibles
    const activePadrinos = propPadrinos?.filter(p => p.is_active) || [];

    // Don't render if no active padrinos
    if (activePadrinos.length === 0) return null;

    return (
        <section id="padrinos" className="py-20 relative overflow-hidden bg-white">

            <div className="section-container relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16 relative">
                    <motion.div
                        className="inline-flex flex-col items-center gap-3 mb-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-hati-accent">
                            Corte de Honor
                        </span>
                        <div className="w-10 h-px bg-gray-100" />
                    </motion.div>

                    <motion.h2
                        className="text-gray-900 text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-4"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        Nuestros Padrinos
                    </motion.h2>

                    <motion.p
                        className="text-gray-500 text-base font-normal max-w-xl mx-auto italic"
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
                            <div className="card-luxe p-8 flex flex-col items-center text-center h-full">

                                {/* Photo Frame */}
                                <div className="relative mb-6">
                                    {padrino.photo_url ? (
                                        <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-4 border-white shadow-md transition-transform duration-500 group-hover:scale-105">
                                            <img
                                                src={padrino.photo_url}
                                                alt={padrino.name}
                                                className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700"
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative w-28 h-28 rounded-2xl bg-gray-50 flex items-center justify-center border-4 border-white shadow-md">
                                            <span className="text-2xl font-bold text-gray-200">
                                                {getInitials(padrino.name)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Role Badge */}
                                <span className="inline-block px-4 py-1 rounded-full bg-hati-accent/5 text-[10px] font-bold uppercase tracking-widest text-hati-accent mb-4 border border-hati-accent/10">
                                    {padrino.role}
                                </span>

                                {/* Name */}
                                <h3 className="text-gray-900 text-xl font-bold mb-3 tracking-tight">
                                    {padrino.name}
                                </h3>

                                {/* Description */}
                                {padrino.description && (
                                    <p className="text-sm text-gray-500 font-normal leading-relaxed max-w-[200px]">
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
