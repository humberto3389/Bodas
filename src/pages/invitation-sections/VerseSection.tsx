import { motion } from 'framer-motion';
import { SectionTitle } from './SectionTitle';

interface VerseSectionProps {
    clientData: any;
}

export function VerseSection({ clientData }: VerseSectionProps) {
    const { bibleVerse, bibleVerseBook, invitationText, groomName, brideName } = clientData;

    if (!bibleVerse && !invitationText) return null;

    return (
        <section id="verse" className="py-20 relative overflow-hidden">
            <div className="w-full relative z-10 px-0 sm:px-6">
                <div className="max-w-4xl mx-auto flex flex-col items-center group">
                    {/* Header Ornamental */}
                    <SectionTitle subtitle="La Palabra">
                        Con Todo Nuestro Amor
                    </SectionTitle>

                    {/* Custom Image Decoration (Verse Image) */}
                    {clientData?.verseImageUrl && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="mb-12 relative w-full max-w-lg"
                        >
                            <div className="absolute inset-0 bg-rose-600/5 blur-2xl rounded-full scale-110" />
                            <img
                                src={clientData.verseImageUrl}
                                alt="Decoración"
                                className="relative w-full h-auto object-contain mx-auto"
                                style={{
                                    maskImage: 'radial-gradient(circle, black 60%, transparent 95%)',
                                    WebkitMaskImage: 'radial-gradient(circle, black 60%, transparent 95%)'
                                }}
                            />
                        </motion.div>
                    )}

                    {/* Content Container - Editorial Style */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="card-luxe overflow-hidden w-full sm:rounded-[3rem] rounded-none border-x-0 sm:border-x"
                    >
                        <div className="relative px-8 sm:px-12 py-16 sm:py-24 text-center space-y-10">
                            {/* Bible Verse */}
                            {bibleVerse && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1 }}
                                    className="space-y-6"
                                >
                                    <blockquote className="relative">
                                        <p className="font-elegant leading-relaxed text-slate-800 italic tracking-wide" style={{ fontSize: 'var(--font-size-xl)' }}>
                                            "{bibleVerse}"
                                        </p>
                                        {bibleVerseBook && (
                                            <footer className="mt-6">
                                                <cite className="not-italic text-[10px] font-black tracking-[0.4em] uppercase text-rose-500/60">
                                                    — {bibleVerseBook} —
                                                </cite>
                                            </footer>
                                        )}
                                    </blockquote>
                                </motion.div>
                            )}

                            {/* Divider */}
                            <div className="flex items-center justify-center gap-4 py-2">
                                <div className="h-[0.5px] w-12 bg-gradient-to-r from-transparent to-rose-200" />
                                <div className="w-1.5 h-1.5 border border-rose-300 rotate-45" />
                                <div className="h-[0.5px] w-12 bg-gradient-to-l from-transparent to-rose-200" />
                            </div>

                            {/* Invitation Text - High Impact */}
                            {invitationText && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, delay: 0.3 }}
                                >
                                    <h2 className="font-elegant font-bold text-slate-950 tracking-tight leading-snug" style={{ fontSize: 'var(--font-size-2xl)' }}>
                                        {invitationText}
                                    </h2>
                                </motion.div>
                            )}

                            {/* Footer Signature */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5 }}
                                className="pt-8"
                            >
                                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400 block mb-4">Con amor</span>
                                <div className="font-display text-rose-600 drop-shadow-sm" style={{ fontSize: 'var(--font-size-3xl)' }}>
                                    {clientData.groomName} & {clientData.brideName}
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
