import { motion } from 'framer-motion';

interface VerseSectionProps {
    clientData: any;
}

export function VerseSection({ clientData }: VerseSectionProps) {
    const { bibleVerse, bibleVerseBook, invitationText, religiousSymbol, weddingType } = clientData;

    if (!bibleVerse && !invitationText) return null;

    return (
        <section className="relative py-32 overflow-hidden">
            {/* Halos decorativos deluxe */}
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#f59e0b]/05 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#f59e0b]/05 rounded-full blur-[120px] pointer-events-none" />

            <div className="section-container relative z-10 text-center">
                <div className="max-w-4xl mx-auto space-y-24">
                    {/* Badge editorial */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-center gap-4 relative"
                    >
                        <div className="absolute inset-0 -z-10 flex justify-center items-center pointer-events-none">
                            <div className="w-[300px] h-[150px] bg-rose-100/30 blur-[60px] rounded-full" />
                        </div>
                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.6em]">
                            {weddingType || 'Nuestra Boda'}
                        </span>
                        <div className="w-16 h-px bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
                    </motion.div>

                    {/* Versículo Bíblico */}
                    {bibleVerse && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="relative px-6"
                        >
                            {religiousSymbol && (
                                <div className="text-4xl mb-8 text-rose-500 opacity-80">
                                    {religiousSymbol}
                                </div>
                            )}

                            <blockquote className="font-elegant italic text-3xl sm:text-4xl lg:text-5xl text-slate-900 leading-relaxed mb-10 max-w-3xl mx-auto">
                                “{bibleVerse}”
                            </blockquote>

                            {bibleVerseBook && (
                                <div className="flex items-center justify-center gap-4">
                                    <div className="w-8 h-[2px] bg-rose-500/30 rounded-full" />
                                    <p className="text-[10px] tracking-[0.4em] text-slate-900/40 uppercase font-black">
                                        {bibleVerseBook}
                                    </p>
                                    <div className="w-8 h-[2px] bg-rose-500/30 rounded-full" />
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Divisor elegante central */}
                    {(bibleVerse && invitationText) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="flex justify-center items-center py-4"
                        >
                            <div className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                                <div className="w-1.5 h-1.5 rounded-full bg-[#ffd9b3]" />
                                <div className="w-1.5 h-1.5 rounded-full bg-[#fcd34d]" />
                            </div>
                        </motion.div>
                    )}

                    {/* Texto de Invitación */}
                    {invitationText && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="relative px-6"
                        >
                            <h2 className="text-2xl sm:text-3xl font-elegant tracking-[0.3em] text-rose-500 font-bold uppercase mb-10 relative">
                                {/* Halo decorativo de título */}
                                <div className="absolute inset-0 -z-10 flex justify-center items-center pointer-events-none">
                                    <div className="w-[400px] h-[200px] bg-rose-100/20 blur-[70px] rounded-full" />
                                </div>
                                Nuestra Historia
                            </h2>

                            <p className="font-elegant text-2xl sm:text-3xl lg:text-4xl text-slate-800/80 leading-relaxed max-w-3xl mx-auto font-light whitespace-pre-wrap">
                                {invitationText}
                            </p>

                            <div className="mt-16 flex justify-center">
                                <div className="w-24 h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
}
