import { motion } from 'framer-motion';
import type { GuestMessage } from '../../hooks/useClientData';

interface MessageManagerProps {
    messages: GuestMessage[];
    onDownloadCSV: () => void;
}

export function MessageManager({ messages, onDownloadCSV }: MessageManagerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl p-3 sm:p-6 md:p-8 shadow-xl border border-white/40"
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-brush bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                        Mensajes de Invitados
                    </h2>
                    <p className="text-neutral-500 text-xs sm:text-sm mt-1">Dedicatorias y deseos de tus invitados.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onDownloadCSV}
                    className="p-3 bg-white border border-neutral-200 rounded-2xl text-neutral-600 hover:bg-neutral-50 shadow-sm transition-all flex items-center gap-2 group"
                    title="Descargar Mensajes (Excel)"
                >
                    <svg className="w-5 h-5 group-hover:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Descargar</span>
                </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {messages.length === 0 ? (
                    <div className="md:col-span-2 py-20 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center text-3xl opacity-50">
                            ✍️
                        </div>
                        <p className="text-neutral-400 font-medium">No hay mensajes aún</p>
                    </div>
                ) : (
                    messages.map((m, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-rose-50/50 p-3 sm:p-4 md:p-6 rounded-3xl border border-rose-100 group hover:bg-rose-50 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-rose-200 flex items-center justify-center text-rose-600 font-bold text-sm">
                                        {m.name.charAt(0)}
                                    </div>
                                    <span className="font-bold text-neutral-800">{m.name}</span>
                                </div>
                                <span className="text-[10px] text-rose-300 font-bold uppercase tracking-widest">
                                    {m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}
                                </span>
                            </div>
                            <p className="text-neutral-600 italic text-xs sm:text-sm leading-relaxed">&ldquo;{m.message}&rdquo;</p>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
}
