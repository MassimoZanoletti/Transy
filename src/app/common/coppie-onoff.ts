import {
   BoxVuotoQ,
   MinutiQuintetto,
   NetQuintetto,
   NumQ,
   PlusMinusQuintetto,
   TBoxQuintetto,
   TGiocatoreQuintetto,
   TInCampoStat,
   TQuintettoStat
} from "./quintetti";
import {COLORE_LORO, COLORE_NOI, COLORE_NOI_PDF} from "./grafico-differenza";


// Coppie di giocatori e On/Off, ricavati dai quintetti (quintetti.ts): ogni quintetto sa chi era in campo,
// per quanto e con quali punti/possessi delle due squadre, quindi basta sommarli.
//  - coppia (i, j): somma dei quintetti in cui i e j erano in campo insieme; sulla diagonale il giocatore da solo
//  - On/Off: per ogni giocatore la somma dei quintetti con lui in campo (On) e senza di lui (Off)


export interface TOnOffGiocatore
{
   giocatore: TGiocatoreQuintetto;
   on: TInCampoStat;
   off: TInCampoStat;
}


export interface TMatriceCoppie
{
   giocatori: TGiocatoreQuintetto[];         // in ordine di minuti giocati
   celle: TInCampoStat[][];                  // [riga][colonna], simmetrica
}


export type TMetricaCoppie = 'pm' | 'min' | 'net';


const InCampoVuoto = (): TInCampoStat => ({ secondi: 0, noi: BoxVuotoQ(), loro: BoxVuotoQ() });


function Somma (a: TInCampoStat,
                b: TInCampoStat): void
{
   const box = (x: TBoxQuintetto, y: TBoxQuintetto) =>
   {
      x.punti += y.punti; x.fga += y.fga; x.fta += y.fta; x.ra += y.ra; x.pp += y.pp;
   };
   a.secondi += b.secondi;
   box(a.noi, b.noi);
   box(a.loro, b.loro);
}


export function OnOff (quintetti: TQuintettoStat[]): TOnOffGiocatore[]
{
   const totale = InCampoVuoto();
   quintetti.forEach(q => Somma(totale, q));
   const giocatori = new Map<number, TOnOffGiocatore>();
   for (const q of quintetti)
      for (const g of q.giocatori)
      {
         let r = giocatori.get(g.id);
         if (!r)
         {
            r = { giocatore: g, on: InCampoVuoto(), off: InCampoVuoto() };
            giocatori.set(g.id, r);
         }
         Somma(r.on, q);
      }
   // Off = totale della squadra meno On
   for (const r of giocatori.values())
   {
      r.off = InCampoVuoto();
      Somma(r.off, totale);
      r.off.secondi -= r.on.secondi;
      for (const k of ['punti', 'fga', 'fta', 'ra', 'pp'] as const)
      {
         r.off.noi[k] -= r.on.noi[k];
         r.off.loro[k] -= r.on.loro[k];
      }
   }
   return [...giocatori.values()].sort((a, b) => b.on.secondi - a.on.secondi);
}


// Differenza di Net rating fra giocatore in campo e in panchina; null se uno dei due non è calcolabile
export function DiffOnOff (r: TOnOffGiocatore): number | null
{
   const on = NetQuintetto(r.on);
   const off = NetQuintetto(r.off);
   return ((on !== null) && (off !== null)) ? on - off : null;
}


export function MatriceCoppie (quintetti: TQuintettoStat[]): TMatriceCoppie
{
   const giocatori = OnOff(quintetti).map(r => r.giocatore);
   const indice = new Map<number, number>(giocatori.map((g, i) => [g.id, i]));
   const celle = giocatori.map(() => giocatori.map(() => InCampoVuoto()));
   for (const q of quintetti)
   {
      const idx = q.giocatori.map(g => indice.get(g.id)!).filter(i => i !== undefined);
      for (const i of idx)
         for (const j of idx)
            Somma(celle[i][j], q);
   }
   return { giocatori, celle };
}


// Valore della cella secondo la metrica scelta (null = non calcolabile o mai insieme)
export function ValoreCoppia (c: TInCampoStat,
                              metrica: TMetricaCoppie): number | null
{
   if (c.secondi <= 0)
      return null;
   switch (metrica)
   {
      case 'pm':  return PlusMinusQuintetto(c);
      case 'min': return c.secondi / 60;
      case 'net': return NetQuintetto(c);
   }
}


export function TestoCoppia (c: TInCampoStat,
                             metrica: TMetricaCoppie): string
{
   const v = ValoreCoppia(c, metrica);
   if (v === null)
      return '';
   return (metrica === 'min') ? MinutiQuintetto(c) : NumQ((metrica === 'net') ? Math.round(v) : v, true);
}


// Scala dei colori: massimo assoluto fuori dalla diagonale (la diagonale, il giocatore da solo, viene
// tagliata al massimo)
export function MaxScalaCoppie (m: TMatriceCoppie,
                                metrica: TMetricaCoppie): number
{
   let max = 0;
   m.celle.forEach((riga, i) => riga.forEach((c, j) =>
   {
      const v = ValoreCoppia(c, metrica);
      if ((i !== j) && (v !== null))
         max = Math.max(max, Math.abs(v));
   }));
   return max || 1;
}


// Colore della cella: rosso (positivo / minuti, a nostro favore) o azzurro (negativo), intensità
// proporzionale al valore. Restituisce colore e intensità 0..1; pdf: rosso più pieno per il fondo bianco
export function ColoreCoppia (v: number | null,
                              max: number,
                              pdf: boolean = false): { colore: string, k: number } | null
{
   if ((v === null) || (v === 0))
      return null;
   return { colore: (v > 0) ? (pdf ? COLORE_NOI_PDF : COLORE_NOI) : COLORE_LORO, k: Math.min(1, Math.abs(v) / max) };
}


export const ETICHETTE_METRICA: Record<TMetricaCoppie, string> = {
   pm:  '+/- insieme',
   min: 'Minuti insieme',
   net: 'Net rating insieme (per 100 possessi)'
};


// ---------------------------------------------------------------- PDF

const Rgb = (hex: string): number[] => [1, 3, 5].map(i => parseInt(hex.substring(i, i + 2), 16));


// Matrice delle coppie nel PDF: celle colorate su fondo bianco (colore schiarito secondo l'intensità)
export function MatriceCoppiePdf (pdf: any,
                                  autoTable: any,
                                  m: TMatriceCoppie,
                                  metrica: TMetricaCoppie,
                                  startY: number,
                                  font: string): number
{
   const max = MaxScalaCoppie(m, metrica);
   autoTable(pdf, {
      startY,
      head: [['', ...m.giocatori.map(g => g.numero)]],
      body: m.giocatori.map((g, i) => [
         `${g.numero} ${g.nome}`,
         ...m.celle[i].map((c, j) =>
         {
            const col = ColoreCoppia(ValoreCoppia(c, metrica), max, true);
            const fill = col ? Rgb(col.colore).map(x => Math.round(255 + (x - 255) * 0.75 * col.k)) : [255, 255, 255];
            return { content: TestoCoppia(c, metrica), styles: { fillColor: fill, fontStyle: (i === j) ? 'bold' : 'normal' } };
         })
      ]),
      styles:       { font, halign: 'center' },
      headStyles:   { fillColor: [255, 190, 0], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9, cellPadding: 0.8 },
      bodyStyles:   { fontSize: 8, cellPadding: 0.8, textColor: [0, 0, 0] },
      columnStyles: { 0: { halign: 'left', cellWidth: 45, fontStyle: 'bold' } },
      margin:       { left: 5, right: 5 },
      theme:        'grid'
   });
   const y = (pdf as any).lastAutoTable.finalY + 5;
   pdf.setFontSize(8);
   pdf.setFont(font, 'normal');
   pdf.setTextColor(90, 90, 90);
   pdf.text(`${ETICHETTE_METRICA[metrica]}. Sulla diagonale il giocatore da solo (tutto il tempo in campo). Rosso: positivo (a nostro favore), azzurro: negativo.`, 5, y);
   pdf.setTextColor(0, 0, 0);
   return y;
}


export function TabellaOnOffPdf (pdf: any,
                                 autoTable: any,
                                 righe: TOnOffGiocatore[],
                                 startY: number,
                                 font: string): number
{
   const colore = (v: number | null) => ((v ?? 0) > 0) ? { textColor: [0, 140, 0], fontStyle: 'bold' }
                                      : ((v ?? 0) < 0) ? { textColor: [210, 0, 0], fontStyle: 'bold' } : {};
   const min = (c: TInCampoStat) => (c.secondi > 0) ? MinutiQuintetto(c) : '';
   const pm = (c: TInCampoStat) => (c.secondi > 0) ? PlusMinusQuintetto(c) : null;
   autoTable(pdf, {
      startY,
      head: [
         [{ content: '', colSpan: 1 }, { content: 'In campo (On)', colSpan: 3 }, { content: 'In panchina (Off)', colSpan: 3 }, { content: 'On - Off', colSpan: 1 }],
         ['Giocatore', 'Min', '+/-', 'Net', 'Min', '+/-', 'Net', 'Net']
      ],
      body: righe.map(r => [
         `${r.giocatore.numero} ${r.giocatore.nome}`,
         min(r.on), { content: NumQ(pm(r.on), true), styles: colore(pm(r.on)) }, NumQ(NetQuintetto(r.on), true),
         min(r.off), { content: NumQ(pm(r.off), true), styles: colore(pm(r.off)) }, NumQ(NetQuintetto(r.off), true),
         { content: NumQ(DiffOnOff(r), true), styles: colore(DiffOnOff(r)) }
      ]),
      styles:       { font, halign: 'right' },
      headStyles:   { fillColor: [255, 190, 0], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9, cellPadding: 0.8, halign: 'center' },
      bodyStyles:   { fontSize: 9, cellPadding: 0.8, fillColor: [255, 255, 255], textColor: [0, 0, 0] },
      alternateRowStyles: { fillColor: [221, 221, 221] },
      columnStyles: { 0: { halign: 'left', cellWidth: 50 } },
      tableWidth:   180,
      margin:       { left: 5 },
      theme:        'grid'
   });
   return (pdf as any).lastAutoTable.finalY;
}
