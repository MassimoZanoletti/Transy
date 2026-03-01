
import {Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild} from '@angular/core';
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
   CreateEmptyPlayer,
   TDSPlayer
} from "../../models/datamod";
import {CalendarModule} from "primeng/calendar";
import { ColorPickerModule } from "primeng/colorpicker";
import {DropdownModule} from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { SelectButtonModule } from 'primeng/selectbutton';
import {DividerModule} from 'primeng/divider';



@Component({
  selector:    'app-player-edit-comp',
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
  templateUrl: './player-edit-comp.component.html',
  styleUrl:    './player-edit-comp.component.css'
})
export class PlayerEditCompComponent  implements OnInit, OnDestroy
{
   public titoloDiag: string = "";
   public thePlayer: TDSPlayer = CreateEmptyPlayer();

   @Output() salvaPlayer = new EventEmitter<TDSPlayer>();
   @Output() annullaPlayer = new EventEmitter();



   constructor(private cdr: ChangeDetectorRef)
   {

   }


   ngOnInit (): void
   {
   }


   ngOnDestroy (): void
   {
   }


   async onComponentShow(aPlayer: TDSPlayer,
                         aTitle: string)
   {
      this.titoloDiag = aTitle;
      this.thePlayer = aPlayer;
      //
      this.cdr.detectChanges();
   }


   Annulla()
   {
      this.annullaPlayer.emit();
   }


   Salva()
   {
      this.salvaPlayer.emit(this.thePlayer);
   }
}

