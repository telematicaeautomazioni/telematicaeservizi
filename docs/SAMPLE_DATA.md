
# Dati di Esempio per Google Sheets

Copia e incolla questi dati nei rispettivi fogli del tuo Google Sheets per testare l'app.

## Foglio: clienti

```
idCliente	nomeUtente	password	nomeCompleto
C001	demo	demo	Demo User
C002	mario.rossi	password123	Mario Rossi
C003	laura.bianchi	laura2024	Laura Bianchi
```

## Foglio: aziende

```
idAzienda	partitaIva	denominazione	idClienteAssociato
A001	12345678901	Rossi S.r.l.		
A002	11111111111	Verdi & Co.		
A003	22222222222	Bianchi Consulting		
A004	33333333333	Tech Solutions S.p.A.		
```

## Foglio: scadenzeF24

```
idF24	partitaIvaAzienda	descrizione	importo	linkPdf	stato	importoPagato
F001	12345678901	IVA Trimestrale Q1 2024	1500.00	https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf	Da Pagare	
F002	12345678901	Contributi INPS Gennaio	2500.00	https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf	Pagato	2500.00
F003	12345678901	IRPEF Dipendenti	3200.00	https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf	Da Pagare	
F004	11111111111	IVA Mensile Febbraio	850.00	https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf	Parziale	400.00
F005	11111111111	Contributi INPS	1800.00	https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf	Da Pagare	
F006	22222222222	Acconto IRES	5000.00	https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf	Rifiutato	
```

## Foglio: documenti

```
idDocumento	partitaIvaAzienda	descrizione	linkPdf
D001	12345678901	Bilancio 2023	https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf
D002	12345678901	Visura Camerale	https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf
D003	12345678901	Certificato Unico 2023	https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf
D004	11111111111	Bilancio 2023	https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf
D005	11111111111	Statuto Societario	https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf
D006	22222222222	Contratto Affitto	https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf
```

## Come Importare i Dati

### Metodo 1: Copia e Incolla
1. Seleziona i dati sopra (incluse le intestazioni)
2. Copia (Ctrl+C o Cmd+C)
3. Apri il foglio Google Sheets
4. Seleziona la cella A1 del foglio corrispondente
5. Incolla (Ctrl+V o Cmd+V)

### Metodo 2: Import da TSV
1. Copia i dati in un file di testo (.txt)
2. In Google Sheets, vai su File > Importa
3. Carica il file
4. Seleziona "Tab" come separatore
5. Scegli "Sostituisci foglio corrente"

## Scenari di Test

### Scenario 1: Primo Accesso
```
1. Login con: demo / demo
2. Associa P.IVA: 12345678901
3. Visualizza F24 e Documenti
```

### Scenario 2: Gestione F24
```
1. Login con: demo / demo
2. Seleziona azienda: Rossi S.r.l.
3. Vai alla tab F24
4. Testa le azioni:
   - Accetta un F24 "Da Pagare"
   - Rifiuta un F24
   - Pagamento parziale
```

### Scenario 3: Multiple Aziende
```
1. Login con: mario.rossi / password123
2. Associa P.IVA: 11111111111
3. Associa P.IVA: 22222222222
4. Cambia azienda dal dropdown
5. Verifica che i dati cambino
```

### Scenario 4: Gestione Account
```
1. Login con: laura.bianchi / laura2024
2. Vai a Gestione Account
3. Associa P.IVA: 33333333333
4. Rimuovi l'associazione
5. Logout
```

## Note sui Dati

- **idCliente, idAzienda, idF24, idDocumento**: Devono essere univoci
- **partitaIva**: Deve essere di 11 cifre numeriche
- **importo, importoPagato**: Numeri decimali (usa il punto come separatore)
- **stato**: Valori ammessi: "Da Pagare", "Pagato", "Parziale", "Rifiutato"
- **linkPdf**: URL validi (per test, usa il dummy PDF fornito)
- **idClienteAssociato**: Lascia vuoto per aziende non ancora associate

## Aggiungere Nuovi Dati

### Nuovo Cliente
```
1. Apri il foglio "clienti"
2. Aggiungi una nuova riga con:
   - idCliente univoco (es. C004)
   - nomeUtente
   - password
   - nomeCompleto
```

### Nuova Azienda
```
1. Apri il foglio "aziende"
2. Aggiungi una nuova riga con:
   - idAzienda univoco (es. A005)
   - partitaIva (11 cifre)
   - denominazione
   - idClienteAssociato (lascia vuoto)
```

### Nuovo F24
```
1. Apri il foglio "scadenzeF24"
2. Aggiungi una nuova riga con:
   - idF24 univoco (es. F007)
   - partitaIvaAzienda (deve esistere in "aziende")
   - descrizione
   - importo
   - linkPdf
   - stato (default: "Da Pagare")
   - importoPagato (lascia vuoto se non pagato)
```

### Nuovo Documento
```
1. Apri il foglio "documenti"
2. Aggiungi una nuova riga con:
   - idDocumento univoco (es. D007)
   - partitaIvaAzienda (deve esistere in "aziende")
   - descrizione
   - linkPdf
```

## Validazione Dati

Prima di testare, verifica che:
- [ ] Tutte le intestazioni siano corrette
- [ ] Non ci siano celle vuote nelle colonne obbligatorie
- [ ] Le Partite IVA siano di 11 cifre
- [ ] Gli importi usino il punto come separatore decimale
- [ ] Gli stati F24 siano tra quelli ammessi
- [ ] I link PDF siano URL validi
- [ ] Gli ID siano univoci

## Troubleshooting

**Problema**: I dati non vengono caricati
- Verifica che i nomi dei fogli corrispondano esattamente
- Controlla che le intestazioni siano nella prima riga
- Verifica che non ci siano righe vuote all'inizio

**Problema**: Errore durante l'associazione P.IVA
- Verifica che la P.IVA esista nel foglio "aziende"
- Controlla che sia di 11 cifre
- Verifica che non sia già associata ad un altro cliente

**Problema**: F24 non visibili
- Verifica che la partitaIvaAzienda corrisponda a un'azienda associata
- Controlla che il cliente abbia associato l'azienda
- Verifica che non ci siano errori di formattazione negli importi
