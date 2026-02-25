import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type UserRole = 'CREATOR' | 'SUPER_ADMIN'

export interface UserProfile {
    id: string
    email: string
    full_name: string | null
    role: UserRole
    is_suspended: boolean
    created_at: string
}

/**
 * Get the current authenticated user and their profile.
 * Redirects to /login if not authenticated.
 */
export async function getAuthUser() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Fallback if the database trigger failed (e.g. user didn't run schema.sql)
    const safeProfile = profile || {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || '',
        role: 'CREATOR',
        is_suspended: false,
        created_at: new Date().toISOString()
    }

    return { user, profile: safeProfile as UserProfile }
}

/**
 * Get the current user without redirecting (for optional auth checks)
 */
export async function getOptionalUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const safeProfile = profile || {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || '',
        role: 'CREATOR',
        is_suspended: false,
        created_at: new Date().toISOString()
    }

    return { user, profile: safeProfile as UserProfile }
}

/**
 * Require SUPER_ADMIN role. Redirects to /dashboard if not admin.
 */
export async function requireSuperAdmin() {
    const { user, profile } = await getAuthUser()

    if (!profile || profile.role !== 'SUPER_ADMIN') {
        redirect('/dashboard')
    }

    return { user, profile }
}
