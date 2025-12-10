
import {
   Component,
   OnInit,
   OnDestroy,
   Input,
   Output,
   EventEmitter,
   Host,
   Inject,
   forwardRef,
   ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatchComponent} from "../../pages/match/match.component";
// PrimeNG modules
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {TooltipModule} from "primeng/tooltip";
import {InputMaskModule} from "primeng/inputmask";
import {FormsModule} from "@angular/forms";
import { DialogModule } from 'primeng/dialog';
//import Color from 'Color';
import { globs} from "../utils";



@Component({
  selector:    'app-points-comp',
  standalone:  true,
  imports:     [
     CommonModule,
     ButtonModule,
     TooltipModule,
     InputMaskModule,
     FormsModule,
     DialogModule,
  ],
  templateUrl: './points-comp.component.html',
  //            template:    '<div>OK</div>',
  styleUrl:    './points-comp.component.css'
})
export class PointsCompComponent implements OnInit, OnDestroy
{
   @Input() componentId!: string;
   @Input() title: string = "";
   @Input() colorNormal1: string = globs.colorNotSelected
   @Input() colorNormal2: string = globs.colorNotSelected
   @Input() colorSelected1: string = globs.colorSelected
   @Input() colorSelected2: string = globs.colorSelected
   @Input() btn1Label: string = "";
   @Input() btn2Label: string = "";
   @Input() isSelected: boolean = false;

   @Output() compBtnMinus1Clicked = new EventEmitter<string>();
   @Output() compBtnPlus1Clicked = new EventEmitter<string>();
   @Output() compBtnMinus2Clicked = new EventEmitter<string>();
   @Output() compBtnPlus2Clicked = new EventEmitter<string>();


   constructor (/*@Host() @Inject(forwardRef(() => MatchComponent)) private parent: any,*/
                private cdr: ChangeDetectorRef)
   {
      let myparent: MatchComponent;
   }


   ngOnInit ()
   {
      //this.parent.RegisterPointsComponent (this.componentId, this);
   }


   ngOnDestroy ()
   {
      //this.parent.UnregisterPointsComponent (this.componentId);
   }


   onMinus1Click()
   {
      this.compBtnMinus1Clicked.emit(this.componentId);
   }


   onPlus1Click()
   {
      this.compBtnPlus1Clicked.emit(this.componentId);
   }


   onMinus2Click()
   {
      this.compBtnMinus2Clicked.emit(this.componentId);
   }


   onPlus2Click()
   {
      this.compBtnPlus2Clicked.emit(this.componentId);
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


   private LightOn()
   {
      this.isSelected = true;
      this.cdr.detectChanges();
   }


   private LightOff()
   {
      this.isSelected = false;
      this.cdr.detectChanges();
   }


   public Flash()
   {
      setTimeout (() => { this.LightOn(); }, 11);
      setTimeout (() => { this.LightOff(); }, 300);
   }


}
