
import { supabase } from '@/app/integrations/supabase/client';
import { Client, Company, F24, Document, DocumentCategory, CompanyUser } from '@/types';

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
        tipoUtente: data.tipo_utente || 'decide',
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
        .select('id_azienda')
        .eq('partita_iva', piva)
        .single();

      if (companyError || !company) {
        console.log('No company found');
        return [];
      }

      // Get all users associated with this company
      const { data: companyUsers, error: usersError } = await supabase
        .from('aziende_utenti')
        .select('id_cliente')
        .eq('id_azienda', company.id_azienda);

      if (usersError || !companyUsers || companyUsers.length === 0) {
        console.log('No associated users found');
        return [];
      }

      // Get push tokens for all associated users
      const userIds = companyUsers.map(cu => cu.id_cliente);
      const { data: clients, error: clientsError } = await supabase
        .from('clienti')
        .select('push_token')
        .in('id_cliente', userIds);

      if (clientsError || !clients) {
        console.log('No push tokens found');
        return [];
      }

      return clients
        .filter(c => c.push_token)
        .map(c => c.push_token);
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
        tipoUtente: row.tipo_utente || 'decide',
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
        tipoUtente: data.tipo_utente || 'decide',
      };
    } catch (error) {
      console.error('Error in getClientByUsername:', error);
      return null;
    }
  }

  async getClientById(clientId: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clienti')
        .select('*')
        .eq('id_cliente', clientId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        idCliente: data.id_cliente,
        nomeUtente: data.nome_utente,
        password: data.password,
        nomeCompleto: data.nome_completo,
        tipoUtente: data.tipo_utente || 'decide',
      };
    } catch (error) {
      console.error('Error in getClientById:', error);
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
      // Use the new junction table to get companies
      const { data, error } = await supabase
        .from('aziende_utenti')
        .select(`
          id_azienda,
          aziende (
            id_azienda,
            partita_iva,
            denominazione,
            id_cliente_associato
          )
        `)
        .eq('id_cliente', clientId);

      if (error) {
        console.error('Error fetching companies by client:', error);
        throw error;
      }

      if (!data) {
        return [];
      }

      return data
        .filter(row => row.aziende)
        .map(row => {
          const azienda = Array.isArray(row.aziende) ? row.aziende[0] : row.aziende;
          return {
            idAzienda: azienda.id_azienda,
            partitaIva: azienda.partita_iva,
            denominazione: azienda.denominazione,
            idClienteAssociato: azienda.id_cliente_associato,
          };
        });
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
      console.log('Associating P.IVA:', piva, 'to client:', clientId);
      
      // First check if company exists
      const company = await this.getCompanyByPiva(piva);
      
      if (!company) {
        throw new Error('Azienda non trovata');
      }

      // Get the current user's type
      const currentUser = await this.getClientById(clientId);
      
      if (!currentUser) {
        throw new Error('Utente non trovato');
      }

      console.log('Current user type:', currentUser.tipoUtente);

      // Check if this user is already associated with this company
      const { data: existingAssociation, error: checkError } = await supabase
        .from('aziende_utenti')
        .select('*')
        .eq('id_azienda', company.idAzienda)
        .eq('id_cliente', clientId)
        .maybeSingle();

      if (existingAssociation) {
        throw new Error('Azienda già associata a questo utente');
      }

      // If the current user is a "decide" user, check if there's already a "decide" user associated
      if (currentUser.tipoUtente === 'decide') {
        console.log('Checking for existing "decide" users...');
        
        // Get all users associated with this company
        const { data: companyUsers, error: usersError } = await supabase
          .from('aziende_utenti')
          .select('id_cliente')
          .eq('id_azienda', company.idAzienda);

        if (usersError) {
          console.error('Error checking existing users:', usersError);
          throw usersError;
        }

        if (companyUsers && companyUsers.length > 0) {
          // Get the user types for all associated users
          const userIds = companyUsers.map(cu => cu.id_cliente);
          const { data: users, error: clientsError } = await supabase
            .from('clienti')
            .select('id_cliente, tipo_utente')
            .in('id_cliente', userIds);

          if (clientsError) {
            console.error('Error fetching user types:', clientsError);
            throw clientsError;
          }

          // Check if any of them is a "decide" user
          const hasDecideUser = users?.some(u => u.tipo_utente === 'decide');
          
          if (hasDecideUser) {
            console.log('Company already has a "decide" user');
            throw new Error('Questa P.IVA è già associata a un utente decisionale. Una P.IVA può avere solo un utente decisionale, ma infiniti utenti di visualizzazione.');
          }
        }
      }

      // If we get here, the association is allowed
      // For "visualizza" users: always allowed
      // For "decide" users: only if no other "decide" user exists
      console.log('Creating association...');
      
      const { error } = await supabase
        .from('aziende_utenti')
        .insert({
          id_azienda: company.idAzienda,
          id_cliente: clientId,
        });

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
      const company = await this.getCompanyByPiva(piva);
      
      if (!company) {
        throw new Error('Azienda non trovata');
      }

      const { error } = await supabase
        .from('aziende_utenti')
        .delete()
        .eq('id_azienda', company.idAzienda)
        .eq('id_cliente', clientId);

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
      console.log('Updating F24 status:', { f24Id, stato, importoPagato });
      
      // Get the F24 to check the full amount
      const { data: f24Data, error: fetchError } = await supabase
        .from('scadenze_f24')
        .select('importo')
        .eq('id_f24', f24Id)
        .single();

      if (fetchError || !f24Data) {
        console.error('Error fetching F24 for update:', fetchError);
        throw fetchError || new Error('F24 not found');
      }

      const fullAmount = parseFloat(f24Data.importo);
      console.log('Full amount:', fullAmount);

      // Determine the correct stato value
      let finalStato = stato;
      
      // If the stato is being set to 'Confermato', check if it's a full payment
      if (stato === 'Confermato') {
        // If no importoPagato is provided, it means full payment
        if (importoPagato === undefined) {
          finalStato = 'intero';
          console.log('Full payment confirmed, setting stato to "intero"');
        } else if (importoPagato >= fullAmount) {
          // If importoPagato equals or exceeds the full amount, it's also a full payment
          finalStato = 'intero';
          console.log('Payment amount equals or exceeds full amount, setting stato to "intero"');
        } else {
          // Partial payment, keep as 'Confermato'
          console.log('Partial payment, keeping stato as "Confermato"');
        }
      }

      const updateData: any = { stato: finalStato };
      
      if (importoPagato !== undefined) {
        updateData.importo_pagato = importoPagato;
      }

      console.log('Update data:', updateData);

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
        categoriaId: row.categoria_id,
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
        categoriaId: row.categoria_id,
      }));
    } catch (error) {
      console.error('Error in getDocumentsByPiva:', error);
      throw error;
    }
  }

  async getDocumentsByCategory(piva: string, categoryId: string): Promise<Document[]> {
    try {
      const { data, error } = await supabase
        .from('documenti')
        .select('*')
        .eq('partita_iva_azienda', piva)
        .eq('categoria_id', categoryId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents by category:', error);
        throw error;
      }

      return (data || []).map(row => ({
        idDocumento: row.id_documento,
        partitaIvaAzienda: row.partita_iva_azienda,
        descrizione: row.descrizione,
        linkPdf: row.link_pdf,
        categoriaId: row.categoria_id,
      }));
    } catch (error) {
      console.error('Error in getDocumentsByCategory:', error);
      throw error;
    }
  }

  // ===== CATEGORIE DOCUMENTI =====

  async getDocumentCategories(): Promise<DocumentCategory[]> {
    try {
      const { data, error } = await supabase
        .from('categorie_documenti')
        .select('*')
        .order('ordine');

      if (error) {
        console.error('Error fetching document categories:', error);
        throw error;
      }

      return (data || []).map(row => ({
        idCategoria: row.id_categoria,
        nome: row.nome,
        descrizione: row.descrizione,
        ordine: row.ordine,
      }));
    } catch (error) {
      console.error('Error in getDocumentCategories:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const supabaseService = SupabaseService.getInstance();
