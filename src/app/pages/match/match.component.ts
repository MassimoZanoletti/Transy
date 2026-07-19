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
import {PlayerCompComponent} from "../../common/player-comp/player-comp.component";
import {TeamCompComponent} from "../../common/team-comp/team-comp.component";
import {BenchCompComponent} from "../../common/bench-comp/bench-comp.component";
import {PointsCompComponent} from "../../common/points-comp/points-comp.component";
import {DataCompComponent} from "../../common/data-comp/data-comp.component";
import {MatchheaderCompComponent} from "../../common/matchheader-comp/matchheader-comp.component";
import {MenuModule} from "primeng/menu";
import {InputTextModule} from "primeng/inputtext";
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
import { TOperation, TOperationType } from "../../common/operation";



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
                 PlayerCompComponent,
                 TeamCompComponent,
                 BenchCompComponent,
                 PointsCompComponent,
                 DataCompComponent,
                 MatchheaderCompComponent,
                 MenuModule,
                 RouterLink,
                 InputTextModule,
                 CalendarModule,
                 PlayersCompComponent,
                 RosterCompComponent,
                 MenuModule,
                 PlayerEditCompComponent,
                 FalloDlgComponent,
                 SostituzioneCompComponent,
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
   public sostTempo: string = '';
   public sostPlayers: TMatchPlayer[] = [];
   public sostIsMyTeam: boolean = true;
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
               public msgService: MessageService)

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
               {label: "Azzera solo tempi di gioco", icon: 'pi pi-sync', styleClass: 'icona-arancio', command:() => { this.mnuAzzeraTempiGioco(); } },
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
      if (await matchGlobs.currSavedMatch.LoadFromStorage())
      {
         if (matchGlobs.currSavedMatch.lastMatchId == globs.openedMatchHeaderId)
         {
            await this.SelezionaTab(matchGlobs.currSavedMatch.lastTabIndex);
         }
         else
         {
            await this.SelezionaTab(0);
            matchGlobs.currSavedMatch.lastTabIndex = 0;
            matchGlobs.currSavedMatch.lastMatchId = globs.openedMatchHeaderId;
         }
      }
      //
      if (matchGlobs.currMatch == null)
      {
         matchGlobs.currMatch = new TCurrMatch(this.servMatchHeader, this.servMatchRoster, this.servTeam);
      }
      //
      await matchGlobs.currMatch.EnsureOperationList();
      //
      await this.LoadMatchHeader(globs.openedMatchHeaderId);
      await this.LoadMatchRoster(globs.openedMatchHeaderId);
      await this.LoadCoachs(globs.openedMatchHeaderId);
      await this.LoadTeams(this.matchHeader.champId_lk);
      await this.LoadSeason(this.currSeason?this.currSeason.id:0);
      await this.LoadPhase(this.currPhase?this.currPhase.id:0);
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
         }
         //
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
         const dataForDb: string = JSON.stringify (this.servMatchHeader.MatchHeaderToDb (this.matchHeader), null, -1);
         let rrr = await firstValueFrom (this.servMatchHeader.updateData (this.matchHeader.id, dataForDb));
         if (rrr)
         {
            await this.InitializeComponent();
         }
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
         await this.playerFalliComp.onComponentShow (this.playerForFalli, this.quartoForFalli, this.tempoForFalli);
      }
   }


   async salvaPlayerFalli(event: {player: TMatchPlayer | null, nuovoFallo: boolean})
   {
      this.dialogVisible_Falli = false;
      if ((event.player != null) && (this.playerForFalli != null))
      {
         this.playerForFalli.falliFatti.set(event.player.falliFatti());
         this.UpdateCommandsData(this.playerForFalli);
         this.cdr.detectChanges();
         if (event.nuovoFallo)
         {
            await this.AddGameOperation(TOperationType.totFalloFatto, this.playerForFalli);
         }
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
         const dataForDb: string = JSON.stringify (this.servMatchHeader.MatchHeaderToDb (this.matchHeader), null, -1);
         let rrr = await firstValueFrom (this.servMatchHeader.updateData (this.matchHeader.id, dataForDb));
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


   async onTimerStarted (event: { id: string })
   {
      if (event.id === 'comptimer')
      {
         await this.AddTimeOperation (TOperationType.totTimeStart);
      }
   }


   async onTimerStopped (event: { id: string })
   {
      if (event.id === 'comptimer')
      {
         await this.AddTimeOperation (TOperationType.totTimeStop);
      }
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
      player.rimbAttacco.set(player.rimbAttacco() + 1);
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
      const realizz = new TRealizzazione();
      await realizz.Add(tipo, quarter, time, fatto, 0, 0);
      realizz.rPlr = player;
      player.realizzazioni.set([...player.realizzazioni(), realizz]);
      this.UpdateCommandsData(player);
      const isMyTeam = (this.currSelectedPlayer?.isMyTeam() ?? false);
      if (fatto && (realizz.rPunti > 0))
      {
         const team = isMyTeam ? this.GetMyTeamData() : this.GetOppoTeamData();
         if (team)
         {
            team.currQuarter.set(quarter - 1);
            const qrt = team.GetQuarto(quarter - 1);
            if (qrt)
               qrt.punti = qrt.punti + realizz.rPunti;
         }
      }
      await this.compMyTeam?.Update();
      await this.compOppoTeam?.Update();
      const opList = await matchGlobs.currMatch.EnsureOperationList();
      const op = new TOperation(quarter, time, oper, isMyTeam, player);
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
               player.rimbDifesa.set(player.rimbDifesa() + 1);
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
               player.pPerse.set(player.pPerse() + 1);
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
               player.stoppSubite.set(player.stoppSubite() + 1);
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
               player.assist.set(player.assist() + 1);
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
               player.rimbAttacco.set(player.rimbAttacco() + 1);
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
               player.pRecuperate.set(player.pRecuperate() + 1);
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
               player.stoppFatte.set(player.stoppFatte() + 1);
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
               player.falliSubiti.set(player.falliSubiti() + 1);
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
      await opList.Add(op);
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
      if (this.compOppoTeam.isSelected)
      {
         const team = matchGlobs.currMatch?.oppTeam();
         this.sostTeamName = team?.name() ?? '';
         this.sostPlayers  = team?.Roster ?? [];
         this.sostIsMyTeam = false;
      }
      else
      {
         const team = matchGlobs.currMatch?.myTeam();
         this.sostTeamName = team?.name() ?? '';
         this.sostPlayers  = team?.Roster ?? [];
         this.sostIsMyTeam = true;
      }
      this.sostTempo = this.compTimer?.displayTime ?? '';
      this.dialogVisible_Sostit = true;
   }


   async onSostituzioneDialogShow()
   {
      if (this.sostituzioneComp)
      {
         await this.sostituzioneComp.onComponentShow (this.compTimer?.displayTime ?? '');
      }
   }


   async onSostituzioneSave(event: { players: TMatchPlayer[], azione: string, usciti?: TMatchPlayer[], entrati?: TMatchPlayer[], quintetto?: TMatchPlayer[], tempoSec?: number }): Promise<void>
   {
      // i flag inGioco sono già stati aggiornati dentro il componente
      this.dialogVisible_Sostit = false;
      if (event.azione == "quintetto")
      {
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
      this.UpdateFieldPlayers();
      await this.TeamClicked(this.sostIsMyTeam ? 'compmyteam' : 'compoppoteam');
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
      for (let i=0;   i<count;   i++)
      {
         const playerOut = usciti[i];
         const playerIn  = entrati[i];
         const time = playerOut.outTime();
         const op = new TOperation(quarter, time, TOperationType.totSostituz, this.sostIsMyTeam, playerOut, playerIn);
         await opList.Add(op);
      }
      this.ScrollOperazioniToBottom();
   }


   async AddQuintettoOperations (players: TMatchPlayer[],
                                 time: number): Promise<void>
   {
      if (!matchGlobs.currMatch)
         return;
      const opList = await matchGlobs.currMatch.EnsureOperationList();
      const quarter = this.compTimer ? this.compTimer.GetQuarterNumber() : 0;
      for (const player of players)
      {
         const op = new TOperation(quarter, time, TOperationType.totQuintetto, this.sostIsMyTeam, player);
         await opList.Add(op);
      }
      this.ScrollOperazioniToBottom();
   }


   onSostituzioneAnnulla(): void
   {
      this.dialogVisible_Sostit = false;
   }


   mnuModificaNomiNumery()
   {
      this.msgService.add({ severity: 'info', summary: 'Modifica Numeri/Nomi', detail: 'Non ancora implementato' });
   }


   mnuAzioni()
   {
      this.msgService.add({ severity: 'info', summary: 'Azioni', detail: 'Non ancora implementato' });
   }


   mnuTempiDiGioco()
   {
      this.msgService.add({ severity: 'info', summary: 'Tempi di gioco', detail: 'Non ancora implementato' });
   }


   mnuFalliTotali()
   {
      this.msgService.add({ severity: 'info', summary: 'Falli totali', detail: 'Non ancora implementato' });
   }


   mnuAzzeraTempiGioco()
   {
      this.msgService.add({ severity: 'info', summary: 'Azzera tempi di gioco', detail: 'Non ancora implementato' });
   }


   mnuAzzeraTutto()
   {
      this.msgService.add({ severity: 'info', summary: 'Azzera tutto', detail: 'Non ancora implementato' });
   }


   protected readonly CreateEmptyMatchHeader = CreateEmptyMatchHeader;
}


