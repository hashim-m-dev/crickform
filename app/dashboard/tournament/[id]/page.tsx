import { getAuthUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Calendar, Users, DollarSign, CheckCircle, Clock, ShieldCheck, Trophy, Zap } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import PlayerTableClient from './PlayerTableClient'

export default async function TournamentDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const { user, profile } = await getAuthUser()
    const supabase = await createClient()

    // Fetch tournament
    const { data: tournament } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', params.id)
        .single()

    // Security check: must be owner or super admin
    if (!tournament || (tournament.user_id !== user.id && profile.role !== 'SUPER_ADMIN')) {
        notFound()
    }

    // Fetch players
    const { data: players } = await supabase
        .from('players')
        .select('*')
        .eq('tournament_id', tournament.id)
        .order('created_at', { ascending: false })

    // Aggregates
    const totalPlayers = players?.length ?? 0
    const paidPlayers = players?.filter(p => p.payment_status === 'PAID' || p.payment_status === 'FREE').length ?? 0
    const pendingPlayers = totalPlayers - paidPlayers

    // Calculate revenue from PAID payments
    const revenue = tournament.registration_fee * paidPlayers

    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/register/${tournament.slug}`

    const stats = [
        { label: 'Total Combatants', value: totalPlayers, icon: Users, color: 'from-blue-500 to-cyan-600', glow: 'rgba(59, 130, 246, 0.3)' },
        { label: 'Authorized entries', value: paidPlayers, icon: CheckCircle, color: 'from-emerald-500 to-teal-600', glow: 'rgba(16, 185, 129, 0.3)' },
        { label: 'Pending Sync', value: pendingPlayers, icon: Clock, color: 'from-amber-500 to-orange-600', glow: 'rgba(245, 158, 11, 0.3)' },
        { label: 'Gross Yield', value: formatCurrency(revenue).split('.')[0], icon: DollarSign, color: 'from-pink-500 to-rose-600', glow: 'rgba(236, 72, 153, 0.3)' },
    ]

    return (
        <div className="space-y-12 animate-fade-in max-w-7xl mx-auto py-12 px-6 text-white text-selection">
            <Link href="/dashboard" className="btn-cyber-outline py-2.5 px-6 text-[10px] font-bold tracking-widest flex items-center gap-3 w-fit">
                <ArrowLeft className="w-4 h-4" /> RECALL DASHBOARD
            </Link>

            {/* Page Header Card */}
            <div className="fluid-glass p-8 md:p-14 rounded-[3.5rem] border border-white/10 glow-primary relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                    <Trophy className="w-48 h-48 text-purple-400" />
                </div>

                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12 md:gap-16 relative z-10">
                    <div className="space-y-8 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-4">
                            {tournament.is_active && (
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
                                    SYSTEM ONLINE
                                </span>
                            )}
                            {tournament.season && (
                                <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
                                    MISSION CYCLE: <span className="text-white ml-1">SEASON {tournament.season}</span>
                                </span>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black outfit tracking-tighter leading-[1.1] uppercase break-words">
                            {tournament.name}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 md:gap-10">
                            <div className="flex items-center gap-4 group/item">
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/item:bg-purple-500/20 transition-colors">
                                    <Calendar className="w-6 h-6 text-white/40 group-hover/item:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">TERMINATION DATE</p>
                                    <p className="text-sm md:text-md font-black outfit uppercase tracking-wider">{formatDate(tournament.last_date).toUpperCase()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group/item">
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/item:bg-blue-500/20 transition-colors">
                                    <DollarSign className="w-6 h-6 text-white/40 group-hover/item:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">CLEARANCE FEE</p>
                                    <p className="text-sm md:text-md font-black outfit uppercase tracking-wider">
                                        {tournament.registration_fee > 0 ? formatCurrency(tournament.registration_fee) : 'FREE ACCESS'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Registration Link Area */}
                    <div className="shrink-0 w-full xl:w-96">
                        <div className="fluid-glass p-10 rounded-[2.5rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl relative group/portal overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <ShieldCheck className="w-16 h-16 text-blue-400" />
                            </div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60">LIVE ACCESS PORTAL</h3>
                            </div>
                            <div className="relative mb-6">
                                <input
                                    type="text"
                                    readOnly
                                    value={publicUrl} // Changed from registrationUrl to publicUrl
                                    className="w-full bg-[#050508] border border-white/10 rounded-2xl p-5 pr-14 text-[12px] font-mono text-white/50 focus:outline-none focus:border-purple-500/50 transition-colors"
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(publicUrl) // Changed from registrationUrl to publicUrl
                                        // TODO: Toast notification
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:text-purple-400 transition-colors"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 text-center italic">
                                BROADCAST THIS FREQUENCY TO PLAYERS
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-10">
                {[
                    { label: 'TOTAL COMBATANTS', value: players?.length ?? 0, icon: Users, color: 'from-blue-500 to-cyan-600', glow: 'rgba(59, 130, 246, 0.4)' },
                    { label: 'AUTHORIZED ENTRIES', value: players?.filter(p => p.payments && (p.payments as any).status === 'PAID').length ?? 0, icon: ShieldCheck, color: 'from-emerald-500 to-teal-600', glow: 'rgba(16, 185, 129, 0.4)' },
                    { label: 'PENDING SYNC', value: players?.filter(p => !p.payments || (p.payments as any).status !== 'PAID').length ?? 0, icon: Clock, color: 'from-amber-500 to-orange-600', glow: 'rgba(245, 158, 11, 0.4)' },
                    { label: 'GROSS YIELD', value: formatCurrency(players?.reduce((sum, p) => sum + (p.payments ? Number((p.payments as any).amount) : 0), 0) ?? 0).split('.')[0], icon: DollarSign, color: 'from-pink-500 to-rose-600', glow: 'rgba(236, 72, 153, 0.4)' },
                ].map((stat, i) => (
                    <div key={i} className="fluid-glass p-8 md:p-10 rounded-[2.5rem] border border-white/10 hover:border-white/20 transition-all duration-500 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500" style={{ background: `linear-gradient(135deg, ${stat.glow} 0%, transparent 100%)` }} />
                        <div className="flex flex-col gap-8 relative z-10 text-selection">
                            <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                <stat.icon className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30">{stat.label}</p>
                                <p className="text-3xl md:text-5xl font-black outfit mt-4 tracking-tighter transition-all duration-500 group-hover:scale-105 origin-left">
                                    {stat.value}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Players Table Section */}
            <div className="space-y-8">
                <div className="flex items-center gap-4 px-4">
                    <h2 className="text-xl font-black outfit tracking-widest flex items-center gap-4 text-white/80 uppercase">
                        <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
                        COMBATANT ROSTER
                    </h2>
                </div>
                <div className="fluid-glass rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
                    <PlayerTableClient players={players || []} tournamentId={params.id} />
                </div>
            </div>

        </div>
    )
}
