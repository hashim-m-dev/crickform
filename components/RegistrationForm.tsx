'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Loader2, UploadCloud, CheckCircle2 } from 'lucide-react'

// Define the 20+ field schema
const registrationSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    father_name: z.string().optional(),
    category: z.string().min(1, 'Category is required'),
    age: z.coerce.number().min(5, 'Invalid age').max(100, 'Invalid age'),
    dob: z.string().min(1, 'Date of Birth is required'),
    gender: z.enum(['Male', 'Female', 'Other'], { message: 'Select gender' }),
    occupation: z.string().optional(),

    mobile: z.string().regex(/^[0-9]{10}$/, 'Must be a 10-digit number'),
    whatsapp: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),

    aadhaar: z.string().regex(/^[0-9]{12}$/, 'Must be a 12-digit number').optional().or(z.literal('')),
    district: z.string().min(2, 'District is required'),
    pin: z.string().regex(/^[0-9]{6}$/, 'Must be a 6-digit PIN').optional().or(z.literal('')),
    address: z.string().min(5, 'Address is required'),
    social_link: z.string().url('Invalid URL').optional().or(z.literal('')),

    tshirt_size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'], { message: 'Select shirt size' }),
    first_preference: z.string().optional(),
    batting_arm: z.enum(['Right', 'Left'], { message: 'Select batting arm' }),
    player_role: z.enum(['Batsman', 'Bowler', 'All Rounder', 'Wicket Keeper'], { message: 'Select role' }),
})

interface Props {
    tournamentId: string
    creatorId: string
    fee: number
}

export default function RegistrationForm({ tournamentId, creatorId, fee }: Props) {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Image upload state
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const { register, handleSubmit, formState: { errors } } = useForm<any>({
        resolver: zodResolver(registrationSchema)
    })

    // Handle image selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith('image/')) {
            setError('PLEASE UPLOAD A VALID IMAGE FILE (JPG/PNG)')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('IMAGE MUST BE LESS THAN 5MB')
            return
        }
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
        setError(null)
    }

    // Upload image logic
    const uploadImage = async (): Promise<string | null> => {
        if (!imageFile) return null

        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${tournamentId}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`

        try {
            const { error: uploadError } = await supabase.storage
                .from('player-images')
                .upload(fileName, imageFile)

            if (uploadError) throw uploadError

            const { data } = supabase.storage
                .from('player-images')
                .getPublicUrl(fileName)

            return data.publicUrl
        } catch (err) {
            console.error('Upload Error:', err)
            return null
        }
    }

    const onSubmit = async (data: any) => {
        setLoading(true)
        setError(null)

        try {
            const { data: existingPlayer } = await supabase
                .from('players')
                .select('id, payment_status')
                .eq('tournament_id', tournamentId)
                .eq('mobile', data.mobile)
                .single()

            if (existingPlayer) {
                if (existingPlayer.payment_status === 'PAID' || existingPlayer.payment_status === 'FREE') {
                    throw new Error('MOBILE NUMBER ALREADY REGISTERED.')
                } else {
                    await supabase.from('players').delete().eq('id', existingPlayer.id)
                }
            }

            let imageUrl = null
            if (imageFile) {
                imageUrl = await uploadImage()
            }

            const initialStatus = fee === 0 ? 'FREE' : 'PENDING'

            const { data: newPlayer, error: insertError } = await supabase
                .from('players')
                .insert({
                    tournament_id: tournamentId,
                    creator_id: creatorId,
                    ...data,
                    image_url: imageUrl,
                    payment_status: initialStatus
                })
                .select()
                .single()

            if (insertError) {
                if (insertError.code === '23505') throw new Error('MOBILE NUMBER ALREADY REGISTERED.')
                throw insertError
            }

            if (fee === 0) {
                router.push(`/payment-success?player_id=${newPlayer.id}`)
            } else {
                try {
                    const res = await fetch('/api/payment/create-order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            player_id: newPlayer.id,
                            tournament_id: tournamentId,
                            creator_id: creatorId,
                            amount: fee
                        })
                    })

                    const orderData = await res.json()
                    if (!res.ok) throw new Error(orderData.error || 'FAILED TO INITIALIZE PAYMENT')

                    const options = {
                        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                        amount: orderData.amount,
                        currency: orderData.currency,
                        name: "CrickForm Tournament",
                        description: "Registration Fee",
                        order_id: orderData.id,
                        handler: function (response: any) {
                            router.push(`/payment-success?player_id=${newPlayer.id}&payment_id=${response.razorpay_payment_id}`)
                        },
                        prefill: {
                            name: data.name,
                            email: data.email || "",
                            contact: data.mobile
                        },
                        theme: {
                            color: "#8B5CF6"
                        }
                    }

                    // @ts-ignore
                    const rzp = new window.Razorpay(options)
                    rzp.on('payment.failed', function (response: any) {
                        setError('PAYMENT FAILED. PLEASE RETRY.')
                        setLoading(false)
                    })
                    rzp.open()

                } catch (paymentErr: any) {
                    throw new Error(paymentErr.message || 'PAYMENT INITIALIZATION FAILED')
                }
            }

        } catch (err: any) {
            setError(err.message || 'REGISTRATION FAILED.')
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 relative text-white">
            {/* Photo Upload */}
            <div className="fluid-glass p-10 rounded-[2.5rem] border border-white/10 glow-primary transition-all duration-500">
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-10 flex items-center gap-4 text-purple-400">
                    <span className="w-12 h-[2px] bg-gradient-to-r from-purple-500 to-transparent"></span>
                    01. BIOMETRIC PROFILE
                </h3>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-12">
                    <div className="w-44 h-44 bg-[#0A0A0F]/50 rounded-3xl border border-white/10 overflow-hidden shrink-0 relative group glow-primary">
                        {imagePreview ? (
                            <>
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none backdrop-blur-[2px]">
                                    <UploadCloud className="w-10 h-10 text-white" />
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/5">
                                <UploadCloud className="w-12 h-12 text-white/20" />
                            </div>
                        )}
                    </div>
                    <div className="text-center sm:text-left pt-4 space-y-6">
                        <label className="btn-cyber-outline py-4 px-10 cursor-pointer">
                            {imagePreview ? 'RE-SYNC BIO' : 'INITIATE CAPTURE'}
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 leading-snug max-w-[200px] italic">CLEAR FACE SCAN REQUIRED. FILE LIMIT: 5.0MB.</p>
                    </div>
                </div>
            </div>

            {/* Personal Dossier */}
            <div className="fluid-glass p-10 rounded-[2.5rem] border border-white/10 glow-primary transition-all duration-500">
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-12 flex items-center gap-4 text-blue-400">
                    <span className="w-12 h-[2px] bg-gradient-to-r from-blue-500 to-transparent"></span>
                    02. CORE DATA
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-4">PLAYER NAME *</label>
                        <input {...register('name')} type="text" className="input-cyber" placeholder="FULL LEGAL NAME" />
                        {errors.name && <p className="text-red-400 text-[9px] font-bold uppercase ml-4 mt-1">{(errors.name as any).message}</p>}
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-4">PARENT/GUARDIAN</label>
                        <input {...register('father_name')} type="text" className="input-cyber" placeholder="FATHER'S NAME" />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-4">CATEGORY SECTOR *</label>
                        <input {...register('category')} type="text" className="input-cyber" placeholder="OPEN / U-19 / VETERAN" />
                        {errors.category && <p className="text-red-400 text-[9px] font-bold uppercase ml-4 mt-1">{(errors.category as any).message}</p>}
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-4">BIRTH CYCLE *</label>
                        <input {...register('dob')} type="date" className="input-cyber" />
                        {errors.dob && <p className="text-red-400 text-[9px] font-bold uppercase ml-4 mt-1">{(errors.dob as any).message}</p>}
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-4">CHRONO AGE *</label>
                        <input {...register('age')} type="number" className="input-cyber" placeholder="YEARS" />
                        {errors.age && <p className="text-red-400 text-[9px] font-bold uppercase ml-4 mt-1">{(errors.age as any).message}</p>}
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-4">GENDER IDENTITY *</label>
                        <select {...register('gender')} className="input-cyber appearance-none">
                            <option value="" className="bg-[#0A0A0F]">SELECT GENDER</option>
                            <option value="Male" className="bg-[#0A0A0F]">MALE</option>
                            <option value="Female" className="bg-[#0A0A0F]">FEMALE</option>
                            <option value="Other" className="bg-[#0A0A0F]">OTHER</option>
                        </select>
                        {errors.gender && <p className="text-red-400 text-[9px] font-bold uppercase ml-4 mt-1">{(errors.gender as any).message}</p>}
                    </div>

                    <div className="md:col-span-2 space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-4">MISSION / OCCUPATION</label>
                        <input {...register('occupation')} type="text" className="input-cyber" placeholder="YOUR CURRENT VOCATION" />
                    </div>
                </div>
            </div>

            {/* Communications */}
            <div className="fluid-glass p-10 rounded-[2.5rem] border border-white/10 glow-primary transition-all duration-500">
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-12 flex items-center gap-4 text-pink-400">
                    <span className="w-12 h-[2px] bg-gradient-to-r from-pink-500 to-transparent"></span>
                    03. SYNC CHANNELS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-4">PRIMARY MOBILE *</label>
                        <input {...register('mobile')} type="text" maxLength={10} className="input-cyber" placeholder="10-DIGIT IDENTIFIER" />
                        {errors.mobile && <p className="text-red-400 text-[9px] font-bold uppercase ml-4 mt-1">{(errors.mobile as any).message}</p>}
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-4">WHATSAPP SYNC</label>
                        <input {...register('whatsapp')} type="text" maxLength={10} className="input-cyber" placeholder="BACKUP NUMBER" />
                    </div>

                    <div className="md:col-span-2 space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-4">DIGITAL MAILBOX</label>
                        <input {...register('email')} type="email" className="input-cyber" placeholder="SECURE@DOMAIN.COM" />
                        {errors.email && <p className="text-red-400 text-[9px] font-bold uppercase ml-4 mt-1">{(errors.email as any).message}</p>}
                    </div>
                </div>
            </div>

            {/* Operational Base */}
            <div className="fluid-glass p-10 rounded-[2.5rem] border border-white/10 glow-primary transition-all duration-500">
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-12 flex items-center gap-4 text-cyan-400">
                    <span className="w-12 h-[2px] bg-gradient-to-r from-cyan-500 to-transparent"></span>
                    04. GEOLOCATION
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-4">AADHAAR KEYPLATE</label>
                        <input {...register('aadhaar')} type="text" maxLength={12} className="input-cyber" placeholder="12-DIGIT AUTH KEY" />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-4">DISTRICT SECTOR *</label>
                        <input {...register('district')} type="text" className="input-cyber" placeholder="OPERATIONAL REGION" />
                        {errors.district && <p className="text-red-400 text-[9px] font-bold uppercase ml-4 mt-1">{(errors.district as any).message}</p>}
                    </div>

                    <div className="md:col-span-2 space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-4">DEPLOYMENT BASE *</label>
                        <textarea {...register('address')} rows={3} className="input-cyber resize-none" placeholder="FULL OPERATIONAL ADDRESS..." />
                        {errors.address && <p className="text-red-400 text-[9px] font-bold uppercase ml-4 mt-1">{(errors.address as any).message}</p>}
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-4">GRID PIN / ZIP</label>
                        <input {...register('pin')} type="text" maxLength={6} className="input-cyber" placeholder="6-DIGIT CODE" />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-4">COMM LINK (URL)</label>
                        <input {...register('social_link')} type="text" className="input-cyber" placeholder="https://social.me/profile" />
                    </div>
                </div>
            </div>

            {/* Combat Specs */}
            <div className="fluid-glass p-10 rounded-[2.5rem] border border-white/10 glow-primary transition-all duration-500">
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-12 flex items-center gap-4 text-purple-400">
                    <span className="w-12 h-[2px] bg-gradient-to-r from-purple-500 to-transparent"></span>
                    05. COMBAT SPECS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-4">PRIMARY ROLE *</label>
                        <select {...register('player_role')} className="input-cyber appearance-none">
                            <option value="" className="bg-[#0A0A0F]">SELECT SPECIALTY</option>
                            <option value="Batsman" className="bg-[#0A0A0F]">BATSMAN</option>
                            <option value="Bowler" className="bg-[#0A0A0F]">BOWLER</option>
                            <option value="All Rounder" className="bg-[#0A0A0F]">ALL ROUNDER</option>
                            <option value="Wicket Keeper" className="bg-[#0A0A0F]">WICKET KEEPER</option>
                        </select>
                        {errors.player_role && <p className="text-red-400 text-[9px] font-bold uppercase ml-4 mt-1">{(errors.player_role as any).message}</p>}
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-4">STRIKE ARM *</label>
                        <select {...register('batting_arm')} className="input-cyber appearance-none">
                            <option value="" className="bg-[#0A0A0F]">SELECT L/R</option>
                            <option value="Right" className="bg-[#0A0A0F]">RIGHT HANDED</option>
                            <option value="Left" className="bg-[#0A0A0F]">LEFT HANDED</option>
                        </select>
                        {errors.batting_arm && <p className="text-red-400 text-[9px] font-bold uppercase ml-4 mt-1">{(errors.batting_arm as any).message}</p>}
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-4">ARMOR SCALE *</label>
                        <select {...register('tshirt_size')} className="input-cyber appearance-none">
                            <option value="" className="bg-[#0A0A0F]">SELECT SIZE</option>
                            <option value="XS" className="bg-[#0A0A0F]">XS</option>
                            <option value="S" className="bg-[#0A0A0F]">S</option>
                            <option value="M" className="bg-[#0A0A0F]">M</option>
                            <option value="L" className="bg-[#0A0A0F]">L</option>
                            <option value="XL" className="bg-[#0A0A0F]">XL</option>
                            <option value="XXL" className="bg-[#0A0A0F]">XXL</option>
                            <option value="XXXL" className="bg-[#0A0A0F]">XXXL</option>
                        </select>
                        {errors.tshirt_size && <p className="text-red-400 text-[9px] font-bold uppercase ml-4 mt-1">{(errors.tshirt_size as any).message}</p>}
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-4">DEPLOYMENT UNIT</label>
                        <input {...register('first_preference')} type="text" className="input-cyber" placeholder="TAG / UNIT PREFERENCE" />
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-8 rounded-[2rem] border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-widest text-center animate-shake backdrop-blur-md">
                    {error}
                </div>
            )}

            {/* Submit */}
            <div className="pt-12 pb-24 space-y-8">
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-cyber w-full py-8 text-3xl font-black tracking-tighter flex items-center justify-center gap-6 disabled:opacity-50 h-auto glow-primary"
                >
                    {loading ? (
                        <><Loader2 className="w-12 h-12 animate-spin" /> SYNCHRONIZING...</>
                    ) : fee === 0 ? (
                        <><CheckCircle2 className="w-10 h-10" /> FINALIZE DEPLOYMENT</>
                    ) : (
                        <>PROCEED TO CLEARANCE (₹{fee})</>
                    )}
                </button>
                <div className="text-center group">
                    <p className="inline-block py-2 px-6 rounded-full bg-white/5 border border-white/5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 italic group-hover:text-white/40 group-hover:bg-white/10 transition-all">
                        BY DEPLOYING, YOU AGREE TO ALL PLATFORM MANIFESTOS & BATTLE TERMS.
                    </p>
                </div>
            </div>

            {/* Razorpay Script injection */}
            <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
        </form>
    )
}
