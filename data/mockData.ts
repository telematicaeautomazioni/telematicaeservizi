
import { Client, Company, F24, Document } from '@/types';

export const mockClients: Client[] = [
  {
    idCliente: '1',
    nomeUtente: 'mario.rossi',
    password: 'password123',
    nomeCompleto: 'Mario Rossi',
  },
  {
    idCliente: '2',
    nomeUtente: 'demo',
    password: 'demo',
    nomeCompleto: 'Demo User',
  },
];

export const mockCompanies: Company[] = [
  {
    idAzienda: '1',
    partitaIva: '12345678901',
    denominazione: 'Rossi S.r.l.',
    idClienteAssociato: '1',
  },
  {
    idAzienda: '2',
    partitaIva: '98765432109',
    denominazione: 'Bianchi S.p.A.',
    idClienteAssociato: '1',
  },
  {
    idAzienda: '3',
    partitaIva: '11111111111',
    denominazione: 'Verdi & Co.',
    idClienteAssociato: null,
  },
];

export const mockF24s: F24[] = [
  {
    idF24: '1',
    partitaIvaAzienda: '12345678901',
    descrizione: 'IVA Trimestrale Q1 2024',
    importo: 5000,
    linkPdf: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    stato: 'Da Pagare',
  },
  {
    idF24: '2',
    partitaIvaAzienda: '12345678901',
    descrizione: 'INPS Dipendenti Marzo 2024',
    importo: 3500,
    linkPdf: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    stato: 'Pagato',
  },
  {
    idF24: '3',
    partitaIvaAzienda: '98765432109',
    descrizione: 'Ritenute d\'acconto Febbraio 2024',
    importo: 2800,
    linkPdf: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    stato: 'Da Pagare',
  },
  {
    idF24: '4',
    partitaIvaAzienda: '98765432109',
    descrizione: 'Acconto IRPEF 2024',
    importo: 8000,
    linkPdf: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    stato: 'Pagato Parzialmente',
    importoPagato: 4000,
  },
];

export const mockDocuments: Document[] = [
  {
    idDocumento: '1',
    partitaIvaAzienda: '12345678901',
    descrizione: 'Bilancio 2023',
    linkPdf: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    idDocumento: '2',
    partitaIvaAzienda: '12345678901',
    descrizione: 'Dichiarazione IVA 2023',
    linkPdf: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    idDocumento: '3',
    partitaIvaAzienda: '98765432109',
    descrizione: 'Certificazione Unica 2023',
    linkPdf: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    idDocumento: '4',
    partitaIvaAzienda: '98765432109',
    descrizione: 'Modello 770',
    linkPdf: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
];
