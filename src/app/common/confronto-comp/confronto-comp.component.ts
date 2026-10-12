import {Component, Input} from '@angular/core';
import {TooltipModule} from 'primeng/tooltip';
import {DiffConfronto, EsitoDiff, NumC, TConfronto, TRigaConfronto} from "../confronto";


// Confronto fra due gruppi di partite (pagina "Statistiche campionato", per ora vinte/perse): statistiche di
// squadra una accanto all'altra con la differenza (evidenziata solo se netta) e medie dei giocatori.
@Component({
   selector:    'app-confronto-comp',
   standalone:  true,
   imports:     [TooltipModule],
   templateUrl: './confronto-comp.component.html',
   styleUrl:    './confronto-comp.component.css'
})
export class ConfrontoCompComponent
{
   @Input() confronto: TConfronto | null = null;

   public readonly Num = NumC;
   public readonly Esito = EsitoDiff;
   public readonly tooltipConfronto = `<span style='color: #ffff00'><b>Come leggere il confronto</b></span><br><span style='font-size: 0.8rem;'>` +
      `Le stesse statistiche nelle partite vinte e in quelle perse: dicono cosa fate di diverso quando vincete. ` +
      `La differenza è in verde (a favore) o in rosso (contro) solo quando è netta: con poche partite le piccole ` +
      `differenze possono essere solo il caso. Per le percentuali al tiro, tra parentesi i tentativi a partita.</span>`;


   Diff (r: TRigaConfronto): string
   {
      return NumC(DiffConfronto(r), r.decimali, '', true);
   }
}
