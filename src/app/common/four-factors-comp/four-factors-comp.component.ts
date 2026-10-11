import {Component, Input} from '@angular/core';
import {TooltipModule} from 'primeng/tooltip';
import {COLORE_SVANTAGGIO, COLORE_VANTAGGIO} from "../grafico-differenza";
import {MiglioreFF, NetRtg, NumFF, TFattore, TFourFactors} from "../four-factors";


// Riquadro dei Four Factors (tab "Statistiche" della partita e pagina "Statistiche campionato"): per ogni
// fattore i valori delle due squadre affiancati da due barre, il migliore in verde; sotto possessi e punti
// ogni 100 possessi. Colori delle barre come il grafico dello scarto (blu noi, arancio avversari).
@Component({
   selector:    'app-four-factors-comp',
   standalone:  true,
   imports:     [TooltipModule],
   templateUrl: './four-factors-comp.component.html',
   styleUrl:    './four-factors-comp.component.css'
})
export class FourFactorsCompComponent
{
   @Input() ff: TFourFactors | null = null;
   @Input() nomeNoi: string = '';
   @Input() nomeLoro: string = '';

   public readonly coloreNoi = COLORE_VANTAGGIO;
   public readonly coloreLoro = COLORE_SVANTAGGIO;
   public readonly Num = NumFF;
   public readonly Migliore = MiglioreFF;
   public readonly tooltipPossessi = this.Tooltip('Possessi stimati', 'Tiri dal campo tentati - rimbalzi offensivi + palle perse + 0,44 x liberi tentati; media delle due squadre.');
   public readonly tooltipRating = this.Tooltip('Punti ogni 100 possessi', 'Offensive rating (punti fatti) e defensive rating (punti subiti): confrontano partite giocate a ritmi diversi.');
   public readonly tooltipNet = this.Tooltip('Net rating', 'Differenza fra punti fatti e subiti ogni 100 possessi.');


   // larghezza della barra in % della colonna: scala comune alle due squadre del fattore
   Larghezza (f: TFattore,
              v: number | null): number
   {
      const max = Math.max(f.noi ?? 0, f.loro ?? 0);
      return ((v === null) || (max <= 0)) ? 0 : 100 * v / max;
   }


   Net (): number | null
   {
      return this.ff ? NetRtg(this.ff) : null;
   }


   TooltipFattore (f: TFattore): string
   {
      return this.Tooltip(`${f.titolo} - peso ${f.peso}%`, f.descrizione);
   }


   private Tooltip (titolo: string,
                    descrizione: string): string
   {
      return `<span style='color: #ffff00'><b>${titolo}</b></span><br><span style='font-size: 0.8rem;'>${descrizione}</span>`;
   }
}
