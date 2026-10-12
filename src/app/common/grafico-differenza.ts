import {TOperation, TOperationType} from "./operation";
import {TContestoLive, TempoStr} from "./statistiche";
import {globs} from "./utils";


// Grafico dell'andamento dello scarto (punti MyTeam - punti OppoTeam) lungo tutta la partita: una
// spezzata a gradini che cambia a ogni canestro, sopra lo zero in vantaggio e sotto in svantaggio, con i
// timeout delle due squadre. Serie comune al disegno a video (SVG) e nel PDF (jsPDF).


// Colori delle squadre in tutte le statistiche: MyTeam rosso (colore sociale del Sarezzo), OppoTeam azzurro.
// A video (fondo scuro) un rosso chiaro, nel PDF (fondo bianco) uno più pieno ma non rosso puro. Gli stessi
// colori indicano anche "a favore di chi" (scarto, +/-, differenze).
export const COLORE_NOI = '#ff8888';
export const COLORE_NOI_PDF = '#d04545';
export const COLORE_LORO = '#3a8bd8';

// colore da usare nel PDF al posto di quello a video
export const ColorePdf = (colore: string) => (colore === COLORE_NOI) ? COLORE_NOI_PDF : colore;


export interface TPuntoDiff
{
   t: number;                  // secondi trascorsi dall'inizio della partita
   my: number;
   opp: number;
   quarto: number;
   tempo: number;              // secondi rimanenti nel quarto
}


export interface TSerieDiff
{
   punti: TPuntoDiff[];        // il primo è lo 0-0 iniziale; l'ultimo chiude la serie alla fine (o al cronometro)
   durata: number;             // secondi fino all'ultimo punto
   quarti: { label: string, inizio: number, fine: number }[];
   // iPunto: indice in punti del primo canestro registrato dopo il timeout (a parità di secondo conta l'ordine)
   timeout: { t: number, myTeam: boolean, quarto: number, tempo: number, iPunto: number }[];
   maxVant: TPuntoDiff | null;
   maxSvant: TPuntoDiff | null;
}


export const DurataQuarto = (q: number) => (q <= globs.MaxRegQuarters) ? globs.DurationRegulTime : globs.DurationExtraTime;

// Clutch (finale punto a punto), definizione standard: ultimi 5 minuti del 4° quarto e dei supplementari,
// con scarto di 5 punti o meno nel momento dell'azione
export const CLUTCH_SECONDI = 300;
export const CLUTCH_SCARTO = 5;

export const InClutch = (quarto: number, tempo: number, my: number, opp: number) =>
   (quarto >= globs.MaxRegQuarters) && (tempo <= CLUTCH_SECONDI) && (Math.abs(my - opp) <= CLUTCH_SCARTO);


// Minuti di gioco di una partita fino all'ultimo quarto giocato (supplementari compresi)
export const MinutiDiGioco = (quartiGiocati: number[]) =>
{
   let secondi = 0;
   for (let q = 1; q <= Math.max(0, ...quartiGiocati); q++)
      secondi += DurataQuarto(q);
   return secondi / 60;
};

export const EtichettaQuarto = (q: number) => (q <= globs.MaxRegQuarters) ? `Q${q}` : `ET${q - globs.MaxRegQuarters}`;


// Secondi trascorsi all'inizio del quarto q
function InizioQuarto (q: number): number
{
   let t = 0;
   for (let i = 1; i < q; i++)
      t += DurataQuarto(i);
   return t;
}


export function SerieDifferenza (ops: TOperation[],
                                 quartiGiocati: number[],
                                 live: TContestoLive): TSerieDiff
{
   const serie: TSerieDiff = { punti: [], durata: 0, quarti: [], timeout: [], maxVant: null, maxSvant: null };
   if (quartiGiocati.length === 0)
      return serie;
   const ultimo = Math.max(...quartiGiocati);
   for (let q = 1; q <= ultimo; q++)
   {
      const inizio = InizioQuarto(q);
      // il quarto in corso finisce al cronometro attuale
      const fine = inizio + DurataQuarto(q) - ((live.quarto === q) ? live.tempo : 0);
      serie.quarti.push({ label: EtichettaQuarto(q), inizio, fine });
   }
   serie.durata = serie.quarti[serie.quarti.length - 1].fine;

   let my = 0;
   let opp = 0;
   serie.punti.push({ t: 0, my, opp, quarto: 1, tempo: DurataQuarto(1) });
   for (const op of ops)
   {
      const q = op.quarter();
      if ((q < 1) || (q > ultimo))
         continue;
      const t = InizioQuarto(q) + DurataQuarto(q) - op.time();
      if (op.oper() === TOperationType.totTimeout)
      {
         serie.timeout.push({ t, myTeam: op.myTeam(), quarto: q, tempo: op.time(), iPunto: serie.punti.length });
         continue;
      }
      const punti = (op.oper() === TOperationType.totTLYes) ? 1 :
                    (op.oper() === TOperationType.totT2Yes) ? 2 :
                    (op.oper() === TOperationType.totT3Yes) ? 3 : 0;
      if (punti === 0)
         continue;
      if (op.myTeam())
         my += punti;
      else
         opp += punti;
      const p: TPuntoDiff = { t, my, opp, quarto: q, tempo: op.time() };
      serie.punti.push(p);
      if ((my - opp > 0) && ((!serie.maxVant) || (my - opp > serie.maxVant.my - serie.maxVant.opp)))
         serie.maxVant = p;
      if ((my - opp < 0) && ((!serie.maxSvant) || (my - opp < serie.maxSvant.my - serie.maxSvant.opp)))
         serie.maxSvant = p;
   }
   const fineQ = serie.quarti[serie.quarti.length - 1];
   serie.punti.push({ t: serie.durata, my, opp, quarto: ultimo, tempo: DurataQuarto(ultimo) - (fineQ.fine - fineQ.inizio) });
   return serie;
}


// Limite dell'asse y, simmetrico: multiplo di 5 sopra lo scarto massimo (almeno 5), con un po' di margine
// per l'etichetta dello scarto massimo
export function LimiteY (serie: TSerieDiff): number
{
   const max = Math.max(4, ...serie.punti.map(p => Math.abs(p.my - p.opp)));
   return 5 * Math.ceil((max + 1) / 5);
}


// Passo delle linee di griglia orizzontali
export function PassoY (limite: number): number
{
   return (limite <= 10) ? 5 : (limite <= 30) ? 10 : 20;
}


// Gradini della serie: per ogni tratto fra un canestro e il successivo, scarto costante
export function Gradini (serie: TSerieDiff): { t0: number, t1: number, diff: number }[]
{
   const g: { t0: number, t1: number, diff: number }[] = [];
   for (let i = 0; i < serie.punti.length - 1; i++)
   {
      const p = serie.punti[i];
      const t1 = serie.punti[i + 1].t;
      if (t1 > p.t)
         g.push({ t0: p.t, t1, diff: p.my - p.opp });
   }
   return g;
}


// Punteggio in vigore al secondo t della partita, con quarto e cronometro di quel momento
export function PuntoAlTempo (serie: TSerieDiff,
                              t: number): TPuntoDiff
{
   let p = serie.punti[0];
   for (const x of serie.punti)
      if (x.t <= t)
         p = x;
   const iq = Math.max(0, serie.quarti.findIndex(q => t <= q.fine));
   const q = serie.quarti[iq];
   return { t, my: p.my, opp: p.opp, quarto: iq + 1, tempo: Math.round(DurataQuarto(iq + 1) - (t - (q?.inizio ?? 0))) };
}


export function DescrizionePunto (p: TPuntoDiff,
                                  nomeNoi: string,
                                  nomeLoro: string): string
{
   const diff = p.my - p.opp;
   return `${EtichettaQuarto(p.quarto)} ${TempoStr(p.tempo)} · ${nomeNoi} ${p.my} - ${p.opp} ${nomeLoro} (${(diff > 0) ? '+' : ''}${diff})`;
}


// Disegno nel PDF nel rettangolo (x, y, w, h): area a gradini (blu sopra lo zero, arancio sotto), linea
// dello scarto, divisione dei quarti, griglia, timeout e legenda sotto il grafico
export function DisegnaDifferenzaPdf (pdf: any,
                                      serie: TSerieDiff,
                                      nomeNoi: string,
                                      nomeLoro: string,
                                      x: number,
                                      y: number,
                                      w: number,
                                      h: number,
                                      font: string,
                                      parziali: { t0: number, t1: number, myTeam: boolean, punti: number }[] = []): void
{
   if (serie.durata <= 0)
      return;
   const rgb = (hex: string): [number, number, number] => [1, 3, 5].map(i => parseInt(hex.substring(i, i + 2), 16)) as [number, number, number];
   const lim = LimiteY(serie);
   const passo = PassoY(lim);
   const sx = (t: number) => x + w * t / serie.durata;
   const sy = (d: number) => y + h / 2 - (h / 2) * d / lim;
   pdf.setFont(font, 'normal');
   pdf.setFontSize(7);
   // griglia orizzontale ed etichette dell'asse
   for (let d = -lim; d <= lim; d += passo)
   {
      pdf.setDrawColor(210, 210, 210);
      pdf.setLineWidth((d === 0) ? 0.4 : 0.15);
      if (d === 0)
         pdf.setDrawColor(90, 90, 90);
      pdf.line(x, sy(d), x + w, sy(d));
      pdf.setTextColor(90, 90, 90);
      pdf.text((d > 0) ? `+${d}` : `${d}`, x - 1.5, sy(d) + 1, { align: 'right' });
   }
   // parziali: fascia chiara dal primo all'ultimo canestro, etichetta in alto
   for (const p of parziali)
   {
      const c = rgb(p.myTeam ? COLORE_NOI_PDF : COLORE_LORO).map(v => Math.round(255 + (v - 255) * 0.18)) as [number, number, number];
      pdf.setFillColor(...c);
      pdf.rect(sx(p.t0) - 0.8, y, sx(p.t1) - sx(p.t0) + 1.6, h, 'F');
      pdf.setFontSize(7);
      pdf.setTextColor(60, 60, 60);
      pdf.text(`${p.punti}-0`, (sx(p.t0) + sx(p.t1)) / 2, y + 3, { align: 'center' });
   }
   // area a gradini
   for (const g of Gradini(serie))
   {
      if (g.diff === 0)
         continue;
      pdf.setFillColor(...rgb((g.diff > 0) ? COLORE_NOI_PDF : COLORE_LORO));
      pdf.rect(sx(g.t0), Math.min(sy(0), sy(g.diff)), sx(g.t1) - sx(g.t0), Math.abs(sy(g.diff) - sy(0)), 'F');
   }
   // divisione dei quarti ed etichette
   pdf.setFontSize(8);
   for (const q of serie.quarti)
   {
      pdf.setDrawColor(120, 120, 120);
      pdf.setLineWidth(0.2);
      pdf.setLineDashPattern([1, 1], 0);
      if (q.inizio > 0)
         pdf.line(sx(q.inizio), y, sx(q.inizio), y + h);
      pdf.setLineDashPattern([], 0);
      pdf.setTextColor(60, 60, 60);
      pdf.text(q.label, (sx(q.inizio) + sx(q.fine)) / 2, y + h + 6, { align: 'center' });
   }
   // linea dello scarto (a gradini)
   pdf.setDrawColor(30, 30, 30);
   pdf.setLineWidth(0.35);
   for (const g of Gradini(serie))
      pdf.line(sx(g.t0), sy(g.diff), sx(g.t1), sy(g.diff));
   for (let i = 1; i < serie.punti.length - 1; i++)
   {
      const prec = serie.punti[i - 1];
      const p = serie.punti[i];
      pdf.line(sx(p.t), sy(prec.my - prec.opp), sx(p.t), sy(p.my - p.opp));
   }
   // timeout: triangolino in alto (noi) o in basso (avversari)
   for (const to of serie.timeout)
   {
      pdf.setFillColor(...rgb(to.myTeam ? COLORE_NOI_PDF : COLORE_LORO));
      pdf.setDrawColor(30, 30, 30);
      pdf.setLineWidth(0.15);
      const tx = sx(to.t);
      if (to.myTeam)
         pdf.triangle(tx - 1.3, y - 2.2, tx + 1.3, y - 2.2, tx, y, 'FD');
      else
         pdf.triangle(tx - 1.3, y + h + 2.2, tx + 1.3, y + h + 2.2, tx, y + h, 'FD');
   }
   // scarti massimi
   pdf.setFont(font, 'bold');
   pdf.setTextColor(0, 0, 0);
   if (serie.maxVant)
      pdf.text(`+${serie.maxVant.my - serie.maxVant.opp}`, sx(serie.maxVant.t), sy(serie.maxVant.my - serie.maxVant.opp) - 1.5, { align: 'center' });
   if (serie.maxSvant)
      pdf.text(`${serie.maxSvant.my - serie.maxSvant.opp}`, sx(serie.maxSvant.t), sy(serie.maxSvant.my - serie.maxSvant.opp) + 4, { align: 'center' });
   // legenda
   const ly = y + h + 13;
   let lx = x;
   pdf.setFont(font, 'normal');
   pdf.setFontSize(9);
   for (const v of [{ c: COLORE_NOI_PDF, t: `${nomeNoi} in vantaggio` }, { c: COLORE_LORO, t: `${nomeLoro} in vantaggio` }])
   {
      pdf.setFillColor(...rgb(v.c));
      pdf.rect(lx, ly - 3, 4, 4, 'F');
      pdf.setTextColor(0, 0, 0);
      pdf.text(v.t, lx + 6, ly);
      lx += 12 + pdf.getTextWidth(v.t);
   }
   pdf.setTextColor(90, 90, 90);
   pdf.text('triangoli: timeout (in alto chiamati da noi, in basso dagli avversari)', lx, ly);
   pdf.setTextColor(0, 0, 0);
}
