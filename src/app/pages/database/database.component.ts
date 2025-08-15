import {
   ChangeDetectorRef,
   ChangeDetectionStrategy,
   Component,
   OnInit, ViewChild
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
   Phase, Team
} from "../../models/datamod";
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
                 DividerModule
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
      { field: 'nome', header: 'Nome' }
   ]
   colSeason: any[] = [
      { field: 'nome', header: 'Nome' },
      { field: 'abbrev', header: 'Abbr.' }
   ]
   colChamp: any[] = [
      { field: 'nome', header: 'Nome' },
      { field: 'abbrev', header: 'Abbr.' }
   ]
   colPhase: any[] = [
      { field: 'nome', header: 'Nome' },
      { field: 'abbrev', header: 'Abbr.' },
      { field: 'exportfolder', header: 'Exp. Fldr.' }
   ]
   colTeam: any[] = [
      { field: 'nome', header: 'Nome' },
      { field: 'abbrev', header: 'Abbr.' }
   ]
   //
   selSocieta: Societa | null = null;
   selSeason: Season | null = null;
   selChamp: Champ | null = null;
   selPhase: Phase | null = null;
   selTeam: Team | null = null;
   //
   vertDataPositions: string[] = ['0px', '52px', '104px', '156px', '208px', '260px', '312px'];
   currVertPos: string = this.vertDataPositions[0];

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


   LoadTabellaStagioni()
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
      if (this.selSeason)
         champId = this.selSeason.id;
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
         this.router.navigate ([`/societaedit`], {state: {id: 0}});
      }
      if (this.currTabella.nome == "Stagioni")
      {
         this.router.navigate ([`/seasonedit`], {state: {id: 0, tenantId: this.selSocieta?.id}});
      }
      if (this.currTabella.nome == "Campionati")
      {
         this.router.navigate ([`/champedit`], {state: {id: 0, seasonId: this.selSeason?.id}});
      }
      if (this.currTabella.nome == "Fasi")
      {
         this.router.navigate ([`/phaseedit`], {state: {id: 0, champId: this.selPhase?.id}});
      }
      if (this.currTabella.nome == "Squadre")
      {
         this.router.navigate ([`/teamedit`], {state: {id: 0, champId: this.selTeam?.id}});
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
         this.selSocieta = (this.currDati as Societa);
         currId = Number(this.selSocieta.id);
         currName = this.selSocieta.nome;
         nomeTabella = "la Società";
         servToUse = this.servSocieta;
         this.router.navigate ([`/societaedit`], {state: {id: currId}});
      }
      else if (this.currTabella.nome == "Stagioni")
      {
         this.selSeason = (this.currDati as Season);
         currId = this.selSeason.id;
         currName = this.selSeason.nome;
         nomeTabella = "la Stagione";
         servToUse = this.servSeason;
         this.router.navigate ([`/seasonedit`], {state: {id: currId}});
      }
      else if (this.currTabella.nome == "Campionati")
      {
         this.selChamp = (this.currDati as Champ);
         currId = this.selChamp.id;
         currName = this.selChamp.nome;
         nomeTabella = "il Campionato";
         servToUse = this.servChamp;
         this.router.navigate ([`/champedit`], {state: {id: currId}});
      }
      else if (this.currTabella.nome == "Fasi")
      {
         this.selPhase = (this.currDati as Phase);
         currId = this.selPhase.id;
         currName = this.selPhase.nome;
         nomeTabella = "la Fase";
         servToUse = this.servPhase;
         this.router.navigate ([`/phaseedit`], {state: {id: currId}});
      }
      else if (this.currTabella.nome == "Squadre")
      {
         this.selTeam = (this.currDati as Team);
         currId = this.selTeam.id;
         currName = this.selTeam.nome;
         nomeTabella = "la Squadra";
         servToUse = this.servPhase;
         this.router.navigate ([`/teamedit`], {state: {id: currId}});
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


}

