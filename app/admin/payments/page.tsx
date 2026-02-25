import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DollarSign, Search, ShieldCheck, Zap, Activity } from 'lucide-react'

export default async function AdminPaymentsPage() {
    const supabase = await createClient()

    // Fetch all payments globally, recent first
    const { data: payments, error } = await supabase
        .from('payments')
        .select(`
      id, amount, razorpay_payment_id, status, created_at, platform_commission, creator_earning,
      tournaments:tournament_id (name),
      players:player_id (name, mobile),
      profiles:creator_id (full_name, email)
    `)
        .order('created_at', { ascending: false })
        .limit(500) // Show last 500 for performance

    if (error) {
        return (
            <div className="p-10 rounded-[2rem] border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-widest text-center animate-shake backdrop-blur-md">
                <DollarSign className="w-6 h-6 mx-auto mb-4" />
                FINANCIAL DISCONNECT: SECURE TRANSACTION STREAM OFFLINE
            </div>
        )
    }

    return (
        <div className="space-y-12 animate-fade-in relative z-10 w-full mb-20 text-white selection:bg-purple-500/30">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="relative group">
                    <div className="flex items-center gap-6 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-2xl border border-white/5 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black outfit tracking-tighter uppercase">PLATFORM <span className="text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text italic">LEDGER</span></h1>
                    </div>
                    <p className="text-white/40 font-bold uppercase text-[10px] tracking-[0.3em] bg-white/5 px-4 py-1.5 rounded-full border border-white/5 inline-block italic">
                        REAL-TIME QUANTUM TRANSACTION STREAM
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="relative w-full sm:w-80 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-emerald-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="TRACE BY ID / FREQUENCY..."
                            className="input-cyber pl-14 py-4"
                        />
                    </div>
                </div>
            </div>

            <div className="fluid-glass rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl relative overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1100px]">
                    <thead>
                        <tr className="bg-white/5 text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">
                            <th className="p-8 border-r border-white/5 whitespace-nowrap text-center">SYNC TIMESTAMP</th>
                            <th className="p-8 border-r border-white/5 whitespace-nowrap">COMBATANT</th>
                            <th className="p-8 border-r border-white/5 whitespace-nowrap">MISSION DETS</th>
                            <th className="p-8 border-r border-white/5 whitespace-nowrap text-right">SECURED VOLUME</th>
                            <th className="p-8 border-r border-white/5 whitespace-nowrap text-right">SYSTEM CUT</th>
                            <th className="p-8 border-r border-white/5 whitespace-nowrap">TRANSACTION HASH</th>
                            <th className="p-8 text-center text-selection">AUTH STATUS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 border-b border-white/5">
                        {payments?.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-32">
                                    <div className="flex flex-col items-center justify-center gap-6">
                                        <div className="w-20 h-20 rounded-3xl border border-white/5 flex items-center justify-center bg-white/5 shadow-2xl animate-pulse">
                                            <Activity className="w-10 h-10 text-white/10" />
                                        </div>
                                        <p className="font-bold uppercase tracking-[0.3em] text-[10px] text-white/20 italic">LEDGER EMPTY: NO TRANSACTIONS DETECTED</p>
                                    </div>
                                </td>
                            </tr>
                        ) : payments?.map((p: any) => (
                            <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="p-8 whitespace-nowrap text-center">
                                    <p className="font-black outfit text-xs text-white/70">{formatDate(p.created_at).toUpperCase()}</p>
                                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.1em] mt-1.5">{new Date(p.created_at).toLocaleTimeString().toUpperCase()}</p>
                                </td>
                                <td className="p-8 whitespace-nowrap">
                                    <p className="font-black outfit tracking-tighter text-lg uppercase group-hover:text-white transition-colors">{(p.players as any)?.name}</p>
                                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.1em] mt-1.5 italic">{(p.players as any)?.mobile}</p>
                                </td>
                                <td className="p-8 whitespace-nowrap overflow-hidden max-w-[220px]">
                                    <p className="font-bold text-[10px] text-white/60 truncate bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg inline-block mb-2 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all uppercase tracking-wider">{(p.tournaments as any)?.name}</p>
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.1em] truncate italic">COMMANDED BY {(p.profiles as any)?.full_name?.toUpperCase()}</p>
                                </td>
                                <td className="p-8 whitespace-nowrap text-right">
                                    <span className="font-black outfit text-lg tracking-tighter text-white group-hover:text-emerald-400 transition-colors">
                                        {formatCurrency(p.amount).split('.')[0]}
                                    </span>
                                </td>
                                <td className="p-8 whitespace-nowrap text-right">
                                    <span className="font-black outfit text-lg tracking-tighter text-white/40 group-hover:text-purple-400 transition-colors">
                                        {formatCurrency(p.platform_commission || 0).split('.')[0]}
                                    </span>
                                </td>
                                <td className="p-8 whitespace-nowrap">
                                    <span className="font-mono text-[9px] bg-[#0A0A0F] text-white/30 px-3 py-2 rounded-lg border border-white/5 block truncate max-w-[200px] group-hover:border-white/10 group-hover:text-white/60 transition-colors">
                                        {p.razorpay_payment_id || 'LOCAL_OVERRIDE_FREE'}
                                    </span>
                                </td>
                                <td className="p-8 whitespace-nowrap text-center">
                                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] shadow-lg transition-all duration-500 ${p.status === 'PAID'
                                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-emerald-500/10'
                                        : p.status === 'FREE'
                                            ? 'border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-blue-500/10'
                                            : 'border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-amber-500/10'
                                        }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'PAID' ? 'bg-emerald-400 animate-pulse' : p.status === 'FREE' ? 'bg-blue-400' : 'bg-amber-400 animate-bounce'}`}></div>
                                        {p.status}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
