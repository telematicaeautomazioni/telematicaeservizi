
# Guida Rapida - Integrazione Google Sheets

## Setup Veloce (5 minuti)

### 1. Google Cloud Console
```
1. Vai su https://console.cloud.google.com/
2. Crea un nuovo progetto
3. Abilita "Google Sheets API" e "Google Drive API"
4. Crea credenziali OAuth 2.0 per app mobile
5. Copia il Client ID
```

### 2. Google Sheets
```
1. Crea un nuovo foglio Google Sheets
2. Crea 4 schede: clienti, aziende, scadenzeF24, documenti
3. Aggiungi le intestazioni come da documentazione
4. Copia l'ID del foglio dall'URL
```

### 3. Configurazione App
```typescript
// config/googleSheets.ts
export const GOOGLE_SHEETS_CONFIG = {
  clientId: 'IL_TUO_CLIENT_ID.apps.googleusercontent.com',
  spreadsheetId: 'IL_TUO_SPREADSHEET_ID',
  ...
};
```

```json
// app.json
{
  "expo": {
    "scheme": "studio-commerciale"
  }
}
```

### 4. Dati di Test

Aggiungi questi dati nel foglio "clienti":
```
idCliente | nomeUtente | password | nomeCompleto
C001      | demo       | demo     | Demo User
```

Aggiungi questi dati nel foglio "aziende":
```
idAzienda | partitaIva  | denominazione | idClienteAssociato
A001      | 12345678901 | Rossi S.r.l.  | 
```

### 5. Avvia l'App
```bash
npm run dev
```

### 6. Testa
```
1. Apri l'app
2. Clicca "Accedi"
3. Autorizza con Google
4. Login: demo / demo
5. Associa P.IVA: 12345678901
```

## Struttura Fogli Google Sheets

### clienti
```
A: idCliente
B: nomeUtente
C: password
D: nomeCompleto
```

### aziende
```
A: idAzienda
B: partitaIva (11 cifre)
C: denominazione
D: idClienteAssociato (FK a clienti.idCliente)
```

### scadenzeF24
```
A: idF24
B: partitaIvaAzienda (FK a aziende.partitaIva)
C: descrizione
D: importo (numero)
E: linkPdf (URL)
F: stato ("Da Pagare", "Pagato", "Parziale", "Rifiutato")
G: importoPagato (numero, opzionale)
```

### documenti
```
A: idDocumento
B: partitaIvaAzienda (FK a aziende.partitaIva)
C: descrizione
D: linkPdf (URL)
```

## Funzionalità Implementate

✅ Autenticazione OAuth2 con Google
✅ Lettura dati da Google Sheets
✅ Scrittura dati su Google Sheets
✅ Login utenti
✅ Associazione P.IVA
✅ Visualizzazione F24 e Documenti
✅ Aggiornamento stato F24
✅ Gestione account
✅ Refresh automatico token

## Prossimi Sviluppi

- [ ] Notifiche push per nuovi F24
- [ ] Cache locale dei dati
- [ ] Modalità offline
- [ ] Upload documenti
- [ ] Firma digitale F24
- [ ] Export PDF
- [ ] Statistiche e grafici

## Supporto

Per problemi o domande, consulta la documentazione completa in `docs/GOOGLE_SHEETS_SETUP.md`
