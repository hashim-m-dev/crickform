import { createClient } from '@/lib/supabase/server'
import { Trophy, Users, DollarSign, Activity, ActivitySquare, ShieldCheck, Zap } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    // 1. Total Creators
    const { count: creatorsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'CREATOR')

    // 2. Active vs Closed Tournaments
    const { data: tournaments } = await supabase.from('tournaments').select('is_active')
    const totalTournaments = tournaments?.length ?? 0
    const activeTournaments = tournaments?.filter(t => t.is_active).length ?? 0
    const closedTournaments = totalTournaments - activeTournaments

    // 3. Total Players
    const { count: playersCount } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })

    // 4. Revenue (Total vs Platform Commission)
    const { data: payments } = await supabase.from('payments').select('amount, platform_commission').eq('status', 'PAID')

    const totalRevenue = payments?.reduce((acc, p) => acc + Number(p.amount), 0) ?? 0
    const totalCommission = payments?.reduce((acc, p) => acc + Number(p.platform_commission || 0), 0) ?? 0

    const stats = [
        { label: 'NETWORK OPERATORS', value: creatorsCount ?? 0, icon: Users, color: 'from-blue-500 to-cyan-600', glow: 'rgba(59, 130, 246, 0.4)', sub: 'REGISTERED POWER USERS' },
        { label: 'GLOBAL ARENAS', value: totalTournaments, icon: Trophy, color: 'from-purple-500 to-violet-600', glow: 'rgba(139, 92, 246, 0.4)', sub: `${activeTournaments} ACTIVE • ${closedTournaments} TERMINATED` },
        { label: 'AUTHENTICATED AGENTS', value: playersCount ?? 0, icon: ActivitySquare, color: 'from-pink-500 to-rose-600', glow: 'rgba(236, 72, 153, 0.4)', sub: 'TOTAL SYSTEM REGISTRATIONS' },
        { label: 'PLATFORM YIELD', value: formatCurrency(totalCommission).split('.')[0], icon: DollarSign, color: 'from-emerald-500 to-teal-600', glow: 'rgba(16, 185, 129, 0.4)', sub: `GROSS VOL: ${formatCurrency(totalRevenue).split('.')[0]}` },
    ]

    return (
        <div className="space-y-12 animate-fade-in relative z-10 py-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8">
                <div className="relative group">
                    <h1 className="text-4xl md:text-6xl font-black outfit tracking-tighter uppercase leading-none">
                        COMMAND <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent italic">CENTER</span>
                    </h1>
                    <div className="flex items-center gap-3 mt-4">
                        <span className="text-white/40 font-bold uppercase text-[10px] tracking-[0.4em] bg-white/5 px-4 py-1.5 rounded-full border border-white/5 italic">
                            QUANTUM TELEMETRY ACTIVE
                        </span>
                        <div className="flex gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Live</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
                {stats.map((stat, i) => (
                    <div key={i} className="fluid-glass p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 hover:border-white/20 transition-all duration-500 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500" style={{ background: `linear-gradient(135deg, ${stat.glow} 0%, transparent 100%)` }} />
                        <div className="flex flex-col gap-6 md:gap-8 relative z-10 text-selection">
                            <div className={`w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                                <stat.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">{stat.label}</p>
                                <p className="text-4xl md:text-5xl font-black outfit mt-4 tracking-tighter">{stat.value}</p>
                                <p className="text-[10px] font-bold uppercase mt-2.5 tracking-widest text-white/20 italic">{stat.sub}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="fluid-glass p-16 rounded-[3rem] border border-white/5 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 p-12 opacity-5">
                    <Zap className="w-32 h-32 text-blue-400 animate-pulse" />
                </div>
                <div className="absolute bottom-0 right-0 p-12 opacity-5">
                    <ShieldCheck className="w-32 h-32 text-purple-400 animate-pulse" />
                </div>

                <div className="relative z-10 max-w-2xl mx-auto">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-blue-600/20 rounded-3xl border border-white/10 flex items-center justify-center mx-auto mb-10 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                        <Activity className="w-12 h-12 text-blue-400 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <h3 className="text-4xl font-black outfit tracking-tighter uppercase mb-6 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">SYSTEMS ARE OPTIMAL</h3>
                    <p className="text-sm font-bold uppercase tracking-[0.1em] leading-relaxed text-white/40 italic">
                        UTILIZE THE HUD SIDEBAR TO INSPECT OPERATOR PROFILES, MODERATE ACTIVE ARENAS, OR REVIEW SECURE QUANTUM TRANSACTIONS.
                    </p>

                    <div className="mt-12 flex gap-4 justify-center items-center">
                        <div className="h-1.5 w-12 bg-white/5 rounded-full relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-500 animate-ping opacity-20"></div>
                        </div>
                        <div className="h-1.5 w-12 bg-white/5 rounded-full relative overflow-hidden">
                            <div className="absolute inset-0 bg-purple-500 animate-ping opacity-20 delay-150"></div>
                        </div>
                        <div className="h-1.5 w-12 bg-white/5 rounded-full relative overflow-hidden">
                            <div className="absolute inset-0 bg-pink-500 animate-ping opacity-20 delay-300"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
