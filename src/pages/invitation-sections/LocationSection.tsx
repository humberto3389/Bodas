import { motion } from 'framer-motion';
import { SectionTitle } from './SectionTitle';

interface LocationSectionProps {
    clientData: any;
}

// Función local robusta para formatear hora
// Asegura que 12:XX se muestre correctamente como PM
function formatTimeRobust(timeStr: string): string {
    if (!timeStr) return '';

    // 1. Limpieza básica
    let clean = timeStr.trim();

    // 2. Detectar si viene con AM/PM explícito (dirty data)
    const hasPM = /PM/i.test(clean);
    const hasAM = /AM/i.test(clean);

    // 3. Extraer horas y minutos
    const match = clean.match(/(\d{1,2}):(\d{1,2})/);
    if (!match) return ''; // Retornar vacío si no hay match, o podría ser '12:00 p. m.'

    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);

    // 4. Corrección de ambigüedad si venía con sufijo
    if (hasPM && h < 12) h += 12;
    if (hasAM && h === 12) h = 0;

    // 5. Formato 12h
    // h=12 (12 PM) -> p. m.
    // h=0  (12 AM) -> a. m.
    const ampm = h >= 12 ? 'p. m.' : 'a. m.';
    let h12 = h % 12;
    if (h12 === 0) h12 = 12;

    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function LocationSection({ clientData }: LocationSectionProps) {
    // if (!['premium', 'deluxe'].includes(clientData?.planType)) return null; // Habilitado para todos los planes para corregir visualización de fecha/hora


    const locations = [
        {
            type: 'Ceremonia',
            name: clientData.churchName || clientData.ceremonyLocationName,
            time: formatTimeRobust(clientData.weddingTime),
            address: clientData.ceremonyAddress,
            reference: clientData.ceremonyReference,
            mapUrl: clientData.ceremonyMapUrl,
            icon: '💒'
        },
        ...(!clientData.isReceptionSameAsCeremony ? [{
            type: 'Recepción',
            name: clientData.receptionLocationName,
            time: formatTimeRobust(clientData.receptionTime),
            address: clientData.receptionAddress,
            reference: clientData.receptionReference,
            mapUrl: clientData.receptionMapUrl,
            icon: '🥂'
        }] : [])
    ];

    return (
        <section
            id="ubicacion"
            className="relative py-12 bg-transparent overflow-hidden"
        >
            <div className="section-container">
                {/* Header */}
                <SectionTitle subtitle="Ubicación">
                    Dónde &amp; Cuándo
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
                            className="relative w-full max-w-lg"
                        >
                            <div className="
                                relative h-full
                                rounded-[2.5rem]
                                bg-white/70 backdrop-blur-md
                                border border-white/80
                                shadow-[0_15px_45px_-15px_rgba(30,27,75,0.15)]
                                px-10 py-12
                                text-center
                                transition-all duration-500
                                hover:shadow-[0_25px_60px_-10px_rgba(30,27,75,0.25)]
                            ">
                                {/* Icon */}
                                <div className="mb-8 flex justify-center">
                                    <div className="relative">
                                        {/* Glow suave */}
                                        <div className="absolute inset-0 rounded-full bg-rose-600/10 blur-xl scale-150" />

                                        {/* Icon container */}
                                        <div className="
                                            relative
                                            w-20 h-20
                                            rounded-full
                                            bg-rose-600
                                            flex items-center justify-center
                                            text-3xl
                                            shadow-lg
                                            text-white
                                        ">
                                            {loc.icon}
                                        </div>
                                    </div>
                                </div>

                                <span className="block text-[10px] font-black uppercase tracking-[0.35em] text-rose-600 mb-3">
                                    {loc.type}
                                </span>

                                <h3 className="font-elegant text-4xl text-slate-900 font-bold mb-6 leading-snug">
                                    {loc.name || 'Lugar por definir'}
                                </h3>

                                {/* Time */}
                                <div className="
                                    inline-flex items-center gap-2
                                    px-5 py-2
                                    rounded-lg
                                    border border-rose-100
                                    text-sm font-bold text-rose-600
                                    tracking-wider
                                    mb-10
                                    bg-rose-50/50
                                ">
                                    {loc.time}
                                </div>

                                {/* Address */}
                                <div className="mb-10 space-y-2 max-w-xs mx-auto">
                                    <p className="text-lg font-light text-slate-600 leading-relaxed">
                                        {loc.address}
                                    </p>

                                    {loc.reference && (
                                        <p className="text-xs font-medium tracking-wide text-slate-400">
                                            Ref: {loc.reference}
                                        </p>
                                    )}
                                </div>

                                {/* Button */}
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
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
                {clientData.isReceptionSameAsCeremony && (
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
