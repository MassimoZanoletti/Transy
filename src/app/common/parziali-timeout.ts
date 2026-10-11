import {COLORE_LORO, COLORE_NOI_PDF, EtichettaQuarto, TSerieDiff} from "./grafico-differenza";
import {TempoStr} from "./statistiche";


// Parziali (punti consecutivi di una squadra senza risposta dell'altra) ed efficacia dei timeout (punti
// fatti e subiti nei minuti prima e dopo ogni timeout), ricavati dalla serie dello scarto (grafico-differenza.ts).


// Parziale minimo da segnalare (es. 8-0)
export const MIN_PARZIALE = 8;
// Finestra prima e dopo il timeout, in secondi di gioco (limitata dall'inizio/fine del quarto)
export const FINESTRA_TIMEOUT = 180;


export interface TParziale
{
   myTeam: boolean;            // squadra che ha fatto il parziale
   punti: number;
   t0: number;                 // secondi di gioco del primo e dell'ultimo canestro del parziale
   t1: number;
   quarto0: number;
   tempo0: number;
   quarto1: number;
   tempo1: number;
   myPrima: number;            // punteggio prima del parziale
   oppPrima: number;
}


// Punti delle due squadre in una finestra prima/dopo un timeout (sempre MyTeam - OppoTeam)
export interface TFinestra
{
   my: number;
   opp: number;
   secondi: number;            // durata effettiva della finestra
}


// Tutto dal punto di vista di MyTeam (la squadra delle statistiche): punteggi e finestre in ordine noi-loro,
// differenze positive quando è andata meglio a noi, qualunque squadra abbia chiamato il timeout
export interface TTimeoutEsito
{
   myTeam: boolean;            // squadra che ha chiamato il timeout
   t: number;
   quarto: number;
   tempo: number;
   my: number;                 // punteggio al momento del timeout
   opp: number;
   prima: TFinestra;
   dopo: TFinestra;
   primoASegnare: 'my' | 'opp' | null;   // squadra del primo canestro dopo il timeout (null: nessuno nel quarto)
}


// Riepilogo dei timeout chiamati da una squadra (una partita o il campionato), sempre dal punto di vista di MyTeam
export interface TRiepilogoTimeout
{
   numero: number;
   sommaPrima: number;         // somma delle differenze noi - loro nelle finestre prima
   sommaDopo: number;
   favorevoli: number;         // finestre dopo con differenza a favore di MyTeam
   primoNostro: number;        // volte in cui il primo canestro dopo il timeout è stato di MyTeam
}


// Canestri della serie come variazioni (indice, t, squadra, punti), senza lo 0-0 iniziale e la chiusura
function Canestri (serie: TSerieDiff): { i: number, t: number, quarto: number, tempo: number, my: boolean, punti: number }[]
{
   const c: { i: number, t: number, quarto: number, tempo: number, my: boolean, punti: number }[] = [];
   for (let i = 1; i < serie.punti.length; i++)
   {
      const p = serie.punti[i];
      const prec = serie.punti[i - 1];
      const dMy = p.my - prec.my;
      const dOpp = p.opp - prec.opp;
      if ((dMy > 0) || (dOpp > 0))
         c.push({ i, t: p.t, quarto: p.quarto, tempo: p.tempo, my: dMy > 0, punti: dMy + dOpp });
   }
   return c;
}


export function Parziali (serie: TSerieDiff,
                          minimo: number = MIN_PARZIALE): TParziale[]
{
   const parziali: TParziale[] = [];
   const canestri = Canestri(serie);
   let k = 0;
   while (k < canestri.length)
   {
      const primo = canestri[k];
      let punti = 0;
      let j = k;
      while ((j < canestri.length) && (canestri[j].my === primo.my))
      {
         punti += canestri[j].punti;
         j++;
      }
      const ultimo = canestri[j - 1];
      if (punti >= minimo)
      {
         const prima = serie.punti[primo.i - 1];
         parziali.push({
            myTeam: primo.my, punti,
            t0: primo.t, t1: ultimo.t,
            quarto0: primo.quarto, tempo0: primo.tempo, quarto1: ultimo.quarto, tempo1: ultimo.tempo,
            myPrima: prima.my, oppPrima: prima.opp
         });
      }
      k = j;
   }
   return parziali;
}


export function EsitiTimeout (serie: TSerieDiff,
                              finestra: number = FINESTRA_TIMEOUT): TTimeoutEsito[]
{
   const canestri = Canestri(serie);
   return serie.timeout.map(to =>
   {
      const q = serie.quarti[to.quarto - 1];
      const inizio = Math.max(q?.inizio ?? 0, to.t - finestra);
      const fine = Math.min(q?.fine ?? serie.durata, to.t + finestra);
      const somma = (lista: typeof canestri, secondi: number): TFinestra => ({
         my:  lista.filter(c => c.my).reduce((a, c) => a + c.punti, 0),
         opp: lista.filter(c => !c.my).reduce((a, c) => a + c.punti, 0),
         secondi
      });
      const prima = canestri.filter(c => (c.i < to.iPunto) && (c.t >= inizio) && (c.quarto === to.quarto));
      const dopo = canestri.filter(c => (c.i >= to.iPunto) && (c.t <= fine) && (c.quarto === to.quarto));
      const punteggio = serie.punti[Math.max(0, to.iPunto - 1)];
      const primo = canestri.find(c => (c.i >= to.iPunto) && (c.quarto === to.quarto));
      return {
         myTeam: to.myTeam, t: to.t, quarto: to.quarto, tempo: to.tempo,
         my: punteggio.my, opp: punteggio.opp,
         prima: somma(prima, to.t - inizio),
         dopo: somma(dopo, Math.max(0, fine - to.t)),
         primoASegnare: primo ? (primo.my ? 'my' : 'opp') : null
      };
   });
}


export function RiepilogoVuoto (): TRiepilogoTimeout
{
   return { numero: 0, sommaPrima: 0, sommaDopo: 0, favorevoli: 0, primoNostro: 0 };
}


// Aggiunge al riepilogo i timeout chiamati dalla squadra indicata (true = MyTeam)
export function AccumulaTimeout (r: TRiepilogoTimeout,
                                 esiti: TTimeoutEsito[],
                                 myTeam: boolean): void
{
   for (const e of esiti.filter(x => x.myTeam === myTeam))
   {
      const dopo = e.dopo.my - e.dopo.opp;
      r.numero++;
      r.sommaPrima += e.prima.my - e.prima.opp;
      r.sommaDopo += dopo;
      if (dopo > 0)
         r.favorevoli++;
      if (e.primoASegnare === 'my')
         r.primoNostro++;
   }
}


export const QuandoStr = (quarto: number, tempo: number) => `${EtichettaQuarto(quarto)} ${TempoStr(tempo)}`;

export const DiffStr = (d: number) => (d > 0) ? `+${d}` : `${d}`;

export const MediaStr = (somma: number, n: number) =>
   (n > 0) ? DiffStr(Math.round(10 * somma / n) / 10).replace('.', ',') : '';


// ---------------------------------------------------------------- PDF

// Tabelle dei parziali e dei timeout (con il riepilogo) nel PDF. nomi: [MyTeam, OppoTeam]. Con "partita"
// (pagina del campionato) i parziali hanno una colonna con la partita. Punteggi sempre in ordine noi-loro, i
// numeri col colore della squadra (rosso noi, azzurro loro); differenze sempre dal punto di vista di MyTeam.
// Restituisce la y finale.
export function TabelleParzialiTimeoutPdf (pdf: any,
                                           autoTable: any,
                                           parziali: { partita?: string, p: TParziale }[],
                                           esiti: TTimeoutEsito[] | null,
                                           riepilogo: { noi: TRiepilogoTimeout, loro: TRiepilogoTimeout },
                                           nomi: [string, string],
                                           startY: number,
                                           font: string): number
{
   const rgb = (hex: string): number[] => [1, 3, 5].map(i => parseInt(hex.substring(i, i + 2), 16));
   const NOI = rgb(COLORE_NOI_PDF);
   const LORO = rgb(COLORE_LORO);
   const verde = { textColor: [0, 140, 0], fontStyle: 'bold' };
   const rosso = { textColor: [210, 0, 0], fontStyle: 'bold' };
   const colore = (d: number) => (d > 0) ? verde : (d < 0) ? rosso : {};
   const squadra = (my: boolean) => ({ content: my ? nomi[0] : nomi[1], styles: { textColor: my ? NOI : LORO, fontStyle: 'bold' } });
   // punteggio "noi-loro" con i due numeri nei colori delle squadre: il testo lo disegna didDrawCell
   const coppia = (my: number, opp: number) => ({ content: `${my}-${opp}`, coppia: [my, opp] });
   const disegnaCoppie = {
      willDrawCell: (d: any) =>
      {
         if ((d.section === 'body') && d.cell.raw?.coppia)
            d.cell.text = [];
      },
      didDrawCell: (d: any) =>
      {
         if ((d.section !== 'body') || !d.cell.raw?.coppia)
            return;
         const [my, opp] = d.cell.raw.coppia as number[];
         pdf.setFont(font, 'bold');
         pdf.setFontSize(d.cell.styles.fontSize);
         const parti: [string, number[]][] = [[String(my), NOI], ['-', [0, 0, 0]], [String(opp), LORO]];
         let x = d.cell.x + (d.cell.width - parti.reduce((a, [t]) => a + pdf.getTextWidth(t), 0)) / 2;
         for (const [t, c] of parti)
         {
            pdf.setTextColor(...c);
            pdf.text(t, x, d.cell.y + d.cell.height / 2, { baseline: 'middle' });
            x += pdf.getTextWidth(t);
         }
         pdf.setTextColor(0, 0, 0);
         pdf.setFont(font, 'normal');
      }
   };
   const stile: any = {
      styles:       { font, halign: 'center' },
      headStyles:   { fillColor: [255, 190, 0], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9, cellPadding: 0.8 },
      bodyStyles:   { fontSize: 9, cellPadding: 0.8, fillColor: [255, 255, 255], textColor: [0, 0, 0] },
      alternateRowStyles: { fillColor: [221, 221, 221] },
      margin:       { left: 5, right: 5 },
      theme:        'grid'
   };
   const titoletto = (testo: string, y: number) =>
   {
      pdf.setFontSize(11);
      pdf.setFont(font, 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(testo, 5, y);
      return y + 2;
   };

   // riepilogo timeout
   let y = titoletto(`Efficacia dei timeout (${FINESTRA_TIMEOUT / 60} minuti prima e dopo, nello stesso quarto)`, startY);
   const rigaRiep = (my: boolean, r: TRiepilogoTimeout) => [
      { ...squadra(my), styles: { ...squadra(my).styles, halign: 'left' } }, String(r.numero),
      { content: MediaStr(r.sommaPrima, r.numero), styles: colore(r.sommaPrima) },
      { content: MediaStr(r.sommaDopo, r.numero), styles: colore(r.sommaDopo) },
      (r.numero > 0) ? `${r.favorevoli} / ${r.numero}` : '', (r.numero > 0) ? `${r.primoNostro} / ${r.numero}` : ''
   ];
   autoTable(pdf, {
      startY: y,
      head: [['Timeout chiamati da', 'Numero', `Media prima (pro ${nomi[0]})`, `Media dopo (pro ${nomi[0]})`,
              `Dopo a favore di ${nomi[0]}`, `Primo canestro di ${nomi[0]}`]],
      body: [rigaRiep(true, riepilogo.noi), rigaRiep(false, riepilogo.loro)],
      ...stile,
      tableWidth: 220
   });
   y = (pdf as any).lastAutoTable.finalY + 6;

   // elenco dei timeout (solo nella partita)
   if (esiti && (esiti.length > 0))
   {
      autoTable(pdf, {
         startY: y,
         head: [['Chiamato da', 'Quando', 'Punteggio', `Prima ${FINESTRA_TIMEOUT / 60}'`, `Dopo ${FINESTRA_TIMEOUT / 60}'`,
                 `Diff. dopo (pro ${nomi[0]})`, 'Primo a segnare']],
         body: esiti.map(e => [
            { ...squadra(e.myTeam), styles: { ...squadra(e.myTeam).styles, halign: 'left' } },
            QuandoStr(e.quarto, e.tempo),
            coppia(e.my, e.opp), coppia(e.prima.my, e.prima.opp), coppia(e.dopo.my, e.dopo.opp),
            { content: DiffStr(e.dopo.my - e.dopo.opp), styles: colore(e.dopo.my - e.dopo.opp) },
            (e.primoASegnare === null) ? '' : squadra(e.primoASegnare === 'my')
         ]),
         ...stile,
         ...disegnaCoppie,
         tableWidth: 220
      });
      y = (pdf as any).lastAutoTable.finalY + 6;
   }

   // parziali
   if (y > 170)
   {
      pdf.addPage();
      y = 10;
   }
   y = titoletto(`Parziali di almeno ${MIN_PARZIALE} punti senza risposta`, y);
   if (parziali.length === 0)
   {
      pdf.setFontSize(9);
      pdf.setFont(font, 'normal');
      pdf.text('Nessun parziale.', 5, y + 4);
      return y + 6;
   }
   const conPartita = parziali.some(x => x.partita !== undefined);
   autoTable(pdf, {
      startY: y,
      head: [[...(conPartita ? ['Partita'] : []), 'Squadra', 'Parziale', 'Da', 'A', 'Punteggio prima', 'Punteggio dopo']],
      body: parziali.map(({ partita, p }) => [
         ...(conPartita ? [{ content: partita ?? '', styles: { halign: 'left' } }] : []),
         { ...squadra(p.myTeam), styles: { ...squadra(p.myTeam).styles, halign: 'left' } },
         { content: `${p.punti}-0`, styles: p.myTeam ? verde : rosso },
         QuandoStr(p.quarto0, p.tempo0), QuandoStr(p.quarto1, p.tempo1),
         coppia(p.myPrima, p.oppPrima),
         p.myTeam ? coppia(p.myPrima + p.punti, p.oppPrima) : coppia(p.myPrima, p.oppPrima + p.punti)
      ]),
      ...stile,
      ...disegnaCoppie,
      tableWidth: conPartita ? 250 : 190
   });
   y = (pdf as any).lastAutoTable.finalY + 4;
   pdf.setFontSize(8);
   pdf.setFont(font, 'normal');
   pdf.setTextColor(90, 90, 90);
   pdf.text(`Punteggi sempre nell'ordine ${nomi[0]} - ${nomi[1]} (rosso ${nomi[0]}, azzurro ${nomi[1]}). ` +
            `Differenze dal punto di vista di ${nomi[0]}: verde a favore, rosso contro.`, 5, y);
   pdf.setTextColor(0, 0, 0);
   return y;
}


// Stessi dati visti dall'altra squadra (pagina del campionato, quando la squadra scelta è OppoTeam della partita)
export function InvertiParziale (p: TParziale): TParziale
{
   return { ...p, myTeam: !p.myTeam, myPrima: p.oppPrima, oppPrima: p.myPrima };
}


export function InvertiEsito (e: TTimeoutEsito): TTimeoutEsito
{
   const gira = (f: TFinestra): TFinestra => ({ my: f.opp, opp: f.my, secondi: f.secondi });
   return {
      ...e, myTeam: !e.myTeam, my: e.opp, opp: e.my, prima: gira(e.prima), dopo: gira(e.dopo),
      primoASegnare: (e.primoASegnare === null) ? null : ((e.primoASegnare === 'my') ? 'opp' : 'my')
   };
}
