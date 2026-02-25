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

    // Contar nombres válidos en el textarea
    const countValidNames = (text: string): number => {
        return text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .length;
    };

    // Validar que un nombre sea realista (no palabras vagas)
    const isValidName = (name: string): boolean => {
        const trimmed = name.trim().toLowerCase();

        // Palabras sospechosas que NO son nombres
        const suspiciousWords = [
            'no', 'no sé', 'no se', 'nosé', 'nose',
            'nadie', 'no creo', 'no hay', 'ninguno', 'ninguna',
            'pendiente', 'por definir', 'por confirmar',
            'amigo', 'amiga', 'persona', 'alguien', 'otro',
            'acompañante', 'familiar', 'tbd', 'undefined', 'null',
            '?', '...', 'x', 'xx', 'xxx',
            'test', 'prueba', 'demo', 'ejemplo'
        ];

        // Si es exactamente una palabra sospechosa, no es válido
        if (suspiciousWords.includes(trimmed)) {
            return false;
        }

        // Validar longitud mínima (nombre debe tener 3+ caracteres)
        if (trimmed.length < 3) {
            return false;
        }

        // Idealmente un nombre debe tener al menos una letra seguida de espacio seguida de otra letra
        // O al menos de 5 caracteres
        const hasSpace = trimmed.includes(' ');
        if (hasSpace) {
            const parts = trimmed.split(' ').filter(p => p.length > 0);
            // Debe tener al menos 2 partes, cada una con 2+ caracteres
            if (parts.length >= 2 && parts.every(p => p.length >= 2)) {
                return true;
            }
        }

        // Si no tiene espacio pero tiene suficiente longitud, puede ser válido
        if (trimmed.length >= 5 && /^[a-záéíóúñ\s'-]+$/i.test(trimmed)) {
            return true;
        }

        return false;
    };

    // Detectar nombres sospechosos en el textarea
    const checkSuspiciousNames = (text: string): string | null => {
        const names = text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        const invalidNames = names.filter(name => !isValidName(name));

        if (invalidNames.length > 0) {
            return `⚠️ Estos nombres no parecen válidos: "${invalidNames.join('", "')}". Verifica que sean nombres reales.`;
        }

        return null;
    };

    const validNamesCount = countValidNames(formValues.attendingNames);
    const suspiciousError = formValues.attendingNames?.trim() ? checkSuspiciousNames(formValues.attendingNames) : null;

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
        <section id="rsvp" className="py-20 relative overflow-hidden px-4 sm:px-6">
            <div className="w-full relative px-0 sm:px-6">
                <SectionTitle subtitle="Confirmación">
                    Confirma tu Asistencia
                </SectionTitle>
                <p className="font-elegant italic text-slate-500 text-center mb-12 opacity-80 decoration-rose-200 decoration-wavy underline underline-offset-8" style={{ fontSize: 'var(--font-size-lg)' }}>
                    Será un honor para nosotros contar con tu presencia en este día tan especial.
                </p>

                <motion.form
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="card-luxe p-8 sm:p-12 relative group rounded-3xl sm:rounded-[3rem] max-w-3xl mx-auto"
                >
                    <div className="space-y-12 relative z-10">
                        {/* ¿Asistirás? */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 text-center">¿Confirmas tu asistencia?</h3>
                            <div className="flex flex-wrap justify-center gap-6">
                                <button
                                    type="button"
                                    onClick={() => setValue('isAttending', true)}
                                    className={`px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-500 border ${formValues.isAttending ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-105' : 'bg-rose-50/50 text-rose-300 border-rose-100 hover:border-rose-300'}`}
                                >
                                    ¡Sí, asistiré!
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setValue('isAttending', false)}
                                    className={`px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-500 border ${formValues.isAttending === false ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-105' : 'bg-rose-50/50 text-rose-300 border-rose-100 hover:border-rose-300'}`}
                                >
                                    No podré asistir
                                </button>
                            </div>
                            <input type="hidden" {...register('isAttending')} />
                        </div>

                        {/* Nombre */}
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4">
                                Nombre Completo <span className="text-rose-500 text-sm">*</span>
                            </label>
                            <input
                                {...register('name', { required: 'Por favor ingresa tu nombre' })}
                                className="input-luxe"
                                placeholder="Escribe tu nombre aquí"
                            />
                            {errors.name && <p className="text-rose-500 text-[9px] font-black mt-2 uppercase tracking-widest ml-4">{errors.name.message as string}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Email */}
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4">Email <span className="opacity-50">(Opcional)</span></label>
                                <input
                                    {...register('email', { pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' } })}
                                    className="input-luxe"
                                    placeholder="tu@email.com"
                                />
                                {errors.email && <p className="text-rose-500 text-[9px] font-black mt-2 uppercase tracking-widest ml-4">{errors.email.message as string}</p>}
                            </div>

                            {/* Invitados (Solo si asiste) */}
                            {formValues.isAttending && (
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4">N° de Acompañantes</label>
                                    <input
                                        type="number"
                                        {...register('guests', { valueAsNumber: true, min: { value: 0, message: 'Mínimo 0' }, max: { value: 10, message: 'Máximo 10' } })}
                                        className="input-luxe"
                                        defaultValue={0}
                                    />
                                    {errors.guests && <p className="text-rose-500 text-[9px] font-black mt-2 uppercase tracking-widest ml-4">{errors.guests.message as string}</p>}
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
                                    📝 <strong>Si vienes con acompañantes (</strong>familia o amigos<strong>):</strong> Escribe sus nombres COMPLETOS y REALES (ej: Juan Pérez, María García), uno por línea.
                                </p>
                                <p className="text-[9px] text-slate-600 uppercase tracking-wider mb-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    ✓ <strong>Si todavía no sabes quién te acomp:</strong> Cambia a "0 acompañantes" y confirma. Luego puedes editar tu respuesta cuando lo sepas.
                                </p>
                                <p className="text-[9px] text-orange-600 uppercase tracking-wider mb-3 bg-orange-50 p-3 rounded-lg border border-orange-200">
                                    ⚠️ <strong>Nombres NO válidos:</strong> "No sé", "Nadie", "Pendiente", "Amigo", iniciales, puntos suspensivos (...)
                                </p>
                                <textarea
                                    {...register('attendingNames', {
                                        validate: {
                                            required: (value) => {
                                                if (formValues.guests > 0 && !value?.trim()) {
                                                    return 'Debes ingresar los nombres de tus acompañantes';
                                                }
                                                return true;
                                            },
                                            matching: (value) => {
                                                if (formValues.guests > 0 && value?.trim()) {
                                                    const count = countValidNames(value);
                                                    if (count !== formValues.guests) {
                                                        return `Escribiste ${count} nombre(s), pero dijiste ${formValues.guests} acompañante(s). Deben coincidir.`;
                                                    }
                                                }
                                                return true;
                                            },
                                            validNames: (value) => {
                                                if (formValues.guests > 0 && value?.trim()) {
                                                    const suspicious = checkSuspiciousNames(value);
                                                    if (suspicious) {
                                                        return suspicious;
                                                    }
                                                }
                                                return true;
                                            }
                                        }
                                    })}
                                    className="input-luxe min-h-[100px] py-4 resize-none"
                                    placeholder="Ejemplo: Rosa Pérez&#10;Juan Pérez&#10;María Pérez"
                                />
                                {errors.attendingNames && <p className="text-rose-500 text-[10px] font-bold mt-1 uppercase tracking-widest">{errors.attendingNames.message as string}</p>}
                                {!errors.attendingNames && suspiciousError && (
                                    <p className="text-amber-600 text-[10px] font-bold mt-1 uppercase tracking-widest bg-amber-50 p-2 rounded border border-amber-200">
                                        {suspiciousError}
                                    </p>
                                )}
                                {formValues.guests > 0 && formValues.attendingNames?.trim() && !errors.attendingNames && !suspiciousError && (
                                    <p className="text-emerald-600 text-[9px] font-semibold mt-1 uppercase tracking-widest">
                                        ✓ Detectados {validNamesCount} nombre(s) válido(s) de {formValues.guests} acompañante(s)
                                    </p>
                                )}
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

                        <div className="pt-10 text-center">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-luxe w-full py-5 text-[11px]"
                            >
                                {isSubmitting ? 'Enviando...' :
                                    status === 'success' ? '✓ Asistencia Registrada' :
                                        status === 'error' ? '✖ Error - Reintentar' : 'Confirmar Asistencia'}
                            </motion.button>
                        </div>
                    </div>


                    <AnimatePresence>
                        {(status === 'success' || status === 'error') && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`absolute inset-x-0 bottom-0 py-4 text-center text-[10px] font-black uppercase tracking-[0.4em] ${status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
                            >
                                {status === 'success' ? '✨ ¡Gracias! Tu asistencia ha sido registrada.' : `✖ ${errorMessage}`}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.form>
            </div>
        </section>
    );
}
