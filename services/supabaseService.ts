
import { supabase } from '@/app/integrations/supabase/client';
import { Client, Company, F24, Document } from '@/types';

export class SupabaseService {
  private static instance: SupabaseService;

  private constructor() {}

  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  // ===== AUTHENTICATION =====

  async login(username: string, password: string): Promise<Client | null> {
    try {
      console.log('Attempting login for username:', username);
      
      const { data, error } = await supabase
        .from('clienti')
        .select('*')
        .eq('nome_utente', username)
        .eq('password', password)
        .single();

      if (error) {
        console.error('Login error:', error);
        return null;
      }

      if (!data) {
        console.log('No user found');
        return null;
      }

      console.log('Login successful');
      return {
        idCliente: data.id_cliente,
        nomeUtente: data.nome_utente,
        password: data.password,
        nomeCompleto: data.nome_completo,
      };
    } catch (error) {
      console.error('Login exception:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    console.log('User logged out');
  }

  // ===== PUSH NOTIFICATIONS =====

  async updatePushToken(userId: string, token: string | null): Promise<boolean> {
    try {
      console.log('Updating push token for user:', userId);
      
      const { error } = await supabase
        .from('clienti')
        .update({ push_token: token })
        .eq('id_cliente', userId);

      if (error) {
        console.error('Error updating push token:', error);
        throw error;
      }

      console.log('Push token updated successfully');
      return true;
    } catch (error) {
      console.error('Error in updatePushToken:', error);
      throw error;
    }
  }

  async getPushTokensByPiva(piva: string): Promise<string[]> {
    try {
      console.log('Getting push tokens for P.IVA:', piva);
      
      // Get the company
      const { data: company, error: companyError } = await supabase
        .from('aziende')
        .select('id_cliente_associato')
        .eq('partita_iva', piva)
        .single();

      if (companyError || !company || !company.id_cliente_associato) {
        console.log('No associated client found');
        return [];
      }

      // Get the client's push token
      const { data: client, error: clientError } = await supabase
        .from('clienti')
        .select('push_token')
        .eq('id_cliente', company.id_cliente_associato)
        .single();

      if (clientError || !client || !client.push_token) {
        console.log('No push token found');
        return [];
      }

      return [client.push_token];
    } catch (error) {
      console.error('Error in getPushTokensByPiva:', error);
      return [];
    }
  }

  // ===== CLIENTI =====

  async getClients(): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('clienti')
        .select('*')
        .order('nome_completo');

      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }

      return (data || []).map(row => ({
        idCliente: row.id_cliente,
        nomeUtente: row.nome_utente,
        password: row.password,
        nomeCompleto: row.nome_completo,
      }));
    } catch (error) {
      console.error('Error in getClients:', error);
      throw error;
    }
  }

  async getClientByUsername(username: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clienti')
        .select('*')
        .eq('nome_utente', username)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        idCliente: data.id_cliente,
        nomeUtente: data.nome_utente,
        password: data.password,
        nomeCompleto: data.nome_completo,
      };
    } catch (error) {
      console.error('Error in getClientByUsername:', error);
      return null;
    }
  }

  // ===== AZIENDE =====

  async getCompanies(): Promise<Company[]> {
    try {
      const { data, error } = await supabase
        .from('aziende')
        .select('*')
        .order('denominazione');

      if (error) {
        console.error('Error fetching companies:', error);
        throw error;
      }

      return (data || []).map(row => ({
        idAzienda: row.id_azienda,
        partitaIva: row.partita_iva,
        denominazione: row.denominazione,
        idClienteAssociato: row.id_cliente_associato,
      }));
    } catch (error) {
      console.error('Error in getCompanies:', error);
      throw error;
    }
  }

  async getCompaniesByClientId(clientId: string): Promise<Company[]> {
    try {
      const { data, error } = await supabase
        .from('aziende')
        .select('*')
        .eq('id_cliente_associato', clientId)
        .order('denominazione');

      if (error) {
        console.error('Error fetching companies by client:', error);
        throw error;
      }

      return (data || []).map(row => ({
        idAzienda: row.id_azienda,
        partitaIva: row.partita_iva,
        denominazione: row.denominazione,
        idClienteAssociato: row.id_cliente_associato,
      }));
    } catch (error) {
      console.error('Error in getCompaniesByClientId:', error);
      throw error;
    }
  }

  async getCompanyByPiva(piva: string): Promise<Company | null> {
    try {
      const { data, error } = await supabase
        .from('aziende')
        .select('*')
        .eq('partita_iva', piva)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        idAzienda: data.id_azienda,
        partitaIva: data.partita_iva,
        denominazione: data.denominazione,
        idClienteAssociato: data.id_cliente_associato,
      };
    } catch (error) {
      console.error('Error in getCompanyByPiva:', error);
      return null;
    }
  }

  async associateCompanyToClient(piva: string, clientId: string): Promise<boolean> {
    try {
      // First check if company exists and is not already associated
      const company = await this.getCompanyByPiva(piva);
      
      if (!company) {
        throw new Error('Azienda non trovata');
      }

      if (company.idClienteAssociato) {
        throw new Error('Azienda già associata a un altro cliente');
      }

      const { error } = await supabase
        .from('aziende')
        .update({ id_cliente_associato: clientId })
        .eq('partita_iva', piva);

      if (error) {
        console.error('Error associating company:', error);
        throw error;
      }

      console.log('Company associated successfully');
      return true;
    } catch (error) {
      console.error('Error in associateCompanyToClient:', error);
      throw error;
    }
  }

  async removeCompanyAssociation(piva: string, clientId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('aziende')
        .update({ id_cliente_associato: null })
        .eq('partita_iva', piva)
        .eq('id_cliente_associato', clientId);

      if (error) {
        console.error('Error removing company association:', error);
        throw error;
      }

      console.log('Company association removed successfully');
      return true;
    } catch (error) {
      console.error('Error in removeCompanyAssociation:', error);
      throw error;
    }
  }

  // ===== F24 =====

  async getF24s(): Promise<F24[]> {
    try {
      const { data, error } = await supabase
        .from('scadenze_f24')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching F24s:', error);
        throw error;
      }

      return (data || []).map(row => ({
        idF24: row.id_f24,
        partitaIvaAzienda: row.partita_iva_azienda,
        descrizione: row.descrizione,
        importo: parseFloat(row.importo),
        linkPdf: row.link_pdf || '',
        stato: row.stato as F24['stato'],
        importoPagato: row.importo_pagato ? parseFloat(row.importo_pagato) : undefined,
      }));
    } catch (error) {
      console.error('Error in getF24s:', error);
      throw error;
    }
  }

  async getF24sByPiva(piva: string): Promise<F24[]> {
    try {
      const { data, error } = await supabase
        .from('scadenze_f24')
        .select('*')
        .eq('partita_iva_azienda', piva)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching F24s by piva:', error);
        throw error;
      }

      return (data || []).map(row => ({
        idF24: row.id_f24,
        partitaIvaAzienda: row.partita_iva_azienda,
        descrizione: row.descrizione,
        importo: parseFloat(row.importo),
        linkPdf: row.link_pdf || '',
        stato: row.stato as F24['stato'],
        importoPagato: row.importo_pagato ? parseFloat(row.importo_pagato) : undefined,
      }));
    } catch (error) {
      console.error('Error in getF24sByPiva:', error);
      throw error;
    }
  }

  async updateF24Status(
    f24Id: string,
    stato: F24['stato'],
    importoPagato?: number
  ): Promise<boolean> {
    try {
      const updateData: any = { stato };
      
      if (importoPagato !== undefined) {
        updateData.importo_pagato = importoPagato;
      }

      const { error } = await supabase
        .from('scadenze_f24')
        .update(updateData)
        .eq('id_f24', f24Id);

      if (error) {
        console.error('Error updating F24 status:', error);
        throw error;
      }

      console.log('F24 status updated successfully');
      return true;
    } catch (error) {
      console.error('Error in updateF24Status:', error);
      throw error;
    }
  }

  // ===== DOCUMENTI =====

  async getDocuments(): Promise<Document[]> {
    try {
      const { data, error } = await supabase
        .from('documenti')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }

      return (data || []).map(row => ({
        idDocumento: row.id_documento,
        partitaIvaAzienda: row.partita_iva_azienda,
        descrizione: row.descrizione,
        linkPdf: row.link_pdf,
      }));
    } catch (error) {
      console.error('Error in getDocuments:', error);
      throw error;
    }
  }

  async getDocumentsByPiva(piva: string): Promise<Document[]> {
    try {
      const { data, error } = await supabase
        .from('documenti')
        .select('*')
        .eq('partita_iva_azienda', piva)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents by piva:', error);
        throw error;
      }

      return (data || []).map(row => ({
        idDocumento: row.id_documento,
        partitaIvaAzienda: row.partita_iva_azienda,
        descrizione: row.descrizione,
        linkPdf: row.link_pdf,
      }));
    } catch (error) {
      console.error('Error in getDocumentsByPiva:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const supabaseService = SupabaseService.getInstance();
