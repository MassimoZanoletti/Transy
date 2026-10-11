import {TMatchPlayer, TTipoRealizzazione} from "../models/datamod";

// Scala dei punti per tiro: non indica una squadra, quindi colori diversi da quelli delle squadre
export const COLORE_ZONA_SOPRA = '#1f9e89';
export const COLORE_ZONA_SOTTO = '#d9782a';


// Mappa di tiro a zone: i tiri da 2 e da 3 con posizione vengono raggruppati in 10 zone del campo e ogni
// zona è colorata secondo i punti per tiro. Coordinate dell'immagine del campo (assets/campo-tiri.png,
// 571x539, canestro in alto), misurate sull'immagine: circa 37 pixel per metro.
//  - da 2: sotto canestro, resto dell'area colorata, media distanza sinistra / centrale / destra
//  - da 3: angolo sinistro / destro, ala sinistra / destra, frontale
// Il valore del tiro (2 o 3) è quello registrato, la posizione decide solo la zona: un tiro da 3 cliccato
// appena dentro l'arco resta da 3.


export const CAMPO_W = 571;
export const CAMPO_H = 539;
const CX = 287.5;              // centro del canestro
const CY = 51;
const ARCO_CY = 72;            // centro dell'arco da 3 (come disegnato nell'immagine)
const ARCO_R = 248;
const LINEA_SX = 39;           // tratti dritti della linea da 3
const LINEA_DX = 537;
const AREA = { x0: 197, x1: 378, y1: 219 };
const SOTTO_R = 66;            // circa 1,8 m dal canestro
const ANGOLO_Y = 110;          // tiri da 3 entro circa 3 m dalla linea di fondo: angolo
const SETTORE_CENTRALE = 25;   // gradi a destra e sinistra della verticale del canestro: zona centrale/frontale

// sotto questa soglia di tentativi la zona non viene colorata (troppo pochi tiri)
export const MIN_TIRI_ZONA = 3;
// punti per tiro "neutri": sopra blu, sotto arancio
export const PPS_NEUTRO = 1.0;


export type TIdZona = 'sotto' | 'area' | 'mediaSx' | 'mediaCentro' | 'mediaDx' |
                      'angoloSx' | 'alaSx' | 'frontale' | 'alaDx' | 'angoloDx';


export interface TZonaTiro
{
   id: TIdZona;
   nome: string;
   valore: 2 | 3;
   segnati: number;
   tentati: number;
   etichetta: { x: number, y: number };
}


export interface TMappaZone
{
   zone: TZonaTiro[];
   conPosizione: number;
   senzaPosizione: number;
}


const ZONE: { id: TIdZona, nome: string, valore: 2 | 3, x: number, y: number }[] = [
   { id: 'sotto',       nome: 'Sotto canestro',        valore: 2, x: CX,  y: 92 },
   { id: 'area',        nome: 'Area colorata',         valore: 2, x: CX,  y: 178 },
   { id: 'mediaSx',     nome: 'Media distanza sx',     valore: 2, x: 120, y: 150 },
   { id: 'mediaCentro', nome: 'Media distanza centro', valore: 2, x: CX,  y: 272 },
   { id: 'mediaDx',     nome: 'Media distanza dx',     valore: 2, x: 455, y: 150 },
   { id: 'angoloSx',    nome: 'Angolo da 3 sx',        valore: 3, x: 20,  y: 48 },
   { id: 'alaSx',       nome: 'Ala da 3 sx',           valore: 3, x: 58,  y: 262 },
   { id: 'frontale',    nome: 'Frontale da 3',         valore: 3, x: CX,  y: 405 },
   { id: 'alaDx',       nome: 'Ala da 3 dx',           valore: 3, x: 513, y: 262 },
   { id: 'angoloDx',    nome: 'Angolo da 3 dx',        valore: 3, x: 551, y: 48 }
];


// Angolo del tiro rispetto al canestro, in gradi: 0 = dritto davanti, negativo a sinistra, ±180 = dietro
function Angolo (x: number,
                 y: number): number
{
   return Math.atan2(x - CX, y - CY) * 180 / Math.PI;
}


export function ZonaDelTiro (x: number,
                             y: number,
                             daTre: boolean): TIdZona
{
   const a = Angolo(x, y);
   const lato = (sx: TIdZona, centro: TIdZona, dx: TIdZona) =>
      (Math.abs(a) <= SETTORE_CENTRALE) ? centro : ((a < 0) ? sx : dx);
   if (daTre)
   {
      if (y < ANGOLO_Y)
         return (x < CX) ? 'angoloSx' : 'angoloDx';
      return lato('alaSx', 'frontale', 'alaDx');
   }
   if (Math.hypot(x - CX, y - CY) <= SOTTO_R)
      return 'sotto';
   if ((x >= AREA.x0) && (x <= AREA.x1) && (y <= AREA.y1))
      return 'area';
   return lato('mediaSx', 'mediaCentro', 'mediaDx');
}


export function CalcolaZone (giocatori: TMatchPlayer[]): TMappaZone
{
   const { zone } = ZoneVuote();
   const perId = new Map(zone.map(z => [z.id, z]));
   let conPosizione = 0;
   let senzaPosizione = 0;
   for (const r of giocatori.flatMap(p => p.realizzazioni()))
   {
      if ((r.rTipo !== TTipoRealizzazione.trT2) && (r.rTipo !== TTipoRealizzazione.trT3))
         continue;
      if ((r.rPosX === 0) && (r.rPosY === 0))
      {
         senzaPosizione++;
         continue;
      }
      conPosizione++;
      const z = perId.get(ZonaDelTiro(r.rPosX, r.rPosY, r.rTipo === TTipoRealizzazione.trT3))!;
      z.tentati++;
      if (r.rPunti > 0)
         z.segnati++;
   }
   return { zone, conPosizione, senzaPosizione };
}


export function ZoneVuote (): TMappaZone
{
   return {
      zone: ZONE.map(z => ({ id: z.id, nome: z.nome, valore: z.valore, segnati: 0, tentati: 0, etichetta: { x: z.x, y: z.y } })),
      conPosizione: 0,
      senzaPosizione: 0
   };
}


// Somma b dentro a (pagina del campionato: zone di tutte le partite)
export function SommaZone (a: TMappaZone,
                           b: TMappaZone): void
{
   const perId = new Map(a.zone.map(z => [z.id, z]));
   for (const z of b.zone)
   {
      const t = perId.get(z.id)!;
      t.segnati += z.segnati;
      t.tentati += z.tentati;
   }
   a.conPosizione += b.conPosizione;
   a.senzaPosizione += b.senzaPosizione;
}


export function PuntiPerTiro (z: TZonaTiro): number | null
{
   return (z.tentati > 0) ? z.valore * z.segnati / z.tentati : null;
}


export function PercZona (z: TZonaTiro): string
{
   return (z.tentati > 0) ? `${Math.round(100 * z.segnati / z.tentati)}%` : '';
}


// Quota dei tiri (con posizione) presi da quella zona
export function QuotaZona (z: TZonaTiro,
                           m: TMappaZone): string
{
   return (m.conPosizione > 0) ? `${Math.round(100 * z.tentati / m.conPosizione)}%` : '';
}


export function PpsStr (z: TZonaTiro): string
{
   const v = PuntiPerTiro(z);
   return (v === null) ? '' : v.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}


// Colore della zona: verde acqua sopra PPS_NEUTRO, arancio sotto; intensità secondo lo scarto (pieno a ±0,5 punti
// per tiro). null: nessun tiro o troppo pochi (zona grigia)
export function ColoreZona (z: TZonaTiro): { colore: string, k: number } | null
{
   const v = PuntiPerTiro(z);
   if ((v === null) || (z.tentati < MIN_TIRI_ZONA))
      return null;
   const d = v - PPS_NEUTRO;
   if (Math.abs(d) < 0.05)
      return { colore: '#94a3b8', k: 0.5 };
   return { colore: (d > 0) ? COLORE_ZONA_SOPRA : COLORE_ZONA_SOTTO, k: Math.min(1, Math.abs(d) / 0.5) };
}


// ---------------------------------------------------------------- forme delle zone (SVG)

// Forme da disegnare in quest'ordine (le successive coprono le precedenti): spicchi da 3 su tutto il campo,
// rettangoli degli angoli, spicchi della media distanza ritagliati dentro l'arco, area colorata, sotto canestro.
export interface TFormaZona
{
   id: TIdZona;
   d: string;                  // percorso SVG
   dentroArco: boolean;        // da ritagliare con il percorso dell'arco (ARCO_PATH)
}


export const ARCO_PATH = `M ${LINEA_SX} 0 L ${LINEA_SX} ${ARCO_CY} A ${ARCO_R} ${ARCO_R} 0 0 0 ${LINEA_DX} ${ARCO_CY} L ${LINEA_DX} 0 Z`;


function Spicchio (da: number,
                   a: number): string
{
   const punti: string[] = [`${CX} ${CY}`];
   const passi = 8;
   for (let i = 0; i <= passi; i++)
   {
      const g = (da + (a - da) * i / passi) * Math.PI / 180;
      punti.push(`${(CX + 2000 * Math.sin(g)).toFixed(1)} ${(CY + 2000 * Math.cos(g)).toFixed(1)}`);
   }
   return `M ${punti.join(' L ')} Z`;
}


export const FORME_ZONE: TFormaZona[] = [
   { id: 'alaSx',       d: Spicchio(-180, -SETTORE_CENTRALE), dentroArco: false },
   { id: 'frontale',    d: Spicchio(-SETTORE_CENTRALE, SETTORE_CENTRALE), dentroArco: false },
   { id: 'alaDx',       d: Spicchio(SETTORE_CENTRALE, 180), dentroArco: false },
   { id: 'angoloSx',    d: `M 0 0 L ${CX} 0 L ${CX} ${ANGOLO_Y} L 0 ${ANGOLO_Y} Z`, dentroArco: false },
   { id: 'angoloDx',    d: `M ${CX} 0 L ${CAMPO_W} 0 L ${CAMPO_W} ${ANGOLO_Y} L ${CX} ${ANGOLO_Y} Z`, dentroArco: false },
   { id: 'mediaSx',     d: Spicchio(-180, -SETTORE_CENTRALE), dentroArco: true },
   { id: 'mediaCentro', d: Spicchio(-SETTORE_CENTRALE, SETTORE_CENTRALE), dentroArco: true },
   { id: 'mediaDx',     d: Spicchio(SETTORE_CENTRALE, 180), dentroArco: true },
   { id: 'area',        d: `M ${AREA.x0} 0 L ${AREA.x1} 0 L ${AREA.x1} ${AREA.y1} L ${AREA.x0} ${AREA.y1} Z`, dentroArco: false },
   { id: 'sotto',       d: `M ${CX - SOTTO_R} ${CY} A ${SOTTO_R} ${SOTTO_R} 0 1 0 ${CX + SOTTO_R} ${CY} A ${SOTTO_R} ${SOTTO_R} 0 1 0 ${CX - SOTTO_R} ${CY} Z`, dentroArco: false }
];


// Colore schiarito verso il bianco: alfa 1 = colore pieno, 0 = bianco
function SuBianco (hex: string,
                   alfa: number): string
{
   return '#' + [1, 3, 5].map(i => Math.round(255 + (parseInt(hex.substring(i, i + 2), 16) - 255) * alfa)
      .toString(16).padStart(2, '0')).join('');
}


// Riempimento pieno della zona (già schiarito: le forme si sovrappongono e non devono mescolarsi); il campo
// va disegnato sopra in modalità "moltiplica", così restano visibili solo le sue linee. Grigio se pochi tiri.
export function RiempimentoZona (z: TZonaTiro): string
{
   const c = ColoreZona(z);
   return c ? SuBianco(c.colore, 0.3 + 0.55 * c.k) : SuBianco('#94a3b8', (z.tentati > 0) ? 0.3 : 0.1);
}


// SVG delle zone per il PDF (disegnato su un canvas): forme o etichette, in due strati separati perché fra
// i due va il campo in modalità "moltiplica"
const Svg = (contenuto: string) =>
   `<svg xmlns="http://www.w3.org/2000/svg" width="${CAMPO_W}" height="${CAMPO_H}" viewBox="0 0 ${CAMPO_W} ${CAMPO_H}">${contenuto}</svg>`;


export function SvgForme (m: TMappaZone): string
{
   const perId = new Map(m.zone.map(z => [z.id, z]));
   const forme = FORME_ZONE.map(f =>
      `<path d="${f.d}" fill="${RiempimentoZona(perId.get(f.id)!)}" stroke="#000000" stroke-opacity="0.35" stroke-width="1.5"${f.dentroArco ? ' clip-path="url(#arco)"' : ''}/>`
   ).join('');
   return Svg(`<defs><clipPath id="arco"><path d="${ARCO_PATH}"/></clipPath></defs>${forme}`);
}


export function SvgEtichette (m: TMappaZone): string
{
   const etichette = m.zone.filter(z => z.tentati > 0).map(z =>
      `<text x="${z.etichetta.x}" y="${z.etichetta.y}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="15" font-weight="bold" fill="#111111" stroke="#ffffff" stroke-width="3" paint-order="stroke">${z.segnati}/${z.tentati}</text>` +
      `<text x="${z.etichetta.x}" y="${z.etichetta.y + 16}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#111111" stroke="#ffffff" stroke-width="3" paint-order="stroke">${PercZona(z)}</text>`
   ).join('');
   return Svg(etichette);
}


// Immagine (canvas) del campo con le zone sopra, alla scala indicata: per addImage di jsPDF
export async function CanvasZone (m: TMappaZone,
                                  campo: HTMLImageElement,
                                  scala: number = 2): Promise<HTMLCanvasElement>
{
   const canvas = document.createElement('canvas');
   canvas.width = CAMPO_W * scala;
   canvas.height = CAMPO_H * scala;
   const ctx = canvas.getContext('2d')!;
   const carica = (svg: string) => new Promise<HTMLImageElement>((resolve, reject) =>
   {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
   });
   const [forme, etichette] = await Promise.all([carica(SvgForme(m)), carica(SvgEtichette(m))]);
   // zone, poi il campo "moltiplicato" (il bianco lascia vedere le zone, le linee restano nere), poi le etichette
   ctx.drawImage(forme, 0, 0, canvas.width, canvas.height);
   ctx.globalCompositeOperation = 'multiply';
   ctx.drawImage(campo, 0, 0, canvas.width, canvas.height);
   ctx.globalCompositeOperation = 'source-over';
   ctx.drawImage(etichette, 0, 0, canvas.width, canvas.height);
   return canvas;
}


// Tabella delle zone nel PDF (jsPDF + jspdf-autotable). Restituisce la y finale.
export function TabellaZonePdf (pdf: any,
                                autoTable: any,
                                m: TMappaZone,
                                startY: number,
                                left: number,
                                larghezza: number,
                                font: string): number
{
   autoTable(pdf, {
      startY,
      head: [['Zona', 'Segnati/Tentati', '%', 'Punti per tiro', 'Quota tiri']],
      body: m.zone.map(z => [z.nome, (z.tentati > 0) ? `${z.segnati}/${z.tentati}` : '', PercZona(z), PpsStr(z), (z.tentati > 0) ? QuotaZona(z, m) : '']),
      styles:       { font, halign: 'center' },
      headStyles:   { fillColor: [255, 190, 0], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9, cellPadding: 0.8 },
      bodyStyles:   { fontSize: 9, cellPadding: 0.8, fillColor: [255, 255, 255], textColor: [0, 0, 0] },
      alternateRowStyles: { fillColor: [221, 221, 221] },
      columnStyles: { 0: { halign: 'left' } },
      tableWidth:   larghezza,
      margin:       { left },
      theme:        'grid'
   });
   return (pdf as any).lastAutoTable.finalY;
}


export function CaricaImmagineCampo (): Promise<HTMLImageElement>
{
   return new Promise((resolve, reject) =>
   {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = 'assets/campo-tiri.png';
   });
}


// Mappa a zone nel PDF (A4 orizzontale): campo alto "altezza" mm a sinistra (da x), tabella e note a destra
export async function PaginaZonePdf (pdf: any,
                                     autoTable: any,
                                     m: TMappaZone,
                                     campo: HTMLImageElement,
                                     x: number,
                                     y: number,
                                     altezza: number,
                                     font: string,
                                     pageWidth: number = 297,
                                     margine: number = 5): Promise<void>
{
   const larghezza = altezza * CAMPO_W / CAMPO_H;
   pdf.addImage(await CanvasZone(m, campo), 'PNG', x, y, larghezza, altezza);
   pdf.setDrawColor('#424b57');
   pdf.setLineWidth(0.2);
   pdf.rect(x, y, larghezza, altezza);
   const xTab = x + larghezza + 8;
   const yTab = TabellaZonePdf(pdf, autoTable, m, y, xTab, pageWidth - xTab - margine, font);
   pdf.setFontSize(8);
   pdf.setFont(font, 'normal');
   const note = [
      `Colore: verde acqua sopra ${PPS_NEUTRO.toLocaleString('it-IT', { minimumFractionDigits: 1 })} punti per tiro, arancio sotto; grigio con meno di ${MIN_TIRI_ZONA} tiri.`,
      'Punti per tiro = percentuale x 2 o x 3. Da 2 o da 3 secondo il tiro registrato; la posizione decide la zona.',
      ...((m.senzaPosizione > 0) ? [`${m.senzaPosizione} tiri senza posizione esclusi dalle zone.`] : [])
   ];
   let yNota = yTab + 5;
   for (const n of note)
      for (const riga of pdf.splitTextToSize(n, pageWidth - xTab - margine) as string[])
      {
         pdf.text(riga, xTab, yNota);
         yNota += 3.5;
      }
}
