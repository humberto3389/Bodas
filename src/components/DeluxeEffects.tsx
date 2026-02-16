import {
    motion,
    useScroll,
    useTransform,
    AnimatePresence,
    useTime,
    useMotionTemplate,
    useMotionValue
} from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

/* ==================================
   🎨 PALETA DE COLORES (Alta Gama)
================================== */
const PALETTE = {
    goldLight: 'rgba(217, 119, 6, 0.8)',   // Amber-600 (Más oscuro y visible)
    goldDeep: 'rgba(180, 83, 9, 0.9)',     // Amber-700 (Casi sólido)
    roseSoft: 'rgba(244, 63, 94, 0.7)',    // Rose-500 (Mucho más vivo)
    roseVivid: 'rgba(225, 29, 72, 0.85)',  // Rose-600 (Fuerte contraste)
    whiteGlow: 'rgba(255, 255, 255, 0.9)'
};

/* ==================================
   🌬️ 1. SWAYING PETALS (Con Física de Viento)
   Reemplaza la lluvia estática con movimiento sinusoidal
================================== */
const SwayingPetals = () => {
    // Aumentamos densidad y complejidad
    const particles = useMemo(() => Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 12 + Math.random() * 15,
        type: Math.random() > 0.4 ? 'petal' : 'gold_dust',
        scale: 0.4 + Math.random() * 0.6,
        sway: 20 + Math.random() * 50 // Amplitud del balanceo
    })), []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[40] overflow-hidden">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ y: -50, opacity: 0, x: 0 }}
                    animate={{
                        y: ['-5vh', '105vh'],
                        opacity: [0, 1, 1, 0], // Mantener opacidad al 100% durante la caída
                        rotate: p.type === 'petal' ? [0, 90, 180, 270] : 0,
                        x: [
                            0,
                            p.sway,
                            -p.sway * 0.5,
                            p.sway * 1.5
                        ] // Trayectoria compleja
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "linear",
                        times: [0, 1]
                    }}
                    className="absolute"
                    style={{
                        left: `${p.x}%`,
                        width: p.type === 'petal' ? '14px' : '3px',
                        height: p.type === 'petal' ? '14px' : '3px',
                        backgroundColor: p.type === 'petal' ? PALETTE.roseVivid : PALETTE.goldDeep,
                        borderRadius: p.type === 'petal' ? '60% 0 60% 0' : '50%',
                        filter: p.type === 'petal' ? 'drop-shadow(0 2px 3px rgba(190, 18, 60, 0.3))' : 'drop-shadow(0 0 2px rgba(180, 83, 9, 0.8))', // Sombra fuerte para contraste
                        boxShadow: p.type === 'gold_dust' ? '0 0 4px rgba(217, 119, 6, 0.9)' : 'none'
                    }}
                />
            ))}
        </div>
    );
};

/* ==================================
   ✨ 2. SPARKLER TRAIL (Estela de Luz)
   Sigue al mouse con un efecto de "escritura con luz"
================================== */
const SparklerTrail = () => {
    const [points, setPoints] = useState<{ id: number; x: number; y: number; age: number }[]>([]);

    useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            const x = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
            const y = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

            // Solo agregamos puntos si se mueve lo suficiente (performance)
            setPoints(prev => {
                const last = prev[prev.length - 1];
                if (last && Math.hypot(last.x - x, last.y - y) < 20) return prev;
                // FIX: Usar random para evitar claves duplicadas si el evento se dispara muy rápido
                return [...prev.slice(-15), { id: Date.now() + Math.random(), x, y, age: 0 }];
            });
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleMove);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
        };
    }, []);

    // Loop de limpieza y envejecimiento
    useEffect(() => {
        const timer = setInterval(() => {
            setPoints(prev => prev
                .map(p => ({ ...p, age: p.age + 1 }))
                .filter(p => p.age < 20) // Vida útil corta
            );
        }, 30);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[50]">
            <AnimatePresence>
                {points.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute rounded-full"
                        style={{
                            left: p.x,
                            top: p.y,
                            width: '10px', // Un poco más grande
                            height: '10px',
                            background: `radial-gradient(circle, #d97706 10%, #fbbf24 40%, transparent 80%)`, // Amber-600 núcleo solido
                            transform: 'translate(-50%, -50%)',
                            boxShadow: '0 0 8px rgba(217, 119, 6, 0.8)' // Glow intenso
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

/* ==================================
   🌊 3. LIQUID GOLD AURORA (Fondo Vivo)
   Orbes que se fusionan y mueven orgánicamente (Gooey effect)
================================== */
const LiquidAurora = () => {
    const time = useTime();
    // Movimientos lentos y desfasados
    const y1 = useTransform(time, [0, 20000], [0, 100]);
    const rotate1 = useTransform(time, [0, 40000], [0, 360]);

    // Convertir el movimiento en transformaciones CSS
    const orb1Style = useMotionTemplate`translateY(${y1}px) rotate(${rotate1}deg)`;

    return (
        <div className="fixed inset-0 pointer-events-none z-[0] overflow-hidden opacity-30">
            {/* Contenedor con blur para mezclar colores */}
            <div className="absolute inset-0 filter blur-[80px]">
                {/* Orbe 1: Oro */}
                <motion.div
                    style={{ transform: orb1Style }}
                    className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-200/40 mix-blend-multiply blur-[60px]" // Menos blur, más color
                />
                {/* Orbe 2: Rosa */}
                <motion.div
                    animate={{ x: [0, 50, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-rose-300/40 mix-blend-multiply blur-[60px]"
                />
                {/* Orbe 3: Cálido Central */}
                <motion.div
                    animate={{ opacity: [0.4, 0.6, 0.4] }} // Más opacidad
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] rounded-full bg-orange-100/60 blur-[50px]"
                />
            </div>

            {/* Textura de ruido sutil para calidad "papel" */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <style>{`
                /* Efecto FOIL PRISMÁTICO */
                .deluxe-foil-text {
                    background: linear-gradient(
                        135deg, 
                        #b45309 0%, 
                        #fbbf24 25%, 
                        #fffbeb 50%, 
                        #fbbf24 75%, 
                        #b45309 100%
                    );
                    background-size: 300% auto;
                    color: transparent;
                    -webkit-background-clip: text;
                    background-clip: text;
                    animation: shine-prism 6s linear infinite;
                    filter: drop-shadow(0 2px 4px rgba(180, 83, 9, 0.2));
                }
                @keyframes shine-prism {
                    to { background-position: 300% center; }
                }
             `}</style>
        </div>
    );
};

/* ==================================
   🔦 4. GOLDEN SPOTLIGHT (Nuevo)
   Luz seguidora del cursor
================================== */
const GoldenSpotlight = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            const x = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
            const y = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
            mouseX.set(x);
            mouseY.set(y);
        };
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleMove);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
        };
    }, []);

    return (
        <motion.div
            className="fixed inset-0 pointer-events-none z-[10]"
            style={{
                background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(251, 191, 36, 0.08), transparent 80%)` // Opacidad muy sutil para no lavar el contenido
            }}
        />
    );
};

/* ==================================
   💎 5. CRYSTAL PARALLAX 
   Elementos geométricos finos que flotan
================================== */
const CrystalParallax = () => {
    const { scrollY } = useScroll();
    const yA = useTransform(scrollY, [0, 1000], [0, 300]);
    const yB = useTransform(scrollY, [0, 1000], [0, -200]);
    const rotate = useTransform(scrollY, [0, 1000], [0, 45]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[35] overflow-hidden">
            {/* Diamante Izquierda */}
            <motion.div
                style={{ y: yA, rotate }}
                className="absolute top-[15%] -left-[30px] sm:-left-[50px] w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 border-[1px] sm:border-[2px] border-amber-500/30 rotate-45 backdrop-blur-[1px] scale-75 sm:scale-100"
            />
            {/* Círculo Derecha */}
            <motion.div
                style={{ y: yB }}
                className="absolute top-[60%] -right-[30px] sm:-right-[50px] w-32 h-32 sm:w-40 sm:h-40 md:w-64 md:h-64 border-[1px] sm:border-[2px] border-rose-500/30 rounded-full scale-75 sm:scale-100"
            />
        </div>
    );
};


/* ==================================
   MAIN COMPONENT
================================== */

interface DeluxeEffectsProps {
    config: any;
    eventDate?: string | Date;
    layer?: 'background' | 'foreground';
}

export const DeluxeEffects = ({ config, layer = 'foreground' }: DeluxeEffectsProps) => {
    if (!config?.enabled) return null;

    // Renderizar solo efectos de fondo
    if (layer === 'background') {
        return (
            <>
                {/* Fondo Vivo (Aurora) */}
                {config.floatingElements && <LiquidAurora />}
            </>
        );
    }

    // Renderizar solo efectos de primer plano
    if (layer === 'foreground') {
        return (
            <>
                {/* Lluvia y Destellos */}
                {config.particleEffects && (
                    <>
                        <SwayingPetals />
                        <SparklerTrail />
                    </>
                )}

                {/* Parallax Geométrico */}
                {config.parallaxScrolling && (
                    <CrystalParallax />
                )}

                {/* Spotlight */}
                {config.floatingElements && <GoldenSpotlight />}
            </>
        );
    }

    return null;
};
