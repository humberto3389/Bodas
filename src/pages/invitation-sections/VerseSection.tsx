import { motion } from 'framer-motion';

interface VerseSectionProps {
    clientData: any;
}

export function VerseSection({ clientData }: VerseSectionProps) {
    const { bibleVerse, bibleVerseBook, invitationText, religiousSymbol, weddingType } = clientData;

    if (!bibleVerse && !invitationText) return null;

    return (
        <section className="relative py-12 overflow-hidden">
            {/* Fondo limpio */}
            <div className="absolute inset-0 bg-white" />

            <div className="section-container relative z-10 text-center">
                <div className="max-w-4xl mx-auto space-y-12">
                    {/* Badge editorial */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col items-center gap-3 relative mb-4"
                    >
                        <span className="text-[10px] font-bold text-hati-accent uppercase tracking-[0.4em]">
                            {weddingType || 'Nuestra Boda'}
                        </span>
                        <div className="w-12 h-px bg-gray-100" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="card-luxe p-8 sm:p-12 relative"
                    >
                        <div className="relative px-6">
                            {religiousSymbol && (
                                <div className="text-3xl mb-6 text-hati-accent opacity-90">
                                    {religiousSymbol}
                                </div>
                            )}

                            <blockquote className="font-sans font-medium text-xl sm:text-2xl text-gray-800 leading-relaxed mb-8 max-w-2xl mx-auto">
                                “{bibleVerse}”
                            </blockquote>

                            {bibleVerseBook && (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-6 h-px bg-gray-200 rounded-full" />
                                    <p className="text-[10px] tracking-[0.3em] text-gray-400 uppercase font-bold">
                                        {bibleVerseBook}
                                    </p>
                                    <div className="w-6 h-px bg-gray-200 rounded-full" />
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Divisor elegante central */}
                    {(bibleVerse && invitationText) && (
                        <div className="flex justify-center items-center py-4">
                            <div className="w-1 h-1 rounded-full bg-gray-200" />
                        </div>
                    )}

                    {invitationText && (
                        <div className="space-y-8">
                            <motion.h2
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                className="text-gray-900 text-xl font-bold uppercase tracking-[0.2em]"
                            >
                                Nuestra Historia
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                className="font-sans text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal whitespace-pre-wrap"
                            >
                                {invitationText}
                            </motion.p>

                            <div className="mt-8 flex justify-center">
                                <div className="w-12 h-px bg-hati-accent/30" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
