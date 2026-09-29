import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TableModule} from 'primeng/table';
import {TooltipModule} from 'primeng/tooltip';
import {ButtonModule} from 'primeng/button';
import {DividerModule} from 'primeng/divider';
import {IDSMatchHeader} from "../../../models/datamod";
import {matchGlobs} from "../../../common/curr-match";
import {globs} from "../../../common/utils";
import {AndamentoQuarti, MinutiPerQuarto, TabellaSquadra, TContestoLive, TQuartoAndamento, TRigaStat, TTabellaStat, TTiriStat} from "../../../common/statistiche";


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
      DividerModule
   ],
   templateUrl: './statistiche-comp.component.html',
   styleUrl:    './statistiche-comp.component.css'
})
export class StatisticheCompComponent
{
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
      { sigla: 'OER',  titolo: 'Offensive Efficency Rating', descrizione: 'Indice di efficienza offensiva.' },
      { sigla: 'eFG%', titolo: 'Effective Field Goal perc.', descrizione: 'Indice di efficienza nel tiro dal campo (senza liberi), con peso maggiore per tiri da 3. Può superare il 100% (fino al 150%) con pochi tiri quasi tutti segnati.' },
      { sigla: 'TS%',  titolo: 'True Shooting perc.',        descrizione: 'Indice di efficienza realizzativa considerando anche i liberi. Può superare il 100% (fino al 150%) con pochi tiri quasi tutti segnati.' }
   ];

   public readonly tooltipPir  = this.TooltipIndice('PIR');
   public readonly tooltipOer  = this.TooltipIndice('OER');
   public readonly tooltipEfg  = this.TooltipIndice('eFG%');
   public readonly tooltipTs   = this.TooltipIndice('TS%');

   public titolo: string = '';
   public punteggio: string = '';
   public andamento: TQuartoAndamento[] = [];
   public tabelle: TTabellaStat[] = [];
   public aggiornatoAlle: string = '';


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
         TabellaSquadra(myTeam, myNome, true, minuti, quartiGiocati, coach(this.myCoach1), coach(this.myCoach2)),
         TabellaSquadra(oppTeam, oppNome, false, minuti, quartiGiocati, coach(this.oppoCoach1), coach(this.oppoCoach2))
      ];
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
   async EsportaPdf (): Promise<void>
   {
      this.Aggiorna();
      if ((this.tabelle.length === 0) || (!this.matchHeader))
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
                       'St.F', 'St.S', 'Q1', 'Q2', 'Q3', 'Q4', 'ET', 'PIR', 'OER', 'eFG%', 'TS%'];
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
            String(r.pir), r.oer, r.efg, r.ts
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
      pdf.save(`T_${this.matchHeader.title || 'partita'}-tabelle.pdf`);
   }


   private TooltipIndice (sigla: string): string
   {
      const ind = StatisticheCompComponent.INDICI.find(i => i.sigla === sigla);
      return ind ? this.Tooltip(ind.titolo, ind.descrizione) : '';
   }


   private Tooltip (titolo: string,
                    descrizione: string): string
   {
      return `<span style='color: #ffff00'><b>${titolo}</b></span><br><span style='font-size: 0.8rem;'>${descrizione}</span>`;
   }
}
