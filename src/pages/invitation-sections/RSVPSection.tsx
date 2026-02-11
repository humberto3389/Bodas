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
        <section id="rsvp" className="py-10 sm:py-16 bg-transparent px-4 relative overflow-hidden">
            <div className="max-w-3xl mx-auto relative z-10">
                <SectionTitle subtitle="Confirmación">
                    Confirma tu Asistencia
                </SectionTitle>
                <p className="text-lg text-slate-800/60 font-light tracking-wide max-w-lg mx-auto leading-relaxed text-center mb-8">
                    Será un honor para nosotros contar con tu presencia en este día tan especial.
                </p>

                <motion.form
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="card-luxe p-8 sm:p-12 relative overflow-hidden"
                >
                    <div className="space-y-10 relative z-10">
                        {/* ¿Asistirás? */}
                        <div className="space-y-4">
                            <label className="block text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] text-center">¿Confirmas tu asistencia?</label>
                            <div className="flex flex-wrap justify-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setValue('isAttending', true)}
                                    className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border ${formValues.isAttending ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
                                >
                                    ¡Sí, asistiré!
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setValue('isAttending', false)}
                                    className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border ${formValues.isAttending === false ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
                                >
                                    No podré asistir
                                </button>
                            </div>
                            <input type="hidden" {...register('isAttending')} />
                        </div>

                        {/* Nombre */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em]">
                                Nombre Completo <span className="text-rose-600 text-sm">*</span>
                            </label>
                            <input
                                {...register('name', { required: 'Por favor ingresa tu nombre' })}
                                className="input-luxe"
                                placeholder="Escribe tu nombre aquí"
                            />
                            {errors.name && <p className="text-rose-500 text-[10px] font-bold mt-1 uppercase tracking-widest">{errors.name.message as string}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Email */}
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em]">Correo Electrónico <span className="text-slate-400 text-xs">(opcional)</span></label>
                                <input
                                    {...register('email', { pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' } })}
                                    className="input-luxe"
                                    placeholder="tu@email.com"
                                />
                                {errors.email && <p className="text-rose-500 text-[10px] font-bold mt-1 uppercase tracking-widest">{errors.email.message as string}</p>}
                            </div>

                            {/* Invitados (Solo si asiste) */}
                            {formValues.isAttending && (
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em]">N° de Acompañantes</label>
                                    <input
                                        type="number"
                                        {...register('guests', { valueAsNumber: true, min: { value: 0, message: 'Mínimo 0' }, max: { value: 10, message: 'Máximo 10' } })}
                                        className="input-luxe"
                                        defaultValue={0}
                                    />
                                    {errors.guests && <p className="text-rose-500 text-[10px] font-bold mt-1 uppercase tracking-widest">{errors.guests.message as string}</p>}
                                </div>
                            )}
                        </div>

                        {/* Nombres de invitados que asistirán */}
                        {formValues.isAttending && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-2"
                            >
                                <label className="block text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em]">
                                    Nombres de Acompañantes {formValues.guests > 0 && <span className="text-rose-600 text-sm">*</span>}
                                </label>
                                <p className="text-[9px] text-slate-600 uppercase tracking-wider mb-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    📝 <strong>Si vienes con acompañantes (</strong>familia o amigos<strong>):</strong> Escribe sus nombres completos en el campo de abajo, uno por línea.
                                </p>
                                <p className="text-[9px] text-slate-600 uppercase tracking-wider mb-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    ✓ <strong>Si vienes solo (sin acompañantes):</strong> Deja este campo vacío.
                                </p>
                                <textarea
                                    {...register('attendingNames', {
                                        validate: {
                                            required: (value) => {
                                                if (formValues.guests > 0 && !value?.trim()) {
                                                    return 'Debes ingresar los nombres de tus acompañantes';
                                                }
                                                return true;
                                            }
                                        }
                                    })}
                                    className="input-luxe min-h-[100px] py-4 resize-none"
                                    placeholder="Ejemplo: Rosa Pérez&#10;Juan Pérez&#10;María Pérez"
                                />
                                {errors.attendingNames && <p className="text-rose-500 text-[10px] font-bold mt-1 uppercase tracking-widest">{errors.attendingNames.message as string}</p>}
                            </motion.div>
                        )}

                        {/* Nombres de personas que NO asistirán */}
                        {formValues.isAttending === false && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-2"
                            >
                                <label className="block text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em]">¿Quiénes no podrán asistir?</label>
                                <p className="text-[9px] text-rose-500/70 uppercase tracking-wider mb-2">Lamentamos que no puedan venir. Por favor dinos los nombres de las personas que no podrán asistir.</p>
                                <textarea
                                    {...register('notAttendingNames')}
                                    className="input-luxe min-h-[100px] py-4 resize-none"
                                    placeholder="Escribe aquí los nombres de quienes no podrán acompañarnos..."
                                />
                            </motion.div>
                        )}

                        <div className="pt-6 text-center">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full sm:w-auto min-w-[200px] px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border shadow-md text-white ${status === 'success' ? 'bg-rose-600 border-rose-600' : status === 'error' ? 'bg-rose-500 border-rose-500' : 'bg-rose-600 border-rose-600 hover:bg-rose-700 hover:border-rose-700'}`}
                            >
                                {isSubmitting ? 'Enviando...' :
                                    status === 'success' ? 'Confirmado' :
                                        status === 'error' ? 'Reintentar' : 'Enviar Confirmación'}
                            </motion.button>
                        </div>
                    </div>


                    <AnimatePresence>
                        {(status === 'success' || status === 'error') && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`absolute inset-x-0 bottom-0 py-3 text-center text-[10px] font-bold uppercase tracking-widest ${status === 'success' ? 'bg-rose-50 text-rose-600' : 'bg-rose-100 text-rose-700'}`}
                            >
                                {status === 'success' ? '¡Gracias! Tu asistencia ha sido registrada.' : errorMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.form>
            </div>
        </section>
    );
}
