
import {Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
// PrimeNG modules
import {ButtonModule} from 'primeng/button';
import {CheckboxModule} from "primeng/checkbox";
import {CardModule} from 'primeng/card';
import {TooltipModule} from "primeng/tooltip";
import {InputMaskModule} from "primeng/inputmask";
import {FormsModule} from "@angular/forms";
import { DialogModule } from 'primeng/dialog';
import {InputTextModule} from "primeng/inputtext";
import {
   CreateEmptyMatchHeader,
   CreateEmptyMatchRoster,
   CreateEmptyPlayer,
   IDSMatchHeader,
   MessDlgData,
   TDSPlayer,
   TDSCoach, IDSSocieta
} from "../../models/datamod";
import {CalendarModule} from "primeng/calendar";
import { ColorPickerModule } from "primeng/colorpicker";
import {DropdownModule} from 'primeng/dropdown';
import { IDSPlayer,
   IDSTeam,
   TDSMatchRoster
} from '../../models/datamod';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { SelectButtonModule } from 'primeng/selectbutton';
import {DividerModule} from 'primeng/divider';
import {PlayerService} from "../../services/player.service";
import {CoachService}  from "../../services/coach.service";
import {TeamService} from "../../services/team.service";
import {MessageDialogService} from "../../services/message-dialog.service";
import {MatchrosterService} from "../../services/matchroster.service";
import {MatchheaderService} from "../../services/matchheader.service";
import {MatchSyncService} from "../../services/match-sync.service";
import {Table, TableModule} from "primeng/table";
import {firstValueFrom} from "rxjs";
import {CellEditor} from "primeng/table";
import {PlayersCompComponent} from "../players-comp/players-comp.component";
import {PlayerEditCompComponent} from "../player-edit-comp/player-edit-comp.component";
import { UnaAllaVolta } from '../una-alla-volta';



@Component({
  selector:    'app-roster-comp',
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
                 CheckboxModule,
                 DropdownModule,
                 InputGroupModule,
                 InputGroupAddonModule,
                 SelectButtonModule,
                 DividerModule,
                 TableModule,
                 PlayersCompComponent,
                 PlayerEditCompComponent
              ],
  templateUrl: './roster-comp.component.html',
  styleUrl:    './roster-comp.component.css'
})
export class RosterCompComponent implements OnInit, OnDestroy
{

   @Output() salvaMatchRoster = new EventEmitter<[Array<TDSMatchRoster>, IDSMatchHeader]>();
   @Output() annullaMatchRoster = new EventEmitter();

   @ViewChild(PlayersCompComponent) playersComp!: PlayersCompComponent;
   @ViewChild(PlayerEditCompComponent) playerEditComp!: PlayerEditCompComponent;


   public titoloDiag: string = "Match";
   public matchHeader: IDSMatchHeader = CreateEmptyMatchHeader();
   public listaRoster: Array<TDSMatchRoster> = [];
   public listaMyRoster: Array<TDSMatchRoster> = [];
   public listaOppoRoster: Array<TDSMatchRoster> = [];
   public selectedMy: TDSMatchRoster = CreateEmptyMatchRoster();
   public selectedOppo: TDSMatchRoster = CreateEmptyMatchRoster();
   public dialogVisible_PlayNumber: boolean = false;
   public dialogPlayNumber_Value: string = "";
   public dialogPlayNumber_Nome: string = "";
   public dialogVisible_Players: number = 0;
   public dialogVisible_PlayerEdit: number = 0;
   public localChangeRoster: number = 0;
   public listaMyCoach: Array<TDSCoach> = [];
   public listaOppoCoach: Array<TDSCoach> = [];
   editingRows: any[] = []; // Array per tenere traccia delle righe in modifica
   public myHeadCoachValue: any;
   public myViceValue: any;
   public oppoHeadCoachValue: any;
   public oppoViceValue: any;
   private nuoviGiocatori: number = 0;
   // Altezza massima delle due tabelle dei giocatori: 680px come prima, ma non più dello spazio che lo schermo
   // lascia libero dopo il resto del dialog (titoli, pulsanti, allenatori, bordi: 442px misurati, più margine;
   // il dialog è alto al massimo il 90% dello schermo): così il dialog sta nello schermo senza barra di
   // scorrimento e, se i giocatori non ci stanno, scorre solo la tabella. Minimo 150px per schermi minuscoli.
   public readonly altezzaTabelle: string = 'min(680px, max(150px, calc(90vh - 460px)))';

   constructor(private cdr: ChangeDetectorRef,
               private servMatchRoster: MatchrosterService,
               private servMatchHeader: MatchheaderService,
               private servPlayer: PlayerService,
               private servTeam: TeamService,
               private servCoach: CoachService,
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


   async onComponentShow(matchHeaderId: number,
                         matchTitle: string)
   {
      this.selectedMy = CreateEmptyMatchRoster();
      this.selectedOppo = CreateEmptyMatchRoster();
      this.listaRoster = [];
      this.listaMyRoster = [];
      this.listaOppoRoster = [];
      await this.LoadMatchHeader(matchHeaderId);
      if (matchTitle == "")
         this.titoloDiag = this.matchHeader.title;
      else
         this.titoloDiag = matchTitle;
      await this.LoadMatchRoster(matchHeaderId);
      //
      await this.LoadCoachs(matchHeaderId);
      //
      if (this.matchHeader.myCoach1Id_link > 0)
      {
         const nId: number = Number(this.matchHeader.myCoach1Id_link);
         this.myHeadCoachValue = (this.listaMyCoach.find (item => Number(item.id) === nId)) || null;
      }
      if (this.matchHeader.myCoach2Id_link > 0)
      {
         const nId: number = Number(this.matchHeader.myCoach2Id_link);
         this.myViceValue = (this.listaMyCoach.find (item => Number(item.id) === nId)) || null;
      }
      //
      if (this.matchHeader.oppoCoach1Id_link > 0)
      {
         const nId: number = Number(this.matchHeader.oppoCoach1Id_link);
         this.oppoHeadCoachValue = (this.listaOppoCoach.find (item => Number(item.id) === nId)) || null;
      }
      if (this.matchHeader.oppoCoach2Id_link > 0)
      {
         const nId: number = Number(this.matchHeader.oppoCoach2Id_link);
         this.oppoViceValue = (this.listaOppoCoach.find (item => Number(item.id) === nId)) || null;
      }
      //
      this.cdr.detectChanges();
   }


   BtnAnnullaDiag()
   {
      this.annullaMatchRoster.emit();
   }


   @UnaAllaVolta()
   async BtnSalvaDiag()
   {
      if ((await this.CheckMyRoster()) == false)
         return;
      if ((await this.CheckOppoRoster()) == false)
         return;
      //
      this.listaMyRoster.sort(this.OrdinaGiocatoriByNumero);
      this.listaOppoRoster.sort(this.OrdinaGiocatoriByNumero);
      //
      this.listaRoster = [];
      for (let iii=0;   iii<this.listaMyRoster.length;   iii++)
         this.listaRoster.push(this.listaMyRoster[iii]);
      for (let iii=0;   iii<this.listaOppoRoster.length;   iii++)
         this.listaRoster.push(this.listaOppoRoster[iii]);
      //
      // Tutto passa dalla coda (il roster degli avversari si inserisce in palestra, spesso senza rete):
      // allenatori nuovi con id provvisorio, poi il roster completo; l'intestazione con gli allenatori la
      // salva chi riceve salvaMatchRoster
      this.matchHeader.myCoach1Id_link = await this.CoachId(this.myHeadCoachValue, this.matchHeader.myTeamId_link, this.matchHeader.myCoach1Id_link);
      this.matchHeader.myCoach2Id_link = await this.CoachId(this.myViceValue, this.matchHeader.myTeamId_link, this.matchHeader.myCoach2Id_link);
      if (this.oppoHeadCoachValue != undefined)
         this.matchHeader.oppoCoach1Id_link = await this.CoachId(this.oppoHeadCoachValue, this.matchHeader.oppoTeamId_link, this.matchHeader.oppoCoach1Id_link);
      if (this.oppoViceValue != undefined)
         this.matchHeader.oppoCoach2Id_link = await this.CoachId(this.oppoViceValue, this.matchHeader.oppoTeamId_link, this.matchHeader.oppoCoach2Id_link);
      //
      const rows = this.listaRoster.map(r => ({ ...this.servMatchRoster.MatchRosterToDb(r), playername_lk: r.playerName_lk }));
      await this.matchSync.EnqueueWrite ('roster', this.matchHeader.id, { rows }, this.matchHeader.id);
      //
      //await firstValueFrom (this.servMatchHeader.updateData(this.matchHeader.id, JSON.stringify(this.matchHeader, null, -1)));
      //
      this.salvaMatchRoster.emit([this.listaRoster, this.matchHeader]);
   }


   // Allenatore scelto nel dropdown (oggetto esistente) o digitato (stringa): un nome nuovo diventa un
   // allenatore con id provvisorio, creato sul server dalla coda (addoredit: se esiste già, lo riusa)
   private async CoachId (value: any,
                          teamId: number,
                          currentId: number): Promise<number>
   {
      if (typeof value == 'string')
      {
         const nome = value.trim();
         if (nome === '')
            return 0;
         const tempId = this.matchSync.NewTempId();
         await this.matchSync.EnqueueWrite ('createcoach', tempId, { nome, teamid_link: teamId }, this.matchHeader.id);
         return tempId;
      }
      if (value === null)
         return 0;
      return (value?.id != null) ? Number(value.id) : currentId;
   }


   OrdinaGiocatoriByNumero (a: TDSMatchRoster,
                            b: TDSMatchRoster): number
   {
      const numA = a.playNumber;
      const numB = b.playNumber;

      // Priorità: "0" viene prima di "00"
      if (numA === "0") {
         return numB === "0" ? 0 : -1; // "0" viene prima di qualsiasi altra cosa tranne "0"
      }
      if (numB === "0") {
         return 1; // "0" viene dopo "a" (se "a" non è "0")
      }

      // Priorità: "00" viene dopo "0" e prima degli altri numeri (> 0)
      if (numA === "00") {
         return numB === "00" ? 0 : -1; // "00" viene prima di qualsiasi numero > 0
      }
      if (numB === "00") {
         return 1; // "00" viene dopo "a" (se "a" non è "0" o "00")
      }

      // Ordinamento numerico per tutti gli altri casi (es. 2, 4, 12, 45)
      const numValA = parseInt(numA, 10);
      const numValB = parseInt(numB, 10);

      return numValA - numValB;
   }


   async LoadMatchHeader (matchHeaderId: number)
   {
      if (matchHeaderId > 0)
      {
         const theData = await firstValueFrom (this.servMatchHeader.getSingleData(matchHeaderId));
         if ((theData) && (theData.elements))
         {
            this.matchHeader = this.servMatchHeader.MatchHeaderFromDb(theData.elements);
         }
      }
   }


   async LoadMatchRoster (matchHeaderId: number): Promise<void>
   {
      this.listaRoster = [];
      this.listaMyRoster = [];
      this.listaOppoRoster = [];
      if (matchHeaderId > 0)
      {
         const theData = await firstValueFrom (this.servMatchRoster.getAllData(matchHeaderId));
         // di nuovo vuote dopo l'attesa: se nel frattempo è partito un altro caricamento, i giocatori non si sommano
         this.listaMyRoster = [];
         this.listaOppoRoster = [];
         if ((theData) && (theData.elements))
         {
            const fullList: Array<TDSMatchRoster> = theData.elements;
            for (let iii=0;   iii<fullList.length;   iii++)
            {
               if (fullList[iii].isMyTeam)
                  this.listaMyRoster.push(fullList[iii]);
               else
                  this.listaOppoRoster.push(fullList[iii]);
            }
         }
         this.listaMyRoster.sort(this.OrdinaGiocatoriByNumero);
         this.listaOppoRoster.sort(this.OrdinaGiocatoriByNumero);
      }
   }


   async LoadCoachs (matchHeaderId: number): Promise<void>
   {
      this.listaMyCoach = [];
      this.listaOppoCoach = [];
      if (matchHeaderId > 0)
      {
         const myData = await firstValueFrom (this.servCoach.getAllData(this.matchHeader.myTeamId_link));
         if ((myData) && (myData.elements))
         {
            this.listaMyCoach = myData.elements;
         }
         const oppoData = await firstValueFrom (this.servCoach.getAllData(this.matchHeader.oppoTeamId_link));
         if ((oppoData) && (oppoData.elements))
         {
            this.listaOppoCoach = oppoData.elements;
         }
      }
   }


   BtnMyPlayerEditNumberClick(product: any)
   {
      this.localChangeRoster = 1;
      this.dialogPlayNumber_Value = product.playNumber;
      this.dialogPlayNumber_Nome = product.playerName_lk;
      this.selectedMy = product;
      this.dialogVisible_PlayNumber = true;
   }

   BtnOppoPlayerEditNumberClick(product: any)
   {
      this.localChangeRoster = 2;
      this.dialogPlayNumber_Value = product.playNumber;
      this.dialogPlayNumber_Nome = product.playerName_lk;
      this.selectedOppo = product;
      this.dialogVisible_PlayNumber = true;
   }


   BtnDialogPlayNumberAnnullaClick()
   {
      this.dialogVisible_PlayNumber = false;
   }


   BtnDialogPlayNumberSalvaClick()
   {
      this.dialogVisible_PlayNumber = false;
      if (this.localChangeRoster == 1)
         this.selectedMy.playNumber = this.dialogPlayNumber_Value;
      if (this.localChangeRoster == 2)
         this.selectedOppo.playNumber = this.dialogPlayNumber_Value;
      this.localChangeRoster = 0;
      this.cdr.detectChanges();
   }


   DialogOppoPlayNumberAnnulla()
   {
      this.dialogVisible_PlayNumber = false;
   }


   DialogOppoPlayNumberSalva()
   {
      this.dialogVisible_PlayNumber = false;
      this.selectedOppo.playNumber = this.dialogPlayNumber_Value;
      this.cdr.detectChanges();
   }


   BtnMyRosterTogliClick()
   {
      if ((this.selectedMy) && (this.selectedMy.id > 0))
      {
         for (let iii=0;   iii<this.listaMyRoster.length;   iii++)
         {
            if (this.listaMyRoster[iii].id == this.selectedMy.id)
            {
               this.listaMyRoster.splice(iii,1);
               break;
            }
         }
         this.cdr.detectChanges();
      }
   }


   BtnOppoRosterTogliClick()
   {
      if ((this.selectedOppo) && (this.selectedOppo.id > 0))
      {
         for (let iii=0;   iii<this.listaOppoRoster.length;   iii++)
         {
            if (this.listaOppoRoster[iii].id == this.selectedOppo.id)
            {
               this.listaOppoRoster.splice(iii,1);
               break;
            }
         }
         this.cdr.detectChanges();
      }
   }


   async onPlayersComponentShow()
   {
      let tm: number = 0;

      if (this.dialogVisible_Players == 1)
         tm = this.matchHeader.myTeamId_link;
      if (this.dialogVisible_Players == 2)
         tm = this.matchHeader.oppoTeamId_link;
      if (this.playersComp)
         await this.playersComp.onComponentShow(tm);
   }


   PlayersDialogVisible(): boolean
   {
      return (this.dialogVisible_Players != 0);
   }


   BtnSalvaSelectPlayersDiagClick(giocatori: Array<IDSPlayer>)
   {
      for (let iii=0;   iii<giocatori.length;   iii++)
      {
         let newPl: TDSMatchRoster = CreateEmptyMatchRoster();
         // giocatori creati localmente e non ancora sul server hanno un id provvisorio negativo
         newPl.id = (giocatori[iii].id > 0) ? 1000000+giocatori[iii].id : 2000000000 + (this.nuoviGiocatori++);
         newPl.playerId_link = giocatori[iii].id;
         newPl.playerName_lk = giocatori[iii].nomedisp;
         newPl.playNumber = giocatori[iii].numero;
         newPl.isMyTeam = true;
         newPl.matchHeaderId_link = this.matchHeader.id;
         newPl.dbgPlayer = giocatori[iii].nomedisp;
         newPl.dbgMatch = this.matchHeader.title;
         if (this.dialogVisible_Players == 1)
         {
            newPl.isMyTeam = true;
            this.listaMyRoster.push (newPl);
         }
         if (this.dialogVisible_Players == 2)
         {
            newPl.isMyTeam = false;
            this.listaOppoRoster.push (newPl);
         }
      }
      this.dialogVisible_Players = 0;
   }


   BtnAnnullaSelectPlayersDiagClick()
   {
      this.dialogVisible_Players = 0;
   }


   BtnMyRosterAddClick()
   {
      this.dialogVisible_Players = 1;
   }


   BtnOppoRosterAddClick()
   {
      this.dialogVisible_Players = 2;
   }


   async CheckMyRoster(): Promise<boolean>
   {
      let result = true;

      if (this.listaMyRoster.length < 1)
         return result;
      // controllo il numero di giocatori inseriti
      if ((this.listaMyRoster.length > 0) && (this.listaMyRoster.length < 5))
      {
         result = false;
         const dlgData: MessDlgData = {
            title:      'ERRORE',
            subtitle:   'MyTeam: Numero giocatori insufficiente',
            message:    `E' necessario inserire in lista almeno 5 giocatori`,
            messtype:   'error',
            btncaption: 'Chiudi'
         };
         this.messageDialogService.showMessage (dlgData, '600px');
      }
      // Controllo il capitano
      if (result)
      {
         let totCap: number = 0;

         for (let iii=0;   iii<this.listaMyRoster.length;   iii++)
         {
            if (this.listaMyRoster[iii].capitano)
               totCap++;
         }
         if (totCap < 1)
         {
            result = false;
            const dlgData: MessDlgData = {
               title:      'ERRORE',
               subtitle:   'MyTeam: Capitano non selezionato',
               message:    `E' necessario selezionare un giocatore come capitano`,
               messtype:   'error',
               btncaption: 'Chiudi'
            };
            this.messageDialogService.showMessage (dlgData, '600px');
         }
         else if (totCap > 1)
         {
            result = false;
            const dlgData: MessDlgData = {
               title:      'ERRORE',
               subtitle:   'MyTeam: Troppi capitani',
               message:    `Ci può essere un solo capitano`,
               messtype:   'error',
               btncaption: 'Chiudi'
            };
            this.messageDialogService.showMessage (dlgData, '600px');
         }
      }
      // controllo numeri di maglia vuoti
      if (result)
      {
         for (let iii=0;   iii<this.listaMyRoster.length;   iii++)
         {
            if (this.listaMyRoster[iii].playNumber.trim() == "")
            {
               result = false;
               const dlgData: MessDlgData = {
                  title:      'ERRORE',
                  subtitle:   'MyTeam: Definire numero di maglia',
                  message:    `Il giocatore '${this.listaMyRoster[iii].playerName_lk}' non ha il numero di maglia`,
                  messtype:   'error',
                  btncaption: 'Chiudi'
               };
               this.messageDialogService.showMessage (dlgData, '600px');
            }
         }
      }
      // controllo numeri di maglia ripetuti
      if (result)
      {
         let n1: string;
         let n2: string;

         for (let iii=0;   iii<this.listaMyRoster.length;   iii++)
         {
            n1 = this.listaMyRoster[iii].playNumber.trim();
            for (let jjj=(iii+1);   jjj<this.listaMyRoster.length;   jjj++)
            {
               n2 = this.listaMyRoster[jjj].playNumber.trim();
               if (n1 == n2)
               {
                  result = false;
                  const dlgData: MessDlgData = {
                     title:      'ERRORE',
                     subtitle:   'MyTeam: Numero di maglia duplicato',
                     message:    `I giocatori '${this.listaMyRoster[iii].playerName_lk}' e '${this.listaMyRoster[jjj].playerName_lk}' hanno lo stesso numero di maglia`,
                     messtype:   'error',
                     btncaption: 'Chiudi'
                  };
                  this.messageDialogService.showMessage (dlgData, '600px');
               }
            }
         }
      }
      // controllo i campi di debug
      if (result)
      {
         for (let iii=0;   iii<this.listaMyRoster.length;   iii++)
         {
            if (this.listaMyRoster[iii].dbgPlayer == "")
               this.listaMyRoster[iii].dbgPlayer = this.listaMyRoster[iii].playerName_lk;
            if (this.listaMyRoster[iii].dbgMatch == "")
               this.listaMyRoster[iii].dbgMatch = this.matchHeader.title;
         }
      }
      return result;
   }


   async CheckOppoRoster(): Promise<boolean>
   {
      let result = true;

      if (this.listaOppoRoster.length < 1)
         return result;
      // controllo il numero di giocatori inseriti
      if ((this.listaOppoRoster.length > 0) && (this.listaOppoRoster.length < 5))
      {
         result = false;
         const dlgData: MessDlgData = {
            title:      'ERRORE',
            subtitle:   'OpponentTeam: Numero giocatori insufficiente',
            message:    `E' necessario inserire in lista almeno 5 giocatori`,
            messtype:   'error',
            btncaption: 'Chiudi'
         };
         this.messageDialogService.showMessage (dlgData, '600px');
      }
      // Controllo il capitano
      if (result)
      {
         let totCap: number = 0;

         for (let iii=0;   iii<this.listaOppoRoster.length;   iii++)
         {
            if (this.listaOppoRoster[iii].capitano)
               totCap++;
         }
         if (totCap < 1)
         {
            result = false;
            const dlgData: MessDlgData = {
               title:      'ERRORE',
               subtitle:   'OpponentTeam: Capitano non selezionato',
               message:    `E' necessario selezionare un giocatore come capitano`,
               messtype:   'error',
               btncaption: 'Chiudi'
            };
            this.messageDialogService.showMessage (dlgData, '600px');
         }
         else if (totCap > 1)
         {
            result = false;
            const dlgData: MessDlgData = {
               title:      'ERRORE',
               subtitle:   'OpponentTeam: Troppi capitani',
               message:    `Ci può essere un solo capitano`,
               messtype:   'error',
               btncaption: 'Chiudi'
            };
            this.messageDialogService.showMessage (dlgData, '600px');
         }
      }
      // controllo numeri di maglia vuoti
      if (result)
      {
         for (let iii=0;   iii<this.listaOppoRoster.length;   iii++)
         {
            if (this.listaOppoRoster[iii].playNumber.trim() == "")
            {
               result = false;
               const dlgData: MessDlgData = {
                  title:      'ERRORE',
                  subtitle:   'OpponentTeam: Definire numero di maglia',
                  message:    `Il giocatore '${this.listaOppoRoster[iii].playerName_lk}' non ha il numero di maglia`,
                  messtype:   'error',
                  btncaption: 'Chiudi'
               };
               this.messageDialogService.showMessage (dlgData, '600px');
            }
         }
      }
      // controllo numeri di maglia ripetuti
      if (result)
      {
         let n1: string;
         let n2: string;

         for (let iii=0;   iii<this.listaOppoRoster.length;   iii++)
         {
            n1 = this.listaOppoRoster[iii].playNumber.trim();
            for (let jjj=(iii+1);   jjj<this.listaOppoRoster.length;   jjj++)
            {
               n2 = this.listaOppoRoster[jjj].playNumber.trim();
               if (n1 == n2)
               {
                  result = false;
                  const dlgData: MessDlgData = {
                     title:      'ERRORE',
                     subtitle:   'OpponentTeam: Numero di maglia duplicato',
                     message:    `I giocatori '${this.listaOppoRoster[iii].playerName_lk}' e '${this.listaOppoRoster[jjj].playerName_lk}' hanno lo stesso numero di maglia`,
                     messtype:   'error',
                     btncaption: 'Chiudi'
                  };
                  this.messageDialogService.showMessage (dlgData, '600px');
               }
            }
         }
      }
      // controllo i campi di debug
      if (result)
      {
         for (let iii=0;   iii<this.listaOppoRoster.length;   iii++)
         {
            if (this.listaOppoRoster[iii].dbgPlayer == "")
               this.listaOppoRoster[iii].dbgPlayer = this.listaOppoRoster[iii].playerName_lk;
            if (this.listaOppoRoster[iii].dbgMatch == "")
               this.listaOppoRoster[iii].dbgMatch = this.matchHeader.title;
         }
      }
      return result;
   }


   BtnCreateNewPlayerMyTeam()
   {
      this.dialogVisible_PlayerEdit = 1;
   }


   BtnCreateNewPlayerOppoTeam()
   {
      this.dialogVisible_PlayerEdit = 2;
   }


   EditPlayerDialogVisible(): boolean
   {
      return (this.dialogVisible_PlayerEdit != 0);
   }


   async onPlayerEditComponentShow()
   {
      if (this.playerEditComp)
      {
         let teamName: string = "";
         if (this.dialogVisible_PlayerEdit == 1)
            teamName = this.matchHeader.myTeamNome_lk;
         if (this.dialogVisible_PlayerEdit == 2)
            teamName = this.matchHeader.oppoTeamNome_lk;
         let newPlayer: TDSPlayer = CreateEmptyPlayer();
         await this.playerEditComp.onComponentShow (newPlayer, `Nuovo giocatore di ${teamName}`);
      }
   }


   async BtnAnnullaPlayerEdit()
   {
      this.dialogVisible_PlayerEdit = 0;
   }


   @UnaAllaVolta()
   async BtnSalvaPlayerEdit(newPlayer: TDSPlayer)
   {
      let teamId: number = 0;

      if (this.dialogVisible_PlayerEdit == 1)
         teamId = this.matchHeader.myTeamId_link;
      if (this.dialogVisible_PlayerEdit == 2)
         teamId = this.matchHeader.oppoTeamId_link;
      //
      // Il giocatore nuovo (tipicamente un avversario, inserito in palestra) riceve subito un id provvisorio e
      // viene creato sul server dalla coda: da quel momento l'id reale sostituisce il provvisorio ovunque
      // (roster, eventi). Prima si usava newPlayer.id, sempre 0 perché api_player "add" non restituisce l'id.
      const tempId = this.matchSync.NewTempId();
      await this.matchSync.EnqueueWrite ('createplayer', tempId, {
         nomedisp:    newPlayer.nomedisp,
         anno:        newPlayer.anno,
         ruolo:       newPlayer.ruolo,
         numero:      newPlayer.numero,
         altezza:     newPlayer.altezza,
         teamid_link: teamId
      }, this.matchHeader.id);
      if ((this.dialogVisible_PlayerEdit == 1) || (this.dialogVisible_PlayerEdit == 2))
      {
         let newRoster: TDSMatchRoster = CreateEmptyMatchRoster();
         // id della riga solo locale (il server lo riassegna salvando il roster), positivo e distinto da
         // quelli dei giocatori scelti dall'elenco (1000000 + id giocatore)
         newRoster.id = 2000000000 + (this.nuoviGiocatori++);
         newRoster.playerId_link = tempId;
         newRoster.playerName_lk = newPlayer.nomedisp;
         newRoster.playNumber = newPlayer.numero;
         newRoster.isMyTeam = (this.dialogVisible_PlayerEdit == 1);
         newRoster.matchHeaderId_link = this.matchHeader.id;
         newRoster.dbgPlayer = newPlayer.nomedisp;
         newRoster.dbgMatch = this.matchHeader.title;
         if (newRoster.isMyTeam)
            this.listaMyRoster.push (newRoster);
         else
            this.listaOppoRoster.push (newRoster);
      }
      //
      this.dialogVisible_PlayerEdit = 0;
      this.cdr.detectChanges ();
   }
}
