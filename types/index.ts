
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
  stato: 'In attesa di risposta' | 'Confermato' | 'Rifiutato';
  importoPagato?: number;
}

export interface Document {
  idDocumento: string;
  partitaIvaAzienda: string;
  descrizione: string;
  linkPdf: string;
}
