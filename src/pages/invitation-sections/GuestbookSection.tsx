import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
            console.error(err);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <section id="muro" className="py-12 bg-transparent px-4 relative overflow-hidden">
            <div className="section-container">
                <div className="text-center mb-16 relative">
                    <motion.div
                        className="inline-flex flex-col items-center gap-3 mb-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-hati-accent">
                            Libro de Visitas
                        </span>
                        <div className="w-10 h-px bg-gray-100" />
                    </motion.div>

                    <h2 className="text-gray-900 text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-4">
                        Dedicatorias
                    </h2>
                    <p className="text-gray-500 text-base font-normal max-w-lg mx-auto leading-relaxed">
                        Palabras que guardaremos en el corazón por siempre.
                    </p>
                </div>

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
                            className="btn-luxe w-full sm:w-auto min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
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
                                <p className="font-sans text-xl text-gray-400 italic">
                                    Sé el primero en escribir nuestra historia...
                                </p>
                            </motion.div>
                        ) : (
                            messages.map((m, idx) => (
                                <motion.div
                                    key={m.id || idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    layout
                                    className="card-luxe p-8"
                                >
                                    <div className="mb-6">
                                        <p className="font-sans text-lg text-gray-700 font-normal leading-relaxed">
                                            "{m.message}"
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                        <h4 className="font-bold text-[10px] uppercase tracking-widest text-gray-900 font-sans">
                                            {m.name}
                                        </h4>
                                        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest font-sans">
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
