import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

interface SmoothRevealProps {
    children: ReactNode;
    delay?: number;
    className?: string;
}

/**
 * 🎬 Smooth Reveal Component
 * Animación de entrada cinematográfica y elegante
 * Inspirado en: Apple, Linear, Stripe
 */
export const SmoothReveal = ({ children, delay = 0, className = '' }: SmoothRevealProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{
                duration: 0.6,
                delay,
                ease: [0.16, 1, 0.3, 1], // easeOutExpo - suave y premium
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/**
 * 🎬 Stagger Container
 * Para revelar múltiples elementos con delay escalonado
 */
interface StaggerContainerProps {
    children: ReactNode;
    staggerDelay?: number;
    className?: string;
}

export const StaggerContainer = ({ children, staggerDelay = 0.1, className = '' }: StaggerContainerProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren: staggerDelay,
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/**
 * 🎬 Stagger Item
 * Elemento individual dentro de StaggerContainer
 */
interface StaggerItemProps {
    children: ReactNode;
    className?: string;
}

export const StaggerItem = ({ children, className = '' }: StaggerItemProps) => {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                        duration: 0.5,
                        ease: [0.16, 1, 0.3, 1],
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};
