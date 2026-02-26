-- ============================================
-- Supabase Setup pro Client Management
-- ============================================
-- Tento skript nastaví potřebné struktury pro správu klientů
-- Spusťte ho v SQL Editoru v Supabase Dashboard

-- 1. Přidat sloupec logo_url do tabulky organizations (pokud ještě neexistuje)
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Vytvořit Storage bucket pro loga klientů
-- POZNÁMKA: Toto musíte udělat ručně v Supabase Dashboard:
-- Storage -> Create bucket -> název: "client-logos" -> Public bucket

-- 3. Nastavit RLS policies pro Storage bucket (pokud je bucket vytvořen)
-- POZNÁMKA: Tyto příkazy spusťte po vytvoření bucketu v Storage sekci

-- Povolit čtení pro všechny autentizované uživatele
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('client-logos', 'client-logos', true)
-- ON CONFLICT (id) DO NOTHING;

-- Policy pro čtení (veřejné obrázky)
-- CREATE POLICY "Veřejné čtení log"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'client-logos');

-- Policy pro upload (pouze admini)
-- CREATE POLICY "Admini mohou nahrávat loga"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'client-logos' AND
--   auth.uid() IN (
--     SELECT user_id FROM org_members WHERE role = 'admin'
--   )
-- );

-- Policy pro update (pouze admini)
-- CREATE POLICY "Admini mohou aktualizovat loga"
-- ON storage.objects FOR UPDATE
-- USING (
--   bucket_id = 'client-logos' AND
--   auth.uid() IN (
--     SELECT user_id FROM org_members WHERE role = 'admin'
--   )
-- );

-- Policy pro delete (pouze admini)
-- CREATE POLICY "Admini mohou mazat loga"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'client-logos' AND
--   auth.uid() IN (
--     SELECT user_id FROM org_members WHERE role = 'admin'
--   )
-- );

-- ============================================
-- RLS Policies pro organizations tabulku
-- ============================================

-- Zapnout RLS na organizations tabulce
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Policy: Admini mohou číst všechny organizace
CREATE POLICY "Admini vidí všechny organizace"
ON organizations
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM org_members WHERE role = 'admin'
  )
);

-- Policy: Admini mohou vytvářet organizace
CREATE POLICY "Admini mohou vytvářet organizace"
ON organizations
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM org_members WHERE role = 'admin'
  )
);

-- Policy: Admini mohou upravovat organizace
CREATE POLICY "Admini mohou upravovat organizace"
ON organizations
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM org_members WHERE role = 'admin'
  )
);

-- Policy: Admini mohou mazat organizace
CREATE POLICY "Admini mohou mazat organizace"
ON organizations
FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM org_members WHERE role = 'admin'
  )
);

-- ============================================
-- Poznámky
-- ============================================
-- 1. Storage bucket musí být vytvořen ručně v Supabase Dashboard
-- 2. Po vytvoření bucketu spusťte Storage policies (odkomentujte příkazy výše)
-- 3. Ujistěte se, že máte alespoň jednoho uživatele s role = 'admin' v org_members
-- 4. Test: Přihlaste se jako admin a zkuste vytvořit/editovat organizaci
