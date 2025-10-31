
import {Component, OnInit, OnDestroy, Input, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
// PrimeNG modules
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {TooltipModule} from "primeng/tooltip";
import {InputMaskModule} from "primeng/inputmask";
import {FormsModule} from "@angular/forms";
import { DialogModule } from 'primeng/dialog';
import { globs} from "../utils";



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
   @Input() colorNormal: string = globs.colorNotSelected
   @Input() colorSelected: string = globs.colorSelected
   @Input() isSelected: boolean = false;

   @Output() componentClicked = new EventEmitter<string>();
   @Output() componentDoubleClicked: EventEmitter<string> = new EventEmitter<string>();




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


   onDoubleClick()
   {
      this.componentDoubleClicked.emit(this.componentId);
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
      return globs.bckColorFalli[this.playerFouls];
   }


   GetFoulsTextColor(): string
   {
      if (this.playerFouls <= 0)
         this.playerFouls = 0;
      if (this.playerFouls > 5)
         this.playerFouls = 5;
      return globs.txtColorFalli[this.playerFouls];
   }

}
