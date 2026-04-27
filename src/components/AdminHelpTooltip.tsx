import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminHelpTooltipProps {
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export function AdminHelpTooltip({ content, position = 'top' }: AdminHelpTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowClasses = {
        top: 'bottom-[-6px] left-1/2 -translate-x-1/2 border-t-slate-800',
        bottom: 'top-[-6px] left-1/2 -translate-x-1/2 border-b-slate-800',
        left: 'right-[-6px] top-1/2 -translate-y-1/2 border-l-slate-800',
        right: 'left-[-6px] top-1/2 -translate-y-1/2 border-r-slate-800',
    };

    return (
        <div className="relative inline-block ml-1.5 group">
            <button
                type="button"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onClick={() => setIsVisible(!isVisible)}
                className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-bold hover:bg-slate-200 hover:text-slate-600 transition-colors focus:outline-none ring-1 ring-slate-200"
            >
                ?
            </button>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: position === 'top' ? 10 : -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`absolute z-[100] w-48 sm:w-64 p-3 bg-slate-800 text-white text-[11px] leading-relaxed rounded-xl shadow-2xl pointer-events-none ${positionClasses[position]}`}
                    >
                        <div className={`absolute w-0 h-0 border-[6px] border-transparent ${arrowClasses[position]}`} />
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
