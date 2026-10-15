import {Component, inject, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TableModule} from 'primeng/table';
import {TooltipModule} from 'primeng/tooltip';
import {ButtonModule} from 'primeng/button';
import {DividerModule} from 'primeng/divider';
import {MenuModule} from 'primeng/menu';
import {MenuItem} from 'primeng/api';
import {IDSMatchHeader} from "../../../models/datamod";
import {matchGlobs} from "../../../common/curr-match";
import {globs} from "../../../common/utils";
import {PdfSaveService} from "../../../services/pdf-save.service";
import {AndamentoQuarti, MinutiPerQuarto, TabellaSquadra, TContestoLive, TQuartoAndamento, TRigaStat, TTabellaStat, TTiriStat} from "../../../common/statistiche";
import { UnaAllaVolta } from '../../../common/una-alla-volta';
import {CalcolaFourFactors, TabellaFourFactorsPdf, TFourFactors} from "../../../common/four-factors";
import {DisegnaDifferenzaPdf, SerieDifferenza, TSerieDiff} from "../../../common/grafico-differenza";
import {FourFactorsCompComponent} from "../../../common/four-factors-comp/four-factors-comp.component";
import {GraficoDifferenzaCompComponent} from "../../../common/grafico-differenza-comp/grafico-differenza-comp.component";
import {AnalisiInCampo, TabellaQuintettiPdf, TQuintettoStat} from "../../../common/quintetti";
import {QuintettiCompComponent} from "../../../common/quintetti-comp/quintetti-comp.component";
import {CoppieOnoffCompComponent} from "../../../common/coppie-onoff-comp/coppie-onoff-comp.component";
import {MatriceCoppie, MatriceCoppiePdf, OnOff, TabellaOnOffPdf} from "../../../common/coppie-onoff";
import {AccumulaTimeout, EsitiTimeout, Parziali, RiepilogoVuoto, TabelleParzialiTimeoutPdf, TParziale, TRiepilogoTimeout, TTimeoutEsito} from "../../../common/parziali-timeout";
import {ParzialiTimeoutCompComponent} from "../../../common/parziali-timeout-comp/parziali-timeout-comp.component";
import {CalcolaClutch, TabelleClutchPdf, TClutch} from "../../../common/clutch";
import {ClutchCompComponent} from "../../../common/clutch-comp/clutch-comp.component";
import {BaseDaGiocatori, CalcolaUsage, DisegnaUsagePdf, MIN_SECONDI_PARTITA, TabellaUsagePdf, TUsageSquadra} from "../../../common/usage";
import {UsageCompComponent} from "../../../common/usage-comp/usage-comp.component";
import {COLORE_LORO, COLORE_NOI_PDF} from "../../../common/grafico-differenza";


// Tab "Statistiche" della partita: stessa impostazione della pagina "Tabelle" di nebula (intestazione,
// andamento per quarto, tabella per giocatore di MyTeam e di OppoTeam con i totali di squadra).
// I dati si ricalcolano con Aggiorna() (all'apertura del tab e col pulsante "Aggiorna").
@Component({
   selector:    'app-statistiche-comp',
   standalone:  true,
   imports: [
      CommonModule,
      TableModule,
      TooltipModule,
      ButtonModule,
      DividerModule,
      MenuModule,
      FourFactorsCompComponent,
      GraficoDifferenzaCompComponent,
      QuintettiCompComponent,
      CoppieOnoffCompComponent,
      ParzialiTimeoutCompComponent,
      ClutchCompComponent,
      UsageCompComponent
   ],
   templateUrl: './statistiche-comp.component.html',
   styleUrl:    './statistiche-comp.component.css'
})
export class StatisticheCompComponent
{
   private readonly pdfSave = inject(PdfSaveService);
   @Input() matchHeader: IDSMatchHeader | null = null;
   @Input() myCoach1: string = '';
   @Input() myCoach2: string = '';
   @Input() oppoCoach1: string = '';
   @Input() oppoCoach2: string = '';
   // situazione del cronometro (quarto, tempo, quarti giocati), fornita dalla pagina della partita
   @Input() getContestoLive: () => TContestoLive = () => ({ quarto: 1, tempo: globs.DurationRegulTime, quartoGiocato: () => false });

   // Spiegazione delle ultime 4 colonne: tooltip delle intestazioni in pagina e legenda in fondo al PDF
   private static readonly INDICI: { sigla: string, titolo: string, descrizione: string }[] = [
      { sigla: 'PIR',  titolo: 'Performance Index Rating',   descrizione: 'Indice di valutazione globale che tiene conto di tutto ma non dei minuti giocati.' },
      { sigla: '+/-',  titolo: 'Plus/minus',                 descrizione: 'Differenza fra punti fatti e subiti dalla squadra mentre il giocatore era in campo.' },
      { sigla: 'OER',  titolo: 'Offensive Efficency Rating', descrizione: 'Indice di efficienza offensiva.' },
      { sigla: 'eFG%', titolo: 'Effective Field Goal perc.', descrizione: 'Indice di efficienza nel tiro dal campo (senza liberi), con peso maggiore per tiri da 3. Può superare il 100% (fino al 150%) con pochi tiri quasi tutti segnati.' },
      { sigla: 'TS%',  titolo: 'True Shooting perc.',        descrizione: 'Indice di efficienza realizzativa considerando anche i liberi. Può superare il 100% (fino al 150%) con pochi tiri quasi tutti segnati.' }
   ];

   public readonly tooltipPir  = this.TooltipIndice('PIR');
   public readonly tooltipPm   = this.TooltipIndice('+/-');
   public readonly tooltipOer  = this.TooltipIndice('OER');
   public readonly tooltipEfg  = this.TooltipIndice('eFG%');
   public readonly tooltipTs   = this.TooltipIndice('TS%');

   public titolo: string = '';
   public punteggio: string = '';
   public andamento: TQuartoAndamento[] = [];
   public tabelle: TTabellaStat[] = [];
   // analisi della partita: scarto lungo la partita e Four Factors delle due squadre
   public serieDiff: TSerieDiff | null = null;
   public fourFactors: TFourFactors | null = null;
   // quintetti di MyTeam (minuti insieme, punti fatti/subiti, possessi)
   public quintetti: TQuintettoStat[] = [];
   // parziali senza risposta ed efficacia dei timeout delle due squadre
   public parziali: TParziale[] = [];
   public parzialiTabella: { p: TParziale }[] = [];
   public esitiTimeout: TTimeoutEsito[] = [];
   public riepilogoTimeout: { noi: TRiepilogoTimeout, loro: TRiepilogoTimeout } | null = null;
   // finale punto a punto di MyTeam
   public clutch: TClutch | null = null;
   // usage ed efficienza dei giocatori di MyTeam
   public usage: TUsageSquadra | null = null;
   public aggiornatoAlle: string = '';
   // menu del bottone "Esporta in PDF": l'esportazione semplice si ferma alla seconda tabella (va anche ai
   // giornalisti), quella completa aggiunge le analisi (scarto, Four Factors, quintetti, On/Off) per lo staff
   public readonly vociPdf: MenuItem[] = [
      { label: 'SEMPLICE: Solo tabelle', icon: 'pi pi-file', command: () => this.EsportaPdf(false) },
      { label: 'COMPLETA: con analisi',    icon: 'pi pi-chart-line', command: () => this.EsportaPdf(true) }
   ];


   Aggiorna (): void
   {
      const cm = matchGlobs.currMatch;
      const mh = this.matchHeader;
      if (!cm || !mh)
         return;
      const myTeam = cm.myTeam();
      const oppTeam = cm.oppTeam();
      const ops = cm.matchOperList()?.items() ?? [];
      const live = this.getContestoLive();
      const quartiGiocati: number[] = [];
      for (let q = 1; q <= globs.MaxRegQuarters + globs.MaxExtraQuarters; q++)
      {
         const punti = (myTeam?.GetQuarto(q - 1)?.punti ?? 0) + (oppTeam?.GetQuarto(q - 1)?.punti ?? 0);
         if (live.quartoGiocato(q) || (punti > 0))
            quartiGiocati.push(q);
      }
      const giocatori = [...(myTeam?.Roster ?? []), ...(oppTeam?.Roster ?? [])];
      const minuti = MinutiPerQuarto(ops, giocatori, live);
      const inCampo = AnalisiInCampo(ops, giocatori, true, live);
      this.quintetti = inCampo.quintetti;

      const myNome = mh.myTeamNome_lk;
      const oppNome = mh.oppoTeamNome_lk;
      const myPunti = myTeam?.CalcPunti() ?? 0;
      const oppPunti = oppTeam?.CalcPunti() ?? 0;
      this.titolo = mh.atHome ? `${myNome} - ${oppNome}` : `${oppNome} - ${myNome}`;
      this.punteggio = mh.atHome ? `${myPunti} - ${oppPunti}` : `${oppPunti} - ${myPunti}`;
      this.andamento = AndamentoQuarti(ops, myTeam, oppTeam, mh.atHome, quartiGiocati, live);
      // la pagina della partita usa l'id ("0") quando l'allenatore non è indicato
      const coach = (c: string) => ((c ?? '').trim() === '0') ? '' : c;
      this.tabelle = [
         TabellaSquadra(myTeam, myNome, true, minuti, quartiGiocati, coach(this.myCoach1), coach(this.myCoach2), inCampo.plusMinus),
         TabellaSquadra(oppTeam, oppNome, false, minuti, quartiGiocati, coach(this.oppoCoach1), coach(this.oppoCoach2), inCampo.plusMinus)
      ];
      this.serieDiff = SerieDifferenza(ops, quartiGiocati, live);
      this.parziali = Parziali(this.serieDiff);
      this.parzialiTabella = this.parziali.map(p => ({ p }));
      this.esitiTimeout = EsitiTimeout(this.serieDiff);
      const noi = RiepilogoVuoto();
      const loro = RiepilogoVuoto();
      AccumulaTimeout(noi, this.esitiTimeout, true);
      AccumulaTimeout(loro, this.esitiTimeout, false);
      this.riepilogoTimeout = { noi, loro };
      this.clutch = CalcolaClutch(ops, giocatori, true, live);
      const totNoi = this.tabelle[0].totali;
      this.usage = CalcolaUsage(BaseDaGiocatori(myTeam?.Roster ?? [], minuti),
                                { punti: totNoi.punti, fga: totNoi.tdc.tentati, fta: totNoi.tl.tentati, pp: totNoi.pp }, MIN_SECONDI_PARTITA);
      // minuti giocati fino al cronometro (la serie dello scarto arriva fin lì): pace anche a partita in corso
      this.fourFactors = CalcolaFourFactors(this.tabelle[0].totali, this.tabelle[1].totali, 1, this.serieDiff.durata / 60);
      const ora = new Date();
      this.aggiornatoAlle = `${String(ora.getHours()).padStart(2, '0')}:${String(ora.getMinutes()).padStart(2, '0')}:${String(ora.getSeconds()).padStart(2, '0')}`;
   }


   Arbitri (): string
   {
      return [this.matchHeader?.arbitro1, this.matchHeader?.arbitro2].filter(a => !!a).join(' - ');
   }


   CasaTrasferta (): string
   {
      const luogo = this.matchHeader?.location ? ` (${this.matchHeader.location})` : '';
      return (this.matchHeader?.atHome ? 'in casa' : 'in trasferta') + luogo;
   }


   Giornata (): string
   {
      const num = this.matchHeader?.matchNumber ? ` (${this.matchHeader.matchNumber})` : '';
      return `${this.matchHeader?.giornata ?? ''}${num}`;
   }


   // plus/minus col segno (+5 / -3 / 0); vuoto se non calcolato
   PmStr (pm: number | null): string
   {
      return (pm === null) ? '' : ((pm > 0) ? `+${pm}` : String(pm));
   }


   // "realizzati/tentati" + percentuale (troncata, come nebula); vuoto se nessun tentativo
   TiriStr (t: TTiriStat): string
   {
      return (t.tentati > 0) ? `${t.realizzati}/${t.tentati}` : '';
   }


   TiriPerc (t: TTiriStat): string
   {
      return (t.tentati > 0) ? `(${Math.trunc(100 * t.realizzati / t.tentati)}%)` : '';
   }


   // Esporta in PDF intestazione, andamento per quarto e le due tabelle dei giocatori (stesso impaginato di
   // PDFExport_Tabelle di nebula: A4 orizzontale, jsPDF + jspdf-autotable). Le librerie si caricano solo qui
   // (import dinamico), per non appesantire l'avvio dell'app.
   // completa = false: intestazione, andamento per quarto, tabelle e legenda (niente analisi)
   @UnaAllaVolta()
   async EsportaPdf (completa: boolean): Promise<void>
   {
      this.Aggiorna();
      if ((this.tabelle.length === 0) || (!this.matchHeader))
         return;
      const destinazione = await this.pdfSave.ChiediDestinazione(`T_${this.matchHeader.title || 'partita'}-${completa ? 'analisi' : 'tabelle'}.pdf`);
      if (!destinazione)
         return;
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pageWidth = 297;
      const font = 'helvetica';
      let y = 5;

      // intestazione
      pdf.setFontSize(20);
      pdf.setFont(font, 'bold');
      pdf.text(`${this.titolo}      ${this.punteggio}`, pageWidth / 2, y, { align: 'center' });
      y += 6;
      pdf.setFontSize(10);
      pdf.setFont(font, 'normal');
      for (const riga of [`Data: ${this.matchHeader.matchDateStr ?? ''}`, `Casa/Trasferta: ${this.CasaTrasferta()}`,
                          `Giornata: ${this.Giornata()}`, `Arbitri: ${this.Arbitri()}`])
      {
         pdf.text(riga, 5, y);
         y += 3.5;
      }

      // andamento per quarto
      if (this.andamento.length > 0)
      {
         autoTable(pdf, {
            startY: y,
            head: [['', ...this.andamento.map(q => q.label)]],
            body: [
               ['Parziali', ...this.andamento.map(q => q.parziale)],
               ['Progressivi', ...this.andamento.map(q => q.progressivo)],
               ['Max vantaggio', ...this.andamento.map(q => String(q.maxVantaggio))],
               ['Max svantaggio', ...this.andamento.map(q => String(q.maxSvantaggio))],
               ['Max senza segnare', ...this.andamento.map(q => q.maxSenzaSegnare)],
               ['Max senza subire', ...this.andamento.map(q => q.maxSenzaSubire)]
            ],
            styles: { font },
            headStyles: { fillColor: [66, 45, 107], textColor: [255, 227, 120], fontStyle: 'bold', fontSize: 10, cellPadding: 0.5, halign: 'center' },
            bodyStyles: { fontSize: 9, fontStyle: 'bold', cellPadding: 1, halign: 'center' },
            columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
            tableWidth: 100,
            margin: { left: 5 },
            theme: 'grid'
         });
         y = (pdf as any).lastAutoTable.finalY + 2;
      }

      // tabelle dei giocatori
      const colonne = ['Giocatore', 'Pti', 'Min.', 'TL', 'T2', 'T3', 'TdC', 'FF', 'FS', 'RD', 'RA', 'RTot', 'PP', 'PR', 'As',
                       'St.F', 'St.S', 'Q1', 'Q2', 'Q3', 'Q4', 'ET', 'PIR', '+/-', 'OER', 'eFG%', 'TS%'];
      const tiri = (t: TTiriStat) => (t.tentati > 0) ? `${this.TiriStr(t)}\n${this.TiriPerc(t)}` : '';
      const riga = (r: TRigaStat, nome: string, totali: boolean): string[] =>
      {
         if (r.nonEntrato)
            return [nome, '', 'n.e.', ...new Array(colonne.length - 3).fill('')];
         return [
            nome, String(r.punti), r.min, tiri(r.tl), tiri(r.t2), tiri(r.t3), tiri(r.tdc),
            String(r.ff), String(r.fs), String(r.rd), String(r.ra), String(r.rtot), String(r.pp), String(r.pr),
            String(r.as), String(r.stf), String(r.sts),
            ...r.quarti.map(q => q ? (totali ? String(q.punti) : `${q.punti}\n${q.min}`) : ''),
            String(r.pir), this.PmStr(r.pm), r.oer, r.efg, r.ts
         ];
      };
      const columnStyles: any = { 0: { cellWidth: 32, halign: 'left' } };
      for (let c = 1; c < colonne.length; c++)
         columnStyles[c] = { cellWidth: 'auto', halign: 'center' };
      // linee verticali di separazione fra gruppi di colonne (bordo destro della colonna indicata)
      const separatori = new Set([0, 1, 2, 6, 8, 11, 13, 14, 16, 21]);
      const stile: any = {
         styles:             { font },
         headStyles:         { fillColor: [255, 190, 0], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 10, cellPadding: 0.4, halign: 'center' },
         bodyStyles:         { fontSize: 10, cellPadding: 0.4, fontStyle: 'bold', fillColor: [255, 255, 255] },
         footStyles:         { fillColor: [186, 102, 255], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10, cellPadding: 0.4, halign: 'center' },
         columnStyles,
         alternateRowStyles: { fillColor: [221, 221, 221] },
         margin:             { left: 3, right: 3 },
         didDrawCell: (data: any) =>
         {
            if (separatori.has(data.column.index))
            {
               const { x, y: cy, width, height } = data.cell;
               pdf.setDrawColor(60, 60, 60);
               pdf.setLineWidth(0.4);
               pdf.line(x + width, cy, x + width, cy + height);
            }
         }
      };
      this.tabelle.forEach((tab, i) =>
      {
         // la seconda tabella va su una nuova pagina se nella prima non c'è abbastanza spazio (come nebula)
         if ((i > 0) && (y > 120))
         {
            pdf.addPage();
            y = 5;
         }
         autoTable(pdf, {
            startY: y,
            head: [colonne],
            body: tab.righe.map(r => riga(r, `${r.quintetto ? '* ' : '  '}${r.numero}) ${r.nome}${r.capitano ? ' (C)' : ''}`, false)),
            foot: [riga(tab.totali, `TOTALI ${tab.squadra}`, true)],
            ...stile
         });
         y = (pdf as any).lastAutoTable.finalY + 5;
         pdf.setFontSize(9);
         pdf.setFont(font, 'normal');
         if (tab.coach1)
         {
            pdf.text(`Head coach: ${tab.coach1}`, 5, y);
            y += 3;
         }
         if (tab.coach2)
         {
            pdf.text(`1° Assistente: ${tab.coach2}`, 5, y);
            y += 3;
         }
         if (tab.diSquadra)
         {
            const righe = pdf.splitTextToSize(tab.diSquadra, pdf.internal.pageSize.getWidth() - 10);
            pdf.text(righe, 5, y);
            y += 3 * righe.length;
         }
         y += 2;
      });
      // legenda delle ultime 4 colonne, sotto il vice allenatore dell'ultima tabella: sigla, titolo in grassetto e
      // spiegazione (stesso testo dei tooltip), carattere come quello degli allenatori
      pdf.setFontSize(9);
      for (const ind of StatisticheCompComponent.INDICI)
      {
         if (y > 205)
         {
            pdf.addPage();
            y = 8;
         }
         let x = 5;
         pdf.setFont(font, 'normal');
         pdf.text(`${ind.sigla} - `, x, y);
         x += pdf.getTextWidth(`${ind.sigla} - `);
         pdf.setFont(font, 'bold');
         pdf.text(ind.titolo, x, y);
         x += pdf.getTextWidth(ind.titolo);
         pdf.setFont(font, 'normal');
         // la spiegazione va a capo se non sta nella riga; le righe successive allineate sotto il titolo
         const righe: string[] = pdf.splitTextToSize(`: ${ind.descrizione}`, pageWidth - 5 - x);
         pdf.text(righe[0], x, y);
         const resto: string[] = (righe.length > 1) ? pdf.splitTextToSize(righe.slice(1).join(' '), pageWidth - 10 - pdf.getTextWidth(`${ind.sigla} - `)) : [];
         for (const r of resto)
         {
            y += 3.5;
            pdf.text(r, 5 + pdf.getTextWidth(`${ind.sigla} - `), y);
         }
         y += 3.5;
      }

      if (!completa)
      {
         await destinazione.Salva(pdf);
         return;
      }

      // solo esportazione completa: scarto lungo la partita e Four Factors
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.setFont(font, 'bold');
      pdf.text(`Andamento dello scarto - ${this.titolo}  ${this.punteggio}`, pageWidth / 2, 8, { align: 'center' });
      const myNome = this.tabelle[0]?.squadra ?? '';
      const oppNome = this.tabelle[1]?.squadra ?? '';
      if (this.serieDiff)
         DisegnaDifferenzaPdf(pdf, this.serieDiff, myNome, oppNome, 15, 18, pageWidth - 25, 95, font, this.parziali);
      if (this.fourFactors)
         TabellaFourFactorsPdf(pdf, autoTable, this.fourFactors, myNome, oppNome, 140, font, 15);

      // volume ed efficienza: grafico a sinistra (usage, poi tentativi di tiro su un'altra pagina), tabella a destra
      if (this.usage && (this.usage.giocatori.length > 0))
         for (const [asse, nome] of [['usage', 'Usage ed efficienza'], ['tiri', 'Tiri ed efficienza']] as const)
         {
            pdf.addPage();
            pdf.setFontSize(14);
            pdf.setFont(font, 'bold');
            pdf.text(`${nome} - ${myNome}`, pageWidth / 2, 8, { align: 'center' });
            DisegnaUsagePdf(pdf, this.usage, 22, 18, 120, 150, font, asse, false);
            TabellaUsagePdf(pdf, autoTable, this.usage, 18, 158, pageWidth - 158 - 5, font, false);
         }

      // timeout e parziali
      if (this.riepilogoTimeout)
      {
         pdf.addPage();
         pdf.setFontSize(14);
         pdf.setFont(font, 'bold');
         pdf.text(`Timeout e parziali - ${this.titolo}  ${this.punteggio}`, pageWidth / 2, 8, { align: 'center' });
         TabelleParzialiTimeoutPdf(pdf, autoTable, this.parzialiTabella, this.esitiTimeout, this.riepilogoTimeout, [myNome, oppNome], 16, font);
      }

      // finale punto a punto (solo se c'è stato)
      if (this.clutch && (this.clutch.secondi > 0))
      {
         pdf.addPage();
         pdf.setFontSize(14);
         pdf.setFont(font, 'bold');
         pdf.text(`Finale punto a punto (clutch) - ${this.titolo}  ${this.punteggio}`, pageWidth / 2, 8, { align: 'center' });
         const rgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.substring(i, i + 2), 16));
         const yCl = TabelleClutchPdf(pdf, autoTable, this.clutch, [myNome, oppNome], rgb(COLORE_NOI_PDF), rgb(COLORE_LORO), 15, font);
         if (this.clutch.quintetti.length > 0)
            TabellaQuintettiPdf(pdf, autoTable, this.clutch.quintetti, false, yCl, font);
      }

      // quintetti di MyTeam, su una pagina a parte
      if (this.quintetti.length > 0)
      {
         pdf.addPage();
         pdf.setFontSize(14);
         pdf.setFont(font, 'bold');
         pdf.text(`Quintetti ${myNome}`, pageWidth / 2, 8, { align: 'center' });
         TabellaQuintettiPdf(pdf, autoTable, this.quintetti, false, 13, font);

         // On/Off e coppie (+/-) su un'altra pagina
         pdf.addPage();
         pdf.setFontSize(14);
         pdf.setFont(font, 'bold');
         pdf.text(`On/Off e coppie ${myNome}`, pageWidth / 2, 8, { align: 'center' });
         const yOnOff = TabellaOnOffPdf(pdf, autoTable, OnOff(this.quintetti), 13, font);
         MatriceCoppiePdf(pdf, autoTable, MatriceCoppie(this.quintetti), 'pm', yOnOff + 8, font);
      }
      await destinazione.Salva(pdf);
   }


   private TooltipIndice (sigla: string): string
   {
      const ind = StatisticheCompComponent.INDICI.find(i => i.sigla === sigla);
      return ind ? this.Tooltip(ind.titolo, ind.descrizione) : '';
   }


   private Tooltip (titolo: string,
                    descrizione: string): string
   {
      return `<span class='tt-titolo'><b>${titolo}</b></span><br><span class='tt-testo'>${descrizione}</span>`;
   }
}
