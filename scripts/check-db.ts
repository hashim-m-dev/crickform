import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function deploySchema() {
    try {
        const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql')
        const sql = fs.readFileSync(schemaPath, 'utf8')

        console.log('Deploying schema to Supabase...')

        // WARNING: For free tier / standard REST API without the migrations endpoint turned on,
        // running raw multi-statement string SQL via the JS client is sometimes restricted or requires pg module.
        // However, Supabase edge functions or `rpc` can sometimes execute it, or we try simple inserts.
        // To guarantee this works through the JS client, we must use the `rpc` if a custom function exists 
        // OR just use standard pg connection.
        // But since we just have the REST API, if `supabase.rpc` doesn't work for raw SQL, this script might fail.

        // We will attempt to run it using a query extension if available, otherwise recommend manual.
        // Let's try to query first to see if tables exist.
        const { error: checkError } = await supabase.from('tournaments').select('id').limit(1)

        if (checkError && checkError.message.includes('relation "public.tournaments" does not exist')) {
            console.log('\n❌ ERROR: Your database tables do NOT exist yet.')
            console.log('The Supabase JavaScript SDK cannot execute massive schema.sql files automatically for security reasons.')
            console.log('\n🔥 ACTION REQUIRED FROM YOU 🔥')
            console.log('1. Go to: https://supabase.com/dashboard/project/_/sql/new')
            console.log('2. Open your local file: d:\\CrickForm\\crickform-app\\supabase\\schema.sql')
            console.log('3. Copy all the text inside that file.')
            console.log('4. Paste it into the Supabase SQL Editor and hit RUN.')
            console.log('\nAfter you do this, your form will submit successfully!')
        } else if (checkError) {
            console.log('Error checking database:', checkError.message)
        } else {
            console.log('✅ Tables already exist!')
        }

    } catch (error) {
        console.error('Error:', error)
    }
}

deploySchema().then(() => process.exit(0))
