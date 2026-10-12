import {TRigaStatCamp} from "./statistiche-campionato";
import {NetRtg, TFourFactors} from "./four-factors";
import {COLORE_LORO, COLORE_NOI, COLORE_NOI_PDF, ColorePdf} from "./grafico-differenza";


// Andamento partita per partita nella pagina "Statistiche campionato": una metrica alla volta, per la
// squadra (rosso) e, dove ha senso, per gli avversari (azzurro); la differenza e il Net rating come barre
// sopra/sotto lo zero. Media mobile sulle ultime MEDIA_MOBILE partite.


export const MEDIA_MOBILE = 3;


export type TMetricaAndamento = 'punti' | 'diff' | 'net' | 'rating' | 'efg' | 'tov' | 'orb' | 'ftr' | 'pace' | 'poss';


export const METRICHE_ANDAMENTO: { value: TMetricaAndamento, label: string }[] = [
   { value: 'punti',  label: 'Punti' },
   { value: 'diff',   label: 'Differenza' },
   { value: 'net',    label: 'Net rating' },
   { value: 'rating', label: 'Punti/100 poss.' },
   { value: 'efg',    label: 'eFG%' },
   { value: 'tov',    label: 'Palle perse %' },
   { value: 'orb',    label: 'Rimb. off. %' },
   { value: 'ftr',    label: 'TL/TdC' },
   { value: 'pace',   label: 'Pace (ritmo)' },
   { value: 'poss',   label: 'Possessi' }
];


export interface TPartitaAndamento
{
   riga: TRigaStatCamp;
   ff: TFourFactors;
}


export interface TSerieAndamento
{
   nome: string;
   colore: string;
   valori: (number | null)[];
}


export interface TDatiAndamento
{
   titolo: string;
   barre: boolean;             // true: una serie di barre sopra/sotto lo zero (rosso a nostro favore, azzurro contro)
   serie: TSerieAndamento[];
   etichette: string[];        // asse x: data gg/mm
   esiti: string[];            // "V" vinta, "P" persa, "" pari
   dettagli: string[];         // descrizione della partita per il tooltip
}


const Fattore = (p: TPartitaAndamento, sigla: string) => p.ff.fattori.find(f => f.sigla === sigla);


export function DatiAndamento (partite: TPartitaAndamento[],
                               metrica: TMetricaAndamento,
                               nomeNoi: string): TDatiAndamento
{
   const noi = (valori: (number | null)[]): TSerieAndamento => ({ nome: nomeNoi, colore: COLORE_NOI, valori });
   const loro = (valori: (number | null)[]): TSerieAndamento => ({ nome: 'Avversari', colore: COLORE_LORO, valori });
   const coppia = (sigla: string) => [noi(partite.map(p => Fattore(p, sigla)?.noi ?? null)), loro(partite.map(p => Fattore(p, sigla)?.loro ?? null))];
   const titolo = METRICHE_ANDAMENTO.find(m => m.value === metrica)?.label ?? '';
   let serie: TSerieAndamento[];
   let barre = false;
   switch (metrica)
   {
      case 'punti':  serie = [noi(partite.map(p => p.riga.puntiF)), loro(partite.map(p => p.riga.puntiS))]; break;
      case 'diff':   serie = [noi(partite.map(p => p.riga.dif))]; barre = true; break;
      case 'net':    serie = [noi(partite.map(p => NetRtg(p.ff)))]; barre = true; break;
      case 'rating': serie = [noi(partite.map(p => p.ff.offRtg)), loro(partite.map(p => p.ff.difRtg))]; break;
      case 'efg':    serie = coppia('eFG%'); break;
      case 'tov':    serie = coppia('TOV%'); break;
      case 'orb':    serie = coppia('ORB%'); break;
      case 'ftr':    serie = coppia('TL/TdC'); break;
      case 'pace':   serie = [noi(partite.map(p => p.ff.pace))]; serie[0].nome = 'Pace'; break;
      case 'poss':   serie = [noi(partite.map(p => p.ff.possessi))]; serie[0].nome = 'Possessi'; break;
   }
   return {
      titolo, barre, serie,
      etichette: partite.map(p => DataBreve(p.riga.data)),
      esiti:     partite.map(p => (p.riga.dif > 0) ? 'V' : (p.riga.dif < 0) ? 'P' : ''),
      dettagli:  partite.map(p => `${p.riga.data} ${p.riga.casaTrasf === 'C' ? 'in casa' : 'in trasferta'} con ${p.riga.squadra}: ${p.riga.puntiF}-${p.riga.puntiS}`)
   };
}


// "12/10/2026" -> "12/10" (altri formati lasciati com'erano)
function DataBreve (data: string): string
{
   const m = /^(\d{1,2})[\/.-](\d{1,2})/.exec(data ?? '');
   return m ? `${m[1].padStart(2, '0')}/${m[2].padStart(2, '0')}` : (data ?? '');
}


// Media delle ultime n partite (quelle senza valore non contano); null finché non ce n'è almeno una
export function MediaMobile (valori: (number | null)[],
                             n: number = MEDIA_MOBILE): (number | null)[]
{
   return valori.map((_, i) =>
   {
      const finestra = valori.slice(Math.max(0, i - n + 1), i + 1).filter((v): v is number => v !== null);
      return (finestra.length > 0) ? finestra.reduce((a, b) => a + b, 0) / finestra.length : null;
   });
}


// Scala dell'asse y: limiti "tondi" e passo delle linee di griglia. Con le barre è simmetrica attorno a zero.
export function ScalaY (dati: TDatiAndamento): { min: number, max: number, passo: number }
{
   const valori = dati.serie.flatMap(s => s.valori).filter((v): v is number => v !== null);
   if (valori.length === 0)
      return { min: 0, max: 10, passo: 5 };
   let min = Math.min(...valori);
   let max = Math.max(...valori);
   if (dati.barre)
   {
      const m = Math.max(5, Math.abs(min), Math.abs(max));
      min = -m;
      max = m;
   }
   else if (max - min < 4)
   {
      min -= 2;
      max += 2;
   }
   const grezzo = (max - min) / 5;
   const potenza = Math.pow(10, Math.floor(Math.log10(grezzo)));
   const passo = [1, 2, 5, 10].map(k => k * potenza).find(p => p >= grezzo) ?? 10 * potenza;
   return { min: Math.floor(min / passo) * passo, max: Math.ceil(max / passo) * passo, passo };
}


export function NumAndamento (v: number | null,
                              segno: boolean = false): string
{
   if (v === null)
      return '';
   const s = v.toLocaleString('it-IT', { maximumFractionDigits: 1 });
   return (segno && (v > 0)) ? `+${s}` : s;
}


// ---------------------------------------------------------------- PDF

// Un grafico nel rettangolo (x, y, w, h) del PDF: titolo sopra, etichette delle partite sotto
export function DisegnaAndamentoPdf (pdf: any,
                                     dati: TDatiAndamento,
                                     x: number,
                                     y: number,
                                     w: number,
                                     h: number,
                                     font: string,
                                     mediaMobile: boolean): void
{
   const rgb = (hex: string): [number, number, number] => [1, 3, 5].map(i => parseInt(hex.substring(i, i + 2), 16)) as [number, number, number];
   const n = dati.etichette.length;
   const scala = ScalaY(dati);
   const sx = (i: number) => x + w * (i + 0.5) / Math.max(1, n);
   const sy = (v: number) => y + h - h * (v - scala.min) / (scala.max - scala.min);
   pdf.setFont(font, 'bold');
   pdf.setFontSize(10);
   pdf.setTextColor(0, 0, 0);
   pdf.text(dati.titolo, x, y - 3);
   // legenda accanto al titolo
   let lx = x + pdf.getTextWidth(dati.titolo) + 6;
   pdf.setFont(font, 'normal');
   pdf.setFontSize(8);
   if (!dati.barre)
      for (const s of dati.serie)
      {
         pdf.setFillColor(...rgb(ColorePdf(s.colore)));
         pdf.rect(lx, y - 5.5, 3, 3, 'F');
         pdf.text(s.nome, lx + 4, y - 3);
         lx += 10 + pdf.getTextWidth(s.nome);
      }
   if (mediaMobile)
      pdf.text(`linee: media delle ultime ${MEDIA_MOBILE} partite`, lx, y - 3);
   // griglia
   pdf.setFontSize(7);
   for (let v = scala.min; v <= scala.max + 1e-9; v += scala.passo)
   {
      pdf.setDrawColor(...((Math.abs(v) < 1e-9) ? [90, 90, 90] : [215, 215, 215]) as [number, number, number]);
      pdf.setLineWidth((Math.abs(v) < 1e-9) ? 0.35 : 0.15);
      pdf.line(x, sy(v), x + w, sy(v));
      pdf.setTextColor(90, 90, 90);
      pdf.text(NumAndamento(v, dati.barre), x - 1.5, sy(v) + 1, { align: 'right' });
   }
   // etichette delle partite (al massimo una ventina, le altre saltate)
   const ogni = Math.max(1, Math.ceil(n / 20));
   for (let i = 0; i < n; i += ogni)
   {
      pdf.setTextColor(90, 90, 90);
      pdf.text(dati.etichette[i], sx(i), y + h + 3.5, { align: 'center' });
      pdf.setTextColor(0, 0, 0);
      pdf.text(dati.esiti[i], sx(i), y + h + 7, { align: 'center' });
   }
   if (dati.barre)
   {
      const larghezza = Math.min(8, 0.6 * w / Math.max(1, n));
      dati.serie[0].valori.forEach((v, i) =>
      {
         if ((v === null) || (v === 0))
            return;
         pdf.setFillColor(...rgb((v > 0) ? COLORE_NOI_PDF : COLORE_LORO));
         pdf.rect(sx(i) - larghezza / 2, Math.min(sy(0), sy(v)), larghezza, Math.abs(sy(v) - sy(0)), 'F');
      });
      if (mediaMobile)
         Spezzata(pdf, MediaMobile(dati.serie[0].valori), sx, sy, [30, 30, 30], 0.5);
      return;
   }
   for (const s of dati.serie)
   {
      const colore = rgb(ColorePdf(s.colore));
      // valori della partita: pallini (e linea sottile se senza media mobile)
      if (!mediaMobile)
         Spezzata(pdf, s.valori, sx, sy, colore, 0.4);
      pdf.setFillColor(...colore);
      s.valori.forEach((v, i) => { if (v !== null) pdf.circle(sx(i), sy(v), mediaMobile ? 0.7 : 0.9, 'F'); });
      if (mediaMobile)
         Spezzata(pdf, MediaMobile(s.valori), sx, sy, colore, 0.6);
   }
}


function Spezzata (pdf: any,
                   valori: (number | null)[],
                   sx: (i: number) => number,
                   sy: (v: number) => number,
                   colore: [number, number, number],
                   spessore: number): void
{
   pdf.setDrawColor(...colore);
   pdf.setLineWidth(spessore);
   for (let i = 1; i < valori.length; i++)
   {
      const a = valori[i - 1];
      const b = valori[i];
      if ((a !== null) && (b !== null))
         pdf.line(sx(i - 1), sy(a), sx(i), sy(b));
   }
}
