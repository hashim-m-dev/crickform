import Link from 'next/link'
import { Trophy, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { UserProfile } from '@/lib/auth'

interface NavbarProps {
    profile: UserProfile
}

export default async function DashboardNavbar({ profile }: NavbarProps) {
    const supabase = await createClient()

    return (
        <nav className="border-b border-white/5 sticky top-0 z-50 backdrop-blur-xl bg-[#0A0A0F]/50">
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href={profile.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard'} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center glow-primary group-hover:scale-110 transition-transform">
                            <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-2xl tracking-tighter outfit uppercase">
                            CRICK<span className="text-purple-500">FORM</span>
                        </span>
                    </Link>

                    {/* Nav Links (Desktop Only, Minimalist) */}
                    <div className="hidden lg:flex items-center gap-6">
                        {profile.role === 'SUPER_ADMIN' ? (
                            <div className="flex items-center gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                                <Link href="/admin" className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 transition-all">Overview</Link>
                                <Link href="/admin/creators" className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 transition-all">Creators</Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                                <Link href="/dashboard" className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 transition-all">Dashboard</Link>
                                <Link href="/create-tournament" className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 transition-all text-purple-400">Deploy New</Link>
                            </div>
                        )}
                    </div>

                    {/* User menu */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-2xl border border-white/5 backdrop-blur-md">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center font-bold text-xs shadow-lg">
                                {profile.email?.[0]?.toUpperCase() ?? 'U'}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-[10px] font-black uppercase leading-none tracking-tight">{profile.full_name || profile.email.split('@')[0]}</p>
                                <p className="text-[8px] font-bold text-white/30 mt-1 uppercase tracking-widest">{profile.role === 'SUPER_ADMIN' ? 'SUPER COMMANDER' : 'MISSION CREATOR'}</p>
                            </div>
                        </div>

                        <form action="/auth/signout" method="post">
                            <button type="submit" className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all border border-white/5 hover:border-red-500/30 group">
                                <LogOut className="w-4 h-4 transition-transform group-hover:scale-110" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </nav>
    )
}
