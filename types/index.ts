
export interface Client {
  idCliente: string;
  nomeUtente: string;
  password: string;
  nomeCompleto: string;
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
  stato: 'Da Pagare' | 'Pagato' | 'Rifiutato' | 'Pagato Parzialmente';
  importoPagato?: number;
}

export interface Document {
  idDocumento: string;
  partitaIvaAzienda: string;
  descrizione: string;
  linkPdf: string;
}
