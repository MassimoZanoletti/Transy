import {Component, Input} from '@angular/core';
import {TooltipModule} from 'primeng/tooltip';
import {NgTemplateOutlet} from '@angular/common';
import {
   DiffStr,
   FINESTRA_TIMEOUT,
   MediaStr,
   MIN_PARZIALE,
   QuandoStr,
   TParziale,
   TRiepilogoTimeout,
   TTimeoutEsito
} from "../parziali-timeout";


// Efficacia dei timeout e parziali (tab "Statistiche" della partita e pagina "Statistiche campionato"):
// riepilogo dei timeout delle due squadre, elenco dei timeout (solo nella partita) e dei parziali.
@Component({
   selector:    'app-parziali-timeout-comp',
   standalone:  true,
   imports:     [TooltipModule, NgTemplateOutlet],
   templateUrl: './parziali-timeout-comp.component.html',
   styleUrl:    './parziali-timeout-comp.component.css'
})
export class ParzialiTimeoutCompComponent
{
   @Input() parziali: { partita?: string, p: TParziale }[] = [];
   @Input() esiti: TTimeoutEsito[] | null = null;     // null: pagina del campionato (solo riepilogo)
   @Input() riepilogo: { noi: TRiepilogoTimeout, loro: TRiepilogoTimeout } | null = null;
   @Input() nomeNoi: string = '';
   @Input() nomeLoro: string = '';

   public readonly MIN_PARZIALE = MIN_PARZIALE;
   public readonly minutiFinestra = FINESTRA_TIMEOUT / 60;
   public readonly Quando = QuandoStr;
   public readonly Diff = DiffStr;
   public readonly Media = MediaStr;
   public readonly tooltipTimeout = this.Tooltip('Efficacia dei timeout',
      `Punti delle due squadre nei ${FINESTRA_TIMEOUT / 60} minuti di gioco prima e dopo il timeout, senza uscire dal quarto. "Prima" dice quale parziale ha interrotto, "Dopo" se ha cambiato l'inerzia. Punteggi sempre nell'ordine noi-loro, differenze sempre dal nostro punto di vista.`);
   public readonly tooltipParziali = this.Tooltip('Parziali',
      `Punti consecutivi di una squadra senza che l'altra segni, da almeno ${MIN_PARZIALE} punti. Possono continuare nel quarto successivo.`);


   ConPartita (): boolean
   {
      return this.parziali.some(x => x.partita !== undefined);
   }


   // differenza noi - loro nei minuti dopo il timeout
   Dopo (e: TTimeoutEsito): number
   {
      return e.dopo.my - e.dopo.opp;
   }


   // punteggio alla fine del parziale (noi, loro)
   PunteggioDopo (p: TParziale): [number, number]
   {
      return p.myTeam ? [p.myPrima + p.punti, p.oppPrima] : [p.myPrima, p.oppPrima + p.punti];
   }


   private Tooltip (titolo: string,
                    descrizione: string): string
   {
      return `<span class='tt-titolo'><b>${titolo}</b></span><br><span class='tt-testo'>${descrizione}</span>`;
   }
}
