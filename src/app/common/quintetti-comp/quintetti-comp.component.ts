import {Component, Input} from '@angular/core';
import {ButtonModule} from 'primeng/button';
import {TooltipModule} from 'primeng/tooltip';
import {COLORE_LORO, COLORE_NOI} from "../grafico-differenza";
import {
   GiocatoriOrdinati,
   MIN_POSSESSI_RATING,
   MinutiQuintetto,
   NetQuintetto,
   NumQ,
   PlusMinusQuintetto,
   PossessiQuintetto,
   RatingQuintetto,
   TQuintettoStat
} from "../quintetti";


// Tabella dei quintetti (tab "Statistiche" della partita e pagina "Statistiche campionato"): giocatori,
// minuti insieme, punti fatti/subiti, +/- con barra divergente (rossa a nostro favore, azzurra contro) e valori
// per 100 possessi. In ordine di minuti; di default solo i primi, gli altri con "Mostra tutti".
@Component({
   selector:    'app-quintetti-comp',
   standalone:  true,
   imports:     [ButtonModule, TooltipModule],
   templateUrl: './quintetti-comp.component.html',
   styleUrl:    './quintetti-comp.component.css'
})
export class QuintettiCompComponent
{
   @Input() set quintetti (q: TQuintettoStat[])
   {
      this._quintetti = q ?? [];
      this.maxPm = Math.max(1, ...this._quintetti.map(x => Math.abs(PlusMinusQuintetto(x))));
   }
   get quintetti (): TQuintettoStat[] { return this._quintetti; }
   private _quintetti: TQuintettoStat[] = [];
   // pagina del campionato: colonna con il numero di partite
   @Input() conPartite: boolean = false;

   public readonly PRIMI = 10;
   public tutti: boolean = false;
   public maxPm: number = 1;
   public readonly coloreVantaggio = COLORE_NOI;
   public readonly coloreSvantaggio = COLORE_LORO;
   public readonly Giocatori = GiocatoriOrdinati;
   public readonly Minuti = MinutiQuintetto;
   public readonly Num = NumQ;
   public readonly Pm = PlusMinusQuintetto;
   public readonly Net = NetQuintetto;
   public readonly Rating = RatingQuintetto;
   public readonly tooltipPoss = this.Tooltip('Possessi stimati', 'Tiri dal campo tentati - rimbalzi offensivi + palle perse + 0,44 x liberi tentati, mentre il quintetto era in campo; media delle due squadre.');
   public readonly tooltipRating = this.Tooltip('Per 100 possessi', `Punti fatti e subiti ogni 100 possessi e la loro differenza (Net). Mostrati solo con almeno ${MIN_POSSESSI_RATING} possessi: con meno sono poco significativi.`);


   Visibili (): TQuintettoStat[]
   {
      return this.tutti ? this._quintetti : this._quintetti.slice(0, this.PRIMI);
   }


   Possessi (q: TQuintettoStat): string
   {
      return NumQ(Math.round(PossessiQuintetto(q)));
   }


   // barra del +/-: metà sinistra per i negativi, metà destra per i positivi (in % della metà)
   LarghezzaPm (q: TQuintettoStat): number
   {
      return 100 * Math.abs(PlusMinusQuintetto(q)) / this.maxPm;
   }


   private Tooltip (titolo: string,
                    descrizione: string): string
   {
      return `<span class='tt-titolo'><b>${titolo}</b></span><br><span class='tt-testo'>${descrizione}</span>`;
   }
}
