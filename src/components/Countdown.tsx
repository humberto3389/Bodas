import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionTitle } from '../pages/invitation-sections/SectionTitle';
import { getEventTimestampUTC } from '../lib/timezone-utils';

interface CountdownProps {
    date: string | Date;
    time?: string; // Hora del evento en formato HH:mm (24h) o "HH:mm AM/PM"
}

export function Countdown({ date, time }: CountdownProps) {
    console.log('🔍 DEBUG GLOBAL - Countdown recibió:', {
        fecha: date,           // Ej: "2026-02-21"
        hora: time,            // Ej: "12:30 PM"
        tipoFecha: typeof date,
        tipoHora: typeof time,
        timestampActual: Date.now(),
        fechaActual: new Date().toLocaleString('es-PE')
    });

    const targetTimestamp = useMemo(() => {
        if (!date) return 0;

        let dateStr = '';
        if (date instanceof Date) {
            dateStr = date.toISOString().split('T')[0];
        } else if (typeof date === 'string') {
            // Si viene con T (ISO), asegurarse de tomar solo la fecha
            // "2026-06-21T00:00:00Z" -> "2026-06-21"
            dateStr = date.split('T')[0];
        }

        // Usar la utilidad que combina fecha + hora y convierte a UTC
        // Esto garantiza cálculos precisos independientemente de la zona del navegador
        return getEventTimestampUTC(dateStr, time || '00:00');
    }, [date, time])

    // Paso 6.1: Verificación final
    useEffect(() => {
        if (targetTimestamp > 0) {
            const ahora = Date.now();
            const diferenciaMs = targetTimestamp - ahora;
            const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);
            const diferenciaDias = diferenciaMs / (1000 * 60 * 60 * 24);

            console.log('✅ VERIFICACIÓN FINAL - Countdown:', {
                horaBodaUTC: new Date(targetTimestamp).toISOString(),
                horaBodaLima: new Date(targetTimestamp + (5 * 60 * 60 * 1000)).toLocaleString('es-PE'),
                horaActual: new Date().toLocaleString('es-PE'),
                diferenciaTotalHoras: Math.round(diferenciaHoras * 100) / 100,
                diferenciaDiasCompletos: Math.floor(diferenciaDias),
                horasRestantes: Math.floor((diferenciaDias % 1) * 24),
                minutosRestantes: Math.floor(((diferenciaDias % 1) * 24 * 60) % 60)
            });

            // Validación: Debe ser ~402 horas (16 días + 18 horas)
            if (diferenciaHoras < 400 || diferenciaHoras > 410) {
                console.warn('⚠️ Alerta de diferencia horaria:', diferenciaHoras);
            }
        }
    }, [targetTimestamp]);

    const calculateTimeLeft = () => {
        const now = Date.now();
        const diff = Math.max(0, targetTimestamp - now);
        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
            finished: diff <= 0
        };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const id = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(id);
    }, [targetTimestamp]);

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
