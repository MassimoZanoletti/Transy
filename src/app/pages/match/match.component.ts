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
import { TabViewModule } from 'primeng/tabview';
import {
   Champ,
   EventoElement,
   MatchHeaderDb,
   MatchHeader,
   MessDlgData,
   Phase,
   Season,
   Societa,
   TipoEvento,
   CreateEmptyMatchHeader,
   Team,
   MatchRoster,
   Coach
} from "../../models/datamod";
import {BlockUIModule} from "primeng/blockui";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {DividerModule} from 'primeng/divider';
import {CheckboxModule} from "primeng/checkbox";
import {DialogModule} from 'primeng/dialog';
import {DialogService,
   DynamicDialogModule,
   DynamicDialogRef} from 'primeng/dynamicdialog';
import {MessageService} from 'primeng/api';
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
import {EventiService} from "../../services/eventi.service";
import {CampionatiService} from "../../services/campionati.service";
import {PhaseService} from "../../services/phase.service";
import {MessageDialogService} from "../../services/message-dialog.service";
import {MatchheaderService} from "../../services/matchheader.service";
import {LogService} from "../../services/log.service";
import {TeamService} from "../../services/team.service";
import {MatchrosterService} from "../../services/matchroster.service";
import {PlayerService} from "../../services/player.service";
import {CoachService} from "../../services/coach.service";



@Component({
  selector:    'app-match',
  standalone:  true,
  imports:     [
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
     RosterCompComponent
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
   @ViewChild('compTimer') compTimerInstance!: TimerCompComponent;
   @ViewChild('compMyTeam') compMyTeamInstance!: TeamCompComponent;
   @ViewChild('compOppoTeam') compOppoTeamInstance!: TeamCompComponent;
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
   public matchHeader: MatchHeader = CreateEmptyMatchHeader();
   public listaRoster: Array<MatchRoster> = [];
   public listaRosterCasa: Array<MatchRoster> = [];
   public listaRosterFuori: Array<MatchRoster> = [];
   public listaMyCoach: Array<Coach> = [];
   public listaOppoCoach: Array<Coach> = [];
   public listaTeams: Array<Team> = [];
   public homeTeamName: string = "";
   public awayTeamName: string = "";
   public homeCoach1: string = "";
   public homeCoach2: string = "";
   public awayCoach1: string = "";
   public awayCoach2: string = "";
   public diagMatchHeader: MatchHeader | null = null;
   public dialogVisible_MatchHeader: boolean = false;
   public currSeason: Season | null = null;
   public currPhase: Phase | null = null;
   public dialogVisible_Roster: boolean = false;
   public currTeam: string = "";
   public currPlayer: string = "";
   public currBench: string = "";

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
               public fltrMessageService: MessageService)

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
            const ch: Coach = (this.listaMyCoach.find (cc => Number(this.matchHeader.myCoach1Id_link) == cc.id) as Coach);
            if (ch)
               this.homeCoach1 = `${ch.nome}`;
         }
         if (this.matchHeader.myCoach2Id_link > 0)
         {
            const ch: Coach = (this.listaMyCoach.find (cc => Number(this.matchHeader.myCoach2Id_link) == cc.id) as Coach);
            if (ch)
               this.homeCoach2 = `${ch.nome}`;
         }
         if (this.matchHeader.oppoCoach1Id_link > 0)
         {
            const ch: Coach = (this.listaOppoCoach.find (cc => Number(this.matchHeader.oppoCoach1Id_link) == cc.id) as Coach);
            if (ch)
               this.awayCoach1 = `${ch.nome}`;
         }
         if (this.matchHeader.oppoCoach2Id_link > 0)
         {
            const ch: Coach = (this.listaOppoCoach.find (cc => Number(this.matchHeader.oppoCoach2Id_link) == cc.id) as Coach);
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
      this.cdr.detectChanges();
   }


   async LoadMatchHeader(aId: number)
   {
      const theData = await firstValueFrom (this.servMatchHeader.getSingleData(aId));
      if ((theData) && (theData.elements))
      {
         this.matchHeader = this.servMatchHeader.MatchHeaderFromDb(theData.elements);
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
            const fullList: Array<MatchRoster> = theData.elements;
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
         this.listaRosterCasa.sort(this.OrdinaGiocatoriByNumero);
         this.listaRosterFuori.sort(this.OrdinaGiocatoriByNumero);
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
      stop = this.listaRosterCasa.length;
      if (stop > 6)
         stop = 6;
      for (let iii=start;   iii<stop;   iii++)
      {
         const benchRef = this.contMyBench1.createComponent(BenchCompComponent);
         benchRef.instance.componentId = this.listaRosterCasa[iii].id.toString();
         benchRef.instance.playerName = this.listaRosterCasa[iii].playerName_lk;
         benchRef.instance.playerNum = this.listaRosterCasa[iii].playNumber;
         benchRef.instance.isSelected = false;
         //
         benchRef.instance.componentClicked.subscribe(event => { this.BenchClicked(event)});
         benchRef.instance.componentDoubleClicked.subscribe(event => { this.BenchDoubleClicked(event)});
         //
         this.myBenchRefs.push(benchRef);
      }
      if (this.listaRosterCasa.length > 6)
      {
         start = 6;
         stop = this.listaRosterCasa.length;
         if (stop > 12)
            stop = 12;
         for (let iii=start;   iii<stop;   iii++)
         {
            const benchRef = this.contMyBench2.createComponent(BenchCompComponent);
            benchRef.instance.componentId = this.listaRosterCasa[iii].id.toString();
            benchRef.instance.playerName = this.listaRosterCasa[iii].playerName_lk;
            benchRef.instance.playerNum = this.listaRosterCasa[iii].playNumber;
            benchRef.instance.isSelected = false;
            //
            benchRef.instance.componentClicked.subscribe(event => { this.BenchClicked(event)});
            benchRef.instance.componentDoubleClicked.subscribe(event => { this.BenchDoubleClicked(event)});
            //
            this.myBenchRefs.push(benchRef);
         }
      }
      if (this.listaRosterCasa.length > 12)
      {
         start = 12;
         stop = this.listaRosterCasa.length;
         if (stop > 18)
            stop = 18;
         for (let iii=start;   iii<stop;   iii++)
         {
            const benchRef = this.contMyBench3.createComponent(BenchCompComponent);
            benchRef.instance.componentId = this.listaRosterCasa[iii].id.toString();
            benchRef.instance.playerName = this.listaRosterCasa[iii].playerName_lk;
            benchRef.instance.playerNum = this.listaRosterCasa[iii].playNumber;
            benchRef.instance.isSelected = false;
            //
            benchRef.instance.componentClicked.subscribe(event => { this.BenchClicked(event)});
            benchRef.instance.componentDoubleClicked.subscribe(event => { this.BenchDoubleClicked(event)});
            //
            this.myBenchRefs.push(benchRef);
         }
      }
      // OppoTeam
      start = 0;
      stop = this.listaRosterFuori.length;
      if (stop > 6)
         stop = 6;
      for (let iii=start;   iii<stop;   iii++)
      {
         const benchRef = this.contOppoBench1.createComponent(BenchCompComponent);
         benchRef.instance.componentId = this.listaRosterFuori[iii].id.toString();
         benchRef.instance.playerName = this.listaRosterFuori[iii].playerName_lk;
         benchRef.instance.playerNum = this.listaRosterFuori[iii].playNumber;
         benchRef.instance.isSelected = false;
         //
         benchRef.instance.componentClicked.subscribe(event => { this.BenchClicked(event)});
         benchRef.instance.componentDoubleClicked.subscribe(event => { this.BenchDoubleClicked(event)});
         //
         this.oppoBenchRefs.push(benchRef);
      }
      if (this.listaRosterFuori.length > 6)
      {
         start = 6;
         stop = this.listaRosterFuori.length;
         if (stop > 12)
            stop = 12;
         for (let iii=start;   iii<stop;   iii++)
         {
            const benchRef = this.contOppoBench2.createComponent(BenchCompComponent);
            benchRef.instance.componentId = this.listaRosterFuori[iii].id.toString();
            benchRef.instance.playerName = this.listaRosterFuori[iii].playerName_lk;
            benchRef.instance.playerNum = this.listaRosterFuori[iii].playNumber;
            benchRef.instance.isSelected = false;
            //
            benchRef.instance.componentClicked.subscribe(event => { this.BenchClicked(event)});
            benchRef.instance.componentDoubleClicked.subscribe(event => { this.BenchDoubleClicked(event)});
            //
            this.oppoBenchRefs.push(benchRef);
         }
      }
      if (this.listaRosterFuori.length > 12)
      {
         start = 12;
         stop = this.listaRosterFuori.length;
         if (stop > 18)
            stop = 18;
         for (let iii=start;   iii<stop;   iii++)
         {
            const benchRef = this.contOppoBench3.createComponent(BenchCompComponent);
            benchRef.instance.componentId = this.listaRosterFuori[iii].id.toString();
            benchRef.instance.playerName = this.listaRosterFuori[iii].playerName_lk;
            benchRef.instance.playerNum = this.listaRosterFuori[iii].playNumber;
            benchRef.instance.isSelected = false;
            //
            benchRef.instance.componentClicked.subscribe(event => { this.BenchClicked(event)});
            benchRef.instance.componentDoubleClicked.subscribe(event => { this.BenchDoubleClicked(event)});
            //
            this.oppoBenchRefs.push(benchRef);
         }
      }
   }


   OrdinaGiocatoriByNumero (a: MatchRoster,
                            b: MatchRoster): number
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


   async SalvaMatchHeader(datiMH: { mh: MatchHeader})
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


   AnnullaMatchRosterDiag()
   {
      this.dialogVisible_Roster = false;
   }


   async SalvaMatchRosterDiag(event: [Array<MatchRoster>, MatchHeader])
   {
      this.dialogVisible_Roster = false;
      const mH: MatchHeader = event[1];
      const mR: Array<MatchRoster> = event[0];
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


   TeamClicked(id: string)
   {
      this.currTeam = id;
   }


   PlayerClicked(id: string)
   {
      this.currPlayer = id;
   }


   onTimeUpdate (event: { id: string, time: number })
   {
      if (event.id === 'cronometro')
         console.log(`Cronometro ${event.id}: tempo rimanente ${event.time}s`);
   }


   onTimerEvent(event: { id: string })
   {
      if (event.id === 'cronometro')
      {
         console.log(`Il cronometro ${event.id} è stato avviato`);
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
         }
      }
      else if (id == "t2")
      {
         if (this.compT2)
         {
            this.compT2.Flash();
         }
      }
      else if (id == "t3")
      {
         if (this.compT3)
         {
            this.compT3.Flash();
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
         }
      }
      else if (id == "t2")
      {
         if (this.compT2)
         {
            this.compT2.Flash();
         }
      }
      else if (id == "t3")
      {
         if (this.compT3)
         {
            this.compT3.Flash();
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
         }
      }
      else if (id == "t2")
      {
         if (this.compT2)
         {
            this.compT2.Flash();
         }
      }
      else if (id == "t3")
      {
         if (this.compT3)
         {
            this.compT3.Flash();
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
         }
      }
      else if (id == "t2")
      {
         if (this.compT2)
         {
            this.compT2.Flash();
         }
      }
      else if (id == "t3")
      {
         if (this.compT3)
         {
            this.compT3.Flash();
         }
      }
   }


   async DataBtn1Clicked (id: string)
   {
      if (id == "data-rimb")
      {
         if (this.compRimb)
         {
            this.compRimb.Flash();
         }
      }
      else if (id == "data-palle")
      {
         if (this.compPalle)
         {
            this.compPalle.Flash();
         }
      }
      else if (id == "data-stopp")
      {
         if (this.compStopp)
         {
            this.compStopp.Flash();
         }
      }
      else if (id == "data-assist")
      {
         if (this.compAssist)
         {
            this.compAssist.Flash();
         }
      }
      else if (id == "data-falli")
      {
         if (this.compFalli)
         {
            this.compFalli.Flash();
         }
      }
   }


   DataBtn2Clicked (id: string)
   {
      if (id == "data-rimb")
      {
         if (this.compRimb)
         {
            this.compRimb.Flash();
         }
      }
      else if (id == "data-palle")
      {
         if (this.compPalle)
         {
            this.compPalle.Flash();
         }
      }
      else if (id == "data-stopp")
      {
         if (this.compStopp)
         {
            this.compStopp.Flash();
         }
      }
      else if (id == "data-falli")
      {
         if (this.compFalli)
         {
            this.compFalli.Flash();
         }
      }
   }


   BenchClicked(id: string)
   {
      const clickedRef = this.myBenchRefs.find(ref => ref.instance.componentId.toString() === id);
      if (clickedRef)
      {
         clickedRef.instance.isSelected = true;
      }

      this.currBench = id;
      const bbb = this.listaRosterCasa.find(elem =>  elem.id.toString() == id)
      if (bbb)
      {
      }
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


   protected readonly CreateEmptyMatchHeader = CreateEmptyMatchHeader;
}


