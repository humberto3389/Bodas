import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionTitle } from './SectionTitle';
import { safeNewDate } from '../../lib/timezone-utils';

interface GuestbookSectionProps {
    messages: any[];
    onSendMessage: (name: string, message: string) => Promise<any>;
}

export function GuestbookSection({ messages, onSendMessage }: GuestbookSectionProps) {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !message.trim()) return;
        setIsSending(true);
        try {
            await onSendMessage(name, message);
            setName('');
            setMessage('');
        } catch (err) {
            // Silencioso: el UI de envío/estado ya informa implícitamente (spinner/botón deshabilitado).
        } finally {
            setIsSending(false);
        }
    };

    return (
        <section id="guestbook" className="relative overflow-hidden px-4 sm:px-6">
            <div className="section-container">
                <SectionTitle subtitle="Libro de Visitas">
                    Dedicatorias
                </SectionTitle>

                <p className="text-lg text-theme-muted font-light tracking-wide max-w-lg mx-auto leading-relaxed text-center mb-8">
                    Palabras que guardaremos en el corazón por siempre.
                </p>

                {/* Formulario Elegante */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    onSubmit={handleSubmit}
                    className="bg-theme-surface border border-theme-border shadow-xl backdrop-blur-md text-theme-text p-8 sm:p-12 mb-10 max-w-3xl mx-auto rounded-2xl sm:rounded-[2rem]"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-10">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-theme-muted uppercase tracking-[0.2em]">Tu Identidad</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="input-luxe"
                                placeholder="Tu nombre..."
                                disabled={isSending}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-theme-muted uppercase tracking-[0.2em]">Tus Deseos</label>
                            <textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                className="input-luxe resize-none"
                                placeholder="Escribe algo especial..."
                                disabled={isSending}
                                rows={1}
                            />
                        </div>
                    </div>

                    <div className="text-center">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isSending || !name.trim() || !message.trim()}
                            className="px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border bg-theme-primary text-theme-bg border-theme-border shadow-md hover:bg-theme-primary/90 w-full sm:w-auto min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSending ? 'Guardando...' : 'Dejar Mensaje'}
                        </motion.button>
                    </div>
                </motion.form>

                {/* Grid de Mensajes Masonry-style */}
                <AnimatePresence initial={false}>
                    {messages.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-12 overflow-hidden"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
                                {messages.map((m, idx) => (
                                    <motion.div
                                        key={m.id || idx}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        layout
                                        className="bg-theme-surface border border-theme-border text-theme-text p-8 rounded-2xl shadow-sm hover:shadow-2xl transition-shadow"
                                    >
                                        <div className="mb-6">
                                            <p className="font-elegant text-xl italic leading-relaxed">
                                                "{m.message}"
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between pt-6 border-t border-theme-border">
                                            <h4 className="font-bold text-xs uppercase tracking-widest text-theme-text">
                                                {m.name}
                                            </h4>
                                            <span className="text-[9px] font-bold text-theme-muted uppercase tracking-widest">
                                                {m.created_at ? safeNewDate(m.created_at).toLocaleDateString() : '—'}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
