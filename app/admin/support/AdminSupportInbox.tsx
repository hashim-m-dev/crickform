'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, User, Send, Loader2, MessageSquare, ShieldCheck, Mail, Zap, Activity } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Profile {
    id: string
    full_name: string
    email: string
    avatar_url?: string
}

interface Message {
    id: string
    content: string
    sender_id: string
    creator_id: string
    created_at: string
}

export default function AdminSupportInbox({ adminId }: { adminId: string }) {
    const [creators, setCreators] = useState<Profile[]>([])
    const [selectedCreator, setSelectedCreator] = useState<Profile | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [isLoadingCreators, setIsLoadingCreators] = useState(true)
    const [isLoadingMessages, setIsLoadingMessages] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        fetchCreators()
    }, [])

    useEffect(() => {
        if (selectedCreator) {
            fetchMessages(selectedCreator.id)
            const subscription = subscribeMessages(selectedCreator.id)
            return () => {
                subscription.unsubscribe()
            }
        }
    }, [selectedCreator])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const fetchCreators = async () => {
        setIsLoadingCreators(true)
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'CREATOR')
            .order('full_name', { ascending: true })

        if (error) {
            console.error('Error fetching creators:', error)
        } else {
            setCreators(data || [])
        }
        setIsLoadingCreators(false)
    }

    const fetchMessages = async (creatorId: string) => {
        setIsLoadingMessages(true)
        const { data, error } = await supabase
            .from('support_messages')
            .select('*')
            .eq('creator_id', creatorId)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Error fetching messages:', error)
        } else {
            setMessages(data || [])
        }
        setIsLoadingMessages(false)
    }

    const subscribeMessages = (creatorId: string) => {
        return supabase
            .channel(`admin:support:${creatorId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'support_messages',
                    filter: `creator_id=eq.${creatorId}`
                },
                (payload) => {
                    const newMsg = payload.new as Message
                    setMessages((prev) => [...prev, newMsg])
                }
            )
            .subscribe()
    }

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !selectedCreator || isSending) return

        setIsSending(true)
        const { error } = await supabase.from('support_messages').insert({
            creator_id: selectedCreator.id,
            sender_id: adminId,
            content: newMessage.trim()
        })

        if (error) {
            console.error('Error sending message:', error)
        } else {
            setNewMessage('')
        }
        setIsSending(false)
    }

    const filteredCreators = creators.filter(c =>
        c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex flex-col h-[calc(100vh-250px)] min-h-[700px] animate-fade-in text-white selection:bg-purple-500/30">
            <div className="relative group mb-12">
                <div className="flex items-center gap-6 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-2xl border border-white/5 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-purple-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black outfit tracking-tighter uppercase">SUPPORT <span className="text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text italic">NEXUS</span></h1>
                </div>
                <p className="text-white/40 font-bold uppercase text-[10px] tracking-[0.3em] bg-white/5 px-4 py-1.5 rounded-full border border-white/5 inline-block italic">
                    DIRECT QUANTUM CHANNEL TO OPERATOR COMMAND
                </p>
            </div>

            <div className="flex-1 flex overflow-hidden bg-[#0A0A0F] rounded-[3rem] border border-white/10 shadow-2xl relative">
                {/* Conversations List */}
                <div className="w-full md:w-96 flex flex-col border-r border-white/10 bg-white/[0.02]">
                    <div className="p-8 border-b border-white/10 bg-white/[0.03]">
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-purple-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="TRACE OPERATOR..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input-cyber pl-14 py-4 text-[12px]"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/10">
                        {isLoadingCreators ? (
                            <div className="flex items-center justify-center p-16">
                                <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
                            </div>
                        ) : filteredCreators.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-16 text-center opacity-40">
                                <Activity className="w-12 h-12 mb-6 text-white/20 animate-pulse" />
                                <p className="text-[12px] font-black uppercase tracking-[0.3em] italic">NULL SIGNAL: NO OPERATOR MATCH</p>
                            </div>
                        ) : (
                            filteredCreators.map((creator) => (
                                <button
                                    key={creator.id}
                                    onClick={() => setSelectedCreator(creator)}
                                    className={`w-full p-8 flex items-center gap-6 hover:bg-white/[0.05] transition-all text-left group relative ${selectedCreator?.id === creator.id ? 'bg-purple-500/10' : ''
                                        }`}
                                >
                                    {selectedCreator?.id === creator.id && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-purple-500 to-blue-600 rounded-r-full"></div>
                                    )}
                                    <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-lg transition-all duration-500 ${selectedCreator?.id === creator.id ? 'bg-gradient-to-br from-purple-500 to-blue-600 border-white/30 scale-110' : 'bg-white/5 border-white/10 group-hover:bg-white/10'}`}>
                                        <User className={`w-7 h-7 ${selectedCreator?.id === creator.id ? 'text-white' : 'text-white/20 group-hover:text-white/40'}`} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className={`font-black outfit tracking-tighter text-xl uppercase transition-colors ${selectedCreator?.id === creator.id ? 'text-white' : 'text-white/60 group-hover:text-white/90'}`}>
                                            {creator.full_name || 'UNKNOWN OPERATOR'}
                                        </p>
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] truncate mt-1.5 italic">{creator.email}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Container */}
                <div className="flex-1 flex flex-col bg-transparent relative">
                    {!selectedCreator ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-16 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-24 opacity-5">
                                <Zap className="w-64 h-64 text-purple-400 group-hover:rotate-12 transition-transform duration-1000" />
                            </div>
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-blue-600/20 rounded-[2.5rem] border border-white/10 flex items-center justify-center mb-10 shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-700">
                                <MessageSquare className="w-12 h-12 text-purple-400" />
                            </div>
                            <h2 className="text-4xl font-black outfit tracking-tighter uppercase mb-6 relative z-10">AWAITING <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent italic">TRANSMISSION</span></h2>
                            <p className="text-white/40 font-bold uppercase text-[12px] tracking-[0.2em] max-w-sm leading-relaxed bg-white/5 px-8 py-4 rounded-2xl border border-white/10 italic relative z-10">
                                SELECT AN OPERATOR DOSSIER TO INITIALIZE SECURE QUANTUM COMMUNICATION.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="p-8 border-b border-white/10 bg-white/[0.03] flex items-center justify-between backdrop-blur-xl relative z-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-[1.5rem] border border-white/30 flex items-center justify-center shadow-lg">
                                        <ShieldCheck className="w-10 h-10 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black outfit tracking-tighter uppercase text-white">{selectedCreator.full_name}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                            <p className="text-[12px] font-black uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-blue-400/40" /> {selectedCreator.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Messages area */}
                            <div className="flex-1 overflow-y-auto p-10 space-y-12 bg-transparent custom-scrollbar relative z-10 text-selection">
                                {isLoadingMessages ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="w-8 h-8 text-white/10 animate-spin" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center opacity-20">
                                        <Zap className="w-20 h-20 mb-8" />
                                        <p className="text-[12px] font-black uppercase tracking-[0.3em] italic">ENCRYPTED LOG: ZERO DATA DETECTED</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isAdmin = msg.sender_id === adminId
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} animate-fade-in`}
                                            >
                                                <div className={`flex items-center gap-4 mb-4 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border italic ${isAdmin ? 'bg-purple-500/20 border-purple-500/30 text-purple-300' : 'bg-blue-500/20 border-blue-500/30 text-blue-300'}`}>
                                                        {isAdmin ? 'PLATFORM COMMAND' : 'OPERATOR UPLINK'}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.1em]">
                                                        {formatDate(msg.created_at).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div
                                                    className={`max-w-[75%] px-8 py-5 rounded-[2rem] font-bold text-[15px] leading-relaxed shadow-2xl relative ${isAdmin
                                                        ? 'bg-gradient-to-br from-purple-500/20 to-blue-600/30 border border-white/10 text-white rounded-tr-none'
                                                        : 'bg-white/10 border border-white/10 text-white rounded-tl-none backdrop-blur-md'
                                                        }`}
                                                >
                                                    {msg.content}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Admin Reply Input */}
                            <div className="p-10 border-t border-white/10 bg-white/[0.03] backdrop-blur-xl relative z-10">
                                <form onSubmit={sendMessage} className="relative group">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={`TRANSMIT SECURE REPLY TO ${selectedCreator.full_name?.toUpperCase()}...`}
                                        className="input-cyber py-7 pl-10 pr-24 text-lg"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || isSending}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 group/send"
                                    >
                                        {isSending ? (
                                            <Loader2 className="w-8 h-8 animate-spin text-white" />
                                        ) : (
                                            <Send className="w-8 h-8 text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        )}
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
