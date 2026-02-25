import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const { pathname } = request.nextUrl

    // Protect dashboard routes - require authentication
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/create-tournament')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Protect admin routes - require SUPER_ADMIN role
    if (pathname.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Check role in the database
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || profile.role !== 'SUPER_ADMIN') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    // Redirect logged-in users away from auth pages
    if ((pathname === '/login' || pathname === '/signup') && user) {
        // Check if super admin → redirect to /admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role === 'SUPER_ADMIN') {
            return NextResponse.redirect(new URL('/admin', request.url))
        }
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
