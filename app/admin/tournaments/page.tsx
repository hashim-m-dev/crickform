import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Trophy, Search, MoreVertical, ExternalLink, CalendarX, Lock, ShieldCheck, Activity } from 'lucide-react'
import Link from 'next/link'

export default async function AdminTournamentsPage() {
    const supabase = await createClient()

    // Fetch all tournaments globally
    const { data: tournaments, error } = await supabase
        .from('tournaments')
        .select(`
      id, slug, name, registration_fee, is_active, last_date, created_at,
      profiles:user_id (full_name, email),
      players (count),
      payments (amount)
    `)
        .order('created_at', { ascending: false })

    if (error) {
        return (
            <div className="p-10 rounded-[2rem] border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-widest text-center animate-shake backdrop-blur-md">
                <Trophy className="w-6 h-6 mx-auto mb-4" />
                LINK ERROR: TELEMETRY FEED OF ARENAS INTERRUPTED
            </div>
        )
    }

    return (
        <div className="space-y-12 animate-fade-in relative z-10 w-full mb-20 text-white selection:bg-purple-500/30">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="relative group">
                    <div className="flex items-center gap-6 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-violet-600/20 rounded-2xl border border-white/5 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-purple-400" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black outfit tracking-tighter uppercase">GLOBAL <span className="text-transparent bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text italic">ARENAS</span></h1>
                    </div>
                    <p className="text-white/40 font-bold uppercase text-[10px] tracking-[0.3em] bg-white/5 px-4 py-1.5 rounded-full border border-white/5 inline-block italic">
                        TOTAL PLATFORM TOURNAMENT INVENTORY
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="relative w-full sm:w-80 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-purple-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="FILTER BY ARENA NAME..."
                            className="input-cyber pl-14 py-4"
                        />
                    </div>
                </div>
            </div>

            <div className="fluid-glass rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl relative overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1100px]">
                    <thead>
                        <tr className="bg-white/5 text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">
                            <th className="p-8 border-r border-white/5 whitespace-nowrap">ARENA INTEL</th>
                            <th className="p-8 border-r border-white/5 whitespace-nowrap">COMMANDER</th>
                            <th className="p-8 border-r border-white/5 whitespace-nowrap text-right">CLEARANCE FEE</th>
                            <th className="p-8 border-r border-white/5 whitespace-nowrap text-center">ARMY MAGNITUDE</th>
                            <th className="p-8 border-r border-white/5 whitespace-nowrap text-right">SECURED VOLUME</th>
                            <th className="p-8 border-r border-white/5 whitespace-nowrap text-center">SYSTEM STATUS</th>
                            <th className="p-8 text-right">HUD</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 border-b border-white/5">
                        {tournaments?.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-32">
                                    <div className="flex flex-col items-center justify-center gap-6">
                                        <div className="w-20 h-20 rounded-3xl border border-white/5 flex items-center justify-center bg-white/5 shadow-2xl animate-pulse">
                                            <Activity className="w-10 h-10 text-white/10" />
                                        </div>
                                        <p className="font-bold uppercase tracking-[0.3em] text-[10px] text-white/20 italic">VOID DETECTED: NO ARENAS CONSTRUCTED</p>
                                    </div>
                                </td>
                            </tr>
                        ) : tournaments?.map((t: any) => {
                            const playerCount = t.players?.[0]?.count || 0
                            const revenue = t.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0
                            const isExpired = new Date(t.last_date) < new Date(new Date().setHours(0, 0, 0, 0))

                            return (
                                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-8 whitespace-nowrap">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-blue-600/20 rounded-2xl border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:border-purple-500/30 transition-all duration-500">
                                                <Trophy className="w-7 h-7 text-white/40 group-hover:text-purple-400 transition-colors" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-black outfit uppercase tracking-tighter text-xl truncate max-w-[240px] group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-500" title={t.name}>{t.name}</p>
                                                <p className="text-[8px] font-black bg-white/5 text-white/30 px-2 py-0.5 rounded-full border border-white/5 inline-block mt-2 uppercase tracking-widest leading-none">
                                                    DEADLINE: {formatDate(t.last_date).toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8 whitespace-nowrap">
                                        <p className="font-black outfit text-base uppercase group-hover:text-white transition-colors">{t.profiles?.full_name || 'ANONYMOUS'}</p>
                                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.1em] mt-1 italic">{t.profiles?.email}</p>
                                    </td>
                                    <td className="p-8 whitespace-nowrap text-right">
                                        <span className="font-black outfit text-lg tracking-tighter text-white/60 group-hover:text-purple-400 transition-colors">
                                            {formatCurrency(t.registration_fee).split('.')[0]}
                                        </span>
                                    </td>
                                    <td className="p-8 whitespace-nowrap text-center">
                                        <span className="font-black outfit text-2xl tracking-tighter text-white/80 group-hover:text-blue-400 transition-colors">
                                            {playerCount}
                                        </span>
                                    </td>
                                    <td className="p-8 whitespace-nowrap text-right">
                                        <span className="font-black outfit text-xl tracking-tighter text-white group-hover:text-emerald-400 transition-colors">
                                            {formatCurrency(revenue).split('.')[0]}
                                        </span>
                                    </td>
                                    <td className="p-8 whitespace-nowrap text-center">
                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] shadow-lg transition-all duration-500 ${!t.is_active
                                            ? 'border-red-500/30 bg-red-500/10 text-red-400 shadow-red-500/10'
                                            : isExpired
                                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-amber-500/10'
                                                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-emerald-500/10'
                                            }`}>
                                            {!t.is_active ? <Lock className="w-3 h-3" /> : isExpired ? <CalendarX className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                                            {!t.is_active ? 'CLOSED' : isExpired ? 'TERMINATED' : 'ACTIVE'}
                                        </div>
                                    </td>
                                    <td className="p-8 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <a href={`/register/${t.slug}`} className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-500/30 transition-all text-white/20" title="VIEW FREQUENCY" target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <Link href={`/dashboard/tournament/${t.id}`} className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-purple-500/20 hover:text-purple-400 hover:border-purple-500/30 transition-all text-white/20" title="HUD OVERRIDE">
                                                <MoreVertical className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
