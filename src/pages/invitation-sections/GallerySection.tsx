import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionTitle } from './SectionTitle';

interface GallerySectionProps {
    clientData: any;
    images?: { name: string, url: string }[];
}

export function GallerySection({ clientData, images: propImages }: GallerySectionProps) {
    const [images, setImages] = useState<{ name: string, url: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<number | null>(null);

    // ✅ USAR DATOS DEL BFF si están disponibles
    useEffect(() => {
        if (propImages && propImages.length > 0) {
            setImages(propImages);
            setLoading(false);
            return;
        }
        // Si no hay datos del BFF, mantener comportamiento original (fallback)
        if (!clientData?.id) {
            setLoading(false);
            return;
        }
        // Este código solo se ejecuta si el BFF no proporciona datos (no debería pasar en producción)
        setLoading(false);
    }, [propImages, clientData?.id]);

    const [currentIndex, setCurrentIndex] = useState(0);

    /* Auto-slide removed for manual control */

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (loading || images.length === 0) return null;

    return (
        <section id="galeria" className="py-20 relative overflow-hidden">
            <div className="w-full relative px-0 sm:px-6">
                <SectionTitle subtitle="Recuerdos">
                    Galería de Fotos
                </SectionTitle>

                <div className="relative h-[400px] sm:h-[650px] mt-4 sm:mt-12 perspective-2000">
                    <AnimatePresence initial={false} mode="popLayout">
                        <div className="relative w-full h-full flex items-center justify-center">
                            {images.map((img, idx) => {
                                const offset = (idx - currentIndex + images.length) % images.length;
                                const isCenter = offset === 0;
                                const isLeft = offset === images.length - 1;
                                const isRight = offset === 1;

                                if (!isCenter && !isLeft && !isRight) return null;

                                return (
                                    <motion.div
                                        key={img.name}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{
                                            opacity: isCenter ? 1 : 0.5,
                                            scale: isCenter ? 1 : 0.85,
                                            x: isCenter ? 0 : offset === 1 ? '100%' : '-100%',
                                            z: isCenter ? 100 : 0,
                                            rotateY: isCenter ? 0 : offset === 1 ? -15 : 15,
                                            filter: isCenter ? 'blur(0px)' : 'blur(4px)',
                                            zIndex: isCenter ? 30 : 10
                                        }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.8, ease: "easeInOut" }}
                                        onClick={() => isCenter && setSelectedImage(idx)}
                                        className="absolute w-[300px] sm:w-[450px] aspect-[4/5] cursor-pointer group"
                                    >
                                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-white border-2 border-white transition-all duration-700">
                                            <img
                                                src={img.url}
                                                alt="Momento"
                                                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                                                loading={isCenter ? "eager" : "lazy"}
                                                decoding="async"
                                                fetchPriority={isCenter ? "high" : "low"}
                                                width={800}
                                                height={1000}
                                            />
                                            {/* Minimal Overlay */}
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                                <span className="text-white text-xs font-bold tracking-[0.4em] uppercase border border-white/50 px-6 py-3 rounded-full backdrop-blur-md">
                                                    Ver
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </AnimatePresence>

                    {/* Navigation Controls - Modern Glassmorphism */}
                    {images.length > 1 && (
                        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-10 w-full max-w-sm justify-center z-40">
                            <motion.button
                                whileHover={{ scale: 1.1, x: -5 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={prevSlide}
                                className="w-14 h-14 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm flex items-center justify-center text-slate-800 transition-all hover:bg-white/80 hover:shadow-rose-100"
                                aria-label="Anterior"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
                                </svg>
                            </motion.button>

                            <div className="flex gap-2">
                                {images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`transition-all duration-500 h-1 rounded-full ${currentIndex === idx ? 'w-8 bg-rose-500' : 'w-2 bg-rose-200/50'}`}
                                        aria-label={`Ir a imagen ${idx + 1}`}
                                    />
                                ))}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.1, x: 5 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={nextSlide}
                                className="w-14 h-14 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm flex items-center justify-center text-slate-800 transition-all hover:bg-white/80 hover:shadow-rose-100"
                                aria-label="Siguiente"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                                </svg>
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {selectedImage !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex items-center justify-center p-6"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={images[selectedImage].url}
                                className="w-auto h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl"
                                loading="eager"
                                fetchPriority="high"
                                width={1200}
                                height={1500}
                            />
                            <div className="mt-8 flex gap-4">
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="text-slate-800 hover:text-rose-500 transition-colors flex items-center gap-2 text-xs font-bold tracking-[0.3em] uppercase bg-transparent border-none cursor-pointer"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

