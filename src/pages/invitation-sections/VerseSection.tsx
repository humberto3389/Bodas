import { motion } from 'framer-motion';
import { SectionTitle } from './SectionTitle';

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
                    {/* Title */}
                    <SectionTitle subtitle="La Palabra">
                        Con Todo Nuestro Amor
                    </SectionTitle>

                    {/* Decoration Image */}
                    {clientData.decorationImageUrl && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="flex justify-center -mt-8 -mb-4 relative"
                        >
                            <div className="relative w-48 h-48 sm:w-64 sm:h-64">
                                <img
                                    src={clientData.decorationImageUrl}
                                    alt="Decoración"
                                    className="w-full h-full object-contain"
                                    style={{
                                        maskImage: 'radial-gradient(circle, black 30%, transparent 75%)',
                                        WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 75%)',
                                        filter: 'blur(0.5px)'
                                    }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Bible Verse */}
                    {bibleVerse && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-center space-y-8"
                        >
                            {religiousSymbol && (
                                <div className="text-3xl text-amber-500/60 font-light italic">
                                    {religiousSymbol}
                                </div>
                            )}

                            <div className="relative inline-block group">
                                <p className="text-xl sm:text-2xl leading-relaxed text-slate-700 font-elegant italic max-w-2xl mx-auto px-6 tracking-wide">
                                    "{bibleVerse}"
                                </p>
                            </div>

                            {bibleVerseBook && (
                                <p className="text-[11px] tracking-[0.4em] text-rose-600/70 uppercase font-bold">
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
                            transition={{ duration: 0.8, delay: bibleVerse ? 0.2 : 0 }}
                            className="text-center pt-4"
                        >
                            <p className="text-lg sm:text-xl leading-[2.2] text-slate-600 font-elegant max-w-2xl mx-auto whitespace-pre-wrap px-6 tracking-normal opacity-90">
                                {invitationText}
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
}
