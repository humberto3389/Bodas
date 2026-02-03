import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

    useEffect(() => {
        if (images.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [images.length]);

    if (loading || images.length === 0) return null;

    return (
        <section id="galeria" className="py-12 relative overflow-hidden bg-transparent">
            <div className="section-container">

                <div className="text-center mb-12 relative">
                    <motion.div
                        className="inline-flex flex-col items-center gap-3 mb-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-hati-accent">
                            Galería
                        </span>
                        <div className="w-10 h-px bg-gray-100" />
                    </motion.div>
                    <h2 className="text-gray-900 text-3xl sm:text-4xl font-bold uppercase tracking-tight">
                        Momentos
                    </h2>
                </div>

                <div className="relative h-[550px] sm:h-[650px] mt-12 perspective-2000">
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
                                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-sm bg-white border border-gray-100 transition-all duration-700">
                                            <img
                                                src={img.url}
                                                alt="Momento"
                                                className="w-full h-full object-cover grayscale-[20%] transition-transform duration-[2s] group-hover:scale-105 group-hover:grayscale-0"
                                                loading={isCenter ? "eager" : "lazy"}
                                            />
                                            {/* Minimal Overlay */}
                                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                                <span className="text-white text-[10px] font-bold tracking-[0.3em] uppercase bg-hati-accent px-6 py-3 rounded-full shadow-lg">
                                                    Ver
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </AnimatePresence>

                    {/* Navigation - Minimal Dots */}
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4">
                        {images.slice(0, 8).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`transition-all duration-500 h-1.5 rounded-full ${currentIndex === idx ? 'w-8 bg-hati-accent' : 'w-2 bg-gray-200'}`}
                            />
                        ))}
                    </div>
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
                        >
                            <img
                                src={images[selectedImage].url}
                                className="w-auto h-auto max-h-[80vh] object-contain rounded-xl shadow-xl border border-gray-100"
                                loading="eager"
                            />
                            <button className="mt-8 text-gray-400 hover:text-hati-accent transition-colors flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] uppercase">
                                <span className="text-lg">×</span> Cerrar
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
