import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export async function POST(request: Request) {
    try {
        const { player_id, tournament_id, creator_id, amount } = await request.json()

        if (!player_id || !tournament_id || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        })

        // Amount should be in paise for INR
        const options = {
            amount: amount * 100, // amount in paise
            currency: "INR",
            receipt: `rcpt_${player_id.substring(0, 8)}`,
            notes: {
                player_id,
                tournament_id,
                creator_id
            }
        }

        const order = await razorpay.orders.create(options)

        return NextResponse.json(order)
    } catch (error: any) {
        console.error('Error creating Razorpay order:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create order' },
            { status: 500 }
        )
    }
}
