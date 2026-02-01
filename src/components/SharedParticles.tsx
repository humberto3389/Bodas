import { motion } from 'framer-motion';

// Partículas de fondo mejoradas (sin nieve)
export const FloatingParticles = ({ mobile = false }: { mobile?: boolean }) => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-30">
            {Array.from({ length: mobile ? 15 : 30 }).map((_, i) => {
                const size = mobile ? (Math.random() * 2 + 1) : (Math.random() * 3 + 2);
                return (
                    <motion.div
                        key={i}
                        className="absolute"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -100, 0],
                            x: [0, Math.random() * 50 - 25, 0],
                            rotate: [0, 180, 360],
                            scale: [0, 1, 0],
                        }}
                        transition={{
                            duration: 20 + Math.random() * 20,
                            repeat: Infinity,
                            delay: Math.random() * 10,
                            ease: "easeInOut"
                        }}
                    >
                        <div
                            className={`${i % 4 === 0 ? 'bg-gradient-to-r from-amber-500/60 to-orange-500/60' :
                                i % 4 === 1 ? 'bg-gradient-to-r from-amber-300/50 to-amber-400/50' :
                                    i % 4 === 2 ? 'bg-gradient-to-r from-orange-400/40 to-amber-400/40' :
                                        'bg-gradient-to-r from-amber-600/40 to-amber-600/40'
                                } rounded-full blur-[1px] shadow-sm shadow-amber-200/50`}
                            style={{ width: `${size}px`, height: `${size}px` }}
                        />
                    </motion.div>
                );
            })}
        </div>
    );
};

// Componente de partículas geométricas
export const GeometricParticle = ({ index: _index }: { index: number }) => {
    const shapes = ['circle', 'square', 'triangle'];
    const shape = shapes[_index % 3];
    const size = Math.random() * 8 + 4;
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    const duration = Math.random() * 8 + 12;
    const delay = Math.random() * -15;
    const opacity = Math.random() * 0.3 + 0.1;

    const getShape = () => {
        switch (shape) {
            case 'square':
                return 'rounded-lg';
            case 'triangle':
                return 'w-0 h-0 border-l-transparent border-r-transparent border-b-white';
            default:
                return 'rounded-full';
        }
    };

    return (
        <motion.div
            className={`absolute pointer-events-none ${getShape()} ${shape !== 'triangle' ? 'bg-white/10 backdrop-blur-sm' : 'border-l-[6px] border-r-[6px] border-b-white/10'
                }`}
            style={{
                width: shape !== 'triangle' ? `${size}px` : '0',
                height: shape !== 'triangle' ? `${size}px` : '0',
                left: `${startX}%`,
                top: `${startY}%`,
                opacity,
                filter: 'blur(0.5px)',
                borderLeftWidth: shape === 'triangle' ? '6px' : undefined,
                borderRightWidth: shape === 'triangle' ? '6px' : undefined,
                borderBottomWidth: shape === 'triangle' ? '10px' : undefined,
            }}
            animate={{
                y: [`${startY}%`, `${startY + 150}%`],
                x: [0, Math.random() * 30 - 15, 0],
                rotate: [0, 180, 360],
            }}
            transition={{
                y: {
                    duration,
                    repeat: Infinity,
                    ease: "linear",
                    delay,
                },
                x: {
                    duration: duration * 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay,
                },
                rotate: {
                    duration: duration * 2,
                    repeat: Infinity,
                    ease: "linear",
                    delay,
                }
            }}
        />
    );
};
