import { getAuthUser } from '@/lib/auth'
import DashboardNavbar from '@/components/DashboardNavbar'
import ChatWidget from '@/components/ChatWidget'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { profile } = await getAuthUser()

    return (
        <div className="min-h-screen" style={{ background: 'var(--background)' }}>
            <DashboardNavbar profile={profile} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
            {profile && <ChatWidget userId={profile.id} />}
        </div>
    )
}
