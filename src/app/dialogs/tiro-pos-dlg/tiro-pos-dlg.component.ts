import {Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonModule} from 'primeng/button';
import {CampoTiriComponent, TPosizioneTiro, TTiroPrecedente} from "../../common/campo-tiri/campo-tiri.component";

export type {TPosizioneTiro, TTiroPrecedente} from "../../common/campo-tiri/campo-tiri.component";


// Finestra per indicare sul campo la posizione di un tiro da 2 o da 3 (Delphi: GetFieldPos), con i tiri
// precedenti del giocatore
@Component({
   selector:    'app-tiro-pos-dlg',
   standalone:  true,
   imports: [
      CommonModule,
      ButtonModule,
      CampoTiriComponent
   ],
   templateUrl: './tiro-pos-dlg.component.html',
   styleUrl:    './tiro-pos-dlg.component.css'
})
export class TiroPosDlgComponent
{
   public descrizione: string = '';
   public tiriPrecedenti: TTiroPrecedente[] = [];

   // click sul campo: tiro registrato con la posizione
   @Output() posizione = new EventEmitter<TPosizioneTiro>();
   // "Senza posizione": tiro registrato senza coordinate
   @Output() senzaPosizione = new EventEmitter<void>();
   // "Annulla": tiro non registrato (come chiudendo la finestra nel Delphi)
   @Output() annulla = new EventEmitter<void>();


   onComponentShow (descrizione: string,
                    tiriPrecedenti: TTiroPrecedente[] = []): void
   {
      this.descrizione = descrizione;
      this.tiriPrecedenti = tiriPrecedenti;
   }


   BtnSenzaPosizione (): void
   {
      this.senzaPosizione.emit();
   }


   BtnAnnulla (): void
   {
      this.annulla.emit();
   }
}
