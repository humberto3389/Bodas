import { motion } from 'framer-motion';

interface VerseSectionProps {
    clientData: any;
}

export function VerseSection({ clientData }: VerseSectionProps) {
    const { bibleVerse, bibleVerseBook, invitationText, religiousSymbol } = clientData;

    if (!bibleVerse && !invitationText) return null;

    return (
        <section className="relative py-16 overflow-hidden">
            <div className="section-container relative z-10">
                <div className="max-w-4xl mx-auto">
                    {/* Bible Verse */}
                    {bibleVerse && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="mb-20"
                        >
                            {religiousSymbol && (
                                <div className="text-3xl mb-6 text-rose-500/60 text-center">
                                    {religiousSymbol}
                                </div>
                            )}

                            <blockquote className="relative">
                                {/* Opening quote */}
                                <span className="absolute -left-4 -top-2 text-6xl text-rose-500/20 font-serif leading-none">"</span>

                                <p className="font-elegant text-2xl sm:text-3xl md:text-4xl text-slate-800 leading-relaxed text-center italic px-8">
                                    {bibleVerse}
                                </p>

                                {/* Closing quote */}
                                <span className="absolute -right-4 -bottom-6 text-6xl text-rose-500/20 font-serif leading-none">"</span>
                            </blockquote>

                            {bibleVerseBook && (
                                <p className="text-xs tracking-[0.3em] text-slate-400 uppercase font-semibold text-center mt-8">
                                    — {bibleVerseBook}
                                </p>
                            )}
                        </motion.div>
                    )}

                    {/* Invitation Text */}
                    {invitationText && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: bibleVerse ? 0.2 : 0 }}
                            className="text-center"
                        >
                            <p className="font-elegant text-xl sm:text-2xl md:text-3xl text-slate-700 leading-relaxed max-w-3xl mx-auto whitespace-pre-wrap">
                                {invitationText}
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
}
