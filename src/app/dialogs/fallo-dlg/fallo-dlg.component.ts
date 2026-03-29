
import {Component,
   OnInit,
   OnDestroy,
   Input,
   Output,
   EventEmitter,
   ChangeDetectorRef,
   ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
// PrimeNG modules
import {ButtonModule} from 'primeng/button';
import {CheckboxModule} from "primeng/checkbox";
import {CardModule} from 'primeng/card';
import {TooltipModule} from "primeng/tooltip";
import {InputMaskModule} from "primeng/inputmask";
import {FormsModule} from "@angular/forms";
import { DialogModule } from 'primeng/dialog';
import {InputTextModule} from "primeng/inputtext";
import {
   TFallo,
   TMatchPlayer
} from "../../models/datamod";
import {CalendarModule} from "primeng/calendar";
import { ColorPickerModule } from "primeng/colorpicker";
import {DropdownModule} from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { SelectButtonModule } from 'primeng/selectbutton';
import {DividerModule} from 'primeng/divider';
import {utils} from "../../common/utils";



@Component({
  selector:    'app-fallo-dlg',
  standalone:  true,
              imports: [
                 CommonModule,
                 ButtonModule,
                 TooltipModule,
                 InputMaskModule,
                 FormsModule,
                 DialogModule,
                 CardModule,
                 InputTextModule,
                 CalendarModule,
                 ColorPickerModule,
                 CheckboxModule,
                 DropdownModule,
                 InputGroupModule,
                 InputGroupAddonModule,
                 SelectButtonModule,
                 DividerModule,
              ],
  templateUrl: './fallo-dlg.component.html',
  styleUrl:    './fallo-dlg.component.css'
})
export class FalloDlgComponent  implements OnInit, OnDestroy
{
   public thePlayer: TMatchPlayer | null = null;
   public falli: Array<TFallo> = [];
   public quarto: number = 0;
   public tempoSec: number = 0;
   public tempoStr: string = "";

   @Output() salvaFalli = new EventEmitter<TMatchPlayer | null>();
   @Output() annullaFalli = new EventEmitter();



   constructor(private cdr: ChangeDetectorRef)
   {
      this.falli.push(new TFallo());
      this.falli.push(new TFallo());
      this.falli.push(new TFallo());
      this.falli.push(new TFallo());
      this.falli.push(new TFallo());
   }


   ngOnInit (): void
   {
   }


   ngOnDestroy (): void
   {
   }


   async onComponentShow(aPlayer: TMatchPlayer | null,
                         aQuarto: number,
                         aTempo: number)
   {
      this.thePlayer = aPlayer;
      if ((aQuarto > 0) && (aTempo > 0))
      {
         this.quarto = aQuarto;
         this.tempoSec = aTempo;
         this.tempoStr = `${Math.trunc(aTempo/60)}:${utils.Dlt_PadDigits (aTempo % 60, 2)}`;
      }
      else
      {
         this.quarto = 0;
         this.tempoSec = 0;
         this.tempoStr = ``;
      }
      //
      this.cdr.detectChanges();
   }


   Annulla()
   {
      this.annullaFalli.emit();
   }


   Salva()
   {
     this.salvaFalli.emit(this.thePlayer);
   }


   FalloTempo(idx: number): string
   {
      const f = this.falli[idx];
      const m = Math.floor(f.fTempo / 60);
      const s = f.fTempo % 60;
      return `Q${f.fQuarto} ${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
   }


   PlayerName(): string
   {
      if (this.thePlayer == null)
         return "";
      else
         return `${this.thePlayer.playNumber()}) ${this.thePlayer.playName()}`;
   }


   GetTempo(): string
   {
      if ((this.quarto > 0) && (this.tempoStr != ""))
         return `Q${this.quarto}    ${this.tempoStr}`;
      else
         return "";
   }
}
