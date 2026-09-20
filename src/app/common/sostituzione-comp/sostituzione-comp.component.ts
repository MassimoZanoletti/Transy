
import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ButtonModule} from 'primeng/button';
import {CheckboxModule} from 'primeng/checkbox';
import {InputMaskModule} from 'primeng/inputmask';
import {DividerModule} from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import {TFallo, TMatchPlayer} from '../../models/datamod';
import {globs, utils} from "../utils";
import {matchGlobs} from "../curr-match";


@Component({
   selector:    'app-sostituzione-comp',
   standalone:  true,
   imports: [
      CommonModule,
      FormsModule,
      ButtonModule,
      CheckboxModule,
      InputMaskModule,
      DividerModule,
      ToastModule,
   ],
   providers: [MessageService],
   templateUrl: './sostituzione-comp.component.html',
   styleUrl:    './sostituzione-comp.component.css'
})
export class SostituzioneCompComponent implements OnInit
{
   @Input() teamName: string = '';
   @Input() teamColor: string = '#FFFFFF';
   @Input() tempo: string = '';
   @Input() players: TMatchPlayer[] = [];
   @Input() quarter: number = 1;
   @Input() isMyTeam: boolean = true;

   @Output() salva = new EventEmitter<{ players: TMatchPlayer[], azione: string, usciti?: TMatchPlayer[], entrati?: TMatchPlayer[], quintetto?: TMatchPlayer[], tempoSec?: number }>();
   @Output() annulla = new EventEmitter<void>();

   public tempoEdit: string = '';
   public selectedInGioco: TMatchPlayer[] = [];
   public selectedInPanchina: TMatchPlayer[] = [];


   constructor(private cdr: ChangeDetectorRef, private messageService: MessageService)
   {
   }


   ngOnInit(): void
   {
      this.tempoEdit = this.tempo;
   }


   async onComponentShow(aTempo: string)
   {
      this.tempoEdit = aTempo;
      this.selectedInGioco = [];
      this.selectedInPanchina = [];
      this.cdr.detectChanges();
   }


   // Colore leggibile (bianco/nero) sopra lo sfondo colorato della squadra, in base alla sua luminosità (formula YIQ)
   get teamNameTextColor(): string
   {
      const hex = (this.teamColor || '#FFFFFF').replace('#', '');
      if (hex.length !== 6)
         return '#000000';
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return yiq >= 128 ? '#000000' : '#ffffff';
   }


   get playersInGioco(): TMatchPlayer[]
   {
      return this.players.filter(p => p.inGioco());
   }


   get playersInPanchina(): TMatchPlayer[]
   {
      return this.players.filter(p => !p.inGioco());
   }


   Annulla(): void
   {
      this.annulla.emit();
   }


   Quintetto(): void
   {
      const selezionati = new Set<TMatchPlayer>([
                                                   ...this.selectedInGioco.filter(p => p.inGioco()),
                                                   ...this.selectedInPanchina.filter(p => !p.inGioco())
                                                ]);
      console.log(`-------------selezionati: ${selezionati.size}`);
      selezionati.forEach(p => console.log(`${p.playName()}:${p.inGioco()}`));
      if (selezionati.size !== 5)
      {
         this.messageService.add({ severity: 'warn', summary: 'Attenzione', detail: 'Seleziona esattamente 5 giocatori' });
         return;
      }
      // Conferma se il quintetto per questo quarto è già stato assegnato (porting da BtnQuintettoClick, BSDEvo.Dlg.Sostituzione.pas:426-441)
      const team = this.isMyTeam ? matchGlobs.currMatch?.myTeam() : matchGlobs.currMatch?.oppTeam();
      const already = team?.QuintettoQuarto[this.quarter - 1] ?? false;
      if (already)
      {
         const ok = confirm(`ATTENZIONE\n\nIl quintetto per il ${this.quarter}° quarto è già stato assegnato.\nSicuro di volerlo riassegnare?`);
         if (!ok)
            return;
      }
      if (team)
         team.QuintettoQuarto[this.quarter - 1] = true;
      console.log(`----players prima`);
      this.players.forEach(p => console.log(`${p.playName()}:${p.inGioco()}`));
      this.players.forEach(p => p.inGioco.set(selezionati.has(p)));
      console.log(`----players dopo`);
      this.players.forEach(p => console.log(`${p.playName()}:${p.inGioco()}`));
      const parts = this.tempoEdit.split(':');
      const tempoSec = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      this.salva.emit({ players: this.players, azione: "quintetto", quintetto: [...selezionati], tempoSec });
   }


   InCampo(): void
   {
      const selezionati = new Set<TMatchPlayer>([
                                                   ...this.selectedInGioco,
                                                   ...this.selectedInPanchina
                                                ]);
      console.log(`-------------selezionati: ${selezionati.size}`);
      selezionati.forEach(p => console.log(`${p.playName()}:${p.inGioco()}`));
      if (selezionati.size !== 5)
      {
         this.messageService.add({ severity: 'warn', summary: 'Attenzione', detail: 'Seleziona esattamente 5 giocatori' });
         return;
      }
      const parts = this.tempoEdit.split(':');
      const tempoSec = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      const usciti: TMatchPlayer[] = [];
      const entrati: TMatchPlayer[] = [];
      this.players.forEach(p =>
      {
         const eraInGioco = p.inGioco();
         const vaInGioco  = selezionati.has(p);
         if ((eraInGioco) && (!vaInGioco))
         {
            // esce
            p.inGioco.set(false);
            p.outTime.set(tempoSec);
            usciti.push(p);
         }
         else if ((!eraInGioco) && (vaInGioco))
         {
            // entra
            p.inGioco.set(true);
            p.inTime.set(tempoSec);
            entrati.push(p);
         }
      });
      this.salva.emit({ players: this.players, azione: "incampo", usciti, entrati });
   }


   Salva(): void
   {
      if (this.selectedInGioco.length !== this.selectedInPanchina.length)
      {
         this.messageService.add({ severity: 'warn', summary: 'Attenzione', detail: 'Il numero di giocatori da sostituire non coincide col numero di giocatori sostituiti' });
         return;
      }
      if (this.selectedInGioco.length === 0)
      {
         this.messageService.add({ severity: 'warn', summary: 'Attenzione', detail: 'Selezionare almeno un giocatore per effettuare la sostituzione' });
         return;
      }
      const parts = this.tempoEdit.split(':');
      const tempoSec = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);

      this.selectedInGioco.forEach(p =>
      {
         p.inGioco.set(false);
         p.outTime.set(tempoSec);
      });
      this.selectedInPanchina.forEach(p =>
      {
         p.inGioco.set(true);
         p.inTime.set(tempoSec);
      });
      this.salva.emit({
                         players: this.players,
                         azione:  "sostituzione",
                         usciti:  [...this.selectedInGioco],
                         entrati: [...this.selectedInPanchina]
                      });
   }
}
