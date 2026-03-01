
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
      let result: string = "";
      if (this.matchTeamData != null)
         result = `<${this.matchTeamData.name()}>`;
      else
         result = "XYZ";
      return result;
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
      //return `${await this.matchTeamData.CalcTLRealizz()}/${await this.matchTeamData.CalcTLTentati()} ${await this.matchTeamData.CalcTLPerc()}%`;
      /*
      const tlr: number = await this.matchTeamData.CalcTLRealizz();
      return `0/0 0%`;
      */
      let result: string = "";
      try
      {
         if (this.matchTeamData)
         {
            const tlr: number = this.matchTeamData.CalcTLRealizz ();
            const tlt: number = this.matchTeamData.CalcTLTentati ();
            const tlp: string = this.matchTeamData.CalcTLPerc ();
            result = `${tlr}/${tlt} ${tlp}%`;
         }
      }
      catch (e)
      {
         result = JSON.stringify(e);
      }
      if (this.matchTeamData)
         result = this.matchTeamData.name();
      console.log(`GetStatTL\n'${result}'\n--------------------`);
      return result;
      /*
      return new Promise (resolve => {
         const sss: string = `${tlr}/${tlt} ${tlp}%`;
         resolve (sss);
      });
      */
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
