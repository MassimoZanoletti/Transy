import {TGiocatoreStatCamp} from "./statistiche-campionato";
import {TUsageSquadra, TsPerc} from "./usage";
import {COLORE_NOI_PDF} from "./grafico-differenza";


// Radar dei giocatori (pagina "Statistiche campionato"): un poligono per giocatore su 8 assi, confrontato con
// la media della squadra. I conteggi sono riportati a 40 minuti di gioco (così chi gioca poco non è
// penalizzato); ogni asse va da 0 al valore più alto fra i giocatori con abbastanza minuti, quindi il radar
// dice in cosa un giocatore è forte rispetto ai compagni. Tutti gli assi sono "più è meglio": le palle perse
// sono rovesciate (pieno = nessuna palla persa).


export const COLORE_CONFRONTO = '#b48cff';       // secondo giocatore a video (non è un colore di squadra)
const MINUTI_RIF = 40;


export interface TAsseRadar
{
   sigla: string;              // etichetta breve sul grafico
   nome: string;
   unita: string;
   rovesciato: boolean;        // true: meno è meglio (palle perse)
}


export interface TRadarGiocatore
{
   id: number;
   numero: string;
   nome: string;
   secondi: number;
   partite: number;
   valori: (number | null)[];  // valori reali per asse
   norm: number[];             // 0..1 per asse (0 se il valore non c'è)
}


export interface TRadar
{
   assi: TAsseRadar[];
   giocatori: TRadarGiocatore[];   // solo chi ha abbastanza minuti, in ordine di minuti
   media: TRadarGiocatore;         // media dei giocatori mostrati
   minSecondi: number;
}


export const ASSI_RADAR: TAsseRadar[] = [
   { sigla: 'Pti',  nome: `Punti ogni ${MINUTI_RIF}'`,            unita: '',  rovesciato: false },
   { sigla: 'TS%',  nome: 'TS% (efficienza al tiro)',            unita: '%', rovesciato: false },
   { sigla: 'USG%', nome: 'Usage %',                             unita: '%', rovesciato: false },
   { sigla: 'Rimb', nome: `Rimbalzi ogni ${MINUTI_RIF}'`,         unita: '',  rovesciato: false },
   { sigla: 'Ass',  nome: `Assist ogni ${MINUTI_RIF}'`,           unita: '',  rovesciato: false },
   { sigla: 'Rec',  nome: `Palle recuperate ogni ${MINUTI_RIF}'`, unita: '',  rovesciato: false },
   { sigla: 'FS',   nome: `Falli subiti ogni ${MINUTI_RIF}'`,     unita: '',  rovesciato: false },
   { sigla: 'PP',   nome: `Palle perse ogni ${MINUTI_RIF}' (meno è meglio)`, unita: '', rovesciato: true }
];


export function CalcolaRadar (giocatori: TGiocatoreStatCamp[],
                              usage: TUsageSquadra | null,
                              minSecondi: number): TRadar
{
   const usagePerId = new Map((usage?.giocatori ?? []).map(u => [u.id, u.usage]));
   const per40 = (v: number, secondi: number) => v * MINUTI_RIF * 60 / secondi;
   const scelti = giocatori.filter(g => g.secondi >= minSecondi).sort((a, b) => b.secondi - a.secondi);
   const righe: TRadarGiocatore[] = scelti.map(g => ({
      id: g.id, numero: g.numero, nome: g.nome, secondi: g.secondi, partite: g.partite,
      valori: [
         per40(g.punti, g.secondi),
         TsPerc(g.punti, g.tdc.tentati, g.tl.tentati),
         usagePerId.get(g.id) ?? null,
         per40(g.rd + g.ra, g.secondi),
         per40(g.as, g.secondi),
         per40(g.pr, g.secondi),
         per40(g.fs, g.secondi),
         per40(g.pp, g.secondi)
      ],
      norm: []
   }));
   const valoriAsse = (i: number) => righe.map(r => r.valori[i]).filter((v): v is number => v !== null);
   const media: TRadarGiocatore = {
      id: 0, numero: '', nome: 'Media squadra', secondi: 0, partite: 0, norm: [],
      valori: ASSI_RADAR.map((_, i) =>
      {
         const v = valoriAsse(i);
         return (v.length > 0) ? v.reduce((a, b) => a + b, 0) / v.length : null;
      })
   };
   // normalizzazione: 0..max per gli assi normali; per le palle perse 1 = nessuna, 0 = il massimo della squadra
   const max = ASSI_RADAR.map((_, i) => Math.max(0, ...valoriAsse(i)));
   const normalizza = (r: TRadarGiocatore) =>
   {
      r.norm = r.valori.map((v, i) =>
      {
         if ((v === null) || (max[i] <= 0))
            return ASSI_RADAR[i].rovesciato && (v !== null) ? 1 : 0;
         const k = Math.min(1, v / max[i]);
         return ASSI_RADAR[i].rovesciato ? 1 - k : k;
      });
   };
   righe.forEach(normalizza);
   normalizza(media);
   return { assi: ASSI_RADAR, giocatori: righe, media, minSecondi };
}


export const NumR = (v: number | null, unita: string = '') =>
   (v === null) ? '' : `${v.toLocaleString('it-IT', { maximumFractionDigits: 1 })}${unita}`;


// Punto del radar: asse i di n (0 = in alto, senso orario), raggio r (0..1) * raggio
export function PuntoRadar (cx: number,
                            cy: number,
                            raggio: number,
                            i: number,
                            n: number,
                            r: number): [number, number]
{
   const a = 2 * Math.PI * i / n;
   return [cx + raggio * r * Math.sin(a), cy - raggio * r * Math.cos(a)];
}


// ---------------------------------------------------------------- PDF

// Radar di tutti i giocatori, 4 per riga e 2 righe per pagina: poligono del giocatore (rosso) sopra la media
// della squadra (grigio tratteggiato). titolo: scritto in cima a ogni pagina. Le pagine le aggiunge qui.
export function PagineRadarPdf (pdf: any,
                                radar: TRadar,
                                titolo: (testo: string, y: number) => void,
                                font: string): void
{
   const rgb = (hex: string): [number, number, number] => [1, 3, 5].map(i => parseInt(hex.substring(i, i + 2), 16)) as [number, number, number];
   const n = radar.assi.length;
   const colonne = 4;
   const righePerPagina = 2;
   const larghezza = 297 / colonne;
   const altezza = 88;
   const raggio = 24;
   const poligono = (cx: number, cy: number, norm: number[]) =>
   {
      const punti = norm.map((r, i) => PuntoRadar(cx, cy, raggio, i, n, Math.max(0.02, r)));
      return { inizio: punti[0], delta: punti.slice(1).concat([punti[0]]).map((p, k) => [p[0] - punti[k][0], p[1] - punti[k][1]]) };
   };
   radar.giocatori.forEach((g, k) =>
   {
      const posizione = k % (colonne * righePerPagina);
      if (posizione === 0)
      {
         pdf.addPage();
         titolo('Radar dei giocatori (confronto con la media della squadra)', 10);
         // legenda in fondo alla pagina
         pdf.setFontSize(7.5);
         pdf.setFont(font, 'normal');
         pdf.setTextColor(60, 60, 60);
         const legenda = radar.assi.map(a => `${a.sigla}: ${a.nome}`).join(' · ');
         pdf.text(pdf.splitTextToSize(`${legenda}. Rosso: il giocatore; grigio tratteggiato: media della squadra. ` +
                  `Ogni asse va da 0 al valore più alto della squadra; per le palle perse il pieno è "nessuna".`, 285), 6, 197);
         pdf.setTextColor(0, 0, 0);
      }
      const cx = (posizione % colonne) * larghezza + larghezza / 2;
      const cy = 18 + Math.floor(posizione / colonne) * altezza + 46;
      // nome
      pdf.setFontSize(9);
      pdf.setFont(font, 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${g.numero} ${g.nome}`, cx, cy - raggio - 12, { align: 'center' });
      pdf.setFont(font, 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(90, 90, 90);
      const minuti = Math.round(g.secondi / 60);
      pdf.text(`${g.partite} partite, ${minuti} minuti`, cx, cy - raggio - 8.5, { align: 'center' });
      // anelli e assi
      pdf.setDrawColor(210, 210, 210);
      pdf.setLineWidth(0.15);
      for (const r of [0.25, 0.5, 0.75, 1])
      {
         const pts = Array.from({ length: n }, (_, i) => PuntoRadar(cx, cy, raggio, i, n, r));
         pts.forEach((p, i) => { const q = pts[(i + 1) % n]; pdf.line(p[0], p[1], q[0], q[1]); });
      }
      for (let i = 0; i < n; i++)
      {
         const [x, y] = PuntoRadar(cx, cy, raggio, i, n, 1);
         pdf.line(cx, cy, x, y);
         const [lx, ly] = PuntoRadar(cx, cy, raggio + 5, i, n, 1);
         pdf.setFontSize(6.5);
         pdf.setTextColor(60, 60, 60);
         pdf.text(radar.assi[i].sigla, lx, ly + 1, { align: (Math.abs(lx - cx) < 2) ? 'center' : ((lx > cx) ? 'left' : 'right') });
      }
      // media della squadra (tratteggiata) e giocatore (pieno chiaro, bordo rosso)
      const m = poligono(cx, cy, radar.media.norm);
      pdf.setDrawColor(120, 120, 120);
      pdf.setLineWidth(0.35);
      pdf.setLineDashPattern([1, 0.8], 0);
      pdf.lines(m.delta, m.inizio[0], m.inizio[1], [1, 1], 'S', true);
      pdf.setLineDashPattern([], 0);
      const p = poligono(cx, cy, g.norm);
      const rosso = rgb(COLORE_NOI_PDF);
      pdf.setFillColor(...rosso.map(v => Math.round(255 + (v - 255) * 0.3)) as [number, number, number]);
      pdf.setDrawColor(...rosso);
      pdf.setLineWidth(0.5);
      pdf.lines(p.delta, p.inizio[0], p.inizio[1], [1, 1], 'FD', true);
      // la media sopra il riempimento, per non nasconderla
      pdf.setDrawColor(120, 120, 120);
      pdf.setLineWidth(0.35);
      pdf.setLineDashPattern([1, 0.8], 0);
      pdf.lines(m.delta, m.inizio[0], m.inizio[1], [1, 1], 'S', true);
      pdf.setLineDashPattern([], 0);
   });
   pdf.setTextColor(0, 0, 0);
}
