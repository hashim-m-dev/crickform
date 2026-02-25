import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import { CheckCircle, Trophy, Ticket, AlertCircle, Sparkles } from 'lucide-react'

export default async function PaymentSuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ player_id?: string; payment_id?: string }>
}) {
    const resolvedParams = await searchParams;
    const playerId = resolvedParams.player_id
    const paymentId = resolvedParams.payment_id

    if (!playerId) {
        return (
            <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6 text-center text-white">
                <div className="fluid-glass p-12 max-w-md w-full rounded-[3rem] border border-red-500/30 glow-primary animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <AlertCircle className="w-24 h-24 text-red-400" />
                    </div>
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-8 bg-red-500/10 rounded-2xl border border-red-500/20 p-3" />
                    <h1 className="text-3xl font-black outfit tracking-tighter uppercase mb-4">INVALID SESSION</h1>
                    <p className="font-bold uppercase text-[10px] tracking-[0.2em] text-white/30 italic">NO REGISTRATION INTEL DETECTED</p>
                    <Link href="/" className="mt-10 btn-cyber-outline border-red-500/30 text-red-400 py-4 px-8 text-xs font-bold tracking-widest block">
                        RETURN TO BASE
                    </Link>
                </div>
            </div>
        )
    }

    const supabase = createServiceClient()

    const { data: player } = await supabase
        .from('players')
        .select('*, tournaments(name)')
        .eq('id', playerId)
        .single()

    if (!player) {
        return (
            <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6 text-center text-white">
                <div className="fluid-glass p-12 max-w-md w-full rounded-[3rem] border border-white/5 glow-primary animate-fade-in">
                    <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-8 bg-amber-500/10 rounded-2xl border border-amber-500/20 p-3" />
                    <h1 className="text-3xl font-black outfit tracking-tighter uppercase mb-4">DATA NOT FOUND</h1>
                    <p className="font-bold uppercase text-[10px] tracking-[0.2em] text-white/30 italic">COULD NOT LOCATE RECORD IN QUANTUM DATABASE</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6 text-white relative overflow-hidden">
            {/* Background Texture & Swirls */}
            <div className="absolute top-[-20%] right-[-10%] swirl swirl-blue opacity-20 animate-pulse-glow" />
            <div className="absolute bottom-[-20%] left-[-10%] swirl swirl-pink opacity-10 animate-pulse-glow" style={{ animationDelay: '2s' }} />

            <div className="max-w-lg w-full animate-fade-in relative z-10">
                <div className="fluid-glass p-12 md:p-14 rounded-[3.5rem] text-center border border-white/10 glow-primary relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5">
                        <Sparkles className="w-32 h-32 text-purple-400" />
                    </div>

                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-lg shadow-emerald-500/20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black outfit tracking-tighter uppercase leading-none mb-4">DEPLOYMENT <span className="text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text italic">SUCCESSFUL</span></h1>
                    <div className="px-6 py-2.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 inline-flex items-center gap-3 mt-6 mb-12">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">REGISTERED FOR {(player.tournaments as any)?.name?.toUpperCase()}</p>
                    </div>

                    <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-10 mb-12 text-left space-y-6 backdrop-blur-md relative group/ticket overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                            <Ticket className="w-24 h-24 -rotate-12" />
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">COMBATANT IDENTITY</span>
                            <span className="font-black outfit text-2xl uppercase tracking-tighter group-hover/ticket:text-purple-400 transition-colors">{player.name}</span>
                        </div>

                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">COMMS LINK</span>
                            <span className="font-black outfit text-2xl uppercase tracking-tighter group-hover/ticket:text-blue-400 transition-colors">{player.mobile}</span>
                        </div>

                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">SECTOR ASSIGNED</span>
                            <span className="font-black outfit text-2xl uppercase tracking-tighter group-hover/ticket:text-pink-400 transition-colors">{player.category}</span>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">QUANTUM LEDGER</span>
                            <span className="font-mono text-[10px] bg-black text-white/40 px-3 py-1.5 rounded-lg border border-white/5 tracking-widest italic truncate max-w-[180px]">
                                {paymentId?.toUpperCase() || player.payment_id?.toUpperCase() || (player.payment_status === 'FREE' ? 'OFFLINE_ACCESS' : 'SYNCING...')}
                            </span>
                        </div>
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 flex items-center gap-6 text-left relative overflow-hidden group/alert">
                        <div className="absolute top-0 right-0 w-2 h-full bg-blue-500/20"></div>
                        <Ticket className="w-10 h-10 text-blue-400/30 shrink-0 group-hover/alert:scale-110 transition-transform" />
                        <p className="text-[9px] font-bold text-blue-400/60 uppercase tracking-[0.1em] leading-relaxed italic">SECURE THIS INTEL OR RECORD YOUR REFERENCE KEY FOR BASECAMP CHECK-IN AND IDENTITY VERIFICATION.</p>
                    </div>

                    <div className="mt-14">
                        <Link href="/" className="btn-cyber w-full py-5 text-xl group flex items-center justify-center gap-4">
                            RETURN TO CITADEL
                            <Trophy className="w-6 h-6 group-hover:scale-125 transition-transform" />
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    )
}
