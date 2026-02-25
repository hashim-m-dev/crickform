import { requireSuperAdmin } from '@/lib/auth'
import AdminSupportInbox from './AdminSupportInbox'

export default async function SupportInboxPage() {
    const { profile } = await requireSuperAdmin()

    return <AdminSupportInbox adminId={profile.id} />
}
