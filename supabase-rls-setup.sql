-- ============================================
-- Supabase RLS (Row Level Security) Setup
-- ============================================
-- Tento skript nastaví automatické filtrování dat podle organizace uživatele
-- Spusťte ho v SQL Editoru v Supabase Dashboard

-- 1. Zapneme RLS na tabulce chat_logs (pokud už není zapnuté)
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- 2. Vytvoříme Policy pro čtení (SELECT) - uživatelé vidí jen chaty své organizace
CREATE POLICY "Uživatelé vidí jen chaty své organizace"
ON chat_logs
FOR SELECT
USING (
  org_id IN (
    SELECT org_id 
    FROM org_members 
    WHERE user_id = auth.uid()
  )
);

-- 3. (Volitelné) Pokud chcete, aby uživatelé mohli také vkládat nové záznamy
-- CREATE POLICY "Uživatelé mohou vkládat chaty své organizace"
-- ON chat_logs
-- FOR INSERT
-- WITH CHECK (
--   org_id IN (
--     SELECT org_id 
--     FROM org_members 
--     WHERE user_id = auth.uid()
--   )
-- );

-- 4. (Volitelné) Pokud chcete, aby uživatelé mohli upravovat záznamy své organizace
-- CREATE POLICY "Uživatelé mohou upravovat chaty své organizace"
-- ON chat_logs
-- FOR UPDATE
-- USING (
--   org_id IN (
--     SELECT org_id 
--     FROM org_members 
--     WHERE user_id = auth.uid()
--   )
-- );

-- 5. (Volitelné) Pokud chcete, aby uživatelé mohli mazat záznamy své organizace
-- CREATE POLICY "Uživatelé mohou mazat chaty své organizace"
-- ON chat_logs
-- FOR DELETE
-- USING (
--   org_id IN (
--     SELECT org_id 
--     FROM org_members 
--     WHERE user_id = auth.uid()
--   )
-- );

-- ============================================
-- Testování RLS
-- ============================================
-- Po spuštění tohoto skriptu můžete otestovat:
-- 1. Přihlaste se jako uživatel z Loštic (lostice@test.cz)
-- 2. V SQL Editoru spusťte: SELECT * FROM chat_logs;
-- 3. Měli byste vidět jen záznamy s org_id = 1 (Loštice)
-- 4. Záznamy s org_id = 3 (Mořice) neuvidíte

-- ============================================
-- Poznámky
-- ============================================
-- - RLS funguje automaticky pro všechny dotazy přes Supabase client
-- - Nemusíte na frontendu filtrovat podle org_id - databáze to udělá za vás
-- - Toto je bezpečnější než filtrování na frontendu, protože nelze obejít
