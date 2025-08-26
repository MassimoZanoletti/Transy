
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
  selector:    'app-data-comp',
  standalone:  true,
              imports: [
                 CommonModule,
                 ButtonModule,
                 TooltipModule,
                 InputMaskModule,
                 FormsModule,
                 DialogModule
              ],
  templateUrl: './data-comp.component.html',
  styleUrl:    './data-comp.component.css'
})
export class DataCompComponent implements OnInit, OnDestroy
{
   @Input() componentId!: string;
   @Input() title: string = "";
   @Input() colorNormal1: string = "#004444";
   @Input() colorNormal2: string = "#008888";
   @Input() colorSelected1: string = globs.colorSelected
   @Input() colorSelected2: string = globs.colorSelected
   @Input() colorDato1: string = "#ffffff";
   @Input() colorDato2: string = "#ffffff";
   @Input() btn1Label: string = "";
   @Input() btn2Label: string = "";
   @Input() titolo1: string = "";
   @Input() dato1: string = "";
   @Input() titolo2: string = "";
   @Input() dato2: string = "";
   @Input() dato: string = "";
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


   GetGradientBackground(): string
   {
      return `linear-gradient(to bottom, ${this.GetMainBackgroundColor1()}, ${this.GetMainBackgroundColor2()})`;
   }


   GetMainBackgroundColor1(): string
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


   GetMainBackgroundColor2(): string
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


}
