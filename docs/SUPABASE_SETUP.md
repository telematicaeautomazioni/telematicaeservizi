
# Supabase Setup Guide

Your app has been successfully migrated to use Supabase as the backend! Here's what has been set up:

## Database Schema

The following tables have been created in your Supabase project:

### 1. `clienti` (Clients)
- `id_cliente` (UUID, Primary Key)
- `nome_utente` (TEXT, Unique) - Username
- `password` (TEXT) - Password (plain text for now)
- `nome_completo` (TEXT) - Full name
- `created_at` (TIMESTAMP)

### 2. `aziende` (Companies)
- `id_azienda` (UUID, Primary Key)
- `partita_iva` (TEXT, Unique) - VAT number
- `denominazione` (TEXT) - Company name
- `id_cliente_associato` (UUID, Foreign Key to clienti)
- `created_at` (TIMESTAMP)

### 3. `scadenze_f24` (F24 Deadlines)
- `id_f24` (UUID, Primary Key)
- `partita_iva_azienda` (TEXT, Foreign Key to aziende)
- `descrizione` (TEXT) - Description
- `importo` (DECIMAL) - Amount
- `link_pdf` (TEXT) - PDF link
- `stato` (TEXT) - Status: 'Da Pagare', 'Pagato', 'Rifiutato', 'Pagato Parzialmente'
- `importo_pagato` (DECIMAL) - Amount paid
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 4. `documenti` (Documents)
- `id_documento` (UUID, Primary Key)
- `partita_iva_azienda` (TEXT, Foreign Key to aziende)
- `descrizione` (TEXT) - Description
- `link_pdf` (TEXT) - PDF link
- `created_at` (TIMESTAMP)

## Row Level Security (RLS)

RLS has been enabled on all tables with basic policies. Currently, all authenticated users can view and update data. You may want to refine these policies based on your security requirements.

## Adding Sample Data

To test the app, you can add sample data directly in the Supabase dashboard:

### 1. Add a Client
```sql
INSERT INTO clienti (nome_utente, password, nome_completo)
VALUES ('mario.rossi', 'password123', 'Mario Rossi');
```

### 2. Add a Company
```sql
INSERT INTO aziende (partita_iva, denominazione)
VALUES ('12345678901', 'Acme Corporation');
```

### 3. Associate Company to Client
```sql
UPDATE aziende 
SET id_cliente_associato = (SELECT id_cliente FROM clienti WHERE nome_utente = 'mario.rossi')
WHERE partita_iva = '12345678901';
```

### 4. Add F24 Records
```sql
INSERT INTO scadenze_f24 (partita_iva_azienda, descrizione, importo, link_pdf, stato)
VALUES 
  ('12345678901', 'F24 Gennaio 2024', 1500.00, 'https://example.com/f24-gen.pdf', 'Da Pagare'),
  ('12345678901', 'F24 Febbraio 2024', 2000.00, 'https://example.com/f24-feb.pdf', 'Pagato');
```

### 5. Add Documents
```sql
INSERT INTO documenti (partita_iva_azienda, descrizione, link_pdf)
VALUES 
  ('12345678901', 'Bilancio 2023', 'https://example.com/bilancio-2023.pdf'),
  ('12345678901', 'Fattura 001/2024', 'https://example.com/fattura-001.pdf');
```

## Features Implemented

✅ **Authentication**: Username/password login with Supabase
✅ **Company Association**: Users can associate multiple P.IVA
✅ **F24 Management**: View and update F24 status (Accept, Reject, Partial)
✅ **Document Management**: View and download documents
✅ **Account Management**: Add/remove P.IVA associations and logout
✅ **Real-time Ready**: The database is set up for real-time subscriptions (can be added later)

## Next Steps

1. **Add Sample Data**: Use the SQL queries above to add test data
2. **Test the App**: Login with the test credentials
3. **Customize RLS Policies**: Refine security policies based on your needs
4. **Add Real-time Updates**: Implement Supabase real-time subscriptions for live updates
5. **Implement Push Notifications**: Set up Firebase or Supabase Edge Functions for notifications
6. **Secure Passwords**: Consider using Supabase Auth for proper password hashing

## Security Considerations

⚠️ **Important**: The current implementation stores passwords in plain text. For production use, you should:
- Use Supabase Auth for proper authentication
- Implement password hashing
- Add email verification
- Implement proper session management

## Supabase Dashboard

Access your Supabase project at:
https://supabase.com/dashboard/project/zcqcbyqbmzsvjlyuhjlp

From there you can:
- View and edit data in the Table Editor
- Run SQL queries in the SQL Editor
- Monitor API usage
- Configure authentication settings
- Set up storage for PDF files
