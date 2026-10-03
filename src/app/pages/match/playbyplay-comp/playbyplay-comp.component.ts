import {Component, ElementRef, Input, OnDestroy, QueryList, ViewChildren} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ButtonModule} from 'primeng/button';
import {InputSwitchModule} from 'primeng/inputswitch';
import {TabViewModule} from 'primeng/tabview';
import {DividerModule} from 'primeng/divider';
import type {Chart, ChartConfiguration} from 'chart.js';
import {IDSMatchHeader, TMatchPlayer} from "../../../models/datamod";
import {matchGlobs} from "../../../common/curr-match";
import {globs} from "../../../common/utils";
import {TOperationType} from "../../../common/operation";
import {TContestoLive, TempoStr} from "../../../common/statistiche";


// Punto del grafico: x = punti della squadra, y = minuti di gioco trascorsi nel quarto
interface TPuntoPbp
{
   x: number;
   y: number;
   player?: string;
   delta?: number;           // punti del canestro (0 = tiro sbagliato)
   punti?: number;
   tempo?: string;           // cronometro "mm:ss"
   sameTime?: number;        // eventi consecutivi allo stesso minuto (per sfalsare le etichette)
   tipo?: string;            // tiro sbagliato: "TL", "T2", "T3"
}


// Etichetta di un fallo o di una sostituzione di MyTeam
interface TEtichettaPbp
{
   tipo: 'fallo' | 'sostit';
   xValue: number;
   yValue: number;
   ordine: number;          // 0 = prima etichetta del suo istante; dalla seconda in poi va sotto la precedente
   content: string;
}


interface TQuartoPbp
{
   titolo: string;
   numero: number;
   myTeamPunti1: number;
   oppoTeamPunti1: number;
   myTeamPunti2: number;
   oppoTeamPunti2: number;
   myData: TPuntoPbp[];
   oppoData: TPuntoPbp[];
   etichette: Map<string, TEtichettaPbp>;
   xMin: number;
   xMax: number;
   yMax: number;              // minuti del quarto (10 regolari, 5 supplementari)
   beginAtZero: boolean;
}


// distanza orizzontale (pixel) delle etichette sfalsate di eventi allo stesso minuto
const LABEL_OFFSET = 220;

// etichette di falli/sostituzioni dello stesso istante: distanza verticale fra una e l'altra e rientro dalla
// seconda in poi (pixel). Altezza dell'etichetta: font 14 (riga 16.8) + spazio interno 2 x 6 + bordo 2 x 2
// = 32.8, più 1 pixel di stacco
const ETICHETTA_ALTEZZA = 34;
const ETICHETTA_RIENTRO = 20;

// chart.js e plugin caricati (e registrati) una sola volta, al primo grafico
let chartJsPromise: Promise<typeof Chart> | null = null;

function CaricaChartJs (): Promise<typeof Chart>
{
   chartJsPromise ??= Promise.all([import('chart.js'), import('chartjs-plugin-annotation'), import('chartjs-plugin-datalabels')])
      .then(([chartJs, annotation, datalabels]) =>
      {
         chartJs.Chart.register(...chartJs.registerables, annotation.default, datalabels.default);
         return chartJs.Chart;
      });
   return chartJsPromise;
}


// Tab "Play-by-play" della partita: replica della pagina "Grafici" di nebula. Per ogni quarto giocato un grafico
// a gradini dei punti delle due squadre in funzione del tempo, con i canestri (e i tiri sbagliati di MyTeam),
// i falli e le sostituzioni di MyTeam; interruttori per falli, sostituzioni e squadre ed esportazione in PDF
// (una pagina A3 per quarto). I dati si ricalcolano con Aggiorna() (all'apertura del tab).
@Component({
   selector:    'app-playbyplay-comp',
   standalone:  true,
   imports: [
      CommonModule,
      FormsModule,
      ButtonModule,
      InputSwitchModule,
      TabViewModule,
      DividerModule
   ],
   templateUrl: './playbyplay-comp.component.html',
   styleUrl:    './playbyplay-comp.component.css'
})
export class PlaybyplayCompComponent implements OnDestroy
{
   @Input() matchHeader: IDSMatchHeader | null = null;
   // situazione del cronometro (quarto, tempo, quarti giocati), fornita dalla pagina della partita
   @Input() getContestoLive: () => TContestoLive = () => ({ quarto: 1, tempo: globs.DurationRegulTime, quartoGiocato: () => false });

   @ViewChildren('canvasPbp') canvases?: QueryList<ElementRef<HTMLCanvasElement>>;

   public showFalli: boolean = true;
   public showSostit: boolean = true;
   public showMyTeam: boolean = true;
   public showOppoTeam: boolean = true;

   public quartiGiocati: TQuartoPbp[] = [];
   public activeQuartoIndex: number = 0;
   public myTeamNome: string = '';
   public oppoTeamNome: string = '';
   public myTeamPunti: number = 0;
   public oppoTeamPunti: number = 0;

   // grafico del quarto visibile (uno solo alla volta: i pannelli nascosti hanno dimensione zero)
   private chart: Chart | null = null;


   ngOnDestroy (): void
   {
      this.DistruggiGrafico();
   }


   Aggiorna (): void
   {
      const cm = matchGlobs.currMatch;
      if (!cm)
         return;
      const myTeam = cm.myTeam();
      const oppTeam = cm.oppTeam();
      const ops = cm.matchOperList()?.items() ?? [];
      const live = this.getContestoLive();
      this.myTeamNome = this.matchHeader?.myTeamNome_lk ?? '';
      this.oppoTeamNome = this.matchHeader?.oppoTeamNome_lk ?? '';

      const quarti: TQuartoPbp[] = [];
      let myTeamPti = 0;
      let oppoTeamPti = 0;
      for (let q = 1; q <= globs.MaxRegQuarters + globs.MaxExtraQuarters; q++)
      {
         const myQ = myTeam?.GetQuarto(q - 1)?.punti ?? 0;
         const oppQ = oppTeam?.GetQuarto(q - 1)?.punti ?? 0;
         if (live.quartoGiocato(q) || (myQ + oppQ > 0))
         {
            const regolare = (q <= globs.MaxRegQuarters);
            const durata = regolare ? globs.DurationRegulTime : globs.DurationExtraTime;
            quarti.push({
               titolo:         regolare ? `Quarto ${q}` : `Supplem. ${q - globs.MaxRegQuarters}`,
               numero:         q,
               myTeamPunti1:   myTeamPti,
               oppoTeamPunti1: oppoTeamPti,
               myTeamPunti2:   myTeamPti + myQ,
               oppoTeamPunti2: oppoTeamPti + oppQ,
               myData:         [],
               oppoData:       [],
               etichette:      new Map(),
               xMin:           0,
               xMax:           100,
               yMax:           durata / 60,
               beginAtZero:    (quarti.length === 0)
            });
         }
         myTeamPti += myQ;
         oppoTeamPti += oppQ;
      }
      this.myTeamPunti = myTeamPti;
      this.oppoTeamPunti = oppoTeamPti;

      for (const quarto of quarti)
      {
         const durata = quarto.yMax * 60;
         // minuti trascorsi nel quarto (il cronometro conta alla rovescia)
         const minuti = (tempo: number) => (durata - tempo) / 60;
         // il quarto in corso arriva fino al cronometro attuale
         const yFine = (live.quarto === quarto.numero) ? minuti(live.tempo) : quarto.yMax;
         const opsQ = ops.filter(o => o.quarter() === quarto.numero);
         const nomeTra = (p: TMatchPlayer | null) => p ? `(${p.playName()})` : '';
         const nome = (p: TMatchPlayer | null) => p ? p.playName() : '';
         let valoreMinimo = Math.min(quarto.myTeamPunti1, quarto.oppoTeamPunti1);
         if (quarto !== quarti[0])
            valoreMinimo -= 4;

         // MyTeam: canestri e tiri sbagliati
         let punti = quarto.myTeamPunti1;
         let prevMin = -1;
         let sposta = 0;
         quarto.myData.push({ x: punti, y: 0 });
         for (const op of opsQ.filter(o => o.myTeam()))
         {
            const delta = PuntiCanestro(op.oper());
            const sbagliato = TipoSbagliato(op.oper());
            if ((delta === 0) && !sbagliato)
               continue;
            const min = minuti(op.time());
            sposta = (min === prevMin) ? sposta + 1 : 0;
            if (delta > 0)
            {
               punti += delta;
               quarto.myData.push({ x: punti, y: min, player: nomeTra(op.player1()), delta, punti, tempo: TempoStr(op.time()), sameTime: sposta });
            }
            else
               quarto.myData.push({ x: punti, y: min, delta: 0, player: nomeTra(op.player1()), tempo: TempoStr(op.time()), sameTime: sposta, tipo: sbagliato });
            prevMin = min;
         }
         quarto.myData.push({ x: punti, y: yFine });
         quarto.xMin = valoreMinimo;
         quarto.xMax = punti + 6;

         // MyTeam: falli e sostituzioni (etichette a sinistra, all'altezza del minuto); quelle dello stesso
         // istante (es. sostituzioni multiple) si impilano una sotto l'altra
         prevMin = -1;
         sposta = 0;
         opsQ.filter(o => o.myTeam()).forEach((op, j) =>
         {
            const sostit = (op.oper() === TOperationType.totSostituz);
            if (!sostit && (op.oper() !== TOperationType.totFalloFatto))
               return;
            const tempo = TempoStr(op.time());
            const min = minuti(op.time());
            sposta = (min === prevMin) ? sposta + 1 : 0;
            quarto.etichette.set(`${sostit ? 'Sostit' : 'fallo'}_myteam_${j}_${tempo}`, {
               tipo:    sostit ? 'sostit' : 'fallo',
               xValue:  valoreMinimo,
               yValue:  min,
               ordine:  sposta,
               content: sostit ? `[${tempo}] in ${nome(op.player2())} ⇄ out ${nome(op.player1())}`
                               : `[${tempo}] Fallo ${nomeTra(op.player1())}`
            });
            prevMin = min;
         });

         // OppoTeam: solo i canestri
         punti = quarto.oppoTeamPunti1;
         prevMin = -1;
         sposta = 0;
         quarto.oppoData.push({ x: punti, y: 0 });
         for (const op of opsQ.filter(o => !o.myTeam()))
         {
            const delta = PuntiCanestro(op.oper());
            if (delta === 0)
               continue;
            punti += delta;
            const min = minuti(op.time());
            sposta = (min === prevMin) ? sposta + 1 : 0;
            prevMin = min;
            quarto.oppoData.push({ x: punti, y: min, player: nomeTra(op.player1()), punti, tempo: TempoStr(op.time()), sameTime: sposta });
         }
         quarto.oppoData.push({ x: punti, y: yFine });
         quarto.xMax = Math.max(quarto.xMax, punti + 6);
      }

      this.quartiGiocati = quarti;
      if (this.activeQuartoIndex >= quarti.length)
         this.activeQuartoIndex = Math.max(0, quarti.length - 1);
      // il grafico si crea dopo che la vista ha aggiornato i pannelli dei quarti
      setTimeout(() => this.MostraGrafico());
   }


   onQuartoChange (index: number): void
   {
      this.activeQuartoIndex = index;
      setTimeout(() => this.MostraGrafico());
   }


   OnToggleFalli (): void
   {
      this.chart?.update();
   }


   OnToggleSostit (): void
   {
      this.chart?.update();
   }


   OnToggleMyTeam (): void
   {
      if (this.chart)
         this.chart.data.datasets[0].hidden = !this.showMyTeam;
      this.chart?.update();
   }


   OnToggleOppoTeam (): void
   {
      if (this.chart)
         this.chart.data.datasets[1].hidden = !this.showOppoTeam;
      this.chart?.update();
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


   GetQuartoPunteggio (quarto: TQuartoPbp): string
   {
      if (this.matchHeader?.atHome)
         return `(${quarto.myTeamPunti1}-${quarto.oppoTeamPunti1})    ======>>    (${quarto.myTeamPunti2}-${quarto.oppoTeamPunti2})`;
      return `(${quarto.oppoTeamPunti1}-${quarto.myTeamPunti1})    ======>>    (${quarto.oppoTeamPunti2}-${quarto.myTeamPunti2})`;
   }


   GetQuartoParziale (quarto: TQuartoPbp): string
   {
      if (this.matchHeader?.atHome)
         return `(${quarto.myTeamPunti2 - quarto.myTeamPunti1}-${quarto.oppoTeamPunti2 - quarto.oppoTeamPunti1})`;
      return `(${quarto.oppoTeamPunti2 - quarto.oppoTeamPunti1}-${quarto.myTeamPunti2 - quarto.myTeamPunti1})`;
   }


   private DistruggiGrafico (): void
   {
      this.chart?.destroy();
      this.chart = null;
   }


   private CanvasQuarto (numero: number): HTMLCanvasElement | undefined
   {
      return this.canvases?.find(c => c.nativeElement.dataset['quarto'] === String(numero))?.nativeElement;
   }


   private async MostraGrafico (): Promise<void>
   {
      const ChartJs = await CaricaChartJs();
      this.DistruggiGrafico();
      const quarto = this.quartiGiocati[this.activeQuartoIndex];
      const canvas = quarto ? this.CanvasQuarto(quarto.numero) : undefined;
      if (!quarto || !canvas)
         return;
      this.chart = new ChartJs(canvas, this.ConfigGrafico(quarto, true));
   }


   // Configurazione del grafico (come nebula): grafico a gradini con l'asse dei punti in alto e i minuti di
   // gioco verso il basso; etichette dei canestri/tiri sbagliati (datalabels) e di falli e sostituzioni
   // (annotation). "aVideo" = false per il disegno fuori schermo dell'esportazione in PDF.
   private ConfigGrafico (quarto: TQuartoPbp,
                          aVideo: boolean): ChartConfiguration<'line'>
   {
      const pointStyle = (context: any) =>
      {
         const value = context.dataset.data[context.dataIndex] as TPuntoPbp;
         if (value?.delta != undefined)
            return (value.delta > 0) ? 'circle' : 'cross';
         return 'circle';
      };
      const annotations: Record<string, any> = {};
      quarto.etichette.forEach((e, key) =>
      {
         const fallo = (e.tipo === 'fallo');
         annotations[key] = {
            type:            'label',
            xValue:          e.xValue,
            yValue:          e.yValue,
            // dalla seconda etichetta dello stesso istante: sotto la precedente e un po' rientrata
            xAdjust:         (e.ordine > 0) ? ETICHETTA_RIENTRO : 0,
            yAdjust:         e.ordine * ETICHETTA_ALTEZZA,
            position:        { x: 'start', y: 'center' },
            backgroundColor: fallo ? '#ffd075' : '#86ffff',
            borderColor:     fallo ? '#593d00' : '#005959',
            borderWidth:     2,
            borderRadius:    4,
            content:         e.content,
            font:            { size: 14, weight: 'bold' },
            display:         () => fallo ? this.showFalli : this.showSostit
         };
      });
      return {
         type: 'line',
         data: {
            datasets: [
               {
                  label:                this.myTeamNome,
                  data:                 quarto.myData as any,
                  borderColor:          'rgb(255, 0, 0)',
                  stepped:              'after',
                  pointRadius:          6,
                  pointBackgroundColor: '#ff7777',
                  pointBorderWidth:     2,
                  pointStyle,
                  hidden:               !this.showMyTeam
               },
               {
                  label:                this.oppoTeamNome,
                  data:                 quarto.oppoData as any,
                  borderColor:          'rgb(0, 127, 0)',
                  stepped:              'after',
                  pointRadius:          6,
                  pointBackgroundColor: '#77ff77',
                  pointBorderWidth:     2,
                  pointStyle,
                  hidden:               !this.showOppoTeam
               }
            ]
         },
         options: {
            responsive:          aVideo,
            maintainAspectRatio: false,
            animation:           aVideo ? undefined : false,
            devicePixelRatio:    aVideo ? undefined : 1,
            indexAxis:           'y',
            layout:              { padding: { left: 20 } },
            scales: {
               x: {
                  type:        'linear',
                  position:    'top',
                  beginAtZero: quarto.beginAtZero,
                  min:         quarto.xMin,
                  max:         quarto.xMax,
                  title:       { display: true, text: 'Punti' },
                  ticks:       { stepSize: 1 }
               },
               y: {
                  type:    'linear',
                  reverse: true,
                  min:     0,
                  max:     quarto.yMax,
                  title:   { display: true, text: 'Minuti di gioco' },
                  ticks:   { stepSize: 1 }
               }
            },
            plugins: {
               datalabels: {
                  backgroundColor: (context: any) => context.dataset.borderColor as string,
                  borderColor: (context: any) =>
                  {
                     const value = context.dataset.data[context.dataIndex] as TPuntoPbp;
                     return (value.delta === 0) ? 'black' : '#aaaaaa';
                  },
                  borderWidth:  2,
                  borderRadius: 4,
                  color: (context: any) =>
                  {
                     const value = context.dataset.data[context.dataIndex] as TPuntoPbp;
                     return (value.delta === 0) ? 'black' : 'white';
                  },
                  font:   { weight: 'bold', size: 16 },
                  // con indexAxis 'y' l'etichetta segue la coordinata x (i punti); gli eventi allo stesso
                  // minuto si sfalsano alternando a destra e scendendo
                  anchor: 'start',
                  offset: (context: any) =>
                  {
                     const value = context.dataset.data[context.dataIndex] as TPuntoPbp;
                     if (value.sameTime != undefined)
                     {
                        const dx = 8 + ((value.sameTime % 2) * LABEL_OFFSET);
                        const dy = Math.trunc(value.sameTime / 2) * 10;
                        return Math.sqrt(dx * dx + dy * dy);
                     }
                     return 8;
                  },
                  align: (context: any) =>
                  {
                     const value = context.dataset.data[context.dataIndex] as TPuntoPbp;
                     if (value.sameTime != undefined)
                     {
                        const dx = 8 + ((value.sameTime % 2) * LABEL_OFFSET);
                        const dy = Math.trunc(value.sameTime / 2) * 10;
                        return Math.atan2(dy, dx) * 180 / 3.1415;
                     }
                     return 0;
                  },
                  formatter: (value: TPuntoPbp) =>
                  {
                     let dlt = '';
                     if (value.delta === 3)
                        dlt = `{+3️⃣}  ->  `;
                     else if (value.delta === 2)
                        dlt = `{+2️⃣}  ->  `;
                     else if (value.delta === 1)
                        dlt = `{+1️⃣}  ->  `;
                     else if (value.tipo)
                        dlt = `x${value.tipo}  `;
                     const pl = value.player ? `       ${value.player}` : '';
                     const tmp = value.tempo ? `[${value.tempo}]  ` : '';
                     return `${tmp}${dlt}${value.x}${pl}`;
                  },
                  display: true
               },
               tooltip: {
                  callbacks: {
                     label: (context: any) => `Punti: ${context.raw.x} al minuto ${context.raw.y}`
                  }
               },
               annotation: { annotations }
            }
         } as any
      };
   }


   // PDF A3 verticale, una pagina per quarto (come nebula): titolo con punteggio, quarto, punteggio e
   // parziale del quarto, grafico. Ogni grafico si disegna fuori schermo alla larghezza di quello a video.
   async EsportaPdf (): Promise<void>
   {
      this.Aggiorna();
      if (this.quartiGiocati.length === 0)
         return;
      const [{ default: jsPDF }, ChartJs] = await Promise.all([import('jspdf'), CaricaChartJs()]);
      const pdf = new jsPDF('p', 'mm', 'a3');
      const pageWidth = 297;
      const pageHeight = 420;
      const margin = 10;
      const atHome = !!this.matchHeader?.atHome;
      const titleText = atHome
         ? `${this.myTeamNome} - ${this.oppoTeamNome}      ${this.myTeamPunti} - ${this.oppoTeamPunti}`
         : `${this.oppoTeamNome} - ${this.myTeamNome}      ${this.oppoTeamPunti} - ${this.myTeamPunti}`;
      const attivo = this.quartiGiocati[this.activeQuartoIndex];
      const larghezza = (attivo ? this.CanvasQuarto(attivo.numero)?.parentElement?.clientWidth : 0) || 1600;
      const altezza = 2000;

      // contenitore fuori schermo per i grafici da esportare
      const contenitore = document.createElement('div');
      contenitore.style.cssText = `position: fixed; left: -${larghezza + 100}px; top: 0; width: ${larghezza}px; height: ${altezza}px;`;
      document.body.appendChild(contenitore);
      try
      {
         this.quartiGiocati.forEach((quarto, i) =>
         {
            if (i > 0)
               pdf.addPage();

            // intestazione partita, quarto, punteggio e parziale
            let y = 10;
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text(titleText, pageWidth / 2, y, { align: 'center' });
            y += 7;
            pdf.setFontSize(12);
            pdf.text(quarto.titolo, pageWidth / 2, y, { align: 'center' });
            y += 6;
            pdf.setFontSize(10);
            pdf.text(`Punteggio: ${this.GetQuartoPunteggio(quarto)}`, pageWidth / 2, y, { align: 'center' });
            y += 5;
            pdf.text(`Parziale: ${this.GetQuartoParziale(quarto)}`, pageWidth / 2, y, { align: 'center' });
            y += 5;

            // grafico
            const canvas = document.createElement('canvas');
            canvas.width = larghezza;
            canvas.height = altezza;
            contenitore.appendChild(canvas);
            const chart = new ChartJs(canvas, this.ConfigGrafico(quarto, false));
            const imgW = pageWidth - 2 * margin;
            const imgH = pageHeight - y - margin;
            // risoluzione utile in stampa (~200dpi), su sfondo bianco (niente canale alpha nel PNG)
            const pxPerMm = 200 / 25.4;
            const targetW = Math.round(imgW * pxPerMm);
            const targetH = Math.round(imgH * pxPerMm);
            const offCanvas = document.createElement('canvas');
            offCanvas.width = targetW;
            offCanvas.height = targetH;
            const offCtx = offCanvas.getContext('2d');
            let imgData: string;
            if (offCtx)
            {
               offCtx.fillStyle = '#ffffff';
               offCtx.fillRect(0, 0, targetW, targetH);
               offCtx.drawImage(chart.canvas, 0, 0, targetW, targetH);
               imgData = offCanvas.toDataURL('image/png');
            }
            else
               imgData = chart.toBase64Image('image/png', 1);
            chart.destroy();
            canvas.remove();
            if (imgData.startsWith('data:image/png'))
               pdf.addImage(imgData, 'PNG', margin, y, imgW, imgH, undefined, 'FAST');
         });
      }
      finally
      {
         contenitore.remove();
      }
      pdf.save(`G_${this.matchHeader?.title || 'partita'}-grafici.pdf`);
   }
}


// punti di un canestro (0 se l'operazione non è un canestro)
function PuntiCanestro (oper: TOperationType): number
{
   switch (oper)
   {
      case TOperationType.totTLYes: return 1;
      case TOperationType.totT2Yes: return 2;
      case TOperationType.totT3Yes: return 3;
      default:                      return 0;
   }
}


// tipo di un tiro sbagliato ('' se l'operazione non è un tiro sbagliato)
function TipoSbagliato (oper: TOperationType): string
{
   switch (oper)
   {
      case TOperationType.totTLNo: return 'TL';
      case TOperationType.totT2No: return 'T2';
      case TOperationType.totT3No: return 'T3';
      default:                     return '';
   }
}
