import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function backfillProfile() {
    console.log('Checking for missing user profiles...')

    try {
        // 1. Get all auth users
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()

        if (authError) throw authError

        if (users.length === 0) {
            console.log('No users found in Auth system.')
            return
        }

        console.log(`Found ${users.length} users in Auth system. Ensuring they exist in public.profiles...`)

        let backfilledCount = 0

        // 2. Safely ensure each user exists in profiles
        for (const user of users) {
            // Check if profile exists
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single()

            if (!existingProfile) {
                console.log(`- Profile missing for ${user.email}. Creating now...`)

                let role = 'CREATOR'
                if (user.email === 'hashimoffl1@gmail.com') {
                    role = 'SUPER_ADMIN'
                }

                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata?.full_name || '',
                        role: role
                    })

                if (insertError) {
                    console.error(`  ❌ Failed to create profile for ${user.email}:`, insertError.message)
                } else {
                    console.log(`  ✅ Successfully created ${role} profile for ${user.email}`)
                    backfilledCount++
                }
            } else {
                console.log(`- Profile already exists for ${user.email}.`)
            }
        }

        console.log(`\nFinished! Backfilled ${backfilledCount} missing profiles.`)
        console.log('You can now create tournaments successfully.')

    } catch (err: any) {
        console.error('Error:', err.message)
    }
}

backfillProfile().then(() => process.exit(0))
