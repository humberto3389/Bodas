import { useEffect, useRef, useState } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

/**
 * 🧲 Magnetic Effect Hook
 * Hace que los botones "atraigan" el cursor
 * Efecto premium inspirado en sitios de lujo
 */
export const useMagneticEffect = (strength: number = 0.3) => {
    const ref = useRef<HTMLElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Spring physics para movimiento suave
    const springX = useSpring(x, { stiffness: 150, damping: 15 });
    const springY = useSpring(y, { stiffness: 150, damping: 15 });

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!isHovered) return;

            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Calcular distancia del cursor al centro
            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;

            // Aplicar efecto magnético (limitado a 12px máximo)
            const maxDistance = 12;
            const moveX = Math.max(-maxDistance, Math.min(maxDistance, deltaX * strength));
            const moveY = Math.max(-maxDistance, Math.min(maxDistance, deltaY * strength));

            x.set(moveX);
            y.set(moveY);
        };

        const handleMouseEnter = () => {
            setIsHovered(true);
        };

        const handleMouseLeave = () => {
            setIsHovered(false);
            x.set(0);
            y.set(0);
        };

        element.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            element.removeEventListener('mousemove', handleMouseMove);
            element.removeEventListener('mouseenter', handleMouseEnter);
            element.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [isHovered, strength, x, y]);

    return { ref, x: springX, y: springY, isHovered };
};

/**
 * 🎨 Glow Effect Hook
 * Crea un glow que sigue el cursor
 */
export const useGlowEffect = () => {
    const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setGlowPosition({ x, y });
    };

    return { glowPosition, handleMouseMove };
};
