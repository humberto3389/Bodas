import { motion } from 'framer-motion';

interface VerseSectionProps {
    clientData: any;
}

export function VerseSection({ clientData }: VerseSectionProps) {
    const { bibleVerse, bibleVerseBook, invitationText, religiousSymbol } = clientData;

    if (!bibleVerse && !invitationText) return null;

    return (
        <section className="relative py-12 overflow-hidden">
            <div className="section-container relative z-10">
                <div className="max-w-3xl mx-auto space-y-16">
                    {/* Bible Verse */}
                    {bibleVerse && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-center space-y-6"
                        >
                            {religiousSymbol && (
                                <div className="text-2xl text-amber-500/70">
                                    {religiousSymbol}
                                </div>
                            )}

                            <div className="relative inline-block">
                                <p className="text-lg sm:text-xl leading-relaxed text-slate-600 font-light max-w-2xl mx-auto px-4">
                                    {bibleVerse}
                                </p>
                            </div>

                            {bibleVerseBook && (
                                <p className="text-[10px] tracking-[0.25em] text-amber-600/80 uppercase font-semibold">
                                    {bibleVerseBook}
                                </p>
                            )}
                        </motion.div>
                    )}

                    {/* Invitation Text */}
                    {invitationText && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: bibleVerse ? 0.15 : 0 }}
                            className="text-center"
                        >
                            <p className="text-base sm:text-lg leading-loose text-slate-700 font-normal max-w-2xl mx-auto whitespace-pre-wrap px-4">
                                {invitationText}
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
}
