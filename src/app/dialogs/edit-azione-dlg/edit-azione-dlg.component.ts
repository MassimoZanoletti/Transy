import {Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ButtonModule} from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';
import {InputMaskModule} from 'primeng/inputmask';
import {SelectButtonModule} from 'primeng/selectbutton';
import {TMatchPlayer, TMatchTeam} from "../../models/datamod";
import {TOperation, TOperationType} from "../../common/operation";
import {globs} from "../../common/utils";


// Modifica richiesta per un'azione (vedi MatchComponent.ApplicaModificaAzione)
export interface TModificaAzione
{
   quarter: number;              // 1..4 regolari, 5..8 supplementari
   time: number;                 // secondi rimanenti
   oper: TOperationType;
   myTeam: boolean;
   player: TMatchPlayer | null;  // null = azione attribuita alla squadra (vedi TOperation.AZIONI_DI_SQUADRA)
}


// valore della voce "Squadra" nell'elenco dei giocatori: rimbalzi e palle perse/recuperate di squadra
const SQUADRA = 'squadra';


// Azioni "statistiche" legate a un giocatore (o alla squadra, per rimbalzi e palle perse/recuperate): le sole
// modificabili (come nel Delphi, dove sostituzioni, quintetti e cronometro si possono solo eliminare)
export const AZIONI_MODIFICABILI: { value: TOperationType, label: string }[] = [
   { value: TOperationType.totTLYes,       label: 'TL segnato' },
   { value: TOperationType.totTLNo,        label: 'TL sbagliato' },
   { value: TOperationType.totT2Yes,       label: 'T2 segnato' },
   { value: TOperationType.totT2No,        label: 'T2 sbagliato' },
   { value: TOperationType.totT3Yes,       label: 'T3 segnato' },
   { value: TOperationType.totT3No,        label: 'T3 sbagliato' },
   { value: TOperationType.totFalloFatto,  label: 'Fallo fatto' },
   { value: TOperationType.totFalloSubito, label: 'Fallo subito' },
   { value: TOperationType.totRimbDifesa,  label: 'Rimbalzo difesa' },
   { value: TOperationType.totRimbAttacco, label: 'Rimbalzo attacco' },
   { value: TOperationType.totPPersa,      label: 'Palla persa' },
   { value: TOperationType.totPRecuperata, label: 'Palla recuperata' },
   { value: TOperationType.totStopSubita,  label: 'Stoppata subita' },
   { value: TOperationType.totStopFatta,   label: 'Stoppata fatta' },
   { value: TOperationType.totAssist,      label: 'Assist' }
];


@Component({
   selector:    'app-edit-azione-dlg',
   standalone:  true,
   imports: [
      CommonModule,
      FormsModule,
      ButtonModule,
      DropdownModule,
      InputMaskModule,
      SelectButtonModule
   ],
   templateUrl: './edit-azione-dlg.component.html',
   styleUrl:    './edit-azione-dlg.component.css'
})
export class EditAzioneDlgComponent
{
   public readonly azioni = AZIONI_MODIFICABILI;
   public readonly FALLO_FATTO = TOperationType.totFalloFatto;
   public quarti: { value: number, label: string }[] = [];
   public squadre: { value: boolean, label: string }[] = [];
   public giocatori: { value: TMatchPlayer | typeof SQUADRA, label: string }[] = [];

   public quarter: number = 1;
   public tempo: string = '10:00';
   public oper: TOperationType = TOperationType.totT2Yes;
   public myTeam: boolean = true;
   public player: TMatchPlayer | typeof SQUADRA | null = null;
   public errore: string = '';
   public descOriginale: string = '';

   private myTeamData: TMatchTeam | null = null;
   private oppTeamData: TMatchTeam | null = null;

   @Output() salva = new EventEmitter<TModificaAzione>();
   @Output() annulla = new EventEmitter<void>();


   onComponentShow (op: TOperation,
                    myTeam: TMatchTeam | null,
                    oppTeam: TMatchTeam | null,
                    myTeamName: string,
                    oppTeamName: string): void
   {
      this.myTeamData = myTeam;
      this.oppTeamData = oppTeam;
      this.quarti = [];
      for (let n = 1; n <= globs.MaxRegQuarters + globs.MaxExtraQuarters; n++)
         this.quarti.push({ value: n, label: (n <= globs.MaxRegQuarters) ? `${n}° quarto` : `${n - globs.MaxRegQuarters}° supplementare` });
      this.squadre = [
         { value: true,  label: myTeamName || 'Casa' },
         { value: false, label: oppTeamName || 'Ospiti' }
      ];
      this.quarter = op.quarter() || 1;
      this.tempo = EditAzioneDlgComponent.TempoToStr(op.time());
      this.oper = op.oper();
      this.myTeam = op.myTeam();
      this.errore = '';
      this.descOriginale = op.toString();
      this.player = op.IsAzioneDiSquadra() ? SQUADRA : null;
      this.AggiornaGiocatori();
      if (!op.IsAzioneDiSquadra())
         this.player = this.giocatori.find(g => g.value === op.player1())?.value ?? null;
   }


   // Cambiando squadra cambia l'elenco dei giocatori; il giocatore scelto resta solo se è della squadra.
   // Per rimbalzi e palle perse/recuperate in cima c'è anche la voce "Squadra" (azione senza giocatore).
   AggiornaGiocatori (): void
   {
      const team = this.myTeam ? this.myTeamData : this.oppTeamData;
      const diSquadra = TOperation.AZIONI_DI_SQUADRA.has(this.oper);
      this.giocatori = [
         ...(diSquadra ? [{ value: SQUADRA as typeof SQUADRA, label: 'Squadra' }] : []),
         ...[...(team?.Roster ?? [])]
            .sort((a, b) => (parseInt(a.playNumber(), 10) || 0) - (parseInt(b.playNumber(), 10) || 0))
            .map(p => ({ value: p, label: `(${p.playNumber()}) ${p.playName()}` }))
      ];
      if (this.player && (!this.giocatori.some(g => g.value === this.player)))
         this.player = null;
   }


   BtnSalva (): void
   {
      this.errore = '';
      const secondi = EditAzioneDlgComponent.StrToTempo(this.tempo);
      const max = (this.quarter <= globs.MaxRegQuarters) ? globs.DurationRegulTime : globs.DurationExtraTime;
      if ((secondi === null) || (secondi < 0) || (secondi > max))
      {
         this.errore = `Tempo non valido: deve essere fra 00:00 e ${EditAzioneDlgComponent.TempoToStr(max)}`;
         return;
      }
      if (!this.player)
      {
         this.errore = 'Scegli il giocatore';
         return;
      }
      this.salva.emit({ quarter: this.quarter, time: secondi, oper: this.oper, myTeam: this.myTeam,
                        player: (this.player === SQUADRA) ? null : this.player });
   }


   BtnAnnulla (): void
   {
      this.annulla.emit();
   }


   static TempoToStr (secondi: number): string
   {
      const s = Math.max(0, Math.floor(secondi));
      return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
   }


   static StrToTempo (testo: string): number | null
   {
      const m = /^(\d{1,2}):(\d{2})$/.exec((testo ?? '').trim());
      if ((!m) || (Number(m[2]) > 59))
         return null;
      return Number(m[1]) * 60 + Number(m[2]);
   }
}
