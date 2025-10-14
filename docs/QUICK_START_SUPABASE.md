
# Quick Start Guide - Supabase Version

Your app has been successfully migrated to Supabase! Here's how to get started:

## 🚀 Test Credentials

Use these credentials to login and test the app:

**Username:** `mario.rossi`  
**Password:** `password123`

## 📊 Sample Data Loaded

The database has been populated with:
- ✅ 1 test client (Mario Rossi)
- ✅ 3 companies (1 associated with the test client)
- ✅ 4 F24 records with different statuses
- ✅ 4 sample documents

## 🎯 Testing the App

### 1. Login
- Open the app
- Enter username: `mario.rossi`
- Enter password: `password123`
- Click "Accedi"

### 2. View Dashboard
- You'll see "Acme Corporation" as the associated company
- Switch between "F24" and "Documenti" tabs
- View the sample F24 records and documents

### 3. Manage F24
- Click on an F24 card with status "Da Pagare"
- Test the action buttons:
  - **Accetta**: Marks as "Pagato"
  - **Rifiuta**: Marks as "Rifiutato"
  - **Parziale**: Opens dialog to enter partial payment amount
- Click "Apri PDF" to view the PDF (sample PDF link)

### 4. View Documents
- Switch to "Documenti" tab
- Click "Visualizza" to open any document

### 5. Account Management
- Click the settings icon (⚙️) in the top right
- View associated companies
- Add new P.IVA: `98765432109` (Beta Industries)
- Remove P.IVA associations
- Logout

## 🔧 Key Features

### Authentication
- Username/password login
- Automatic redirect based on company associations
- First-time users go to P.IVA association screen

### Company Management
- Associate multiple companies via P.IVA
- Switch between companies in dashboard
- Add/remove associations in account management

### F24 Management
- View all F24 for selected company
- Update status (Accept, Reject, Partial payment)
- Color-coded status badges
- PDF viewing

### Document Management
- View all documents for selected company
- PDF viewing/downloading
- Organized by creation date

## 📱 App Flow

```
Login Screen
    ↓
First Access? → Associate P.IVA Screen → Dashboard
    ↓
Has Companies? → Dashboard
    ↓
Dashboard (F24 / Documents tabs)
    ↓
Account Management (Settings)
```

## 🗄️ Database Structure

### Tables Created
1. **clienti** - User accounts
2. **aziende** - Companies with P.IVA
3. **scadenze_f24** - F24 tax deadlines
4. **documenti** - Company documents

### Relationships
- Companies → Clients (many-to-one)
- F24 → Companies (many-to-one via P.IVA)
- Documents → Companies (many-to-one via P.IVA)

## 🔐 Security

### Row Level Security (RLS)
- Enabled on all tables
- Basic policies allow authenticated access
- Ready for customization based on your needs

### Current Limitations
⚠️ **Note**: Passwords are stored in plain text for testing. For production:
- Implement Supabase Auth
- Use proper password hashing
- Add email verification
- Implement session management

## 🎨 UI Features

- Clean, professional design (blue, white, grays)
- Status badges with color coding:
  - 🟢 Green: "Pagato"
  - 🔴 Red: "Da Pagare"
  - 🟡 Yellow: "Pagato Parzialmente"
  - ⚫ Gray: "Rifiutato"
- Loading indicators for all async operations
- Error handling with user-friendly alerts
- Haptic feedback on important actions

## 📝 Adding More Data

### Add Another Client
```sql
INSERT INTO clienti (nome_utente, password, nome_completo)
VALUES ('luigi.verdi', 'password456', 'Luigi Verdi');
```

### Add More Companies
```sql
INSERT INTO aziende (partita_iva, denominazione)
VALUES ('55566677788', 'Delta Solutions');
```

### Associate Company to Client
```sql
UPDATE aziende 
SET id_cliente_associato = (SELECT id_cliente FROM clienti WHERE nome_utente = 'mario.rossi')
WHERE partita_iva = '55566677788';
```

## 🔄 Migration from Google Sheets

The following changes were made:
- ✅ Replaced Google Sheets API with Supabase
- ✅ Removed OAuth authentication flow
- ✅ Created proper database schema with relationships
- ✅ Implemented RLS for security
- ✅ Updated all services to use Supabase client
- ✅ Maintained all existing functionality
- ✅ Added sample data for testing

## 🚀 Next Steps

1. **Test All Features**: Go through each screen and feature
2. **Customize Data**: Add your own companies, F24s, and documents
3. **Refine RLS Policies**: Adjust security based on your requirements
4. **Add Real-time**: Implement Supabase subscriptions for live updates
5. **Implement Notifications**: Set up push notifications for new F24s
6. **Production Auth**: Migrate to Supabase Auth for secure authentication

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Dashboard](https://supabase.com/dashboard/project/zcqcbyqbmzsvjlyuhjlp)
- [React Native Supabase Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)

## 🆘 Troubleshooting

### Can't Login?
- Verify credentials: `mario.rossi` / `password123`
- Check Supabase dashboard to confirm data exists

### No Companies Showing?
- Verify company association in database
- Check that `id_cliente_associato` is set correctly

### F24/Documents Not Loading?
- Verify `partita_iva_azienda` matches company P.IVA
- Check Supabase logs for errors

### App Crashes?
- Check console logs for errors
- Verify Supabase client is properly configured
- Ensure all tables exist in database

## ✅ You're All Set!

Your app is now running on Supabase with a complete backend infrastructure. 
Start testing with the provided credentials and explore all the features!
