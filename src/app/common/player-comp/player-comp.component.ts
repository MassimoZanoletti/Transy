
import {Component, OnInit, OnDestroy, Input, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
// PrimeNG modules
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {TooltipModule} from "primeng/tooltip";
import {InputMaskModule} from "primeng/inputmask";
import {FormsModule} from "@angular/forms";
import { DialogModule } from 'primeng/dialog';



@Component({
  selector:    'app-player-comp',
  standalone:  true,
  imports:     [
     CommonModule,
     ButtonModule,
     TooltipModule,
     InputMaskModule,
     FormsModule,
     DialogModule
  ],
  templateUrl: './player-comp.component.html',
  styleUrl:    './player-comp.component.css'
})
export class PlayerCompComponent implements OnInit, OnDestroy
{
   @Input() componentId!: string;
   @Input() playerNumber: string = "";
   @Input() playerName: string = "";
   @Input() playerFouls: number = 0;
   @Input() playerMinutes: string = "";
   @Input() playerPoints: number = 0;
   @Input() colorNormal: string = "#333333";
   @Input() colorSelected: string = "#007700";
   @Input() isSelected: boolean = false;

   @Output() componentClicked = new EventEmitter<string>();


   bckColorFalli: Array<string> = ["#6c6c6c", "#ffaaaa", "#ffff99", "#ffbbbb", "#ff00ff", "#000000"];
   txtColorFalli: Array<string> = ["#00b400", "#0000ff", "#009900", "#ff0000", "#ffff00", "#ffffff"];


   constructor ()
   {
   }


   ngOnInit ()
   {

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
         return this.colorSelected;
      else
         return this.colorNormal;
   }


   GetFoulsBackgroundColor(): string
   {
      if (this.playerFouls <= 0)
         this.playerFouls = 0;
      if (this.playerFouls > 5)
         this.playerFouls = 5;
      return this.bckColorFalli[this.playerFouls];
   }


   GetFoulsTextColor(): string
   {
      if (this.playerFouls <= 0)
         this.playerFouls = 0;
      if (this.playerFouls > 5)
         this.playerFouls = 5;
      return this.txtColorFalli[this.playerFouls];
   }

}
