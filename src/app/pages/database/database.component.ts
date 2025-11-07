import {
   ChangeDetectorRef,
   ChangeDetectionStrategy,
   Component,
   OnInit,
   ViewChild
} from '@angular/core';
import {
   CommonModule,
   NgIf
} from '@angular/common';
import {BlockUIModule} from "primeng/blockui";
import {Button,
   ButtonModule} from "primeng/button";
import {CardModule} from "primeng/card";
import {PrimeTemplate} from "primeng/api";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {Table, TableModule} from "primeng/table";
import {TooltipModule} from "primeng/tooltip";
import {
   MessDlgData,
   Season,
   Societa,
   User,
   Champ,
   Phase,
   Team,
   IPlayer
} from "../../models/datamod";
import { FormsModule } from '@angular/forms';
import {Router} from "@angular/router";
import {MessageDialogService} from "../../services/message-dialog.service";
import {loggedUser, UserService} from "../../services/users.service";
import {DividerModule} from "primeng/divider";
import {utils} from "../../common/utils";
import {SocietaService} from "../../services/societa.service";
import {SeasonsService} from "../../services/seasons.service";
import {CampionatiService} from "../../services/campionati.service";
import {PhaseService} from "../../services/phase.service";
import {TeamService} from "../../services/team.service";
import {PlayerService} from "../../services/player.service";
import {DialogModule} from "primeng/dialog";
import {InputTextModule} from "primeng/inputtext";
import {ReactiveFormsModule} from "@angular/forms";
import {firstValueFrom} from "rxjs";


export interface ITabelle
{
   id: number;
   nome: string;
   selId: number;
   selName: string;
}


@Component({
  selector:    'app-database',
  standalone:  true,
              imports: [
                 Button,
                 PrimeTemplate,
                 TableModule,
                 TooltipModule,
                 CommonModule,
                 ButtonModule,
                 TooltipModule,
                 DividerModule,
                 CardModule,
                 ProgressSpinnerModule,
                 BlockUIModule,
                 DividerModule,
                 DialogModule,
                 InputTextModule,
                 ReactiveFormsModule,
                 FormsModule
              ],
  templateUrl: './database.component.html',
  styleUrl:    './database.component.css'
})
export class DatabaseComponent implements OnInit
{
   tabelle: Array<ITabelle> = [];
   currTabella: ITabelle | null = null;
   tabellaDati: any[] = [];
   colonneDati: any[] = [];
   currDati: any = null;
   //
   colSocieta: any[] = [
      { field: 'nome', header: 'Nome', style: "" }
   ]
   colSeason: any[] = [
      { field: 'nome', header: 'Nome', style: "" },
      { field: 'abbrev', header: 'Abbr.', style: "" }
   ]
   colChamp: any[] = [
      { field: 'nome', header: 'Nome', style: "" },
      { field: 'abbrev', header: 'Abbr.', style: "" }
   ]
   colPhase: any[] = [
      { field: 'nome', header: 'Nome', style: "" },
      { field: 'abbrev', header: 'Abbr.', style: "" },
      { field: 'exportfolder', header: 'Exp. Fldr.', style: "" }
   ]
   colTeam: any[] = [
      { field: 'nome', header: 'Nome', style: "font-weight: 700; font-size: 1.2em; color: lime;" },
      { field: 'abbrev', header: 'Abbr.', style: "" }
   ]
   colPlayer: any[] = [
      { field: 'numero', header: 'Num.', style: "font-weight: 700; font-size: 1.3em;" },
      { field: 'nomedisp', header: 'Nome', style: "font-weight: 700; font-size: 1.2em; color: lime;" },
      { field: 'anno', header: 'Anno', style: "" }
   ]
   //
   selSocieta: Societa | null = null;
   selSeason: Season | null = null;
   selChamp: Champ | null = null;
   selPhase: Phase | null = null;
   selTeam: Team | null = null;
   selPlayer: IPlayer | null = null;
   selId: number = 0;
   //
   vertDataPositions: string[] = ['0px', '52px', '104px', '156px', '208px', '260px', '312px'];
   currVertPos: string = this.vertDataPositions[0];
   currTblHeight: string = "100px";

   /////////////////////////////////////////////////////
   //  Variabili per gestire le dialog
   dialogOperation: string = "";
   //
   dialogVisible_Societa: boolean = false;
   dialogVisible_Season: boolean = false;
   dialogVisible_Champ: boolean = false;
   dialogVisible_Phase: boolean = false;
   dialogVisible_Team: boolean = false;
   dialogVisible_Player: boolean = false;
   //
   dialogError = false;
   dialogErrorMessage: string = "";
   dialogTitle: string = "";
   dialogOperazione: string = "";
   dialogValue_Nome: string = "";
   dialogValue_Abbrev: string = "";
   dialogValue_Logo: string = "";
   dialogValue_Anno: number = 0;
   dialogValue_Ruolo: string = "";
   dialogValue_Numero: string = "";
   dialogValue_Altezza: number = 0;


   isLoading: boolean = false;
   public tblData: Array<User> = [];
   @ViewChild('tabellaTable') ptblTabelle: Table | undefined;
   @ViewChild('tabellaDeiDati') ptblDati: Table | undefined;

   constructor (public router: Router,
                private cdr: ChangeDetectorRef,
                private servSocieta: SocietaService,
                private servSeason: SeasonsService,
                private servChamp: CampionatiService,
                private servPhase: PhaseService,
                private servTeam: TeamService,
                private servPlayer: PlayerService,
                public theDataService: UserService,
                private messageDialogService: MessageDialogService)
   {
      this.tabelle.push({id:1, nome:'Società', selId:0, selName:''});
      this.tabelle.push({id:2, nome:'Stagioni', selId:0, selName:''});
      this.tabelle.push({id:3, nome:'Campionati', selId:0, selName:''});
      this.tabelle.push({id:4, nome:'Fasi', selId:0, selName:''});
      this.tabelle.push({id:5, nome:'Squadre', selId:0, selName:''});
      this.tabelle.push({id:6, nome:'Giocatori', selId:0, selName:''});
      this.tabelle.push({id:7, nome:'Allenatori', selId:0, selName:''});
   }


   ngOnInit (): void
   {
      this.isLoading = true;
      this.LoadData ();
   }


   LoadData ()
   {
      this.isLoading = true;
      this.theDataService.getAllData().subscribe (data =>
                                                  {
                                                     if (data)
                                                     {
                                                        if (data.ok)
                                                        {
                                                           this.tblData = data.elements;
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
                                                     this.isLoading = false;
                                                     this.cdr.detectChanges ();
                                                  });
   }


   LoadTabellaSocieta()
   {
      this.isLoading = true;
      this.servSocieta.getAllData().subscribe (data =>
                                                  {
                                                     if (data)
                                                     {
                                                        if (data.ok)
                                                        {
                                                           this.tabellaDati = data.elements;
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
                                                     this.isLoading = false;
                                                     this.cdr.detectChanges ();
                                                  });
   }


   async LoadTabellaStagioni()
   {
      this.isLoading = true;
      let socId: number | null = null;
      if (this.selSocieta)
         socId = this.selSocieta.id;
      this.servSeason.getAllData(socId).subscribe (data =>
                                               {
                                                  if (data)
                                                  {
                                                     if (data.ok)
                                                     {
                                                        this.tabellaDati = data.elements;
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
                                                  this.isLoading = false;
                                                  this.cdr.detectChanges ();
                                               });
   }


   LoadTabellaCampionati()
   {
      this.isLoading = true;
      let seasId: number | null = null;
      if (this.selSeason)
         seasId = this.selSeason.id;
      this.servChamp.getAllData(seasId).subscribe (data =>
                                                   {
                                                      if (data)
                                                      {
                                                         if (data.ok)
                                                         {
                                                            this.tabellaDati = data.elements;
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
                                                      this.isLoading = false;
                                                      this.cdr.detectChanges ();
                                                   });
   }


   LoadTabellaFasi()
   {
      this.isLoading = true;
      let champId: number | null = null;
      if (this.selChamp)
         champId = this.selChamp.id;
      this.servPhase.getAllData(champId).subscribe (data =>
                                                   {
                                                      if (data)
                                                      {
                                                         if (data.ok)
                                                         {
                                                            this.tabellaDati = data.elements;
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
                                                      this.isLoading = false;
                                                      this.cdr.detectChanges ();
                                                   });
   }


   LoadTabellaTeam()
   {
      this.isLoading = true;
      let champId: number | null = null;
      if (this.selChamp)
         champId = this.selChamp.id;
      this.servTeam.getAllData(champId).subscribe (data =>
                                                    {
                                                       if (data)
                                                       {
                                                          if (data.ok)
                                                          {
                                                             this.tabellaDati = data.elements;
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
                                                       this.isLoading = false;
                                                       this.cdr.detectChanges ();
                                                    });
   }


   LoadTabellaPlayer()
   {
      this.isLoading = true;
      let teamId: number | null = null;
      if (this.selTeam)
         teamId = this.selTeam.id;
      this.servPlayer.getAllData(teamId).subscribe (data =>
                                                   {
                                                      if (data)
                                                      {
                                                         if (data.ok)
                                                         {
                                                            this.tabellaDati = data.elements;
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
                                                      this.isLoading = false;
                                                      this.cdr.detectChanges ();
                                                   });
   }


   AddEnabled (): boolean
   {
      return (loggedUser.attributo == 255);
   }


   EditEnabled (row: any): boolean
   {
      return (loggedUser.attributo > 0);
   }


   DeleteEnabled (row: any): boolean
   {
      return (loggedUser.attributo == 255);
   }


   OnTabellaSelected (evento: any)
   {
      let okToGo: boolean = true;
      let gotoId: number = 0;
      let titolo: string = "";
      let messaggio: string = "";

      if (this.currTabella != null)
      {
         this.currVertPos = this.vertDataPositions[this.currTabella.id-1];
         let tmp: number = (window.innerHeight-380) - ((this.currTabella.id-1)*52);
         if (tmp < 130)
            tmp = 130;
         this.currTblHeight = `${tmp}px`;
         console.log(`${window.innerHeight} - ${this.currTblHeight}`);
         utils.SaveToSessionStorage ("BBS_Editing_Event_Id", this.currTabella.id);
         if (this.currTabella.nome == "Società")
         {
            this.colonneDati = this.colSocieta;
            this.LoadTabellaSocieta();
         }
         else if (this.currTabella.nome == "Stagioni")
         {
            if (this.selSocieta == null)
            {
               okToGo = false;
               gotoId = 1;
               titolo = "Non è stata selezionata alcuna società";
               messaggio = "E' necessario selezionare una società";
            }
            if (okToGo)
            {
               this.colonneDati = this.colSeason;
               this.LoadTabellaStagioni ();
            }
         }
         else if (this.currTabella.nome == "Campionati")
         {
            if (this.selSocieta == null)
            {
               okToGo = false;
               gotoId = 1;
               titolo = "Non è stata selezionata alcuna società";
               messaggio = "E' necessario selezionare una società";
            }
            else if (this.selSeason == null)
            {
               okToGo = false;
               gotoId = 2;
               titolo = "Non è stata selezionata alcuna stagione";
               messaggio = "E' necessario selezionare una stagione";
            }
            if (okToGo)
            {
               this.colonneDati = this.colChamp;
               this.LoadTabellaCampionati();
            }
         }
         else if (this.currTabella.nome == "Fasi")
         {
            if (this.selSocieta == null)
            {
               okToGo = false;
               gotoId = 1;
               titolo = "Non è stata selezionata alcuna società";
               messaggio = "E' necessario selezionare una società";
            }
            else if (this.selSeason == null)
            {
               okToGo = false;
               gotoId = 2;
               titolo = "Non è stata selezionata alcuna stagione";
               messaggio = "E' necessario selezionare una stagione";
            }
            else if (this.selChamp == null)
            {
               okToGo = false;
               gotoId = 3;
               titolo = "Non è stato selezionato alcun Campionato";
               messaggio = "E' necessario selezionare un Campionato";
            }
            if (okToGo)
            {
               this.colonneDati = this.colPhase;
               this.LoadTabellaFasi();
            }
         }
         else if (this.currTabella.nome == "Squadre")
         {
            if (this.selSocieta == null)
            {
               okToGo = false;
               gotoId = 1;
               titolo = "Non è stata selezionata alcuna società";
               messaggio = "E' necessario selezionare una società";
            }
            else if (this.selSeason == null)
            {
               okToGo = false;
               gotoId = 2;
               titolo = "Non è stata selezionata alcuna stagione";
               messaggio = "E' necessario selezionare una stagione";
            }
            else if (this.selChamp == null)
            {
               okToGo = false;
               gotoId = 3;
               titolo = "Non è stato selezionato alcun Campionato";
               messaggio = "E' necessario selezionare un Campionato";
            }
            if (okToGo)
            {
               this.colonneDati = this.colTeam;
               this.LoadTabellaTeam();
            }
         }
         else if (this.currTabella.nome == "Giocatori")
         {
            if (this.selSocieta == null)
            {
               okToGo = false;
               gotoId = 1;
               titolo = "Non è stata selezionata alcuna società";
               messaggio = "E' necessario selezionare una società";
            }
            else if (this.selSeason == null)
            {
               okToGo = false;
               gotoId = 2;
               titolo = "Non è stata selezionata alcuna stagione";
               messaggio = "E' necessario selezionare una stagione";
            }
            else if (this.selChamp == null)
            {
               okToGo = false;
               gotoId = 3;
               titolo = "Non è stato selezionato alcun Campionato";
               messaggio = "E' necessario selezionare un Campionato";
            }
            else if (this.selTeam == null)
            {
               okToGo = false;
               gotoId = 4;
               titolo = "Non è stato selezionata alcuna Squadra";
               messaggio = "E' necessario selezionare una Squadra";
            }
            if (okToGo)
            {
               this.colonneDati = this.colPlayer;
               this.LoadTabellaPlayer();
            }
         }
         else
         {
            this.tabellaDati = [];
            this.colonneDati = [];
         }
         if (okToGo == false)
         {
            const dlgData: MessDlgData = {
               title:               'Selezione dati',
               subtitle:            titolo,
               message:             messaggio,
               messtype:            'warning',
               btncaption:          'Chiudi',
               showCancelButton:    false,
            };
            this.messageDialogService.showMessage (dlgData, '', true).subscribe (result =>
                                                                                 {
                                                                                    setTimeout (() =>
                                                                                                {
                                                                                                   this.currTabella = null;
                                                                                                   let currSelected = null;
                                                                                                   for (let i=0;   i<this.tabelle.length;   i++)
                                                                                                   {
                                                                                                      if (this.tabelle[i].id == gotoId)
                                                                                                      {
                                                                                                         currSelected = this.tabelle[i];
                                                                                                         break;
                                                                                                      }
                                                                                                   }
                                                                                                   if ((this.ptblTabelle) && (currSelected))
                                                                                                   {
                                                                                                      this.currTabella = currSelected;
                                                                                                      this.ptblTabelle.selection = this.currTabella;
                                                                                                      this.cdr.detectChanges();
                                                                                                      this.OnTabellaSelected({ data: this.currTabella });
                                                                                                   }
                                                                                                }, 100);
                                                                                 });
         }
      }
      else
      {
         this.tabellaDati = [];
         this.colonneDati = [];
      }
   }


   OnTabellaUnselect (evento: any)
   {
      if (this.selSocieta)
      {
         for (let iii=0;   iii<this.tabelle.length;   iii++)
         {
            if (this.tabelle[iii].id == evento.data.id)
            {
               this.tabelle[iii].selName = "";
               this.tabelle[iii].selId = 0;
            }
         }
      }
      this.tabellaDati = [];
      this.colonneDati = [];
   }


   OnDatiSelected (evento: any)
   {
      if ((this.currTabella != null) && (evento))
      {
         this.currDati = evento;
         if (this.currTabella.nome == "Società")
         {
            this.selSocieta = (this.currDati as Societa);
            this.currTabella.selName = this.selSocieta.nome;
         }
         else if (this.currTabella.nome == "Stagioni")
         {
            this.selSeason = (this.currDati as Season);
            this.currTabella.selName = this.selSeason.nome;
         }
         else if (this.currTabella.nome == "Campionati")
         {
            this.selChamp = (this.currDati as Champ);
            this.currTabella.selName = this.selChamp.nome;
         }
         else if (this.currTabella.nome == "Fasi")
         {
            this.selPhase = (this.currDati as Phase);
            this.currTabella.selName = this.selPhase.nome;
         }
         else if (this.currTabella.nome == "Squadre")
         {
            this.selTeam = (this.currDati as Team);
            this.currTabella.selName = this.selTeam.nome;
         }
         else if (this.currTabella.nome == "Giocatori")
         {
            this.selPlayer = (this.currDati as IPlayer);
            this.currTabella.selName = this.selPlayer.nomedisp;
            this.selId = this.selPlayer.id;
         }
         else
         {
         }
      }
      else
      {

      }
   }


   CurrSelTable(): string
   {
      if (this.currTabella != null)
      {
         return `<span class="white-text">Dati tabella </span><span class="highlight-text">${this.currTabella.nome}</span>`;
      }
      else
      {
         //return `<span class="white-text">Nessuna tabella selezionata</span>`;
         return `Nessuna tabella selezionata`;
      }
   }


   AddData (): void
   {
      let currId: number = 0;
      let currName: string = "";
      let nomeTabella: string = "";
      let servToUse: any = null;
      if (this.currTabella == null)
         return;
      if (this.currTabella.nome == "Società")
      {
         this.dialogOperation = "ADD";
         servToUse = this.servSocieta;
         this.dialogVisible_Societa = true;
         this.dialogTitle = "Società";
         this.dialogOperazione = "Nuova società";
         this.dialogError = false;
         this.dialogErrorMessage = "";
         this.dialogValue_Nome = "";
      }
      else if (this.currTabella.nome == "Stagioni")
      {
         this.dialogOperation = "ADD";
         servToUse = this.servSeason;
         this.dialogVisible_Season = true;
         this.dialogTitle = "Statione";
         this.dialogOperazione = "Nuova stagione";
         this.dialogError = false;
         this.dialogErrorMessage = "";
         this.dialogValue_Nome = "";
         this.dialogValue_Abbrev = "";
      }
      else if (this.currTabella.nome == "Campionati")
      {
         this.dialogOperation = "ADD";
         servToUse = this.servChamp;
         this.dialogVisible_Champ = true;
         this.dialogTitle = "Campionato";
         this.dialogOperazione = "Nuovo campionato";
         this.dialogError = false;
         this.dialogErrorMessage = "";
         this.dialogValue_Nome = "";
         this.dialogValue_Abbrev = "";
      }
      else if (this.currTabella.nome == "Fasi")
      {
         this.dialogOperation = "ADD";
         servToUse = this.servPhase;
         this.dialogVisible_Phase = true;
         this.dialogTitle = "Fase";
         this.dialogOperazione = "Nuova fase";
         this.dialogError = false;
         this.dialogErrorMessage = "";
         this.dialogValue_Nome = "";
         this.dialogValue_Abbrev = "";
      }
      else if (this.currTabella.nome == "Squadre")
      {
         this.dialogOperation = "ADD";
         servToUse = this.servPhase;
         this.dialogVisible_Team = true;
         this.dialogTitle = "Squadra";
         this.dialogOperazione = "Nuova squadra";
         this.dialogError = false;
         this.dialogErrorMessage = "";
         this.dialogValue_Nome = "";
         this.dialogValue_Abbrev = "";
         this.dialogValue_Logo = "";
      }
      else if (this.currTabella.nome == "Giocatori")
      {
         servToUse = this.servPlayer;
         this.dialogTitle = "Giocatore";
         this.dialogOperazione = "Nuovo giocatore";
         this.dialogError = false;
         this.dialogErrorMessage = "";
         this.dialogValue_Nome = "";
         this.dialogValue_Anno = 0;
         this.dialogValue_Ruolo = "";
         this.dialogValue_Numero = "";
         this.dialogValue_Altezza = 0;
         this.dialogOperation = "ADD";
         this.dialogVisible_Player = true;
      }
      else
      {
      }
   }


   EditData (): void
   {
      let currId: number = 0;
      let currName: string = "";
      let nomeTabella: string = "";
      let servToUse: any = null;
      if ((this.currTabella == null) || (this.currDati == null))
         return;
      if ((this.currTabella != null) && (this.currTabella.id < 1))
         return;
      if (this.currTabella.nome == "Società")
      {
         this.dialogOperation = "EDIT";
         servToUse = this.servSocieta;
         this.dialogVisible_Societa = true;
         this.dialogTitle = "Società";
         this.dialogOperazione = "Modifica società";
         this.dialogError = false;
         this.dialogErrorMessage = "";
         this.selSocieta = (this.currDati as Societa);
         this.selId = this.selSocieta.id;
         this.dialogValue_Nome = this.selSocieta.nome;
      }
      else if (this.currTabella.nome == "Stagioni")
      {
         this.dialogOperation = "EDIT";
         servToUse = this.servSeason;
         this.dialogVisible_Season = true;
         this.dialogTitle = "Statione";
         this.dialogOperazione = "Modifica stagione";
         this.dialogError = false;
         this.dialogErrorMessage = "";
         this.selSeason = (this.currDati as Season);
         this.selId = this.selSeason.id;
         this.dialogValue_Nome = this.selSeason.nome;
         this.dialogValue_Abbrev = this.selSeason.abbrev;
      }
      else if (this.currTabella.nome == "Campionati")
      {
         this.dialogOperation = "EDIT";
         servToUse = this.servChamp;
         this.dialogVisible_Champ = true;
         this.dialogTitle = "Campionato";
         this.dialogOperazione = "Modifica campionato";
         this.dialogError = false;
         this.dialogErrorMessage = "";
         this.selChamp = (this.currDati as Champ);
         this.selId = this.selChamp.id;
         this.dialogValue_Nome = this.selChamp.nome;
         this.dialogValue_Abbrev = this.selChamp.abbrev;
      }
      else if (this.currTabella.nome == "Fasi")
      {
         this.dialogOperation = "EDIT";
         servToUse = this.servPhase;
         this.dialogVisible_Phase = true;
         this.dialogTitle = "Fase";
         this.dialogOperazione = "Modifica fase";
         this.dialogError = false;
         this.dialogErrorMessage = "";
         this.selPhase = (this.currDati as Phase);
         this.selId = this.selPhase.id;
         this.dialogValue_Nome = this.selPhase.nome;
         this.dialogValue_Abbrev = this.selPhase.abbrev;
      }
      else if (this.currTabella.nome == "Squadre")
      {
         this.dialogOperation = "EDIT";
         servToUse = this.servPhase;
         this.dialogVisible_Team = true;
         this.dialogTitle = "Squadra";
         this.dialogOperazione = "Modifica squadra";
         this.dialogError = false;
         this.dialogErrorMessage = "";
         this.selTeam = (this.currDati as Team);
         this.selId = this.selTeam.id;
         this.dialogValue_Nome = this.selTeam.nome;
         this.dialogValue_Abbrev = this.selTeam.abbrev;
         this.dialogValue_Logo = this.selTeam.logo;
      }
      else if (this.currTabella.nome == "Giocatori")
      {
         this.dialogOperation = "EDIT";
         servToUse = this.servPlayer;
         this.dialogTitle = "Giocatore";
         this.dialogOperazione = "Modifica giocatore";
         this.dialogError = false;
         this.dialogErrorMessage = "";
         this.selPlayer = (this.currDati as IPlayer);
         this.selId = this.selPlayer.id;
         this.dialogValue_Nome = this.selPlayer.nomedisp;
         this.dialogValue_Anno = this.selPlayer.anno;
         this.dialogValue_Ruolo = this.selPlayer.ruolo;
         this.dialogValue_Numero = this.selPlayer.numero;
         this.dialogValue_Altezza = this.selPlayer.altezza;
         this.dialogOperation = "EDIT";
         this.dialogVisible_Player = true;
      }
      else
      {
      }
   }


   DeleteData (): void
   {
      let currId: number = 0;
      let currName: string = "";
      let nomeTabella: string = "";
      let servToUse: any = null;
      if ((this.currTabella == null) || (this.currDati == null))
         return;
      if (this.currTabella.nome == "Società")
      {
         this.selSocieta = (this.currDati as Societa);
         currId = Number(this.selSocieta.id);
         currName = this.selSocieta.nome;
         nomeTabella = "la Società";
         servToUse = this.servSocieta;
      }
      else if (this.currTabella.nome == "Stagioni")
      {
         this.selSeason = (this.currDati as Season);
         currId = this.selSeason.id;
         currName = this.selSeason.nome;
         nomeTabella = "la SStagione";
         servToUse = this.servSeason;
      }
      else if (this.currTabella.nome == "Campionati")
      {
         this.selChamp = (this.currDati as Champ);
         currId = this.selChamp.id;
         currName = this.selChamp.nome;
         nomeTabella = "il Campionato";
         servToUse = this.servChamp;
      }
      else if (this.currTabella.nome == "Fasi")
      {
         this.selPhase = (this.currDati as Phase);
         currId = this.selPhase.id;
         currName = this.selPhase.nome;
         nomeTabella = "la Fase";
         servToUse = this.servPhase;
      }
      else if (this.currTabella.nome == "Squadre")
      {
         this.selTeam = (this.currDati as Team);
         currId = this.selTeam.id;
         currName = this.selTeam.nome;
         nomeTabella = "la Fase";
         servToUse = this.servPhase;
      }
      else if (this.currTabella.nome == "Giocatori")
      {
         this.selPlayer = (this.currDati as IPlayer);
         currId = this.selPlayer.id;
         currName = this.selPlayer.nomedisp;
         nomeTabella = "il Giocatore";
         servToUse = this.servPlayer;
      }
      else if (this.currTabella.nome == "Allenatori")
      {
      }
      else
      {
      }
      const dlgData: MessDlgData = {
         title:               'Cancellazione',
         subtitle:            '',
         message:             `Sei veramente sicuro di voloer cancellare ${nomeTabella} '<b>${currName}</b>' dal database?`,
         messtype:            'warning',
         btncaption:          'Annulla',
         showCancelButton:    true,
         cancelButtonCaption: 'Sì, procedi'
      };
      this.messageDialogService.showMessage (dlgData, '', true).subscribe (result =>
                                                                           {
                                                                              if (result === 'secondary')
                                                                              {
                                                                                 if (this.currTabella?.nome == "Società")
                                                                                 {
                                                                                    this.DeleteSocieta(currId);
                                                                                 }
                                                                                 if (this.currTabella?.nome == "Stagioni")
                                                                                 {
                                                                                    this.DeleteStagione(currId);
                                                                                 }
                                                                                 if (this.currTabella?.nome == "Campionati")
                                                                                 {
                                                                                    this.DeleteChamp(currId);
                                                                                 }
                                                                                 if (this.currTabella?.nome == "Fasi")
                                                                                 {
                                                                                    this.DeletePhase(currId);
                                                                                 }
                                                                                 if (this.currTabella?.nome == "Squadre")
                                                                                 {
                                                                                    this.DeleteTeam(currId);
                                                                                 }
                                                                                 if (this.currTabella?.nome == "Giocatori")
                                                                                 {
                                                                                    this.DeletePlayer(currId);
                                                                                 }
                                                                                 if (this.currTabella?.nome == "Allenatori")
                                                                                 {
                                                                                    //this.DeleteCoach(currId);
                                                                                 }
                                                                              }
                                                                           });
   }


   DeleteSocieta (id: number)
   {
      this.servSocieta.DeleteData (id).subscribe (data =>
                                                {
                                                   if (data)
                                                   {
                                                      if (data.ok)
                                                      {
                                                         this.LoadTabellaSocieta();
                                                      }
                                                      else
                                                      {
                                                         const dlgData: MessDlgData = {
                                                            title:      'ERRORE',
                                                            subtitle:   'Errore durante la cancellazione del dato',
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
                                                         subtitle:   'Errore durante la cancellazione del dato',
                                                         message:    `Nessun dato ritornato`,
                                                         messtype:   'error',
                                                         btncaption: 'Chiudi'
                                                      };
                                                      this.messageDialogService.showMessage (dlgData, '600px');
                                                   }
                                                   this.isLoading = false;
                                                })
   }


   DeleteStagione (id: number)
   {
      this.servSeason.DeleteData (id).subscribe (data =>
                                                  {
                                                     if (data)
                                                     {
                                                        if (data.ok)
                                                        {
                                                           this.LoadTabellaStagioni();
                                                        }
                                                        else
                                                        {
                                                           const dlgData: MessDlgData = {
                                                              title:      'ERRORE',
                                                              subtitle:   'Errore durante la cancellazione del dato',
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
                                                           subtitle:   'Errore durante la cancellazione del dato',
                                                           message:    `Nessun dato ritornato`,
                                                           messtype:   'error',
                                                           btncaption: 'Chiudi'
                                                        };
                                                        this.messageDialogService.showMessage (dlgData, '600px');
                                                     }
                                                     this.isLoading = false;
                                                  })
   }


   DeleteChamp (id: number)
   {
      this.servChamp.DeleteData (id).subscribe (data =>
                                                 {
                                                    if (data)
                                                    {
                                                       if (data.ok)
                                                       {
                                                          this.LoadTabellaCampionati();
                                                       }
                                                       else
                                                       {
                                                          const dlgData: MessDlgData = {
                                                             title:      'ERRORE',
                                                             subtitle:   'Errore durante la cancellazione del dato',
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
                                                          subtitle:   'Errore durante la cancellazione del dato',
                                                          message:    `Nessun dato ritornato`,
                                                          messtype:   'error',
                                                          btncaption: 'Chiudi'
                                                       };
                                                       this.messageDialogService.showMessage (dlgData, '600px');
                                                    }
                                                    this.isLoading = false;
                                                 })
   }


   DeletePhase (id: number)
   {
      this.servPhase.DeleteData (id).subscribe (data =>
                                                {
                                                   if (data)
                                                   {
                                                      if (data.ok)
                                                      {
                                                         this.LoadTabellaFasi();
                                                      }
                                                      else
                                                      {
                                                         const dlgData: MessDlgData = {
                                                            title:      'ERRORE',
                                                            subtitle:   'Errore durante la cancellazione del dato',
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
                                                         subtitle:   'Errore durante la cancellazione del dato',
                                                         message:    `Nessun dato ritornato`,
                                                         messtype:   'error',
                                                         btncaption: 'Chiudi'
                                                      };
                                                      this.messageDialogService.showMessage (dlgData, '600px');
                                                   }
                                                   this.isLoading = false;
                                                })
   }


   DeleteTeam (id: number)
   {
      this.servTeam.DeleteData (id).subscribe (data =>
                                                {
                                                   if (data)
                                                   {
                                                      if (data.ok)
                                                      {
                                                         this.LoadTabellaTeam();
                                                      }
                                                      else
                                                      {
                                                         const dlgData: MessDlgData = {
                                                            title:      'ERRORE',
                                                            subtitle:   'Errore durante la cancellazione del dato',
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
                                                         subtitle:   'Errore durante la cancellazione del dato',
                                                         message:    `Nessun dato ritornato`,
                                                         messtype:   'error',
                                                         btncaption: 'Chiudi'
                                                      };
                                                      this.messageDialogService.showMessage (dlgData, '600px');
                                                   }
                                                   this.isLoading = false;
                                                })
   }


   DeletePlayer (id: number)
   {
      this.servPlayer.DeleteData (id).subscribe (data =>
                                                {
                                                   if (data)
                                                   {
                                                      if (data.ok)
                                                      {
                                                         this.LoadTabellaPlayer();
                                                      }
                                                      else
                                                      {
                                                         const dlgData: MessDlgData = {
                                                            title:      'ERRORE',
                                                            subtitle:   'Errore durante la cancellazione del dato',
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
                                                         subtitle:   'Errore durante la cancellazione del dato',
                                                         message:    `Nessun dato ritornato`,
                                                         messtype:   'error',
                                                         btncaption: 'Chiudi'
                                                      };
                                                      this.messageDialogService.showMessage (dlgData, '600px');
                                                   }
                                                   this.isLoading = false;
                                                })
   }


   async DialogAnnulla(senderName: string)
   {
      this.dialogVisible_Societa = false;
      this.dialogVisible_Season = false;
      this.dialogVisible_Champ = false;
      this.dialogVisible_Phase = false;
      this.dialogVisible_Team = false;
      this.dialogVisible_Player = false;
   }


   async DialogSalva(senderName: string)
   {
      this.dialogVisible_Societa = false;
      this.dialogVisible_Season = false;
      this.dialogVisible_Champ = false;
      this.dialogVisible_Phase = false;
      this.dialogVisible_Team = false;
      this.dialogVisible_Player = false;
      //
      try
      {
         if (senderName == "tenant")
         {
            if (this.dialogOperation == "ADD")
            {
               if (this.selSocieta)
               {
                  const response = await firstValueFrom (this.servSocieta.addNewData(this.dialogValue_Nome));
                  if (response.ok)
                  {
                     //await this.logService.AddToLog (loggedUser, `Aggiunto Nuovo Player `);
                     await this.LoadTabellaSocieta();
                  }
                  else
                  {
                     const dlgData: MessDlgData = {
                        title:      'ERRORE',
                        subtitle:   "Errore nella modifica dei dati",
                        message:    `${response.message}`,
                        messtype:   'error',
                        btncaption: 'Chiudi'
                     };
                     this.messageDialogService.showMessage (dlgData, '600px');
                  }
                  this.cdr.detectChanges ();
               }
            }
            if (this.dialogOperation == "EDIT")
            {
               if (this.selId > 0)
               {
                  const response = await firstValueFrom (this.servSocieta.updateData(this.selId, this.dialogValue_Nome));
                  if (response.ok)
                  {
                     await this.LoadTabellaSocieta();
                     this.cdr.detectChanges ();
                     this.selSocieta = (this.tabellaDati.find(item => item.id === this.selId) as Societa) || null;
                     if (this.selSocieta)
                     {
                        this.selSocieta.nome = this.dialogValue_Nome;
                        console.log (this.selSocieta.nome);
                        await this.SetSerlectedValueTo (this.selSocieta.nome);
                     }
                  }
                  else
                  {
                     const dlgData: MessDlgData = {
                        title:      'ERRORE',
                        subtitle:   "Errore nella modifica dei dati",
                        message:    `${response.message}`,
                        messtype:   'error',
                        btncaption: 'Chiudi'
                     };
                     this.messageDialogService.showMessage (dlgData, '600px');
                  }
                  this.cdr.detectChanges ();
               }
            }
         }
         if (senderName == "season")
         {
            if (this.dialogOperation == "ADD")
            {
               if (this.selSocieta)
               {
                  const response = await firstValueFrom (this.servSeason.addNewData(this.dialogValue_Nome, this.dialogValue_Abbrev, this.selSocieta.id));
                  if (response.ok)
                  {
                     //await this.logService.AddToLog (loggedUser, `Aggiunto Nuovo Player `);
                     await this.LoadTabellaStagioni();
                  }
                  else
                  {
                     const dlgData: MessDlgData = {
                        title:      'ERRORE',
                        subtitle:   "Errore nella modifica dei dati",
                        message:    `${response.message}`,
                        messtype:   'error',
                        btncaption: 'Chiudi'
                     };
                     this.messageDialogService.showMessage (dlgData, '600px');
                  }
                  this.cdr.detectChanges ();
               }
            }
            if (this.dialogOperation == "EDIT")
            {
               if ((this.selSocieta) && (this.selId > 0))
               {
                  const response = await firstValueFrom (this.servSeason.updateData(this.selId, this.dialogValue_Nome, this.dialogValue_Abbrev, this.selSocieta.id));
                  if (response.ok)
                  {
                     await this.LoadTabellaStagioni();
                     this.cdr.detectChanges ();
                     this.selSeason = (this.tabellaDati.find(item => item.id === this.selId) as Season) || null;
                     if (this.selSeason)
                     {
                        this.selSeason.nome = this.dialogValue_Nome;
                        console.log (this.selSeason.nome);
                        await this.SetSerlectedValueTo (this.selSeason.nome);
                     }
                  }
                  else
                  {
                     const dlgData: MessDlgData = {
                        title:      'ERRORE',
                        subtitle:   "Errore nella modifica dei dati",
                        message:    `${response.message}`,
                        messtype:   'error',
                        btncaption: 'Chiudi'
                     };
                     this.messageDialogService.showMessage (dlgData, '600px');
                  }
                  this.cdr.detectChanges ();
               }
            }
         }
         if (senderName == "champ")
         {
            if (this.dialogOperation == "ADD")
            {
               if (this.selSeason)
               {
                  const response = await firstValueFrom (this.servChamp.addNewData(this.dialogValue_Nome, this.dialogValue_Abbrev, this.selSeason.id));
                  if (response.ok)
                  {
                     //await this.logService.AddToLog (loggedUser, `Aggiunto Nuovo Player `);
                     await this.LoadTabellaCampionati();
                  }
                  else
                  {
                     const dlgData: MessDlgData = {
                        title:      'ERRORE',
                        subtitle:   "Errore nella modifica dei dati",
                        message:    `${response.message}`,
                        messtype:   'error',
                        btncaption: 'Chiudi'
                     };
                     this.messageDialogService.showMessage (dlgData, '600px');
                  }
                  this.cdr.detectChanges ();
               }
            }
            if (this.dialogOperation == "EDIT")
            {
               if ((this.selSeason) && (this.selId > 0))
               {
                  const response = await firstValueFrom (this.servChamp.updateData(this.selId, this.dialogValue_Nome, this.dialogValue_Abbrev, this.selSeason.id));
                  if (response.ok)
                  {
                     await this.LoadTabellaCampionati();
                     this.cdr.detectChanges ();
                     this.selChamp = (this.tabellaDati.find(item => item.id === this.selId) as Champ) || null;
                     if (this.selChamp)
                     {
                        this.selChamp.nome = this.dialogValue_Nome;
                        console.log (this.selChamp.nome);
                        await this.SetSerlectedValueTo (this.selChamp.nome);
                     }
                  }
                  else
                  {
                     const dlgData: MessDlgData = {
                        title:      'ERRORE',
                        subtitle:   "Errore nella modifica dei dati",
                        message:    `${response.message}`,
                        messtype:   'error',
                        btncaption: 'Chiudi'
                     };
                     this.messageDialogService.showMessage (dlgData, '600px');
                  }
                  this.cdr.detectChanges ();
               }
            }
         }
         if (senderName == "phase")
         {
            if (this.dialogOperation == "ADD")
            {
               if (this.selChamp)
               {
                  this.dialogValue_Logo = "";
                  const response = await firstValueFrom (this.servPhase.addNewData(this.dialogValue_Nome, this.dialogValue_Abbrev, this.dialogValue_Logo, this.selChamp.id));
                  if (response.ok)
                  {
                     //await this.logService.AddToLog (loggedUser, `Aggiunto Nuovo Player `);
                     await this.LoadTabellaFasi();
                  }
                  else
                  {
                     const dlgData: MessDlgData = {
                        title:      'ERRORE',
                        subtitle:   "Errore nella modifica dei dati",
                        message:    `${response.message}`,
                        messtype:   'error',
                        btncaption: 'Chiudi'
                     };
                     this.messageDialogService.showMessage (dlgData, '600px');
                  }
                  this.cdr.detectChanges ();
               }
            }
            if (this.dialogOperation == "EDIT")
            {
               this.dialogValue_Logo = "";
               if ((this.selChamp) && (this.selId > 0))
               {
                  const response = await firstValueFrom (this.servPhase.updateData(this.selId, this.dialogValue_Nome, this.dialogValue_Abbrev, this.dialogValue_Logo, this.selChamp.id));
                  if (response.ok)
                  {
                     await this.LoadTabellaFasi();
                     this.cdr.detectChanges ();
                     this.selPhase = (this.tabellaDati.find(item => item.id === this.selId) as Phase) || null;
                     if (this.selPhase)
                     {
                        this.selPhase.nome = this.dialogValue_Nome;
                        console.log (this.selPhase.nome);
                        await this.SetSerlectedValueTo (this.selPhase.nome);
                     }
                  }
                  else
                  {
                     const dlgData: MessDlgData = {
                        title:      'ERRORE',
                        subtitle:   "Errore nella modifica dei dati",
                        message:    `${response.message}`,
                        messtype:   'error',
                        btncaption: 'Chiudi'
                     };
                     this.messageDialogService.showMessage (dlgData, '600px');
                  }
                  this.cdr.detectChanges ();
               }
            }
         }
         if (senderName == "team")
         {
            if (this.dialogOperation == "ADD")
            {
               if (this.selChamp)
               {
                  const response = await firstValueFrom (this.servTeam.addNewData(this.dialogValue_Nome, this.dialogValue_Abbrev, this.dialogValue_Logo, this.selChamp.id));
                  if (response.ok)
                  {
                     //await this.logService.AddToLog (loggedUser, `Aggiunto Nuovo Player `);
                     await this.LoadTabellaTeam();
                  }
                  else
                  {
                     const dlgData: MessDlgData = {
                        title:      'ERRORE',
                        subtitle:   "Errore nella modifica dei dati",
                        message:    `${response.message}`,
                        messtype:   'error',
                        btncaption: 'Chiudi'
                     };
                     this.messageDialogService.showMessage (dlgData, '600px');
                  }
                  this.cdr.detectChanges ();
               }
            }
            if (this.dialogOperation == "EDIT")
            {
               if ((this.selChamp) && (this.selId > 0))
               {
                  const response = await firstValueFrom (this.servTeam.updateData(this.selId, this.dialogValue_Nome, this.dialogValue_Abbrev, this.dialogValue_Logo, this.selChamp.id));
                  if (response.ok)
                  {
                     await this.LoadTabellaTeam();
                     this.cdr.detectChanges ();
                     this.selTeam = (this.tabellaDati.find(item => item.id === this.selId) as Team) || null;
                     if (this.selTeam)
                     {
                        this.selTeam.nome = this.dialogValue_Nome;
                        console.log (this.selTeam.nome);
                        await this.SetSerlectedValueTo (this.selTeam.nome);
                     }
                  }
                  else
                  {
                     const dlgData: MessDlgData = {
                        title:      'ERRORE',
                        subtitle:   "Errore nella modifica dei dati",
                        message:    `${response.message}`,
                        messtype:   'error',
                        btncaption: 'Chiudi'
                     };
                     this.messageDialogService.showMessage (dlgData, '600px');
                  }
                  this.cdr.detectChanges ();
               }
            }
         }
         if (senderName == "player")
         {
            if (this.dialogOperation == "ADD")
            {
               if (this.selTeam)
               {
                  const response = await firstValueFrom (this.servPlayer.addNewData ("", "", this.dialogValue_Nome, this.dialogValue_Anno, this.dialogValue_Ruolo, this.dialogValue_Numero, this.dialogValue_Altezza, "", this.selTeam.id));
                  if (response.ok)
                  {
                     //await this.logService.AddToLog (loggedUser, `Aggiunto Nuovo Player `);
                     this.LoadTabellaPlayer ();
                  }
                  else
                  {
                     const dlgData: MessDlgData = {
                        title:      'ERRORE',
                        subtitle:   "Errore nell'inserimento dei dati",
                        message:    `${response.message}`,
                        messtype:   'error',
                        btncaption: 'Chiudi'
                     };
                     this.messageDialogService.showMessage (dlgData, '600px');
                  }
                  this.cdr.detectChanges ();
               }
            }
            if (this.dialogOperation == "EDIT")
            {
               if ((this.selTeam) && (this.selId > 0))
               {
                  const response = await firstValueFrom (this.servPlayer.updateData(this.selId, "", "", this.dialogValue_Nome, this.dialogValue_Anno, this.dialogValue_Ruolo, this.dialogValue_Numero, this.dialogValue_Altezza, "", this.selTeam.id));
                  if (response.ok)
                  {
                     //await this.logService.AddToLog (loggedUser, `Aggiunto Nuovo Player `);
                     this.LoadTabellaPlayer ();
                  }
                  else
                  {
                     const dlgData: MessDlgData = {
                        title:      'ERRORE',
                        subtitle:   "Errore nella modifica dei dati",
                        message:    `${response.message}`,
                        messtype:   'error',
                        btncaption: 'Chiudi'
                     };
                     this.messageDialogService.showMessage (dlgData, '600px');
                  }
                  this.cdr.detectChanges ();
               }
            }
         }
         if (senderName == "coach")
         {
            if (this.dialogOperation == "ADD")
            {
            }
            if (this.dialogOperation == "EDIT")
            {

            }
         }
      }
      catch (e)
      {
         console.error (JSON.stringify(e,null,3));
      }
   }


   async SetSerlectedValueTo (aValue: string)
   {
      if (this.currTabella)
      {
         this.currTabella.selName = aValue;
      }
      this.cdr.detectChanges ();
   }

}



