import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * 🎨 EFECTOS PREMIUM ULTRA-VISIBLES
 * Estos efectos se ven SIEMPRE, sin importar el plan
 */

// 1. PARTÍCULAS FLOTANTES DORADAS Y ROSAS (Muy visibles)
export const FloatingGems = () => {
    const particles = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4,
        duration: Math.random() * 10 + 15,
        delay: Math.random() * 5,
        color: i % 2 === 0 ? 'rose' : 'amber'
    }));

    return (
        <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                    }}
                    animate={{
                        y: [0, -100, 0],
                        x: [0, Math.random() * 50 - 25, 0],
                        rotate: [0, 360],
                        scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeInOut"
                    }}
                >
                    <div
                        className={`rounded-full ${p.color === 'rose'
                                ? 'bg-gradient-to-br from-rose-400 to-pink-500'
                                : 'bg-gradient-to-br from-amber-400 to-yellow-500'
                            }`}
                        style={{
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            boxShadow: p.color === 'rose'
                                ? '0 0 20px rgba(244, 63, 94, 0.6), 0 0 40px rgba(244, 63, 94, 0.3)'
                                : '0 0 20px rgba(245, 158, 11, 0.6), 0 0 40px rgba(245, 158, 11, 0.3)',
                            filter: 'blur(0.5px)'
                        }}
                    />
                </motion.div>
            ))}
        </div>
    );
};

// 2. CONFETTI EXPLOSION AL SCROLL
export const ScrollConfetti = () => {
    const { scrollYProgress } = useScroll();
    const [confetti, setConfetti] = useState<Array<{ id: number, x: number, y: number, color: string }>>([]);

    useEffect(() => {
        const unsubscribe = scrollYProgress.on('change', (latest) => {
            // Crear confetti cada 10% de scroll
            if (latest > 0 && Math.random() > 0.95) {
                const newConfetti = Array.from({ length: 5 }).map((_, i) => ({
                    id: Date.now() + i,
                    x: Math.random() * 100,
                    y: Math.random() * 30,
                    color: ['rose', 'amber', 'pink', 'yellow'][Math.floor(Math.random() * 4)]
                }));
                setConfetti(prev => [...prev.slice(-20), ...newConfetti]);
            }
        });
        return () => unsubscribe();
    }, [scrollYProgress]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[45] overflow-hidden">
            {confetti.map((c) => (
                <motion.div
                    key={c.id}
                    initial={{ y: 0, opacity: 1, scale: 1 }}
                    animate={{
                        y: window.innerHeight,
                        opacity: 0,
                        rotate: 720,
                        scale: 0
                    }}
                    transition={{ duration: 3, ease: "easeOut" }}
                    className="absolute"
                    style={{ left: `${c.x}%`, top: `${c.y}%` }}
                >
                    <div
                        className={`w-3 h-3 rounded-sm ${c.color === 'rose' ? 'bg-rose-500' :
                                c.color === 'amber' ? 'bg-amber-500' :
                                    c.color === 'pink' ? 'bg-pink-500' : 'bg-yellow-500'
                            }`}
                        style={{
                            boxShadow: '0 0 10px currentColor'
                        }}
                    />
                </motion.div>
            ))}
        </div>
    );
};

// 3. PARALLAX SCROLL DRAMÁTICO
export const ParallaxLayers = () => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
    const y2 = useTransform(scrollY, [0, 1000], [0, -200]);
    const y3 = useTransform(scrollY, [0, 1000], [0, 150]);
    const rotate1 = useTransform(scrollY, [0, 1000], [0, 180]);
    const rotate2 = useTransform(scrollY, [0, 1000], [0, -180]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[3] overflow-hidden">
            {/* Círculo grande izquierda */}
            <motion.div
                style={{ y: y1, rotate: rotate1 }}
                className="absolute -left-20 top-1/4 w-64 h-64 rounded-full border-4 border-rose-300/20"
            />

            {/* Cuadrado derecha */}
            <motion.div
                style={{ y: y2, rotate: rotate2 }}
                className="absolute -right-20 top-1/2 w-48 h-48 border-4 border-amber-300/20 rotate-45"
            />

            {/* Triángulo centro */}
            <motion.div
                style={{ y: y3 }}
                className="absolute left-1/2 top-3/4 w-0 h-0 border-l-[60px] border-l-transparent border-r-[60px] border-r-transparent border-b-[100px] border-b-pink-300/20"
            />
        </div>
    );
};

// 4. SHIMMER EFFECT EN SCROLL
export const ScrollShimmer = () => {
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

    return (
        <motion.div
            className="fixed inset-0 pointer-events-none z-[2]"
            style={{ opacity }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rose-100/10 to-transparent" />
        </motion.div>
    );
};

// 5. CURSOR TRAIL PREMIUM
export const CursorTrail = () => {
    const [trail, setTrail] = useState<Array<{ id: number, x: number, y: number }>>([]);

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            setTrail(prev => [...prev.slice(-15), {
                id: Date.now(),
                x: e.clientX,
                y: e.clientY
            }]);
        };

        window.addEventListener('mousemove', handleMove);
        return () => window.removeEventListener('mousemove', handleMove);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[60]">
            {trail.map((point, index) => (
                <motion.div
                    key={point.id}
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-rose-400 to-amber-400"
                    style={{
                        left: point.x - 8,
                        top: point.y - 8,
                        boxShadow: '0 0 15px rgba(244, 63, 94, 0.5)',
                        opacity: (index / trail.length) * 0.6
                    }}
                />
            ))}
        </div>
    );
};

// COMPONENTE PRINCIPAL
export const PremiumEffects = () => {
    return (
        <>
            <FloatingGems />
            <ParallaxLayers />
            <ScrollShimmer />
            <ScrollConfetti />
            <CursorTrail />
        </>
    );
};
