import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { convert12hTo24h, convert24hTo12h, formatTimeForDisplay } from '../lib/timezone-utils';

interface TimePickerProps {
    value: string; // "HH:mm" (24h format)
    onChange: (time24h: string) => void;
    label?: string;
    helperText?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, label, helperText }) => {
    const { hour: h12, minute: m, ampm: p } = convert24hTo12h(value);

    const [hour, setHour] = useState(h12);
    const [minute, setMinute] = useState(m);
    const [ampm, setAmpm] = useState<'AM' | 'PM'>(p);

    // Dropdown visibility states
    const [openSelector, setOpenSelector] = useState<'hour' | 'minute' | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync internal state when external value changes
    useEffect(() => {
        const parsed = convert24hTo12h(value);
        setHour(parsed.hour);
        setMinute(parsed.minute);
        setAmpm(parsed.ampm);
    }, [value]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpenSelector(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleUpdate = (newH: number, newM: number, newP: 'AM' | 'PM') => {
        // Force inline logic to guarantee 12 PM behavior
        let h24 = newH;
        if (newH === 12) {
            h24 = (newP === 'PM') ? 12 : 0;
        } else {
            if (newP === 'PM') h24 += 12;
        }
        const time24 = `${String(h24).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;

        console.log(`[TimePicker] Update: ${newH}:${newM} ${newP} -> ${time24}`);
        onChange(time24);
    };

    const preview = formatTimeForDisplay(convert12hTo24h(hour, minute, ampm));

    const toggleSelector = (selector: 'hour' | 'minute') => {
        if (openSelector === selector) {
            setOpenSelector(null);
        } else {
            setOpenSelector(selector);
        }
    };

    return (
        <div className="space-y-3" ref={containerRef}>
            {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-rose-100">

                {/* Hour Selector */}
                <div className="relative">
                    <span className="block text-[9px] uppercase font-black text-rose-300 tracking-widest mb-1 text-center">Hora</span>
                    <button
                        type="button"
                        onClick={() => toggleSelector('hour')}
                        className={`w-16 h-14 flex items-center justify-center text-3xl font-elegant font-bold rounded-xl transition-all border ${openSelector === 'hour'
                            ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-inner'
                            : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
                            }`}
                    >
                        {hour}
                    </button>

                    <AnimatePresence>
                        {openSelector === 'hour' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 z-50 grid grid-cols-4 gap-1 transform -translate-x-1/4 sm:translate-x-0"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                                    <button
                                        key={h}
                                        type="button"
                                        onClick={() => {
                                            setHour(h);
                                            handleUpdate(h, minute, ampm);
                                            setOpenSelector(null);
                                        }}
                                        className={`h-10 rounded-lg text-sm font-bold transition-colors ${hour === h
                                            ? 'bg-rose-500 text-white shadow-md'
                                            : 'text-slate-600 hover:bg-rose-50 hover:text-rose-600'
                                            }`}
                                    >
                                        {h}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <span className="text-3xl font-light text-slate-300 pb-5">:</span>

                {/* Minute Selector */}
                <div className="relative">
                    <span className="block text-[9px] uppercase font-black text-rose-300 tracking-widest mb-1 text-center">Minutos</span>
                    <button
                        type="button"
                        onClick={() => toggleSelector('minute')}
                        className={`w-16 h-14 flex items-center justify-center text-3xl font-elegant font-bold rounded-xl transition-all border ${openSelector === 'minute'
                            ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-inner'
                            : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
                            }`}
                    >
                        {String(minute).padStart(2, '0')}
                    </button>

                    <AnimatePresence>
                        {openSelector === 'minute' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-1/2 sm:left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 z-50 grid grid-cols-4 gap-1 transform -translate-x-1/2 sm:translate-x-0"
                            >
                                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => {
                                            setMinute(m);
                                            handleUpdate(hour, m, ampm);
                                            setOpenSelector(null);
                                        }}
                                        className={`h-10 rounded-lg text-sm font-bold transition-colors ${minute === m
                                            ? 'bg-rose-500 text-white shadow-md'
                                            : 'text-slate-600 hover:bg-rose-50 hover:text-rose-600'
                                            }`}
                                    >
                                        {String(m).padStart(2, '0')}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="h-10 w-px bg-slate-200 mx-2 hidden sm:block"></div>

                {/* AM/PM Switch */}
                <div className="flex flex-col">
                    <span className="block text-[9px] uppercase font-black text-rose-300 tracking-widest mb-1 text-center sm:text-left">Periodo</span>
                    <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-fit">
                        {(['AM', 'PM'] as const).map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => {
                                    setAmpm(p);
                                    handleUpdate(hour, minute, p);
                                }}
                                className={`px-4 py-2 rounded-lg text-xs font-black tracking-widest transition-all ${ampm === p
                                    ? 'bg-white text-rose-600 shadow-sm ring-1 ring-rose-100'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preview Badge */}
                <div className="sm:ml-auto flex items-center gap-2 bg-rose-50/50 px-3 py-1.5 rounded-lg border border-rose-100 mt-2 sm:mt-0 w-full sm:w-auto justify-center sm:justify-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                        Verás: {preview}
                    </span>
                </div>
            </div>

            {helperText && <p className="text-[10px] text-slate-400 italic pl-2">{helperText}</p>}
            <p className="text-[8px] text-slate-300 pl-2 font-mono">Valor BD: {value}</p>
        </div>
    );
};
