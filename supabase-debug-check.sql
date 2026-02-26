-- ============================================
-- Debug SQL skript pro kontrolu RLS nastavení
-- ============================================
-- Spusťte tyto dotazy v SQL Editoru v Supabase pro kontrolu, proč se data nenačítají

-- 1. Zkontrolujte, jestli je RLS zapnuté na tabulce chat_logs
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename = 'chat_logs';

-- 2. Zkontrolujte všechny RLS policies na tabulce chat_logs
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'chat_logs';

-- 3. Zkontrolujte, jestli existují data v chat_logs (jako admin)
SELECT COUNT(*) as total_records, 
       COUNT(DISTINCT org_id) as distinct_orgs
FROM chat_logs;

-- 4. Zkontrolujte, jestli je uživatel v org_members
-- Nahraďte 'USER_ID_HERE' skutečným ID uživatele z auth.users
SELECT 
  om.user_id,
  om.org_id,
  o.name as org_name,
  u.email
FROM org_members om
JOIN organizations o ON om.org_id = o.id
JOIN auth.users u ON om.user_id = u.id
WHERE om.user_id = 'USER_ID_HERE'; -- Nahraďte skutečným user_id

-- 5. Zkontrolujte, jaká data vidí konkrétní uživatel (simulace RLS)
-- Nahraďte 'USER_ID_HERE' skutečným ID uživatele
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claim.sub TO 'USER_ID_HERE';

SELECT COUNT(*) as visible_records
FROM chat_logs;

-- 6. Zkontrolujte strukturu tabulky chat_logs
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'chat_logs'
ORDER BY ordinal_position;

-- ============================================
-- Časté problémy a řešení:
-- ============================================
-- 
-- PROBLÉM 1: RLS není zapnuté
-- ŘEŠENÍ: Spusťte: ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;
--
-- PROBLÉM 2: Neexistuje RLS policy
-- ŘEŠENÍ: Spusťte SQL z supabase-rls-setup.sql
--
-- PROBLÉM 3: Uživatel není v org_members
-- ŘEŠENÍ: Přidejte záznam:
--   INSERT INTO org_members (user_id, org_id)
--   VALUES ('user-uuid', org_id);
--
-- PROBLÉM 4: chat_logs nemá správný org_id
-- ŘEŠENÍ: Zkontrolujte, jestli všechny záznamy v chat_logs mají správný org_id
--
-- PROBLÉM 5: Session není aktivní
-- ŘEŠENÍ: Zkontrolujte v konzoli prohlížeče, jestli je session nastavená
