import {MediePartite, TGiocatoreStatCamp, TotaliPartite, TRigaStatCamp} from "./statistiche-campionato";
import {BoxVuoto, CalcolaFourFactors, NetRtg, SommaBox, TBoxSquadra} from "./four-factors";
import {TTiriStat} from "./statistiche";
import {TsPerc} from "./usage";


// Confronto fra due gruppi di partite (pagina "Statistiche campionato"): per ora vinte contro perse. Le
// stesse statistiche di squadra una accanto all'altra con la differenza; la differenza è evidenziata solo
// quando supera una soglia (sotto, con poche partite, può essere solo il caso): verde se va nella direzione
// "buona" per il primo gruppo, rosso se va contro.


// Dati di una partita per il confronto (raccolti durante l'elaborazione)
export interface TPartitaConfronto
{
   indice: number;             // posizione fra le partite selezionate
   riga: TRigaStatCamp;
   noi: TBoxSquadra;
   loro: TBoxSquadra;
   minuti: number;
   difQuarti: (number | null)[];   // scarto di ciascuno dei 4 quarti regolari
}


export interface TRigaConfronto
{
   etichetta: string;
   a: number | null;
   b: number | null;
   decimali: number;
   unita: string;
   altoMeglio: boolean | null; // null: né meglio né peggio (es. pace)
   soglia: number;             // differenza minima per evidenziarla
   dettaglioA?: string;        // es. tentativi a partita accanto a una percentuale
   dettaglioB?: string;
}


export interface TSezioneConfronto
{
   titolo: string;
   righe: TRigaConfronto[];
}


export interface TGiocatoreConfronto
{
   id: number;
   numero: string;
   nome: string;
   partiteA: number;
   partiteB: number;
   puntiA: number | null;      // media punti a partita
   puntiB: number | null;
   minA: number | null;        // media minuti a partita
   minB: number | null;
   tsA: number | null;
   tsB: number | null;
}


export interface TConfronto
{
   nomeA: string;
   nomeB: string;
   partiteA: number;
   partiteB: number;
   sezioni: TSezioneConfronto[];
   giocatori: TGiocatoreConfronto[];
}


const Perc = (t: TTiriStat) => (t.tentati > 0) ? 100 * t.realizzati / t.tentati : null;


function Gruppo (partite: TPartitaConfronto[])
{
   const n = partite.length;
   const noi = BoxVuoto();
   const loro = BoxVuoto();
   partite.forEach(p => { SommaBox(noi, p.noi); SommaBox(loro, p.loro); });
   const minuti = partite.reduce((a, p) => a + p.minuti, 0);
   const totali = TotaliPartite(partite.map(p => p.riga));
   const medie = MediePartite(totali, n);
   const ff = CalcolaFourFactors(noi, loro, Math.max(1, n), minuti);
   const quarti = [0, 1, 2, 3].map(q =>
   {
      const v = partite.map(p => p.difQuarti[q]).filter((x): x is number => x !== null);
      return (v.length > 0) ? v.reduce((a, b) => a + b, 0) / v.length : null;
   });
   return { n, totali, medie, ff, quarti };
}


export function CalcolaConfronto (partite: TPartitaConfronto[],
                                  giocatori: TGiocatoreStatCamp[],
                                  inA: (p: TPartitaConfronto) => boolean,
                                  inB: (p: TPartitaConfronto) => boolean,
                                  nomeA: string,
                                  nomeB: string): TConfronto
{
   const pa = partite.filter(inA);
   const pb = partite.filter(inB);
   const A = Gruppo(pa);
   const B = Gruppo(pb);
   const v = (n: number, x: number) => (n > 0) ? x : null;
   const fattore = (g: ReturnType<typeof Gruppo>, sigla: string, noi: boolean) =>
   {
      const f = g.ff.fattori.find(x => x.sigla === sigla);
      return (g.n > 0) ? ((noi ? f?.noi : f?.loro) ?? null) : null;
   };
   const tentativi = (g: ReturnType<typeof Gruppo>, t: TTiriStat) =>
      (g.n > 0) ? `${(t.tentati).toLocaleString('it-IT', { maximumFractionDigits: 1 })} T/p` : undefined;
   const riga = (etichetta: string, a: number | null, b: number | null, decimali: number, unita: string,
                 altoMeglio: boolean | null, soglia: number, dettaglioA?: string, dettaglioB?: string): TRigaConfronto =>
      ({ etichetta, a, b, decimali, unita, altoMeglio, soglia, dettaglioA, dettaglioB });

   const sezioni: TSezioneConfronto[] = [
      { titolo: 'Risultato', righe: [
         riga('Punti fatti a partita', v(A.n, A.medie.puntiF), v(B.n, B.medie.puntiF), 1, '', true, 3),
         riga('Punti subiti a partita', v(A.n, A.medie.puntiS), v(B.n, B.medie.puntiS), 1, '', false, 3),
         riga('Scarto medio', v(A.n, A.medie.dif), v(B.n, B.medie.dif), 1, '', true, 3)
      ] },
      { titolo: 'Ritmo ed efficienza', righe: [
         riga('Pace (possessi ogni 40\')', (A.n > 0) ? A.ff.pace : null, (B.n > 0) ? B.ff.pace : null, 1, '', null, 3),
         riga('Punti fatti ogni 100 possessi', (A.n > 0) ? A.ff.offRtg : null, (B.n > 0) ? B.ff.offRtg : null, 1, '', true, 4),
         riga('Punti subiti ogni 100 possessi', (A.n > 0) ? A.ff.difRtg : null, (B.n > 0) ? B.ff.difRtg : null, 1, '', false, 4),
         riga('Net rating', (A.n > 0) ? NetRtg(A.ff) : null, (B.n > 0) ? NetRtg(B.ff) : null, 1, '', true, 4)
      ] },
      { titolo: 'Four Factors (noi)', righe: [
         riga('eFG%', fattore(A, 'eFG%', true), fattore(B, 'eFG%', true), 1, '%', true, 3),
         riga('Palle perse ogni 100 possessi (TOV%)', fattore(A, 'TOV%', true), fattore(B, 'TOV%', true), 1, '%', false, 2),
         riga('Rimbalzi offensivi (ORB%)', fattore(A, 'ORB%', true), fattore(B, 'ORB%', true), 1, '%', true, 3),
         riga('Liberi segnati ogni 100 tiri (TL/TdC)', fattore(A, 'TL/TdC', true), fattore(B, 'TL/TdC', true), 1, '', true, 4)
      ] },
      { titolo: 'Four Factors (avversari)', righe: [
         riga('eFG% concessa', fattore(A, 'eFG%', false), fattore(B, 'eFG%', false), 1, '%', false, 3),
         riga('Palle perse provocate (TOV% avv.)', fattore(A, 'TOV%', false), fattore(B, 'TOV%', false), 1, '%', true, 2),
         riga('Rimbalzi offensivi concessi (ORB% avv.)', fattore(A, 'ORB%', false), fattore(B, 'ORB%', false), 1, '%', false, 3),
         riga('Liberi concessi ogni 100 tiri (TL/TdC avv.)', fattore(A, 'TL/TdC', false), fattore(B, 'TL/TdC', false), 1, '', false, 4)
      ] },
      { titolo: 'Tiro (a partita)', righe: [
         riga('Tiri da 2', Perc(A.totali.t2), Perc(B.totali.t2), 1, '%', true, 3, tentativi(A, A.medie.t2), tentativi(B, B.medie.t2)),
         riga('Tiri da 3', Perc(A.totali.t3), Perc(B.totali.t3), 1, '%', true, 3, tentativi(A, A.medie.t3), tentativi(B, B.medie.t3)),
         riga('Tiri liberi', Perc(A.totali.tl), Perc(B.totali.tl), 1, '%', true, 4, tentativi(A, A.medie.tl), tentativi(B, B.medie.tl))
      ] },
      { titolo: 'Altro (a partita)', righe: [
         riga('Rimbalzi difensivi', v(A.n, A.medie.rd), v(B.n, B.medie.rd), 1, '', true, 2),
         riga('Rimbalzi offensivi', v(A.n, A.medie.ra), v(B.n, B.medie.ra), 1, '', true, 2),
         riga('Assist', v(A.n, A.medie.as), v(B.n, B.medie.as), 1, '', true, 2),
         riga('Palle perse', v(A.n, A.medie.pp), v(B.n, B.medie.pp), 1, '', false, 2),
         riga('Palle recuperate', v(A.n, A.medie.pr), v(B.n, B.medie.pr), 1, '', true, 2),
         riga('Falli fatti', v(A.n, A.medie.ff), v(B.n, B.medie.ff), 1, '', false, 2),
         riga('Falli subiti', v(A.n, A.medie.fs), v(B.n, B.medie.fs), 1, '', true, 2)
      ] },
      { titolo: 'Scarto medio per quarto', righe: [0, 1, 2, 3].map(q =>
         riga(`${q + 1}° quarto`, A.quarti[q], B.quarti[q], 1, '', true, 2)) }
   ];

   // giocatori: media punti, minuti e TS% nei due gruppi (solo le partite in cui sono entrati)
   const indiciA = new Set(pa.map(p => p.indice));
   const indiciB = new Set(pb.map(p => p.indice));
   const perGruppo = (g: TGiocatoreStatCamp, indici: Set<number>) =>
   {
      const s = g.serie.filter(x => x.entrato && indici.has(x.indice));
      const n = s.length;
      const somma = (f: (x: typeof s[number]) => number) => s.reduce((a, x) => a + f(x), 0);
      return {
         n,
         punti: (n > 0) ? somma(x => x.punti) / n : null,
         min: (n > 0) ? somma(x => x.secondi) / 60 / n : null,
         ts: (n > 0) ? TsPerc(somma(x => x.punti), somma(x => x.fga), somma(x => x.fta)) : null
      };
   };
   const elenco: TGiocatoreConfronto[] = giocatori
      .map(g =>
      {
         const a = perGruppo(g, indiciA);
         const b = perGruppo(g, indiciB);
         return { id: g.id, numero: g.numero, nome: g.nome, partiteA: a.n, partiteB: b.n,
                  puntiA: a.punti, puntiB: b.punti, minA: a.min, minB: b.min, tsA: a.ts, tsB: b.ts };
      })
      .filter(g => g.partiteA + g.partiteB > 0)
      .sort((x, y) => ((y.minA ?? 0) * y.partiteA + (y.minB ?? 0) * y.partiteB) - ((x.minA ?? 0) * x.partiteA + (x.minB ?? 0) * x.partiteB));
   return { nomeA, nomeB, partiteA: pa.length, partiteB: pb.length, sezioni, giocatori: elenco };
}


// Confronto vinte/perse
export const ConfrontoVintePerse = (partite: TPartitaConfronto[], giocatori: TGiocatoreStatCamp[]) =>
   CalcolaConfronto(partite, giocatori, p => p.riga.dif > 0, p => p.riga.dif < 0, 'Vinte', 'Perse');


// ---------------------------------------------------------------- formattazione

export function NumC (v: number | null,
                      decimali: number = 1,
                      unita: string = '',
                      segno: boolean = false): string
{
   if (v === null)
      return '';
   const s = v.toLocaleString('it-IT', { minimumFractionDigits: decimali, maximumFractionDigits: decimali });
   return `${(segno && (v > 0)) ? '+' : ''}${s}${unita}`;
}


// Differenza A - B; null se manca uno dei due valori
export const DiffConfronto = (r: TRigaConfronto) => ((r.a !== null) && (r.b !== null)) ? r.a - r.b : null;


// 1: differenza netta a favore del gruppo A, -1: netta contro, 0: non rilevante o senza direzione
export function EsitoDiff (r: TRigaConfronto): number
{
   const d = DiffConfronto(r);
   if ((d === null) || (r.altoMeglio === null) || (Math.abs(d) < r.soglia))
      return 0;
   return ((d > 0) === r.altoMeglio) ? 1 : -1;
}


// ---------------------------------------------------------------- PDF

export function TabelleConfrontoPdf (pdf: any,
                                     autoTable: any,
                                     c: TConfronto,
                                     startY: number,
                                     font: string): number
{
   const verde = { textColor: [0, 140, 0], fontStyle: 'bold' };
   const rosso = { textColor: [210, 0, 0], fontStyle: 'bold' };
   const stile: any = {
      styles:       { font, halign: 'right' },
      headStyles:   { fillColor: [255, 190, 0], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9, cellPadding: 0.7, halign: 'center' },
      bodyStyles:   { fontSize: 8.5, cellPadding: 0.7, fillColor: [255, 255, 255], textColor: [0, 0, 0] },
      theme:        'grid'
   };
   const body: any[] = [];
   for (const s of c.sezioni)
   {
      body.push([{ content: s.titolo, colSpan: 4, styles: { halign: 'left', fontStyle: 'bold', fillColor: [235, 235, 235] } }]);
      for (const r of s.righe)
      {
         const e = EsitoDiff(r);
         const val = (v: number | null, det?: string) => `${NumC(v, r.decimali, r.unita)}${det ? `  (${det})` : ''}`;
         body.push([
            { content: r.etichetta, styles: { halign: 'left' } },
            val(r.a, r.dettaglioA), val(r.b, r.dettaglioB),
            { content: NumC(DiffConfronto(r), r.decimali, '', true), styles: (e > 0) ? verde : (e < 0) ? rosso : {} }
         ]);
      }
   }
   autoTable(pdf, {
      startY,
      head: [['', `${c.nomeA} (${c.partiteA})`, `${c.nomeB} (${c.partiteB})`, 'Differenza']],
      body,
      ...stile,
      columnStyles: { 0: { cellWidth: 72 }, 1: { cellWidth: 38 }, 2: { cellWidth: 38 }, 3: { cellWidth: 22 } },
      tableWidth: 170,
      margin: { left: 5 }
   });
   // giocatori a destra della tabella di squadra
   autoTable(pdf, {
      startY,
      head: [['Giocatore', `Pti ${c.nomeA}`, `Pti ${c.nomeB}`, `Min ${c.nomeA}`, `Min ${c.nomeB}`, `TS% ${c.nomeA}`, `TS% ${c.nomeB}`]],
      body: c.giocatori.map(g => [
         { content: `${g.numero} ${g.nome}`, styles: { halign: 'left' } },
         NumC(g.puntiA), NumC(g.puntiB), NumC(g.minA, 0), NumC(g.minB, 0), NumC(g.tsA, 0, '%'), NumC(g.tsB, 0, '%')
      ]),
      ...stile,
      headStyles: { ...stile.headStyles, fontSize: 7 },
      bodyStyles: { ...stile.bodyStyles, fontSize: 7.5 },
      columnStyles: { 0: { cellWidth: 34 } },
      tableWidth: 112,
      margin: { left: 180 }
   });
   const y = Math.max((pdf as any).lastAutoTable.finalY, 0) + 4;
   pdf.setFontSize(7.5);
   pdf.setFont(font, 'normal');
   pdf.setTextColor(90, 90, 90);
   pdf.text(pdf.splitTextToSize(`Tra parentesi il numero di partite. Differenza = ${c.nomeA} - ${c.nomeB}; in verde/rosso solo le ` +
            `differenze nette, a favore/contro: con poche partite le piccole differenze possono essere solo il caso. ` +
            `T/p: tentativi a partita. Giocatori: medie nelle partite in cui sono entrati.`, 287), 5, 200);
   pdf.setTextColor(0, 0, 0);
   return y;
}
