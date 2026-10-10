
import {Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
// PrimeNG modules
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {TooltipModule} from "primeng/tooltip";
import {InputMaskModule} from "primeng/inputmask";
import {FormsModule} from "@angular/forms";
import { DialogModule } from 'primeng/dialog';
import {InputTextModule} from "primeng/inputtext";
import {CreateEmptyMatchHeader, CreateEmptyPlayer, IDSMatchHeader, MessDlgData, TDSPlayer} from "../../models/datamod";
import {CalendarModule} from "primeng/calendar";
import { ColorPickerModule } from "primeng/colorpicker";
import {DropdownModule} from 'primeng/dropdown';
import { IDSPlayer,
        IDSTeam} from '../../models/datamod';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { SelectButtonModule } from 'primeng/selectbutton';
import {DividerModule} from 'primeng/divider';
import {PlayerService} from "../../services/player.service";
import {TeamService} from "../../services/team.service";
import {MessageDialogService} from "../../services/message-dialog.service";
import {MatchSyncService} from "../../services/match-sync.service";
import {Table, TableModule} from "primeng/table";
import {firstValueFrom} from "rxjs";
import {PlayerEditCompComponent} from "../player-edit-comp/player-edit-comp.component";
import { UnaAllaVolta } from '../una-alla-volta';



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
                 PlayerEditCompComponent
              ],
  templateUrl: './players-comp.component.html',
  styleUrl:    './players-comp.component.css'
})
export class PlayersCompComponent  implements OnInit, OnDestroy
{
   @Input() teamId: number = 0;
   @Output() salvaPlayers = new EventEmitter<Array<IDSPlayer>>();
   @Output() annullaPlayers = new EventEmitter();

   @ViewChild(PlayerEditCompComponent) playerEditComp!: PlayerEditCompComponent;

   listaPlayers: Array<IDSPlayer> = [];
   selectedPlayers: IDSPlayer[] = [];
   titoloDiag: string = "";
   dialogVisible_PlayerEdit: boolean = false;
   teamName: string = "";

   constructor(private cdr: ChangeDetectorRef,
               private servPlayer: PlayerService,
               private servTeam: TeamService,
               private messageDialogService: MessageDialogService,
               private matchSync: MatchSyncService)
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
         {
            this.titoloDiag = `Giocatori di ${teamData.elements.nome}`;
            this.teamName = teamData.elements.nome;
         }
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
      this.salvaPlayers.emit(this.selectedPlayers);
   }


   async LoadTabellaPlayer()
   {
      const playersData = await firstValueFrom (this.servPlayer.getAllData(this.teamId));
      if ((playersData) && (playersData.ok) && (playersData.elements))
      {
         this.listaPlayers = playersData.elements;
      }
      else
      {
         const dlgData: MessDlgData = {
            title:      'ERRORE',
            subtitle:   'Errore durante il caricamento dei dati dei giocatori dal server',
            message:    `${playersData.message}`,
            messtype:   'error',
            btncaption: 'Chiudi'
         };
         this.messageDialogService.showMessage (dlgData, '600px');
      }
      this.cdr.detectChanges ();
      //
      /*
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
      */
   }


   CreateNewPlayer()
   {
      this.dialogVisible_PlayerEdit = true;
   }


   async onPlayerEditComponentShow()
   {
      if ((this.playerEditComp) && (this.listaPlayers.length > 0))
      {
         let newPlayer: TDSPlayer = CreateEmptyPlayer();
         await this.playerEditComp.onComponentShow (newPlayer, `Nuovo giocatore di ${this.teamName}`);
      }
   }


   async annullaPlayerEdit()
   {
      this.dialogVisible_PlayerEdit = false;
   }


   @UnaAllaVolta()
   async salvaPlayerEdit(newPlayer: TDSPlayer)
   {
      this.dialogVisible_PlayerEdit = false;
      //

      // In coda con id provvisorio (anche senza rete, es. in palestra): l'elenco lo mostra subito e la
      // creazione sul server avviene appena possibile; gli eventuali rifiuti sono segnalati da AppComponent
      await this.matchSync.EnqueueWrite ('createplayer', this.matchSync.NewTempId(), {
         nomedisp:    newPlayer.nomedisp,
         anno:        newPlayer.anno,
         ruolo:       newPlayer.ruolo,
         numero:      newPlayer.numero,
         altezza:     newPlayer.altezza,
         teamid_link: this.teamId
      }, 0);
      await this.matchSync.WaitForWrites ();
      await this.LoadTabellaPlayer ();
      this.cdr.detectChanges ();
   }

}
