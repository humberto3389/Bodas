import React, { useState, useEffect } from 'react';
import { convert12hTo24h, convert24hTo12h, formatTimeForDisplay } from '../lib/timezone-utils';

interface TimePickerProps {
    value: string; // "HH:mm"
    onChange: (time24h: string) => void;
    label?: string;
    helperText?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, label, helperText }) => {
    const { hour: h12, minute: m, ampm: p } = convert24hTo12h(value);

    const [hour, setHour] = useState(h12);
    const [minute, setMinute] = useState(m);
    const [ampm, setAmpm] = useState<'AM' | 'PM'>(p);

    // Sincronizar estado interno cuando el valor externo cambia (ej: al cargar datos)
    useEffect(() => {
        const parsed = convert24hTo12h(value);
        setHour(parsed.hour);
        setMinute(parsed.minute);
        setAmpm(parsed.ampm);
    }, [value]);

    const handleUpdate = (newH: number, newM: number, newP: 'AM' | 'PM') => {
        const time24 = convert12hTo24h(newH, newM, newP);
        onChange(time24);
    };

    const preview = formatTimeForDisplay(convert12hTo24h(hour, minute, ampm));

    return (
        <div className="space-y-4">
            {label && <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>}

            <div className="flex flex-wrap items-center gap-3">
                {/* Selector de Hora */}
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Hora</span>
                    <select
                        value={hour}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setHour(val);
                            handleUpdate(val, minute, ampm);
                        }}
                        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-slate-700"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                            <option key={h} value={h}>{h}</option>
                        ))}
                    </select>
                </div>

                <span className="text-2xl font-bold text-slate-300 mt-4">:</span>

                {/* Selector de Minutos */}
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Minutos</span>
                    <select
                        value={minute}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setMinute(val);
                            handleUpdate(hour, val, ampm);
                        }}
                        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-slate-700"
                    >
                        {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
                            <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                        ))}
                    </select>
                </div>

                {/* Selector AM/PM */}
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Periodo</span>
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        {(['AM', 'PM'] as const).map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => {
                                    setAmpm(p);
                                    handleUpdate(hour, minute, p);
                                }}
                                className={`px-4 py-2 rounded-lg text-xs font-black tracking-widest transition-all ${ampm === p
                                        ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Ayuda y Preview */}
            <div className="mt-2 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Se verá como: <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-4">{preview}</span> en la invitación
                    </span>
                </div>
                {helperText && <p className="text-[10px] text-slate-400 italic">{helperText}</p>}
            </div>
        </div>
    );
};
