import {COLORE_SUPPLEMENTARI, COLORI_QUARTI} from "./campo-tiri/campo-tiri.component";
import {globs} from "./utils";


// Grafici a torta "contributo di ciascun quarto" della pagina Statistiche campionato (a video in SVG e nel
// PDF con jsPDF): la geometria è comune, i due disegni usano gli stessi spicchi. Colori dei quarti come la
// mappa di tiro; i supplementari sono un solo spicchio "Et" (stesso colore per tutti, come nella mappa).


export interface TFettaTorta
{
   etichetta: string;          // "Q1".."Q4", "Et"
   valore: number;             // valore col segno (differenza: anche negativo)
   colore: string;
   negativo: boolean;          // a sfavore (punti subiti, quarto perso nella differenza): tratteggiato
   a0: number;                 // angoli in radianti, 0 = ore 12, senso orario
   a1: number;
}


export interface TTorta
{
   titolo: string;
   totale: number;
   fette: TFettaTorta[];       // solo i quarti con valore diverso da zero
}


// valoriPerQuarto: quarto (1..) -> valore. I supplementari vengono sommati in un unico spicchio.
// aSfavore: tutti gli spicchi sono punti a sfavore (punti subiti) e vanno tratteggiati come i quarti persi
export function CreaTorta (titolo: string,
                           valoriPerQuarto: Map<number, number>,
                           aSfavore: boolean = false): TTorta
{
   const voci: Array<{ etichetta: string, valore: number, colore: string }> = [];
   let suppl = 0;
   let ciSonoSuppl = false;
   for (const [q, v] of [...valoriPerQuarto.entries()].sort((a, b) => a[0] - b[0]))
   {
      if (q <= globs.MaxRegQuarters)
         voci.push({ etichetta: `Q${q}`, valore: v, colore: COLORI_QUARTI[q - 1] });
      else
      {
         suppl += v;
         ciSonoSuppl = true;
      }
   }
   if (ciSonoSuppl)
      voci.push({ etichetta: 'Et', valore: suppl, colore: COLORE_SUPPLEMENTARI });
   const totale = voci.reduce((a, v) => a + v.valore, 0);
   const totAss = voci.reduce((a, v) => a + Math.abs(v.valore), 0);
   const fette: TFettaTorta[] = [];
   let a = 0;
   for (const v of voci)
   {
      if (v.valore === 0)
         continue;
      const ampiezza = 2 * Math.PI * Math.abs(v.valore) / totAss;
      fette.push({ ...v, negativo: aSfavore || (v.valore < 0), a0: a, a1: a + ampiezza });
      a += ampiezza;
   }
   return { titolo, totale, fette };
}


// Percentuale dello spicchio sul totale dei valori assoluti, con una cifra decimale all'italiana
export function PercFetta (f: TFettaTorta): string
{
   return (100 * (f.a1 - f.a0) / (2 * Math.PI)).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}


// Punto sulla circonferenza (angolo 0 = ore 12, senso orario; y verso il basso come in SVG e jsPDF)
export function PuntoTorta (cx: number,
                            cy: number,
                            r: number,
                            angolo: number): [number, number]
{
   return [cx + r * Math.sin(angolo), cy - r * Math.cos(angolo)];
}


// Percorso SVG dello spicchio (cerchio intero se è l'unico)
export function PathFetta (f: TFettaTorta,
                           cx: number,
                           cy: number,
                           r: number): string
{
   if (f.a1 - f.a0 >= 2 * Math.PI - 1e-9)
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r} Z`;
   const [x0, y0] = PuntoTorta(cx, cy, r, f.a0);
   const [x1, y1] = PuntoTorta(cx, cy, r, f.a1);
   const grande = (f.a1 - f.a0 > Math.PI) ? 1 : 0;
   return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${grande} 1 ${x1} ${y1} Z`;
}


// Vertici dello spicchio approssimato a poligono (jsPDF non ha archi): centro + punti ogni ~2 gradi
export function PoligonoFetta (f: TFettaTorta,
                               cx: number,
                               cy: number,
                               r: number): Array<[number, number]>
{
   const passi = Math.max(2, Math.ceil((f.a1 - f.a0) / (Math.PI / 90)));
   const punti: Array<[number, number]> = [];
   const intero = (f.a1 - f.a0 >= 2 * Math.PI - 1e-9);
   if (!intero)
      punti.push([cx, cy]);
   for (let i = 0; i <= passi; i++)
      punti.push(PuntoTorta(cx, cy, r, f.a0 + (f.a1 - f.a0) * i / passi));
   return punti;
}
