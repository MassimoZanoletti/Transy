import {ChangeDetectorRef, Component} from '@angular/core';
import {Router} from "@angular/router";
import {firstValueFrom} from "rxjs";
import {ButtonModule} from "primeng/button";
import {DividerModule} from "primeng/divider";
import {TableModule} from "primeng/table";
import {
   IDSChamp,
   IDSMatchHeader,
   IDSTeam,
   MessDlgData,
   TDSMatchRoster
} from "../../models/datamod";
import {TCurrMatch} from "../../common/curr-match";
import {TOperationList} from "../../common/operation";
import {TempoStr, TTiriStat} from "../../common/statistiche";
import {
   AccumulaGiocatori,
   MediePartite,
   QuartiGiocati,
   RicostruisciPartita,
   RigaPartita,
   RigaQuarto,
   TotaliPartite,
   TGiocatoreStatCamp,
   TRigaStatCamp
} from "../../common/statistiche-campionato";
import {MatchheaderService} from "../../services/matchheader.service";
import {MatchrosterService} from "../../services/matchroster.service";
import {TeamService} from "../../services/team.service";
import {MatchSyncService} from "../../services/match-sync.service";
import {MessageDialogService} from "../../services/message-dialog.service";
import {PdfSaveService} from "../../services/pdf-save.service";
import { UnaAllaVolta } from '../../common/una-alla-volta';



// Dati passati dalla finestra "Statistiche campionato" della Dashboard (router state)
export interface TStatCampionatoParams
{
   team: IDSTeam;
   champ: IDSChamp;
   matches: Array<IDSMatchHeader>;
   quarti?: boolean;           // sotto ogni partita, una riga per ciascun quarto giocato
}



@Component ({
               selector:    'app-stat-campionato-page',
               standalone:  true,
               imports: [
                  ButtonModule,
                  DividerModule,
                  TableModule
               ],
               templateUrl: './stat-campionato-page.component.html',
               styleUrl:    './stat-campionato-page.component.css'
            })
export class StatCampionatoPageComponent
{
   public team: IDSTeam | null = null;
   public champ: IDSChamp | null = null;
   public matches: Array<IDSMatchHeader> = [];
   public righe: Array<TRigaStatCamp> = [];
   // righe mostrate (tabella e PDF): le partite e, se richiesto, sotto ciascuna i suoi quarti
   public righeTabella: Array<TRigaStatCamp> = [];
   public dettaglioQuarti: boolean = false;
   public totali: TRigaStatCamp | null = null;
   public medie: TRigaStatCamp | null = null;
   // con il dettaglio per quarto: totali e medie di ciascun quarto (Q1.., Et1..), sotto quelli generali
   public totaliQuarti: Array<{ totali: TRigaStatCamp, medie: TRigaStatCamp }> = [];
   public giocatori: Array<TGiocatoreStatCamp> = [];
   // colonne dei giocatori con il valore più alto in verde: valore confrontato (arrotondato come mostrato),
   // null = giocatore escluso dal confronto
   private readonly valoriGioc: Record<string, (g: TGiocatoreStatCamp) => number | null> = {
      min:    g => g.secondi,
      minPar: g => Math.round (g.secondi / Math.max (1, g.partite)),
      pti:    g => g.punti,
      pPar:   g => Math.round (10 * g.punti / Math.max (1, g.partite)) / 10,
      // percentuali: chi ha tentato quel tiro una volta sola non entra in classifica
      tl:     g => this.PercClassifica (g.tl),
      t2:     g => this.PercClassifica (g.t2),
      t3:     g => this.PercClassifica (g.t3),
      tdc:    g => this.PercClassifica (g.tdc)
   };
   private maxGioc: Record<string, { min: number, max: number }> = {};
   // seconda tabella dei giocatori: valore confrontato per ogni colonna (null = cella vuota, esclusa dal
   // confronto) e se il valore più alto è il migliore (falli fatti e palle perse: il contrario)
   private readonly colonneGioc2: Record<string, { val: (g: TGiocatoreStatCamp) => number | null, altoVerde: boolean, solo?: 'valore-migliore' | 'valore-peggiore' }> = {
      ff:     { val: g => this.ValNonZero (g.ff),                  altoVerde: false, solo: 'valore-peggiore' },
      ffP:    { val: g => this.ValPerPartita (g, g.ff),            altoVerde: false, solo: 'valore-peggiore' },
      fs:     { val: g => this.ValNonZero (g.fs),                  altoVerde: true, solo: 'valore-migliore' },
      fsP:    { val: g => this.ValPerPartita (g, g.fs),            altoVerde: true, solo: 'valore-migliore' },
      rd:     { val: g => this.ValNonZero (g.rd),                  altoVerde: true, solo: 'valore-migliore' },
      ra:     { val: g => this.ValNonZero (g.ra),                  altoVerde: true, solo: 'valore-migliore' },
      rt:     { val: g => this.ValNonZero (g.rd + g.ra),           altoVerde: true, solo: 'valore-migliore' },
      rP:     { val: g => this.ValPerPartita (g, g.rd + g.ra),     altoVerde: true, solo: 'valore-migliore' },
      pp:     { val: g => this.ValNonZero (g.pp),                  altoVerde: false, solo: 'valore-peggiore' },
      ppP:    { val: g => this.ValPerPartita (g, g.pp),            altoVerde: false, solo: 'valore-peggiore' },
      pr:     { val: g => this.ValNonZero (g.pr),                  altoVerde: true, solo: 'valore-migliore' },
      prP:    { val: g => this.ValPerPartita (g, g.pr),            altoVerde: true, solo: 'valore-migliore' },
      as:     { val: g => this.ValNonZero (g.as),                  altoVerde: true, solo: 'valore-migliore' },
      asP:    { val: g => this.ValPerPartita (g, g.as),            altoVerde: true, solo: 'valore-migliore' },
      pir:    { val: g => this.ValNonZero (g.pir),                 altoVerde: true },
      pirP:   { val: g => this.ValPerPartita (g, g.pir),           altoVerde: true },
      pm:     { val: g => this.ValNonZero (g.pm),                  altoVerde: true },
      pmP:    { val: g => this.ValPerPartita (g, g.pm),            altoVerde: true }
   };
   private minMaxGioc2: Record<string, { min: number, max: number }> = {};
   // colonne delle percentuali nell'ordine della tabella (TL, T2, T3, TdC)
   public readonly colonneTiri: string[] = ['tl', 't2', 't3', 'tdc'];
   public elaborazione: boolean = false;
   // minimo e massimo per colonna, sulle sole righe delle partite (per i colori)
   private minMax: Record<string, { min: number, max: number }> = {};


   constructor (public router: Router,
                private cdr: ChangeDetectorRef,
                private servMatchHeader: MatchheaderService,
                private servMatchRoster: MatchrosterService,
                private servTeam: TeamService,
                private matchSync: MatchSyncService,
                private messageDialogService: MessageDialogService,
                private pdfSave: PdfSaveService)
   {
      // la pagina si raggiunge solo dalla finestra di selezione delle partite: senza i suoi dati
      // (URL scritto a mano, refresh) si torna alla Dashboard
      const params: TStatCampionatoParams | undefined = this.router.getCurrentNavigation ()?.extras.state as TStatCampionatoParams | undefined;
      if ((params) && (params.team) && (params.champ) && (params.matches))
      {
         this.team = params.team;
         this.champ = params.champ;
         this.matches = params.matches;
         this.dettaglioQuarti = Boolean (params.quarti);
      }
      else
         setTimeout (() => this.router.navigate (['/']));
   }


   // Ricalcola da zero la tabella, rileggendo roster ed eventi di ogni partita selezionata
   async ElaboraStatistiche ()
   {
      if ((!this.team) || (this.elaborazione))
         return;
      const teamId: number = Number(this.team.id);
      this.elaborazione = true;
      try
      {
         const righe: Array<TRigaStatCamp> = [];
         const righeTabella: Array<TRigaStatCamp> = [];
         const giocatori = new Map<number, TGiocatoreStatCamp> ();
         for (const mh of this.matches)
         {
            const [rosterData, { events }] = await Promise.all ([
               firstValueFrom (this.servMatchRoster.getAllData (mh.id)),
               this.matchSync.LoadMatchEvents (mh.id)
            ]);
            const roster: Array<TDSMatchRoster> = ((rosterData) && (rosterData.elements)) ? rosterData.elements : [];
            const cm = new TCurrMatch (this.servMatchHeader, this.servMatchRoster, this.servTeam);
            const opList = await TOperationList.Create ();
            const ops = RicostruisciPartita (cm, roster, events, (ev, my, opp) => this.matchSync.EventToOperation (ev, my, opp), opList);
            const riga = RigaPartita (mh, cm, teamId);
            righe.push (riga);
            righeTabella.push (riga);
            AccumulaGiocatori (giocatori, mh, cm, ops, teamId);
            // dettaglio per quarto: la partita rigiocata ogni volta con le sole azioni di quel quarto
            if (this.dettaglioQuarti)
               for (const q of QuartiGiocati (ops))
               {
                  const cmQ = new TCurrMatch (this.servMatchHeader, this.servMatchRoster, this.servTeam);
                  RicostruisciPartita (cmQ, roster, events, (ev, my, opp) => this.matchSync.EventToOperation (ev, my, opp), await TOperationList.Create (), q);
                  righeTabella.push (RigaQuarto (mh, cmQ, teamId, q));
               }
         }
         this.righe = righe;
         this.righeTabella = righeTabella;
         this.minMax = {};
         for (const col of ['puntiF', 'puntiS', 'dif', 'ff', 'fs', 'rd', 'ra', 'rt', 'pp', 'pr', 'as', 'pir'] as const)
         {
            const valori = righe.map (r => r[col]);
            this.minMax[col] = { min: Math.min (...valori), max: Math.max (...valori) };
         }
         // percentuali: escluse le partite senza tentativi (cella vuota)
         for (const col of ['tl', 't2', 't3'] as const)
         {
            const valori = righe.map (r => this.PercVal (r[col])).filter ((v): v is number => v !== null);
            if (valori.length > 0)
               this.minMax[col] = { min: Math.min (...valori), max: Math.max (...valori) };
         }
         this.totali = TotaliPartite (righe);
         this.medie = MediePartite (this.totali, righe.length);
         // per ogni quarto le righe di quel quarto di tutte le partite; la media è sulle partite in cui
         // quel quarto è stato giocato (conta per i supplementari)
         const perQuarto = new Map<number, Array<TRigaStatCamp>> ();
         for (const r of righeTabella)
            if (r.quarto !== undefined)
               perQuarto.set (r.quarto, [...(perQuarto.get (r.quarto) ?? []), r]);
         this.totaliQuarti = [...perQuarto.entries ()].sort ((a, b) => a[0] - b[0]).map (([, rq]) =>
         {
            const tot = { ...TotaliPartite (rq), squadra: `TOTALI ${rq[0].casaTrasf}` };
            return { totali: tot, medie: { ...MediePartite (tot, rq.length), squadra: `MEDIA ${rq[0].casaTrasf}` } };
         });
         // giocatori in ordine di nome
         this.giocatori = [...giocatori.values ()].sort ((a, b) => a.nome.localeCompare (b.nome, 'it', { sensitivity: 'base' }));
         // massimi per le colonne di minuti e punti dei giocatori (valori come mostrati)
         this.maxGioc = {};
         for (const [col, val] of Object.entries (this.valoriGioc))
         {
            const valori = this.giocatori.map (val).filter ((v): v is number => v !== null);
            if (valori.length > 0)
               this.maxGioc[col] = { min: Math.min (...valori), max: Math.max (...valori) };
         }
         this.minMaxGioc2 = {};
         for (const [col, def] of Object.entries (this.colonneGioc2))
         {
            const valori = this.giocatori.map (def.val).filter ((v): v is number => v !== null);
            if (valori.length > 0)
               this.minMaxGioc2[col] = { min: Math.min (...valori), max: Math.max (...valori) };
         }
      }
      catch (err)
      {
         const dlgData: MessDlgData = {
            title:      'ERRORE',
            subtitle:   'Errore durante l\'elaborazione delle statistiche',
            message:    `${JSON.stringify(err,null,3)}`,
            messtype:   'error',
            btncaption: 'Chiudi'
         };
         this.messageDialogService.showMessage (dlgData, '600px');
      }
      finally
      {
         this.elaborazione = false;
         // le letture degli eventi finiscono in callback di IndexedDB, fuori dalla change detection di Angular
         this.cdr.detectChanges ();
      }
   }


   // numero con al massimo un decimale, alla italiana (68,2 / 61)
   Num (valore: number): string
   {
      return valore.toLocaleString ('it-IT', { maximumFractionDigits: 1 });
   }


   // classe colore per il valore più alto/basso della colonna: altoVerde = il valore più alto è il migliore
   // (punti fatti, differenza), altrimenti il migliore è il più basso (punti subiti). Nessun colore se tutti
   // i valori della colonna sono uguali.
   ColoreMinMax (valore: number,
                 colonna: string,
                 altoVerde: boolean): string
   {
      const mm = this.minMax[colonna];
      if ((!mm) || (mm.min === mm.max))
         return '';
      if (valore === mm.max)
         return altoVerde ? 'valore-migliore' : 'valore-peggiore';
      if (valore === mm.min)
         return altoVerde ? 'valore-peggiore' : 'valore-migliore';
      return '';
   }


   // righe in fondo alla tabella: totali e medie generali, poi quelli di ciascun quarto, ogni coppia
   // preceduta da una riga di stacco (null)
   RigheTotali (): Array<TRigaStatCamp | null>
   {
      if ((!this.totali) || (!this.medie))
         return [];
      return [this.totali, this.medie, ...this.totaliQuarti.flatMap (tq => [null, tq.totali, tq.medie])];
   }


   // colori migliore/peggiore solo sulle righe delle partite: i quarti non entrano nel confronto
   ColoreRiga (r: TRigaStatCamp,
               valore: number,
               colonna: string,
               altoVerde: boolean): string
   {
      return (r.quarto !== undefined) ? '' : this.ColoreMinMax (valore, colonna, altoVerde);
   }


   ColorePercRiga (r: TRigaStatCamp,
                   t: TTiriStat,
                   colonna: string): string
   {
      return (r.quarto !== undefined) ? '' : this.ColorePerc (t, colonna);
   }


   // percentuale arrotondata al decimale mostrato (così il confronto min/max segue quanto si vede);
   // null se nessun tentativo
   PercVal (t: TTiriStat): number | null
   {
      return (t.tentati > 0) ? Math.round (1000 * t.realizzati / t.tentati) / 10 : null;
   }


   ColorePerc (t: TTiriStat,
               colonna: string): string
   {
      const v = this.PercVal (t);
      return (v === null) ? '' : this.ColoreMinMax (v, colonna, true);
   }


   Perc (t: TTiriStat): string
   {
      // sempre una cifra decimale (50,0)
      return (t.tentati > 0) ? (100 * t.realizzati / t.tentati).toLocaleString ('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '';
   }


   ///////////////////////////////////////////////////////////////
   // Esportazione in PDF (A4 orizzontale): pagina 1 statistiche di squadra, pagina 2 le due tabelle dei
   // giocatori. Stessa impostazione dell'export del tab "Statistiche" della partita.
   ///////////////////////////////////////////////////////////////

   @UnaAllaVolta()
   async EsportaPdf (): Promise<void>
   {
      if ((this.elaborazione) || (!this.team) || (!this.champ))
         return;
      // la finestra "Salva con nome" va aperta subito dopo il click, prima dell'elaborazione
      const destinazione = await this.pdfSave.ChiediDestinazione (`C_Statistiche_${this.team.nome}_${this.champ.nome}.pdf`);
      if (!destinazione)
         return;
      // senza elaborazione precedente si elabora adesso
      if (!this.totali)
         await this.ElaboraStatistiche ();
      if ((!this.totali) || (!this.medie) || (!this.team) || (!this.champ))
         return;
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all ([import ('jspdf'), import ('jspdf-autotable')]);
      const pdf = new jsPDF ('l', 'mm', 'a4');
      const pageWidth = 297;
      const font = 'helvetica';
      const nomeTeam = this.team.nome;
      const nomeCamp = this.champ.nome;

      // colori migliore/peggiore leggibili su carta bianca
      const cella = (testo: string, classe: string = ''): any =>
         ({ content: testo, styles: (classe === 'valore-migliore') ? { textColor: [0, 140, 0] }
                                  : (classe === 'valore-peggiore') ? { textColor: [210, 0, 0] } : {} });
      // linee verticali di separazione fra gruppi di colonne (bordo destro della colonna indicata)
      const separatoriDi = (separatori: Set<number>) => (data: any) =>
      {
         const fine = data.column.index + (data.cell.colSpan ?? 1) - 1;
         if (separatori.has (fine))
         {
            const { x, y: cy, width, height } = data.cell;
            pdf.setDrawColor (60, 60, 60);
            pdf.setLineWidth (0.4);
            pdf.line (x + width, cy, x + width, cy + height);
         }
      };
      const stile: any = {
         styles:             { font, halign: 'right' },
         headStyles:         { fillColor: [255, 190, 0], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9, cellPadding: 0.6, halign: 'center' },
         bodyStyles:         { fontSize: 9, cellPadding: 0.6, fillColor: [255, 255, 255], textColor: [0, 0, 0] },
         alternateRowStyles: { fillColor: [221, 221, 221] },
         margin:             { left: 5, right: 5 },
         theme:              'grid'
      };
      const titolo = (testo: string, y: number) =>
      {
         pdf.setFontSize (16);
         pdf.setFont (font, 'bold');
         pdf.text (testo, pageWidth / 2, y, { align: 'center' });
      };
      const legenda = (y: number) =>
      {
         pdf.setFontSize (8);
         pdf.setFont (font, 'normal');
         pdf.setTextColor (0, 140, 0);
         pdf.text ('verde: valore migliore', 5, y);
         pdf.setTextColor (210, 0, 0);
         pdf.text ('rosso: valore peggiore', 45, y);
         pdf.setTextColor (0, 0, 0);
      };

      // righe dei quarti: corsivo grigio, su fondo leggermente più scuro
      const stileQuarto = { fontStyle: 'italic', textColor: [90, 90, 90], fillColor: [238, 238, 238], fontSize: 8 };

      // ---- pagina 1: statistiche di squadra ----
      titolo (`Statistiche di ${nomeTeam} per il campionato ${nomeCamp}`, 10);
      const rigaTot = (r: TRigaStatCamp, fill: number[]): any[] =>
      {
         const s = { fillColor: fill, textColor: [255, 255, 255], halign: 'right' };
         return [
            { content: r.squadra, colSpan: 5, styles: { ...s, fontStyle: 'bolditalic' } },
            ...[this.Num (r.puntiF), this.Num (r.puntiS), this.Num (r.dif),
                this.Num (r.tl.realizzati), this.Num (r.tl.tentati), this.Perc (r.tl),
                this.Num (r.t2.realizzati), this.Num (r.t2.tentati), this.Perc (r.t2),
                this.Num (r.t3.realizzati), this.Num (r.t3.tentati), this.Perc (r.t3),
                this.Num (r.ff), this.Num (r.fs),
                this.Num (r.rd), this.Num (r.ra), this.Num (r.rt), this.Num (r.pp), this.Num (r.pr), this.Num (r.as), this.Num (r.pir)]
               .map (v => ({ content: v, styles: s }))
         ];
      };
      autoTable (pdf, {
         startY: 15,
         head: [
            [{ content: '', colSpan: 5 }, { content: 'Risultato', colSpan: 3 }, { content: 'Liberi', colSpan: 3 },
             { content: 'T2', colSpan: 3 }, { content: 'T3', colSpan: 3 }, { content: 'Falli', colSpan: 2 },
             { content: 'Varie', colSpan: 7 }],
            ['Fase', '', 'Data', 'Squadra', 'C/T', 'F', 'S', 'Dif', 'S', 'T', '%', 'S', 'T', '%', 'S', 'T', '%',
             'F', 'S', 'RD', 'RA', 'RT', 'PP', 'PR', 'Ass', 'PIR']
         ],
         // totali e medie in fondo, dopo l'ultima partita (come nella tabella a video)
         foot: [
            rigaTot (this.totali, [82, 65, 13]),
            rigaTot (this.medie, [35, 99, 83]),
            // totali e medie dei singoli quarti, ogni quarto staccato dal precedente
            ...this.totaliQuarti.flatMap (tq => [
               [{ content: '', colSpan: 26, styles: { fillColor: [255, 255, 255], minCellHeight: 2, cellPadding: 0 } }],
               rigaTot (tq.totali, [82, 65, 13]),
               rigaTot (tq.medie, [35, 99, 83])
            ])
         ],
         showFoot: 'lastPage',
         body: this.righeTabella.map (r => [
            cella (r.fase), cella (r.giornata), cella (r.data), cella (r.squadra), cella (r.casaTrasf),
            cella (String (r.puntiF), this.ColoreRiga (r, r.puntiF, 'puntiF', true)),
            cella (String (r.puntiS), this.ColoreRiga (r, r.puntiS, 'puntiS', false)),
            cella (String (r.dif), this.ColoreRiga (r, r.dif, 'dif', true)),
            cella (String (r.tl.realizzati)), cella (String (r.tl.tentati)), cella (this.Perc (r.tl), this.ColorePercRiga (r, r.tl, 'tl')),
            cella (String (r.t2.realizzati)), cella (String (r.t2.tentati)), cella (this.Perc (r.t2), this.ColorePercRiga (r, r.t2, 't2')),
            cella (String (r.t3.realizzati)), cella (String (r.t3.tentati)), cella (this.Perc (r.t3), this.ColorePercRiga (r, r.t3, 't3')),
            cella (String (r.ff), this.ColoreRiga (r, r.ff, 'ff', false)),
            cella (String (r.fs), this.ColoreRiga (r, r.fs, 'fs', true)),
            cella (String (r.rd), this.ColoreRiga (r, r.rd, 'rd', true)),
            cella (String (r.ra), this.ColoreRiga (r, r.ra, 'ra', true)),
            cella (String (r.rt), this.ColoreRiga (r, r.rt, 'rt', true)),
            cella (String (r.pp), this.ColoreRiga (r, r.pp, 'pp', false)),
            cella (String (r.pr), this.ColoreRiga (r, r.pr, 'pr', true)),
            cella (String (r.as), this.ColoreRiga (r, r.as, 'as', true)),
            cella (String (r.pir), this.ColoreRiga (r, r.pir, 'pir', true))
         ].map (c => (r.quarto !== undefined) ? { ...c, styles: { ...c.styles, ...stileQuarto } } : c)),
         columnStyles: { 0: { halign: 'left' }, 1: { halign: 'left' }, 2: { halign: 'left' }, 3: { halign: 'left' }, 4: { halign: 'center' } },
         didDrawCell: separatoriDi (new Set ([4, 7, 10, 13, 16, 18])),
         ...stile
      });
      legenda ((pdf as any).lastAutoTable.finalY + 5);

      // ---- pagina 2: le due tabelle dei giocatori ----
      pdf.addPage ();
      titolo (`Statistiche giocatori ${nomeTeam}`, 10);
      autoTable (pdf, {
         startY: 15,
         head: [['', 'Part', 'Min', 'Min/Par', 'Pti', 'P/Par', 'TLR', 'TLT', 'TL%', 'T2R', 'T2T', 'T2%',
                 'T3R', 'T3T', 'T3%', 'TdcR', 'TdcT', 'Tdc%']],
         body: this.giocatori.map (g => [
            cella (g.nome), cella (String (g.partite)),
            cella (this.MinTot (g), this.ColoreMaxGioc (g, 'min')),
            cella (this.MinPar (g), this.ColoreMaxGioc (g, 'minPar')),
            cella (this.Pti (g), this.ColoreMaxGioc (g, 'pti')),
            cella (this.PPar (g), this.ColoreMaxGioc (g, 'pPar')),
            ...[g.tl, g.t2, g.t3, g.tdc].flatMap ((t, i) => [
               cella (this.TiroNum (t, t.realizzati)), cella (this.TiroNum (t, t.tentati)),
               cella (this.TiroPerc (t), this.ColoreMaxGioc (g, this.colonneTiri[i]))
            ])
         ]),
         columnStyles: { 0: { halign: 'left', cellWidth: 35 } },
         didDrawCell: separatoriDi (new Set ([0, 1, 3, 5, 8, 11, 14])),
         ...stile
      });
      autoTable (pdf, {
         startY: (pdf as any).lastAutoTable.finalY + 6,
         head: [['', 'Part', 'FF', 'FF/P', 'FS', 'FS/P', 'RD', 'RA', 'RTot', 'R/P', 'PP', 'PP/P', 'PR', 'PR/P',
                 'Ass', 'As/P', 'PIR', 'PIR/P', '+/-', '+/-/P']],
         body: this.giocatori.map (g => [
            cella (g.nome), cella (String (g.partite)),
            cella (this.NumVuoto (g.ff), this.ColoreGioc2 (g, 'ff')), cella (this.PerPartita (g, g.ff), this.ColoreGioc2 (g, 'ffP')),
            cella (this.NumVuoto (g.fs), this.ColoreGioc2 (g, 'fs')), cella (this.PerPartita (g, g.fs), this.ColoreGioc2 (g, 'fsP')),
            cella (this.NumVuoto (g.rd), this.ColoreGioc2 (g, 'rd')), cella (this.NumVuoto (g.ra), this.ColoreGioc2 (g, 'ra')),
            cella (this.NumVuoto (g.rd + g.ra), this.ColoreGioc2 (g, 'rt')), cella (this.PerPartita (g, g.rd + g.ra), this.ColoreGioc2 (g, 'rP')),
            cella (this.NumVuoto (g.pp), this.ColoreGioc2 (g, 'pp')), cella (this.PerPartita (g, g.pp), this.ColoreGioc2 (g, 'ppP')),
            cella (this.NumVuoto (g.pr), this.ColoreGioc2 (g, 'pr')), cella (this.PerPartita (g, g.pr), this.ColoreGioc2 (g, 'prP')),
            cella (this.NumVuoto (g.as), this.ColoreGioc2 (g, 'as')), cella (this.PerPartita (g, g.as), this.ColoreGioc2 (g, 'asP')),
            cella (this.NumVuoto (g.pir), this.ColoreGioc2 (g, 'pir')), cella (this.PerPartita (g, g.pir), this.ColoreGioc2 (g, 'pirP')),
            cella (this.NumVuoto (g.pm), this.ColoreGioc2 (g, 'pm')), cella (this.PerPartita (g, g.pm), this.ColoreGioc2 (g, 'pmP'))
         ]),
         columnStyles: { 0: { halign: 'left', cellWidth: 35 } },
         didDrawCell: separatoriDi (new Set ([0, 1, 3, 5, 9, 11, 13, 15, 17])),
         ...stile
      });
      legenda ((pdf as any).lastAutoTable.finalY + 5);

      await destinazione.Salva (pdf);
   }


   ///////////////////////////////////////////////////////////////
   // Tabella dei giocatori: celle vuote invece degli zeri
   ///////////////////////////////////////////////////////////////

   // verde per il valore più alto della colonna (nessun colore se tutti uguali o se il massimo è zero)
   ColoreMaxGioc (g: TGiocatoreStatCamp,
                  colonna: string): string
   {
      const mm = this.maxGioc[colonna];
      if ((!mm) || (mm.max <= 0) || (mm.min === mm.max))
         return '';
      return (this.valoriGioc[colonna] (g) === mm.max) ? 'valore-migliore' : '';
   }


   private PercClassifica (t: TTiriStat): number | null
   {
      return (t.tentati >= 2) ? this.PercVal (t) : null;
   }


   MinTot (g: TGiocatoreStatCamp): string
   {
      return TempoStr (g.secondi);
   }


   MinPar (g: TGiocatoreStatCamp): string
   {
      return TempoStr (Math.round (g.secondi / Math.max (1, g.partite)));
   }


   // punti: vuoto se non ne ha fatti
   Pti (g: TGiocatoreStatCamp): string
   {
      return (g.punti > 0) ? String (g.punti) : '';
   }


   PPar (g: TGiocatoreStatCamp): string
   {
      return (g.punti > 0) ? this.Num (g.punti / Math.max (1, g.partite)) : '';
   }


   // realizzati/tentati: vuoti se quel tipo di tiro non è mai stato tentato
   TiroNum (t: TTiriStat,
            valore: number): string
   {
      return (t.tentati > 0) ? String (valore) : '';
   }


   TiroPerc (t: TTiriStat): string
   {
      const p = this.Perc (t);
      return (p !== '') ? `${p}%` : '';
   }


   // colore migliore/peggiore per una colonna della seconda tabella dei giocatori (stesse regole di ColoreMinMax);
   // solo: evidenziato solo il migliore o solo il peggiore (falli subiti, rimbalzi, palle recuperate, assist: pochi
   // non è un demerito; falli fatti, palle perse: pochi non è un merito)
   ColoreGioc2 (g: TGiocatoreStatCamp,
                colonna: string): string
   {
      const def = this.colonneGioc2[colonna];
      const mm = this.minMaxGioc2[colonna];
      const v = def?.val (g);
      if ((!mm) || (v === null) || (v === undefined) || (mm.min === mm.max))
         return '';
      let classe = '';
      if (v === mm.max)
         classe = def.altoVerde ? 'valore-migliore' : 'valore-peggiore';
      else if (v === mm.min)
         classe = def.altoVerde ? 'valore-peggiore' : 'valore-migliore';
      return ((def.solo) && (classe !== def.solo)) ? '' : classe;
   }


   private ValNonZero (valore: number): number | null
   {
      return (valore !== 0) ? valore : null;
   }


   // media per partita arrotondata ai due decimali mostrati; null se il totale è zero (cella vuota)
   private ValPerPartita (g: TGiocatoreStatCamp,
                          totale: number): number | null
   {
      return (totale !== 0) ? Math.round (100 * totale / Math.max (1, g.partite)) / 100 : null;
   }


   // media per partita, sempre con due decimali (1,50); vuota se il totale è zero
   PerPartita (g: TGiocatoreStatCamp,
               totale: number): string
   {
      if (totale === 0)
         return '';
      return (totale / Math.max (1, g.partite)).toLocaleString ('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
   }


   // totale vuoto se zero
   NumVuoto (valore: number): string
   {
      return (valore !== 0) ? String (valore) : '';
   }


   TornaDashboard ()
   {
      this.router.navigate (['/']);
   }
}
