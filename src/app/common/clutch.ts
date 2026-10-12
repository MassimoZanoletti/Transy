import {TMatchPlayer} from "../models/datamod";
import {TOperation, TOperationType} from "./operation";
import {TContestoLive, TTiriStat} from "./statistiche";
import {CLUTCH_SCARTO, CLUTCH_SECONDI, DurataQuarto, InClutch} from "./grafico-differenza";
import {AccumulaQuintetti, AnalisiInCampo, TQuintettoStat} from "./quintetti";
import {OnOff} from "./coppie-onoff";


// Clutch (finale punto a punto): ultimi 5 minuti del 4° quarto e dei supplementari con scarto entro 5
// punti (InClutch, sul punteggio prima dell'azione). Statistiche di squadra nel clutch e nel resto della
// partita (per il confronto), dei giocatori e dei quintetti della squadra scelta (lato).


export interface TBoxClutch
{
   punti: number;
   t2: TTiriStat;
   t3: TTiriStat;
   tl: TTiriStat;
   pp: number;
   ra: number;
   rd: number;
   as: number;
}


export interface TGiocatoreClutch
{
   id: number;
   numero: string;
   nome: string;
   secondi: number;            // in campo durante il clutch
   pm: number;
   box: TBoxClutch;
}


export interface TClutch
{
   secondi: number;            // durata del clutch
   partite: number;            // partite con almeno un po' di clutch
   vinte: number;
   perse: number;
   noi: TBoxClutch;            // in clutch
   loro: TBoxClutch;
   restoNoi: TBoxClutch;       // nel resto della partita (per il confronto)
   restoLoro: TBoxClutch;
   secondiResto: number;
   giocatori: TGiocatoreClutch[];
   quintetti: TQuintettoStat[];
}


export const BoxClutchVuoto = (): TBoxClutch => ({
   punti: 0, t2: { realizzati: 0, tentati: 0 }, t3: { realizzati: 0, tentati: 0 }, tl: { realizzati: 0, tentati: 0 },
   pp: 0, ra: 0, rd: 0, as: 0
});


export function ClutchVuoto (): TClutch
{
   return { secondi: 0, partite: 0, vinte: 0, perse: 0, noi: BoxClutchVuoto(), loro: BoxClutchVuoto(),
            restoNoi: BoxClutchVuoto(), restoLoro: BoxClutchVuoto(), secondiResto: 0, giocatori: [], quintetti: [] };
}


// Aggiunge l'azione al box (tiri, palle perse, rimbalzi, assist)
function Registra (b: TBoxClutch,
                   tipo: TOperationType): void
{
   switch (tipo)
   {
      case TOperationType.totT2Yes: b.t2.realizzati++; b.t2.tentati++; b.punti += 2; break;
      case TOperationType.totT2No:  b.t2.tentati++; break;
      case TOperationType.totT3Yes: b.t3.realizzati++; b.t3.tentati++; b.punti += 3; break;
      case TOperationType.totT3No:  b.t3.tentati++; break;
      case TOperationType.totTLYes: b.tl.realizzati++; b.tl.tentati++; b.punti += 1; break;
      case TOperationType.totTLNo:  b.tl.tentati++; break;
      case TOperationType.totPPersa:      b.pp++; break;
      case TOperationType.totRimbAttacco: b.ra++; break;
      case TOperationType.totRimbDifesa:  b.rd++; break;
      case TOperationType.totAssist:      b.as++; break;
   }
}


function SommaBox (a: TBoxClutch,
                   b: TBoxClutch): void
{
   const tiri = (x: TTiriStat, y: TTiriStat) => { x.realizzati += y.realizzati; x.tentati += y.tentati; };
   a.punti += b.punti;
   tiri(a.t2, b.t2);
   tiri(a.t3, b.t3);
   tiri(a.tl, b.tl);
   a.pp += b.pp; a.ra += b.ra; a.rd += b.rd; a.as += b.as;
}


// Durata del clutch: si scorre la partita tenendo il punteggio; un tratto fra due azioni è clutch per la
// parte negli ultimi CLUTCH_SECONDI, se lo scarto (costante nel tratto) è entro la soglia
function SecondiClutch (ops: TOperation[],
                        live: TContestoLive): { clutch: number, totale: number }
{
   let my = 0;
   let opp = 0;
   let q = 0;
   let ultimo = 0;
   let clutch = 0;
   let totale = 0;
   const tratto = (tempo: number) =>
   {
      if (ultimo > tempo)
      {
         totale += ultimo - tempo;
         if (InClutch(q, tempo, my, opp))
            clutch += Math.max(0, Math.min(ultimo, CLUTCH_SECONDI) - tempo);
      }
      ultimo = tempo;
   };
   for (const op of ops)
   {
      if (op.quarter() !== q)
      {
         if (q > 0)
            tratto(0);
         q = op.quarter();
         ultimo = DurataQuarto(q);
      }
      tratto(op.time());
      const t = op.oper();
      const punti = (t === TOperationType.totTLYes) ? 1 : (t === TOperationType.totT2Yes) ? 2 : (t === TOperationType.totT3Yes) ? 3 : 0;
      if (op.myTeam())
         my += punti;
      else
         opp += punti;
   }
   if (q > 0)
      tratto((live.quarto === q) ? live.tempo : 0);
   return { clutch, totale };
}


// ops: azioni della partita in ordine; giocatori: di entrambe le squadre; lato: squadra scelta (true = MyTeam);
// live: fine dell'ultimo quarto (cronometro, o 0 a partita finita)
export function CalcolaClutch (ops: TOperation[],
                               giocatori: TMatchPlayer[],
                               lato: boolean,
                               live: TContestoLive): TClutch
{
   const c = ClutchVuoto();
   const nostri = giocatori.filter(p => p.isMyTeam() === lato);
   const perGiocatore = new Map<TMatchPlayer, TBoxClutch>(nostri.map(p => [p, BoxClutchVuoto()]));
   let my = 0;
   let opp = 0;
   for (const op of ops)
   {
      const t = op.oper();
      const inClutch = InClutch(op.quarter(), op.time(), my, opp);
      const nostra = (op.myTeam() === lato);
      Registra(inClutch ? (nostra ? c.noi : c.loro) : (nostra ? c.restoNoi : c.restoLoro), t);
      const p1 = op.player1();
      if (inClutch && p1 && perGiocatore.has(p1))
         Registra(perGiocatore.get(p1)!, t);
      const punti = (t === TOperationType.totTLYes) ? 1 : (t === TOperationType.totT2Yes) ? 2 : (t === TOperationType.totT3Yes) ? 3 : 0;
      if (op.myTeam())
         my += punti;
      else
         opp += punti;
   }
   const tempi = SecondiClutch(ops, live);
   c.secondi = tempi.clutch;
   c.secondiResto = tempi.totale - tempi.clutch;
   if (c.secondi > 0)
   {
      c.partite = 1;
      const diff = lato ? (my - opp) : (opp - my);
      if (diff > 0)
         c.vinte = 1;
      else if (diff < 0)
         c.perse = 1;
   }
   // minuti, +/- e quintetti in clutch: stessa ricostruzione di chi è in campo dei quintetti
   const inCampo = AnalisiInCampo(ops, giocatori, lato, live, true);
   c.quintetti = inCampo.quintetti;
   const minuti = new Map(OnOff(c.quintetti).map(r => [r.giocatore.id, r.on.secondi]));
   c.giocatori = nostri
      .map(p => ({ id: p.playerRecID, numero: p.playNumber(), nome: p.playName(),
                   secondi: minuti.get(p.playerRecID) ?? 0, pm: inCampo.plusMinus.get(p) ?? 0, box: perGiocatore.get(p)! }))
      .filter(g => (g.secondi > 0) || (g.box.t2.tentati + g.box.t3.tentati + g.box.tl.tentati + g.box.pp + g.box.ra + g.box.rd + g.box.as > 0))
      .sort((a, b) => b.secondi - a.secondi);
   return c;
}


// Somma una partita nel totale del campionato (giocatori per id, quintetti per chiave); nome e numero
// restano quelli dell'ultima partita
export function SommaClutch (tot: TClutch,
                             c: TClutch): void
{
   tot.secondi += c.secondi;
   tot.secondiResto += c.secondiResto;
   tot.partite += c.partite;
   tot.vinte += c.vinte;
   tot.perse += c.perse;
   SommaBox(tot.noi, c.noi);
   SommaBox(tot.loro, c.loro);
   SommaBox(tot.restoNoi, c.restoNoi);
   SommaBox(tot.restoLoro, c.restoLoro);
   for (const g of c.giocatori)
   {
      const t = tot.giocatori.find(x => x.id === g.id);
      if (!t)
      {
         tot.giocatori.push({ ...g, box: { ...BoxClutchVuoto() } });
         SommaBox(tot.giocatori[tot.giocatori.length - 1].box, g.box);
         continue;
      }
      t.numero = g.numero;
      t.nome = g.nome;
      t.secondi += g.secondi;
      t.pm += g.pm;
      SommaBox(t.box, g.box);
   }
   tot.giocatori.sort((a, b) => b.secondi - a.secondi);
   const quintetti = new Map(tot.quintetti.map(q => [q.chiave, q]));
   AccumulaQuintetti(quintetti, c.quintetti);
   tot.quintetti = [...quintetti.values()].sort((a, b) => b.secondi - a.secondi);
}


// ---------------------------------------------------------------- formattazione

export const TdC = (b: TBoxClutch): TTiriStat =>
   ({ realizzati: b.t2.realizzati + b.t3.realizzati, tentati: b.t2.tentati + b.t3.tentati });

export const TiriStr = (t: TTiriStat) => (t.tentati > 0) ? `${t.realizzati}/${t.tentati}` : '';

export const PercStr = (t: TTiriStat) =>
   (t.tentati > 0) ? `${Math.round(100 * t.realizzati / t.tentati)}%` : '';

export const MinStr = (secondi: number) =>
{
   const s = Math.round(secondi);
   return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

// punti ogni 10 minuti di gioco (per confrontare clutch e resto della partita)
export const PuntiOgni10 = (punti: number, secondi: number): string =>
   (secondi > 0) ? (600 * punti / secondi).toLocaleString('it-IT', { maximumFractionDigits: 1 }) : '';

export const DescrizioneClutch = () =>
   `ultimi ${CLUTCH_SECONDI / 60} minuti del 4° quarto e dei supplementari con scarto di ${CLUTCH_SCARTO} punti o meno`;


// ---------------------------------------------------------------- PDF

// Tabelle del clutch nel PDF: riepilogo, squadre (clutch e resto), giocatori. nomi: [squadra scelta, avversari].
// Restituisce la y finale (i quintetti si stampano a parte con TabellaQuintettiPdf).
export function TabelleClutchPdf (pdf: any,
                                  autoTable: any,
                                  c: TClutch,
                                  nomi: [string, string],
                                  coloreNoi: number[],
                                  coloreLoro: number[],
                                  startY: number,
                                  font: string): number
{
   const stile: any = {
      styles:       { font, halign: 'center' },
      headStyles:   { fillColor: [255, 190, 0], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9, cellPadding: 0.8 },
      bodyStyles:   { fontSize: 9, cellPadding: 0.8, fillColor: [255, 255, 255], textColor: [0, 0, 0] },
      alternateRowStyles: { fillColor: [221, 221, 221] },
      margin:       { left: 5, right: 5 },
      theme:        'grid'
   };
   pdf.setFontSize(9);
   pdf.setFont(font, 'normal');
   pdf.setTextColor(60, 60, 60);
   const intro = (c.partite > 1)
      ? `Partite arrivate punto a punto: ${c.partite} (vinte ${c.vinte}, perse ${c.perse}). Tempo di clutch: ${MinStr(c.secondi)}.`
      : `Tempo di clutch: ${MinStr(c.secondi)}.`;
   pdf.text(`Clutch: ${DescrizioneClutch()}. ${intro}`, 5, startY);
   pdf.setTextColor(0, 0, 0);

   const tiri = (t: TTiriStat) => (t.tentati > 0) ? `${TiriStr(t)} (${PercStr(t)})` : '';
   const riga = (nome: string, colore: number[], b: TBoxClutch, secondi: number) => [
      { content: nome, styles: { halign: 'left', textColor: colore, fontStyle: 'bold' } },
      String(b.punti), PuntiOgni10(b.punti, secondi), tiri(TdC(b)), tiri(b.t3), tiri(b.tl),
      String(b.pp), String(b.ra), String(b.rd), String(b.as)
   ];
   autoTable(pdf, {
      startY: startY + 3,
      head: [['', 'Punti', 'Punti/10\'', 'TdC', 'T3', 'TL', 'PP', 'RA', 'RD', 'As']],
      body: [
         [{ content: 'In clutch', colSpan: 10, styles: { halign: 'left', fontStyle: 'bold', fillColor: [240, 240, 240] } }],
         riga(nomi[0], coloreNoi, c.noi, c.secondi), riga(nomi[1], coloreLoro, c.loro, c.secondi),
         [{ content: 'Resto della partita', colSpan: 10, styles: { halign: 'left', fontStyle: 'bold', fillColor: [240, 240, 240] } }],
         riga(nomi[0], coloreNoi, c.restoNoi, c.secondiResto), riga(nomi[1], coloreLoro, c.restoLoro, c.secondiResto)
      ],
      ...stile,
      alternateRowStyles: { fillColor: [255, 255, 255] },
      tableWidth: 220
   });
   let y = (pdf as any).lastAutoTable.finalY + 6;
   if (c.giocatori.length > 0)
   {
      autoTable(pdf, {
         startY: y,
         head: [[`Giocatori ${nomi[0]} in clutch`, 'Min', 'Punti', 'TdC', 'T3', 'TL', 'PP', 'Rimb', 'As', '+/-']],
         body: c.giocatori.map(g => [
            { content: `${g.numero} ${g.nome}`, styles: { halign: 'left' } },
            MinStr(g.secondi), String(g.box.punti), tiri(TdC(g.box)), tiri(g.box.t3), tiri(g.box.tl),
            String(g.box.pp), String(g.box.ra + g.box.rd), String(g.box.as),
            { content: (g.pm > 0) ? `+${g.pm}` : String(g.pm), styles: (g.pm > 0) ? { textColor: [0, 140, 0], fontStyle: 'bold' } : (g.pm < 0) ? { textColor: [210, 0, 0], fontStyle: 'bold' } : {} }
         ]),
         ...stile,
         tableWidth: 220
      });
      y = (pdf as any).lastAutoTable.finalY + 6;
   }
   return y;
}
