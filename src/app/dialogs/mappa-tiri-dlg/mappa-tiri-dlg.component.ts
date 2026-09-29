import {Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonModule} from 'primeng/button';
import {CampoTiriComponent, TTiroPrecedente} from "../../common/campo-tiri/campo-tiri.component";
import {TMatchPlayer, TTipoRealizzazione} from "../../models/datamod";


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
      const tiri = giocatori.flatMap(p => p.realizzazioni())
         .filter(r => (r.rTipo === TTipoRealizzazione.trT2) || (r.rTipo === TTipoRealizzazione.trT3));
      const conPosizione = tiri.filter(r => (r.rPosX !== 0) || (r.rPosY !== 0));
      this.tiri = conPosizione.map(r => ({ x: r.rPosX, y: r.rPosY, segnato: (r.rPunti > 0), quarto: r.rQuarto }));
      this.senzaPosizione = tiri.length - conPosizione.length;
      this.riepilogo = [
         { tipo: TTipoRealizzazione.trT2, label: 'T2' },
         { tipo: TTipoRealizzazione.trT3, label: 'T3' }
      ].map(t =>
      {
         const delTipo = tiri.filter(r => r.rTipo === t.tipo);
         return { label: t.label, segnati: delTipo.filter(r => r.rPunti > 0).length, tentati: delTipo.length };
      });
   }


   Percentuale (segnati: number,
                tentati: number): string
   {
      return (tentati > 0) ? `${Math.round(100 * segnati / tentati)}%` : '-';
   }


   BtnChiudi (): void
   {
      this.chiudi.emit();
   }
}
