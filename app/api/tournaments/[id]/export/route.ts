import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { toCSV } from '@/lib/utils'

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user owns tournament
    const { data: tourney } = await supabase
        .from('tournaments')
        .select('user_id')
        .eq('id', params.id)
        .single()

    if (!tourney || tourney.user_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: players, error } = await supabase
        .from('players')
        .select('*')
        .eq('tournament_id', params.id)
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format explicitly
    const csvData = players.map(p => ({
        Name: p.name,
        'Father Name': p.father_name || '',
        Mobile: p.mobile,
        Email: p.email || '',
        Category: p.category || '',
        Age: p.age || '',
        DOB: p.dob || '',
        Gender: p.gender || '',
        Occupation: p.occupation || '',
        Aadhaar: p.aadhaar || '',
        District: p.district || '',
        PIN: p.pin || '',
        Address: p.address || '',
        'Social Link': p.social_link || '',
        'T-Shirt Size': p.tshirt_size || '',
        'First Preference': p.first_preference || '',
        'Batting Arm': p.batting_arm || '',
        'Player Role': p.player_role || '',
        'Payment Status': p.payment_status,
        'Payment ID': p.payment_id || '',
        'Registered At': p.created_at,
    }))

    const csv = toCSV(csvData)

    return new NextResponse(csv, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="tournament_${params.id}_players.csv"`,
        },
    })
}
