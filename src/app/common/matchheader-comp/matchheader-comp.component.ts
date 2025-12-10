
import {Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
// PrimeNG modules
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {TooltipModule} from "primeng/tooltip";
import {InputMaskModule} from "primeng/inputmask";
import {FormsModule} from "@angular/forms";
import { DialogModule } from 'primeng/dialog';
import {InputTextModule} from "primeng/inputtext";
import {CreateEmptyMatchHeader, MatchHeader} from "../../models/datamod";
import {CalendarModule} from "primeng/calendar";
import { ColorPickerModule } from "primeng/colorpicker";
import {DropdownModule} from 'primeng/dropdown';
import {Team} from '../../models/datamod';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { SelectButtonModule } from 'primeng/selectbutton';
import {PlayerService} from "../../services/player.service";
import {TeamService} from "../../services/team.service";
import {MessageDialogService} from "../../services/message-dialog.service";
import {firstValueFrom} from "rxjs";


@Component({
  selector:    'app-matchheader-comp',
  standalone:  true,
              imports: [
                 CommonModule,
                 ButtonModule,
                 TooltipModule,
                 InputMaskModule,
                 FormsModule,
                 DialogModule,
                 CardModule,
                 InputTextModule,
                 CalendarModule,
                 ColorPickerModule,
                 DropdownModule,
                 InputGroupModule,
                 InputGroupAddonModule,
                 SelectButtonModule
              ],
  templateUrl: './matchheader-comp.component.html',
  styleUrl:    './matchheader-comp.component.css'
})
export class MatchheaderCompComponent implements OnInit, OnDestroy
{
   @Input () mhIsNew: boolean = false;
   @Input () mhTitle: string = "";
   @Input () mhStagione: string = "";
   @Input () mhMatchHeader: MatchHeader = CreateEmptyMatchHeader();
   @Input () mhMatchDate: Date = new Date();
   @Input () listaTeams: Array<Team> = [];
   @Input () mhChampAbbrev: string = "";

   @Output() salvaMatchHeader = new EventEmitter<{ mh: MatchHeader }>();
   @Output() annullaMatchHeader = new EventEmitter();

   private origData: MatchHeader | null = null;
   public atHomeOptions: any[] = [{ label: 'In Casa', value: true },{ label: 'In Trasferta', value: false }];


   constructor(private cdr: ChangeDetectorRef,
               private servTeam: TeamService,
               private messageDialogService: MessageDialogService)
   {

   }


   ngOnInit (): void
   {
   }


   ngOnDestroy (): void
   {
   }


   async onDialogShown()
   {
      await this.LoadTeamList();
      if (this.mhIsNew)
      {
         this.mhTitle = "Nuovo Match";
      }
      else
      {
         this.mhTitle = "Modifica Match";
      }
      //
      this.origData = JSON.parse(JSON.stringify(this.mhMatchHeader, null, 3));
      this.cdr.detectChanges();
   }


   async LoadTeamList()
   {
      const theData = await firstValueFrom (this.servTeam.getAllData(this.mhMatchHeader.champId_lk));
      if ((theData) && (theData.elements))
      {
         this.listaTeams = theData.elements;
      }
   }


   Annulla()
   {
      this.annullaMatchHeader.emit();
   }


   Salva()
   {
      for (let iii=0;   iii<this.listaTeams.length;   iii++)
      {
         if (this.listaTeams[iii].nome === this.mhMatchHeader.myTeamNome_lk)
         {
            this.mhMatchHeader.myTeamAbbrev_lk = this.listaTeams[iii].abbrev;
            this.mhMatchHeader.myTeamId_link = this.listaTeams[iii].id;
         }
         if (this.listaTeams[iii].nome === this.mhMatchHeader.oppoTeamNome_lk)
         {
            this.mhMatchHeader.oppoTeamAbbrev_lk = this.listaTeams[iii].abbrev;
            this.mhMatchHeader.oppoTeamId_link = this.listaTeams[iii].id;
         }
      }
      if (this.mhMatchHeader.title == "")
      {
         this.CalcolaTitoloMatch();
      }
      this.mhMatchHeader.matchDate = new Date(this.mhMatchDate);
      this.mhMatchHeader.matchDateStr = this.mhMatchHeader.matchDate.toLocaleDateString("default", { day: '2-digit', month: '2-digit', year: 'numeric' });
      this.salvaMatchHeader.emit ({ mh: this.mhMatchHeader });
   }


   CalcolaTitoloMatch(): string
   {
      let dt: Date = new Date(this.mhMatchHeader.matchDate);
      let result: string = `${this.mhChampAbbrev}-`+
                           `${this.mhMatchHeader.phaseAbbrev_lk}-`+
                           `${this.mhMatchHeader.giornata}-`+
                           `${this.mhMatchHeader.matchNumber}-`+
                           `${this.mhMatchHeader.myTeamNome_lk}-`+
                           `${this.mhMatchHeader.oppoTeamNome_lk}-`+
                           `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;

      this.mhMatchHeader.title = result;
      return result;
   }


}
