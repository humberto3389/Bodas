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
            id="location"
            className="relative py-24 overflow-hidden px-4 sm:px-6 bg-transparent"
        >
            {/* Background Decorative Elements */}
            <div className="absolute top-1/4 -right-20 w-80 h-80 bg-theme-accent/10 rounded-full blur-[100px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-theme-primary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <SectionTitle subtitle="Ubicación">
                    Dónde & Cuándo
                </SectionTitle>

                <p className="font-elegant text-theme-muted text-center mb-16 max-w-xl mx-auto leading-relaxed" style={{ fontSize: 'var(--font-size-lg)' }}>
                    Cada detalle está preparado para recibirte con el corazón. Te compartimos la información de nuestros encuentros.
                </p>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mt-12">
                    {locations.map((loc, idx) => (
                        <motion.div
                            key={loc.type}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2, duration: 0.8, ease: 'easeOut' }}
                            className="relative group"
                        >
                            <div className="bg-theme-surface/90 backdrop-blur-3xl border border-theme-border p-8 sm:p-14 rounded-[3rem] sm:rounded-[4rem] shadow-xl h-full flex flex-col items-center text-center transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                                
                                {/* Icon Container */}
                                <div className="mb-12 relative">
                                    <div className="absolute inset-0 bg-theme-accent/20 rounded-3xl blur-2xl scale-125 group-hover:scale-150 transition-transform duration-700" />
                                    <div className="relative w-24 h-24 rounded-3xl bg-theme-bg border border-theme-border flex items-center justify-center text-5xl shadow-sm transition-all duration-500 group-hover:rotate-6 group-hover:bg-theme-surface">
                                        {loc.icon}
                                    </div>
                                </div>

                                <span className="block text-[11px] font-black uppercase tracking-[0.4em] text-theme-accent mb-6 font-sans">
                                    {loc.type}
                                </span>

                                <h3 className="font-elegant text-theme-text font-bold mb-6 tracking-wide leading-tight px-4" style={{ fontSize: 'var(--font-size-3xl)' }}>
                                    {loc.name || 'Lugar por definir'}
                                </h3>

                                {/* Time Badge */}
                                <div className="inline-flex items-center px-6 py-2.5 rounded-full border border-theme-accent/30 text-[11px] font-black uppercase text-theme-text tracking-[0.2em] mb-12 bg-theme-accent/10 backdrop-blur-md shadow-sm">
                                    {loc.time}
                                </div>

                                {/* Address Details */}
                                <div className="flex-grow space-y-6 mb-14 px-4">
                                    <p className="font-elegant font-bold text-theme-text text-xl leading-relaxed">
                                        {loc.address}
                                    </p>
                                    {loc.reference && (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-px w-8 bg-theme-border" />
                                            <p className="text-[10px] font-black tracking-widest uppercase text-theme-muted opacity-80">
                                                Ref: {loc.reference}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Map Button */}
                                <motion.button
                                    whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(27, 42, 38, 0.2)" }}
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
                                    className="w-full bg-theme-primary hover:bg-theme-primary/90 text-theme-bg font-black uppercase tracking-[0.3em] py-5 rounded-2xl shadow-xl transition-all text-[11px] flex items-center justify-center gap-3"
                                    aria-label={`Ver ubicación de ${loc.type} en Google Maps`}
                                >
                                    <span>📍</span>
                                    <span>Ver Ubicación</span>
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footnote for shared location */}
                {(clientData.isReceptionSameAsCeremony || clientData.isCeremonySameAsReception) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.9 }}
                        className="text-center mt-12 bg-theme-surface/50 backdrop-blur-sm border border-theme-border rounded-2xl py-6 px-10 max-w-sm mx-auto shadow-sm"
                    >
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-theme-muted">
                            ✨ Ceremonia y Recepción se celebrarán en el mismo lugar ✨
                        </p>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
