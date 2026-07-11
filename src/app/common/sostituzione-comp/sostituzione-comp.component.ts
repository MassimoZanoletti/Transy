
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
   @Input() tempo: string = '';
   @Input() players: TMatchPlayer[] = [];

   @Output() salva = new EventEmitter<{ players: TMatchPlayer[], azione: string }>();
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
      console.log(`----players prima`);
      this.players.forEach(p => console.log(`${p.playName()}:${p.inGioco()}`));
      this.players.forEach(p => p.inGioco.set(selezionati.has(p)));
      console.log(`----players dopo`);
      this.players.forEach(p => console.log(`${p.playName()}:${p.inGioco()}`));
      this.salva.emit({ players: this.players, azione: "quintetto" });
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
      this.players.forEach(p =>
      {
         const eraInGioco = p.inGioco();
         const vaInGioco  = selezionati.has(p);
         if ((eraInGioco) && (!vaInGioco))
         {
            // esce
            p.inGioco.set(false);
            p.outTime.set(tempoSec);
         }
         else if ((!eraInGioco) && (vaInGioco))
         {
            // entra
            p.inGioco.set(true);
            p.inTime.set(tempoSec);
         }
      });
      this.salva.emit({ players: this.players, azione: "incampo" });
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
      this.salva.emit({ players: this.players, azione: "sostituzione" });
   }
}
