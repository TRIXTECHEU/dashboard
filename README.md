# Dashboard s Supabase RLS

Moderní React dashboard s Supabase autentizací a automatickým filtrováním dat pomocí Row Level Security (RLS).

## Instalace

```bash
npm install
```

## Konfigurace Supabase

1. Vytvořte projekt v [Supabase](https://supabase.com)
2. Získejte vaše API credentials:
   - Jděte do **Project Settings** → **API**
   - Zkopírujte **Project URL** a **anon/public key**
3. Vytvořte soubor `.env` v kořenovém adresáři:
   ```bash
   cp .env.example .env
   ```
4. Vyplňte `.env` soubor:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## Nastavení RLS (Row Level Security)

**DŮLEŽITÉ:** Před použitím aplikace musíte nastavit RLS policies v Supabase!

1. Otevřete **SQL Editor** v Supabase Dashboard
2. Spusťte SQL skript ze souboru `supabase-rls-setup.sql`
3. Tento skript nastaví automatické filtrování dat podle organizace uživatele

## Nastavení Client Management (Admin Only)

**Pro správu klientů potřebujete:**

1. **Storage Bucket pro loga:**
   - Jděte do **Storage** v Supabase Dashboard
   - Klikněte na **Create bucket**
   - Název: `client-logos`
   - Nastavte jako **Public bucket** (aby byly obrázky přístupné)
   - Vytvořte bucket

2. **SQL Setup:**
   - Otevřete **SQL Editor** v Supabase Dashboard
   - Spusťte SQL skript ze souboru `supabase-clients-setup.sql`
   - Tento skript:
     - Přidá sloupec `logo_url` do tabulky `organizations`
     - Nastaví RLS policies pro `organizations` tabulku
     - Nastaví Storage policies pro `client-logos` bucket (odkomentujte příkazy po vytvoření bucketu)

3. **Role Setup:**
   - Ujistěte se, že máte alespoň jednoho uživatele s `role = 'admin'` v tabulce `org_members`
   - Pouze admini mají přístup k sekci "Klienti"

### Co RLS dělá?

- Uživatelé vidí **pouze** data své organizace
- Databáze automaticky filtruje podle `org_id` v tabulce `org_members`
- Nemusíte filtrovat na frontendu - databáze to udělá za vás
- Bezpečnější než filtrování na frontendu

## Spuštění

```bash
npm run dev
```

Aplikace poběží na `http://localhost:9000`

## Struktura databáze

Aplikace očekává následující strukturu v Supabase:

- **organizations** - Tabulka organizací (měst)
- **org_members** - Propojení uživatelů s organizacemi (`user_id`, `org_id`)
- **chat_logs** - Chat logy s `org_id` sloupcem

## Funkce

- **Supabase autentizace** - Přihlášení pomocí emailu a hesla
- **Automatické filtrování** - RLS zajišťuje, že uživatelé vidí jen data své organizace
- **Dashboard** - Přehled statistik, grafů a chat logů
- **Sidebar** - Navigační menu s různými sekcemi
- **Responzivní design** - Moderní UI s Tailwind CSS

## Struktura projektu

```
src/
  components/
    Dashboard.tsx      # Hlavní layout komponenta
    Header.tsx         # Header s uživatelským výběrem
    Sidebar.tsx        # Sidebar navigace
    Login.tsx          # Přihlašovací formulář
    StatCard.tsx       # Karty se statistikami
    Chart.tsx          # Graf komponenta
    RecentActivity.tsx # Nedávná aktivita
    DataTable.tsx      # Tabulka s chat logy
  contexts/
    AuthContext.tsx    # Supabase autentizace context
  lib/
    supabase.ts        # Supabase client konfigurace
  App.tsx              # Hlavní aplikace
  main.tsx             # Entry point
  index.css            # Globální styly
```

## Testování

1. Vytvořte uživatele v Supabase (Authentication → Users)
2. Přidejte uživatele do `org_members` s příslušným `org_id`
3. Přihlaste se do aplikace
4. Měli byste vidět pouze chat logy s `org_id` vaší organizace

## Bezpečnost

- RLS policies zajišťují, že uživatelé nemohou vidět data jiných organizací
- Všechna filtrování probíhá na úrovni databáze, ne na frontendu
- Supabase automaticky přidává `auth.uid()` do každého dotazu
