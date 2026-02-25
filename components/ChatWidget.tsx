'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle, X, Send, ShieldCheck, Loader2, Sparkles } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Message {
    id: string
    content: string
    sender_id: string
    creator_id: string
    created_at: string
}

export default function ChatWidget({ userId }: { userId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        if (isOpen) {
            fetchMessages()
            const subscription = subscribeMessages()
            return () => {
                subscription.unsubscribe()
            }
        }
    }, [isOpen])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const fetchMessages = async () => {
        setIsLoading(true)
        setError(null)
        const { data, error: fetchError } = await supabase
            .from('support_messages')
            .select('*')
            .eq('creator_id', userId)
            .order('created_at', { ascending: true })

        if (fetchError) {
            console.error('Error fetching messages:', fetchError)
            setError('ENCRYPTION ERROR: CHAT STREAM INTERRUPTED.')
        } else {
            setMessages(data || [])
        }
        setIsLoading(false)
    }

    const subscribeMessages = () => {
        return supabase
            .channel('public:support_messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'support_messages',
                    filter: `creator_id=eq.${userId}`
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
        if (!newMessage.trim() || isSending) return

        setIsSending(true)
        setError(null)
        const { error: sendError } = await supabase.from('support_messages').insert({
            creator_id: userId,
            sender_id: userId,
            content: newMessage.trim()
        })

        if (sendError) {
            console.error('Error sending message:', sendError)
            setError(sendError.message || 'TRANSMISSION FAILED.')
        } else {
            setNewMessage('')
            if (messages.length === 0) fetchMessages()
        }
        setIsSending(false)
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 text-white selection:bg-purple-500/30">
            {/* Chat Bubble */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-110 hover:-rotate-12 transition-all duration-500 group relative"
                >
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-20 group-hover:opacity-40"></div>
                    <MessageCircle className="w-8 h-8 relative z-10" />
                    <div className="absolute right-20 bg-[#0A0A0F] text-white text-[9px] font-black uppercase tracking-[0.2em] py-2 px-4 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-2xl skew-x-[-10deg]">
                        INITIATE COMMS
                    </div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-[#0F0F16] w-[380px] h-[580px] flex flex-col rounded-[2.5rem] border border-white/10 shadow-2xl glow-primary animate-fade-in overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Sparkles className="w-48 h-48 text-purple-400" />
                    </div>

                    {/* Header */}
                    <div className="p-6 md:p-8 bg-white/[0.04] border-b border-white/10 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4 text-selection">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-600/30 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-[12px] font-black outfit uppercase tracking-widest text-white">Support Node</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Quantum Link Active</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 hover:text-white transition-all group"
                        >
                            <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-transparent relative z-10 scrollbar-hide text-selection">
                        {error && (
                            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-[0.2em] animate-shake text-center">
                                {error}
                            </div>
                        )}

                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-8 h-8 text-purple-400/20 animate-spin" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
                                <div className="p-10 rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-sm group hover:border-purple-500/20 transition-all duration-500">
                                    <p className="text-[12px] font-black outfit uppercase leading-relaxed tracking-widest text-white/60 italic">
                                        COMMANDER IDENTIFIED. <br />
                                        AWAITING TRANSMISSION...
                                    </p>
                                </div>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isMe = msg.sender_id === userId
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in`}
                                    >
                                        <div
                                            className={`max-w-[85%] px-6 py-4 rounded-2xl font-bold text-[13px] leading-relaxed relative shadow-2xl ${isMe
                                                ? 'bg-purple-600/30 border border-purple-500/40 text-white rounded-tr-none'
                                                : 'bg-white/10 border border-white/10 text-white rounded-tl-none'
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                        <div className="mt-2 text-[8px] font-black uppercase tracking-[0.2em] text-white/30 px-1 italic">
                                            {formatDate(msg.created_at).toUpperCase()}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer Input */}
                    <form onSubmit={sendMessage} className="p-6 md:p-8 bg-white/[0.04] border-t border-white/10 relative z-10">
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="TYPE ENCRYPTED MESSAGE..."
                                className="input-cyber flex-1 h-14 text-[12px] pl-6"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || isSending}
                                className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 group/send"
                            >
                                {isSending ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                                ) : (
                                    <Send className="w-6 h-6 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
