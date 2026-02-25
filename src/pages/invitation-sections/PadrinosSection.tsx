import { motion } from 'framer-motion';
import { SectionTitle } from './SectionTitle';

interface PadrinosSectionProps {
    padrinos: any[];
}

export function PadrinosSection({ padrinos }: PadrinosSectionProps) {
    const activePadrinos = padrinos.filter(p => !p.is_hidden);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    if (activePadrinos.length === 0) return null;

    return (
        <section id="padrinos" className="py-20 relative overflow-hidden px-4 sm:px-6">
            <div className="w-full relative z-10 px-0 sm:px-6">
                {/* Section Header */}
                <SectionTitle subtitle="Corte de Honor">
                    Nuestros Padrinos
                </SectionTitle>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-lg text-slate-800/60 font-light tracking-wide max-w-lg mx-auto leading-relaxed text-center mb-16"
                >
                    Personas especiales que nos acompañan y guían en este nuevo camino que comenzamos juntos.
                </motion.p>

                {/* Padrinos Grid */}
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-stretch justify-center">
                        {activePadrinos.map((padrino, index) => (
                            <motion.div
                                key={padrino.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15, duration: 0.7 }}
                                className="group h-full"
                            >
                                <div className="card-luxe relative h-full p-8 flex flex-col items-center text-center rounded-3xl sm:rounded-[2.5rem]">
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
                                        <div className="absolute -inset-2 rounded-full border border-rose-200/50 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-700" />
                                    </div>

                                    {/* Role Badge */}
                                    <span className="inline-block px-4 py-1.5 rounded-full bg-rose-50 text-[11px] font-black uppercase tracking-[0.2em] text-rose-600 mb-5 border border-rose-100 shadow-sm">
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
            </div>
        </section>
    );
}
