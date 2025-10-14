
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { GOOGLE_SHEETS_CONFIG, OAUTH_CONFIG } from '@/config/googleSheets';
import { Client, Company, F24, Document } from '@/types';

const TOKEN_KEY = 'google_sheets_token';
const REFRESH_TOKEN_KEY = 'google_sheets_refresh_token';

export class GoogleSheetsService {
  private static instance: GoogleSheetsService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  private constructor() {}

  static getInstance(): GoogleSheetsService {
    if (!GoogleSheetsService.instance) {
      GoogleSheetsService.instance = new GoogleSheetsService();
    }
    return GoogleSheetsService.instance;
  }

  // Inizializza il servizio caricando i token salvati
  async initialize(): Promise<boolean> {
    try {
      this.accessToken = await SecureStore.getItemAsync(TOKEN_KEY);
      this.refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      return !!this.accessToken;
    } catch (error) {
      console.error('Errore durante l\'inizializzazione:', error);
      return false;
    }
  }

  // Autentica l'utente con Google OAuth2
  async authenticate(): Promise<boolean> {
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'your-app-scheme', // Sostituisci con il tuo scheme
      });

      const discovery = {
        authorizationEndpoint: OAUTH_CONFIG.authorizationEndpoint,
        tokenEndpoint: OAUTH_CONFIG.tokenEndpoint,
        revocationEndpoint: OAUTH_CONFIG.revocationEndpoint,
      };

      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_SHEETS_CONFIG.clientId,
        scopes: GOOGLE_SHEETS_CONFIG.scopes,
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
      });

      const result = await request.promptAsync(discovery);

      if (result.type === 'success') {
        const { code } = result.params;
        
        // Scambia il codice di autorizzazione con un access token
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: GOOGLE_SHEETS_CONFIG.clientId,
            code,
            redirectUri,
            extraParams: {
              code_verifier: request.codeVerifier || '',
            },
          },
          discovery
        );

        this.accessToken = tokenResponse.accessToken;
        this.refreshToken = tokenResponse.refreshToken || null;

        // Salva i token in modo sicuro
        await SecureStore.setItemAsync(TOKEN_KEY, this.accessToken);
        if (this.refreshToken) {
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, this.refreshToken);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Errore durante l\'autenticazione:', error);
      return false;
    }
  }

  // Logout - rimuove i token salvati
  async logout(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      this.accessToken = null;
      this.refreshToken = null;
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  }

  // Verifica se l'utente è autenticato
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Effettua una richiesta API a Google Sheets
  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Non autenticato. Effettua il login prima.');
    }

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (response.status === 401) {
        // Token scaduto, prova a rinnovarlo
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Riprova la richiesta con il nuovo token
          return this.makeRequest(endpoint, method, body);
        }
        throw new Error('Sessione scaduta. Effettua nuovamente il login.');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Errore nella richiesta API');
      }

      return await response.json();
    } catch (error) {
      console.error('Errore nella richiesta API:', error);
      throw error;
    }
  }

  // Rinnova l'access token usando il refresh token
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(OAUTH_CONFIG.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_SHEETS_CONFIG.clientId,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }).toString(),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      await SecureStore.setItemAsync(TOKEN_KEY, this.accessToken);

      return true;
    } catch (error) {
      console.error('Errore durante il refresh del token:', error);
      return false;
    }
  }

  // Legge i dati da un foglio specifico
  private async readSheet(sheetName: string, range?: string): Promise<any[][]> {
    const fullRange = range ? `${sheetName}!${range}` : sheetName;
    const endpoint = `${GOOGLE_SHEETS_CONFIG.apiEndpoint}/${GOOGLE_SHEETS_CONFIG.spreadsheetId}/values/${fullRange}`;
    
    const response = await this.makeRequest(endpoint);
    return response.values || [];
  }

  // Scrive dati in un foglio specifico
  private async writeSheet(
    sheetName: string,
    range: string,
    values: any[][]
  ): Promise<void> {
    const fullRange = `${sheetName}!${range}`;
    const endpoint = `${GOOGLE_SHEETS_CONFIG.apiEndpoint}/${GOOGLE_SHEETS_CONFIG.spreadsheetId}/values/${fullRange}?valueInputOption=USER_ENTERED`;
    
    await this.makeRequest(endpoint, 'PUT', {
      range: fullRange,
      values,
    });
  }

  // Aggiunge una riga a un foglio
  private async appendRow(sheetName: string, values: any[]): Promise<void> {
    const endpoint = `${GOOGLE_SHEETS_CONFIG.apiEndpoint}/${GOOGLE_SHEETS_CONFIG.spreadsheetId}/values/${sheetName}:append?valueInputOption=USER_ENTERED`;
    
    await this.makeRequest(endpoint, 'POST', {
      values: [values],
    });
  }

  // ===== METODI PER CLIENTI =====

  async getClients(): Promise<Client[]> {
    try {
      const rows = await this.readSheet(GOOGLE_SHEETS_CONFIG.sheets.clients);
      
      // Salta la prima riga (intestazioni)
      return rows.slice(1).map(row => ({
        idCliente: row[0] || '',
        nomeUtente: row[1] || '',
        password: row[2] || '',
        nomeCompleto: row[3] || '',
      }));
    } catch (error) {
      console.error('Errore nel recupero dei clienti:', error);
      throw error;
    }
  }

  async getClientByUsername(username: string): Promise<Client | null> {
    const clients = await this.getClients();
    return clients.find(c => c.nomeUtente === username) || null;
  }

  // ===== METODI PER AZIENDE =====

  async getCompanies(): Promise<Company[]> {
    try {
      const rows = await this.readSheet(GOOGLE_SHEETS_CONFIG.sheets.companies);
      
      return rows.slice(1).map(row => ({
        idAzienda: row[0] || '',
        partitaIva: row[1] || '',
        denominazione: row[2] || '',
        idClienteAssociato: row[3] || '',
      }));
    } catch (error) {
      console.error('Errore nel recupero delle aziende:', error);
      throw error;
    }
  }

  async getCompaniesByClientId(clientId: string): Promise<Company[]> {
    const companies = await this.getCompanies();
    return companies.filter(c => c.idClienteAssociato === clientId);
  }

  async getCompanyByPiva(piva: string): Promise<Company | null> {
    const companies = await this.getCompanies();
    return companies.find(c => c.partitaIva === piva) || null;
  }

  async associateCompanyToClient(piva: string, clientId: string): Promise<boolean> {
    try {
      const companies = await this.getCompanies();
      const companyIndex = companies.findIndex(c => c.partitaIva === piva);
      
      if (companyIndex === -1) {
        throw new Error('Azienda non trovata');
      }

      if (companies[companyIndex].idClienteAssociato) {
        throw new Error('Azienda già associata a un altro cliente');
      }

      // Aggiorna la riga (indice + 2 perché: +1 per intestazioni, +1 per indice base-1)
      const rowNumber = companyIndex + 2;
      await this.writeSheet(
        GOOGLE_SHEETS_CONFIG.sheets.companies,
        `D${rowNumber}`,
        [[clientId]]
      );

      return true;
    } catch (error) {
      console.error('Errore nell\'associazione dell\'azienda:', error);
      throw error;
    }
  }

  async removeCompanyAssociation(piva: string, clientId: string): Promise<boolean> {
    try {
      const companies = await this.getCompanies();
      const companyIndex = companies.findIndex(
        c => c.partitaIva === piva && c.idClienteAssociato === clientId
      );
      
      if (companyIndex === -1) {
        throw new Error('Associazione non trovata');
      }

      const rowNumber = companyIndex + 2;
      await this.writeSheet(
        GOOGLE_SHEETS_CONFIG.sheets.companies,
        `D${rowNumber}`,
        [['']]
      );

      return true;
    } catch (error) {
      console.error('Errore nella rimozione dell\'associazione:', error);
      throw error;
    }
  }

  // ===== METODI PER F24 =====

  async getF24s(): Promise<F24[]> {
    try {
      const rows = await this.readSheet(GOOGLE_SHEETS_CONFIG.sheets.f24);
      
      return rows.slice(1).map(row => ({
        idF24: row[0] || '',
        partitaIvaAzienda: row[1] || '',
        descrizione: row[2] || '',
        importo: parseFloat(row[3]) || 0,
        linkPdf: row[4] || '',
        stato: (row[5] || 'Da Pagare') as F24['stato'],
        importoPagato: row[6] ? parseFloat(row[6]) : undefined,
      }));
    } catch (error) {
      console.error('Errore nel recupero degli F24:', error);
      throw error;
    }
  }

  async getF24sByPiva(piva: string): Promise<F24[]> {
    const f24s = await this.getF24s();
    return f24s.filter(f => f.partitaIvaAzienda === piva);
  }

  async updateF24Status(
    f24Id: string,
    stato: F24['stato'],
    importoPagato?: number
  ): Promise<boolean> {
    try {
      const f24s = await this.getF24s();
      const f24Index = f24s.findIndex(f => f.idF24 === f24Id);
      
      if (f24Index === -1) {
        throw new Error('F24 non trovato');
      }

      const rowNumber = f24Index + 2;
      
      // Aggiorna stato
      await this.writeSheet(
        GOOGLE_SHEETS_CONFIG.sheets.f24,
        `F${rowNumber}`,
        [[stato]]
      );

      // Aggiorna importo pagato se fornito
      if (importoPagato !== undefined) {
        await this.writeSheet(
          GOOGLE_SHEETS_CONFIG.sheets.f24,
          `G${rowNumber}`,
          [[importoPagato]]
        );
      }

      return true;
    } catch (error) {
      console.error('Errore nell\'aggiornamento dello stato F24:', error);
      throw error;
    }
  }

  // ===== METODI PER DOCUMENTI =====

  async getDocuments(): Promise<Document[]> {
    try {
      const rows = await this.readSheet(GOOGLE_SHEETS_CONFIG.sheets.documents);
      
      return rows.slice(1).map(row => ({
        idDocumento: row[0] || '',
        partitaIvaAzienda: row[1] || '',
        descrizione: row[2] || '',
        linkPdf: row[3] || '',
      }));
    } catch (error) {
      console.error('Errore nel recupero dei documenti:', error);
      throw error;
    }
  }

  async getDocumentsByPiva(piva: string): Promise<Document[]> {
    const documents = await this.getDocuments();
    return documents.filter(d => d.partitaIvaAzienda === piva);
  }
}

// Esporta un'istanza singleton
export const googleSheetsService = GoogleSheetsService.getInstance();
