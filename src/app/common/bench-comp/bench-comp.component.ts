
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
import { TMatchPlayer } from '../../models/datamod';



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
   @Input() player: TMatchPlayer | null = null;
   @Input() colorNormal: string = globs.colorNotSelected
   @Input() colorSelected: string = globs.colorSelected
   @Input() isSelected: boolean = false;

   @Output() componentClicked: EventEmitter<string> = new EventEmitter<string>();
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
      return (this.player ? this.player.GetFalliFatti() : 0).toString();
   }


   GetFoulsBackgroundColor(): string
   {
      let tempFalli: number = this.player ? this.player.GetFalliFatti() : 0;
      if (tempFalli <= 0)
         tempFalli = 0;
      if (tempFalli > 5)
         tempFalli = 5;
      return globs.bckColorFalli[tempFalli];
   }


   GetFoulsTextColor(): string
   {
      let tempFalli: number = this.player ? this.player.GetFalliFatti() : 0;
      if (tempFalli <= 0)
         tempFalli = 0;
      if (tempFalli > 5)
         tempFalli = 5;
      return globs.txtColorFalli[tempFalli];
   }


   GetPunti(): string
   {
      return (this.player ? this.player.CalcolaPunti() : 0).toString();
   }


   GetQuintetto()
   {
      const cap   = this.player ? this.player.captain()     : false;
      const quint = this.player ? this.player.inQuintetto() : false;
      if (cap)
         return (quint ? "🟠👑" : "○👑");
      else
         return (quint ? "🟠" : "○");
   }


   GetPlayerName(): string
   {
      return this.player ? this.player.playName() : "";
   }


   GetPlayerNum(): string
   {
      return this.player ? this.player.playNumber() : "";
   }


   GetMinuti(): string
   {
      if (this.player)
      {
         const secs = this.player.tempoGioco();
         const m = Math.floor(secs / 60);
         const s = secs % 60;
         return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      }
      return "00:00";
   }

}
