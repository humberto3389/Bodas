import { motion } from 'framer-motion';
import type { RSVP } from '../../hooks/useClientData';
import { getEffectivePlan, PLAN_LIMITS } from '../../lib/plan-limits';

interface RSVPManagerProps {
    rsvps: RSVP[];
    totalGuests: number;
    totalNotAttending: number;
    onDownloadCSV: (filterStatus?: boolean) => void;
    client?: any;
}

export function RSVPManager({ rsvps, totalGuests, totalNotAttending, onDownloadCSV, client }: RSVPManagerProps) {
    const attending = rsvps.filter(r => r.is_attending !== false);
    const notAttending = rsvps.filter(r => r.is_attending === false);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border border-white/40"
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-xl sm:text-2xl font-brush bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                        Gestión de Respuestas
                    </h2>
                    <p className="text-neutral-500 text-xs sm:text-sm mt-1">Gestiona quiénes vienen y quiénes no.</p>
                    {(() => {
                        if (!client) return null;
                        const plan = getEffectivePlan(client);
                        const limit = PLAN_LIMITS[plan].guests;
                        if (totalGuests >= limit && limit !== Infinity) {
                            return (
                                <p className="text-rose-500 text-[10px] sm:text-xs font-bold mt-2 animate-pulse">
                                    ⚠️ Has alcanzado el límite de {limit} invitados para el plan {plan.toUpperCase()}.
                                </p>
                            );
                        }
                        return null;
                    })()}
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none px-4 py-2 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-between sm:justify-start">
                        <span className="text-rose-400 text-[10px] uppercase tracking-wider font-bold">Asistentes Totales</span>
                        <span className="text-rose-600 font-bold text-lg sm:ml-3">{totalGuests}</span>
                    </div>
                    <div className="flex-1 sm:flex-none px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between sm:justify-start">
                        <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Inasistentes</span>
                        <span className="text-slate-600 font-bold text-lg sm:ml-3">{totalNotAttending}</span>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDownloadCSV()}
                        className="p-3 bg-white border border-neutral-200 rounded-2xl text-neutral-600 hover:bg-neutral-50 shadow-sm transition-all flex-shrink-0 flex items-center gap-2"
                        title="Descargar Lista Completa (Excel)"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Todo</span>
                    </motion.button>
                </div>
            </div>

            {/* Listas Separadas */}
            <div className="space-y-12">
                {/* SECCIÓN: SI ASISTIRÁN */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">Invitados que asistirán ({attending.length})</h3>
                        <div className="flex-1 h-px bg-slate-100"></div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onDownloadCSV(true)}
                            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span className="text-[9px] font-bold uppercase tracking-tighter">Descargar Lista</span>
                        </motion.button>
                    </div>

                    {/* Vista de Escritorio (Tabla) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-2">
                            <thead>
                                <tr className="text-neutral-400 text-[9px] uppercase tracking-widest font-bold">
                                    <th className="px-6 py-1">Invitado Principal</th>
                                    <th className="px-6 py-1">Contacto</th>
                                    <th className="px-6 py-1 text-center">Acompañantes</th>
                                    <th className="px-6 py-1 text-right">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attending.length === 0 ? (
                                    <tr><td colSpan={4} className="py-10 text-center text-neutral-400 text-xs italic">Nadie ha confirmado asistencia aún.</td></tr>
                                ) : (
                                    attending.map((rsvp, idx) => (
                                        <RSVPRow key={`attending-${idx}`} rsvp={rsvp} idx={idx} />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Vista Móvil (Cards) */}
                    <div className="md:hidden space-y-3">
                        {attending.map((rsvp, idx) => (
                            <RSVPCard key={`attending-mob-${idx}`} rsvp={rsvp} idx={idx} />
                        ))}
                    </div>
                </div>

                {/* SECCIÓN: NO PODRÁN ASISTIR */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <span className="flex h-2 w-2 rounded-full bg-rose-400"></span>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">Personas que no asistirán ({notAttending.length})</h3>
                        <div className="flex-1 h-px bg-slate-100"></div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onDownloadCSV(false)}
                            className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 hover:bg-rose-100 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span className="text-[9px] font-bold uppercase tracking-tighter">Descargar Lista</span>
                        </motion.button>
                    </div>

                    <div className="hidden md:block overflow-x-auto opacity-80">
                        <table className="w-full text-left border-separate border-spacing-y-2">
                            <thead>
                                <tr className="text-neutral-400 text-[9px] uppercase tracking-widest font-bold">
                                    <th className="px-6 py-1">Nombre</th>
                                    <th className="px-6 py-1">Contacto</th>
                                    <th className="px-6 py-1 text-center">Motivo/Nombres</th>
                                    <th className="px-6 py-1 text-right">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notAttending.length === 0 ? (
                                    <tr><td colSpan={4} className="py-10 text-center text-neutral-400 text-xs italic">Nadie ha reportado inasistencia aún.</td></tr>
                                ) : (
                                    notAttending.map((rsvp, idx) => (
                                        <RSVPRow key={`no-attending-${idx}`} rsvp={rsvp} idx={idx} />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Vista Móvil (Cards) */}
                    <div className="md:hidden space-y-3 opacity-80">
                        {notAttending.map((rsvp, idx) => (
                            <RSVPCard key={`no-attending-mob-${idx}`} rsvp={rsvp} idx={idx} />
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Sub-componente para filas de tabla
function RSVPRow({ rsvp, idx }: { rsvp: RSVP, idx: number }) {
    const detailNames = rsvp.is_attending !== false ? rsvp.attending_names : rsvp.not_attending_names;

    return (
        <motion.tr
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-neutral-50/50 hover:bg-white transition-colors group"
        >
            <td className="px-6 py-4 rounded-l-2xl border-y border-l border-transparent group-hover:border-rose-100">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] text-white font-bold ${rsvp.is_attending === false ? 'bg-slate-300' : 'bg-gradient-to-br from-rose-400 to-rose-600'}`}>
                        {rsvp.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-neutral-800 text-sm">{rsvp.name}</span>
                        {detailNames && (
                            <span className="text-[9px] text-slate-500 italic max-w-[250px] truncate" title={detailNames}>
                                {rsvp.is_attending !== false ? 'Trae a: ' : 'Reportó que no vienen: '}
                                {detailNames}
                            </span>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 border-y border-transparent group-hover:border-rose-100">
                <div className="flex flex-col">
                    <span className="text-xs text-neutral-600">{rsvp.email}</span>
                    {rsvp.phone && <span className="text-[9px] text-neutral-400 font-medium">{rsvp.phone}</span>}
                </div>
            </td>
            <td className="px-6 py-4 text-center border-y border-transparent group-hover:border-rose-100">
                <span className="inline-flex items-center px-2 py-0.5 bg-white border border-neutral-200 rounded-full text-[10px] font-bold text-neutral-700">
                    {rsvp.is_attending === false ? '—' : rsvp.guests}
                </span>
            </td>
            <td className="px-6 py-4 text-right rounded-r-2xl border-y border-r border-transparent group-hover:border-rose-100">
                <span className="text-[9px] text-neutral-400 font-medium whitespace-nowrap">
                    {rsvp.created_at ? new Date(rsvp.created_at).toLocaleDateString() : '—'}
                </span>
            </td>
        </motion.tr>
    );
}

// Sub-componente para tarjetas móviles
function RSVPCard({ rsvp, idx }: { rsvp: RSVP, idx: number }) {
    const detailNames = rsvp.is_attending !== false ? rsvp.attending_names : rsvp.not_attending_names;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100 space-y-3 ${rsvp.is_attending === false ? 'border-rose-100/50' : 'border-neutral-100'}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 ${rsvp.is_attending === false ? 'bg-slate-300' : 'bg-rose-400'}`}>
                        {rsvp.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-neutral-800 text-sm truncate leading-tight">{rsvp.name}</p>
                        <p className="text-[8px] text-neutral-400 uppercase tracking-tighter">Confirmado: {rsvp.created_at ? new Date(rsvp.created_at).toLocaleDateString() : '—'}</p>
                    </div>
                </div>
                {rsvp.is_attending !== false && (
                    <div className="bg-white px-2 py-0.5 rounded-lg border border-neutral-200">
                        <span className="text-[10px] font-bold text-neutral-700">{rsvp.guests}</span>
                        <span className="text-[7px] text-neutral-400 ml-1 uppercase font-bold tracking-tighter">Acomp.</span>
                    </div>
                )}
            </div>

            {detailNames && (
                <div className="bg-white/50 p-2 rounded-xl border border-neutral-100 text-[10px] text-slate-600">
                    <span className="font-bold opacity-70 block mb-1 uppercase tracking-tighter text-[8px]">
                        {rsvp.is_attending !== false ? 'Incluye a:' : 'Reportó que no vienen:'}
                    </span>
                    {detailNames}
                </div>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px]">
                <div className="flex items-center gap-1.5 text-neutral-600">
                    <span className="opacity-50">📧</span>
                    <span className="truncate max-w-[150px]">{rsvp.email}</span>
                </div>
                {rsvp.phone && (
                    <div className="flex items-center gap-1.5 text-neutral-600">
                        <span className="opacity-50">📞</span>
                        <span>{rsvp.phone}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
