'use client'

import { useState } from 'react'
import { toCSV, downloadCSV, formatDate } from '@/lib/utils'
import { Download, Trash2, Search, Filter, Box } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function PlayerTableClient({ players: initialPlayers, tournamentId }: { players: any[], tournamentId: string }) {
    const [players, setPlayers] = useState(initialPlayers)
    const [search, setSearch] = useState('')
    const [filterMode, setFilterMode] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL')
    const supabase = createClient()

    // Filter logic
    const filteredPlayers = players.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.mobile.includes(search) ||
            (p.payment_id && p.payment_id.toLowerCase().includes(search.toLowerCase()))

        if (filterMode === 'ALL') return matchesSearch
        if (filterMode === 'PAID') return matchesSearch && (p.payment_status === 'PAID' || p.payment_status === 'FREE')
        if (filterMode === 'PENDING') return matchesSearch && p.payment_status === 'PENDING'
        return matchesSearch
    })

    // Export CSV
    const handleExport = () => {
        const csvData = filteredPlayers.map(p => ({
            Name: p.name,
            'Father Name': p.father_name,
            Mobile: p.mobile,
            Email: p.email,
            DOB: p.dob,
            Age: p.age,
            Gender: p.gender,
            Role: p.player_role,
            'Batting Arm': p.batting_arm,
            Category: p.category,
            District: p.district,
            Status: p.payment_status,
            'Payment ID': p.payment_id || 'N/A',
            'Reg Date': new Date(p.created_at).toLocaleString()
        }))

        const csvString = toCSV(csvData)
        downloadCSV(csvString, `Players_Tournament_${tournamentId}.csv`)
    }

    // Delete pending player
    const handleDelete = async (playerId: string) => {
        if (!window.confirm('DELETE THIS REGISTRATION?')) return

        try {
            const { error } = await supabase.from('players').delete().eq('id', playerId).eq('payment_status', 'PENDING')
            if (error) throw error
            setPlayers(prev => prev.filter(p => p.id !== playerId))
        } catch (err) {
            alert('FAILED TO DELETE.')
        }
    }

    return (
        <div className="flex flex-col h-full w-full text-white">
            {/* Toolbar */}
            <div className="p-4 md:p-8 border-b border-white/5 flex flex-col xl:flex-row gap-6 md:gap-8 justify-between items-center bg-[#0A0A0F]/50 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex flex-col lg:flex-row items-center gap-4 md:gap-6 w-full xl:w-auto">
                    <div className="relative w-full lg:w-80 group">
                        <Search className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-purple-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH AGENTS / FREQUENCIES..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-cyber pl-14 py-3.5 text-[9px] md:text-[10px]"
                        />
                    </div>

                    <div className="relative w-full lg:w-auto overflow-hidden">
                        <Filter className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                        <select
                            value={filterMode}
                            onChange={(e) => setFilterMode(e.target.value as any)}
                            className="input-cyber pl-14 pr-10 py-3.5 text-[9px] md:text-[10px] appearance-none cursor-pointer"
                        >
                            <option value="ALL" className="bg-[#0A0A0F]">ALL STATUS</option>
                            <option value="PAID" className="bg-[#0A0A0F]">PAID ONLY</option>
                            <option value="PENDING" className="bg-[#0A0A0F]">PENDING</option>
                        </select>
                    </div>
                </div>

                <button onClick={handleExport} className="btn-cyber w-full xl:w-auto py-3.5 px-8 text-[9px] md:text-[10px] font-bold tracking-[0.2em] flex justify-center items-center gap-3">
                    <Download className="w-4 h-4" /> EXPORT MANIFEST
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-white/5 text-[11px] font-black uppercase tracking-[0.3em] text-white/40">
                            <th className="px-10 py-8 border-r border-white/5 text-left">COMBATANT IDENTITY</th>
                            <th className="px-10 py-8 border-r border-white/5 text-left">COMM CHANNELS</th>
                            <th className="px-10 py-8 border-r border-white/5 text-center">ACTIVE ROLE</th>
                            <th className="px-10 py-8 border-r border-white/5 text-left">SYNC TIMESTAMP</th>
                            <th className="px-10 py-8 border-r border-white/5 text-center">AUTH STATUS</th>
                            <th className="px-10 py-8 text-center">PURGE</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y border-b border-white/5 divide-white/5">
                        {filteredPlayers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-40">
                                    <div className="flex flex-col items-center justify-center gap-8">
                                        <div className="w-24 h-24 rounded-[2rem] border border-white/10 flex items-center justify-center bg-white/5 shadow-2xl animate-pulse">
                                            <Box className="w-12 h-12 text-white/10" />
                                        </div>
                                        <p className="font-black uppercase tracking-[0.4em] text-[12px] text-white/20 italic">DATABASE VACUUM: NO MATCHING ENTRIES</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredPlayers.map((player, idx) => (
                                <tr key={player.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-10 py-8 border-r border-white/5">
                                        <div className="flex items-center gap-6">
                                            <div className="relative">
                                                {player.image_url ? (
                                                    <img src={player.image_url} alt={player.name} className="w-16 h-16 rounded-2xl border border-white/10 object-cover group-hover:scale-110 transition-transform duration-500 shadow-xl" />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-600/20 border border-purple-500/20 flex items-center justify-center font-black text-2xl group-hover:bg-purple-500/30 transition-all duration-500">
                                                        {player.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#0A0A0F] bg-emerald-500"></div>
                                            </div>
                                            <div>
                                                <p className="font-black text-2xl outfit tracking-tighter truncate max-w-[280px] group-hover:text-purple-400 transition-colors uppercase leading-none">{player.name}</p>
                                                {player.father_name && <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-2.5 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/20"></span> UNIT OF {player.father_name.toUpperCase()}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 border-r border-white/5">
                                        <p className="text-sm font-black outfit tracking-widest text-white/90">{player.mobile}</p>
                                        <p className="text-[11px] font-bold text-white/20 uppercase tracking-[0.1em] mt-2 truncate max-w-[200px] italic">{player.email || 'NO DIGITAL FREQUENCY'}</p>
                                    </td>
                                    <td className="px-10 py-8 border-r border-white/5 text-center">
                                        <div className="inline-flex items-center px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all">
                                            {player.player_role || 'RESERVE'}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 border-r border-white/5">
                                        <p className="text-[11px] font-black outfit uppercase tracking-wider text-white/70">{formatDate(player.created_at).toUpperCase()}</p>
                                        <p className="text-[10px] font-bold text-white/20 mt-1.5 uppercase tracking-widest">{new Date(player.created_at).toLocaleTimeString().toUpperCase()}</p>
                                    </td>
                                    <td className="px-10 py-8 border-r border-white/5">
                                        {player.payment_status === 'PAID' || player.payment_status === 'FREE' ? (
                                            <div className="space-y-3">
                                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                                    AUTHORIZED
                                                </div>
                                                {player.payment_id && <p className="text-[9px] font-mono text-white/20 truncate max-w-[160px] px-2">{player.payment_id.toUpperCase()}</p>}
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">
                                                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                                                SYNCING...
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        {player.payment_status === 'PENDING' ? (
                                            <button
                                                onClick={() => handleDelete(player.id)}
                                                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all group/purge"
                                            >
                                                <Trash2 className="w-5 h-5 group-hover/purge:scale-110 transition-transform" />
                                            </button>
                                        ) : (
                                            <div className="flex justify-center">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/5 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20"></div>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
