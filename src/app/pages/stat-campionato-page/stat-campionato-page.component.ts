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
   RicostruisciPartita,
   RigaPartita,
   TotaliPartite,
   TGiocatoreStatCamp,
   TRigaStatCamp
} from "../../common/statistiche-campionato";
import {MatchheaderService} from "../../services/matchheader.service";
import {MatchrosterService} from "../../services/matchroster.service";
import {TeamService} from "../../services/team.service";
import {MatchSyncService} from "../../services/match-sync.service";
import {MessageDialogService} from "../../services/message-dialog.service";



// Dati passati dalla finestra "Statistiche campionato" della Dashboard (router state)
export interface TStatCampionatoParams
{
   team: IDSTeam;
   champ: IDSChamp;
   matches: Array<IDSMatchHeader>;
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
   public totali: TRigaStatCamp | null = null;
   public medie: TRigaStatCamp | null = null;
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
   private readonly colonneGioc2: Record<string, { val: (g: TGiocatoreStatCamp) => number | null, altoVerde: boolean }> = {
      ff:     { val: g => this.ValNonZero (g.ff),                  altoVerde: false },
      ffP:    { val: g => this.ValPerPartita (g, g.ff),            altoVerde: false },
      fs:     { val: g => this.ValNonZero (g.fs),                  altoVerde: true },
      fsP:    { val: g => this.ValPerPartita (g, g.fs),            altoVerde: true },
      rd:     { val: g => this.ValNonZero (g.rd),                  altoVerde: true },
      ra:     { val: g => this.ValNonZero (g.ra),                  altoVerde: true },
      rt:     { val: g => this.ValNonZero (g.rd + g.ra),           altoVerde: true },
      rP:     { val: g => this.ValPerPartita (g, g.rd + g.ra),     altoVerde: true },
      pp:     { val: g => this.ValNonZero (g.pp),                  altoVerde: false },
      ppP:    { val: g => this.ValPerPartita (g, g.pp),            altoVerde: false },
      pr:     { val: g => this.ValNonZero (g.pr),                  altoVerde: true },
      prP:    { val: g => this.ValPerPartita (g, g.pr),            altoVerde: true },
      as:     { val: g => this.ValNonZero (g.as),                  altoVerde: true },
      asP:    { val: g => this.ValPerPartita (g, g.as),            altoVerde: true },
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
                private messageDialogService: MessageDialogService)
   {
      // la pagina si raggiunge solo dalla finestra di selezione delle partite: senza i suoi dati
      // (URL scritto a mano, refresh) si torna alla Dashboard
      const params: TStatCampionatoParams | undefined = this.router.getCurrentNavigation ()?.extras.state as TStatCampionatoParams | undefined;
      if ((params) && (params.team) && (params.champ) && (params.matches))
      {
         this.team = params.team;
         this.champ = params.champ;
         this.matches = params.matches;
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
            righe.push (RigaPartita (mh, cm, teamId));
            AccumulaGiocatori (giocatori, mh, cm, ops, teamId);
         }
         this.righe = righe;
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

   async EsportaPdf (): Promise<void>
   {
      if (this.elaborazione)
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
             'F', 'S', 'RD', 'RA', 'RT', 'PP', 'PR', 'Ass', 'PIR'],
            rigaTot (this.totali, [82, 65, 13]),
            rigaTot (this.medie, [35, 99, 83])
         ],
         body: this.righe.map (r => [
            cella (r.fase), cella (r.giornata), cella (r.data), cella (r.squadra), cella (r.casaTrasf),
            cella (String (r.puntiF), this.ColoreMinMax (r.puntiF, 'puntiF', true)),
            cella (String (r.puntiS), this.ColoreMinMax (r.puntiS, 'puntiS', false)),
            cella (String (r.dif), this.ColoreMinMax (r.dif, 'dif', true)),
            cella (String (r.tl.realizzati)), cella (String (r.tl.tentati)), cella (this.Perc (r.tl), this.ColorePerc (r.tl, 'tl')),
            cella (String (r.t2.realizzati)), cella (String (r.t2.tentati)), cella (this.Perc (r.t2), this.ColorePerc (r.t2, 't2')),
            cella (String (r.t3.realizzati)), cella (String (r.t3.tentati)), cella (this.Perc (r.t3), this.ColorePerc (r.t3, 't3')),
            cella (String (r.ff), this.ColoreMinMax (r.ff, 'ff', false)),
            cella (String (r.fs), this.ColoreMinMax (r.fs, 'fs', true)),
            cella (String (r.rd), this.ColoreMinMax (r.rd, 'rd', true)),
            cella (String (r.ra), this.ColoreMinMax (r.ra, 'ra', true)),
            cella (String (r.rt), this.ColoreMinMax (r.rt, 'rt', true)),
            cella (String (r.pp), this.ColoreMinMax (r.pp, 'pp', false)),
            cella (String (r.pr), this.ColoreMinMax (r.pr, 'pr', true)),
            cella (String (r.as), this.ColoreMinMax (r.as, 'as', true)),
            cella (String (r.pir), this.ColoreMinMax (r.pir, 'pir', true))
         ]),
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

      pdf.save (`Statistiche_${nomeTeam}_${nomeCamp}.pdf`.replace (/[\\/:*?"<>|]/g, '_'));
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


   // colore migliore/peggiore per una colonna della seconda tabella dei giocatori (stesse regole di ColoreMinMax)
   ColoreGioc2 (g: TGiocatoreStatCamp,
                colonna: string): string
   {
      const def = this.colonneGioc2[colonna];
      const mm = this.minMaxGioc2[colonna];
      const v = def?.val (g);
      if ((!mm) || (v === null) || (v === undefined) || (mm.min === mm.max))
         return '';
      if (v === mm.max)
         return def.altoVerde ? 'valore-migliore' : 'valore-peggiore';
      if (v === mm.min)
         return def.altoVerde ? 'valore-peggiore' : 'valore-migliore';
      return '';
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
