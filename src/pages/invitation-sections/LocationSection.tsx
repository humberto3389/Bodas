import { motion } from 'framer-motion';

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
                <div className="text-center mb-16 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex flex-col items-center gap-3 mb-6"
                    >
                        <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-hati-accent">
                            Ubicación
                        </span>
                        <div className="w-10 h-px bg-gray-100" />
                    </motion.div>

                    <h2 className="text-gray-900 text-3xl sm:text-4xl font-bold uppercase tracking-tight">
                        Dónde &amp; Cuándo
                    </h2>
                </div>

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
                            <div className="card-luxe px-8 py-12 flex flex-col items-center text-center h-full">
                                {/* Icon */}
                                <div className="mb-6 flex justify-center">
                                    <div className="relative">
                                        {/* Icon container */}
                                        <div className="
                                            relative
                                            w-14 h-14
                                            rounded-2xl
                                            bg-hati-accent/5
                                            flex items-center justify-center
                                            text-2xl
                                            border border-hati-accent/10
                                            transition-all duration-300
                                            group-hover:scale-110
                                            group-hover:bg-hati-accent
                                            group-hover:text-white
                                        ">
                                            {loc.icon}
                                        </div>
                                    </div>
                                </div>

                                <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-hati-accent mb-3">
                                    {loc.type}
                                </span>

                                <h3 className="text-gray-900 text-2xl font-bold mb-4 tracking-tight leading-snug">
                                    {loc.name || 'Lugar por definir'}
                                </h3>

                                {/* Time */}
                                <div className="
                                    inline-flex items-center gap-2
                                    px-4 py-1.5
                                    rounded-full
                                    border border-gray-100
                                    text-xs font-bold text-gray-400
                                    tracking-widest
                                    mb-8
                                    bg-gray-50
                                ">
                                    {loc.time}
                                </div>

                                {/* Address */}
                                <div className="mb-8 space-y-2 max-w-[240px] mx-auto">
                                    <p className="text-base font-normal text-gray-600 leading-relaxed">
                                        {loc.address}
                                    </p>

                                    {loc.reference && (
                                        <p className="text-[10px] font-medium tracking-wide text-gray-400 uppercase">
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
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300">
                            Ceremonia y Recepción en el mismo lugar
                        </p>
                    </motion.div>
                )}
            </div>
        </section >
    );
}
