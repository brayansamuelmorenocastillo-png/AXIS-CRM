-- =============================================
-- AXIS CRM — Run this in Supabase SQL Editor
-- Project: fephathqbimvkebplbfa.supabase.co
-- =============================================

-- 1. COMPANIES
CREATE TABLE IF NOT EXISTS public.companies (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name         TEXT NOT NULL,
  domain       TEXT,
  industry     TEXT,
  size         TEXT,
  website      TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "companies_all" ON public.companies USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. CONTACTS
CREATE TABLE IF NOT EXISTS public.contacts (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name         TEXT NOT NULL,
  email        TEXT,
  phone        TEXT,
  title        TEXT,
  company_id   UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  tags         TEXT[] DEFAULT '{}',
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contacts_all" ON public.contacts USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. PIPELINE STAGES (shared)
CREATE TABLE IF NOT EXISTS public.pipeline_stages (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  color        TEXT NOT NULL DEFAULT '#6ea8fe',
  order_index  INTEGER NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stages_read" ON public.pipeline_stages FOR SELECT TO authenticated USING (true);

INSERT INTO public.pipeline_stages (name, color, order_index) VALUES
  ('Lead',        '#8b96a5', 0),
  ('Qualified',   '#6ea8fe', 1),
  ('Proposal',    '#a371f7', 2),
  ('Negotiation', '#d29922', 3),
  ('Closed Won',  '#3fb950', 4),
  ('Closed Lost', '#f85149', 5)
ON CONFLICT DO NOTHING;

-- 4. DEALS
CREATE TABLE IF NOT EXISTS public.deals (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title           TEXT NOT NULL,
  value           DECIMAL(12,2) DEFAULT 0,
  stage_id        UUID REFERENCES public.pipeline_stages(id),
  contact_id      UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  company_id      UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  probability     INTEGER DEFAULT 20,
  expected_close  DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deals_all" ON public.deals USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. ACTIVITIES
CREATE TABLE IF NOT EXISTS public.activities (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note', 'task')),
  subject      TEXT NOT NULL,
  body         TEXT,
  entity_type  TEXT NOT NULL CHECK (entity_type IN ('contact', 'deal', 'company')),
  entity_id    UUID NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activities_all" ON public.activities USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. AUTO-UPDATE updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER contacts_updated_at  BEFORE UPDATE ON public.contacts  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER deals_updated_at     BEFORE UPDATE ON public.deals     FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.companies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
