'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Trophy, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'

const loginSchema = z.object({
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    })

    const onSubmit = async (data: LoginFormData) => {
        setLoading(true)
        setError(null)
        try {
            const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            })
            if (signInError) throw signInError

            if (authData.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', authData.user.id)
                    .single()

                if (profile?.role === 'SUPER_ADMIN') {
                    router.push('/admin')
                } else {
                    router.push('/dashboard')
                }
                router.refresh()
            }
        } catch (err: any) {
            setError(err.message || 'Invalid email or password. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Texture & Swirls */}
            <div className="absolute top-[-20%] right-[-10%] swirl swirl-blue opacity-30 animate-pulse-glow" />
            <div className="absolute bottom-[-20%] left-[-10%] swirl swirl-pink opacity-20 animate-pulse-glow" style={{ animationDelay: '2s' }} />
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                {/* Header */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center glow-primary group-hover:scale-110 transition-transform">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-3xl tracking-tighter outfit uppercase">
                            CRICK<span className="text-purple-500">FORM</span>
                        </span>
                    </Link>
                    <h1 className="text-4xl font-black outfit tracking-tighter mb-2">
                        WELCOME BACK
                    </h1>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest bg-white/5 py-1.5 px-3 rounded-full inline-block">
                        SECURE AUTHENTICATION GATEWAY
                    </p>
                </div>

                {/* Card */}
                <div className="fluid-glass p-10 rounded-[2.5rem] glow-primary border border-white/10 group">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-4">COMMANDER EMAIL</label>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="CHAMPION@CRICKFORM.COM"
                                className="input-cyber py-4 border-white/5 focus:border-purple-500/50"
                            />
                            {errors.email && <p className="text-red-400 text-[10px] font-bold uppercase ml-4 mt-2">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-4 mr-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/60">ACCESS KEY</label>
                                <Link href="/forgot-password" title="Forgot Password" className="text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-tight italic decoration-purple-400/30 underline underline-offset-4">
                                    forgot key?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="input-cyber py-4 border-white/5 focus:border-purple-500/50 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-400 text-[10px] font-bold uppercase ml-4 mt-2">{errors.password.message}</p>}
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase text-center animate-shake leading-relaxed">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-cyber w-full py-5 text-lg font-black tracking-tighter group flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    SYNCING...
                                </>
                            ) : (
                                <>
                                    LOGIN TO CITADEL
                                    <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-white/5 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-6 italic">
                            NEW USER DETECTED?
                        </p>
                        <Link
                            href="/signup"
                            className="btn-cyber-outline w-full py-4 text-xs font-bold"
                        >
                            INITIALIZE ENROLLMENT
                        </Link>
                    </div>
                </div>

                <Link href="/" className="flex items-center justify-center gap-2 mt-12 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    BEYOND THE GATE
                </Link>
            </div>
        </div>
    )
}
