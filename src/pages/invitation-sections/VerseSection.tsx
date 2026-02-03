import { motion } from 'framer-motion';

interface VerseSectionProps {
    clientData: any;
}

export function VerseSection({ clientData }: VerseSectionProps) {
    const { bibleVerse, bibleVerseBook, invitationText, religiousSymbol, weddingType } = clientData;

    if (!bibleVerse && !invitationText) return null;

    return (
        <section className="relative py-12 overflow-hidden">
            {/* Halos decorativos sutiles */}
            <div className="absolute inset-0 bg-white" />
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-rose-50/30 rounded-full blur-[100px] pointer-events-none" />

            <div className="section-container relative z-10 text-center">
                <div className="max-w-4xl mx-auto space-y-12">
                    {/* Badge editorial */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="flex flex-col items-center gap-2 mb-12"
                    >
                        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.4em]">
                            {weddingType || 'Nuestra Boda'}
                        </span>
                        <div className="w-10 h-px bg-rose-600/40" />
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
                                    <div className="w-8 h-[2px] bg-rose-600/20 rounded-full" />
                                    <p className="text-[10px] tracking-[0.4em] text-slate-400 uppercase font-bold">
                                        {bibleVerseBook}
                                    </p>
                                    <div className="w-8 h-[2px] bg-rose-600/20 rounded-full" />
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Divisor elegante central */}
                    {(bibleVerse && invitationText) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="flex justify-center items-center py-6"
                        >
                            <div className="w-20 h-px bg-rose-100" />
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
                            <h2 className="text-2xl sm:text-3xl font-elegant tracking-[0.3em] text-rose-600 font-bold uppercase mb-10 text-center">
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
