import { motion } from 'framer-motion';
import { useMagneticEffect, useGlowEffect } from '../hooks/useMagneticEffect';
import type { ReactNode } from 'react';

interface MagneticButtonProps {
    children: ReactNode;
    href?: string;
    onClick?: () => void;
    className?: string;
    strength?: number;
}

/**
 * 🧲 Magnetic Button Component
 * Botón premium con efecto magnético que atrae el cursor
 * Incluye glow effect que sigue el mouse
 */
export const MagneticButton = ({
    children,
    href,
    onClick,
    className = '',
    strength = 0.3
}: MagneticButtonProps) => {
    const { ref, x, y, isHovered } = useMagneticEffect(strength);
    const { glowPosition, handleMouseMove } = useGlowEffect();

    const Component = href ? motion.a : motion.button;
    const props = href ? { href } : { onClick };

    return (
        <Component
            ref={ref as any}
            {...props}
            style={{ x, y }}
            onMouseMove={handleMouseMove}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative overflow-hidden ${className}`}
        >
            {/* Glow effect que sigue el cursor */}
            {isHovered && (
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        background: `radial-gradient(circle at ${glowPosition.x}% ${glowPosition.y}%, rgba(251, 113, 133, 0.15) 0%, transparent 60%)`,
                    }}
                />
            )}

            {/* Contenido del botón */}
            <span className="relative z-10">{children}</span>
        </Component>
    );
};
