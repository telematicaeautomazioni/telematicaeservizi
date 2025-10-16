
export interface Client {
  idCliente: string;
  nomeUtente: string;
  password: string;
  nomeCompleto: string;
  tipoUtente: 'visualizza' | 'decide';
}

export interface Company {
  idAzienda: string;
  partitaIva: string;
  denominazione: string;
  idClienteAssociato: string | null;
}

export interface F24 {
  idF24: string;
  partitaIvaAzienda: string;
  descrizione: string;
  importo: number;
  linkPdf: string;
  stato: 'In attesa di risposta' | 'Confermato' | 'Rifiutato' | 'intero';
  importoPagato?: number;
  scadenza?: string; // Due date in ISO format (YYYY-MM-DD)
}

export interface Document {
  idDocumento: string;
  partitaIvaAzienda: string;
  descrizione: string;
  linkPdf: string;
  categoriaId?: string;
}

export interface DocumentCategory {
  idCategoria: string;
  nome: string;
  descrizione?: string;
  ordine: number;
}

export interface CompanyUser {
  id: string;
  idAzienda: string;
  idCliente: string;
  createdAt: string;
}
