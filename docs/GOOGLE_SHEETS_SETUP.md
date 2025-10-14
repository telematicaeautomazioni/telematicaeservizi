
# Configurazione Google Sheets

Questa guida ti aiuterà a configurare l'integrazione con Google Sheets per la tua app.

## Prerequisiti

- Un account Google
- Un progetto su Google Cloud Console
- Un foglio Google Sheets con i dati

## Passo 1: Creare un progetto su Google Cloud Console

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Clicca su "Crea progetto" o seleziona un progetto esistente
3. Assegna un nome al progetto (es. "Studio Commerciale App")

## Passo 2: Abilitare le API necessarie

1. Nel menu laterale, vai su "API e servizi" > "Libreria"
2. Cerca e abilita le seguenti API:
   - Google Sheets API
   - Google Drive API

## Passo 3: Creare credenziali OAuth 2.0

1. Nel menu laterale, vai su "API e servizi" > "Credenziali"
2. Clicca su "Crea credenziali" > "ID client OAuth"
3. Seleziona "Applicazione iOS" o "Applicazione Android" (o entrambi)
4. Compila i campi richiesti:
   - Nome dell'applicazione
   - Bundle ID (iOS) o Nome pacchetto (Android)
5. Clicca su "Crea"
6. Copia il **Client ID** generato

## Passo 4: Configurare gli URI di reindirizzamento

Per Expo, l'URI di reindirizzamento sarà nel formato:
- Development: `exp://localhost:8081`
- Production: `your-app-scheme://`

Aggiungi questi URI nella sezione "URI di reindirizzamento autorizzati" delle credenziali OAuth.

## Passo 5: Preparare il foglio Google Sheets

Crea un nuovo foglio Google Sheets con le seguenti schede (tabs):

### Foglio "clienti"
Colonne:
- A: idCliente (es. "C001", "C002")
- B: nomeUtente (es. "demo", "mario.rossi")
- C: password (es. "demo", "password123")
- D: nomeCompleto (es. "Demo User", "Mario Rossi")

Esempio:
```
idCliente | nomeUtente  | password    | nomeCompleto
C001      | demo        | demo        | Demo User
C002      | mario.rossi | password123 | Mario Rossi
```

### Foglio "aziende"
Colonne:
- A: idAzienda (es. "A001", "A002")
- B: partitaIva (es. "12345678901")
- C: denominazione (es. "Rossi S.r.l.")
- D: idClienteAssociato (es. "C001", lasciare vuoto se non associato)

Esempio:
```
idAzienda | partitaIva   | denominazione | idClienteAssociato
A001      | 12345678901  | Rossi S.r.l.  | 
A002      | 11111111111  | Verdi & Co.   |
```

### Foglio "scadenzeF24"
Colonne:
- A: idF24 (es. "F001", "F002")
- B: partitaIvaAzienda (es. "12345678901")
- C: descrizione (es. "IVA Trimestrale Q1 2024")
- D: importo (es. "1500.00")
- E: linkPdf (URL del PDF, es. "https://example.com/f24_001.pdf")
- F: stato (es. "Da Pagare", "Pagato", "Parziale", "Rifiutato")
- G: importoPagato (es. "750.00", lasciare vuoto se non pagato)

Esempio:
```
idF24 | partitaIvaAzienda | descrizione           | importo | linkPdf                    | stato      | importoPagato
F001  | 12345678901       | IVA Trimestrale Q1    | 1500.00 | https://example.com/f1.pdf | Da Pagare  |
F002  | 12345678901       | Contributi INPS       | 2500.00 | https://example.com/f2.pdf | Pagato     | 2500.00
```

### Foglio "documenti"
Colonne:
- A: idDocumento (es. "D001", "D002")
- B: partitaIvaAzienda (es. "12345678901")
- C: descrizione (es. "Bilancio 2023")
- D: linkPdf (URL del PDF)

Esempio:
```
idDocumento | partitaIvaAzienda | descrizione      | linkPdf
D001        | 12345678901       | Bilancio 2023    | https://example.com/bilancio.pdf
D002        | 12345678901       | Visura Camerale  | https://example.com/visura.pdf
```

## Passo 6: Ottenere l'ID del foglio

1. Apri il tuo foglio Google Sheets
2. Guarda l'URL nella barra degli indirizzi
3. L'ID è la stringa tra `/d/` e `/edit`
   
   Esempio: `https://docs.google.com/spreadsheets/d/ABC123XYZ789/edit`
   
   L'ID è: `ABC123XYZ789`

## Passo 7: Configurare l'app

Apri il file `config/googleSheets.ts` e aggiorna i seguenti valori:

```typescript
export const GOOGLE_SHEETS_CONFIG = {
  // Sostituisci con il tuo Client ID da Google Cloud Console
  clientId: 'TUO_CLIENT_ID.apps.googleusercontent.com',
  
  // Sostituisci con l'ID del tuo foglio Google Sheets
  spreadsheetId: 'TUO_SPREADSHEET_ID',
  
  // Verifica che i nomi dei fogli corrispondano a quelli nel tuo Google Sheets
  sheets: {
    clients: 'clienti',
    companies: 'aziende',
    f24: 'scadenzeF24',
    documents: 'documenti',
  },
  
  // Non modificare questi valori
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ],
  
  apiEndpoint: 'https://sheets.googleapis.com/v4/spreadsheets',
};
```

Aggiorna anche lo scheme dell'app in `app.json`:

```json
{
  "expo": {
    "scheme": "your-app-scheme",
    ...
  }
}
```

## Passo 8: Condividere il foglio

1. Apri il tuo foglio Google Sheets
2. Clicca su "Condividi" in alto a destra
3. Imposta le autorizzazioni:
   - Per test: "Chiunque abbia il link può modificare"
   - Per produzione: Condividi solo con gli account Google autorizzati

## Passo 9: Testare l'integrazione

1. Avvia l'app: `npm run dev`
2. Nella schermata di login, clicca su "Accedi"
3. Verrà aperto un browser per l'autenticazione Google
4. Accedi con il tuo account Google
5. Autorizza l'app ad accedere ai tuoi fogli Google Sheets
6. Verrai reindirizzato all'app
7. Inserisci le credenziali di un utente presente nel foglio "clienti"

## Risoluzione problemi

### Errore: "redirect_uri_mismatch"
- Verifica che l'URI di reindirizzamento nelle credenziali OAuth corrisponda a quello usato dall'app
- Per Expo Go: usa `exp://localhost:8081`
- Per build standalone: usa il tuo custom scheme

### Errore: "API not enabled"
- Verifica di aver abilitato Google Sheets API e Google Drive API nel progetto Google Cloud

### Errore: "Permission denied"
- Verifica che il foglio Google Sheets sia condiviso con l'account Google che stai usando per l'autenticazione
- Verifica che gli scopes OAuth includano i permessi necessari

### I dati non vengono caricati
- Verifica che i nomi dei fogli in `config/googleSheets.ts` corrispondano esattamente a quelli nel tuo Google Sheets
- Verifica che le colonne siano nell'ordine corretto
- Controlla la console per eventuali errori

## Note di sicurezza

⚠️ **IMPORTANTE**: 
- Non condividere mai il tuo Client ID pubblicamente
- Non committare credenziali nel repository
- In produzione, usa un backend server per gestire le chiamate API
- Implementa la validazione lato server per maggiore sicurezza
- Considera l'uso di Service Accounts per l'accesso programmatico

## Prossimi passi

Una volta configurato Google Sheets, puoi:
- Aggiungere nuovi clienti direttamente nel foglio
- Aggiungere nuove aziende e associarle ai clienti
- Inserire nuovi F24 e documenti
- Modificare gli stati degli F24 dall'app

Tutti i cambiamenti saranno sincronizzati in tempo reale tra l'app e Google Sheets!
