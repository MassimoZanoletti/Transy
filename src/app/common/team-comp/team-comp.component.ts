
import {Component, OnInit, OnDestroy, Input, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
// PrimeNG modules
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {TooltipModule} from "primeng/tooltip";
import {InputMaskModule} from "primeng/inputmask";
import {FormsModule} from "@angular/forms";
import { DialogModule } from 'primeng/dialog';
import Color from 'Color';



@Component({
  selector:    'app-team-comp',
  standalone:  true,
  imports:     [
     CommonModule,
     ButtonModule,
     TooltipModule,
     InputMaskModule,
     FormsModule,
     DialogModule
  ],
  templateUrl: './team-comp.component.html',
  styleUrl:    './team-comp.component.css'
})
export class TeamCompComponent implements OnInit, OnDestroy
{
   @Input() componentId!: string;
   @Input() teamName: string = "";
   @Input() teamColor: string = "#ffffff";
   @Input() colorNormal: string = "#333333";
   @Input() colorSelected: string = "#007700";
   @Input() isSelected: boolean = false;

   @Output() componentClicked = new EventEmitter<string>();


   colorNormal1: string = "";
   colorNormal2: string = "";
   colorSelected1: string = "";
   colorSelected2: string = "";
   bckColorFalli: Array<string> = ["#6c6c6c", "#ffaaaa", "#ffff99", "#ffbbbb", "#ff00ff", "#000000"];
   txtColorFalli: Array<string> = ["#00b400", "#0000ff", "#009900", "#ff0000", "#ffff00", "#ffffff"];


   constructor ()
   {
   }


   ngOnInit ()
   {
      this.colorNormal1 = Color(this.colorNormal).lighten(0.40).hex();
      this.colorNormal2 = Color(this.colorNormal).lighten(0.60).hex();
      this.colorSelected1 = Color(this.colorSelected).lighten(0.40).hex();
      this.colorSelected2 = Color(this.colorSelected).lighten(0.60).hex();
   }


   ngOnDestroy ()
   {

   }


   onClick()
   {
      this.componentClicked.emit(this.componentId);
   }


   GetMainBackgroundColor(): string
   {
      if (this.isSelected)
      {
         return this.colorSelected;
      }
      else
      {
         return this.colorNormal;
      }
   }


   GetBackgroundColor1(): string
   {
      if (this.isSelected)
      {
         return this.colorSelected1;
      }
      else
      {
         return this.colorNormal1;
      }
   }


   GetBackgroundColor2(): string
   {
      if (this.isSelected)
      {
         return this.colorSelected2;
      }
      else
      {
         return this.colorNormal2;
      }
   }


   GetTeamBackgroundColor(): string
   {
      return this.teamColor;
   }


   GetStatTL(): string
   {
      return "18/20 80%";
   }


   GetStatT2(): string
   {
      return "10/20 50%";
   }


   GetStatT3(): string
   {
      return "4/10 40%";
   }


   GetStatTdC(): string
   {
      return "14/30 47%";
   }


   GetStatPPer(): string
   {
      return "12";
   }


   GetStatPRec(): string
   {
      return "9";
   }


   GetStatFFat(): string
   {
      return "11";
   }


   GetStatFSub(): string
   {
      return "13";
   }


   GetStatRimb(): string
   {
      return "12<->8  [20]";
   }

}
