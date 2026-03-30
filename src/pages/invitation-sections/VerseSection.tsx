import { motion } from 'framer-motion';
import { SectionTitle } from './SectionTitle';
import { getOptimizedImageUrl } from '../../lib/image-optimization';

interface VerseSectionProps {
    clientData: any;
}

export function VerseSection({ clientData }: VerseSectionProps) {
    const { bibleVerse, bibleVerseBook, invitationText } = clientData;

    if (!bibleVerse && !invitationText) return null;

    return (
        <section id="verse" className="relative overflow-hidden px-4 sm:px-6">
            <div className="section-container">
                <div className="max-w-4xl mx-auto flex flex-col items-center group">
                    {/* Header Ornamental */}
                    <SectionTitle subtitle="La Palabra">
                        Con Todo Nuestro Amor
                    </SectionTitle>

                    {/* Custom Image Decoration (Verse Image) */}
                    {clientData?.verseImageUrl && clientData.verseImageUrl !== 'null' && clientData.verseImageUrl !== 'undefined' && clientData.verseImageUrl !== '' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="mb-8 relative w-full max-w-lg"
                        >
                            <div className="absolute inset-0 bg-theme-accent/10 blur-2xl rounded-full scale-110" />
                            <img
                                src={getOptimizedImageUrl(clientData.verseImageUrl, { width: 600, quality: 70 })}
                                alt=""
                                loading="lazy"
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
                        className="bg-theme-surface border border-theme-border shadow-2xl backdrop-blur-md text-theme-text overflow-hidden w-full rounded-3xl sm:rounded-[3rem] max-w-4xl mx-auto"
                    >
                        <div className="relative px-8 sm:px-12 py-12 sm:py-20 text-center space-y-10">
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
                                        <p className="font-elegant leading-relaxed text-theme-text italic tracking-wide" style={{ fontSize: 'var(--font-size-xl)' }}>
                                            "{bibleVerse}"
                                        </p>
                                        {bibleVerseBook && (
                                            <footer className="mt-6">
                                                <cite className="not-italic text-[10px] font-black tracking-[0.4em] uppercase text-theme-accent/80">
                                                    — {bibleVerseBook} —
                                                </cite>
                                            </footer>
                                        )}
                                    </blockquote>
                                </motion.div>
                            )}

                            {/* Divider */}
                            <div className="flex items-center justify-center gap-4 py-2">
                                <div className="h-[0.5px] w-12 bg-gradient-to-r from-transparent to-theme-accent/50" />
                                <div className="w-1.5 h-1.5 border border-theme-accent rotate-45" />
                                <div className="h-[0.5px] w-12 bg-gradient-to-l from-transparent to-theme-accent/50" />
                            </div>

                            {/* Invitation Text - High Impact */}
                            {invitationText && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, delay: 0.3 }}
                                >
                                    <h2 className="font-elegant font-bold text-theme-text tracking-tight leading-snug" style={{ fontSize: 'var(--font-size-2xl)' }}>
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
                                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-theme-muted block mb-4">Con amor</span>
                                <div className="font-display text-theme-accent drop-shadow-sm" style={{ fontSize: 'var(--font-size-3xl)' }}>
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
