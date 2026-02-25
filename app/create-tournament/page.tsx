'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils'
import { Trophy, Loader2, ArrowLeft, Image as ImageIcon, Sparkles } from 'lucide-react'
import Link from 'next/link'

const createTournamentSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    season: z.string().optional().or(z.literal('')),
    description: z.string().optional().or(z.literal('')),
    registration_fee: z.number().min(0, 'Fee cannot be negative'),
    last_date: z.string().min(1, 'Deadline is required'),
    is_active: z.boolean(),
})

type CreateFormData = {
    name: string
    season?: string
    description?: string
    registration_fee: number
    last_date: string
    is_active: boolean
}

export default function CreateTournamentPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Banner upload state
    const [bannerFile, setBannerFile] = useState<File | null>(null)
    const [bannerPreview, setBannerPreview] = useState<string | null>(null)
    const [uploadingImage, setUploadingImage] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<CreateFormData>({
        resolver: zodResolver(createTournamentSchema),
        defaultValues: {
            registration_fee: 0,
            is_active: true,
        }
    })

    // Handle image selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setError('PLEASE UPLOAD A VALID IMAGE FILE')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('IMAGE MUST BE LESS THAN 5MB')
            return
        }

        setBannerFile(file)
        setBannerPreview(URL.createObjectURL(file))
        setError(null)
    }

    const uploadBanner = async (): Promise<string | null> => {
        if (!bannerFile) return null

        setUploadingImage(true)
        const fileExt = bannerFile.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        try {
            const { error: uploadError } = await supabase.storage
                .from('tournament-banners')
                .upload(filePath, bannerFile)

            if (uploadError) throw uploadError

            const { data: publicUrlData } = supabase.storage
                .from('tournament-banners')
                .getPublicUrl(filePath)

            return publicUrlData.publicUrl
        } catch (err: any) {
            console.error('Image upload error:', err)
            throw new Error('FAILED TO UPLOAD BANNER IMAGE')
        } finally {
            setUploadingImage(false)
        }
    }

    const onSubmit = async (data: CreateFormData) => {
        setLoading(true)
        setError(null)

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            if (authError || !user) throw new Error('NOT AUTHENTICATED')

            let bannerUrl = null
            if (bannerFile) {
                bannerUrl = await uploadBanner()
            }

            const slug = generateSlug(data.name)

            const { error: insertError } = await supabase
                .from('tournaments')
                .insert({
                    user_id: user.id,
                    name: data.name,
                    slug,
                    season: data.season,
                    description: data.description,
                    registration_fee: data.registration_fee,
                    last_date: data.last_date,
                    banner_url: bannerUrl,
                    is_active: data.is_active,
                })
                .select()
                .single()

            if (insertError) throw insertError

            router.push('/dashboard')
            router.refresh()

        } catch (err: any) {
            setError(err.message || 'SOMETHING WENT WRONG.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white selection:bg-purple-500/30">
            {/* Nav Header */}
            <div className="border-b border-white/5 sticky top-0 z-50 backdrop-blur-xl bg-[#0A0A0F]/50 h-20 flex items-center px-6 sm:px-8">
                <Link href="/dashboard" className="btn-cyber-outline py-2.5 px-6 text-[10px] font-bold tracking-widest flex items-center gap-3">
                    <ArrowLeft className="w-4 h-4" />
                    RECALL COMMAND
                </Link>
            </div>

            <main className="max-w-5xl mx-auto px-6 sm:px-10 py-16 md:py-24 animate-fade-in relative">
                {/* Background Swirls */}
                <div className="absolute top-0 right-0 swirl swirl-blue opacity-10 animate-pulse-glow" />

                <div className="mb-20 relative z-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl shadow-purple-500/30 transform hover:scale-110 hover:rotate-6 transition-all duration-500">
                        <Trophy className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-black outfit tracking-tighter uppercase mb-6 leading-none">
                        INITIALIZE <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">ARENA</span>
                    </h1>
                    <p className="text-white/40 font-black uppercase text-[11px] tracking-[0.4em] bg-white/5 inline-block px-6 py-2.5 rounded-full border border-white/10 italic backdrop-blur-md">
                        CONFIGURING THE TOURNAMENT MANIFESTO
                    </p>
                </div>

                <div className="fluid-glass p-10 md:p-20 rounded-[4rem] border border-white/10 glow-primary relative z-10 shadow-2xll">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-16">

                        {/* Banner Upload */}
                        <div className="space-y-6">
                            <label className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 ml-6">EVENT VISUAL SPECS (OPTIONAL)</label>
                            <div className={`relative overflow-hidden group rounded-[3rem] border border-white/10 bg-white/[0.03] transition-all duration-500 hover:border-purple-500/40 ${bannerPreview ? 'h-72 sm:h-96' : 'py-32'}`}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                />

                                {bannerPreview ? (
                                    <div className="relative h-full w-full">
                                        <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-[#0A0A0F]/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md">
                                            <span className="btn-cyber-outline py-4 px-10 text-[11px] font-black tracking-widest bg-black/60 shadow-2xl">
                                                REPLACE INTEL
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-8">
                                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500/10 to-blue-600/10 text-white/30 flex items-center justify-center border border-white/10 rounded-[2.5rem] group-hover:scale-110 group-hover:text-purple-400 group-hover:border-purple-500/40 transition-all duration-700 shadow-3xl bg-white/[0.02]">
                                            <ImageIcon className="w-12 h-12" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-black outfit text-2xl tracking-[0.2em] uppercase mb-3 text-white/90">UPLOAD ARENA BANNER</p>
                                            <p className="text-[10px] font-bold text-white/30 tracking-[0.4em] uppercase italic">PNG / JPG / WEBP — 5.0MB LIMIT</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16">
                            {/* Name */}
                            <div className="space-y-4">
                                <label className="text-[11px] font-black uppercase tracking-widest text-white/50 ml-6">ARENA IDENTITY *</label>
                                <input
                                    {...register('name')}
                                    type="text"
                                    placeholder="E.G. QUANTUM T20 CUP"
                                    className="input-cyber py-5 px-8 text-md font-bold"
                                />
                                {errors.name && <p className="text-red-400 text-[11px] font-bold uppercase ml-6 mt-3 italic">{errors.name.message}</p>}
                            </div>

                            {/* Season */}
                            <div className="space-y-4">
                                <label className="text-[11px] font-black uppercase tracking-widest text-white/50 ml-6">MISSION CYCLE / SEASON</label>
                                <input
                                    {...register('season')}
                                    type="text"
                                    placeholder="E.G. CYCLE-24 / PHASE-01"
                                    className="input-cyber py-5 px-8 text-md font-bold"
                                />
                            </div>

                            {/* Fee */}
                            <div className="space-y-4">
                                <label className="text-[11px] font-black uppercase tracking-widest text-white/50 ml-6">CLEARANCE FEE (₹) *</label>
                                <div className="relative group">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-2xl text-white/20 group-hover:text-purple-400 transition-colors">₹</span>
                                    <input
                                        {...register('registration_fee', { valueAsNumber: true })}
                                        type="number"
                                        className="input-cyber pl-14 py-5 text-3xl font-black"
                                    />
                                </div>
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest italic pt-2 ml-6">SET 0 FOR FREE DEPLOYMENT</p>
                                {errors.registration_fee && <p className="text-red-400 text-[11px] font-bold uppercase ml-6 mt-3 italic">{errors.registration_fee.message}</p>}
                            </div>

                            {/* Last Date */}
                            <div className="space-y-4">
                                <label className="text-[11px] font-black uppercase tracking-widest text-white/50 ml-6">TERMINATION DEADLINE *</label>
                                <input
                                    {...register('last_date')}
                                    type="date"
                                    className="input-cyber py-5 px-8 text-md font-bold"
                                />
                                {errors.last_date && <p className="text-red-400 text-[11px] font-bold uppercase ml-6 mt-3 italic">{errors.last_date.message}</p>}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black uppercase tracking-widest text-white/50 ml-6">RULES & MANIFESTO</label>
                            <textarea
                                {...register('description')}
                                rows={6}
                                placeholder="PROVIDE COMPREHENSIVE BATTLE RULES, PRIZES, AND SCHEDULE..."
                                className="input-cyber py-7 px-8 resize-none h-60 text-lg font-medium leading-relaxed"
                            />
                        </div>

                        {/* Status toggle */}
                        <div className="flex items-center gap-10 p-12 rounded-[3.5rem] bg-white/[0.02] border border-white/10 backdrop-blur-xl transition-all duration-700 hover:border-emerald-500/30 group/toggle hover:bg-white/[0.04]">
                            <div className="relative flex items-center h-10 group">
                                <input
                                    {...register('is_active')}
                                    type="checkbox"
                                    id="is_active"
                                    className="peer h-10 w-20 opacity-0 cursor-pointer absolute z-10"
                                />
                                <div className="w-20 h-10 bg-white/10 rounded-full border border-white/10 transition-all peer-checked:bg-emerald-500 relative shadow-2xl">
                                    <div className="absolute top-1.5 left-1.5 w-7 h-7 bg-white rounded-full transition-all peer-checked:translate-x-10 shadow-lg"></div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="is_active" className="text-3xl font-black outfit uppercase tracking-tighter cursor-pointer block group-hover/toggle:text-emerald-400 transition-colors">
                                    PUBLISH ARENA
                                </label>
                                <p className="text-[11px] font-bold uppercase text-white/30 tracking-widest mt-2">ACTIVATES PUBLIC REGISTRATION LINK UPON DEPLOYMENT</p>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="p-10 rounded-[2.5rem] border border-red-500/40 bg-red-500/5 text-red-400 text-sm font-black uppercase tracking-[0.2em] text-center animate-shake backdrop-blur-md shadow-2xl">
                                <div className="flex items-center justify-center gap-4">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                                    {error}
                                </div>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="pt-16 flex flex-col-reverse sm:flex-row justify-end gap-8 border-t border-white/10">
                            <Link href="/dashboard" className="btn-cyber-outline py-6 px-12 text-[11px] font-black tracking-[0.3em] text-center uppercase">
                                ABORT MISSION
                            </Link>
                            <button
                                type="submit"
                                disabled={loading || uploadingImage}
                                className="btn-cyber py-6 px-16 text-2xl group flex items-center justify-center gap-6 disabled:opacity-50 h-auto shadow-2xl shadow-purple-500/20"
                            >
                                {loading || uploadingImage ? (
                                    <><Loader2 className="w-10 h-10 animate-spin" /> SYNCHRONIZING...</>
                                ) : (
                                    <>
                                        DEPLOY ARENA
                                        <Sparkles className="w-8 h-8 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500" />
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </main>
        </div>
    )
}
