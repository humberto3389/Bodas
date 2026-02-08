import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionTitle } from './SectionTitle';

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
        <section id="muro" className="py-6 sm:py-16 bg-transparent px-4 relative overflow-hidden">
            <div className="section-container">
                <SectionTitle subtitle="Libro de Visitas">
                    Dedicatorias
                </SectionTitle>

                <p className="text-lg text-slate-800/60 font-light tracking-wide max-w-lg mx-auto leading-relaxed text-center mb-16">
                    Palabras que guardaremos en el corazón por siempre.
                </p>

                {/* Formulario Elegante */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    onSubmit={handleSubmit}
                    className="card-luxe p-8 sm:p-12 mb-10 max-w-3xl mx-auto"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-10">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em]">Tu Identidad</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="input-luxe"
                                placeholder="Tu nombre..."
                                disabled={isSending}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em]">Tus Deseos</label>
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
                            className="px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border bg-rose-600 text-white border-rose-600 shadow-md hover:bg-rose-700 hover:border-rose-700 w-full sm:w-auto min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSending ? 'Guardando...' : 'Dejar Mensaje'}
                        </motion.button>
                    </div>
                </motion.form>

                {/* Grid de Mensajes Masonry-style */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
                    <AnimatePresence initial={false}>
                        {messages.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-full text-center py-20"
                            >
                                <p className="font-elegant text-2xl text-slate-800/40 italic">
                                    Sé el primero en escribir nuestra historia... ✨
                                </p>
                            </motion.div>
                        ) : (
                            messages.map((m, idx) => (
                                <motion.div
                                    key={m.id || idx}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    layout
                                    className="bg-white/80 p-8 rounded-2xl shadow-sm border border-slate-100/60 hover:shadow-md transition-shadow"
                                >
                                    <div className="mb-6">
                                        <p className="font-elegant text-xl text-slate-900/70 italic leading-relaxed">
                                            "{m.message}"
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <h4 className="font-bold text-xs uppercase tracking-widest text-slate-800">
                                            {m.name}
                                        </h4>
                                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                                            {m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
