import { motion, AnimatePresence } from 'framer-motion';
import { requestUpgrade } from '../lib/auth-system';
import { useState } from 'react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPlan: 'basic' | 'premium' | 'deluxe';
    clientId: string;
    onUpgradeRequested: () => void;
}

export function UpgradeModal({ isOpen, onClose, currentPlan, clientId, onUpgradeRequested }: UpgradeModalProps) {
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleUpgrade = async (newPlan: 'premium' | 'deluxe') => {
        setLoading(true);
        const success = await requestUpgrade(clientId, newPlan);
        setLoading(false);
        if (success) {
            setIsSuccess(true);
            onUpgradeRequested();
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
            }, 2500);
        } else {
            alert('Error al solicitar upgrade. Inténtalo de nuevo.');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
                >
                    <div className="p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
                        <AnimatePresence mode="wait">
                            {isSuccess ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">¡Solicitud Enviada!</h2>
                                    <p className="text-slate-600 font-medium leading-relaxed max-w-sm">
                                        Tu acceso temporal ha sido habilitado. Por favor, envía tu comprobante de pago por WhatsApp para la aprobación final.
                                    </p>
                                    <div className="mt-8 flex gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="selection"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full"
                                >
                                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <span className="text-3xl">👑</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Mejora tu Plan</h2>
                                    <p className="text-slate-600 mb-8">
                                        Has alcanzado los límites de tu plan {currentPlan === 'basic' ? 'Básico' : 'Premium'}.
                                        Actualiza ahora para desbloquear más características.
                                    </p>

                                    <div className="space-y-4">
                                        {currentPlan === 'basic' && (
                                            <button
                                                onClick={() => handleUpgrade('premium')}
                                                disabled={loading}
                                                className="w-full group relative flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-rose-400 transition-all bg-white hover:bg-rose-50"
                                            >
                                                <div className="text-left">
                                                    <h3 className="font-bold text-slate-900">Plan Premium</h3>
                                                    <p className="text-sm text-slate-500">200 invitados · 80 fotos · 3 videos</p>
                                                </div>
                                                <span className="text-rose-500 font-bold group-hover:scale-110 transition-transform">Elegir →</span>
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleUpgrade('deluxe')}
                                            disabled={loading}
                                            className="w-full group relative flex items-center justify-between p-4 rounded-xl border-2 border-amber-100 hover:border-amber-400 transition-all bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100"
                                        >
                                            <div>
                                                <div className="absolute -top-3 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">Recomendado</div>
                                                <div className="text-left">
                                                    <h3 className="font-bold text-slate-900">Plan Deluxe</h3>
                                                    <p className="text-sm text-slate-600">Todo Ilimitado · Animaciones · Video Fondo</p>
                                                </div>
                                            </div>
                                            <span className="text-amber-600 font-bold group-hover:scale-110 transition-transform">Elegir →</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="bg-slate-50 p-4 flex justify-center">
                        <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-800 font-medium">
                            Cancelar
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
