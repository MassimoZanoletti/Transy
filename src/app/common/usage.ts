import {TMatchPlayer, TTipoRealizzazione} from "../models/datamod";
import {COLORE_NOI_PDF} from "./grafico-differenza";


// Usage % ed efficienza (TS%) dei giocatori, per la tabella e il grafico volume/efficienza.
// USG% (formula di Basketball-Reference) = 100 x possessi usati x (minuti squadra / 5) /
//                                          (minuti giocatore x possessi usati dalla squadra),
// con possessi usati = TdC tentati + 0,44 TL tentati + palle perse. Le palle perse attribuite alla sola
// squadra contano nei possessi della squadra ma di nessun giocatore: la somma degli usage resta sotto il 100%.
// TS% = punti / (2 x (TdC tentati + 0,44 TL tentati)).
// Il volume sull'asse orizzontale del grafico può essere l'usage (rispetto ai minuti in campo) oppure il
// volume grezzo, i tentativi di tiro (TdC + 0,44 TL) per partita.


export type TAsseVolume = 'usage' | 'tiri';


export interface TUsoGiocatore
{
   id: number;
   numero: string;
   nome: string;
   secondi: number;
   partite: number;
   punti: number;
   fga: number;                // tiri dal campo tentati
   fta: number;                // liberi tentati
   pp: number;
   usage: number | null;       // null: troppo pochi minuti (o nessun possesso della squadra)
   tiri: number | null;        // tentativi di tiro per partita; null: troppo pochi minuti
   ts: number | null;          // null: nessun tiro
   pochiMinuti: boolean;
}


export interface TUsageSquadra
{
   giocatori: TUsoGiocatore[]; // in ordine di usage (quelli con pochi minuti in fondo)
   tsSquadra: number | null;
   minSecondi: number;         // soglia sotto la quale usage e volume non si mostrano
}


export interface TBaseUsage
{
   id: number;
   numero: string;
   nome: string;
   secondi: number;
   partite?: number;           // partite giocate (campionato); 1 se assente
   punti: number;
   fga: number;
   fta: number;
   pp: number;
}


// Soglie: in una partita almeno 5 minuti; sul campionato 2 minuti e mezzo per partita selezionata, con un
// minimo di 15 (chi ha giocato poco ha un usage instabile)
export const MIN_SECONDI_PARTITA = 300;
export const MinSecondiCampionato = (partite: number) => Math.max(900, 150 * partite);


const PossUsati = (b: { fga: number, fta: number, pp: number }) => b.fga + 0.44 * b.fta + b.pp;


export function TsPerc (punti: number,
                        fga: number,
                        fta: number): number | null
{
   const den = 2 * (fga + 0.44 * fta);
   return (den > 0) ? 100 * punti / den : null;
}


// squadra: totali della squadra (palle perse della sola squadra comprese); minSecondi: soglia dei minuti.
// I minuti della squadra sono la somma dei minuti dei giocatori (5 in campo per tutta la partita).
export function CalcolaUsage (base: TBaseUsage[],
                              squadra: { punti: number, fga: number, fta: number, pp: number },
                              minSecondi: number): TUsageSquadra
{
   const secondiSquadra = base.reduce((a, g) => a + g.secondi, 0);
   const possSquadra = PossUsati(squadra);
   const giocatori: TUsoGiocatore[] = base
      .filter(g => (g.secondi > 0) || (g.fga + g.fta + g.pp > 0))
      .map(g =>
      {
         const pochiMinuti = g.secondi < minSecondi;
         const partite = Math.max(1, g.partite ?? 1);
         const usage = ((!pochiMinuti) && (possSquadra > 0) && (g.secondi > 0))
            ? 100 * PossUsati(g) * (secondiSquadra / 5) / (g.secondi * possSquadra) : null;
         const tiri = pochiMinuti ? null : (g.fga + 0.44 * g.fta) / partite;
         return { ...g, partite, usage, tiri, ts: TsPerc(g.punti, g.fga, g.fta), pochiMinuti };
      })
      .sort((a, b) => ((b.usage ?? -1) - (a.usage ?? -1)) || (b.secondi - a.secondi));
   return { giocatori, tsSquadra: TsPerc(squadra.punti, squadra.fga, squadra.fta), minSecondi };
}


// Dati di base dai giocatori della partita (tiri dalle realizzazioni, minuti da MinutiPerQuarto)
export function BaseDaGiocatori (giocatori: TMatchPlayer[],
                                 secondi: Map<TMatchPlayer, number[]>): TBaseUsage[]
{
   return giocatori.map(p =>
   {
      const r = p.realizzazioni();
      return {
         id: p.playerRecID, numero: p.playNumber(), nome: p.playName(),
         secondi: (secondi.get(p) ?? []).reduce((a, b) => a + b, 0),
         punti: p.CalcolaPunti(),
         fga: r.filter(x => (x.rTipo === TTipoRealizzazione.trT2) || (x.rTipo === TTipoRealizzazione.trT3)).length,
         fta: r.filter(x => x.rTipo === TTipoRealizzazione.trTL).length,
         pp: p.pPerse()
      };
   });
}


export const NumU = (v: number | null) => (v === null) ? '' : v.toLocaleString('it-IT', { maximumFractionDigits: 1 });


// ---------------------------------------------------------------- asse del volume

export interface TDefAsse
{
   valore: (g: TUsoGiocatore) => number | null;
   titolo: string;             // titolo dell'asse
   unita: string;              // '%' o ''
   riferimento: number;        // linea tratteggiata verticale
   etichettaRif: string;
   didascalia: { intro: string, zone: string[] };
}


export function DefAsse (u: TUsageSquadra,
                         asse: TAsseVolume,
                         campionato: boolean): TDefAsse
{
   if (asse === 'usage')
      return {
         valore: g => g.usage,
         titolo: 'Usage % (quanto gioco passa dal giocatore)',
         unita: '%',
         riferimento: 20,
         etichettaRif: 'usage medio 20%',
         didascalia: {
            intro: 'Due linee tratteggiate: usage medio 20% e TS% della squadra. Dividono il grafico in quattro zone:',
            zone: [
               'in alto a destra: tanti possessi resi bene (il vostro realizzatore);',
               'in basso a destra: tanti possessi resi male, il caso da correggere;',
               'in alto a sinistra: pochi possessi ma efficienti, forse da coinvolgere di più;',
               'in basso a sinistra: poco coinvolti e poco efficaci.'
            ]
         }
      };
   const valori = u.giocatori.map(g => g.tiri).filter((v): v is number => v !== null);
   const media = (valori.length > 0) ? valori.reduce((a, b) => a + b, 0) / valori.length : 0;
   return {
      valore: g => g.tiri,
      titolo: `Tentativi di tiro${campionato ? ' per partita' : ''} (TdC + 0,44 x TL)`,
      unita: '',
      riferimento: media,
      etichettaRif: `media ${NumU(media)}`,
      didascalia: {
         intro: 'Due linee tratteggiate: tentativi di tiro medi dei giocatori e TS% della squadra. Dividono il grafico in quattro zone:',
         zone: [
            'in alto a destra: tirano tanto e bene (il vostro realizzatore);',
            'in basso a destra: tirano tanto e male, il caso da correggere;',
            'in alto a sinistra: tirano poco ma bene, forse da far tirare di più;',
            'in basso a sinistra: tirano poco e male.'
         ]
      }
   };
}


// Assi: volume da 0 a un massimo "tondo" (usage almeno 40%), TS% fra un minimo e un massimo tondi (almeno 30-80)
export function ScaleUsage (u: TUsageSquadra,
                            def: TDefAsse): { xMax: number, xPasso: number, yMin: number, yMax: number }
{
   const punti = u.giocatori.filter(g => (def.valore(g) !== null) && (g.ts !== null));
   const maxX = Math.max(def.unita ? 40 : 4, ...punti.map(g => def.valore(g)! * 1.08));
   const grezzo = maxX / 5;
   const potenza = Math.pow(10, Math.floor(Math.log10(grezzo)));
   const xPasso = def.unita ? 10 : ([1, 2, 5, 10].map(k => k * potenza).find(p => p >= grezzo) ?? 10 * potenza);
   const xMax = xPasso * Math.ceil(maxX / xPasso);
   const yMin = 10 * Math.floor(Math.min(30, ...punti.map(g => g.ts! - 3)) / 10);
   const yMax = 10 * Math.ceil(Math.max(80, ...punti.map(g => g.ts! + 3)) / 10);
   return { xMax, xPasso, yMin: Math.max(0, yMin), yMax };
}


// ---------------------------------------------------------------- PDF

// Grafico volume/efficienza nel rettangolo (x, y, w, h): un punto per giocatore col suo numero, linee di
// riferimento al volume medio e al TS% della squadra, didascalia sotto
export function DisegnaUsagePdf (pdf: any,
                                 u: TUsageSquadra,
                                 x: number,
                                 y: number,
                                 w: number,
                                 h: number,
                                 font: string,
                                 asse: TAsseVolume = 'usage',
                                 campionato: boolean = false): void
{
   const rgb = (hex: string): [number, number, number] => [1, 3, 5].map(i => parseInt(hex.substring(i, i + 2), 16)) as [number, number, number];
   const def = DefAsse(u, asse, campionato);
   const s = ScaleUsage(u, def);
   const sx = (v: number) => x + w * v / s.xMax;
   const sy = (v: number) => y + h - h * (v - s.yMin) / (s.yMax - s.yMin);
   pdf.setFont(font, 'normal');
   pdf.setFontSize(7);
   // griglia
   for (let v = 0; v <= s.xMax + 1e-9; v += s.xPasso)
   {
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.15);
      pdf.line(sx(v), y, sx(v), y + h);
      pdf.setTextColor(90, 90, 90);
      pdf.text(`${NumU(v)}${def.unita}`, sx(v), y + h + 3.5, { align: 'center' });
   }
   for (let v = s.yMin; v <= s.yMax; v += 10)
   {
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.15);
      pdf.line(x, sy(v), x + w, sy(v));
      pdf.text(`${v}%`, x - 1.5, sy(v) + 1, { align: 'right' });
   }
   // riferimenti
   pdf.setDrawColor(90, 90, 90);
   pdf.setLineWidth(0.3);
   pdf.setLineDashPattern([1.2, 1], 0);
   pdf.line(sx(def.riferimento), y, sx(def.riferimento), y + h);
   if (u.tsSquadra !== null)
      pdf.line(x, sy(u.tsSquadra), x + w, sy(u.tsSquadra));
   pdf.setLineDashPattern([], 0);
   pdf.setFontSize(7);
   pdf.setTextColor(90, 90, 90);
   pdf.text(def.etichettaRif, sx(def.riferimento) + 1, y + 3);
   if (u.tsSquadra !== null)
      pdf.text(`TS% squadra ${NumU(u.tsSquadra)}%`, x + w - 1, sy(u.tsSquadra) - 1, { align: 'right' });
   // assi
   pdf.setFontSize(8);
   pdf.setTextColor(0, 0, 0);
   pdf.text(def.titolo, x + w / 2, y + h + 8, { align: 'center' });
   pdf.text('TS% (efficienza al tiro)', x - 9, y + h / 2, { angle: 90, align: 'center' });
   // didascalia sotto il grafico (dopo il titolo dell'asse x)
   pdf.setFontSize(8);
   pdf.setFont(font, 'normal');
   pdf.setTextColor(60, 60, 60);
   let yDid = y + h + 14;
   for (const riga of pdf.splitTextToSize(def.didascalia.intro, w) as string[])
   {
      pdf.text(riga, x, yDid);
      yDid += 3.4;
   }
   for (const zona of def.didascalia.zone)
   {
      pdf.text('-', x + 2, yDid);
      pdf.text(zona, x + 5, yDid);
      yDid += 3.4;
   }
   pdf.setTextColor(0, 0, 0);
   // punti
   for (const g of u.giocatori.filter(v => (def.valore(v) !== null) && (v.ts !== null)))
   {
      pdf.setFillColor(...rgb(COLORE_NOI_PDF));
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.4);
      pdf.circle(sx(def.valore(g)!), sy(g.ts!), 1.6, 'FD');
      pdf.setFontSize(7);
      pdf.setFont(font, 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(g.numero, sx(def.valore(g)!) + 2.3, sy(g.ts!) + 1);
      pdf.setFont(font, 'normal');
   }
}


export function TabellaUsagePdf (pdf: any,
                                 autoTable: any,
                                 u: TUsageSquadra,
                                 startY: number,
                                 left: number,
                                 larghezza: number,
                                 font: string,
                                 campionato: boolean = false): number
{
   const min = (s: number) => `${Math.floor(Math.round(s) / 60)}:${String(Math.round(s) % 60).padStart(2, '0')}`;
   autoTable(pdf, {
      startY,
      head: [['Giocatore', 'Min', 'USG%', campionato ? 'Tiri/P' : 'Tiri', 'TS%', 'Punti', 'TdC T', 'TL T', 'PP']],
      body: u.giocatori.map(g => [
         { content: `${g.numero} ${g.nome}`, styles: { halign: 'left' } },
         min(g.secondi), g.pochiMinuti ? 'pochi min.' : NumU(g.usage), NumU(g.tiri), NumU(g.ts),
         String(g.punti), String(g.fga), String(g.fta), String(g.pp)
      ].map(c => (g.pochiMinuti && (typeof c === 'string')) ? { content: c, styles: { textColor: [130, 130, 130] } } : c)),
      styles:       { font, halign: 'right' },
      headStyles:   { fillColor: [255, 190, 0], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 8, cellPadding: 0.7, halign: 'center' },
      bodyStyles:   { fontSize: 8, cellPadding: 0.7, fillColor: [255, 255, 255], textColor: [0, 0, 0] },
      alternateRowStyles: { fillColor: [221, 221, 221] },
      tableWidth:   larghezza,
      margin:       { left },
      theme:        'grid'
   });
   let y = (pdf as any).lastAutoTable.finalY + 4;
   pdf.setFontSize(7);
   pdf.setFont(font, 'normal');
   pdf.setTextColor(90, 90, 90);
   for (const nota of [
      'USG%: possessi usati dal giocatore (tiri, liberi, palle perse) sul totale della squadra mentre era in campo; media 20%.',
      `Tiri: tentativi di tiro${campionato ? ' per partita' : ''}, TdC + 0,44 x TL (volume grezzo, premia chi gioca di più).`,
      `TS%: efficienza al tiro, liberi compresi. Usage e tiri solo con almeno ${Math.round(u.minSecondi / 60)} minuti giocati.`,
      'Alto volume e TS% sotto quello della squadra: si prende molti tiri rendendo poco.'
   ])
      for (const riga of pdf.splitTextToSize(nota, larghezza) as string[])
      {
         pdf.text(riga, left, y);
         y += 3.2;
      }
   pdf.setTextColor(0, 0, 0);
   return y;
}
