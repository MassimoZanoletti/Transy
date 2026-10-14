import {TTiriStat} from "./statistiche";


// "Four Factors" di Dean Oliver e indici per possesso, calcolati dai totali di squadra delle due squadre
// (tab "Statistiche" della partita e pagina "Statistiche campionato"). I possessi sono stimati con la
// formula classica FGA - RA + PP + 0.44 TLA; quelli della partita sono la media delle due squadre.
// Il pace è il ritmo: possessi riportati a 40 minuti (con i supplementari i possessi totali non si confrontano).


// Totali di squadra che servono al calcolo (TRigaStat va bene così com'è)
export interface TBoxSquadra
{
   punti: number;
   tl: TTiriStat;
   t2: TTiriStat;
   t3: TTiriStat;
   rd: number;
   ra: number;
   pp: number;
}


export interface TFattore
{
   sigla: string;
   titolo: string;
   descrizione: string;
   peso: number;               // peso del fattore secondo Oliver (%)
   noi: number | null;         // percentuale; null = non calcolabile (nessun tiro, nessun rimbalzo)
   loro: number | null;
   altoMeglio: boolean;        // TOV%: il valore più basso è il migliore
}


export interface TFourFactors
{
   fattori: TFattore[];
   partite: number;
   possessi: number | null;    // possessi per partita (media delle due squadre)
   pace: number | null;        // possessi ogni 40 minuti di gioco
   offRtg: number | null;      // punti fatti ogni 100 possessi
   difRtg: number | null;      // punti subiti ogni 100 possessi
}


export function BoxVuoto (): TBoxSquadra
{
   return { punti: 0, tl: { realizzati: 0, tentati: 0 }, t2: { realizzati: 0, tentati: 0 }, t3: { realizzati: 0, tentati: 0 }, rd: 0, ra: 0, pp: 0 };
}


// Somma b dentro a (per i totali su più partite)
export function SommaBox (a: TBoxSquadra,
                          b: TBoxSquadra): void
{
   const tiri = (x: TTiriStat, y: TTiriStat) => { x.realizzati += y.realizzati; x.tentati += y.tentati; };
   a.punti += b.punti;
   tiri(a.tl, b.tl);
   tiri(a.t2, b.t2);
   tiri(a.t3, b.t3);
   a.rd += b.rd;
   a.ra += b.ra;
   a.pp += b.pp;
}


export function Possessi (b: TBoxSquadra): number
{
   return (b.t2.tentati + b.t3.tentati) - b.ra + b.pp + (0.44 * b.tl.tentati);
}


// Durata regolamentare di una partita (4 quarti da 10'): il pace è riferito a questa
export const MINUTI_PARTITA = 40;


const Quoziente = (num: number, den: number): number | null => (den > 0) ? (100 * num / den) : null;


// minuti: minuti di gioco complessivi (somma delle partite, supplementari compresi); 0 = pace non calcolabile
export function CalcolaFourFactors (noi: TBoxSquadra,
                                    loro: TBoxSquadra,
                                    partite: number = 1,
                                    minuti: number = 0): TFourFactors
{
   const fga = (b: TBoxSquadra) => b.t2.tentati + b.t3.tentati;
   const fgm = (b: TBoxSquadra) => b.t2.realizzati + b.t3.realizzati;
   const efg = (b: TBoxSquadra) => Quoziente(fgm(b) + 0.5 * b.t3.realizzati, fga(b));
   const tov = (b: TBoxSquadra) => Quoziente(b.pp, fga(b) + 0.44 * b.tl.tentati + b.pp);
   const orb = (b: TBoxSquadra, avv: TBoxSquadra) => Quoziente(b.ra, b.ra + avv.rd);
   const ftr = (b: TBoxSquadra) => Quoziente(b.tl.realizzati, fga(b));
   const fattori: TFattore[] = [
      { sigla: 'eFG%', titolo: 'Tiro (eFG%)', peso: 40, altoMeglio: true, noi: efg(noi), loro: efg(loro),
        descrizione: 'Percentuale effettiva dal campo: i canestri da 3 valgono una volta e mezza quelli da 2.' },
      { sigla: 'TOV%', titolo: 'Palle perse (TOV%)', peso: 25, altoMeglio: false, noi: tov(noi), loro: tov(loro),
        descrizione: 'Palle perse ogni 100 azioni concluse (tiri, liberi pesati e palle perse): più è bassa meglio è.' },
      { sigla: 'ORB%', titolo: 'Rimbalzi offensivi (ORB%)', peso: 20, altoMeglio: true, noi: orb(noi, loro), loro: orb(loro, noi),
        descrizione: 'Quota dei rimbalzi offensivi disponibili presi: RA / (RA + RD degli avversari).' },
      { sigla: 'TL/TdC', titolo: 'Tiri liberi (FT rate)', peso: 15, altoMeglio: true, noi: ftr(noi), loro: ftr(loro),
        descrizione: 'Liberi segnati ogni 100 tiri dal campo tentati: misura quanto si va in lunetta e quanto si segna.' }
   ];
   const possTot = (Possessi(noi) + Possessi(loro)) / 2;
   return {
      fattori,
      partite,
      possessi: (possTot > 0) ? possTot / Math.max(1, partite) : null,
      pace:     ((possTot > 0) && (minuti > 0)) ? possTot * MINUTI_PARTITA / minuti : null,
      offRtg:   Quoziente(noi.punti, possTot),
      difRtg:   Quoziente(loro.punti, possTot)
   };
}


// Numero con una cifra decimale all'italiana; vuoto se non calcolabile
export function NumFF (v: number | null,
                       segno: boolean = false): string
{
   if (v === null)
      return '';
   const s = v.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
   return (segno && (v > 0)) ? `+${s}` : s;
}


export function NetRtg (ff: TFourFactors): number | null
{
   return ((ff.offRtg !== null) && (ff.difRtg !== null)) ? ff.offRtg - ff.difRtg : null;
}


// Chi è messo meglio nel fattore: 1 noi, -1 loro, 0 pari o non confrontabile
export function MiglioreFF (f: TFattore): number
{
   if ((f.noi === null) || (f.loro === null) || (Math.abs(f.noi - f.loro) < 0.05))
      return 0;
   return ((f.noi > f.loro) === f.altoMeglio) ? 1 : -1;
}


// Tabella dei Four Factors nel PDF (jsPDF + jspdf-autotable passati da chi esporta, caricati con import
// dinamico): fattore, peso, noi, avversari; poi possessi e punti per 100 possessi. Restituisce la y finale.
export function TabellaFourFactorsPdf (pdf: any,
                                       autoTable: any,
                                       ff: TFourFactors,
                                       nomeNoi: string,
                                       nomeLoro: string,
                                       startY: number,
                                       font: string,
                                       left: number = 5): number
{
   const verde = { textColor: [0, 140, 0], fontStyle: 'bold' };
   const cella = (v: number | null, meglio: boolean) => ({ content: NumFF(v), styles: meglio ? verde : {} });
   const net = NetRtg(ff);
   autoTable(pdf, {
      startY,
      head: [['Four Factors', 'Peso', nomeNoi, nomeLoro]],
      body: [
         ...ff.fattori.map(f => [f.titolo, `${f.peso}%`, cella(f.noi, MiglioreFF(f) > 0), cella(f.loro, MiglioreFF(f) < 0)]),
         [(ff.partite > 1) ? 'Possessi per partita' : 'Possessi', '', { content: NumFF(ff.possessi), colSpan: 2, styles: { halign: 'center' } }],
         [`Pace (possessi ogni ${MINUTI_PARTITA}')`, '', { content: NumFF(ff.pace), colSpan: 2, styles: { halign: 'center' } }],
         ['Punti ogni 100 possessi', '', cella(ff.offRtg, (net ?? 0) > 0), cella(ff.difRtg, (net ?? 0) < 0)],
         ['Net rating', '', { content: NumFF(net, true), colSpan: 2, styles: { halign: 'center', fontStyle: 'bold' } }]
      ],
      styles:       { font, halign: 'right' },
      headStyles:   { fillColor: [255, 190, 0], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9, cellPadding: 0.8, halign: 'center' },
      bodyStyles:   { fontSize: 9, cellPadding: 0.8, fillColor: [255, 255, 255], textColor: [0, 0, 0] },
      alternateRowStyles: { fillColor: [221, 221, 221] },
      columnStyles: { 0: { halign: 'left', cellWidth: 50 }, 1: { halign: 'center', cellWidth: 14 }, 2: { cellWidth: 35 }, 3: { cellWidth: 35 } },
      tableWidth:   134,
      margin:       { left },
      theme:        'grid'
   });
   return (pdf as any).lastAutoTable.finalY;
}
