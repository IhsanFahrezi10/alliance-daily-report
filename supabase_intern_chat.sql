-- ==============================================================================
-- MIGRATION: Fitur Chat Global Khusus Anak Intern
-- Tabel: intern_messages
-- Jalankan query ini di Supabase SQL Editor (Dashboard Supabase -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Buat tabel intern_messages
CREATE TABLE IF NOT EXISTS public.intern_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mentions JSONB DEFAULT '[]'::jsonb,
  reactions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 2. Indexes untuk performa query cepat
CREATE INDEX IF NOT EXISTS idx_intern_messages_created_at ON public.intern_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_intern_messages_user_id ON public.intern_messages (user_id);
CREATE INDEX IF NOT EXISTS idx_intern_messages_deleted_at ON public.intern_messages (deleted_at);

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE public.intern_messages ENABLE ROW LEVEL SECURITY;

-- 4. Kebijakan RLS:
-- Hanya akun dengan role 'user' (anak intern) yang dapat membaca chat
DROP POLICY IF EXISTS "Interns can read chat messages" ON public.intern_messages;
CREATE POLICY "Interns can read chat messages"
ON public.intern_messages
FOR SELECT
USING (
  deleted_at IS NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'user'
  )
);

-- Hanya akun dengan role 'user' (anak intern) yang dapat mengirim pesan
DROP POLICY IF EXISTS "Interns can insert chat messages" ON public.intern_messages;
CREATE POLICY "Interns can insert chat messages"
ON public.intern_messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'user'
  )
);

-- Pengirim dapat menghapus pesannya sendiri (soft-delete atau delete)
DROP POLICY IF EXISTS "Interns can update own messages" ON public.intern_messages;
CREATE POLICY "Interns can update own messages"
ON public.intern_messages
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Interns can delete own messages" ON public.intern_messages;
CREATE POLICY "Interns can delete own messages"
ON public.intern_messages
FOR DELETE
USING (auth.uid() = user_id);

-- 5. Aktifkan Realtime Publication agar pesan baru langsung muncul realtime tanpa refresh
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'intern_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.intern_messages;
  END IF;
END $$;

