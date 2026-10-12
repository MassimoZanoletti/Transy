import {TGiocatoreStatCamp} from "./statistiche-campionato";
import {NumAndamento, TDatiAndamento, TPartitaAndamento} from "./andamento-campionato";
import {COLORE_NOI, COLORE_NOI_PDF} from "./grafico-differenza";


// Andamento stagionale dei giocatori (pagina "Statistiche campionato"): per ogni giocatore e metrica i valori
// partita per partita, per la tabella con i mini-grafici (sparkline) e per il grafico del singolo giocatore.
// Partita senza il giocatore a referto: nessun valore (buco nella linea); a referto ma mai in campo: 0 minuti
// e nessun valore per le altre metriche.


export type TMetricaGiocatore = 'punti' | 'minuti' | 'pir' | 'pm';


// scalaMin: ampiezza minima della scala del mini-grafico, così un giocatore costante (es. sempre 9-11 punti)
// resta quasi piatto invece di sembrare altalenante
export const METRICHE_GIOCATORE: { value: TMetricaGiocatore, label: string, barre: boolean, scalaMin: number }[] = [
   { value: 'punti',  label: 'Punti',   barre: false, scalaMin: 10 },
   { value: 'minuti', label: 'Minuti',  barre: false, scalaMin: 10 },
   { value: 'pir',    label: 'PIR',     barre: false, scalaMin: 10 },
   { value: 'pm',     label: '+/-',     barre: true,  scalaMin: 10 }
];


export interface TAndamentoGiocatore
{
   id: number;
   numero: string;
   nome: string;
   partite: number;            // partite a referto
   valori: Record<TMetricaGiocatore, (number | null)[]>;   // una voce per partita selezionata
}


// giocatori: con la serie partita per partita (AccumulaGiocatori); numPartite: partite selezionate
export function AndamentoGiocatori (giocatori: TGiocatoreStatCamp[],
                                    numPartite: number): TAndamentoGiocatore[]
{
   return giocatori
      .filter(g => g.serie.some(s => s.entrato))
      .sort((a, b) => b.secondi - a.secondi)
      .map(g =>
      {
         const vuoto = () => new Array<number | null>(numPartite).fill(null);
         const valori: Record<TMetricaGiocatore, (number | null)[]> = { punti: vuoto(), minuti: vuoto(), pir: vuoto(), pm: vuoto() };
         for (const s of g.serie)
         {
            if ((s.indice < 0) || (s.indice >= numPartite))
               continue;
            valori.minuti[s.indice] = Math.round(s.secondi / 6) / 10;
            if (s.entrato)
            {
               valori.punti[s.indice] = s.punti;
               valori.pir[s.indice] = s.pir;
               valori.pm[s.indice] = s.pm;
            }
         }
         return { id: g.id, numero: g.numero, nome: g.nome, partite: g.serie.length, valori };
      });
}


export function MediaValori (valori: (number | null)[]): number | null
{
   const v = valori.filter((x): x is number => x !== null);
   return (v.length > 0) ? v.reduce((a, b) => a + b, 0) / v.length : null;
}


// Geometria del mini-grafico in un riquadro w x h (scala propria della riga: mostra la forma dell'andamento,
// il valore lo dice la media accanto): punti della linea (null = buco), y della media, partite del massimo e
// del minimo
export interface TSparkline
{
   punti: ([number, number] | null)[];
   yMedia: number | null;
   iMax: number;
   iMin: number;
   yZero: number | null;       // linea dello zero se la scala lo comprende (+/-)
}


export function Sparkline (valori: (number | null)[],
                           w: number,
                           h: number,
                           margine: number = 2,
                           scalaMin: number = 0): TSparkline
{
   const v = valori.filter((x): x is number => x !== null);
   if (v.length === 0)
      return { punti: valori.map(() => null), yMedia: null, iMax: -1, iMin: -1, yZero: null };
   let min = Math.min(...v);
   let max = Math.max(...v);
   // ampiezza minima, attorno al centro dei valori
   const ampiezza = Math.max(scalaMin, 2);
   if (max - min < ampiezza)
   {
      const centro = (min + max) / 2;
      min = centro - ampiezza / 2;
      max = centro + ampiezza / 2;
   }
   const n = Math.max(1, valori.length - 1);
   const sx = (i: number) => margine + (w - 2 * margine) * ((valori.length > 1) ? i / n : 0.5);
   const sy = (x: number) => margine + (h - 2 * margine) * (max - x) / (max - min);
   const media = MediaValori(valori)!;
   let iMax = -1;
   let iMin = -1;
   valori.forEach((x, i) =>
   {
      if (x === null)
         return;
      if ((iMax < 0) || (x > valori[iMax]!))
         iMax = i;
      if ((iMin < 0) || (x < valori[iMin]!))
         iMin = i;
   });
   return {
      punti: valori.map((x, i) => (x === null) ? null : [sx(i), sy(x)]),
      yMedia: sy(media),
      iMax, iMin,
      yZero: ((min < 0) && (max > 0)) ? sy(0) : null
   };
}


// Dati per il grafico grande del singolo giocatore (stesso componente dell'andamento di squadra)
export function DatiAndamentoGiocatore (g: TAndamentoGiocatore,
                                        metrica: TMetricaGiocatore,
                                        partite: TPartitaAndamento[]): TDatiAndamento
{
   const def = METRICHE_GIOCATORE.find(m => m.value === metrica)!;
   return {
      titolo: `${def.label} - ${g.numero} ${g.nome}`,
      barre: def.barre,
      serie: [{ nome: `${g.numero} ${g.nome}`, colore: COLORE_NOI, valori: g.valori[metrica] }],
      etichette: partite.map(p => { const m = /^(\d{1,2})[\/.-](\d{1,2})/.exec(p.riga.data ?? ''); return m ? `${m[1].padStart(2, '0')}/${m[2].padStart(2, '0')}` : p.riga.data; }),
      esiti: partite.map(p => (p.riga.dif > 0) ? 'V' : (p.riga.dif < 0) ? 'P' : ''),
      dettagli: partite.map(p => `${p.riga.data} ${p.riga.casaTrasf === 'C' ? 'in casa' : 'in trasferta'} con ${p.riga.squadra}: ${p.riga.puntiF}-${p.riga.puntiS}`)
   };
}


export const NumMetrica = (v: number | null, metrica: TMetricaGiocatore) => NumAndamento(v, metrica === 'pm');


// ---------------------------------------------------------------- PDF

// Tabella con i mini-grafici: una riga per giocatore, per ogni metrica il mini-grafico (linea rossa, media
// tratteggiata, massimo pieno e minimo vuoto) e la media. Restituisce la y finale.
export function TabellaSparklinePdf (pdf: any,
                                     autoTable: any,
                                     andamento: TAndamentoGiocatore[],
                                     startY: number,
                                     font: string): number
{
   const rgb = (hex: string): [number, number, number] => [1, 3, 5].map(i => parseInt(hex.substring(i, i + 2), 16)) as [number, number, number];
   const metriche = METRICHE_GIOCATORE;
   const colSpark = 42;
   const colMedia = 13;
   autoTable(pdf, {
      startY,
      head: [['Giocatore', 'Part', ...metriche.flatMap(m => [{ content: m.label, colSpan: 2, styles: { halign: 'center' } }])]],
      body: andamento.map(g => [
         `${g.numero} ${g.nome}`, String(g.partite),
         ...metriche.flatMap(m => [{ content: '', spark: g.valori[m.value], scalaMin: m.scalaMin }, NumMetrica(MediaValori(g.valori[m.value]), m.value)])
      ]),
      styles:       { font, valign: 'middle', halign: 'right', minCellHeight: 10 },
      headStyles:   { fillColor: [255, 190, 0], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9, cellPadding: 0.8 },
      bodyStyles:   { fontSize: 9, cellPadding: 0.8, fillColor: [255, 255, 255], textColor: [0, 0, 0] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      columnStyles: {
         0: { halign: 'left', cellWidth: 45 }, 1: { halign: 'center', cellWidth: 12 },
         ...Object.fromEntries(metriche.flatMap((_, k) => [[2 + 2 * k, { cellWidth: colSpark }], [3 + 2 * k, { cellWidth: colMedia }]]))
      },
      margin:       { left: 5, right: 5 },
      theme:        'grid',
      didDrawCell:  (d: any) =>
      {
         if ((d.section !== 'body') || !d.cell.raw?.spark)
            return;
         const valori: (number | null)[] = d.cell.raw.spark;
         const { x, y, width, height } = d.cell;
         const s = Sparkline(valori, width, height, 1.6, d.cell.raw.scalaMin);
         // zero e media
         pdf.setLineWidth(0.15);
         if (s.yZero !== null)
         {
            pdf.setDrawColor(170, 170, 170);
            pdf.line(x + 1, y + s.yZero, x + width - 1, y + s.yZero);
         }
         if (s.yMedia !== null)
         {
            pdf.setDrawColor(130, 130, 130);
            pdf.setLineDashPattern([0.8, 0.6], 0);
            pdf.line(x + 1, y + s.yMedia, x + width - 1, y + s.yMedia);
            pdf.setLineDashPattern([], 0);
         }
         // linea (spezzata ai buchi)
         const rosso = rgb(COLORE_NOI_PDF);
         pdf.setDrawColor(...rosso);
         pdf.setLineWidth(0.4);
         for (let i = 1; i < s.punti.length; i++)
         {
            const a = s.punti[i - 1];
            const b = s.punti[i];
            if (a && b)
               pdf.line(x + a[0], y + a[1], x + b[0], y + b[1]);
         }
         // punti isolati (vicini a buchi) e massimo/minimo
         s.punti.forEach((p, i) =>
         {
            if (!p)
               return;
            const isolato = !s.punti[i - 1] && !s.punti[i + 1];
            if ((i === s.iMax) || isolato)
            {
               pdf.setFillColor(...rosso);
               pdf.circle(x + p[0], y + p[1], 0.7, 'F');
            }
            else if (i === s.iMin)
            {
               pdf.setFillColor(255, 255, 255);
               pdf.setDrawColor(...rosso);
               pdf.setLineWidth(0.3);
               pdf.circle(x + p[0], y + p[1], 0.7, 'FD');
            }
         });
      }
   });
   const yFine = (pdf as any).lastAutoTable.finalY + 4;
   pdf.setFontSize(7.5);
   pdf.setFont(font, 'normal');
   pdf.setTextColor(90, 90, 90);
   pdf.text(pdf.splitTextToSize('Ogni mini-grafico ha la scala del giocatore (con un\'ampiezza minima di 10, così chi è costante ' +
            'resta piatto): mostra la forma dell\'andamento (crescita, calo, costanza), il valore lo dice la media accanto. Linea tratteggiata: media; pallino pieno: la partita migliore; ' +
            'pallino vuoto: la peggiore. Buchi: partite non giocate. Minuti in minuti di gioco.', 287), 5, yFine);
   pdf.setTextColor(0, 0, 0);
   return yFine + 8;
}

