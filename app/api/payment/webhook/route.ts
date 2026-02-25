import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: Request) {
    try {
        const bodyText = await request.text()

        const signature = request.headers.get('x-razorpay-signature')
        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
        }

        // Verify signature
        const secret = process.env.RAZORPAY_KEY_SECRET!
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(bodyText)
            .digest('hex')

        if (expectedSignature !== signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

        const event = JSON.parse(bodyText)

        // Handle payment.captured or payment.authorized
        if (event.event === 'payment.captured' || event.event === 'payment.authorized') {
            const payment = event.payload.payment.entity
            const orderId = payment.order_id
            const paymentId = payment.id
            const amountInRupees = payment.amount / 100

            const { player_id, tournament_id, creator_id } = payment.notes

            const supabase = createServiceClient()

            // Calculate commission logic here if needed (e.g. 5%)
            const commissionPercent = Number(process.env.PLATFORM_COMMISSION_PERCENT || 0)
            const platform_commission = (amountInRupees * commissionPercent) / 100
            const creator_earning = amountInRupees - platform_commission

            // 1. Insert/Update payment record
            await supabase.from('payments').upsert({
                razorpay_order_id: orderId,
                razorpay_payment_id: paymentId,
                razorpay_signature: signature,
                tournament_id,
                player_id,
                creator_id,
                amount: amountInRupees,
                platform_commission,
                creator_earning,
                status: 'PAID'
            }, { onConflict: 'razorpay_payment_id' })

            // 2. Update player status to PAID
            await supabase
                .from('players')
                .update({
                    payment_status: 'PAID',
                    payment_id: paymentId
                })
                .eq('id', player_id)
        }

        return NextResponse.json({ status: 'ok' })
    } catch (error: any) {
        console.error('Webhook Error:', error)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}
