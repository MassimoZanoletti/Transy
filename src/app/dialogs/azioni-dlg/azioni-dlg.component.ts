
import {Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';
import {MultiSelectModule} from 'primeng/multiselect';
import {InputTextModule} from 'primeng/inputtext';
import {TOperation, TOperationType} from "../../common/operation";
import {utils, globs} from "../../common/utils";
import {matchGlobs} from "../../common/curr-match";
import {TMatchPlayer} from "../../models/datamod";


@Component({
   selector:    'app-azioni-dlg',
   standalone:  true,
   imports: [
      CommonModule,
      FormsModule,
      TableModule,
      ButtonModule,
      DropdownModule,
      MultiSelectModule,
      InputTextModule,
   ],
   templateUrl: './azioni-dlg.component.html',
   styleUrl:    './azioni-dlg.component.css'
})
export class AzioniDlgComponent
{
   public TOperationType = TOperationType;

   // Filtri per colonna (tutte tranne Dt): servono a trovare in fretta, a partita in corso, l'azione da
   // correggere. Restano impostati fra un'apertura e l'altra del dialog.
   public filtroQuarto: number | null = null;
   public filtroTempo: string = '';
   public filtroOper: TOperationType[] = [];
   public filtroSquadra: string | null = null;
   public filtroGiocatore: TMatchPlayer | null = null;

   @Output() modificaAzione = new EventEmitter<TOperation>();
   @Output() eliminaAzione = new EventEmitter<TOperation>();
   @Output() eliminaTutte = new EventEmitter<void>();
   @Output() chiudi = new EventEmitter<void>();


   GetOperList (): TOperation[]
   {
      return matchGlobs.currMatch?.matchOperList()?.items() ?? [];
   }


   GetOperListFiltrata (): TOperation[]
   {
      const tempo = this.filtroTempo.trim();
      return this.GetOperList().filter(op =>
         ((this.filtroQuarto === null) || (op.quarter() === this.filtroQuarto)) &&
         ((tempo === '') || this.GetOperTimeStr(op).includes(tempo)) &&
         ((this.filtroOper.length === 0) || this.filtroOper.includes(op.oper())) &&
         ((this.filtroSquadra === null) || (op.MyTeamStr().trim() === this.filtroSquadra)) &&
         ((this.filtroGiocatore === null) || (op.player1() === this.filtroGiocatore)));
   }


   // Opzioni dei filtri: solo i valori presenti nel log (in ordine di apparizione)
   GetOpzioniQuarto (): { value: number, label: string }[]
   {
      const visti = new Map<number, string>();
      this.GetOperList().forEach(op => { if (!visti.has(op.quarter())) visti.set(op.quarter(), this.GetOperQuarterStr(op)); });
      return [...visti.entries()].sort((a, b) => a[0] - b[0]).map(([value, label]) => ({ value, label }));
   }


   GetOpzioniOper (): { value: TOperationType, label: string }[]
   {
      const visti = new Set<TOperationType>();
      this.GetOperList().forEach(op => visti.add(op.oper()));
      return [...visti].sort((a, b) => a - b).map(value => ({ value, label: TOperationType.Desc(value).trim() }));
   }


   GetOpzioniSquadra (): { value: string, label: string }[]
   {
      const visti = new Set<string>();
      this.GetOperList().forEach(op => visti.add(op.MyTeamStr().trim()));
      return [...visti].map(value => ({ value, label: value }));
   }


   // Giocatori presenti nel log; se è scelta una squadra, solo i suoi
   GetOpzioniGiocatore (): { value: TMatchPlayer, label: string }[]
   {
      const visti = new Map<TMatchPlayer, string>();
      this.GetOperList().forEach(op =>
      {
         const p = op.player1();
         if (p && (!visti.has(p)) && ((this.filtroSquadra === null) || (op.MyTeamStr().trim() === this.filtroSquadra)))
            visti.set(p, `${p.playNumber()} ${p.playName()}${p.isMyTeam() ? '' : ' (avv.)'}`);
      });
      return [...visti.entries()]
         .sort((a, b) => (Number(b[0].isMyTeam()) - Number(a[0].isMyTeam())) || ((parseInt(a[0].playNumber(), 10) || 0) - (parseInt(b[0].playNumber(), 10) || 0)))
         .map(([value, label]) => ({ value, label }));
   }


   // Cambiando squadra, un giocatore dell'altra squadra non ha più senso come filtro
   onFiltroSquadraChange (): void
   {
      if (this.filtroGiocatore && (!this.GetOpzioniGiocatore().some(o => o.value === this.filtroGiocatore)))
         this.filtroGiocatore = null;
   }


   FiltriAttivi (): boolean
   {
      return (this.filtroQuarto !== null) || (this.filtroTempo.trim() !== '') || (this.filtroOper.length > 0) ||
             (this.filtroSquadra !== null) || (this.filtroGiocatore !== null);
   }


   BtnAzzeraFiltri (): void
   {
      this.filtroQuarto = null;
      this.filtroTempo = '';
      this.filtroOper = [];
      this.filtroSquadra = null;
      this.filtroGiocatore = null;
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
