import { motion, AnimatePresence } from 'framer-motion';

interface AdminHeaderProps {
    clientName: string;
    planType: string;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
    logout: () => void;
    onUpgradeClick: () => void;
}

export function AdminHeader({ clientName, planType, mobileMenuOpen, setMobileMenuOpen, logout, onUpgradeClick }: AdminHeaderProps) {
    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="bg-white/95 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50 shadow-[0_1px_20px_rgba(0,0,0,0.03)]"
        >
            <div className="w-full px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.div
                            whileHover={{ rotate: -5, scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/10 border border-slate-900/10"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </motion.div>
                        <div className="min-w-0">
                            <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
                                {window.innerWidth < 640 ? 'Admin' : 'Panel de Control'}
                            </h1>
                            <p className="text-[10px] text-slate-400 font-medium tracking-[0.2em] mt-0.5">
                                EDICIÓN PREMIUM
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:block text-right mr-4">
                            <p className="font-medium text-slate-700 text-sm">{clientName}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                                    Plan {planType || 'Personalizado'}
                                </p>
                            </div>
                            {planType !== 'deluxe' && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onUpgradeClick}
                                    className="mt-2 text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md hover:bg-rose-100 transition-colors uppercase tracking-wider"
                                >
                                    Mejorar Plan
                                </motion.button>
                            )}
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-1">
                        <div className="w-px h-6 bg-slate-200"></div>
                        <motion.button
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors group"
                        >
                            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="text-sm font-medium">Salir</span>
                        </motion.button>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </motion.button>
                </div>
            </div>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden mt-4 pt-4 border-t border-slate-100"
                    >
                        <div className="bg-slate-50/80 backdrop-blur-sm rounded-2xl p-4 space-y-4 border border-slate-200/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-slate-900">{clientName}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        Plan {planType || 'Personalizado'}
                                    </div>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-sm font-medium">
                                    {clientName.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 hover:text-slate-900 hover:border-slate-300 transition-colors font-medium"
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    logout();
                                }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Cerrar sesión
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}