import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * 📊 Scroll Progress Bar
 * Barra de progreso minimalista en la parte superior
 */
export const ScrollProgress = () => {
    const { scrollYProgress } = useScroll();

    // Fade in después de scrollear un poco
    const opacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 z-[100] h-[2px] origin-left"
            style={{
                scaleX: scrollYProgress,
                opacity,
                background: 'linear-gradient(90deg, #f43f5e 0%, #ec4899 50%, #f59e0b 100%)',
            }}
        />
    );
};
