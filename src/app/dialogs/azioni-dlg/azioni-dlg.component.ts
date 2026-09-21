
import {Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {TOperation, TOperationType} from "../../common/operation";
import {utils, globs} from "../../common/utils";
import {matchGlobs} from "../../common/curr-match";


@Component({
   selector:    'app-azioni-dlg',
   standalone:  true,
   imports: [
      CommonModule,
      TableModule,
      ButtonModule,
   ],
   templateUrl: './azioni-dlg.component.html',
   styleUrl:    './azioni-dlg.component.css'
})
export class AzioniDlgComponent
{
   public TOperationType = TOperationType;

   @Output() modificaAzione = new EventEmitter<TOperation>();
   @Output() eliminaAzione = new EventEmitter<TOperation>();
   @Output() eliminaTutte = new EventEmitter<void>();
   @Output() chiudi = new EventEmitter<void>();


   GetOperList (): TOperation[]
   {
      return matchGlobs.currMatch?.matchOperList()?.items() ?? [];
   }


   GetOperTimeStr (op: TOperation): string
   {
      return utils.GetTimeStr(op.time());
   }


   GetOperQuarterStr (op: TOperation): string
   {
      const q = op.quarter();
      const prefix = q <= globs.MaxRegQuarters ? 'Q' : 'E';
      return `${prefix}${q}`;
   }


   GetOperPlayerStr (op: TOperation): string
   {
      return op.Player1Str();
   }


   GetOperDescStr (op: TOperation): string
   {
      const p2 = op.Player2Str();
      const d = op.desc();
      if (p2 && d)
         return `${p2} ${d}`;
      return p2 || d;
   }


   GetOperBgClass (op: TOperation): string
   {
      switch (op.oper())
      {
         case TOperationType.totTLYes:
         case TOperationType.totT2Yes:
         case TOperationType.totT3Yes:
            return 'oper-bg-made';
         case TOperationType.totTLNo:
         case TOperationType.totT2No:
         case TOperationType.totT3No:
            return 'oper-bg-missed';
         case TOperationType.totSostituz:
            return 'oper-bg-sostituz';
         case TOperationType.totQuintetto:
            return 'oper-bg-quintetto';
         default:
            return '';
      }
   }


   GetOperTmCrClass (op: TOperation): string
   {
      switch (op.MyTeamStr().trim())
      {
         case 'MyTeam':   return 'oper-tmcr-my';
         case 'OppoTeam': return 'oper-tmcr-oppo';
         default:         return 'oper-tmcr-default';
      }
   }


   BtnModificaAzione (op: TOperation): void
   {
      this.modificaAzione.emit(op);
   }


   BtnEliminaAzione (op: TOperation): void
   {
      if (!confirm(`Eliminare l'azione "${op.toString()}" ?`))
         return;
      this.eliminaAzione.emit(op);
   }


   BtnEliminaTutteAzioni (): void
   {
      this.eliminaTutte.emit();
   }


   BtnChiudi (): void
   {
      this.chiudi.emit();
   }
}
