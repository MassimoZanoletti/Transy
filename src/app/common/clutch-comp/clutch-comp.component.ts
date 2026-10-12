import {Component, Input} from '@angular/core';
import {TooltipModule} from 'primeng/tooltip';
import {TTiriStat} from "../statistiche";
import {DescrizioneClutch, MinStr, PercStr, PuntiOgni10, TBoxClutch, TClutch, TdC, TiriStr} from "../clutch";
import {QuintettiCompComponent} from "../quintetti-comp/quintetti-comp.component";


// Finale punto a punto (tab "Statistiche" della partita e pagina "Statistiche campionato"): squadre in clutch
// e nel resto della partita, giocatori della squadra in clutch, quintetti in clutch.
@Component({
   selector:    'app-clutch-comp',
   standalone:  true,
   imports:     [TooltipModule, QuintettiCompComponent],
   templateUrl: './clutch-comp.component.html',
   styleUrl:    './clutch-comp.component.css'
})
export class ClutchCompComponent
{
   @Input() clutch: TClutch | null = null;
   @Input() nomeNoi: string = '';
   @Input() nomeLoro: string = '';
   // pagina del campionato: partite punto a punto, record e colonna partite dei quintetti
   @Input() campionato: boolean = false;

   public readonly Min = MinStr;
   public readonly Ogni10 = PuntiOgni10;
   public readonly TdC = TdC;
   public readonly tooltipClutch = `<span style='color: #ffff00'><b>Clutch</b></span><br><span style='font-size: 0.8rem;'>` +
      `Definizione standard: ${DescrizioneClutch()}, nel momento dell'azione. Con pochi minuti e pochi tiri le percentuali ` +
      `dicono poco: il dato diventa utile sommato sul campionato.</span>`;


   Tiri (t: TTiriStat): string
   {
      return (t.tentati > 0) ? `${TiriStr(t)} (${PercStr(t)})` : '';
   }


   Righe (c: TClutch): { titolo: string, secondi: number, squadre: { nome: string, noi: boolean, b: TBoxClutch }[] }[]
   {
      return [
         { titolo: 'In clutch', secondi: c.secondi,
           squadre: [{ nome: this.nomeNoi, noi: true, b: c.noi }, { nome: this.nomeLoro, noi: false, b: c.loro }] },
         { titolo: 'Resto della partita', secondi: c.secondiResto,
           squadre: [{ nome: this.nomeNoi, noi: true, b: c.restoNoi }, { nome: this.nomeLoro, noi: false, b: c.restoLoro }] }
      ];
   }


   Pm (v: number): string
   {
      return (v > 0) ? `+${v}` : String(v);
   }
}
