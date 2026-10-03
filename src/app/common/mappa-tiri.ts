import {TTiroPrecedente} from "./campo-tiri/campo-tiri.component";
import {TMatchPlayer, TTipoRealizzazione} from "../models/datamod";


// Mappa di tiro (Delphi: ShowShoots) di un giocatore o di una squadra: tiri da 2 e da 3 con posizione
// da disegnare sul campo, riepilogo segnati/tentati per tipo e numero di tiri senza posizione.
// Usata dalla finestra della mappa di tiro (doppio click sui punti) e dal tab "Mappa tiro".
export interface TMappaTiri
{
   tiri: TTiroPrecedente[];
   riepilogo: { label: string, segnati: number, tentati: number }[];
   senzaPosizione: number;
}


export function CalcolaMappaTiri (giocatori: TMatchPlayer[]): TMappaTiri
{
   const tiri = giocatori.flatMap(p => p.realizzazioni())
      .filter(r => (r.rTipo === TTipoRealizzazione.trT2) || (r.rTipo === TTipoRealizzazione.trT3));
   const conPosizione = tiri.filter(r => (r.rPosX !== 0) || (r.rPosY !== 0));
   return {
      tiri: conPosizione.map(r => ({ x: r.rPosX, y: r.rPosY, segnato: (r.rPunti > 0), quarto: r.rQuarto })),
      senzaPosizione: tiri.length - conPosizione.length,
      riepilogo: [
         { tipo: TTipoRealizzazione.trT2, label: 'T2' },
         { tipo: TTipoRealizzazione.trT3, label: 'T3' }
      ].map(t =>
      {
         const delTipo = tiri.filter(r => r.rTipo === t.tipo);
         return { label: t.label, segnati: delTipo.filter(r => r.rPunti > 0).length, tentati: delTipo.length };
      })
   };
}


export function PercentualeTiri (segnati: number,
                                 tentati: number): string
{
   return (tentati > 0) ? `${Math.round(100 * segnati / tentati)}%` : '-';
}
