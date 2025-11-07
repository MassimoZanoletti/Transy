
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
import {CreateEmptyMatchHeader, MatchHeader, MessDlgData} from "../../models/datamod";
import {CalendarModule} from "primeng/calendar";
import { ColorPickerModule } from "primeng/colorpicker";
import {DropdownModule} from 'primeng/dropdown';
import { IPlayer,
        Team} from '../../models/datamod';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { SelectButtonModule } from 'primeng/selectbutton';
import {DividerModule} from 'primeng/divider';
import {PlayerService} from "../../services/player.service";
import {TeamService} from "../../services/team.service";
import {MessageDialogService} from "../../services/message-dialog.service";
import {Table, TableModule} from "primeng/table";
import {firstValueFrom} from "rxjs";



@Component({
  selector:    'app-players-comp',
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
                 SelectButtonModule,
                 DividerModule,
                 TableModule,
              ],
  templateUrl: './players-comp.component.html',
  styleUrl:    './players-comp.component.css'
})
export class PlayersCompComponent  implements OnInit, OnDestroy
{
   @Input() teamId: number = 0;
   @Output() salvaPlayers = new EventEmitter();
   @Output() annullaPlayers = new EventEmitter();

   listaPlayers: Array<IPlayer> = [];
   selectedPlayers: IPlayer[] = [];
   titoloDiag: string = "";

   constructor(private cdr: ChangeDetectorRef,
               private servPlayer: PlayerService,
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


   async onComponentShow(aTeamId: number)
   {
      this.titoloDiag = "Giocatori";
      if (aTeamId > 0)
      {
         this.teamId = aTeamId;
         const teamData = await firstValueFrom (this.servTeam.getSingleData(aTeamId));
         if ((teamData) && (teamData.elements))
            this.titoloDiag = `Giocatori di ${teamData.elements.nome}`;
      }
      this.listaPlayers = [];
      this.selectedPlayers = [];
      await this.LoadTabellaPlayer();
   }


   Annulla()
   {
      this.annullaPlayers.emit();
   }


   Salva()
   {
      this.salvaPlayers.emit();
   }


   async LoadTabellaPlayer()
   {
      this.servPlayer.getAllData(this.teamId).subscribe (data =>
                                                    {
                                                       if (data)
                                                       {
                                                          if (data.ok)
                                                          {
                                                             this.listaPlayers = data.elements;
                                                          }
                                                          else
                                                          {
                                                             const dlgData: MessDlgData = {
                                                                title:      'ERRORE',
                                                                subtitle:   'Errore durante il caricamento dei dati dal server',
                                                                message:    `${data.message}`,
                                                                messtype:   'error',
                                                                btncaption: 'Chiudi'
                                                             };
                                                             this.messageDialogService.showMessage (dlgData, '600px');
                                                          }
                                                       }
                                                       else
                                                       {
                                                          const dlgData: MessDlgData = {
                                                             title:      'ERRORE',
                                                             subtitle:   'Errore durante il caricamento dei dati dal server',
                                                             message:    `No data returned`,
                                                             messtype:   'error',
                                                             btncaption: 'Chiudi'
                                                          };
                                                          this.messageDialogService.showMessage (dlgData, '600px');
                                                       }
                                                       this.cdr.detectChanges ();
                                                    });
   }


}
