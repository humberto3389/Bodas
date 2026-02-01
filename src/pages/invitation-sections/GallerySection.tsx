import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface GallerySectionProps {
    clientData: any;
}

export function GallerySection({ clientData }: GallerySectionProps) {
    const [images, setImages] = useState<{ name: string, url: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<number | null>(null);

    useEffect(() => {
        if (!clientData?.id) return;

        const loadImages = async () => {
            const { data, error } = await supabase.storage
                .from('gallery')
                .list(`${clientData.id}/hero`, { limit: 50, sortBy: { column: 'created_at', order: 'asc' } });

            if (error || !data) { setLoading(false); return; }

            const paths = data
                .filter(f => !f.name.startsWith('.'))
                .filter(f => !f.name.toLowerCase().includes('padrino')) // Excluir fotos de padrinos explícitamente
                .map(f => `${clientData.id}/hero/${f.name}`);

            const urls = await Promise.all(paths.map(async (path) => {
                const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(path);
                return { name: path, url: urlData.publicUrl };
            }));

            setImages(urls);
            setLoading(false);
        };

        loadImages();
    }, [clientData?.id]);

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
        <section id="galeria" className="py-20 relative overflow-hidden bg-transparent">
            <div className="section-container">

                <div className="text-center mb-16 relative">
                    <div className="absolute inset-0 -z-10 flex justify-center items-center pointer-events-none">
                        <div className="w-[300px] h-[300px] bg-rose-100/40 blur-[80px] rounded-full" />
                    </div>
                    <motion.div
                        className="inline-flex flex-col items-center gap-2 mb-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-rose-500">
                            Galería
                        </span>
                        <div className="w-10 h-px bg-rose-500/40" />
                    </motion.div>
                    <h2 className="text-5xl sm:text-6xl font-elegant font-bold text-slate-950 mb-6 leading-tight">
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
                                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-white border-2 border-white transition-all duration-700">
                                            <img
                                                src={img.url}
                                                alt="Momento"
                                                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
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

                    {/* Navigation - Minimal Dots */}
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4">
                        {images.slice(0, 8).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`transition-all duration-500 h-1 rounded-full ${currentIndex === idx ? 'w-8 bg-rose-500' : 'w-2 bg-rose-500/20'}`}
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
                                className="w-auto h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl"
                            />
                            <button className="mt-8 text-slate-800 hover:text-rose-500 transition-colors flex items-center gap-2 text-xs font-bold tracking-[0.3em] uppercase">
                                Cerrar
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
