import { motion } from 'framer-motion';
import { PLAN_LIMITS } from '../../lib/plan-limits';

interface AdminStatsProps {
    totalRsvps: number;
    totalGuests: number;
    totalNotAttending: number;
    totalMessages: number;
    client?: any;
}

export function AdminStats({ totalRsvps, totalGuests, totalNotAttending, totalMessages, client }: AdminStatsProps) {
    const stats = [
        {
            label: 'Confirmaciones',
            value: totalRsvps,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'from-blue-500 to-blue-600',
            bg: 'bg-blue-50',
            text: 'text-blue-700'
        },
        {
            label: 'Invitados',
            value: totalGuests,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            color: 'from-emerald-500 to-emerald-600',
            bg: 'bg-emerald-50',
            text: 'text-emerald-700'
        },
        {
            label: 'Mensajes',
            value: totalMessages,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            ),
            color: 'from-violet-500 to-violet-600',
            bg: 'bg-violet-50',
            text: 'text-violet-700'
        },
        {
            label: 'Inasistentes',
            value: totalNotAttending,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'from-rose-500 to-rose-600',
            bg: 'bg-rose-50',
            text: 'text-rose-700'
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
            {stats.map((stat, idx) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.4 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className={`${stat.bg} rounded-lg sm:rounded-2xl p-3 sm:p-6 border border-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] group cursor-default`}
                >
                    <div className="flex items-start justify-between mb-2 sm:mb-4">
                        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                            <svg className="w-4 sm:w-6 h-4 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{stat.icon.props.children}</svg>
                        </div>
                        <div className={`text-[9px] sm:text-xs font-medium ${stat.text} px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/50 whitespace-nowrap`}>
                            Hoy
                        </div>
                    </div>

                    <div>
                        <p className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-1">{stat.value}</p>
                        <p className={`text-xs sm:text-sm font-medium ${stat.text} truncate`}>{stat.label}</p>
                    </div>

                    <div className="mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-white/50 hidden sm:block">
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${(() => {
                                            if (!client) return Math.min(stat.value * 10, 100);
                                            const plan = (client.planType || 'basic') as 'basic' | 'premium' | 'deluxe';
                                            const limit = stat.label === 'Invitados' ? PLAN_LIMITS[plan].guests :
                                                stat.label === 'Mensajes' ? PLAN_LIMITS[plan].messages :
                                                    PLAN_LIMITS[plan].rsvps;
                                            return limit === Infinity ? 0 : Math.min((stat.value / limit) * 100, 100);
                                        })()}%`
                                    }}
                                    transition={{ delay: idx * 0.1 + 0.3, duration: 0.8 }}
                                    className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                                />
                            </div>
                            <span className={`text-xs font-medium ${stat.text}`}>
                                {(() => {
                                    if (!client) return `${Math.min(stat.value * 10, 100)}%`;
                                    const plan = (client.planType || 'basic') as 'basic' | 'premium' | 'deluxe';
                                    const limit = stat.label === 'Invitados' ? PLAN_LIMITS[plan].guests :
                                        stat.label === 'Mensajes' ? PLAN_LIMITS[plan].messages :
                                            PLAN_LIMITS[plan].rsvps;
                                    return limit === Infinity ? '∞' : `${Math.floor(Math.min((stat.value / limit) * 100, 100))}%`;
                                })()}
                            </span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}