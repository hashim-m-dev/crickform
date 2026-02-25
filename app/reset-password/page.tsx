'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Trophy, Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'

const resetPasswordSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
    const router = useRouter()
    const supabase = createClient()
    const [showPassword, setShowPassword] = useState(false)
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema)
    })

    const onSubmit = async (data: ResetPasswordFormData) => {
        setStatus('loading')
        setErrorMessage(null)
        try {
            const { error } = await supabase.auth.updateUser({
                password: data.password
            })
            if (error) throw error
            setStatus('success')

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        } catch (err: any) {
            setErrorMessage(err.message || 'Something went wrong. Please try again.')
            setStatus('error')
        }
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] swirl swirl-blue opacity-30 animate-pulse-glow" />
                <div className="w-full max-w-md animate-fade-in text-center relative z-10">
                    <div className="fluid-glass p-12 rounded-[3rem] border border-white/10 glow-primary">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-blue-600/20 border border-purple-500/30 rounded-3xl flex items-center justify-center mx-auto mb-10 glow-primary">
                            <CheckCircle2 className="w-12 h-12 text-purple-400" />
                        </div>
                        <h1 className="text-4xl font-black outfit tracking-tighter mb-4 uppercase">ACCESS RESTORED</h1>
                        <p className="font-bold text-white/40 uppercase text-[10px] tracking-[0.2em] leading-relaxed mb-12 italic">
                            YOUR CREDENTIALS HAVE BEEN UPDATED. REDIRECTING TO BASE IN 3 SECONDS...
                        </p>
                        <Link href="/login" className="btn-cyber w-full py-5 text-sm tracking-widest font-black">
                            GO TO LOGIN NOW
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6 lg:p-12 relative overflow-hidden text-white">
            {/* Background Texture & Swirls */}
            <div className="absolute top-[-20%] left-[-10%] swirl swirl-blue opacity-30 animate-pulse-glow" />
            <div className="absolute bottom-[-20%] right-[-10%] swirl swirl-pink opacity-20 animate-pulse-glow" style={{ animationDelay: '2s' }} />
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="w-full max-w-md relative animate-fade-in z-10">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-4 mb-8 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center glow-primary group-hover:scale-110 transition-transform">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-3xl tracking-tighter outfit uppercase">CRICK<span className="text-purple-500">FORM</span></span>
                    </Link>
                    <h1 className="text-4xl font-black outfit tracking-tighter mb-2 uppercase">NEW GATEKEY</h1>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full inline-block mt-3 uppercase">SECURE YOUR ACCOUNT ACCESS</p>
                </div>

                <div className="fluid-glass p-10 rounded-[2.5rem] border border-white/10 glow-primary">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-4">NEW ACCESS KEY</label>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="MIN 8 CHARS"
                                    className={`input-cyber py-4 ${errors.password ? 'border-red-500/50' : ''}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-transform"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-400 text-[10px] font-bold uppercase ml-4 mt-2 italic">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-4">RE-ENTER KEY</label>
                            <input
                                {...register('confirmPassword')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="MATCH PASSWORD"
                                className={`input-cyber py-4 ${errors.confirmPassword ? 'border-red-500/50' : ''}`}
                            />
                            {errors.confirmPassword && <p className="text-red-400 text-[10px] font-bold uppercase ml-4 mt-2 italic">{errors.confirmPassword.message}</p>}
                        </div>

                        {status === 'error' && (
                            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase text-center animate-shake">
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
                                    UPDATING...
                                </>
                            ) : (
                                'OVERWRITE ACCESS KEY'
                            )}
                        </button>
                    </form>
                </div>

                <Link href="/" className="flex items-center justify-center gap-2 mt-12 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    BEYOND THE GATE
                </Link>
            </div>
        </div>
    )
}
