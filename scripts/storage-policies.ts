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

async function setupStoragePolicies() {
    console.log('Setting up Storage Policies via Postgres REST endpoint...')

    // The storage framework in Supabase uses RLS on the storage.objects table.
    // We can't run raw DDL via the JS client easily unless we use RPC.
    // Since we created the buckets via JS, the REST API approach for creating policies
    // is to ask the user to run the SQL, OR we can try one more trick if RPC is enabled.

    // Actually, since the buckets were created via the SDK, they might be owned by the service role
    // and public access is ON, but authenticated users need INSERT permissions.

    // Let's print out the exact SQL the user needs to run to fix this securely.

    const sql = `
-- ============================================================
-- FIX: STORAGE ROW LEVEL SECURITY (RLS) POLICIES
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Allow public access to view banners
CREATE POLICY "Public Access Tournament Banners"
ON storage.objects FOR SELECT
USING ( bucket_id = 'tournament-banners' );

-- 2. Allow authenticated creators to upload banners
CREATE POLICY "Creators can upload banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'tournament-banners' );

-- 3. Allow public access to view player images
CREATE POLICY "Public Access Player Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'player-images' );

-- 4. Allow any user to upload player images (for public registration)
CREATE POLICY "Public can upload player images"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'player-images' );
  `

    console.log('\n❌ REQUIRED ACTION: Missing Storage Upload Permissions ❌')
    console.log('Your buckets were created, but Supabase blocks uploads by default for security.')
    console.log('\nPlease copy the SQL code below and run it in your Supabase SQL Editor:\n')
    console.log('--------------------------------------------------')
    console.log(sql)
    console.log('--------------------------------------------------')
    console.log('\nOnce executed, your image uploads will work perfectly!')
}

setupStoragePolicies().then(() => process.exit(0))
