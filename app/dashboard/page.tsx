import { getAuthUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Trophy, Users, DollarSign, Activity, PlusCircle, ChevronRight, Sparkles } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function DashboardPage() {
    const { user, profile } = await getAuthUser()
    const supabase = await createClient()

    // Fetch tournaments for this creator
    const { data: tournaments } = await supabase
        .from('tournaments')
        .select('*, players(count)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // Aggregate stats
    const totalTournaments = tournaments?.length ?? 0
    const activeTournaments = tournaments?.filter(t => t.is_active).length ?? 0

    // Fetch payment stats
    const { data: paymentStats } = await supabase
        .from('payments')
        .select('amount, status')
        .eq('creator_id', user.id)
        .eq('status', 'PAID')

    const totalRevenue = paymentStats?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0

    // Fetch total players
    const { count: totalPlayers } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id)

    const statCards = [
        {
            label: 'Events Deployed',
            value: totalTournaments,
            icon: Trophy,
            color: 'from-purple-500 to-violet-600',
            glow: 'rgba(139, 92, 246, 0.5)',
            sub: `${activeTournaments} ACTIVE NOW`,
        },
        {
            label: 'Total Combatants',
            value: totalPlayers ?? 0,
            icon: Users,
            color: 'from-blue-500 to-cyan-600',
            glow: 'rgba(59, 130, 246, 0.5)',
            sub: 'ACROSS ALL ARENAS',
        },
        {
            label: 'Force Revenue',
            value: formatCurrency(totalRevenue).split('.')[0],
            icon: DollarSign,
            color: 'from-pink-500 to-rose-600',
            glow: 'rgba(236, 72, 153, 0.5)',
            sub: 'SECURED CREDITS',
        },
        {
            label: 'Sync Status',
            value: 'LIVE',
            icon: Activity,
            color: 'from-emerald-500 to-teal-600',
            glow: 'rgba(16, 185, 129, 0.5)',
            sub: 'SYSTEMS OPTIMAL',
        },
    ]

    return (
        <div className="space-y-12 animate-fade-in max-w-7xl mx-auto py-12 px-6">
            {/* Page Header */}
            <div className="fluid-glass p-10 rounded-[3rem] border border-white/5 glow-primary flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles className="w-24 h-24 text-purple-400" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-6xl font-black outfit tracking-tighter leading-none mb-4">
                        COMMANDER <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent px-2">{profile.full_name?.split(' ')[0] || 'GUEST'}</span>
                    </h1>
                    <p className="text-white/40 font-bold uppercase text-[10px] tracking-[0.3em] bg-white/5 inline-block px-4 py-1.5 rounded-full border border-white/5 italic">
                        ORCHESTRATING THE CRICKET GRID
                    </p>
                </div>
                <Link href="/create-tournament" className="btn-cyber py-5 px-10 text-lg group flex items-center gap-3 relative z-10">
                    <PlusCircle className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                    Deploy New Arena
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
                {statCards.map((card, i) => (
                    <div key={i} className="fluid-glass p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 hover:border-white/20 transition-all duration-500 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500" style={{ background: `linear-gradient(135deg, ${card.glow} 0%, transparent 100%)` }} />
                        <div className="flex flex-col gap-6 md:gap-8 relative z-10">
                            <div className={`w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500`}>
                                <card.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">{card.label}</p>
                                <p className="text-4xl md:text-5xl font-black outfit mt-4 tracking-tighter">{card.value}</p>
                                <p className="text-[10px] font-bold uppercase mt-2.5 tracking-widest text-white/20 italic">{card.sub}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tournaments List */}
            <div className="space-y-8">
                <div className="flex items-center justify-between px-4">
                    <h2 className="text-xl font-black outfit tracking-widest flex items-center gap-4 text-white/80">
                        <div className="w-1.5 h-8 bg-purple-500 rounded-full"></div>
                        DEPLOYED ARENAS
                    </h2>
                    <div className="bg-white/5 backdrop-blur-md rounded-full px-5 py-2 border border-white/5 text-[10px] font-bold tracking-[0.2em] text-white/40">
                        TOTAL MANIFEST: {totalTournaments}
                    </div>
                </div>

                {totalTournaments === 0 ? (
                    <div className="fluid-glass p-20 text-center rounded-[3rem] border border-white/5 border-dashed">
                        <Trophy className="w-20 h-20 text-white/5 mx-auto mb-8" />
                        <h3 className="text-3xl font-black outfit tracking-tighter mb-4 uppercase">EMPTY GRID</h3>
                        <p className="text-sm font-bold uppercase tracking-[0.1em] mb-10 max-w-sm mx-auto text-white/30 leading-relaxed italic">
                            Build your engine. Start accepting registrations in quantum speed.
                        </p>
                        <Link href="/create-tournament" className="btn-cyber py-4 px-10 text-xs font-bold tracking-widest inline-flex items-center gap-3">
                            <PlusCircle className="w-5 h-5" />
                            LAUNCH INITIAL MISSION
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {tournaments?.map((tournament, idx) => {
                            const playerCount = (tournament.players as any)?.[0]?.count ?? 0
                            const isExpired = new Date(tournament.last_date) < new Date()

                            return (
                                <Link
                                    key={tournament.id}
                                    href={`/dashboard/tournament/${tournament.id}`}
                                    className="fluid-glass p-8 rounded-[2.5rem] border border-white/5 hover:border-purple-500/30 transition-all duration-500 group animate-fade-in"
                                    style={{ animationDelay: `${idx * 0.1}s` }}
                                >
                                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                                        <div className="flex items-center gap-5 md:gap-6 min-w-0">
                                            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-2xl md:rounded-[1.5rem] border border-white/5 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-all duration-500 shrink-0">
                                                <Trophy className="w-8 h-8 md:w-10 md:h-10 text-white/20 group-hover:text-purple-400 group-hover:scale-110 transition-all duration-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-black text-xl md:text-3xl outfit tracking-tighter truncate group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-500 uppercase">{tournament.name}</h3>
                                                <div className="flex flex-wrap gap-3 md:gap-4 mt-2 md:mt-3">
                                                    <span className="bg-white/5 backdrop-blur-md px-2.5 md:px-3 py-1 rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-white/30 border border-white/5">
                                                        CLOSING: {formatDate(tournament.last_date).toUpperCase()}
                                                    </span>
                                                    <span className="bg-white/5 backdrop-blur-md px-2.5 md:px-3 py-1 rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-white/30 border border-white/5">
                                                        {playerCount} COMBATANTS
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between xl:justify-end gap-6 md:gap-10 pt-6 md:pt-0 border-t xl:border-0 border-white/5">
                                            <div className="text-left xl:text-right">
                                                <p className="text-2xl md:text-3xl font-black outfit tracking-tighter text-white/90">
                                                    {tournament.registration_fee > 0 ? formatCurrency(tournament.registration_fee).split('.')[0] : 'FREE'}
                                                </p>
                                                <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest mt-1.5 md:mt-2 text-white/20 italic">REG FEE</p>
                                            </div>

                                            <div className="flex items-center gap-4 md:gap-6">
                                                <div className={`px-4 md:px-5 py-1.5 md:py-2 rounded-full border font-bold uppercase text-[8px] md:text-[9px] tracking-widest transition-all duration-500 ${!tournament.is_active ? 'border-red-500/30 bg-red-500/10 text-red-400' :
                                                    isExpired ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                                    }`}>
                                                    {!tournament.is_active ? 'OFFLINE' : isExpired ? 'TERMINATED' : 'ACTIVE'}
                                                </div>
                                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all duration-500 group-hover:translate-x-1 transform group-hover:rotate-12 shrink-0">
                                                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
