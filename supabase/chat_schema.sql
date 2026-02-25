-- ============================================================
-- SUPPORT MESSAGES TABLE (Realtime Chat)
-- ============================================================

CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;

-- Enable RLS
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- POLICIES
-- 1. Creators can view only their own message threads
CREATE POLICY "Creators can view their own threads"
  ON support_messages FOR SELECT
  USING (creator_id = auth.uid() OR get_user_role() = 'SUPER_ADMIN');

-- 2. Creators can insert messages to their own threads
CREATE POLICY "Creators can send messages"
  ON support_messages FOR INSERT
  WITH CHECK (creator_id = auth.uid());

-- 3. Super Admins can manage all messages
CREATE POLICY "Super admins can manage all support messages"
  ON support_messages FOR ALL
  USING (get_user_role() = 'SUPER_ADMIN');

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_support_messages_creator_id ON support_messages(creator_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON support_messages(created_at);

-- ============================================================
-- DATA INTEGRITY FIX (Run once)
-- Ensures all existing users have a profile record to avoid FK violations
-- ============================================================
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', ''), 'CREATOR'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
