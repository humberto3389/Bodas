import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionTitle } from './SectionTitle';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GallerySectionProps {
    clientData: any;
    images: string[];
}

export function GallerySection({ images }: GallerySectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        if (images && images.length > 0) {
            setLoading(false);
        }
    }, [images]);

    const nextSlide = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (loading || images.length === 0) return null;

    const variants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.5,
            rotateY: dir > 0 ? 45 : -45
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            rotateY: 0
        },
        exit: (dir: number) => ({
            zIndex: 0,
            x: dir < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.5,
            rotateY: dir < 0 ? 45 : -45
        })
    };

    return (
        <section id="galeria" className="py-20 relative overflow-hidden px-4 sm:px-6">
            <div className="w-full relative px-0 sm:px-6">
                <SectionTitle subtitle="Recuerdos">
                    Galería de Fotos
                </SectionTitle>

                <div className="max-w-6xl mx-auto">
                    <div className="relative h-[400px] sm:h-[650px] mt-4 sm:mt-12 perspective-2000">
                        <AnimatePresence initial={false} custom={direction}>
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 }
                                }}
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                <div className="relative w-full h-full max-w-4xl mx-auto card-luxe p-4 bg-white/50 backdrop-blur-sm rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl">
                                    <img
                                        src={images[currentIndex]}
                                        alt={`Boda ${currentIndex + 1}`}
                                        className="w-full h-full object-cover rounded-[1.5rem] sm:rounded-[2.5rem]"
                                    />
                                    {/* Overlay con gradiente */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Controls */}
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 sm:px-0 z-10 pointer-events-none">
                            <button
                                onClick={prevSlide}
                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/90 backdrop-blur shadow-xl border border-rose-100 flex items-center justify-center text-rose-600 hover:bg-rose-600 hover:text-white transition-all transform hover:scale-110 pointer-events-auto"
                                aria-label="Imagen anterior"
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/90 backdrop-blur shadow-xl border border-rose-100 flex items-center justify-center text-rose-600 hover:bg-rose-600 hover:text-white transition-all transform hover:scale-110 pointer-events-auto"
                                aria-label="Siguiente imagen"
                            >
                                <ChevronRight size={32} />
                            </button>
                        </div>

                        {/* Pagination Dots */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 py-4">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setDirection(idx > currentIndex ? 1 : -1);
                                        setCurrentIndex(idx);
                                    }}
                                    className={`h-1.5 transition-all duration-500 rounded-full ${idx === currentIndex ? 'w-8 bg-rose-600' : 'w-1.5 bg-rose-200 hover:bg-rose-300'}`}
                                    aria-label={`Ir a la imagen ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
