
import {Component,
   OnInit,
   OnDestroy,
   Input,
   Output,
   EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
// PrimeNG modules
import {ButtonModule} from 'primeng/button';
import {TooltipModule} from "primeng/tooltip";
import {InputMaskModule} from "primeng/inputmask";
import {FormsModule} from "@angular/forms";
import { DialogModule } from 'primeng/dialog';
import { globs } from "../utils";
import {CreateEmptyPlayer, TDSPlayer, TMatchPlayer} from "../../models/datamod";



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
   @Input() playerRef: TDSPlayer = CreateEmptyPlayer();
   @Input() player: TMatchPlayer | null = null;
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


   GetPlayerNum(): string
   {
      return this.player ? this.player.playNumber() : this.playerNumber;
   }


   GetPlayerName(): string
   {
      return this.player ? this.player.playName() : this.playerName;
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
      return this.playerMinutes;
   }


   GetPunti(): number
   {
      return this.player ? this.player.CalcolaPunti() : this.playerPoints;
   }


   GetFalli(): number
   {
      return this.player ? this.player.GetFalliFatti() : this.playerFouls;
   }


   GetFoulsBackgroundColor(): string
   {
      let falli = this.GetFalli();
      if (falli <= 0)
         falli = 0;
      if (falli > 5)
         falli = 5;
      return globs.bckColorFalli[falli];
   }


   GetFoulsTextColor(): string
   {
      let falli = this.GetFalli();
      if (falli <= 0)
         falli = 0;
      if (falli > 5)
         falli = 5;
      return globs.txtColorFalli[falli];
   }

}
