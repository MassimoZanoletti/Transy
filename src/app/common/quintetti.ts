import {TMatchPlayer} from "../models/datamod";
import {TOperation, TOperationType} from "./operation";
import {TContestoLive} from "./statistiche";
import {globs} from "./utils";


// Chi è in campo lungo la partita: plus/minus di ogni giocatore e statistiche dei quintetti di una squadra
// (minuti giocati insieme, punti fatti e subiti, possessi stimati). Chi è in campo segue le stesse regole di
// MinutiPerQuarto (statistiche.ts) e di ReplayOperations: nel 1° quarto parte il quintetto base, negli altri
// chi ha finito il precedente; un nuovo blocco di "Quintetto" sostituisce chi era in campo per quella
// squadra; le sostituzioni fanno uscire/entrare.


// Conteggi di una squadra mentre il quintetto era in campo (per i possessi: FGA - RA + PP + 0.44 TLA)
export interface TBoxQuintetto
{
   punti: number;
   fga: number;
   fta: number;
   ra: number;
   pp: number;
}


export interface TGiocatoreQuintetto
{
   id: number;
   numero: string;
   nome: string;
}


// Tempo e conteggi delle due squadre mentre un gruppo di giocatori era in campo (quintetto, coppia,
// giocatore in campo o in panchina)
export interface TInCampoStat
{
   secondi: number;
   noi: TBoxQuintetto;
   loro: TBoxQuintetto;
}


export interface TQuintettoStat extends TInCampoStat
{
   chiave: string;             // id dei giocatori in ordine, separati da "-"
   giocatori: TGiocatoreQuintetto[];
   partite: number;
}


export interface TAnalisiInCampo
{
   plusMinus: Map<TMatchPlayer, number>;
   quintetti: TQuintettoStat[];
}


const DurataQuarto = (q: number) => (q <= globs.MaxRegQuarters) ? globs.DurationRegulTime : globs.DurationExtraTime;

export const BoxVuotoQ = (): TBoxQuintetto => ({ punti: 0, fga: 0, fta: 0, ra: 0, pp: 0 });


// giocatori: quelli di entrambe le squadre (per il plus/minus); latoMyTeam: squadra di cui si vogliono i
// quintetti (true = MyTeam). live: fine dell'ultimo quarto (cronometro, o 0 a partita finita)
export function AnalisiInCampo (ops: TOperation[],
                                giocatori: TMatchPlayer[],
                                latoMyTeam: boolean,
                                live: TContestoLive): TAnalisiInCampo
{
   const pm = new Map<TMatchPlayer, number>(giocatori.map(p => [p, 0]));
   const quintetti = new Map<string, TQuintettoStat>();
   let inCampo = new Set<TMatchPlayer>();
   let currQ = 0;
   let ultimoTempo = 0;
   let quintTeam: boolean | null = null;
   let quintIds = new Set<number>();
   let prevCounter = -1;

   // quintetto attuale della squadra scelta
   const attuale = (): TQuintettoStat =>
   {
      const nostri = [...inCampo].filter(p => p.isMyTeam() === latoMyTeam)
         .sort((a, b) => a.playerRecID - b.playerRecID);
      const chiave = nostri.map(p => p.playerRecID).join('-');
      let q = quintetti.get(chiave);
      if (!q)
      {
         q = { chiave, giocatori: nostri.map(p => ({ id: p.playerRecID, numero: p.playNumber(), nome: p.playName() })),
               partite: 1, secondi: 0, noi: BoxVuotoQ(), loro: BoxVuotoQ() };
         quintetti.set(chiave, q);
      }
      return q;
   };
   // il tempo da ultimoTempo a tempo va al quintetto in campo
   const avanza = (tempo: number) =>
   {
      if (ultimoTempo > tempo)
         attuale().secondi += ultimoTempo - tempo;
      ultimoTempo = tempo;
   };

   for (const op of ops)
   {
      const q = op.quarter();
      if (q !== currQ)
      {
         if (currQ === 0)
            inCampo = new Set(giocatori.filter(p => p.inQuintetto()));
         else
            avanza(0);
         currQ = q;
         ultimoTempo = DurataQuarto(q);
         quintTeam = null;
      }
      avanza(op.time());
      const p1 = op.player1();
      const p2 = op.player2();
      if (op.oper() === TOperationType.totQuintetto)
      {
         const id1 = p1?.playerRecID ?? 0;
         const nuovoBlocco = (quintTeam !== op.myTeam()) || (op.counter() !== prevCounter + 1) || quintIds.has(id1);
         if (nuovoBlocco)
         {
            [...inCampo].filter(p => p.isMyTeam() === op.myTeam()).forEach(p => inCampo.delete(p));
            quintIds = new Set<number>();
            quintTeam = op.myTeam();
         }
         if (p1)
         {
            quintIds.add(id1);
            inCampo.add(p1);
         }
      }
      else
      {
         quintTeam = null;
         if (op.oper() === TOperationType.totSostituz)
         {
            if (p1)
               inCampo.delete(p1);
            if (p2)
               inCampo.add(p2);
         }
         else
         {
            const tipo = op.oper();
            const punti = (tipo === TOperationType.totTLYes) ? 1 :
                          (tipo === TOperationType.totT2Yes) ? 2 :
                          (tipo === TOperationType.totT3Yes) ? 3 : 0;
            if (punti > 0)
               for (const p of inCampo)
                  if (pm.has(p))
                     pm.set(p, pm.get(p)! + ((p.isMyTeam() === op.myTeam()) ? punti : -punti));
            const box = (op.myTeam() === latoMyTeam) ? attuale().noi : attuale().loro;
            box.punti += punti;
            if ((tipo === TOperationType.totT2Yes) || (tipo === TOperationType.totT2No) ||
                (tipo === TOperationType.totT3Yes) || (tipo === TOperationType.totT3No))
               box.fga++;
            else if ((tipo === TOperationType.totTLYes) || (tipo === TOperationType.totTLNo))
               box.fta++;
            else if (tipo === TOperationType.totRimbAttacco)
               box.ra++;
            else if (tipo === TOperationType.totPPersa)
               box.pp++;
         }
      }
      prevCounter = op.counter();
   }
   if (currQ > 0)
      avanza((live.quarto === currQ) ? live.tempo : 0);

   const elenco = [...quintetti.values()]
      .filter(q => (q.giocatori.length > 0) && ((q.secondi > 0) || (q.noi.punti + q.loro.punti > 0)))
      .sort((a, b) => b.secondi - a.secondi);
   return { plusMinus: pm, quintetti: elenco };
}


// Somma i quintetti di una partita in quelli del campionato (stessa chiave = stessi 5 giocatori); nome e
// numero restano quelli dell'ultima partita
export function AccumulaQuintetti (totali: Map<string, TQuintettoStat>,
                                   partita: TQuintettoStat[]): void
{
   const somma = (a: TBoxQuintetto, b: TBoxQuintetto) =>
   {
      a.punti += b.punti; a.fga += b.fga; a.fta += b.fta; a.ra += b.ra; a.pp += b.pp;
   };
   for (const q of partita)
   {
      const t = totali.get(q.chiave);
      if (!t)
      {
         totali.set(q.chiave, { ...q, giocatori: [...q.giocatori], noi: { ...q.noi }, loro: { ...q.loro } });
         continue;
      }
      t.giocatori = [...q.giocatori];
      t.partite++;
      t.secondi += q.secondi;
      somma(t.noi, q.noi);
      somma(t.loro, q.loro);
   }
}


// Possessi stimati del quintetto: media delle due squadre
export function PossessiQuintetto (q: TInCampoStat): number
{
   const poss = (b: TBoxQuintetto) => b.fga - b.ra + b.pp + 0.44 * b.fta;
   return Math.max(0, (poss(q.noi) + poss(q.loro)) / 2);
}


// Sotto questa soglia di possessi i valori per 100 possessi non si mostrano (troppo pochi per dire qualcosa)
export const MIN_POSSESSI_RATING = 10;


// Punti ogni 100 possessi (fatti o subiti); null se i possessi sono troppo pochi
export function RatingQuintetto (q: TInCampoStat,
                                 punti: number): number | null
{
   const poss = PossessiQuintetto(q);
   return (poss >= MIN_POSSESSI_RATING) ? (100 * punti / poss) : null;
}


// Net rating: punti fatti meno subiti ogni 100 possessi; null se i possessi sono troppo pochi
export function NetQuintetto (q: TInCampoStat): number | null
{
   const f = RatingQuintetto(q, q.noi.punti);
   const s = RatingQuintetto(q, q.loro.punti);
   return ((f !== null) && (s !== null)) ? f - s : null;
}


export function PlusMinusQuintetto (q: TInCampoStat): number
{
   return q.noi.punti - q.loro.punti;
}


// "4 Rossi, 7 Bianchi, ..." in ordine di numero di maglia
export function GiocatoriOrdinati (q: TQuintettoStat): TGiocatoreQuintetto[]
{
   return [...q.giocatori].sort((a, b) => (parseInt(a.numero, 10) || 0) - (parseInt(b.numero, 10) || 0));
}


export function NomiQuintetto (q: TQuintettoStat,
                               separatore: string = ', '): string
{
   return GiocatoriOrdinati(q).map(g => `${g.numero} ${g.nome}`).join(separatore);
}


// Minuti "mm:ss"
export function MinutiQuintetto (q: TInCampoStat): string
{
   const s = Math.round(q.secondi);
   return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}


export function NumQ (v: number | null,
                      segno: boolean = false): string
{
   if (v === null)
      return '';
   const s = v.toLocaleString('it-IT', { maximumFractionDigits: 1 });
   return (segno && (v > 0)) ? `+${s}` : s;
}


// Tabella dei quintetti nel PDF (jsPDF + jspdf-autotable passati da chi esporta). Restituisce la y finale.
export function TabellaQuintettiPdf (pdf: any,
                                     autoTable: any,
                                     quintetti: TQuintettoStat[],
                                     conPartite: boolean,
                                     startY: number,
                                     font: string): number
{
   const colore = (v: number | null) => ((v ?? 0) > 0) ? { textColor: [0, 140, 0], fontStyle: 'bold' }
                                      : ((v ?? 0) < 0) ? { textColor: [210, 0, 0], fontStyle: 'bold' } : {};
   const net = NetQuintetto;
   autoTable(pdf, {
      startY,
      head: [['Quintetto', ...(conPartite ? ['Part'] : []), 'Min', 'Fatti', 'Subiti', '+/-', 'Poss', 'Fatti/100', 'Subiti/100', 'Net']],
      body: quintetti.map(q => [
         { content: NomiQuintetto(q), styles: { halign: 'left' } },
         ...(conPartite ? [String(q.partite)] : []),
         MinutiQuintetto(q), String(q.noi.punti), String(q.loro.punti),
         { content: NumQ(PlusMinusQuintetto(q), true), styles: colore(PlusMinusQuintetto(q)) },
         NumQ(Math.round(PossessiQuintetto(q))),
         NumQ(RatingQuintetto(q, q.noi.punti)), NumQ(RatingQuintetto(q, q.loro.punti)),
         { content: NumQ(net(q), true), styles: colore(net(q)) }
      ]),
      styles:       { font, halign: 'right' },
      headStyles:   { fillColor: [255, 190, 0], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9, cellPadding: 0.6, halign: 'center' },
      bodyStyles:   { fontSize: 8, cellPadding: 0.6, fillColor: [255, 255, 255], textColor: [0, 0, 0] },
      alternateRowStyles: { fillColor: [221, 221, 221] },
      columnStyles: { 0: { halign: 'left', cellWidth: 140 } },
      margin:       { left: 5, right: 5 },
      theme:        'grid'
   });
   const y = (pdf as any).lastAutoTable.finalY + 5;
   pdf.setFontSize(8);
   pdf.setFont(font, 'normal');
   pdf.setTextColor(90, 90, 90);
   pdf.text(`Valori per 100 possessi solo con almeno ${MIN_POSSESSI_RATING} possessi stimati. Possessi = TdC tentati - rimb. offensivi + palle perse + 0,44 x liberi tentati (media delle due squadre).`, 5, y);
   pdf.setTextColor(0, 0, 0);
   return y;
}
