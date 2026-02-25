import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ShieldAlert, CheckCircle2, MoreVertical, Users, Zap } from 'lucide-react'

export default async function AdminCreatorsPage() {
    const supabase = await createClient()

    // Fetch all creators and their aggregated stats
    const { data: creators, error } = await supabase
        .from('profiles')
        .select(`
      id,
      email,
      full_name,
      role,
      is_suspended,
      created_at,
      tournaments (id),
      players (id),
      payments (amount, platform_commission)
    `)
        .eq('role', 'CREATOR')
        .order('created_at', { ascending: false })

    if (error) {
        return (
            <div className="p-10 rounded-[2rem] border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-widest text-center animate-shake backdrop-blur-md">
                <ShieldAlert className="w-6 h-6 mx-auto mb-4" />
                ENCRYPTION ERROR: FAILED TO RETRIEVE OPERATOR DATA
            </div>
        )
    }

    return (
        <div className="space-y-12 animate-fade-in relative z-10 w-full mb-20 text-white selection:bg-purple-500/30">
            <div className="relative group">
                <div className="flex items-center gap-6 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-2xl border border-white/5 flex items-center justify-center">
                        <Users className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black outfit tracking-tighter uppercase">NETWORK <span className="text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text italic">OPERATORS</span></h1>
                </div>
                <p className="text-white/40 font-bold uppercase text-[10px] tracking-[0.3em] bg-white/5 px-4 py-1.5 rounded-full border border-white/5 inline-block italic">
                    PLATFORM GENERATORS & CORE ORGANIZERS
                </p>
            </div>

            <div className="fluid-glass rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl relative overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-white/5 text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">
                            <th className="p-8 border-r border-white/5 whitespace-nowrap">OPERATOR IDENTITY</th>
                            <th className="p-8 border-r border-white/5 whitespace-nowrap text-center">ARENAS</th>
                            <th className="p-8 border-r border-white/5 whitespace-nowrap text-center">AGENTS</th>
                            <th className="p-8 border-r border-white/5 whitespace-nowrap text-right text-selection">SECURED VOL</th>
                            <th className="p-8 border-r border-white/5 whitespace-nowrap text-right">PLATFORM CUT</th>
                            <th className="p-8 border-r border-white/5 whitespace-nowrap text-center">CLEARANCE</th>
                            <th className="p-8 text-right">HUD</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 border-b border-white/5">
                        {creators?.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-32">
                                    <div className="flex flex-col items-center justify-center gap-6">
                                        <div className="w-20 h-20 rounded-3xl border border-white/5 flex items-center justify-center bg-white/5 shadow-2xl animate-pulse">
                                            <Zap className="w-10 h-10 text-white/10" />
                                        </div>
                                        <p className="font-bold uppercase tracking-[0.3em] text-[10px] text-white/20 italic">NULL POINTER: NO OPERATORS SIGNALING</p>
                                    </div>
                                </td>
                            </tr>
                        ) : creators?.map((creator: any) => {
                            const tourneyCount = creator.tournaments?.length || 0
                            const playerCount = creator.players?.length || 0
                            const revenue = creator.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0
                            const commission = creator.payments?.reduce((sum: number, p: any) => sum + Number(p.platform_commission), 0) || 0

                            return (
                                <tr key={creator.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-8 whitespace-nowrap">
                                        <div className="flex items-center gap-5">
                                            <div className="h-14 w-14 bg-gradient-to-br from-purple-500/20 to-blue-600/20 rounded-2xl border border-white/10 flex items-center justify-center font-black text-xl text-white group-hover:scale-110 group-hover:border-purple-500/30 transition-all duration-500">
                                                {(creator.full_name || 'U')[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-black outfit tracking-tighter text-xl uppercase group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-500">{creator.full_name || 'ANONYMOUS AGENT'}</p>
                                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.1em] mt-1.5 italic">{creator.email}</p>
                                                <p className="text-[8px] font-black bg-white/5 text-white/40 px-2 py-0.5 rounded-full border border-white/5 inline-block mt-2">LINKED {formatDate(creator.created_at).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8 whitespace-nowrap text-center">
                                        <span className="font-black outfit text-2xl tracking-tighter text-white/80 group-hover:text-blue-400 transition-colors">{tourneyCount}</span>
                                    </td>
                                    <td className="p-8 whitespace-nowrap text-center">
                                        <span className="font-black outfit text-2xl tracking-tighter text-white/80 group-hover:text-cyan-400 transition-colors">{playerCount}</span>
                                    </td>
                                    <td className="p-8 whitespace-nowrap text-right">
                                        <span className="font-black outfit text-xl tracking-tighter text-white group-hover:text-emerald-400 transition-colors">
                                            {formatCurrency(revenue).split('.')[0]}
                                        </span>
                                    </td>
                                    <td className="p-8 whitespace-nowrap text-right font-black outfit text-lg tracking-tighter text-white/40 group-hover:text-purple-400 transition-colors">
                                        {formatCurrency(commission).split('.')[0]}
                                    </td>
                                    <td className="p-8 whitespace-nowrap text-center">
                                        {creator.is_suspended ? (
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] font-black text-red-400 uppercase tracking-[0.2em] shadow-lg shadow-red-500/10">
                                                <ShieldAlert className="w-3.5 h-3.5" /> BLOCKED
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/10">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-8 whitespace-nowrap text-right">
                                        <button className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all text-white/40 hover:text-white ml-auto group/ops">
                                            <MoreVertical className="w-5 h-5 group-hover/ops:scale-110 transition-transform" />
                                        </button>
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
