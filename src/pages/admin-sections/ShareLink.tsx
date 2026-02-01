import { motion } from 'framer-motion';
import { getClientUrl } from '../../lib/config';

interface ShareLinkProps {
    subdomain?: string;
}

export function ShareLink({ subdomain }: ShareLinkProps) {
    const publicUrl = getClientUrl(subdomain || '');

    const handleCopy = () => {
        navigator.clipboard.writeText(publicUrl);
        // Aquí podrías agregar un toast de confirmación
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 mb-8"
        >
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 14.828a4 4 0 01-5.656 0L3 9.656l4.172-4.172a4 4 0 015.656 0l5.172 5.172a4 4 0 010 5.656L15 20l-1.172-1.172" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 mb-1">Compartir invitación</h2>
                        <p className="text-sm text-slate-500">Envía este enlace a tus invitados para que puedan ver la invitación</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                        <code className="text-sm text-slate-600 font-mono truncate block">
                            {publicUrl}
                        </code>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopy}
                        className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
                        title="Copiar enlace"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                    </motion.button>
                </div>

                <motion.a
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 min-w-[140px]"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver vista previa
                </motion.a>
            </div>
        </motion.div>
    );
}