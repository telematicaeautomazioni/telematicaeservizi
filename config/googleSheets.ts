
// Configurazione per Google Sheets API
export const GOOGLE_SHEETS_CONFIG = {
  // IMPORTANTE: Sostituisci questi valori con le tue credenziali da Google Cloud Console
  clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
  
  // ID del tuo foglio Google Sheets
  spreadsheetId: 'YOUR_SPREADSHEET_ID',
  
  // Nomi dei fogli (tabs) nel tuo Google Sheets
  sheets: {
    clients: 'clienti',
    companies: 'aziende',
    f24: 'scadenzeF24',
    documents: 'documenti',
  },
  
  // Scopes necessari per leggere e scrivere su Google Sheets
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ],
  
  // Endpoint dell'API
  apiEndpoint: 'https://sheets.googleapis.com/v4/spreadsheets',
};

// Configurazione OAuth2
export const OAUTH_CONFIG = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};
