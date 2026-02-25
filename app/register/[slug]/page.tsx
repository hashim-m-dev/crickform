import { createServiceClient } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate, isRegistrationOpen } from '@/lib/utils'
import { Calendar, DollarSign, Trophy, XCircle, Clock, ShieldCheck, Zap } from 'lucide-react'
import RegistrationForm from '@/components/RegistrationForm'
import Link from 'next/link'

export default async function PublicRegistrationPage(
    props: { params: Promise<{ slug: string }> }
) {
    const params = await props.params;
    const slug = params.slug

    const supabase = createServiceClient()

    const { data: tournament } = await supabase
        .from('tournaments')
        .select('*, profiles:user_id(full_name)')
        .eq('slug', slug)
        .single()

    if (!tournament) {
        notFound()
    }

    const isOpen = isRegistrationOpen(tournament.last_date, tournament.is_active)
    const isExpired = new Date(tournament.last_date) < new Date(new Date().setHours(0, 0, 0, 0))

    return (
        <div className="min-h-screen bg-[#0A0A0F] pb-32 text-white selection:bg-purple-500/30">
            {/* Dynamic Background Swirls */}
            <div className="absolute top-0 right-0 swirl swirl-blue opacity-10 animate-pulse-glow pointer-events-none" />
            <div className="absolute top-[20%] left-[-10%] swirl swirl-pink opacity-5 animate-pulse-glow pointer-events-none" style={{ animationDelay: '3s' }} />

            {/* Cyber Banner */}
            <div className="h-[400px] md:h-[500px] w-full relative border-b border-white/5 overflow-hidden group">
                {tournament.banner_url ? (
                    <img
                        src={tournament.banner_url}
                        alt={tournament.name}
                        className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-blue-600/10">
                        <Trophy className="w-64 h-64 text-white/5" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/20 to-transparent" />

                {/* Banner Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-8 md:p-16 backdrop-blur-[2px]">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-wrap items-center gap-4 mb-8 translate-y-4 animate-fade-in">
                            <div className={`px-5 py-1.5 rounded-full border text-[9px] font-black tracking-[0.2em] shadow-lg transition-all duration-500 ${isOpen ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>
                                {isOpen ? 'SYSTEMS ONLINE: REGISTRATION ACTIVE' : 'SYSTEMS OFFLINE: STADIUM SEALED'}
                            </div>
                            {tournament.season && (
                                <div className="px-5 py-1.5 bg-white/5 border border-white/5 backdrop-blur-md rounded-full text-[9px] font-black text-purple-400 tracking-[0.2em]">
                                    CYCLE: {tournament.season.toUpperCase()}
                                </div>
                            )}
                        </div>
                        <h1 className="text-6xl md:text-[90px] font-black outfit tracking-[1px] uppercase leading-[0.9] drop-shadow-2xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            {tournament.name}
                        </h1>
                        <div className="flex items-center gap-4 mt-8 translate-y-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                            <p className="text-white/40 font-bold uppercase text-[10px] tracking-[0.3em] italic">
                                ORCHESTRATED BY: <span className="text-white">{(tournament.profiles as any)?.full_name?.toUpperCase() || 'ANONYMOUS COMMANDER'}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 sm:px-8 -mt-16 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left Column: Intelligence (4Cols) */}
                <div className="lg:col-span-4 space-y-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="fluid-glass p-10 rounded-[3rem] border border-white/5 glow-primary sticky top-28">
                        <div className="flex items-center gap-5 mb-10 border-b border-white/5 pb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-black outfit tracking-tighter uppercase">MISSION INTEL</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-5 p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-emerald-500/20 transition-all duration-500 group">
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <DollarSign className="w-6 h-6 text-emerald-400/50" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">CLEARANCE FEE</p>
                                    <p className="text-2xl font-black outfit tracking-tighter text-emerald-400">
                                        {tournament.registration_fee === 0 ? 'FREE ACCESS' : formatCurrency(tournament.registration_fee).toUpperCase()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5 p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-purple-500/20 transition-all duration-500 group">
                                <div className="w-12 h-12 bg-purple-500/10 rounded-xl border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Calendar className="w-6 h-6 text-purple-400/50" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">TERMINATION DATE</p>
                                    <p className="text-2xl font-black outfit tracking-tighter text-purple-400">
                                        {formatDate(tournament.last_date).toUpperCase()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {tournament.description && (
                            <div className="mt-12 pt-10 border-t border-white/5">
                                <div className="flex items-center gap-4 mb-6 text-white/30">
                                    <ShieldCheck className="w-4 h-4" />
                                    <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] italic">RULES & MANIFESTO</h4>
                                </div>
                                <div className="text-[11px] font-bold uppercase leading-relaxed bg-[#0A0A0F]/50 border border-white/5 rounded-[1.5rem] p-8 text-white/50 whitespace-pre-wrap italic backdrop-blur-xl">
                                    {tournament.description}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Deployment Form (8Cols) */}
                <div className="lg:col-span-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    {!isOpen ? (
                        <div className="fluid-glass p-16 md:p-24 text-center flex flex-col items-center justify-center min-h-[550px] rounded-[4rem] border border-white/5 border-dashed relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-16 opacity-5">
                                <Clock className="w-48 h-48 text-red-400" />
                            </div>
                            <div className="w-24 h-24 bg-red-400/10 border border-red-400/20 text-red-400 rounded-[2rem] flex items-center justify-center mb-10 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                                {isExpired ? <Clock className="w-12 h-12 animate-pulse" /> : <XCircle className="w-12 h-12" />}
                            </div>
                            <h2 className="text-5xl font-black outfit tracking-tighter uppercase mb-6 leading-none">
                                {isExpired ? 'DEADLINE BREACHED' : 'ARENA SEALED'}
                            </h2>
                            <div className="px-6 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-12">
                                {isExpired
                                    ? `CLOSED ON ${formatDate(tournament.last_date).toUpperCase()}`
                                    : "OFFLINE BY COMMANDER PROTOCOL"}
                            </div>
                            <Link href="/" className="btn-cyber py-5 px-10 text-xs font-bold tracking-widest">
                                RETURN TO CITADEL
                            </Link>
                        </div>
                    ) : (
                        <div className="fluid-glass p-10 md:p-16 rounded-[4rem] border border-white/10 glow-primary relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                <Zap className="w-48 h-48 text-blue-400" />
                            </div>
                            <div className="mb-14 border-b border-white/5 pb-10">
                                <h2 className="text-4xl md:text-5xl font-black outfit tracking-tighter uppercase mb-4 leading-none">FIELD <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent italic">REGISTRATION</span></h2>
                                <p className="text-white/30 font-bold uppercase text-[9px] tracking-[0.3em] italic bg-white/5 inline-block px-4 py-1.5 rounded-full border border-white/5 shadow-inner">
                                    QUANTUM UPLOAD: ALL FIELDS MARKED * ARE MISSION-CRITICAL
                                </p>
                            </div>

                            <div className="relative z-10">
                                <RegistrationForm
                                    tournamentId={tournament.id}
                                    creatorId={tournament.user_id}
                                    fee={tournament.registration_fee}
                                />
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
