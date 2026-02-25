'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Trophy, ArrowLeft, Loader2, MailCheck } from 'lucide-react'

const forgotPasswordSchema = z.object({
    email: z.string().email('Enter a valid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
    const supabase = createClient()
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema)
    })

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setStatus('loading')
        setErrorMessage(null)
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })
            if (error) throw error
            setStatus('success')
        } catch (err: any) {
            setErrorMessage(err.message || 'Something went wrong. Please try again.')
            setStatus('error')
        }
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] swirl swirl-blue opacity-30 animate-pulse-glow" />
                <div className="w-full max-w-md animate-fade-in relative z-10">
                    <div className="fluid-glass p-12 text-center rounded-[3rem] border border-white/10 glow-primary">
                        <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-3xl flex items-center justify-center mx-auto mb-10 glow-primary">
                            <MailCheck className="w-12 h-12 text-green-400" />
                        </div>
                        <h1 className="text-4xl font-black outfit tracking-tighter mb-4 uppercase">COMMAND SENT</h1>
                        <p className="font-bold text-white/40 uppercase text-[10px] tracking-[0.2em] leading-relaxed mb-12 italic">
                            WE'VE TRANSMITTED A RESET KEY TO YOUR FREQUENCY. CHECK YOUR EMAIL INTEL.
                        </p>
                        <Link href="/login" className="btn-cyber w-full py-5 text-sm tracking-widest font-black">
                            RETURN TO BASE
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6 lg:p-12 relative overflow-hidden text-white">
            {/* Background Texture & Swirls */}
            <div className="absolute top-[-20%] right-[-10%] swirl swirl-blue opacity-30 animate-pulse-glow" />
            <div className="absolute bottom-[-20%] left-[-10%] swirl swirl-pink opacity-20 animate-pulse-glow" style={{ animationDelay: '2s' }} />
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="w-full max-w-md relative animate-fade-in z-10">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-4 mb-8 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center glow-primary group-hover:scale-110 transition-transform">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-3xl tracking-tighter outfit uppercase">CRICK<span className="text-purple-500">FORM</span></span>
                    </Link>
                    <h1 className="text-4xl font-black outfit tracking-tighter mb-2 uppercase">LOST ACCESS?</h1>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full inline-block mt-3">INITIALIZE RECOVERY PROTOCOL</p>
                </div>

                <div className="fluid-glass p-10 rounded-[2.5rem] border border-white/10 glow-primary">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-4">EMAIL FREQUENCY</label>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="CHAMPION@CRICKFORM.COM"
                                className={`input-cyber py-4 ${errors.email ? 'border-red-500/50' : ''}`}
                            />
                            {errors.email && <p className="text-red-400 text-[10px] font-bold uppercase ml-4 mt-2 italic">{errors.email.message}</p>}
                        </div>

                        {status === 'error' && (
                            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase text-center animate-shake leading-relaxed">
                                {errorMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="btn-cyber w-full py-5 text-lg font-black tracking-tighter flex items-center justify-center gap-4 disabled:opacity-50 h-auto"
                        >
                            {status === 'loading' ? (
                                <>
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                    TRANSMITTING...
                                </>
                            ) : (
                                'SEND RESET KEY'
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-white/5">
                        <Link href="/login" className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors group italic">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            RECALL LOGIN
                        </Link>
                    </div>
                </div>

                <Link href="/" className="flex items-center justify-center gap-2 mt-12 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    ABORT RECOVERY
                </Link>
            </div>
        </div>
    )
}
