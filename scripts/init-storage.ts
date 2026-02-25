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

async function createBuckets() {
    const bucketsToCreate = ['tournament-banners', 'player-images']

    for (const bucketName of bucketsToCreate) {
        const { data, error } = await supabase.storage.getBucket(bucketName)

        if (error && error.message.includes('The resource was not found')) {
            console.log(`Bucket '${bucketName}' not found. Creating...`)
            const { error: createError } = await supabase.storage.createBucket(bucketName, {
                public: true,
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
                fileSizeLimit: 5242880 // 5MB
            })

            if (createError) {
                console.error(`Failed to create bucket '${bucketName}':`, createError.message)
            } else {
                console.log(`✅ Successfully created public bucket: ${bucketName}`)
            }
        } else if (data) {
            console.log(`Bucket '${bucketName}' already exists.`)
            // Ensure it's public
            await supabase.storage.updateBucket(bucketName, { public: true })
            console.log(`✅ Ensured bucket '${bucketName}' is public.`)
        } else if (error) {
            console.error(`Error checking bucket '${bucketName}':`, error.message)
        }
    }
}

createBuckets().then(() => {
    console.log('Setup complete!')
    process.exit(0)
})
