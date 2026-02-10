import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionTitle } from '../pages/invitation-sections/SectionTitle';
import { getEventTimestampUTC } from '../lib/timezone-utils';

interface CountdownProps {
    date: string | Date;
    time?: string;
    clientData?: any;
}

export function Countdown({ date, time, clientData }: CountdownProps) {
    const targetTimestamp = useMemo(() => {
        if (clientData?.wedding_datetime_utc) {
            // ✅ FIX PARA MÓVIL (SAFARI): Safari es estricto con el formato ISO.
            // Si la cadena viene con espacio (ej: "2025-05-24 18:00:00"), fallará con NaN.
            const sanitized = String(clientData.wedding_datetime_utc).replace(' ', 'T');
            const d = new Date(sanitized);
            return isNaN(d.getTime()) ? 0 : d.getTime();
        }

        // PRIORIDAD 2: Recurso de emergencia si falla el UTC (cálculo local)
        if (!date) return 0;
        let dateStr = typeof date === 'string' ? date.split('T')[0] : date.toISOString().split('T')[0];
        return getEventTimestampUTC(dateStr, time || '00:00');
    }, [clientData?.wedding_datetime_utc, date, time]);



    const calculateTimeLeft = useMemo(() => () => {
        const now = Date.now();
        const diff = Math.max(0, targetTimestamp - now);
        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
            finished: diff <= 0
        };
    }, [targetTimestamp]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const id = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(id);
    }, [calculateTimeLeft]);

    if (!mounted) return null;

    const items = [
        { label: 'Días', value: timeLeft.days },
        { label: 'Hr', value: timeLeft.hours },
        { label: 'Min', value: timeLeft.minutes },
        { label: 'Seg', value: timeLeft.seconds },
    ]

    return (
        <div className="relative max-w-5xl mx-auto px-6 py-12">
            <div className="absolute inset-0 -z-10 flex justify-center">
                <div className="w-[420px] h-[420px] bg-rose-100/30 blur-[120px] rounded-full" />
            </div>

            <SectionTitle subtitle="La Espera">
                Falta Poco
            </SectionTitle>

            <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
                {items.map((it, index) => (
                    <motion.div
                        key={it.label}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.12, ease: 'easeOut' }}
                        viewport={{ once: true }}
                        className="group"
                    >
                        <div className="
                relative w-28 sm:w-36 h-28 sm:h-36
                rounded-[2.5rem]
                bg-white backdrop-blur-xl
                border border-white/80
                shadow-[0_15px_45px_-15px_rgba(30,27,75,0.15)]
                flex flex-col items-center justify-center
                transition-all duration-700
                group-hover:scale-[1.05]
                group-hover:shadow-[0_25px_60px_-10px_rgba(30,27,75,0.25)]
              ">
                            {/* Glow interno */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-rose-100/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <AnimatePresence mode="popLayout">
                                <motion.span
                                    key={it.value}
                                    initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
                                    className="relative z-10 text-5xl sm:text-6xl font-elegant text-slate-900 font-bold tabular-nums leading-none"
                                >
                                    {String(it.value).padStart(2, '0')}
                                </motion.span>
                            </AnimatePresence>

                            <span className="relative z-10 mt-3 text-[10px] tracking-[0.35em] uppercase text-rose-600 font-black">
                                {it.label}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
