import { motion } from 'framer-motion';
import { SectionTitle } from './SectionTitle';
import { formatTimeForDisplay } from '../../lib/timezone-utils';

interface LocationSectionProps {
    clientData: any;
}

export function LocationSection({ clientData }: LocationSectionProps) {
    // if (!['premium', 'deluxe'].includes(clientData?.planType)) return null; // Habilitado para todos los planes para corregir visualización de fecha/hora


    const locations = [
        {
            type: 'Ceremonia',
            name: clientData.churchName || clientData.ceremonyLocationName,
            time: formatTimeForDisplay(clientData.weddingTime),
            address: clientData.ceremonyAddress,
            reference: clientData.ceremonyReference,
            mapUrl: clientData.ceremonyMapUrl,
            icon: '💒'
        },
        {
            type: 'Recepción',
            name: clientData.receptionLocationName,
            time: formatTimeForDisplay(clientData.receptionTime),
            address: clientData.receptionAddress,
            reference: clientData.receptionReference,
            mapUrl: clientData.receptionMapUrl,
            icon: '🥂'
        }
    ].filter(loc => {
        if (loc.type === 'Recepción' && clientData.isReceptionSameAsCeremony) return false;
        if (loc.type === 'Ceremonia' && clientData.isCeremonySameAsReception) return false;
        return true;
    });

    return (
        <section
            id="ubicacion"
            className="relative py-16 sm:py-32 bg-transparent overflow-visible"
        >
            <div className="section-container relative">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl aspect-square bg-rose-50/20 blur-[120px] rounded-full -z-10" />

                <SectionTitle subtitle="Ubicación">
                    Dónde & Cuándo
                </SectionTitle>

                {/* Cards */}
                <div className="flex flex-wrap justify-center gap-10">
                    {locations.map((loc, idx) => (
                        <motion.div
                            key={loc.type}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.15, duration: 0.7, ease: 'easeOut' }}
                            className="relative w-full max-w-lg group"
                        >
                            <div className="card-luxe relative h-full px-10 py-16 text-center transition-all duration-500 hover:scale-[1.01]">
                                {/* Icon */}
                                <div className="mb-10 flex justify-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-2xl bg-rose-600/10 blur-xl scale-150" />
                                        <div className="relative w-20 h-20 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-4xl group-hover:scale-110 group-hover:bg-rose-100 transition-all duration-500">
                                            {loc.icon}
                                        </div>
                                    </div>
                                </div>

                                <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-rose-600/60 mb-4">
                                    {loc.type}
                                </span>

                                <h3 className="font-elegant text-slate-900 font-bold mb-6 leading-tight" style={{ fontSize: 'var(--font-size-2xl)' }}>
                                    {loc.name || 'Lugar por definir'}
                                </h3>

                                {/* Time */}
                                <div className="inline-flex items-center px-5 py-2 rounded-full border border-rose-100 text-[11px] font-black uppercase text-rose-600 tracking-widest mb-10 bg-rose-50/50">
                                    {loc.time}
                                </div>

                                {/* Address */}
                                <div className="mb-12 space-y-4 max-w-xs mx-auto">
                                    <p className="font-elegant font-bold text-slate-800 text-lg">
                                        {loc.address}
                                    </p>
                                    {loc.reference && (
                                        <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 opacity-60">
                                            Ref: {loc.reference}
                                        </p>
                                    )}
                                </div>

                                {/* Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        if (loc.mapUrl) {
                                            window.open(loc.mapUrl, '_blank');
                                        } else {
                                            window.open(
                                                `https://maps.google.com/?q=${encodeURIComponent(
                                                    `${loc.name} ${loc.address}`
                                                )}`,
                                                '_blank'
                                            );
                                        }
                                    }}
                                    className="btn-luxe w-full"
                                >
                                    Ver Mapa
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Same location note */}
                {(clientData.isReceptionSameAsCeremony || clientData.isCeremonySameAsReception) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.9 }}
                        className="text-center mt-8"
                    >
                        <p className="text-xs font-bold tracking-[0.25em] uppercase text-slate-400">
                            Ceremonia y Recepción en el mismo lugar
                        </p>
                    </motion.div>
                )}
            </div>
        </section >
    );
}
