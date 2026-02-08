import { motion } from 'framer-motion';
import { SectionTitle } from './SectionTitle';

interface VerseSectionProps {
    clientData: any;
}

export function VerseSection({ clientData }: VerseSectionProps) {
    const { bibleVerse, bibleVerseBook, invitationText, religiousSymbol } = clientData;

    if (!bibleVerse && !invitationText) return null;

    return (
        <section className="relative py-6 sm:py-20 overflow-hidden bg-white">
            <div className="section-container relative z-10">
                <div className="max-w-4xl mx-auto flex flex-col items-center">

                    {/* Header Ornamental */}
                    <SectionTitle subtitle="La Palabra">
                        Con Todo Nuestro Amor
                    </SectionTitle>

                    {/* Decoration Image */}
                    {clientData.verseImageUrl && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="flex justify-center -mt-6 -mb-4 sm:-mt-10 sm:-mb-8 relative z-0 pointer-events-none select-none"
                        >
                            <div className="relative w-40 h-40 sm:w-80 sm:h-80 opacity-90 mix-blend-multiply">
                                <img
                                    src={clientData.verseImageUrl}
                                    alt="Decoración"
                                    className="w-full h-full object-contain drop-shadow-md"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Content Container - Editorial Style */}
                    <div className="relative w-full max-w-2xl mx-auto text-center space-y-12 sm:space-y-16 px-4">

                        {/* Bible Verse */}
                        {bibleVerse && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1 }}
                                className="space-y-6"
                            >
                                {religiousSymbol && (
                                    <div className="text-4xl sm:text-5xl text-rose-300 font-light mb-4">
                                        {religiousSymbol}
                                    </div>
                                )}

                                <blockquote className="relative">
                                    <p className="text-xl sm:text-3xl font-elegant leading-relaxed text-slate-600 italic tracking-wide">
                                        "{bibleVerse}"
                                    </p>
                                    {bibleVerseBook && (
                                        <footer className="mt-6">
                                            <cite className="not-italic text-xs sm:text-sm font-bold tracking-[0.3em] uppercase text-rose-500">
                                                — {bibleVerseBook} —
                                            </cite>
                                        </footer>
                                    )}
                                </blockquote>
                            </motion.div>
                        )}

                        {/* Divider */}
                        {(bibleVerse && invitationText) && (
                            <motion.div
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                                className="w-24 h-px bg-rose-200 mx-auto"
                            />
                        )}

                        {/* Invitation Text - High Impact */}
                        {invitationText && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.3 }}
                                className="relative py-4"
                            >
                                <p className="font-elegant text-2xl sm:text-4xl leading-relaxed sm:leading-[1.8] text-slate-800 whitespace-pre-wrap drop-shadow-sm">
                                    {invitationText}
                                </p>

                            </motion.div>
                        )}

                    </div>
                </div>
            </div>
        </section>
    );
}
