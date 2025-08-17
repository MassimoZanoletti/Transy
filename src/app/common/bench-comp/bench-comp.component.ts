
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
import { globs} from "../utils";



@Component({
  selector:    'app-bench-comp',
  standalone:  true,
  imports:     [
     CommonModule,
     ButtonModule,
     TooltipModule,
     InputMaskModule,
     FormsModule,
     DialogModule
  ],
  templateUrl: './bench-comp.component.html',
  styleUrl:    './bench-comp.component.css'
})
export class BenchCompComponent implements OnInit, OnDestroy
{
   @Input() componentId!: string;
   @Input() playerName: string = "";
   @Input() playerNum: string = "";
   @Input() colorNormal: string = globs.colorNotSelected
   @Input() colorSelected: string = globs.colorSelected
   @Input() isSelected: boolean = false;

   @Output() componentClicked = new EventEmitter<string>();


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
      {
         return this.colorSelected;
      }
      else
      {
         return this.colorNormal;
      }
   }


   GetFalli(): string
   {
      return "2";
   }


   GetFoulsBackgroundColor(): string
   {
      let tempFalli: number = 2;
      if (tempFalli <= 0)
         tempFalli = 0;
      if (tempFalli > 5)
         tempFalli = 5;
      return globs.bckColorFalli[tempFalli];
   }


   GetFoulsTextColor(): string
   {
      let tempFalli: number = 2;
      if (tempFalli <= 0)
         tempFalli = 0;
      if (tempFalli > 5)
         tempFalli = 5;
      return globs.txtColorFalli[tempFalli];
   }


   GetPunti(): string
   {
      return "22";
   }


}
