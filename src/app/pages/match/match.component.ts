// angular
import {
   AfterViewInit, ChangeDetectorRef,
   Component,
   ComponentRef,
   ElementRef,
   HostListener,
   NgZone,
   OnDestroy,
   OnInit,
   ViewChild,
   ViewContainerRef
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Router,
   RouterLink} from "@angular/router";
import {firstValueFrom,
         Subscription} from "rxjs";

// primeng
import {Table,
   TableModule} from 'primeng/table';
import {DataViewModule} from "primeng/dataview";
import {ButtonModule} from "primeng/button";
import {TooltipModule} from 'primeng/tooltip';
import {CardModule} from 'primeng/card';
import {DropdownModule} from "primeng/dropdown";
import {CalendarModule} from "primeng/calendar";
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import {TabViewChangeEvent, TabViewModule} from 'primeng/tabview';
import { MenuItem } from 'primeng/api';
import {
   IDSChamp,
   IDSMatchHeaderDb,
   IDSMatchHeader,
   MessDlgData,
   IDSPhase,
   IDSSeason,
   IDSSocieta,
   CreateEmptyMatchHeader,
   IDSTeam,
   TDSMatchRoster,
   TDSCoach,
   TDSPlayer,
   TMatchTeam, TMatchPlayer, TFallo, TRealizzazione, TTipoRealizzazione
} from "../../models/datamod";
import {BlockUIModule} from "primeng/blockui";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {DividerModule} from 'primeng/divider';
import {CheckboxModule} from "primeng/checkbox";
import {DialogModule} from 'primeng/dialog';
import {DialogService,
   DynamicDialogModule,
   DynamicDialogRef} from 'primeng/dynamicdialog';
import {TimerCompComponent} from "../../common/timer-comp/timer-comp.component";
import {SyncBadgeComponent} from "../../common/sync-badge/sync-badge.component";
import {PlayerCompComponent} from "../../common/player-comp/player-comp.component";
import {TeamCompComponent} from "../../common/team-comp/team-comp.component";
import {BenchCompComponent} from "../../common/bench-comp/bench-comp.component";
import {PointsCompComponent} from "../../common/points-comp/points-comp.component";
import {DataCompComponent} from "../../common/data-comp/data-comp.component";
import {MatchheaderCompComponent} from "../../common/matchheader-comp/matchheader-comp.component";
import {MenuModule} from "primeng/menu";
import {InputTextModule} from "primeng/inputtext";
import {InputMaskModule} from "primeng/inputmask";
import {PlayersCompComponent} from "../../common/players-comp/players-comp.component";
import {RosterCompComponent} from "../../common/roster-comp/roster-comp.component";
import {ActivatedRoute} from "@angular/router";
import {globs, matchStatusType, utils} from "../../common/utils";
import {SeasonsService} from "../../services/seasons.service";
import {SocietaService} from "../../services/societa.service";
import {CampionatiService} from "../../services/campionati.service";
import {PhaseService} from "../../services/phase.service";
import {MessageDialogService} from "../../services/message-dialog.service";
import {MatchheaderService} from "../../services/matchheader.service";
import {LogService} from "../../services/log.service";
import {TeamService} from "../../services/team.service";
import {MatchrosterService} from "../../services/matchroster.service";
import {PlayerService} from "../../services/player.service";
import {CoachService} from "../../services/coach.service";
import {
   matchGlobs, TCurrMatch,
   TSavedMatch
} from "../../common/curr-match";
import {PlayerEditCompComponent} from "../../common/player-edit-comp/player-edit-comp.component";
import { FalloDlgComponent } from "../../dialogs/fallo-dlg/fallo-dlg.component";
import { SostituzioneCompComponent } from "../../common/sostituzione-comp/sostituzione-comp.component";
import { AzioniDlgComponent } from "../../dialogs/azioni-dlg/azioni-dlg.component";
import { TempiGiocoDlgComponent } from "../../dialogs/tempi-gioco-dlg/tempi-gioco-dlg.component";
import { FalliTotaliDlgComponent } from "../../dialogs/falli-totali-dlg/falli-totali-dlg.component";
import { NumeriNomiDlgComponent } from "../../dialogs/numeri-nomi-dlg/numeri-nomi-dlg.component";
import { TOperation, TOperationList, TOperationType } from "../../common/operation";
import { MatchSyncService } from "../../services/match-sync.service";



@Component({
  selector:    'app-match',
  standalone:  true,
              imports: [
                 TableModule,
                 FormsModule,
                 CommonModule,
                 ButtonModule,
                 TooltipModule,
                 CardModule,
                 DropdownModule,
                 BlockUIModule,
                 ProgressSpinnerModule,
                 DividerModule,
                 CheckboxModule,
                 DialogModule,
                 DynamicDialogModule,
                 DataViewModule,
                 TabViewModule,
                 TimerCompComponent,
                 SyncBadgeComponent,
                 PlayerCompComponent,
                 TeamCompComponent,
                 BenchCompComponent,
                 PointsCompComponent,
                 DataCompComponent,
                 MatchheaderCompComponent,
                 MenuModule,
                 RouterLink,
                 InputTextModule,
                 InputMaskModule,
                 CalendarModule,
                 PlayersCompComponent,
                 RosterCompComponent,
                 MenuModule,
                 PlayerEditCompComponent,
                 FalloDlgComponent,
                 SostituzioneCompComponent,
                 AzioniDlgComponent,
                 TempiGiocoDlgComponent,
                 FalliTotaliDlgComponent,
                 NumeriNomiDlgComponent,
                 ToastModule
              ],
  providers: [
     DialogService, // Fornisci il servizio per DynamicDialog
     MessageService // Opzionale, per i messaggi
  ],
  templateUrl: './match.component.html',
  styleUrl:    './match.component.css'
})
export class MatchComponent implements OnInit, OnDestroy, AfterViewInit
{
   @ViewChild(MatchheaderCompComponent) matchHeaderComp!: MatchheaderCompComponent;
   @ViewChild(RosterCompComponent) matchRosterComp!: RosterCompComponent;
   @ViewChild(PlayersCompComponent) playersComp!: PlayersCompComponent;
   @ViewChild(FalloDlgComponent) playerFalliComp!: FalloDlgComponent;
   @ViewChild(SostituzioneCompComponent) sostituzioneComp!: SostituzioneCompComponent;
   @ViewChild(TempiGiocoDlgComponent) tempiGiocoComp!: TempiGiocoDlgComponent;
   @ViewChild(FalliTotaliDlgComponent) falliTotaliComp!: FalliTotaliDlgComponent;
   @ViewChild(NumeriNomiDlgComponent) numeriNomiComp!: NumeriNomiDlgComponent;
   @ViewChild('compTimer') compTimer!: TimerCompComponent;
   @ViewChild('tableOperazioni') tableOperazioni!: Table;
   @ViewChild('compMyTeam') compMyTeam!: TeamCompComponent;
   @ViewChild('compOppoTeam') compOppoTeam!: TeamCompComponent;
   @ViewChild('compMyField1') compMyField1!: PlayerCompComponent;
   @ViewChild('compMyField2') compMyField2!: PlayerCompComponent;
   @ViewChild('compMyField3') compMyField3!: PlayerCompComponent;
   @ViewChild('compMyField4') compMyField4!: PlayerCompComponent;
   @ViewChild('compMyField5') compMyField5!: PlayerCompComponent;
   @ViewChild('compOppoField1') compOppoField1!: PlayerCompComponent;
   @ViewChild('compOppoField2') compOppoField2!: PlayerCompComponent;
   @ViewChild('compOppoField3') compOppoField3!: PlayerCompComponent;
   @ViewChild('compOppoField4') compOppoField4!: PlayerCompComponent;
   @ViewChild('compOppoField5') compOppoField5!: PlayerCompComponent;
   @ViewChild('compTL') compTL!: PointsCompComponent;
   @ViewChild('compT2') compT2!: PointsCompComponent;
   @ViewChild('compT3') compT3!: PointsCompComponent;
   @ViewChild('compRimb') compRimb!: DataCompComponent;
   @ViewChild('compPalle') compPalle!: DataCompComponent;
   @ViewChild('compStopp') compStopp!: DataCompComponent;
   @ViewChild('compAssist') compAssist!: DataCompComponent;
   @ViewChild('compFalli') compFalli!: DataCompComponent;
   @ViewChild('mybench1', { read: ViewContainerRef }) contMyBench1!: ViewContainerRef;
   //@ViewChild('mybench1') refMyBench1!: ElementRef;
   @ViewChild('mybench2', { read: ViewContainerRef }) contMyBench2!: ViewContainerRef;
   @ViewChild('mybench3', { read: ViewContainerRef }) contMyBench3!: ViewContainerRef;
   @ViewChild('oppobench1', { read: ViewContainerRef }) contOppoBench1!: ViewContainerRef;
   @ViewChild('oppobench2', { read: ViewContainerRef }) contOppoBench2!: ViewContainerRef;
   @ViewChild('oppobench3', { read: ViewContainerRef }) contOppoBench3!: ViewContainerRef;

   private today: Date = new Date();
   private routeSubscription!: Subscription;
   private dataCompInstances: Map<string, DataCompComponent> = new Map();
   private pointsCompInstances: Map<string, PointsCompComponent> = new Map();
   private myBenchRefs: ComponentRef<BenchCompComponent>[] = [];
   private oppoBenchRefs: ComponentRef<BenchCompComponent>[] = [];
   //private contMyBench1!: ViewContainerRef;

   public tabActiveIndex: number = 0;
   public coloreCasa: string = "#ffffff";
   public coloreOspite: string = "#ff0000";
   public matchTitle: string = "";
   public matchHeader: IDSMatchHeader = CreateEmptyMatchHeader();
   public listaRoster: Array<TDSMatchRoster> = [];
   public listaRosterCasa: Array<TDSMatchRoster> = [];
   public listaRosterFuori: Array<TDSMatchRoster> = [];
   public listaMyCoach: Array<TDSCoach> = [];
   public listaOppoCoach: Array<TDSCoach> = [];
   public listaTeams: Array<IDSTeam> = [];
   public homeTeamName: string = "";
   public awayTeamName: string = "";
   public homeCoach1: string = "";
   public homeCoach2: string = "";
   public awayCoach1: string = "";
   public awayCoach2: string = "";
   public diagMatchHeader: IDSMatchHeader | null = null;
   public dialogVisible_MatchHeader: boolean = false;
   public dialogVisible_Falli: boolean = false;
   public playerForFalli: TMatchPlayer | null = null;
   public quartoForFalli: number = 0;
   public tempoForFalli: number = 0;
   public currSeason: IDSSeason | null = null;
   public currPhase: IDSPhase | null = null;
   public dialogVisible_Roster: boolean = false;
   public dialogVisible_Sostit: boolean = false;
   public sostTeamName: string = '';
   public sostTeamColor: string = '#FFFFFF';
   public sostTempo: string = '';
   public sostPlayers: TMatchPlayer[] = [];
   public sostIsMyTeam: boolean = true;
   // Chi era in campo (per la squadra del pulsante appena premuto) prima di aprire la dialog: serve per
   // capire, se viene assegnato un nuovo quintetto, chi ne resta fuori e va quindi consolidato come "uscito"
   // (vedi onSostituzioneSave/ConsolidateOutgoingPlayers).
   private prevOnCourtSost: TMatchPlayer[] = [];
   public dialogVisible_Azioni: boolean = false;
   public dialogVisible_TempiGioco: boolean = false;
   public dialogVisible_FalliTotali: boolean = false;
   public dialogVisible_NumeriNomi: boolean = false;
   public currTeam: string = "";
   public currPlayer: string = "";
   public currBench: string = "";
   public currSel: any = null;
   public currSelectedPlayer: TMatchPlayer | null = null;
   public MyFieldPlayers: Array<PlayerCompComponent> = [];
   public OppoFieldPlayers: Array<PlayerCompComponent> = [];
   public itemsMenuPartita: MenuItem[] | undefined;
   public TOperationType = TOperationType;

   constructor(private cdr: ChangeDetectorRef,
               private vcr: ViewContainerRef,
               public routes: Router,
               private route: ActivatedRoute,
               private servMatchHeader: MatchheaderService,
               private servMatchRoster: MatchrosterService,
               private servPlayer: PlayerService,
               private servTeam: TeamService,
               private servCoach: CoachService,
               private servSeason: SeasonsService,
               private servPhase: PhaseService,
               private messageDialogService: MessageDialogService,
               private matchHeaderServ: MatchheaderService,
               private zone: NgZone,
               public fltrDialogService: DialogService,
               public msgService: MessageService,
               public matchSync: MatchSyncService)

               /*
                           private seasonServ: SeasonsService,
                           private socService: SocietaService,
                           private eventServ: EventiService,
                           private champService: CampionatiService,
                           private phaseService: PhaseService,
                           //private messageDialogService: MessageDialogService,
                           private servMatchHeader: MatchheaderService,
                           private zone: NgZone,
                           public fltrDialogService: DialogService,
                           public fltrMessageService: MessageService,
                           private logService: LogService,
                           private teamService: TeamService)

                */
   {
   }


   ngOnInit()
   {
      this.itemsMenuPartita = [
         {
            label: "",
            items: [
               {label: "Modifica Numeri/Nomi", icon: 'pi pi-book', styleClass: 'icona-default', command:() => { this.mnuModificaNomiNumery(); } },
               {label: "Azioni", icon: 'pi pi-bolt', styleClass: 'icona-gialla', command:() => { this.mnuAzioni(); } },
               {label: "Tempi di gioco", icon: 'pi pi-stopwatch', styleClass: 'icona-default', command:() => { this.mnuTempiDiGioco(); } },
               {label: "Falli totali", icon: 'pi pi-flag-fill', styleClass: 'icona-rossa', command:() => { this.mnuFalliTotali(); } }
            ]
         },
         {
            separator: true
         },
         {
            label: "",
            items: [
               {label: "Azzera tutta la partita", icon: 'pi pi-times', styleClass: 'icona-arancio', command:() => { this.mnuAzzeraTutto(); } }
            ]
         },
         {
            label: ">>>>>>>>>DEBUG<<<<<<<<<",
            items: [
               {label: "Salva in storage", icon: 'pi pi-save', styleClass: 'icona-azzurra', command: () => { this.BtnCurrMatchSave()} },
               {label: "Carica da storage", icon: 'pi pi-upload', styleClass: 'icona-azzurra', command: () => { this.BtnCurrMatchLoad()} }
            ]
         }
      ];
      /*
      this.routeSubscription = this.route.queryParamMap.subscribe(params =>
                                                                  {
                                                                     this.route.queryParamMap.subscribe (params =>
                                                                                                         {
                                                                                                            const tmp = params.get ('id');
                                                                                                            if (tmp)
                                                                                                            {
                                                                                                               const nnn: number = Number (tmp);
                                                                                                               globs.openedMatchHeaderId = nnn;
                                                                                                               this.matchTitle = String (tmp);
                                                                                                            }
                                                                                                            else
                                                                                                               this.matchTitle = "No match";
                                                                                                            //
                                                                                                            const tmpSe = params.get ("seasonid");
                                                                                                            if (tmpSe)
                                                                                                            {
                                                                                                               const nnn: number = Number (tmpSe);
                                                                                                               this.currSeason = {
                                                                                                                  id:            nnn,
                                                                                                                  nome:          "",
                                                                                                                  abbrev:        "",
                                                                                                                  tenantid_link: 0
                                                                                                               }
                                                                                                            }
                                                                                                            else
                                                                                                               this.currSeason = null;
                                                                                                            //
                                                                                                            const tmpPh = params.get ("phaseid");
                                                                                                            if (tmpPh)
                                                                                                            {
                                                                                                               const nnn: number = Number (tmpPh);
                                                                                                               this.currPhase = {
                                                                                                                  id:           nnn,
                                                                                                                  nome:         "",
                                                                                                                  abbrev:       "",
                                                                                                                  exportfolder: "",
                                                                                                                  champid_link: 0
                                                                                                               }
                                                                                                            }
                                                                                                            else
                                                                                                               this.currPhase = null;
                                                                                                            //
                                                                                                            if (globs.openedMatchHeaderId > 0)
                                                                                                            {
                                                                                                               this.InitializeComponent ();
                                                                                                            }
                                                                                                         });
                                                                  });
      */
   }


   ngOnDestroy(): void
   {
      this.routeSubscription.unsubscribe(); // Aggiungi questa linea
   }


   async ngAfterViewInit()
   {
      matchGlobs.currSavedMatch.compTimer = this.compTimer;
      this.RefreshFrozenClock();
      this.routeSubscription = this.route.queryParamMap.subscribe(params =>
                                                                  {
                                                                     this.route.queryParamMap.subscribe (params =>
                                                                                                         {
                                                                                                            const tmp = params.get ('id');
                                                                                                            if (tmp)
                                                                                                            {
                                                                                                               const nnn: number = Number (tmp);
                                                                                                               globs.openedMatchHeaderId = nnn;
                                                                                                               this.matchTitle = String (tmp);
                                                                                                            }
                                                                                                            else
                                                                                                               this.matchTitle = "No match";
                                                                                                            //
                                                                                                            const tmpSe = params.get ("seasonid");
                                                                                                            if (tmpSe)
                                                                                                            {
                                                                                                               const nnn: number = Number (tmpSe);
                                                                                                               this.currSeason = {
                                                                                                                  id:            nnn,
                                                                                                                  nome:          "",
                                                                                                                  abbrev:        "",
                                                                                                                  tenantid_link: 0
                                                                                                               }
                                                                                                            }
                                                                                                            else
                                                                                                               this.currSeason = null;
                                                                                                            //
                                                                                                            const tmpPh = params.get ("phaseid");
                                                                                                            if (tmpPh)
                                                                                                            {
                                                                                                               const nnn: number = Number (tmpPh);
                                                                                                               this.currPhase = {
                                                                                                                  id:           nnn,
                                                                                                                  nome:         "",
                                                                                                                  abbrev:       "",
                                                                                                                  exportfolder: "",
                                                                                                                  champid_link: 0
                                                                                                               }
                                                                                                            }
                                                                                                            else
                                                                                                               this.currPhase = null;
                                                                                                            //
                                                                                                            if (globs.openedMatchHeaderId > 0)
                                                                                                            {
                                                                                                               this.InitializeComponent ();
                                                                                                            }
                                                                                                         });
                                                                  });
   }


   async InitializeComponent()
   {
      /*
      if (matchGlobs.currMatch == null)
         matchGlobs.currMatch = await TCurrMatch.Create(this.servMatchHeader, this.servMatchRoster, this.servTeam);
      */
      if (matchGlobs.currSavedMatch == null)
         matchGlobs.currSavedMatch = new TSavedMatch();
      // Tab attivo: dopo un F5 sulla stessa partita si torna su quello selezionato prima; per una partita
      // diversa (o se non c'è nulla di salvato) si parte dal primo, registrando la partita come "ultima"
      const saved = await matchGlobs.currSavedMatch.LoadFromStorage();
      if (saved && (matchGlobs.currSavedMatch.lastMatchId == globs.openedMatchHeaderId) && (matchGlobs.currSavedMatch.lastTabIndex >= 0))
      {
         await this.SelezionaTab(matchGlobs.currSavedMatch.lastTabIndex);
      }
      else
      {
         await this.SelezionaTab(0);
         matchGlobs.currSavedMatch.lastTabIndex = 0;
         matchGlobs.currSavedMatch.lastMatchId = globs.openedMatchHeaderId;
         await matchGlobs.currSavedMatch.SaveToStorage();
      }
      //
      if (matchGlobs.currMatch == null)
      {
         matchGlobs.currMatch = new TCurrMatch(this.servMatchHeader, this.servMatchRoster, this.servTeam);
      }
      //
      const opList = await matchGlobs.currMatch.EnsureOperationList();
      // Salvataggio remoto: ogni operazione aggiunta/tolta finisce nella coda di sincronizzazione
      opList.OnItemAdded   = op => { this.matchSync.EnqueueAddEvent(op, this.matchHeader.id); };
      opList.OnItemRemoved = op => { this.matchSync.EnqueueDeleteEvent(op, this.matchHeader.id); };
      //
      await this.LoadMatchHeader(globs.openedMatchHeaderId);
      await this.LoadMatchRoster(globs.openedMatchHeaderId);
      await this.LoadCoachs(globs.openedMatchHeaderId);
      await this.LoadTeams(this.matchHeader.champId_lk);
      await this.LoadSeason(this.currSeason?this.currSeason.id:0);
      await this.LoadPhase(this.currPhase?this.currPhase.id:0);
      //
      // La partita viene ricostruita rigiocando gli eventi salvati (server + azioni locali non ancora inviate):
      // statistiche, punteggi, falli, giocatori in campo, tempi di gioco e cronometro.
      const replayed = await this.LoadMatchFromEvents();
      if (!replayed)
      {
         // Nessun evento: partita da iniziare. Se il tab "Gioco" (e quindi il timer) è già stato visitato in
         // questa sessione, il relativo binding [matchNotStarted] non forza un nuovo ngOnInit: resettalo esplicitamente.
         if ((this.MatchNotStarted()) && (this.compTimer))
            this.compTimer.ResetToMatchStart();
         //
         // In campo la situazione dell'ultimo momento di gioco del quarto selezionato nel cronometro
         this.ApplyLineupForQuarter (this.compTimer ? this.compTimer.currQuarter : '1q');
      }
      this.RefreshFrozenClock();
      //
      if (this.matchHeader.atHome)
      {
         this.matchTitle = `${this.matchHeader.myTeamNome_lk}  -  ${this.matchHeader.oppoTeamNome_lk}`;
         this.coloreCasa = this.matchHeader.myTeamColor;
         this.coloreOspite = this.matchHeader.oppoTeamColor;
         this.homeTeamName = this.matchHeader.myTeamNome_lk;
         this.awayTeamName = this.matchHeader.oppoTeamNome_lk;
         this.homeCoach1 = String(this.matchHeader.myCoach1Id_link);
         this.homeCoach2 = String(this.matchHeader.myCoach2Id_link);
         if (this.matchHeader.myCoach1Id_link > 0)
         {
            const ch: TDSCoach = (this.listaMyCoach.find (cc => Number(this.matchHeader.myCoach1Id_link) == cc.id) as TDSCoach);
            if (ch)
               this.homeCoach1 = `${ch.nome}`;
         }
         if (this.matchHeader.myCoach2Id_link > 0)
         {
            const ch: TDSCoach = (this.listaMyCoach.find (cc => Number(this.matchHeader.myCoach2Id_link) == cc.id) as TDSCoach);
            if (ch)
               this.homeCoach2 = `${ch.nome}`;
         }
         if (this.matchHeader.oppoCoach1Id_link > 0)
         {
            const ch: TDSCoach = (this.listaOppoCoach.find (cc => Number(this.matchHeader.oppoCoach1Id_link) == cc.id) as TDSCoach);
            if (ch)
               this.awayCoach1 = `${ch.nome}`;
         }
         if (this.matchHeader.oppoCoach2Id_link > 0)
         {
            const ch: TDSCoach = (this.listaOppoCoach.find (cc => Number(this.matchHeader.oppoCoach2Id_link) == cc.id) as TDSCoach);
            if (ch)
               this.awayCoach2 = `${ch.nome}`;
         }
      }
      else
      {
         this.matchTitle = `${this.matchHeader.oppoTeamNome_lk}  -  ${this.matchHeader.myTeamNome_lk}`;
         this.coloreCasa = this.matchHeader.oppoTeamColor;
         this.coloreOspite = this.matchHeader.myTeamColor;
         this.homeTeamName = this.matchHeader.oppoTeamNome_lk;
         this.awayTeamName = this.matchHeader.myTeamNome_lk;
         // Partita in trasferta: "myTeam" è la squadra ospite e "oppoTeam" quella di casa, quindi i
         // riferimenti agli allenatori vanno invertiti rispetto al ramo "in casa" sopra (che altrimenti
         // resterebbero vuoti: era il bug, questo blocco mancava del tutto).
         this.awayCoach1 = String(this.matchHeader.myCoach1Id_link);
         this.awayCoach2 = String(this.matchHeader.myCoach2Id_link);
         if (this.matchHeader.myCoach1Id_link > 0)
         {
            const ch: TDSCoach = (this.listaMyCoach.find (cc => Number(this.matchHeader.myCoach1Id_link) == cc.id) as TDSCoach);
            if (ch)
               this.awayCoach1 = `${ch.nome}`;
         }
         if (this.matchHeader.myCoach2Id_link > 0)
         {
            const ch: TDSCoach = (this.listaMyCoach.find (cc => Number(this.matchHeader.myCoach2Id_link) == cc.id) as TDSCoach);
            if (ch)
               this.awayCoach2 = `${ch.nome}`;
         }
         if (this.matchHeader.oppoCoach1Id_link > 0)
         {
            const ch: TDSCoach = (this.listaOppoCoach.find (cc => Number(this.matchHeader.oppoCoach1Id_link) == cc.id) as TDSCoach);
            if (ch)
               this.homeCoach1 = `${ch.nome}`;
         }
         if (this.matchHeader.oppoCoach2Id_link > 0)
         {
            const ch: TDSCoach = (this.listaOppoCoach.find (cc => Number(this.matchHeader.oppoCoach2Id_link) == cc.id) as TDSCoach);
            if (ch)
               this.homeCoach2 = `${ch.nome}`;
         }
      }
      //
      await this.CreateBenchComponents();
      //
      this.MyFieldPlayers.push (this.compMyField1);
      this.MyFieldPlayers.push (this.compMyField2);
      this.MyFieldPlayers.push (this.compMyField3);
      this.MyFieldPlayers.push (this.compMyField4);
      this.MyFieldPlayers.push (this.compMyField5);
      this.OppoFieldPlayers.push (this.compOppoField1);
      this.OppoFieldPlayers.push (this.compOppoField2);
      this.OppoFieldPlayers.push (this.compOppoField3);
      this.OppoFieldPlayers.push (this.compOppoField4);
      this.OppoFieldPlayers.push (this.compOppoField5);
      //
      if (matchGlobs.currMatch != null)
      {
         if ((matchGlobs.currMatch.myTeam != null) && (this.compMyTeam))
            this.compMyTeam.matchTeamData = matchGlobs.currMatch.myTeam();
         if ((matchGlobs.currMatch.oppTeam != null) && (this.compOppoTeam))
            this.compOppoTeam.matchTeamData = matchGlobs.currMatch.oppTeam();
      }
      await this.compMyTeam.Update();
      await this.compOppoTeam.Update();
      //
      this.UpdateFieldPlayers();
      //
      await matchGlobs.currSavedMatch.SaveToStorage();
      //
      this.cdr.detectChanges();
      //
      const sn = matchGlobs.currMatch.myTeam()?.name()
      await this.compMyTeam.AssingTeam(matchGlobs.currMatch.myTeam());
   }


   async BtnCurrMatchSave()
   {
      await matchGlobs.currMatch?.SaveToStorage();
   }


   async BtnCurrMatchLoad()
   {
      await matchGlobs.currMatch?.LoadFromStorage();
   }


   async LoadMatchHeader(aId: number)
   {
      const theData = await firstValueFrom (this.servMatchHeader.getSingleData(aId));
      if ((theData) && (theData.elements))
      {
         this.matchHeader = this.servMatchHeader.MatchHeaderFromDb(theData.elements);
         matchGlobs.currMatch?.matchHeader.set(this.servMatchHeader.MatchHeaderFromDb(theData.elements));
         const myTeamData = await firstValueFrom (this.servTeam.getSingleData(this.matchHeader.myTeamId_link));
         if ((myTeamData) && (myTeamData.ok))
            matchGlobs.currMatch?.myTeam()?.FromJson(myTeamData.elements);
         const oppoTeamData = await firstValueFrom (this.servTeam.getSingleData(this.matchHeader.oppoTeamId_link));
         if ((oppoTeamData) && (oppoTeamData.ok))
            matchGlobs.currMatch?.oppTeam()?.FromJson(oppoTeamData.elements);
      }
   }


   GetMyTeamData(): TMatchTeam | null
   {
      return matchGlobs.currMatch?.myTeam() ?? null;
   }


   GetOppoTeamData(): TMatchTeam | null
   {
      return matchGlobs.currMatch?.oppTeam() ?? null;
   }


   GetOperList(): TOperation[]
   {
      return matchGlobs.currMatch?.matchOperList()?.items() ?? [];
   }


   GetOperTimeStr(op: TOperation): string
   {
      return utils.GetTimeStr(op.time());
   }


   GetOperQuarterStr(op: TOperation): string
   {
      const q = op.quarter();
      const prefix = q <= globs.MaxRegQuarters ? 'Q' : 'E';
      return `${prefix}${q}`;
   }


   GetOperPlayerStr(op: TOperation): string
   {
      return op.Player1Str();
   }


   GetOperDescStr(op: TOperation): string
   {
      const p2 = op.Player2Str();
      const d = op.desc();
      if (p2 && d)
         return `${p2} ${d}`;
      return p2 || d;
   }


   GetOperBgClass(op: TOperation): string
   {
      switch (op.oper())
      {
         case TOperationType.totTLYes:
         case TOperationType.totT2Yes:
         case TOperationType.totT3Yes:
            return 'oper-bg-made';
         case TOperationType.totTLNo:
         case TOperationType.totT2No:
         case TOperationType.totT3No:
            return 'oper-bg-missed';
         case TOperationType.totSostituz:
            return 'oper-bg-sostituz';
         case TOperationType.totQuintetto:
            return 'oper-bg-quintetto';
         default:
            return '';
      }
   }


   GetOperTmCrClass(op: TOperation): string
   {
      switch (op.MyTeamStr().trim())
      {
         case 'MyTeam':   return 'oper-tmcr-my';
         case 'OppoTeam': return 'oper-tmcr-oppo';
         default:         return 'oper-tmcr-default';
      }
   }


   async LoadMatchRoster (matchHeaderId: number)
   {
      this.listaRoster = [];
      this.listaRosterCasa = [];
      this.listaRosterFuori = [];
      if (matchHeaderId > 0)
      {
         const theData = await firstValueFrom (this.servMatchRoster.getAllData(matchHeaderId));
         if ((theData) && (theData.elements))
         {
            const fullList: Array<TDSMatchRoster> = theData.elements;
            for (let iii=0;   iii<fullList.length;   iii++)
            {
               if (fullList[iii].isMyTeam)
               {
                  if (this.matchHeader.atHome)
                     this.listaRosterCasa.push (fullList[iii]);
                  else
                     this.listaRosterFuori.push (fullList[iii]);
               }
               else
               {
                  if (this.matchHeader.atHome)
                     this.listaRosterFuori.push (fullList[iii]);
                  else
                     this.listaRosterCasa.push (fullList[iii]);
               }
            }
         }
         //
         this.listaRosterCasa.sort(this.OrdinaGiocatoriByNumero);
         this.listaRosterFuori.sort(this.OrdinaGiocatoriByNumero);
         let myList:  TDSMatchRoster[] = [];
         let oppoList:  TDSMatchRoster[] = [];
         if (this.matchHeader.atHome)
         {
            myList = this.listaRosterCasa;
            oppoList = this.listaRosterFuori;
         }
         else
         {
            myList = this.listaRosterFuori;
            oppoList = this.listaRosterCasa;
         }
         if (matchGlobs.currMatch != null)
         {
            const cm: TCurrMatch = matchGlobs.currMatch;
            if (cm.myTeam () != null)
            {
               const mt: TMatchTeam | null = cm.myTeam();
               if (mt != null)
               {
                  mt.Roster = [];
                  for (let iii = 0; iii < myList.length; iii++)
                  {
                     let plr: TMatchPlayer | null = new TMatchPlayer ();
                     myList[iii].dbgMatch;
                     myList[iii].dbgPlayer;
                     myList[iii].matchHeaderId_link;
                     myList[iii].matchRosterIndex;
                     myList[iii].type;
                     plr.playerRecID = myList[iii].playerId_link;
                     plr.isMyTeam.set (myList[iii].isMyTeam);
                     plr.playName.set (myList[iii].playerName_lk);
                     plr.captain.set (myList[iii].capitano);
                     plr.playNumber.set (myList[iii].playNumber);
                     plr.inQuintetto.set (myList[iii].quintetto);
                     plr.rosterRecID = myList[iii].id;
                     mt.Roster.push (plr);
                  }
                  mt.NotifyRosterChanged();
               }
            }
            //
            const cm2: TCurrMatch = matchGlobs.currMatch;
            if (cm2.oppTeam () != null)
            {
               const ot: TMatchTeam | null = cm2.oppTeam();
               if (ot != null)
               {
                  ot.Roster = [];
                  for (let iii = 0; iii < oppoList.length; iii++)
                  {
                     let plr: TMatchPlayer = new TMatchPlayer ();
                     oppoList[iii].dbgMatch;
                     oppoList[iii].dbgPlayer;
                     oppoList[iii].matchHeaderId_link;
                     oppoList[iii].matchRosterIndex;
                     oppoList[iii].type;
                     plr.playerRecID = oppoList[iii].playerId_link;
                     plr.isMyTeam.set (oppoList[iii].isMyTeam);
                     plr.playName.set (oppoList[iii].playerName_lk);
                     plr.captain.set (oppoList[iii].capitano);
                     plr.playNumber.set (oppoList[iii].playNumber);
                     plr.inQuintetto.set (oppoList[iii].quintetto);
                     plr.rosterRecID = oppoList[iii].id;
                     ot.Roster.push (plr);
                  }
                  ot.NotifyRosterChanged();
               }
            }
            //
            // I giocatori sono stati appena ricreati: le formazioni registrate per quarto puntano ai vecchi oggetti
            // (chi va in campo viene deciso in InitializeComponent, vedi ApplyLineupForQuarter)
            this.quarterEndLineups = {};
         }
         //
      }
   }


   // Mette in campo i giocatori indicati a partire dal tempo indicato del cronometro, con gli stessi
   // riferimenti iniziali di AddQuintettoOperations per tempo di gioco e plus/minus.
   PutPlayersOnCourt (players: TMatchPlayer[],
                      maxTime: number): void
   {
      const diff = (matchGlobs.currMatch?.myTeam()?.CalcPunti() ?? 0) - (matchGlobs.currMatch?.oppTeam()?.CalcPunti() ?? 0);
      for (const p of players)
      {
         p.inTime.set(maxTime);
         p.outTime.set(maxTime);
         p.currCronotime = maxTime;
         p.fPMIn = diff;
         p.inGioco.set(true);
      }
   }


   // Salva su matchroster il flag "quintetto" dei giocatori indicati
   // (listaRosterCasa/listaRosterFuori contengono i record completi letti da DB).
   async SaveQuintettoToDB (players: TMatchPlayer[]): Promise<void>
   {
      const byId = new Map(players.map(p => [p.playerRecID, p]));
      let changed = false;
      for (const entry of [...this.listaRosterCasa, ...this.listaRosterFuori])
      {
         const plr = byId.get(entry.playerId_link);
         if ((!plr) || (entry.quintetto === plr.inQuintetto()))
            continue;
         entry.quintetto = plr.inQuintetto();
         changed = true;
      }
      if (changed)
         await this.EnqueueRosterSnapshot();
   }


   // Il roster si salva sempre per intero (sul server viene cancellato e reinserito): gli id delle righe
   // cambiano ad ogni salvataggio e, se il roster è stato inserito offline, non esistono ancora sul server,
   // quindi non si possono aggiornare le singole righe. In coda resta solo l'ultimo roster della partita;
   // gli eventuali rifiuti del server sono segnalati da AppComponent.
   private async EnqueueRosterSnapshot (): Promise<void>
   {
      const rows = [...this.listaRosterCasa, ...this.listaRosterFuori].map(r =>
         ({ ...this.servMatchRoster.MatchRosterToDb(r), playername_lk: r.playerName_lk }));
      await this.matchSync.EnqueueWrite ('roster', this.matchHeader.id, { rows }, this.matchHeader.id);
   }


   // listaRosterCasa/listaRosterFuori (usate solo dal tab Anagrafica) sono un elenco statico caricato una
   // volta in LoadMatchRoster: a differenza del resto dell'app, non leggono i signal reattivi di
   // TMatchPlayer, quindi non si aggiornano da sole quando si modifica numero/nome da "Modifica
   // Numeri/Nomi" (o da qualunque altro punto che tocchi TMatchPlayer.playNumber/playName). Le
   // risincronizziamo esplicitamente dopo un salvataggio, per playerId_link/playerRecID.
   SyncRosterListsFromMatchPlayers (): void
   {
      const allPlayers = [
         ...(matchGlobs.currMatch?.myTeam()?.Roster ?? []),
         ...(matchGlobs.currMatch?.oppTeam()?.Roster ?? [])
      ];
      const byId = new Map(allPlayers.map(p => [p.playerRecID, p]));
      for (const entry of [...this.listaRosterCasa, ...this.listaRosterFuori])
      {
         const plr = byId.get(entry.playerId_link);
         if (plr)
         {
            entry.playNumber = plr.playNumber();
            entry.playerName_lk = plr.playName();
         }
      }
   }


   async LoadCoachs (matchHeaderId: number)
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


   async LoadTeams(champId: number | null)
   {
      try
      {
         if ((champId == null) || (champId < 1))
         {
         }
         else
         {
            const data = await firstValueFrom (this.servTeam.getAllData (champId));
            if ((data) && (data.ok))
               this.listaTeams = data.elements;
         }
      }
      catch (err)
      {
      }
      finally
      {
      }
   }


   async LoadSeason(seasonId: number | null)
   {
      try
      {
         if ((seasonId == null) || (seasonId < 1))
         {
         }
         else
         {
            const data = await firstValueFrom (this.servSeason.getSingleData(seasonId));
            if ((data) && (data.ok))
               this.currSeason = data.elements;
         }
      }
      catch (err)
      {
      }
      finally
      {
      }
   }


   async LoadPhase(phaseId: number | null)
   {
      try
      {
         if ((phaseId == null) || (phaseId < 1))
         {
         }
         else
         {
            const data = await firstValueFrom (this.servPhase.getSingleData(phaseId));
            if ((data) && (data.ok))
               this.currPhase = data.elements;
         }
      }
      catch (err)
      {
      }
      finally
      {
      }
   }


   async CreateBenchComponents()
   {
      let start: number = -1;
      let stop: number = -2;
      // 1. Pulisci il contenitore prima di iniziare, se necessario
      this.contMyBench1.clear();
      this.contMyBench2.clear();
      this.contMyBench3.clear();
      this.contOppoBench1.clear();
      this.contOppoBench2.clear();
      this.contOppoBench3.clear();

      this.myBenchRefs = [];
      this.oppoBenchRefs = [];

      // MyTeam
      start = 0;
      stop = 0;
      if (matchGlobs.currMatch?.myTeam () != null)
      {
         const mt: TMatchTeam | null = matchGlobs.currMatch.myTeam ();
         if (mt != null)
         {
            stop = mt.Roster.length;
            if (stop > 6)
               stop = 6;
            for (let iii=start;   iii<stop;   iii++)
            {
               const benchRef = this.contMyBench1.createComponent(BenchCompComponent);
               benchRef.instance.componentId = mt.Roster[iii].playerRecID.toString();
               benchRef.instance.player = mt.Roster[iii];
               benchRef.instance.getCurrentTime = this.GetCurrClock;
               benchRef.instance.isSelected = false;
               benchRef.instance.componentClicked.subscribe(event => { this.BenchClicked(event)});
               benchRef.instance.componentDoubleClicked.subscribe(event => { this.BenchDoubleClicked(event)});
               this.myBenchRefs.push(benchRef);
            }
            if (mt.Roster.length > 6)
            {
               start = 6;
               stop = mt.Roster.length;
               if (stop > 12)
                  stop = 12;
               for (let iii=start;   iii<stop;   iii++)
               {
                  const benchRef = this.contMyBench2.createComponent(BenchCompComponent);
                  benchRef.instance.componentId = mt.Roster[iii].playerRecID.toString();
                  benchRef.instance.player = mt.Roster[iii];
                  benchRef.instance.getCurrentTime = this.GetCurrClock;
                  benchRef.instance.isSelected = false;
                  benchRef.instance.componentClicked.subscribe(event => { this.BenchClicked(event)});
                  benchRef.instance.componentDoubleClicked.subscribe(event => { this.BenchDoubleClicked(event)});
                  this.myBenchRefs.push(benchRef);
               }
            }
            if (mt.Roster.length > 12)
            {
               start = 12;
               stop = mt.Roster.length;
               if (stop > 18)
                  stop = 18;
               for (let iii=start;   iii<stop;   iii++)
               {
                  const benchRef = this.contMyBench3.createComponent(BenchCompComponent);
                  benchRef.instance.componentId = mt.Roster[iii].playerRecID.toString();
                  benchRef.instance.player = mt.Roster[iii];
                  benchRef.instance.getCurrentTime = this.GetCurrClock;
                  benchRef.instance.isSelected = false;
                  benchRef.instance.componentClicked.subscribe(event => { this.BenchClicked(event)});
                  benchRef.instance.componentDoubleClicked.subscribe(event => { this.BenchDoubleClicked(event)});
                  this.myBenchRefs.push(benchRef);
               }
            }
         }
      }
      // OppoTeam
      start = 0;
      stop = 0;
      if (matchGlobs.currMatch?.oppTeam () != null)
      {
         const ot: TMatchTeam | null = matchGlobs.currMatch.oppTeam ();
         if (ot != null)
         {
            stop = ot.Roster.length;
            if (stop > 6)
               stop = 6;
            for (let iii=start;   iii<stop;   iii++)
            {
               const benchRef = this.contOppoBench3.createComponent(BenchCompComponent);
               benchRef.instance.componentId = ot.Roster[iii].playerRecID.toString();
               benchRef.instance.player = ot.Roster[iii];
               benchRef.instance.getCurrentTime = this.GetCurrClock;
               benchRef.instance.isSelected = false;
               benchRef.instance.componentClicked.subscribe(event => { this.BenchClicked(event)});
               benchRef.instance.componentDoubleClicked.subscribe(event => { this.BenchDoubleClicked(event)});
               this.oppoBenchRefs.push(benchRef);
            }
            if (ot.Roster.length > 6)
            {
               start = 6;
               stop = ot.Roster.length;
               if (stop > 12)
                  stop = 12;
               for (let iii=start;   iii<stop;   iii++)
               {
                  const benchRef = this.contOppoBench3.createComponent(BenchCompComponent);
                  benchRef.instance.componentId = ot.Roster[iii].playerRecID.toString();
                  benchRef.instance.player = ot.Roster[iii];
                  benchRef.instance.getCurrentTime = this.GetCurrClock;
                  benchRef.instance.isSelected = false;
                  benchRef.instance.componentClicked.subscribe(event => { this.BenchClicked(event)});
                  benchRef.instance.componentDoubleClicked.subscribe(event => { this.BenchDoubleClicked(event)});
                  this.oppoBenchRefs.push(benchRef);
               }
            }
            if (ot.Roster.length > 12)
            {
               start = 12;
               stop = ot.Roster.length;
               if (stop > 18)
                  stop = 18;
               for (let iii=start;   iii<stop;   iii++)
               {
                  const benchRef = this.contOppoBench3.createComponent(BenchCompComponent);
                  benchRef.instance.componentId = ot.Roster[iii].playerRecID.toString();
                  benchRef.instance.player = ot.Roster[iii];
                  benchRef.instance.getCurrentTime = this.GetCurrClock;
                  benchRef.instance.isSelected = false;
                  benchRef.instance.componentClicked.subscribe(event => { this.BenchClicked(event)});
                  benchRef.instance.componentDoubleClicked.subscribe(event => { this.BenchDoubleClicked(event)});
                  this.oppoBenchRefs.push(benchRef);
               }
            }
         }
      }
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


   async SelezionaTab(tabIndex: number)
   {
      this.tabActiveIndex = tabIndex;
   }


   async HandleTabChange (event: TabViewChangeEvent)
   {
      this.tabActiveIndex = event.index;
      matchGlobs.currSavedMatch.lastTabIndex = event.index;
      await matchGlobs.currSavedMatch.SaveToStorage();
   }


   MatchNotStarted(): boolean
   {
      return (this.matchHeader.matchStatus != matchStatusType.playing.code) &&
             (this.matchHeader.matchStatus != matchStatusType.terminated.code);
   }


   StatoMAtchStr(): string
   {
      if (this.matchHeader.matchStatus == matchStatusType.playing.code)
         return matchStatusType.playing.desc;
      else if (this.matchHeader.matchStatus == matchStatusType.terminated.code)
         return matchStatusType.terminated.desc;
      else
         return  matchStatusType.notPlayed.desc;
   }


   BtnEditMatchHeader()
   {
      this.diagMatchHeader = CreateEmptyMatchHeader();
      this.diagMatchHeader = JSON.parse(JSON.stringify(this.matchHeader, null, 3));
      if (this.diagMatchHeader)
      {
         this.diagMatchHeader.phaseId_link = this.matchHeader.phaseId_link;
         this.diagMatchHeader.phaseNome_lk = this.matchHeader.phaseNome_lk;
         this.diagMatchHeader.phaseAbbrev_lk = this.matchHeader.phaseAbbrev_lk;
      }
      this.dialogVisible_MatchHeader = true;
   }


   onMatchHeaderDialogShow()
   {
      if (this.matchHeaderComp)
         this.matchHeaderComp.onDialogShown();
   }


   MatchDate(): Date
   {
      if (this.matchHeader)
         return this.matchHeader.matchDate;
      else
         return this.today;
   }


   AnnullaMatchHeader()
   {
      this.dialogVisible_MatchHeader = false;
   }


   async SalvaMatchHeader(datiMH: { mh: IDSMatchHeader})
   {
      this.dialogVisible_MatchHeader = false;
      this.matchHeader = JSON.parse(JSON.stringify(datiMH.mh, null, 3));
      globs.openedMatchHeaderId = this.matchHeader.id;
      if (this.matchHeader)
      {
         // in coda: salvata anche senza connessione, e la rilettura vede comunque la modifica
         await this.matchSync.EnqueueWrite ('matchheader', this.matchHeader.id,
                                            this.servMatchHeader.MatchHeaderToDb (this.matchHeader), this.matchHeader.id);
         await this.matchSync.WaitForWrites ();
         await this.InitializeComponent();
      }
   }


   BtnEditMatchRoster()
   {
      this.diagMatchHeader = CreateEmptyMatchHeader();
      this.diagMatchHeader = JSON.parse(JSON.stringify(this.matchHeader, null, 3));
      if (this.diagMatchHeader)
      {
         this.diagMatchHeader.phaseId_link = this.matchHeader.phaseId_link;
         this.diagMatchHeader.phaseNome_lk = this.matchHeader.phaseNome_lk;
         this.diagMatchHeader.phaseAbbrev_lk = this.matchHeader.phaseAbbrev_lk;
      }
      this.dialogVisible_Roster = true;
   }


   async onMatchRosterDialogShow()
   {
      if (this.matchRosterComp)
         await this.matchRosterComp.onComponentShow(this.matchHeader.id, "");
   }


   async onFalliDialogShow()
   {
      if (this.playerFalliComp)
      {
         console.log("ENTRO:");
         console.log(`${this.playerForFalli?.playName()}`);
         const ff: Array<TFallo> | undefined = this.playerForFalli?.falliFatti();
         if (ff)
         {
            for (let i=0;   i<globs.maxPlayerFouls;   i++)
            {
               console.log (`${i + 1}) ${ff[i].fCommesso}`);
            }
         }
         this.SnapshotFalli (this.playerForFalli ? [this.playerForFalli] : []);
         await this.playerFalliComp.onComponentShow (this.playerForFalli, this.quartoForFalli, this.tempoForFalli);
      }
   }


   async salvaPlayerFalli(event: {player: TMatchPlayer | null, nuovoFallo: boolean})
   {
      this.dialogVisible_Falli = false;
      if ((event.player != null) && (this.playerForFalli != null))
      {
         this.playerForFalli.falliFatti.set(event.player.falliFatti());
         // falli nuovi, tolti o corretti -> eventi "Fallo fatto" (vedi RegistraModificheFalli)
         await this.RegistraModificheFalli();
         this.UpdateCommandsData(this.playerForFalli);
         this.cdr.detectChanges();
      }
   }


   annullaPlayerFalli()
   {
      this.dialogVisible_Falli = false;
   }


   AnnullaMatchRosterDiag()
   {
      this.dialogVisible_Roster = false;
   }


   async SalvaMatchRosterDiag(event: [Array<TDSMatchRoster>, IDSMatchHeader])
   {
      this.dialogVisible_Roster = false;
      const mH: IDSMatchHeader = event[1];
      const mR: Array<TDSMatchRoster> = event[0];
      //
      if (this.matchHeader)
      {
         this.matchHeader.myCoach1Id_link = Number(mH.myCoach1Id_link);
         this.matchHeader.myCoach2Id_link = Number(mH.myCoach2Id_link);
         this.matchHeader.oppoCoach1Id_link = Number(mH.oppoCoach1Id_link);
         this.matchHeader.oppoCoach2Id_link = Number(mH.oppoCoach2Id_link);
         await this.matchSync.EnqueueWrite ('matchheader', this.matchHeader.id,
                                            this.servMatchHeader.MatchHeaderToDb (this.matchHeader), this.matchHeader.id);
         await this.matchSync.WaitForWrites ();
         if (this.currSeason)
         {
            await this.InitializeComponent();
         }
      }
   }


   async TeamClicked(id: string)
   {
      await this.UpdateSelection("team", id);
      this.currTeam = id;
   }


   async PlayerClicked(id: string)
   {
      const player = this.GetPlayerByFieldId(id);
      await this.SelectPlayer(player);
      this.currPlayer = id;
   }


   GetPlayerByFieldId(id: string): TMatchPlayer | null
   {
      const myIdx = ['pl1', 'pl2', 'pl3', 'pl4', 'pl5'].indexOf(id);
      if (myIdx >= 0)
         return this.MyFieldPlayers[myIdx]?.player ?? null;
      const oppoIdx = ['oppopl1', 'oppopl2', 'oppopl3', 'oppopl4', 'oppopl5'].indexOf(id);
      if (oppoIdx >= 0)
         return this.OppoFieldPlayers[oppoIdx]?.player ?? null;
      return null;
   }


   async SelectPlayer(player: TMatchPlayer | null): Promise<void>
   {
      await this.ClearSelection();
      if (!player)
         return;
      this.currSelectedPlayer = player;
      const isMy = player.isMyTeam();
      const fieldSlots = isMy ? this.MyFieldPlayers : this.OppoFieldPlayers;
      const benchRefs = isMy ? this.myBenchRefs : this.oppoBenchRefs;
      for (const slot of fieldSlots)
      {
         if (slot && slot.player === player)
            slot.isSelected = true;
      }
      for (const ref of benchRefs)
      {
         if (ref.instance.player === player)
            ref.instance.isSelected = true;
      }
      this.UpdateCommandsData(player);
   }


   onTimeUpdate (event: { id: string, time: number })
   {
      if (event.id === 'comptimer')
         console.log(`Cronometro ${event.id}: tempo rimanente ${event.time}s`);
   }


   // "Congelato": aggiornato solo quando il cronometro si ferma (RefreshFrozenClock), non ad ogni tick.
   // I componenti giocatore/panchina non devono aggiornarsi in continuazione mentre il cronometro corre.
   private frozenClockSeconds: number = 0;


   RefreshFrozenClock ()
   {
      this.frozenClockSeconds = this.compTimer ? this.compTimer.GetTimeSeconds() : 0;
   }


   // Passato ai componenti giocatore/panchina (come arrow function, per mantenere il "this" corretto anche
   // se chiamato dal loro template) perché possano mostrare il tempo giocato "congelato" all'ultimo stop
   // (vedi TMatchPlayer.GetTempoGiocoLiveStr/RefreshFrozenClock).
   GetCurrClock = (): number =>
   {
      return this.frozenClockSeconds;
   }


   QuintettoSelezionato(): boolean
   {
      const quarter = this.compTimer ? this.compTimer.GetQuarterNumber() : 1;
      const myOk  = matchGlobs.currMatch?.myTeam()?.QuintettoQuarto[quarter - 1]  ?? false;
      const oppOk = matchGlobs.currMatch?.oppTeam()?.QuintettoQuarto[quarter - 1] ?? false;
      return myOk && oppOk;
   }


   async onStartRequested (event: { id: string })
   {
      if (event.id !== 'comptimer')
         return;
      const mancanti = this.TeamsSenzaQuintetto();
      if (mancanti.length > 0)
      {
         const dlgData: MessDlgData = {
            title:               'Quintetto non selezionato',
            subtitle:            '',
            message:             `Il quintetto di una o entrambe le squadre non è ancora stato selezionato per questo quarto.<br>Vuoi impostarlo ora, oppure continuare con i giocatori attualmente in campo?`,
            messtype:            'warning',
            btncaption:          'Imposta quintetto',
            showCancelButton:    true,
            cancelButtonCaption: 'Continua così',
            showThirdButton:     true,
            thirdButtonCaption:  'Annulla'
         };
         const result = await firstValueFrom (this.messageDialogService.showMessage (dlgData, '', true));
         if (result === 'primary')
         {
            // Una dialog Quintetto per ogni squadra senza quintetto, una dopo l'altra (vedi onSostituzioneSave);
            // il cronometro resta fermo: si riavvia con Start dopo aver confermato i quintetti.
            this.pendingQuintettoTeams = [...mancanti];
            this.OpenNextPendingQuintetto();
            return;
         }
         if (result !== 'secondary')
            return; // l'utente ha annullato: il cronometro non viene nemmeno avviato
         await this.AssegnaQuintettoDaInCampo (mancanti);
      }
      this.compTimer?.start();
   }


   // Squadre (true = myTeam) che non hanno ancora il quintetto registrato per il quarto corrente
   TeamsSenzaQuintetto (): boolean[]
   {
      const quarter = this.compTimer ? this.compTimer.GetQuarterNumber() : 1;
      const result: boolean[] = [];
      if (!(matchGlobs.currMatch?.myTeam()?.QuintettoQuarto[quarter - 1] ?? false))
         result.push(true);
      if (!(matchGlobs.currMatch?.oppTeam()?.QuintettoQuarto[quarter - 1] ?? false))
         result.push(false);
      return result;
   }


   // "Continua così" all'avvio di un quarto non ancora iniziato: i giocatori già in campo (fine del quarto
   // precedente, o quintetto base nel 1° quarto) diventano il quintetto registrato del quarto, senza toccare
   // il quintetto base della partita. Su un quarto già iniziato o senza nessuno in campo non si registra nulla.
   async AssegnaQuintettoDaInCampo (teams: boolean[]): Promise<void>
   {
      if ((!this.compTimer) || (this.compTimer.IsCurrentQuarterStarted()))
         return;
      const quarter = this.compTimer.GetQuarterNumber();
      for (const isMyTeam of teams)
      {
         const team = isMyTeam ? matchGlobs.currMatch?.myTeam() : matchGlobs.currMatch?.oppTeam();
         const inCampo = (team?.Roster ?? []).filter(p => p.inGioco());
         if ((!team) || (inCampo.length === 0))
            continue;
         team.QuintettoQuarto[quarter - 1] = true;
         await this.AddQuintettoOperations (inCampo, this.compTimer.GetTimeSeconds(), isMyTeam);
      }
   }


   async onTimerStarted (event: { id: string })
   {
      if (event.id === 'comptimer')
      {
         await this.AddTimeOperation (TOperationType.totTimeStart);
         this.SaveQuarterState (this.compTimer?.currQuarter ?? '1q');
      }
   }


   async onTimerStopped (event: { id: string })
   {
      if (event.id === 'comptimer')
      {
         await this.AddTimeOperation (TOperationType.totTimeStop);
         this.RefreshFrozenClock();
         this.SaveQuarterState (this.compTimer?.currQuarter ?? '1q');
      }
   }


   // Accoda il salvataggio su bbs_quarter dello stato del quarto indicato (tempo rimanente, stato, punti, falli)
   SaveQuarterState (quarto: string,
                     timeRemaining?: number): void
   {
      if (!this.compTimer)
         return;
      const time = timeRemaining ?? ((this.compTimer.currQuarter === quarto) ? this.compTimer.GetTimeSeconds() : 0);
      const status = (time <= 0) ? 'PLAYED' : (this.compTimer.IsQuarterStarted(quarto) ? 'PLAYING' : 'NOTPLAYED');
      this.matchSync.EnqueueQuarterState({
         matchHeaderId: this.matchHeader.id,
         num:           this.QuarterKeyToNumber(quarto),
         status,
         timeRemaining: time,
         myTeam:        matchGlobs.currMatch?.myTeam() ?? null,
         oppTeam:       matchGlobs.currMatch?.oppTeam() ?? null
      });
   }


   public RegisterDataComponent (id: string,
                                 instance: DataCompComponent)
   {
      this.dataCompInstances.set (id, instance);
   }


   public UnregisterDataComponent (id: string)
   {
      this.dataCompInstances.delete (id);
   }


   public RegisterPointsComponent (id: string,
                                   instance: PointsCompComponent)
   {
      this.pointsCompInstances.set (id, instance);
   }


   public UnregisterPointsComponent (id: string)
   {
      this.pointsCompInstances.delete (id);
   }


   async PointsWrong1 (id: string)
   {
      if (id == "tl")
      {
         if (this.compTL)
         {
            this.compTL.Flash();
            await this.RegistraRealizzazione(TTipoRealizzazione.trTL, false);
         }
      }
      else if (id == "t2")
      {
         if (this.compT2)
         {
            this.compT2.Flash();
            await this.RegistraRealizzazione(TTipoRealizzazione.trT2, false);
         }
      }
      else if (id == "t3")
      {
         if (this.compT3)
         {
            this.compT3.Flash();
            await this.RegistraRealizzazione(TTipoRealizzazione.trT3, false);
         }
      }
   }


   async PointsOk1 (id: string)
   {
      if (id == "tl")
      {
         if (this.compTL)
         {
            this.compTL.Flash();
            await this.RegistraRealizzazione(TTipoRealizzazione.trTL, true);
         }
      }
      else if (id == "t2")
      {
         if (this.compT2)
         {
            this.compT2.Flash();
            await this.RegistraRealizzazione(TTipoRealizzazione.trT2, true);
         }
      }
      else if (id == "t3")
      {
         if (this.compT3)
         {
            this.compT3.Flash();
            await this.RegistraRealizzazione(TTipoRealizzazione.trT3, true);
         }
      }
   }


   async PointsWrong2 (id: string)
   {
      if (id == "tl")
      {
         if (this.compTL)
         {
            this.compTL.Flash();
            await this.RegistraRealizzazione(TTipoRealizzazione.trTL, false);
         }
      }
      else if (id == "t2")
      {
         if (this.compT2)
         {
            this.compT2.Flash();
            await this.AddRimbalzoAttaccoOperation();
            await this.RegistraRealizzazione(TTipoRealizzazione.trT2, false);
         }
      }
      else if (id == "t3")
      {
         if (this.compT3)
         {
            this.compT3.Flash();
            await this.RegistraRealizzazione(TTipoRealizzazione.trT3, false);
         }
      }
   }


   async PointsOk2 (id: string)
   {
      if (id == "tl")
      {
         if (this.compTL)
         {
            this.compTL.Flash();
            await this.RegistraRealizzazione(TTipoRealizzazione.trTL, true);
         }
      }
      else if (id == "t2")
      {
         if (this.compT2)
         {
            this.compT2.Flash();
            await this.AddRimbalzoAttaccoOperation();
            await this.RegistraRealizzazione(TTipoRealizzazione.trT2, true);
         }
      }
      else if (id == "t3")
      {
         if (this.compT3)
         {
            this.compT3.Flash();
            await this.RegistraRealizzazione(TTipoRealizzazione.trT3, true);
         }
      }
   }


   async AddRimbalzoAttaccoOperation (): Promise<void>
   {
      const player = this.currSelectedPlayer;
      if (!player)
         return;
      this.UpdateCommandsData(player);
      this.compRimb?.Flash();
      await this.AddGameOperation(TOperationType.totRimbAttacco, player);
   }


   async RegistraRealizzazione (tipo: TTipoRealizzazione,
                                fatto: boolean): Promise<void>
   {
      const player = this.currSelectedPlayer;
      if (!player || !matchGlobs.currMatch)
         return;
      let oper: TOperationType;
      switch (tipo)
      {
         case TTipoRealizzazione.trTL:
            oper = fatto ? TOperationType.totTLYes : TOperationType.totTLNo;
            break;
         case TTipoRealizzazione.trT2:
            oper = fatto ? TOperationType.totT2Yes : TOperationType.totT2No;
            break;
         case TTipoRealizzazione.trT3:
            oper = fatto ? TOperationType.totT3Yes : TOperationType.totT3No;
            break;
         default:
            return;
      }
      const quarter = this.compTimer ? this.compTimer.GetQuarterNumber() : 0;
      const time = this.compTimer ? this.compTimer.GetTimeSeconds() : 0;
      const isMyTeam = (this.currSelectedPlayer?.isMyTeam() ?? false);
      const opList = await matchGlobs.currMatch.EnsureOperationList();
      const op = new TOperation(quarter, time, oper, isMyTeam, player);
      // realizzazione del giocatore e punti del quarto: vedi TOperationList.ApplyOperation
      opList.ApplyOperation(op);
      this.UpdateCommandsData(player);
      await this.compMyTeam?.Update();
      await this.compOppoTeam?.Update();
      await opList.Add(op);
      this.ScrollOperazioniToBottom();
   }


   async DataBtn1Clicked (id: string)
   {
      if (id == "data-rimb")
      {
         if (this.compRimb)
         {
            const player = this.currSelectedPlayer;
            if (player)
            {
               this.UpdateCommandsData(player);
               this.compRimb.Flash();
               await this.AddGameOperation(TOperationType.totRimbDifesa, player);
            }
         }
      }
      else if (id == "data-palle")
      {
         (this.compPalle)
         {
            const player = this.currSelectedPlayer;
            if (player)
            {
               this.UpdateCommandsData(player);
               this.compPalle?.Flash();
               await this.AddGameOperation(TOperationType.totPPersa, player);
            }
         }
      }
      else if (id == "data-stopp")
      {
         if (this.compStopp)
         {
            const player = this.currSelectedPlayer;
            if (player)
            {
               this.UpdateCommandsData(player);
               this.compStopp?.Flash();
               await this.AddGameOperation(TOperationType.totStopSubita, player);
            }
         }
      }
      else if (id == "data-assist")
      {
         if (this.compAssist)
         {
            const player = this.currSelectedPlayer;
            if (player)
            {
               this.UpdateCommandsData(player);
               this.compAssist?.Flash();
               await this.AddGameOperation(TOperationType.totAssist, player);
            }
         }
      }
      else if (id == "data-falli")
      {
         if (this.compFalli)
         {
            const player = this.currSelectedPlayer;
            if (player)
            {
               if (this.compTimer)
               {
                  this.compTimer.stop();
               }
               this.playerForFalli = player;
               this.quartoForFalli = this.compTimer ? this.compTimer.GetQuarterNumber() : 0;
               this.tempoForFalli  = this.compTimer ? this.compTimer.GetTimeSeconds()  : 0;
               this.dialogVisible_Falli = true;
               this.UpdateCommandsData(player);
               this.compFalli?.Flash();
            }
         }
      }
   }


   async DataBtn2Clicked (id: string)
   {
      if (id == "data-rimb")
      {
         if (this.compRimb)
         {
            const player = this.currSelectedPlayer;
            if (player)
            {
               this.UpdateCommandsData(player);
               this.compRimb.Flash();
               await this.AddGameOperation(TOperationType.totRimbAttacco, player);
            }
         }
      }
      else if (id == "data-palle")
      {
         (this.compPalle)
         {
            const player = this.currSelectedPlayer;
            if (player)
            {
               this.UpdateCommandsData(player);
               this.compPalle?.Flash();
               await this.AddGameOperation(TOperationType.totPRecuperata, player);
            }
         }
      }
      else if (id == "data-stopp")
      {
         if (this.compStopp)
         {
            const player = this.currSelectedPlayer;
            if (player)
            {
               this.UpdateCommandsData(player);
               this.compStopp?.Flash();
               await this.AddGameOperation(TOperationType.totStopFatta, player);
            }
         }
      }
      else if (id == "data-falli")
      {
         if (this.compFalli)
         {
            const player = this.currSelectedPlayer;
            if (player)
            {
               this.UpdateCommandsData(player);
               this.compFalli?.Flash();
               await this.AddGameOperation(TOperationType.totFalloSubito, player);
            }
         }
      }
   }


   GetPlayerByBenchId(id: string): TMatchPlayer | null
   {
      const myRef = this.myBenchRefs.find(ref => ref.instance.componentId === id);
      if (myRef?.instance.player)
         return myRef.instance.player;
      const oppoRef = this.oppoBenchRefs.find(ref => ref.instance.componentId === id);
      if (oppoRef?.instance.player)
         return oppoRef.instance.player;
      return null;
   }


   async AddGameOperation (oper: TOperationType,
                           player: TMatchPlayer | null,
                           desc: string = ''): Promise<void>
   {
      if (!player || !matchGlobs.currMatch)
         return;
      const opList = await matchGlobs.currMatch.EnsureOperationList();
      const quarter = this.compTimer ? this.compTimer.GetQuarterNumber() : 0;
      const time = this.compTimer ? this.compTimer.GetTimeSeconds() : 0;
      const isMyTeam = (this.currSelectedPlayer?.isMyTeam() ?? false);
      const op = new TOperation(quarter, time, oper, isMyTeam, player, undefined, desc);
      opList.ApplyOperation(op);
      await opList.Add(op);
      this.UpdateCommandsData(player);
      this.ScrollOperazioniToBottom();
   }


   // OK nella dialog timeout di una squadra con qualche modifica: si registra la fotografia completa dei suoi
   // timeout (anche se un timeout è stato tolto, es. perché assegnato alla squadra sbagliata), applicata con
   // ApplyOperation come ogni altra operazione, così viene salvata e ricostruita ricaricando la partita.
   async onTimeoutsChanged (isMyTeam: boolean,
                            event: { prima: string, dopo: string }): Promise<void>
   {
      if (!matchGlobs.currMatch)
         return;
      const opList = await matchGlobs.currMatch.EnsureOperationList();
      const quarter = this.compTimer ? this.compTimer.GetQuarterNumber() : 0;
      const time = this.compTimer ? this.compTimer.GetTimeSeconds() : 0;
      const [t1, t2, te] = event.dopo.split('|');
      // solo caratteri ASCII: la connessione PHP al database non dichiara la codifica (vedi database.php)
      const desc = `1T ${t1} 2T ${t2} Supl ${te}`;
      const op = new TOperation(quarter, time, TOperationType.totTimeout, isMyTeam, undefined, undefined, desc, 0, `${event.prima}>${event.dopo}`);
      opList.ApplyOperation(op);
      await opList.Add(op);
      await this.compMyTeam?.Update();
      await this.compOppoTeam?.Update();
      this.ScrollOperazioniToBottom();
   }


   async AddTimeOperation (oper: TOperationType): Promise<void>
   {
      if (!matchGlobs.currMatch)
         return;
      const opList = await matchGlobs.currMatch.EnsureOperationList();
      const quarter = this.compTimer ? this.compTimer.GetQuarterNumber() : 0;
      const time = this.compTimer ? this.compTimer.GetTimeSeconds() : 0;
      const op = new TOperation(quarter, time, oper, true);
      await opList.Add(op);
      this.ScrollOperazioniToBottom();
   }


   async BtnUndoClick (): Promise<void>
   {
      if (!matchGlobs.currMatch)
         return;
      const opList = await matchGlobs.currMatch.EnsureOperationList();
      const count = await opList.GetCount();
      if (count > 0)
      {
         await opList.RemoveAction(count - 1);
         await this.compMyTeam?.Update();
         await this.compOppoTeam?.Update();
         this.UpdateCommandsData(this.currSelectedPlayer);
         this.cdr.detectChanges();
      }
   }


   async BtnCheckPointClick (): Promise<void>
   {
      if (!matchGlobs.currMatch)
         return;
      const opList = await matchGlobs.currMatch.EnsureOperationList();
      const quarter = this.compTimer ? this.compTimer.GetQuarterNumber() : 0;
      const time = this.compTimer ? this.compTimer.GetTimeSeconds() : 0;
      const op = new TOperation(quarter, time, TOperationType.totCheckPoint, true, undefined, undefined, 'CheckPoint');
      await opList.Add(op);
      this.ScrollOperazioniToBottom();
   }


   ScrollOperazioniToBottom(): void
   {
      setTimeout(() =>
      {
         this.tableOperazioni?.scrollTo({ top: Number.MAX_SAFE_INTEGER });
      }, 0);
   }


   UpdateCommandsData(player: TMatchPlayer | null)
   {
      if (this.compPalle)
      {
         this.compPalle.dato1 = player ? player.pPerse().toString()      : "0";
         this.compPalle.dato2 = player ? player.pRecuperate().toString() : "0";
      }
      if (this.compRimb)
      {
         this.compRimb.dato1 = player ? player.rimbDifesa().toString()  : "0";
         this.compRimb.dato2 = player ? player.rimbAttacco().toString() : "0";
         this.compRimb.dato  = player ? `Totali ${player.rimbDifesa() + player.rimbAttacco()}` : "";
      }
      if (this.compStopp)
      {
         this.compStopp.dato1 = player ? player.stoppSubite().toString()   : "0";
         this.compStopp.dato2 = player ? player.stoppFatte().toString()    : "0";
      }
      if (this.compAssist)
      {
         this.compAssist.dato1 = player ? player.assist().toString()   : "0";
      }
      if (this.compFalli)
      {
         this.compFalli.dato1 = player ? player.GetFalliFatti().toString()   : "0";
         this.compFalli.dato2 = player ? player.falliSubiti().toString()    : "0";
      }
      if (this.compTL)
      {
         this.compTL.dato1 = player ? `${player.CalcTLRealizz()}/${player.CalcTLTentati()}` : "00/00";
         this.compTL.dato  = player ? player.CalcTLPunti().toString() : "0";
      }
      if (this.compT2)
      {
         this.compT2.dato1 = player ? `${player.CalcT2Realizz()}/${player.CalcT2Tentati()}` : "00/00";
         this.compT2.dato  = player ? player.CalcT2Punti().toString() : "0";
      }
      if (this.compT3)
      {
         this.compT3.dato1 = player ? `${player.CalcT3Realizz()}/${player.CalcT3Tentati()}` : "00/00";
         this.compT3.dato  = player ? player.CalcT3Punti().toString() : "0";
      }
   }


   async BenchClicked(id: string)
   {
      const player = this.GetPlayerByBenchId(id);
      await this.SelectPlayer(player);
      this.currBench = id;
   }


   BenchDoubleClicked(id: string)
   {
      this.currBench = id;
      const dlgData: MessDlgData = {
         title:      'DBLCLICK',
         subtitle:   "",
         message:    `Doppio click ${this.currBench}`,
         messtype:   'info',
         btncaption: 'Chiudi'
      };
      this.messageDialogService.showMessage (dlgData, '600px');
   }


   async ClearSelection()
   {
      this.currSel = null;
      this.currSelectedPlayer = null;
      matchGlobs.currSavedMatch.currSelectionId = 0;
      matchGlobs.currSavedMatch.currSelectionType = "";
      this.currBench = "";
      this.currPlayer = "";
      this.currTeam = "";
      this.UpdateCommandsData(null);
      this.compMyTeam.isSelected = false;
      this.compOppoTeam.isSelected = false;
      for (let iii=0;   iii<5;   iii++)
      {
         this.MyFieldPlayers[iii].isSelected = false;
         this.OppoFieldPlayers[iii].isSelected = false;
      }
      for (let iii=0;   iii<this.myBenchRefs.length;   iii++)
      {
         this.myBenchRefs[iii].instance.isSelected = false;
      }
      for (let iii=0;   iii<this.oppoBenchRefs.length;   iii++)
      {
         this.oppoBenchRefs[iii].instance.isSelected = false;
      }
   }


   async UpdateSelection (senderType: string,
                          senderId: string)
   {
      await this.ClearSelection();
      senderType = senderType.toLowerCase();
      senderId = senderId.toLowerCase();
      if (senderType == "team")
      {
         if (senderId == "compmyteam")
         {
            this.compMyTeam.isSelected = true;
         }
         else if (senderId == "compoppoteam")
         {
            this.compOppoTeam.isSelected = true;
         }
      }
      /*
      {
         if (sender.type == "iteam")
         {
            if (this.compMyTeam.teamName == (sender as ITeam).nome)
            {
               this.currSel = (sender as ITeam);
               this.currSavedMatch.currSelectionId = (sender as ITeam).id;
               this.currSavedMatch.currSelectionType = "team";
               this.compMyTeam.isSelected = true;
            }
            if (this.compOppoTeam.teamName == (sender as ITeam).nome)
            {
               this.currSel = (sender as ITeam);
               this.currSavedMatch.currSelectionId = (sender as ITeam).id;
               this.currSavedMatch.currSelectionType = "team";
               this.compOppoTeam.isSelected = true;
            }
         }
         if (sender.type == "tdsplayer")
         {
            for (let iii=0;   iii<5;   iii++)
            {
               if (this.MyFieldPlayers[iii].playerName == (sender as TPlayer).nomedisp)
               {
                  this.currSel = (sender as TPlayer);
                  this.currSavedMatch.currSelectionId = (sender as TPlayer).id;
                  this.currSavedMatch.currSelectionType = "player";
                  this.MyFieldPlayers[iii].isSelected = true;
               }
            }
            for (let iii=0;   iii<5;   iii++)
            {
               if (this.OppoFieldPlayers[iii].playerName == (sender as TPlayer).nomedisp)
               {
                  this.currSel = (sender as TPlayer);
                  this.currSavedMatch.currSelectionId = (sender as TPlayer).id;
                  this.currSavedMatch.currSelectionType = "player";
                  this.OppoFieldPlayers[iii].isSelected = true;
               }
            }
         }
      }
      */
   }


   async BtnSostit()
   {
      this.pendingQuintettoTeams = [];
      this.OpenSostituzioneDialog (!this.compOppoTeam.isSelected, false);
   }


   // Squadre (true = myTeam) per cui aprire in sequenza la dialog Quintetto, dopo "Imposta quintetto"
   // all'avvio del cronometro (vedi onStartRequested)
   private pendingQuintettoTeams: boolean[] = [];
   // true se la dialog va aperta con i giocatori in campo già selezionati (proposta di quintetto)
   private sostPreselectInGioco: boolean = false;


   OpenNextPendingQuintetto (): void
   {
      const isMyTeam = this.pendingQuintettoTeams.shift();
      if (isMyTeam !== undefined)
         this.OpenSostituzioneDialog (isMyTeam, true);
   }


   OpenSostituzioneDialog (isMyTeam: boolean,
                           preselectInGioco: boolean): void
   {
      this.sostPreselectInGioco = preselectInGioco;
      if (!isMyTeam)
      {
         const team = matchGlobs.currMatch?.oppTeam();
         this.sostTeamName  = team?.name() ?? '';
         this.sostTeamColor = this.matchHeader.oppoTeamColor || '#FFFFFF';
         this.sostPlayers   = team?.Roster ?? [];
         this.sostIsMyTeam  = false;
      }
      else
      {
         const team = matchGlobs.currMatch?.myTeam();
         this.sostTeamName  = team?.name() ?? '';
         this.sostTeamColor = this.matchHeader.myTeamColor || '#FFFFFF';
         this.sostPlayers   = team?.Roster ?? [];
         this.sostIsMyTeam  = true;
      }
      this.prevOnCourtSost = this.sostPlayers.filter(p => p.inGioco());
      this.sostTempo = this.compTimer?.displayTime ?? '';
      this.dialogVisible_Sostit = true;
   }


   async onSostituzioneDialogShow()
   {
      if (this.sostituzioneComp)
      {
         await this.sostituzioneComp.onComponentShow (this.compTimer?.displayTime ?? '', this.sostPreselectInGioco);
      }
   }


   async onSostituzioneSave(event: { players: TMatchPlayer[], azione: string, usciti?: TMatchPlayer[], entrati?: TMatchPlayer[], quintetto?: TMatchPlayer[], tempoSec?: number }): Promise<void>
   {
      // i flag inGioco sono già stati aggiornati dentro il componente
      this.dialogVisible_Sostit = false;
      if (event.azione == "quintetto")
      {
         // Il flag "titolare" (InQuintetto) vale solo per il 1° quarto (porting da FaiQuintetto, BSDEvo.Dlg.Sostituzione.pas:564,574)
         const quarter = this.compTimer ? this.compTimer.GetQuarterNumber() : 0;
         if (quarter === 1)
         {
            const selezionati = new Set<TMatchPlayer>(event.quintetto ?? []);
            event.players.forEach(p => p.inQuintetto.set(selezionati.has(p)));
            await this.SaveQuintettoToDB (event.players);
         }
         // Chi era in campo prima (es. quintetto del quarto precedente) e non fa parte del nuovo quintetto è
         // stato appena messo inGioco=false dalla dialog, ma senza mai passare da AddSostituzioneOperations:
         // va quindi consolidato qui, altrimenti il suo tempo resta a zero (vedi ConsolidateOutgoingPlayers).
         // Usiamo il tempo "congelato" (ultimo stop reale) e non event.tempoSec: se si cambia quarto, quello è
         // il cronometro del quarto NUOVO (appena resettato al massimo), non quello a cui questi giocatori
         // hanno smesso di giocare nel quarto precedente — il congelato resta invece corretto in entrambi i
         // casi, dato che non viene toccato finché il nuovo quarto non viene effettivamente avviato.
         const nuovoSet = new Set<TMatchPlayer>(event.quintetto ?? []);
         const uscentiPerCambioQuintetto = this.prevOnCourtSost.filter(p => !nuovoSet.has(p));
         this.ConsolidateOutgoingPlayers (uscentiPerCambioQuintetto, this.frozenClockSeconds);
         await this.AddQuintettoOperations (event.quintetto ?? [], event.tempoSec ?? 0);
      }
      else if (event.azione == "incampo")
      {
         await this.AddSostituzioneOperations (event.usciti ?? [], event.entrati ?? []);
      }
      else if (event.azione == "sostituzione")
      {
         await this.AddSostituzioneOperations (event.usciti ?? [], event.entrati ?? []);
      }
      // Il nuovo/aggiornato "in campo" va misurato da adesso: se il cronometro era già fermo (caso normale
      // per una sostituzione) non scatterebbe altrimenti onTimerStopped a rinfrescare il valore congelato.
      this.RefreshFrozenClock();
      this.UpdateFieldPlayers();
      await this.TeamClicked(this.sostIsMyTeam ? 'compmyteam' : 'compoppoteam');
      // Dopo "Imposta quintetto" all'avvio: passa alla squadra successiva ancora senza quintetto. Il timeout
      // lascia chiudere la dialog corrente, così la riapertura rifà onShow (e quindi la preselezione).
      if (this.pendingQuintettoTeams.length > 0)
         setTimeout(() => this.OpenNextPendingQuintetto());
   }


   OrdinaPlayersByNumero (a: TMatchPlayer,
                          b: TMatchPlayer): number
   {
      const numA = a.playNumber();
      const numB = b.playNumber();

      if (numA === "0")
         return numB === "0" ? 0 : -1;
      if (numB === "0")
         return 1;

      if (numA === "00")
         return numB === "00" ? 0 : -1;
      if (numB === "00")
         return 1;

      return parseInt(numA, 10) - parseInt(numB, 10);
   }


   UpdateFieldPlayers(): void
   {
      this.UpdateTeamFieldPlayers(matchGlobs.currMatch?.myTeam() ?? null, this.MyFieldPlayers);
      this.UpdateTeamFieldPlayers(matchGlobs.currMatch?.oppTeam() ?? null, this.OppoFieldPlayers);
      this.cdr.detectChanges();
   }


   UpdateTeamFieldPlayers (team: TMatchTeam | null,
                           slots: Array<PlayerCompComponent>): void
   {
      const inCampo = (team?.Roster ?? []).filter(p => p.inGioco()).sort((a, b) => this.OrdinaPlayersByNumero(a, b));
      for (let iii=0;   iii<slots.length;   iii++)
      {
         if (slots[iii])
            slots[iii].player = inCampo[iii] ?? null;
      }
   }


   async AddSostituzioneOperations (usciti: TMatchPlayer[],
                                    entrati: TMatchPlayer[]): Promise<void>
   {
      if (!matchGlobs.currMatch)
         return;
      const opList = await matchGlobs.currMatch.EnsureOperationList();
      const quarter = this.compTimer ? this.compTimer.GetQuarterNumber() : 0;
      const count = Math.min (usciti.length, entrati.length);
      // Diff calcolato una sola volta per l'intera sostituzione (porting da FaiSostituzione, BSDEvo.Dlg.Sostituzione.pas:629)
      const diff = (matchGlobs.currMatch.myTeam()?.CalcPunti() ?? 0) - (matchGlobs.currMatch.oppTeam()?.CalcPunti() ?? 0);
      for (let i=0;   i<count;   i++)
      {
         const playerOut = usciti[i];
         const playerIn  = entrati[i];
         const time = playerOut.outTime();
         const op = new TOperation(quarter, time, TOperationType.totSostituz, this.sostIsMyTeam, playerOut, playerIn);
         await opList.Add(op);
         // Plus/Minus e tempo di gioco (porting da FaiSostituzione, BSDEvo.Dlg.Sostituzione.pas:652-659)
         playerOut.tempoGioco.set(playerOut.tempoGioco() + (playerOut.inTime() - playerOut.outTime()));
         playerOut.plusMinus.set(playerOut.plusMinus() + (diff - playerOut.fPMIn));
         playerIn.outTime.set(playerIn.inTime());
         playerIn.currCronotime = playerIn.inTime();
         playerIn.fPMIn = diff;
      }
      this.ScrollOperazioniToBottom();
   }


   // Consolida (tempoGioco, plusMinus, outTime) e toglie dal campo (inGioco=false) i giocatori indicati —
   // stessa logica di AddSostituzioneOperations lato "usciti", ma senza bisogno di un pari numero di
   // "entrati" (usata per il cambio quarto: vedi onQuarterChanged).
   ConsolidateOutgoingPlayers (players: TMatchPlayer[],
                               atTime: number): void
   {
      if ((players.length === 0) || (!matchGlobs.currMatch))
         return;
      const diff = (matchGlobs.currMatch.myTeam()?.CalcPunti() ?? 0) - (matchGlobs.currMatch.oppTeam()?.CalcPunti() ?? 0);
      for (const p of players)
      {
         p.tempoGioco.set(p.tempoGioco() + (p.inTime() - atTime));
         p.plusMinus.set(p.plusMinus() + (diff - p.fPMIn));
         p.outTime.set(atTime);
         p.inGioco.set(false);
      }
   }


   // Giocatori in campo nell'ultimo momento di ciascun quarto lasciato in questa sessione (chiave = quarto, es.
   // "1q"/"1et"). Serve solo quando per quel quarto non ci sono operazioni da cui ricostruirlo (vedi LineupForQuarter).
   private quarterEndLineups: Record<string, TMatchPlayer[]> = {};


   // Quarto che precede quello indicato: "2q" -> "1q", "1et" -> ultimo quarto regolare, "2et" -> "1et".
   // Per il 1° quarto non esiste (null).
   PrevQuarterKey (quarto: string): string | null
   {
      const n = parseInt(quarto, 10);
      if (quarto.endsWith('et'))
         return (n > 1) ? `${n - 1}et` : `${globs.MaxRegQuarters}q`;
      return (n > 1) ? `${n - 1}q` : null;
   }


   // Stessa numerazione di TimerCompComponent.GetQuarterNumber (1..4 regolari, 5..8 supplementari)
   QuarterKeyToNumber (quarto: string): number
   {
      const n = parseInt(quarto, 10);
      return quarto.endsWith('et') ? globs.MaxRegQuarters + n : n;
   }


   // Ricostruisce chi è in campo nell'ultimo momento registrato di un quarto, rigiocando in ordine le sue
   // operazioni (già ordinate per tempo): un blocco di "Quintetto" imposta la formazione, ogni "Sostituzione"
   // toglie player1 e mette player2. I giocatori sono cercati per ID, perché gli oggetti TMatchPlayer vengono
   // ricreati ad ogni caricamento del roster. null = nessun quintetto registrato per quel quarto.
   LineupFromOperations (quarterNum: number,
                         isMyTeam: boolean): TMatchPlayer[] | null
   {
      const ops = (matchGlobs.currMatch?.matchOperList()?.items() ?? [])
         .filter(op => (op.quarter() === quarterNum) && (op.myTeam() === isMyTeam));
      let ids: Set<number> | null = null;
      let prevWasQuintetto = false;
      let prevCounter = -1;
      for (const op of ops)
      {
         const id1 = op.player1()?.playerRecID ?? 0;
         if (op.oper() === TOperationType.totQuintetto)
         {
            // Nuovo blocco di quintetto (es. riassegnato): non contiguo al precedente, o giocatore già presente
            if ((ids == null) || (!prevWasQuintetto) || (op.counter() !== prevCounter + 1) || (ids.has(id1)))
               ids = new Set<number>();
            if (id1 > 0)
               ids.add(id1);
            prevWasQuintetto = true;
         }
         else
         {
            if ((op.oper() === TOperationType.totSostituz) && (ids != null))
            {
               ids.delete(id1);
               const id2 = op.player2()?.playerRecID ?? 0;
               if (id2 > 0)
                  ids.add(id2);
            }
            prevWasQuintetto = false;
         }
         prevCounter = op.counter();
      }
      if (ids == null)
         return null;
      const team = isMyTeam ? matchGlobs.currMatch?.myTeam() : matchGlobs.currMatch?.oppTeam();
      const idSet: Set<number> = ids;
      return (team?.Roster ?? []).filter(p => idSet.has(p.playerRecID));
   }


   // Giocatori da presentare in campo per una squadra selezionando un quarto, cioè la situazione del suo
   // ultimo momento di gioco:
   //  1. operazioni del quarto (quintetto + sostituzioni), se ce ne sono: vale per quarti in gioco, terminati,
   //     o non ancora avviati ma con il quintetto già confermato;
   //  2. quarto non ancora avviato: il 1° quarto presenta il quintetto base, gli altri i giocatori finali del
   //     quarto precedente (ricorsivamente con le stesse regole);
   //  3. quarto avviato senza operazioni: chi c'era quando lo si è lasciato in questa sessione.
   LineupForQuarter (quarto: string,
                     isMyTeam: boolean): TMatchPlayer[]
   {
      const fromOps = this.LineupFromOperations(this.QuarterKeyToNumber(quarto), isMyTeam);
      if (fromOps != null)
         return fromOps;
      const team = isMyTeam ? matchGlobs.currMatch?.myTeam() : matchGlobs.currMatch?.oppTeam();
      const started = this.compTimer ? this.compTimer.IsQuarterStarted(quarto) : false;
      if (!started)
      {
         const prev = this.PrevQuarterKey(quarto);
         if (prev == null)
            return (team?.Roster ?? []).filter(p => p.inQuintetto());
         return this.LineupForQuarter(prev, isMyTeam);
      }
      return (this.quarterEndLineups[quarto] ?? []).filter(p => p.isMyTeam() === isMyTeam);
   }


   // Inverso di QuarterKeyToNumber: 1..4 -> "1q".."4q", 5..8 -> "1et".."4et"
   QuarterNumberToKey (num: number): string
   {
      return (num <= globs.MaxRegQuarters) ? `${num}q` : `${num - globs.MaxRegQuarters}et`;
   }


   // Carica gli eventi della partita e la ricostruisce rigiocandoli. false = nessun evento (partita da iniziare).
   async LoadMatchFromEvents (): Promise<boolean>
   {
      const cm = matchGlobs.currMatch;
      if ((!cm) || (!(this.matchHeader?.id > 0)))
         return false;
      const myTeam = cm.myTeam();
      const oppTeam = cm.oppTeam();
      const { events, source } = await this.matchSync.LoadMatchEvents(this.matchHeader.id);
      if (source === 'local')
         this.msgService.add({ severity: 'warn', summary: 'Senza connessione',
                               detail: (events.length > 0)
                                  ? 'Azioni lette dalla copia locale: verranno allineate col server al ritorno della connessione'
                                  : 'Impossibile leggere le azioni dal server e nessuna copia locale per questa partita' });
      const opList = await cm.EnsureOperationList();
      await opList.Destroy();
      if (events.length === 0)
         return false;
      myTeam?.ResetForReplay();
      oppTeam?.ResetForReplay();
      // AddNoSort non notifica OnItemAdded: gli eventi caricati non vanno rimessi in coda per l'invio
      for (const ev of events)
         await opList.AddNoSort (this.matchSync.EventToOperation(ev, myTeam, oppTeam));
      await opList.Refresh();
      this.ReplayOperations (opList, opList.items());
      this.ScrollOperazioniToBottom();
      return true;
   }


   // Rigioca in ordine le operazioni (già ordinate per quarto/tempo/sequenza), come se venissero registrate
   // adesso: effetti statistici con TOperationList.ApplyOperation (lo stesso usato dal live), e in più chi è
   // in campo, tempo di gioco e plus/minus con le stesse regole di quintetto (AddQuintettoOperations),
   // sostituzione (AddSostituzioneOperations) e cambio quarto (onQuarterChanged). Alla fine il cronometro
   // viene riportato, fermo, sul quarto dell'ultima operazione e sull'ultimo tempo registrato.
   ReplayOperations (opList: TOperationList,
                     ops: TOperation[]): void
   {
      const myTeam = matchGlobs.currMatch?.myTeam() ?? null;
      const oppTeam = matchGlobs.currMatch?.oppTeam() ?? null;
      const allPlayers = [...(myTeam?.Roster ?? []), ...(oppTeam?.Roster ?? [])];
      const onCourt = (isMyTeam?: boolean) => allPlayers.filter(p => p.inGioco() && ((isMyTeam === undefined) || (p.isMyTeam() === isMyTeam)));
      const diffNow = () => (myTeam?.CalcPunti() ?? 0) - (oppTeam?.CalcPunti() ?? 0);
      const maxTimeOf = (q: number) => (q <= globs.MaxRegQuarters) ? globs.DurationRegulTime : globs.DurationExtraTime;

      allPlayers.forEach(p => p.inGioco.set(false));
      this.quarterEndLineups = {};
      const quarterTimes: Record<string, number> = {};
      let currQ = 0;
      let lastTime = 0;
      // blocco di operazioni "Quintetto" in corso (stesso criterio di LineupFromOperations)
      let quintTeam: boolean | null = null;
      let quintIds = new Set<number>();
      let prevCounter = -1;

      for (const op of ops)
      {
         const q = op.quarter();
         if (q !== currQ)
         {
            // cambio quarto: chiude gli stint del quarto lasciato e riparte dai giocatori che lo hanno finito
            // (nel 1° quarto dal quintetto base)
            let startLineup: TMatchPlayer[];
            if (currQ > 0)
            {
               const key = this.QuarterNumberToKey(currQ);
               quarterTimes[key] = lastTime;
               const oc = onCourt();
               this.quarterEndLineups[key] = [...oc];
               this.ConsolidateOutgoingPlayers (oc, lastTime);
               startLineup = oc;
            }
            else
               startLineup = allPlayers.filter(p => p.inQuintetto());
            currQ = q;
            lastTime = maxTimeOf(q);
            this.PutPlayersOnCourt (startLineup, lastTime);
            quintTeam = null;
         }
         lastTime = op.time();
         opList.ApplyOperation (op);

         const p1 = op.player1();
         const p2 = op.player2();
         if (op.oper() === TOperationType.totQuintetto)
         {
            const id1 = p1?.playerRecID ?? 0;
            const nuovoBlocco = (quintTeam !== op.myTeam()) || (op.counter() !== prevCounter + 1) || (quintIds.has(id1));
            if (nuovoBlocco)
            {
               // il nuovo quintetto sostituisce chi era in campo per quella squadra
               this.ConsolidateOutgoingPlayers (onCourt(op.myTeam()), op.time());
               quintIds = new Set<number>();
               quintTeam = op.myTeam();
            }
            if (p1)
            {
               quintIds.add(id1);
               this.PutPlayersOnCourt ([p1], maxTimeOf(q));
            }
         }
         else
         {
            quintTeam = null;
            if (op.oper() === TOperationType.totSostituz)
            {
               const diff = diffNow();
               if (p1 && p1.inGioco())
               {
                  p1.tempoGioco.set(p1.tempoGioco() + (p1.inTime() - op.time()));
                  p1.plusMinus.set(p1.plusMinus() + (diff - p1.fPMIn));
                  p1.outTime.set(op.time());
                  p1.inGioco.set(false);
               }
               if (p2)
               {
                  p2.inTime.set(op.time());
                  p2.outTime.set(op.time());
                  p2.currCronotime = op.time();
                  p2.fPMIn = diff;
                  p2.inGioco.set(true);
               }
            }
         }
         prevCounter = op.counter();
      }
      if (currQ > 0)
      {
         const key = this.QuarterNumberToKey(currQ);
         quarterTimes[key] = lastTime;
         this.compTimer?.RestoreState (key, quarterTimes);
      }
   }


   // Mette in campo, per entrambe le squadre, la situazione dell'ultimo momento di gioco del quarto indicato.
   // Lo stint riparte dal tempo attuale del cronometro di quel quarto: quanto giocato prima è già stato
   // consolidato in tempoGioco/plusMinus quando il quarto è stato lasciato (vedi onQuarterChanged).
   ApplyLineupForQuarter (quarto: string): void
   {
      const maxTime = quarto.endsWith('et') ? globs.DurationExtraTime : globs.DurationRegulTime;
      const time = (this.compTimer && (this.compTimer.currQuarter === quarto)) ? this.compTimer.GetTimeSeconds() : maxTime;
      for (const isMyTeam of [true, false])
      {
         const team = isMyTeam ? matchGlobs.currMatch?.myTeam() : matchGlobs.currMatch?.oppTeam();
         (team?.Roster ?? []).forEach(p => p.inGioco.set(false));
         this.PutPlayersOnCourt (this.LineupForQuarter(quarto, isMyTeam), time);
      }
   }


   // Un cambio di quarto (SelezionaQuarto nel timer) chiude implicitamente lo stint di chiunque sia ancora in
   // campo dal quarto abbandonato: va consolidato subito, usando il suo ultimo tempo rimanente ("oldTime" -
   // NON quello del quarto nuovo, che darebbe un calcolo completamente sbagliato). Poi si presenta la
   // situazione del quarto selezionato (vedi LineupForQuarter).
   onQuarterChanged (event: { oldQuarto: string, oldTime: number, newQuarto: string })
   {
      const onCourt = [
         ...(matchGlobs.currMatch?.myTeam()?.Roster ?? []).filter(p => p.inGioco()),
         ...(matchGlobs.currMatch?.oppTeam()?.Roster ?? []).filter(p => p.inGioco())
      ];
      this.quarterEndLineups[event.oldQuarto] = [...onCourt];
      this.ConsolidateOutgoingPlayers (onCourt, event.oldTime);
      if (this.compTimer?.IsQuarterStarted(event.oldQuarto))
         this.SaveQuarterState (event.oldQuarto, event.oldTime);
      this.ApplyLineupForQuarter (event.newQuarto);
      this.RefreshFrozenClock();
      this.UpdateFieldPlayers();
   }


   async AddQuintettoOperations (players: TMatchPlayer[],
                                 time: number,
                                 isMyTeam: boolean = this.sostIsMyTeam): Promise<void>
   {
      if (!matchGlobs.currMatch)
         return;
      const opList = await matchGlobs.currMatch.EnsureOperationList();
      const quarter = this.compTimer ? this.compTimer.GetQuarterNumber() : 0;
      // Tempo massimo del quarto corrente, usato come riferimento iniziale (porting da FaiQuintetto, BSDEvo.Dlg.Sostituzione.pas:477-480, 508-510)
      const maxTime = (quarter <= globs.MaxRegQuarters) ? globs.DurationRegulTime : globs.DurationExtraTime;
      for (const player of players)
      {
         player.inTime.set(maxTime);
         player.outTime.set(maxTime);
         player.currCronotime = maxTime;
         const op = new TOperation(quarter, time, TOperationType.totQuintetto, isMyTeam, player);
         await opList.Add(op);
      }
      this.ScrollOperazioniToBottom();
   }


   onSostituzioneAnnulla(): void
   {
      this.pendingQuintettoTeams = [];
      this.dialogVisible_Sostit = false;
   }


   mnuModificaNomiNumery()
   {
      this.dialogVisible_NumeriNomi = true;
   }


   onNumeriNomiDialogShow()
   {
      this.numeriNomiComp?.onComponentShow();
   }


   async onNumeriNomiOk ()
   {
      this.dialogVisible_NumeriNomi = false;
      await this.SaveNumeriMagliaToDB();
      this.SyncRosterListsFromMatchPlayers();
      await this.compMyTeam?.Update();
      await this.compOppoTeam?.Update();
      await matchGlobs.currSavedMatch.SaveToStorage();
      this.cdr.detectChanges();
   }


   mnuAzioni()
   {
      this.dialogVisible_Azioni = true;
   }


   async BtnEliminaAzione (op: TOperation): Promise<void>
   {
      // La conferma è già stata chiesta dentro app-azioni-dlg prima di emettere l'evento.
      if (!matchGlobs.currMatch)
         return;
      const opList = await matchGlobs.currMatch.EnsureOperationList();
      await opList.RemoveAction(op);
      await this.compMyTeam?.Update();
      await this.compOppoTeam?.Update();
      this.UpdateCommandsData(this.currSelectedPlayer);
      this.cdr.detectChanges();
   }


   BtnModificaAzione (op: TOperation): void
   {
      this.msgService.add({ severity: 'info', summary: 'Modifica azione', detail: 'Non ancora implementato' });
   }


   async BtnEliminaTutteAzioni (): Promise<void>
   {
      // Riusa la stessa logica/conferma di "Azzera tutta la partita" (menu Gestione partita):
      // la tabella delle azioni si aggiorna da sola (mostrando "Nessuna operazione registrata")
      // dato che è collegata reattivamente a GetOperList().
      await this.mnuAzzeraTutto();
   }


   mnuTempiDiGioco()
   {
      this.dialogVisible_TempiGioco = true;
   }


   async onTempiGiocoDialogShow()
   {
      if (this.tempiGiocoComp)
      {
         const nowSec = this.compTimer ? this.compTimer.GetTimeSeconds() : 0;
         await this.tempiGiocoComp.onComponentShow(
            this.matchHeader.myTeamColor || '#FFFFFF',
            this.matchHeader.oppoTeamColor || '#FFFFFF',
            nowSec);
      }
   }


   async onTempiGiocoOk ()
   {
      this.dialogVisible_TempiGioco = false;
      // Il tempo "in campo" mostrato nei componenti giocatore va rinfrescato subito: è un'azione esplicita
      // dell'utente, non va aspettato il prossimo stop del cronometro (vedi RefreshFrozenClock).
      this.RefreshFrozenClock();
      await this.compMyTeam?.Update();
      await this.compOppoTeam?.Update();
      await matchGlobs.currSavedMatch.SaveToStorage();
      this.cdr.detectChanges();
   }


   // Falli di ogni giocatore all'apertura di una dialog dei falli (copie), da confrontare alla conferma
   private falliPrima = new Map<TMatchPlayer, TFallo[]>();


   SnapshotFalli (players: TMatchPlayer[]): void
   {
      this.falliPrima = new Map(players.map(p => [p, p.falliFatti().map(f => f.Clone())]));
   }


   // Trasforma le modifiche fatte nelle dialog dei falli (fallo singolo e "Falli totali") negli eventi che
   // sarebbero stati registrati durante il gioco, ciascuno al quarto/tempo del fallo stesso:
   //  - fallo aggiunto  -> nuovo evento "Fallo fatto";
   //  - fallo tolto     -> il suo evento viene tolto (e cancellato sul server);
   //  - fallo corretto (quarto, tempo, tipo, liberi) -> evento vecchio tolto e sostituito da quello corretto.
   // Il confronto è casella per casella (le 5 caselle falli del giocatore). I falli del giocatore sono già
   // stati aggiornati dalla dialog: qui si allinea solo la lista delle operazioni, senza riapplicare effetti.
   async RegistraModificheFalli (): Promise<void>
   {
      const cm = matchGlobs.currMatch;
      if (!cm)
         return;
      const opList = await cm.EnsureOperationList();
      const uguali = (a: TFallo, b: TFallo) =>
         (a.fCommesso === b.fCommesso) &&
         ((!a.fCommesso) || ((a.fQuarto === b.fQuarto) && (a.fTempo === b.fTempo) && (a.numLiberi === b.numLiberi) &&
                             (a.fTecnico === b.fTecnico) && (a.fAntisportivo === b.fAntisportivo) && (a.fEspulsione === b.fEspulsione)));
      const tolte = new Set<TOperation>();
      for (const [player, prima] of this.falliPrima)
      {
         const dopo = player.falliFatti();
         for (let i = 0; i < Math.min(prima.length, dopo.length); i++)
         {
            const fp = prima[i];
            const fd = dopo[i];
            if (uguali(fp, fd))
               continue;
            if (fp.fCommesso)
            {
               const vecchia = opList.items().find(o =>
                  (o.oper() === TOperationType.totFalloFatto) && (o.player1() === player) &&
                  (o.quarter() === fp.fQuarto) && (o.time() === fp.fTempo) && (!tolte.has(o)));
               if (vecchia)
               {
                  tolte.add(vecchia);
                  await opList.RemoveItem(vecchia);
               }
            }
            if (fd.fCommesso)
            {
               const op = new TOperation(fd.fQuarto, fd.fTempo, TOperationType.totFalloFatto, player.isMyTeam(), player);
               op.eventData = { subtype: MatchSyncService.FalloSubtype(fd), ftawarded: fd.numLiberi };
               await opList.Add(op);
            }
         }
      }
      this.falliPrima = new Map();
      this.ScrollOperazioniToBottom();
   }


   // Numeri di maglia cambiati da "Modifica Numeri/Nomi": valgono solo per questa partita e vanno quindi su
   // matchroster (listaRosterCasa/listaRosterFuori contengono i record completi letti da DB), altrimenti
   // ricaricando la partita tornerebbero quelli di prima.
   async SaveNumeriMagliaToDB (): Promise<void>
   {
      const byId = new Map([
         ...(matchGlobs.currMatch?.myTeam()?.Roster ?? []),
         ...(matchGlobs.currMatch?.oppTeam()?.Roster ?? [])
      ].map(p => [p.playerRecID, p]));
      let changed = false;
      for (const entry of [...this.listaRosterCasa, ...this.listaRosterFuori])
      {
         const plr = byId.get(entry.playerId_link);
         if ((!plr) || (plr.playNumber() === entry.playNumber))
            continue;
         entry.playNumber = plr.playNumber();
         changed = true;
      }
      if (changed)
         await this.EnqueueRosterSnapshot();
   }


   mnuFalliTotali()
   {
      this.dialogVisible_FalliTotali = true;
   }


   onFalliTotaliDialogShow()
   {
      this.SnapshotFalli ([
         ...(matchGlobs.currMatch?.myTeam()?.Roster ?? []),
         ...(matchGlobs.currMatch?.oppTeam()?.Roster ?? [])
      ]);
      this.falliTotaliComp?.onComponentShow();
   }


   async onFalliTotaliOk ()
   {
      this.dialogVisible_FalliTotali = false;
      await this.RegistraModificheFalli();
      await this.compMyTeam?.Update();
      await this.compOppoTeam?.Update();
      await matchGlobs.currSavedMatch.SaveToStorage();
      this.cdr.detectChanges();
   }


   async mnuAzzeraTutto()
   {
      const dlgData: MessDlgData = {
         title:               'Azzera tutta la partita',
         subtitle:            '',
         message:             `Verranno eliminate tutte le azioni, i tempi di gioco e i quintetti registrati finora, come se la partita non fosse mai iniziata.<br>Resteranno solo i convocati con i relativi numeri di maglia e i capitani.<br>Vuoi davvero procedere?`,
         messtype:            'warning',
         btncaption:          'No, annulla',
         showCancelButton:    true,
         cancelButtonCaption: 'Sì, azzera tutto'
      };
      const result = await firstValueFrom (this.messageDialogService.showMessage (dlgData, '', true));
      if (result !== 'secondary')
         return;
      //
      if (matchGlobs.currMatch)
      {
         const opList = await matchGlobs.currMatch.EnsureOperationList();
         await opList.Destroy();
         await this.matchSync.EnqueueResetMatch (this.matchHeader.id);
         matchGlobs.currMatch.myTeam()?.ResetMatchState();
         matchGlobs.currMatch.oppTeam()?.ResetMatchState();
      }
      //
      await this.ClearSelection();
      this.compTimer?.ResetToMatchStart();
      this.quarterEndLineups = {};
      this.UpdateFieldPlayers();
      await this.SaveQuintettoToDB ([
         ...(matchGlobs.currMatch?.myTeam()?.Roster ?? []),
         ...(matchGlobs.currMatch?.oppTeam()?.Roster ?? [])
      ]);
      await this.compMyTeam.Update();
      await this.compOppoTeam.Update();
      await matchGlobs.currSavedMatch.SaveToStorage();
      this.cdr.detectChanges();
      this.msgService.add({ severity: 'success', summary: 'Azzera tutto', detail: 'La partita è stata azzerata' });
   }


   protected readonly CreateEmptyMatchHeader = CreateEmptyMatchHeader;
}


