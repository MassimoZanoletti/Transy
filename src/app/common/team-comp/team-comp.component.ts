
import {
   Component,
   OnInit,
   OnDestroy,
   Input,
   Output,
   EventEmitter, ChangeDetectorRef
} from '@angular/core';
import {CommonModule} from '@angular/common';
// PrimeNG modules
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {TooltipModule} from "primeng/tooltip";
import {InputMaskModule} from "primeng/inputmask";
import {FormsModule} from "@angular/forms";
import { DialogModule } from 'primeng/dialog';
import {ToggleButtonModule} from "primeng/togglebutton";
import Color from 'Color';
import { globs } from "../utils";
import {SelectButtonModule} from "primeng/selectbutton";
import {TMatchTeam, TQuarterTeam} from "../../models/datamod";



@Component({
  selector:    'app-team-comp',
  standalone:  true,
              imports: [
                 CommonModule,
                 ButtonModule,
                 TooltipModule,
                 InputMaskModule,
                 FormsModule,
                 DialogModule,
                 ToggleButtonModule,
                 SelectButtonModule,
              ],
  templateUrl: './team-comp.component.html',
  styleUrl:    './team-comp.component.css'
})
export class TeamCompComponent implements OnInit, OnDestroy
{
   @Input() componentId!: string;
   @Input() team__Name: string = "";
   @Input() teamColor: string = "#ffffff";
   @Input() colorNormal: string = globs.colorNotSelected
   @Input() colorSelected: string = globs.colorSelected
   @Input() isSelected: boolean = false;
   @Input() matchTeamData!: TMatchTeam | null;

   @Output() componentClicked = new EventEmitter<string>();
   @Output() componentDoubleClicked: EventEmitter<string> = new EventEmitter<string>();

   timeoutVisible: boolean = false;
   timeoutOptions: any[] = [{ label: 'OFF', value: false },{ label: 'ON', value: true }];

   colorNormal1: string = "";
   colorNormal2: string = "";
   colorSelected1: string = "";
   colorSelected2: string = "";
   valoreTL: string = "";
   initialized: boolean = false;


   constructor (public cdr: ChangeDetectorRef)
   {
      /*
      TMatchTeam.Create(true).then(data => {
         this.matchTeamData = data;
      });
      */
   }


   async ngOnInit ()
   {
      /*
      if (this.matchTeamData == null)
         this.matchTeamData = await TMatchTeam.Create(true);
      */
      this.colorNormal1 = Color(this.colorNormal).lighten(0.40).hex();
      this.colorNormal2 = Color(this.colorNormal).lighten(0.60).hex();
      this.colorSelected1 = Color(this.colorSelected).lighten(0.40).hex();
      this.colorSelected2 = Color(this.colorSelected).lighten(0.60).hex();
      //
      await this.Update();
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


   async AssingTeam (aTeam: TMatchTeam | null)
   {
      this.matchTeamData = aTeam;
      await this.Update();
   }


   GetTeamName(): string
   {
      if (this.matchTeamData != null)
         return this.matchTeamData.name();
      return "";
   }


   GetTotPunti(): number
   {
      return this.matchTeamData?.CalcPunti() ?? 0;
   }


   GetPuntiQuarto(): number
   {
      if (!this.matchTeamData) return 0;
      const cq = this.matchTeamData.currQuarter() >= 0 ? this.matchTeamData.currQuarter() : 0;
      return this.matchTeamData.GetQuarto(cq)?.punti ?? 0;
   }


   GetTimeout1T(): string
   {
      let result: string = "";
      if (this.matchTeamData != null)
         result = `${this.matchTeamData.timeout1()}`;
      else
         result = "";
      return result;
   }


   GetTimeout2T(): string
   {
      let result: string = "";
      if (this.matchTeamData != null)
         result = `${this.matchTeamData.timeout2()}`;
      else
         result = "";
      return result;
   }


   GetTimeoutExtra(): string
   {
      let result: string = "";
      if (this.matchTeamData != null)
         result = `${this.matchTeamData.timeoutExtra()}`;
      else
         result = "";
      return result;
   }


   GetFalliTeam(): string
   {
      let result: string = "0";
      if (this.matchTeamData != null)
      {
         let cq: number = 0;
         if (this.matchTeamData.currQuarter() >= 0)
            cq = this.matchTeamData.currQuarter();
         const qrt: TQuarterTeam | null = this.matchTeamData.GetQuarto(cq);
         if (qrt)
            result = `${qrt.falliQrt}`;
      }
      return result;
   }


   GetBonus(): string
   {
      let result: string = "";
      if (this.matchTeamData != null)
      {
         let cq: number = 0;
         if (this.matchTeamData.currQuarter() >= 0)
            cq = this.matchTeamData.currQuarter();
         const qrt: TQuarterTeam | null = this.matchTeamData.GetQuarto(cq);
         if (qrt)
            if (qrt.bonus)
               result = "B";
      }
      else
         result = "";
      return result;
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


   async GetStatTL(): Promise<string>
   {
      if (!this.matchTeamData) return "";
      const r = this.matchTeamData.CalcTLRealizz();
      const t = this.matchTeamData.CalcTLTentati();
      const p = this.matchTeamData.CalcTLPerc();
      return t > 0 ? `${r}/${t} ${p}` : "";
   }


   GetStatT2(): string
   {
      if (!this.matchTeamData) return "";
      let r = 0, t = 0;
      for (const pl of this.matchTeamData.Roster)
      {
         r += pl.CalcT2Realizz();
         t += pl.CalcT2Tentati();
      }
      const p = t > 0 ? ((r * 100) / t).toFixed(0) : "0";
      return t > 0 ? `${r}/${t} ${p}%` : "";
   }


   GetStatT3(): string
   {
      if (!this.matchTeamData) return "";
      let r = 0, t = 0;
      for (const pl of this.matchTeamData.Roster)
      {
         r += pl.CalcT3Realizz();
         t += pl.CalcT3Tentati();
      }
      const p = t > 0 ? ((r * 100) / t).toFixed(0) : "0";
      return t > 0 ? `${r}/${t} ${p}%` : "";
   }


   GetStatTdC(): string
   {
      if (!this.matchTeamData) return "";
      let r = 0, t = 0;
      for (const pl of this.matchTeamData.Roster)
      {
         r += pl.CalcT2Realizz() + pl.CalcT3Realizz();
         t += pl.CalcT2Tentati() + pl.CalcT3Tentati();
      }
      const p = t > 0 ? ((r * 100) / t).toFixed(0) : "0";
      return t > 0 ? `${r}/${t} ${p}%` : "";
   }


   GetStatPPer(): string
   {
      return this.matchTeamData ? `${this.matchTeamData.pPerse()}` : "";
   }


   GetStatPRec(): string
   {
      return this.matchTeamData ? `${this.matchTeamData.pRecuperate()}` : "";
   }


   GetStatFFat(): string
   {
      if (!this.matchTeamData) return "";
      let total = 0;
      for (const pl of this.matchTeamData.Roster)
         total += pl.TotFalli();
      return `${total}`;
   }


   GetStatFSub(): string
   {
      if (!this.matchTeamData) return "";
      let total = 0;
      for (const pl of this.matchTeamData.Roster)
         total += pl.falliSubiti();
      return `${total}`;
   }


   GetStatRimb(): string
   {
      if (!this.matchTeamData) return "";
      const d = this.matchTeamData.rimbDifesa();
      const a = this.matchTeamData.rimbAttacco();
      const tot = this.matchTeamData.CalcRimbalzi();
      return `${d}<->${a} [${tot}]`;
   }


   BtnTimeoutClick()
   {
      this.timeoutVisible = true;
   }


   async GetTOut1T(quale: number): Promise<boolean>
   {
      if (this.matchTeamData)
         return this.matchTeamData.GetTimeout1(quale);
      else
         return false;
   }


   async SetTOut1T(quale: number,
                   valore: boolean)
   {
      if (this.matchTeamData)
         this.matchTeamData.SetTimeout1(quale, valore);
   }


   async GetTOut2T(quale: number): Promise<boolean>
   {
      if (this.matchTeamData)
         return this.matchTeamData.GetTimeout2(quale);
      else
         return false;
   }


   async SetTOut2T(quale: number,
                   valore: boolean)
   {
      if (this.matchTeamData)
         await this.matchTeamData.SetTimeout2(quale, valore);
   }


   async GetTOutExtra(quale: number): Promise<boolean>
   {
      if (this.matchTeamData)
         return await this.matchTeamData.GetTimeoutExtra(quale);
      else
         return false;
   }


   async SetTOutExtra(quale: number,
                   valore: boolean)
   {
      if (this.matchTeamData)
         await this.matchTeamData.SetTimeoutExtra(quale, valore);
   }


   async Update()
   {
      this.valoreTL = await this.GetStatTL();
      //
      this.cdr.detectChanges();
   }

}
