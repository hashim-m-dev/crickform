import { requireSuperAdmin } from '@/lib/auth'
import DashboardNavbar from '@/components/DashboardNavbar'
import Link from 'next/link'
import { LayoutDashboard, Users, Trophy, DollarSign, MessageSquare } from 'lucide-react'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { profile } = await requireSuperAdmin()

    const navItems = [
        { href: '/admin', label: 'OVERVIEW', icon: LayoutDashboard, glowClass: 'hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:text-purple-400' },
        { href: '/admin/creators', label: 'CREATORS', icon: Users, glowClass: 'hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:text-blue-400' },
        { href: '/admin/tournaments', label: 'TOURNAMENTS', icon: Trophy, glowClass: 'hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] hover:text-pink-400' },
        { href: '/admin/payments', label: 'PAYMENTS', icon: DollarSign, glowClass: 'hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:text-cyan-400' },
        { href: '/admin/support', label: 'SUPPORT', icon: MessageSquare, glowClass: 'hover:border-violet-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:text-violet-400' },
    ]

    return (
        <div className="min-h-screen flex flex-col bg-[#0A0A0F] text-white overflow-x-hidden">
            {/* Background Texture */}
            <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <DashboardNavbar profile={profile} />

            <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 sm:px-8 py-12 flex flex-col md:flex-row gap-12">

                {/* Cyber Sidebar */}
                <aside className="w-full md:w-72 shrink-0">
                    <div className="fluid-glass p-8 rounded-[2.5rem] border border-white/5 sticky top-28 glow-primary">
                        <div className="mb-10 border-b border-white/5 pb-6">
                            <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] italic outline-none">CENTRAL COMMAND</h2>
                            <p className="text-xl font-black outfit tracking-tighter mt-1 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">SUPER ADMIN</p>
                        </div>

                        <nav className="space-y-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl border border-white/5 bg-white/0 font-bold uppercase text-[10px] tracking-[0.15em] transition-all duration-300 group ${item.glowClass}`}
                                >
                                    <item.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                                    <span className="group-hover:translate-x-1 transition-transform">{item.label}</span>
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-12 pt-8 border-t border-white/5">
                            <div className="bg-white/5 rounded-xl py-3 px-4 border border-white/5">
                                <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/20 text-center italic">
                                    QUANTUM ENCRYPTION ACTIVE
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Admin Content */}
                <main className="flex-1 min-w-0">
                    {children}
                </main>

            </div>
        </div>
    )
}
