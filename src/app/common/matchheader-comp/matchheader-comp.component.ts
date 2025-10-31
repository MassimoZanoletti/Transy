
import {Component, OnInit, OnDestroy, Input, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
// PrimeNG modules
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {TooltipModule} from "primeng/tooltip";
import {InputMaskModule} from "primeng/inputmask";
import {FormsModule} from "@angular/forms";
import { DialogModule } from 'primeng/dialog';
import {InputTextModule} from "primeng/inputtext";
import {CreateEmptyMatchHeader, MatchHeader} from "../../models/datamod";
import {CalendarModule} from "primeng/calendar";
import { ColorPickerModule } from "primeng/colorpicker";
import {DropdownModule} from 'primeng/dropdown';
import {Team} from '../../models/datamod';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';


@Component({
  selector:    'app-matchheader-comp',
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
                 DropdownModule,
                 InputGroupModule,
                 InputGroupAddonModule
              ],
  templateUrl: './matchheader-comp.component.html',
  styleUrl:    './matchheader-comp.component.css'
})
export class MatchheaderCompComponent implements OnInit, OnDestroy
{
   @Input () mhIsNew: boolean = false;
   @Input () mhTitle: string = "";
   @Input () mhStagione: string = "";
   @Input () mhMatchHeader: MatchHeader = CreateEmptyMatchHeader();
   @Input () mhMatchDate: Date = new Date();
   @Input () listaTeams: Array<Team> = [];

   @Output() salvaMatchHeader = new EventEmitter<{ mh: MatchHeader }>();
   @Output() annullaMatchHeader = new EventEmitter();

   private origData: MatchHeader | null = null;

   ngOnInit (): void
   {
      if (this.mhIsNew)
      {
         if (this.mhTitle == "")
            this.mhTitle = "Nuovo Match";
         else
            this.mhTitle = `Nuovo ${this.mhTitle}`;
      }
      else
      {
         if (this.mhTitle == "")
            this.mhTitle = "Modifica Match";
         else
            this.mhTitle = `Modifica ${this.mhTitle}`;
      }
   }


   ngOnDestroy (): void
   {
   }


   onDialogShown()
   {
      this.origData = JSON.parse(JSON.stringify(this.mhMatchHeader, null, -1));
   }


   Annulla()
   {
      this.annullaMatchHeader.emit();
   }


   Salva()
   {
      this.salvaMatchHeader.emit ({ mh: this.mhMatchHeader });
   }


}
