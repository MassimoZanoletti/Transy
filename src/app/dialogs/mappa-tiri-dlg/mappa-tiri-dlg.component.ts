import {Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonModule} from 'primeng/button';
import {CampoTiriComponent, TTiroPrecedente} from "../../common/campo-tiri/campo-tiri.component";
import {TMatchPlayer} from "../../models/datamod";
import {CalcolaMappaTiri, PercentualeTiri} from "../../common/mappa-tiri";


// Mappa di tiro (Delphi: ShowShoots) di un giocatore o di tutta una squadra: tiri da 2 e da 3 con posizione,
// pallino se segnati e crocetta se sbagliati, colorati per quarto
@Component({
   selector:    'app-mappa-tiri-dlg',
   standalone:  true,
   imports: [
      CommonModule,
      ButtonModule,
      CampoTiriComponent
   ],
   templateUrl: './mappa-tiri-dlg.component.html',
   styleUrl:    './mappa-tiri-dlg.component.css'
})
export class MappaTiriDlgComponent
{
   public titolo: string = '';
   public tiri: TTiroPrecedente[] = [];
   public riepilogo: { label: string, segnati: number, tentati: number }[] = [];
   public senzaPosizione: number = 0;

   @Output() chiudi = new EventEmitter<void>();


   onComponentShow (titolo: string,
                    giocatori: TMatchPlayer[]): void
   {
      this.titolo = titolo;
      const mappa = CalcolaMappaTiri(giocatori);
      this.tiri = mappa.tiri;
      this.riepilogo = mappa.riepilogo;
      this.senzaPosizione = mappa.senzaPosizione;
   }


   Percentuale (segnati: number,
                tentati: number): string
   {
      return PercentualeTiri(segnati, tentati);
   }


   BtnChiudi (): void
   {
      this.chiudi.emit();
   }
}
