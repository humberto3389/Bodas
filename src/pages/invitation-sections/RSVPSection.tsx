import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionTitle } from './SectionTitle';
import { useForm } from 'react-hook-form';

interface RSVPSectionProps {
    onSubmit: (data: any) => Promise<any>;
}

export function RSVPSection({ onSubmit }: RSVPSectionProps) {
    const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            isAttending: true,
            name: '',
            email: '',
            guests: 0,
            attendingNames: '',
            notAttendingNames: ''
        }
    });
    const formValues = watch();
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Reutilizar lógica de validación existente
    const countValidNames = (text: string): number => {
        return text.split('\n').map(line => line.trim()).filter(line => line.length > 0).length;
    };

    const isValidName = (name: string): boolean => {
        const trimmed = name.trim().toLowerCase();
        const suspiciousWords = [
            'no', 'no sé', 'no se', 'nosé', 'nose', 'nadie', 'no creo', 'no hay', 'ninguno', 'ninguna',
            'pendiente', 'por definir', 'por confirmar', 'amigo', 'amiga', 'persona', 'alguien', 'otro',
            'acompañante', 'familiar', 'tbd', 'undefined', 'null', '?', '...', 'x', 'xx', 'xxx', 'test', 'prueba', 'demo'
        ];
        if (suspiciousWords.includes(trimmed)) return false;
        if (trimmed.length < 3) return false;
        const hasSpace = trimmed.includes(' ');
        if (hasSpace) {
            const parts = trimmed.split(' ').filter(p => p.length > 0);
            if (parts.length >= 2 && parts.every(p => p.length >= 2)) return true;
        }
        if (trimmed.length >= 5 && /^[a-záéíóúñ\s'-]+$/i.test(trimmed)) return true;
        return false;
    };

    const checkSuspiciousNames = (text: string): string | null => {
        const names = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        const invalidNames = names.filter(name => !isValidName(name));
        if (invalidNames.length > 0) {
            return `Nombres no válidos detectados: "${invalidNames.join('", "')}"`;
        }
        return null;
    };

    // Removed unused validNamesCount and suspiciousError to fix lints

    const handleFormSubmit = async (data: any) => {
        try {
            await onSubmit(data);
            setStatus('success');
            reset();
            setTimeout(() => setStatus('idle'), 5000);
        } catch (err: any) {
            setStatus('error');
            setErrorMessage(err.message || 'Error al enviar confirmación');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    return (
        <section id="rsvp" className="py-24 relative overflow-hidden px-4 sm:px-6 bg-transparent">
            <div className="max-w-4xl mx-auto">
                <SectionTitle subtitle="RSVP">
                    Confirma tu Asistencia
                </SectionTitle>
                
                <p className="font-elegant text-slate-500 text-center mb-16 max-w-xl mx-auto leading-relaxed" style={{ fontSize: 'var(--font-size-lg)' }}>
                    Nos encantaría que nos acompañaras en este día inolvidable. 
                    Por favor, confírmanos antes del <span className="text-rose-600 font-semibold italic">20 de enero</span>.
                </p>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    {/* Decorative Elements */}
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-rose-100/30 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-100/30 rounded-full blur-3xl" />

                    <form 
                        onSubmit={handleSubmit(handleFormSubmit)}
                        className="relative z-10 bg-white/40 backdrop-blur-3xl border border-white p-6 sm:p-14 rounded-[2.5rem] sm:rounded-[4rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]"
                    >
                        <div className="space-y-10">
                            {/* Toggle Selector */}
                            <div className="flex flex-col items-center space-y-4">
                                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">¿Podrás acompañarnos?</label>
                                <div className="p-1.5 bg-slate-100/50 rounded-full flex gap-1 border border-slate-200/50">
                                    <button
                                        type="button"
                                        onClick={() => setValue('isAttending', true)}
                                        className={`px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${formValues.isAttending ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        ¡Claro que sí!
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setValue('isAttending', false)}
                                        className={`px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${formValues.isAttending === false ? 'bg-white text-slate-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        Lamentablemente no
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Nombre */}
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 ml-2">Tu Nombre Completo</label>
                                    <input
                                        {...register('name', { required: 'Necesitamos tu nombre' })}
                                        className="w-full bg-white/60 border border-slate-200/50 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none text-slate-700 placeholder:text-slate-300 shadow-sm"
                                        placeholder="Nombre y apellido"
                                    />
                                    {errors.name && <p className="text-rose-500 text-[9px] font-bold mt-1 ml-2 uppercase tracking-tighter">{errors.name.message as string}</p>}
                                </div>

                                {/* Email */}
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 ml-2">Email (Opcional)</label>
                                    <input
                                        {...register('email', { pattern: { value: /^\S+@\S+$/i, message: 'Formato inválido' } })}
                                        className="w-full bg-white/60 border border-slate-200/50 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none text-slate-700 placeholder:text-slate-300 shadow-sm"
                                        placeholder="ejemplo@correo.com"
                                    />
                                    {errors.email && <p className="text-rose-500 text-[9px] font-bold mt-1 ml-2 uppercase tracking-tighter">{errors.email.message as string}</p>}
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {formValues.isAttending ? (
                                    <motion.div
                                        key="attending"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-8 overflow-hidden"
                                    >
                                        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-4" />
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 ml-2">Acompañantes</label>
                                                <input
                                                    type="number"
                                                    {...register('guests', { min: 0, max: 10 })}
                                                    className="w-full bg-white/60 border border-slate-200/50 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-500/20 transition-all outline-none text-center font-bold text-slate-700 shadow-sm"
                                                />
                                            </div>
                                            
                                            <div className="md:col-span-2 space-y-3">
                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 ml-2">Nombres de Acompañantes</label>
                                                <textarea
                                                    {...register('attendingNames', {
                                                        validate: {
                                                            required: (v) => formValues.guests > 0 && !v?.trim() ? 'Ingresa los nombres' : true,
                                                            matching: (v) => formValues.guests > 0 && countValidNames(v) !== formValues.guests ? `Faltan ${formValues.guests - countValidNames(v)} nombres` : true,
                                                            valid: (v) => formValues.guests > 0 && checkSuspiciousNames(v) || true
                                                        }
                                                    })}
                                                    className="w-full bg-white/60 border border-slate-200/50 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-500/20 transition-all outline-none text-slate-700 placeholder:text-slate-300 min-h-[120px] resize-none shadow-sm"
                                                    placeholder="Escribe un nombre por línea..."
                                                />
                                                {errors.attendingNames && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-2 uppercase">{errors.attendingNames.message as string}</p>}
                                                
                                                {!errors.attendingNames && formValues.guests > 0 && (
                                                    <div className="bg-rose-50/50 border border-rose-100/50 rounded-xl p-3 flex items-center gap-3">
                                                        <span className="text-lg">💡</span>
                                                        <p className="text-[10px] text-rose-700/80 leading-tight">
                                                            Indica los nombres completos de tus acompañantes (uno por cada línea).
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="not-attending"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4 pt-4 overflow-hidden"
                                    >
                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center">
                                            <p className="text-slate-500 italic text-sm">Lamentamos que no puedas acompañarnos, se te extrañará.</p>
                                        </div>
                                        <textarea
                                            {...register('notAttendingNames')}
                                            className="w-full bg-white/60 border border-slate-200/50 rounded-2xl px-6 py-4 outline-none text-slate-700 min-h-[100px] resize-none shadow-sm"
                                            placeholder="¿Quiénes no podrán asistir? (Opcional)"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="pt-6">
                                <motion.button
                                    whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(225, 29, 72, 0.4)" }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-[0.3em] py-5 rounded-2xl shadow-xl shadow-rose-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[11px]"
                                >
                                    {isSubmitting ? 'Procesando...' : 
                                     status === 'success' ? '✓ ¡Gracias por confirmar!' : 
                                     status === 'error' ? '✖ Error - Reintentar' : 'Enviar Confirmación'}
                                </motion.button>
                            </div>
                        </div>
                    </form>

                    {/* Success/Error Overlay */}
                    <AnimatePresence>
                        {status !== 'idle' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="absolute inset-0 z-[20] flex items-center justify-center p-6"
                            >
                                <div className={`w-full max-w-sm p-10 rounded-[3rem] shadow-2xl text-center backdrop-blur-xl border ${status === 'success' ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800' : 'bg-rose-50/95 border-rose-200 text-rose-800'}`}>
                                    <div className="text-5xl mb-6">{status === 'success' ? '✨' : '⚠️'}</div>
                                    <h4 className="font-elegant text-2xl mb-4 tracking-wide">{status === 'success' ? '¡Confirmación Recibida!' : 'Hubo un error'}</h4>
                                    <p className="text-sm opacity-80 mb-8">{status === 'success' ? 'Tu respuesta se ha guardado correctamente. ¡Nos vemos pronto!' : errorMessage}</p>
                                    <button 
                                        type="button"
                                        onClick={() => setStatus('idle')}
                                        className={`px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors ${status === 'success' ? 'border-emerald-200 hover:bg-emerald-100' : 'border-rose-200 hover:bg-rose-100'}`}
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    );
}
