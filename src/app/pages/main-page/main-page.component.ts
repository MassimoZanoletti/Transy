// angular
import {ChangeDetectorRef,
         Component,
         HostListener,
         NgZone,
         OnDestroy,
         OnInit,
         ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Router,
         RouterLink} from "@angular/router";
import {firstValueFrom} from "rxjs";

// primeng
import {Table,
         TableModule} from 'primeng/table';
import {DataViewModule} from "primeng/dataview";
import {ButtonModule} from "primeng/button";
import {TooltipModule} from 'primeng/tooltip';
import {CardModule} from 'primeng/card';
import {DropdownModule} from "primeng/dropdown";
import {CalendarModule} from "primeng/calendar";
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
   CreateEmptyMatchHeader, Team
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

// other
import {SeasonsService} from "../../services/seasons.service";
import {SocietaService} from "../../services/societa.service";
import {EventiService} from "../../services/eventi.service";
import {CampionatiService} from "../../services/campionati.service";
import {PhaseService} from "../../services/phase.service";
import {MatchheaderService} from "../../services/matchheader.service";
import {MessageDialogService} from "../../services/message-dialog.service";
import {TeamService} from "../../services/team.service";
import { utils,
         matchStatusType,
         timeouts } from "../../common/utils";
import {loggedUser} from "../../services/users.service";
import { LogService } from "../../services/log.service";
import {TimerCompComponent} from "../../common/timer-comp/timer-comp.component";
import {PlayerCompComponent} from "../../common/player-comp/player-comp.component";
import {TeamCompComponent} from "../../common/team-comp/team-comp.component";
import {BenchCompComponent} from "../../common/bench-comp/bench-comp.component";
import {PointsCompComponent} from "../../common/points-comp/points-comp.component";
import {DataCompComponent} from "../../common/data-comp/data-comp.component";
import {MenuModule} from "primeng/menu";
import {InputTextModule} from "primeng/inputtext";
import {DataView} from "primeng/dataview";
import { MatchheaderCompComponent } from "../../common/matchheader-comp/matchheader-comp.component";
import { PlayersCompComponent } from "../../common/players-comp/players-comp.component";



export interface CbTipoEvento
{
   id: number;
   nome: string;
}




@Component ({
               selector:    'app-main-page',
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
                  PlayersCompComponent
               ],
               providers: [
                  DialogService, // Fornisci il servizio per DynamicDialog
                  MessageService // Opzionale, per i messaggi
               ],
               templateUrl: './main-page.component.html',
               styleUrl:    './main-page.component.css'
            })
export class MainPageComponent implements OnInit, OnDestroy
{
   /*
   isLoadingEv: boolean = false;
   isLoadingSea: boolean = false;
   */
   isLoadingData: number = 0;
   listaEventi: Array<EventoElement> = [];
   currEvent: EventoElement | null = null;
   listaSocieta: Array<Societa> = [];
   currSocieta: Societa | null = null;
   oldSocieta: Societa | null = null;
   listaStagioni: Array<Season> = [];
   currSeason: Season | null = null;
   oldSeason: Season | null = null;
   debug: number = 0;
   fltrDlgRef: DynamicDialogRef | undefined;
   totRec: number = 0;
   listaTipoEvento: Array<CbTipoEvento> = [];
   currTipoEvento: CbTipoEvento | null = null;
   windowHeight: number = 110;
   scrollHeight: string = "110px";
   timerId: any;
   listaCampionati: Array<Champ> = [];
   currChamp: Champ | null = null;
   listaFasi: Array<Phase> = [];
   currFase: Phase | null = null;
   listaMatch: Array<MatchHeader> = [];
   currMatchHeader: MatchHeader | null = null;
   diagMatchHeader: MatchHeader | null = null;
   diagMatchHeader_IsNew: boolean = false;
   listaTeams: Array<Team> = [];
   diagMatchStatus_Status: matchStatusType.Status = { code: "NotPl",  desc: "Non Giocato",  abbrev: "NP" };
   diagMatchStatus_Items: Array<matchStatusType.Status> = [];

   @ViewChild('eventsTable') pTable: Table | undefined;
   @ViewChild(MatchheaderCompComponent) matchHeaderComp!: MatchheaderCompComponent;
   @ViewChild(PlayersCompComponent) playersComp!: PlayersCompComponent;
   //
   private dataCompInstances: Map<string, DataCompComponent> = new Map();
   private pointsCompInstances: Map<string, PointsCompComponent> = new Map();
   private timerInterval: any;
   private totalSeconds: number = 600; // 10 minuti * 60 secondi
   public cronoTime: string = '10:00';
   public isRunning: boolean = false;
   public currPlayer: string = "";
   public currTeam: string = "";
   public currBench: string = "";
   public debugstr: string = "";
   public dialogVisible_Societa: boolean = false;
   public dialogErrorMessage: string = "";
   public dialogVisible_MatchHeader: boolean = false;
   private today: Date = new Date();
   public dialogVisible_MatchStatus: boolean = false;
   public dialogVisible_Players: boolean = false;

   constructor (public router: Router,
                private seasonServ: SeasonsService,
                private socService: SocietaService,
                private eventServ: EventiService,
                private champService: CampionatiService,
                private phaseService: PhaseService,
                private cdr: ChangeDetectorRef,
                private messageDialogService: MessageDialogService,
                private matchHeaderServ: MatchheaderService,
                private zone: NgZone,
                public fltrDialogService: DialogService,
                public fltrMessageService: MessageService,
                private logService: LogService,
                private teamService: TeamService)
   {
      this.currEvent = null;
      //
      this.listaTipoEvento = [];
      this.listaTipoEvento.push({ id: 1, nome: "Solo Eventi classici" });
      this.listaTipoEvento.push({ id: 2, nome: "Solo Eventi periodici" });
      this.listaTipoEvento.push({ id: 3, nome: "Tutti i tipi" });
   }


   async ngOnInit()
   {
      try
      {
         await this.GetWindowSize();
         //
         await this.LoadCfg();
         //
         //
         this.updateCrono();
      }
      catch (e)
      {

      }
      finally
      {
         //this.isLoadingSea = false;
         //this.isLoadingEv = false;
         this.cdr.detectChanges();
      }
   }


   async ngOnDestroy()
   {
      if (this.fltrDlgRef)
      {
         this.fltrDlgRef.destroy();
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


   async SetLoading (value: number)
   {
      console.info(`Loading: ${value}`);
      this.isLoadingData = value;
   }


   CheckLoading(): boolean
   {
      //return ((this.isLoadingEv) || (this.isLoadingSea));
      return (this.isLoadingData != 0);
   }


   async LoadCfg()
   {
      await this.LoadSocieta();
      const tmpSoc: Societa | null = utils.GetFromLocalStorage<Societa> ("BBS_CurrSocieta");
      if (tmpSoc != null)
      {
         this.currSocieta = this.listaSocieta.find (soc => soc.id === tmpSoc.id) || null;
      }
      //
      await this.LoadSeasons((this.currSocieta)?this.currSocieta.id:null);
      const tmpSeason: Season | null = utils.GetFromLocalStorage<Season> ("BBS_CurrSeason");
      if (tmpSeason != null)
      {
         this.currSeason = this.listaStagioni.find (season => season.id === tmpSeason.id) || null;
      }
      //
      if (this.currSeason)
         await this.LoadChamp (this.currSeason?.id);
      else
      {
         this.listaCampionati = [];
         this.currChamp = null;
      }
      //
      if (this.currChamp)
         await this.LoadPhase (this.currChamp?.id);
      else
      {
         this.listaFasi = [];
         this.currFase = null;
      }
      //
      if (this.currFase)
         await this.LoadMatchHeader(this.currFase?.id);
      else
      {
         this.listaMatch = [];
         this.currMatchHeader = null;
      }
   }


   async LoadSocieta()
   {
      try
      {
         await this.SetLoading(1);
         const dataSoc = await firstValueFrom(this.socService.getAllData());
         if ((dataSoc) && (dataSoc.ok))
            this.listaSocieta = dataSoc.elements;
      }
      catch (err)
      {

      }
      finally
      {
         //this.isLoadingSea = false;
         await this.SetLoading(0);
         this.cdr.detectChanges ();
      }
   }


   async LoadSeasons(socId: number | null)
   {
      try
      {
         //this.isLoadingSea = true;
         await this.SetLoading(1);
         const dataSeas = await firstValueFrom(this.seasonServ.getAllData(socId));
         if ((dataSeas) && (dataSeas.ok))
            this.listaStagioni = dataSeas.elements;
      }
      catch (err)
      {

      }
      finally
      {
         //this.isLoadingSea = false;
         await this.SetLoading(0);
         this.cdr.detectChanges ();
      }
   }


   async LoadChamp(seasonId: number | null)
   {
      try
      {
         if ((seasonId == null) || (seasonId < 1))
         {
            this.listaCampionati = [];
            this.currChamp = null;
            utils.removeFromSessionStorage("BBS_CurrChamp");
         }
         else
         {
            const tmpChamp: Champ | null = utils.GetFromSessionStorage<Champ> ("BBS_CurrChamp");
            await this.SetLoading (1);
            const data = await firstValueFrom (this.champService.getAllData (seasonId));
            if ((data) && (data.ok))
               this.listaCampionati = data.elements;
            if (tmpChamp != null)
               this.currChamp = this.listaCampionati.find (cam => cam.id === tmpChamp.id) || null;
            else
               this.currChamp = null;
         }
      }
      catch (err)
      {

      }
      finally
      {
         await this.SetLoading(0);
         this.cdr.detectChanges ();
      }
   }


   async LoadPhase(champId: number | null)
   {
      try
      {
         if ((champId == null) || (champId < 1))
         {
            this.listaFasi = [];
            this.currFase = null;
            utils.removeFromSessionStorage("BBS_CurrPhase");
         }
         else
         {
            const tempPhase: Champ | null = utils.GetFromSessionStorage<Champ> ("BBS_CurrPhase");
            await this.SetLoading (1);
            const data = await firstValueFrom (this.phaseService.getAllData (champId));
            if ((data) && (data.ok))
               this.listaFasi = data.elements;
            if (tempPhase != null)
               this.currFase = this.listaFasi.find (fas => fas.id === tempPhase.id) || null;
            else
               this.currFase = null;
         }
      }
      catch (err)
      {

      }
      finally
      {
         await this.SetLoading(0);
         this.cdr.detectChanges ();
      }
   }


   async LoadTeams(champId: number | null)
   {
      try
      {
         if ((champId == null) || (champId < 1))
         {
            this.listaFasi = [];
            this.currFase = null;
            utils.removeFromSessionStorage("BBS_CurrPhase");
         }
         else
         {
            const tempPhase: Champ | null = utils.GetFromSessionStorage<Champ> ("BBS_CurrPhase");
            await this.SetLoading (1);
            const data = await firstValueFrom (this.teamService.getAllData (champId));
            if ((data) && (data.ok))
               this.listaTeams = data.elements;
         }
      }
      catch (err)
      {

      }
      finally
      {
         await this.SetLoading(0);
         this.cdr.detectChanges ();
      }
   }


   async LoadMatchHeader(phaseId: number | null)
   {
      try
      {
         if ((phaseId == null) || (phaseId < 1))
         {
            this.listaMatch = [];
            this.currMatchHeader = null;
            utils.removeFromSessionStorage("BBS_CurrMatchHeader");
         }
         else
         {
            const tempMatch: MatchHeader | null = utils.GetFromSessionStorage<MatchHeader> ("BBS_CurrMatchHeader");
            await this.SetLoading (1);
            const data = await firstValueFrom (this.matchHeaderServ.getAllData (phaseId));
            if ((data) && (data.ok))
            {
               console.log("Dati ricevuti dal servizio:", data.elements);
               this.listaMatch = data.elements;
            }
            if (tempMatch != null)
               this.currMatchHeader = this.listaMatch.find (mat => mat.id === tempMatch.id) || null;
            else
               this.currMatchHeader = null;
         }
      }
      catch (err)
      {
         await this.logService.AddToLog (loggedUser, `Exception [LoadEvents]: '${JSON.stringify(err,null,-1)}'`);
         const dlgData: MessDlgData = {
            title:      'Exception',
            subtitle:   'Errore',
            message:    `${JSON.stringify(err,null,3)}`,
            messtype:   'error',
            btncaption: 'Chiudi'
         };
         this.messageDialogService.showMessage (dlgData, '600px');
      }
      finally
      {
         await this.SetLoading(0);
         this.cdr.detectChanges ();
      }
   }


   async OnSocietaChange (event: any)
   {
      let id: number | null = null;
      if (this.currSocieta)
         id = this.currSocieta?.id;
      await this.LoadSeasons(id);
   }


   async CambiaSocieta()
   {
      this.oldSocieta = this.currSocieta;
      this.oldSeason = this.currSeason;
      this.dialogVisible_Societa = true;
   }


   async DialogSocietaAnnulla()
   {
      this.dialogVisible_Societa = false;
      this.currSocieta = this.oldSocieta;
      this.currSeason = this.oldSeason;
   }


   async DialogSocietaSalva()
   {
      this.dialogVisible_Societa = false;
      utils.SaveToLocalStorage ("BBS_CurrSocieta", this.currSocieta);
      utils.SaveToLocalStorage ("BBS_CurrSeason", this.currSeason);
      //
      if (this.currSeason)
         await this.LoadChamp(this.currSeason?.id);
      else
         await this.LoadChamp(null);
   }


   async OnSelectedChamp(evento: any)
   {
      if (this.currChamp != null)
      {
         utils.SaveToSessionStorage ("BBS_CurrChamp", this.currChamp);
         await this.LoadPhase (this.currChamp.id);
         await this.LoadTeams (this.currChamp.id);
      }
      else
      {
         this.listaFasi = [];
         this.currFase = null;
         this.listaTeams = [];
      }
   }


   async OnSelectedPhase(evento: any)
   {
      if (this.currFase != null)
      {
         utils.SaveToSessionStorage ("BBS_CurrPhase", this.currFase);
         await this.LoadMatchHeader (this.currFase.id);
      }
      else
      {
         this.listaMatch = [];
         this.currMatchHeader = null;
      }
   }


   async LoadEvents()
   {
      try
      {
         //this.isLoadingEv = true;
         await this.SetLoading (2);
         this.totRec = 0;
         let seasonId: number | null = (this.currSeason != null) ? this.currSeason.id : null;
         let tipoEvnt: number | null = null;
         let giorno: Date | null = null;
         let masterId: number | null = null;
         if (this.currTipoEvento == this.listaTipoEvento[0])
            tipoEvnt = TipoEvento.EventoNormale;
         if (this.currTipoEvento == this.listaTipoEvento[1])
            tipoEvnt = -1;
         let dataEvnt: any;
         dataEvnt = await firstValueFrom (this.eventServ.getAllData (seasonId, tipoEvnt, [], [], giorno, masterId));
         if (dataEvnt)
         {
            if (dataEvnt.ok)
            {
               this.listaEventi = dataEvnt.elements;
               this.totRec = this.listaEventi.length;
               const prevSelected = utils.GetFromSessionStorage("BBS_Editing_Event_Id");
               utils.removeFromSessionStorage("BBS_Editing_Event_Id");
               if (prevSelected != null)
               {
                  this.SelectAndScrollToEvent(Number(prevSelected));
               }
            }
            else
            {
               const dlgData: MessDlgData = {
                  title:      'ERRORE',
                  subtitle:   'Errore durante il caricamento degli eventi dal server',
                  message:    `${dataEvnt.message}`,
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
               subtitle:   'Errore durante il caricamento degli eventi dal server',
               message:    `No data returned`,
               messtype:   'error',
               btncaption: 'Chiudi'
            };
            this.messageDialogService.showMessage (dlgData, '600px');
         }
      }
      catch (err)
      {
         await this.logService.AddToLog (loggedUser, `Exception [LoadEvents]: '${JSON.stringify(err,null,-1)}'`);
         const dlgData: MessDlgData = {
            title:      'Exception',
            subtitle:   'Errore',
            message:    `${JSON.stringify(err,null,3)}`,
            messtype:   'error',
            btncaption: 'Chiudi'
         };
         this.messageDialogService.showMessage (dlgData, '600px');
      }
      finally
      {
         //this.isLoadingEv = false;
         await this.SetLoading(0);
         this.cdr.detectChanges ();
      }
   }


   async LoadFilters()
   {
   }


   AddEnabled (): boolean
   {
      return (loggedUser.attributo > 0);
   }


   EditEnabled (): boolean
   {
      return (loggedUser.attributo > 0);
   }


   DeleteEnabled (): boolean
   {
      return (loggedUser.attributo > 1);
   }


   GetRowColorClass (evento: EventoElement): string
   {
      const wDay = evento.data.getDay ();

      switch (wDay)
      {
         case 1:
            return "row-lun";
         case 2:
            return "row-mar";
         case 3:
            return "row-mer";
         case 4:
            return "row-gio";
         case 5:
            return "row-ven";
         case 6:
            return "row-sab";
         case 0:
            return "row-dom";
         default:
            return "row-lun";
      }
   }


   OnEdit (): void
   {
      let yyyy: number;
      let mmmm: number;
      let dddd: number;

      if (this.currEvent == null)
      {
         const dlgData: MessDlgData = {
            title:      'ATTENZIONE',
            subtitle:   'Modifica evento',
            message:    `Non è stato selezionato alcun evento`,
            messtype:   'warning',
            btncaption: 'Chiudi'
         };
         this.messageDialogService.showMessage (dlgData, '600px');
      }
      else
      {
         yyyy = this.currEvent.data.getFullYear();
         mmmm = this.currEvent.data.getMonth() + 1;
         dddd = this.currEvent.data.getDate();
         let isAdd: boolean = false;
         let _id: number = 0;
         let rqst: string = "";
         let si: number = 0;
         if (this.currSeason)
            si = this.currSeason.id;
         if (this.currEvent.tipoevento == 0)
         {
            // è un evento vuoto
            isAdd = false;
            _id = this.currEvent.id;
            rqst =  "add";
         }
         else
         {
            isAdd = false;
            _id = this.currEvent.id;
            rqst =  "edit";
         }
         this.router.navigate ([`/eventoedit`], {state: {
               id: _id,
               request: rqst,
               isadd: isAdd,
               year: yyyy,
               month: mmmm,
               day: dddd,
               season_id: si}});
      }
   }


   OnDelete (): void
   {
      if (this.currEvent == null)
      {
         const dlgData: MessDlgData = {
            title:      'ATTENZIONE',
            subtitle:   'Cancellazione evento',
            message:    `Non è stato selezionato alcun evento`,
            messtype:   'warning',
            btncaption: 'Chiudi'
         };
         this.messageDialogService.showMessage (dlgData, '600px');
      }
      else
      {
         const dlgData: MessDlgData = {
            title:               'Cancellazione Evento',
            subtitle:            '',
            message:             `Sei veramente sicuro di voloer cancellare l'evento '<b>${this.FormattaData(this.currEvent.data)} : ${this.FormattaOrario(this.currEvent.orainizio)}</b>' dal database?`,
            messtype:            'warning',
            btncaption:          'Annulla',
            showCancelButton:    true,
            cancelButtonCaption: 'Sì, procedi'
         };

         this.messageDialogService.showMessage (dlgData, '', true).subscribe (result =>
                                                                              {
                                                                                 if (result === 'secondary')
                                                                                 {
                                                                                    this.DeleteSelected();
                                                                                 }
                                                                              });
      }
   }


   OnRowSelected (evento: any)
   {
      if (this.currEvent != null)
         utils.SaveToSessionStorage ("BBS_Editing_Event_Id", this.currEvent.id);
   }


   OnRowUnselected (evento: any)
   {
      utils.removeFromSessionStorage("BBS_Editing_Event_Id");
   }


   GetFormattedDate(evento: any, rowIndex: number): string
   {
      // Se è la prima riga, visualizza sempre la data
      if (rowIndex === 0)
      {
         return this.FormattaData(evento.data);
      }

      // Recupera il valore della data dell'evento precedente
      const previousEvent = this.listaEventi[rowIndex - 1];
      const previousDate = this.FormattaData(previousEvent.data);
      const currentDate = this.FormattaData(evento.data);

      // Confronta le date. Se sono uguali, restituisci una stringa vuota.
      // Altrimenti, restituisci la data formattata.
      return currentDate === previousDate ? '' : currentDate;
   }


   FormattaData (data: Date | string): string
   {
      try
      {
         const d = new Date (data);

         return new Intl.DateTimeFormat ('it-IT', {
            weekday: 'short',
            day:     '2-digit',
            month:   'short'
         }).format (d);
      }
      catch (e)
      {
         return "DATE ERROR";
      }
   }


   FormattaOrario (date: Date): string
   {
      try
      {
         const hours = date.getHours ().toString ().padStart (2, '0');
         const minutes = date.getMinutes ().toString ().padStart (2, '0');
         if ((hours == "00") && (minutes == "00"))
            return "";
         else
            return `${hours}:${minutes}`;
      }
      catch (e)
      {
         return "TIME ERROR";
      }
   }


   ColoreRisorsa (evento: EventoElement): any
   {
   }


   ColoreGruppo (evento: EventoElement): any
   {
   }

   ColoreTipoEvento (evento: EventoElement): any
   {
      const colore = "#646464";
      try
      {
         if ((evento) && (evento.tipoevento == TipoEvento.EventoPeriodico))
            return {'background-color': `${colore}`};
         else
            return {};
      }
      catch (e)
      {
         return {};
      }
   }


   OnSeasonChange(evento: any)
   {
      utils.SaveToLocalStorage("BBS_CurrSeason", this.currSeason);
      this.logService.AddToLog (loggedUser, `Eventi: selezionata stagione '${this.currSeason?.nome}'`);
      this.RefreshData();
   }


   OnTipoEventoChange(evento: any)
   {
      utils.SaveToLocalStorage("BBS_CurrTipoEvento", this.currTipoEvento);
      this.RefreshData();
   }


   CreaEventiStagione()
   {
      if (this.currSeason != null)
      {
         const dlgData: MessDlgData = {
            title:               'Creazione Eventi Stagione',
            subtitle:            '',
            message:             `Sei sicuro di voloer aggiungere gli eventi vuoti per la stagione\n'<b>${this.currSeason?.nome}</b>'\nnel database?</b>`,
            messtype:            'warning',
            btncaption:          'Annulla',
            showCancelButton:    true,
            cancelButtonCaption: 'Sì, procedi'
         };

         this.messageDialogService.showMessage (dlgData, '', true).subscribe (async result =>
                                                                              {
                                                                                 if (result === 'secondary')
                                                                                 {
                                                                                    if (this.currSeason != null)
                                                                                    {
                                                                                       let goOn: boolean = false;
                                                                                       let strData: string;
                                                                                       let esisteGia: boolean = false;
                                                                                    }
                                                                                    this.cdr.detectChanges ();
                                                                                    this.RefreshData();
                                                                                 }
                                                                                 /*
                                                                                 else if (result === 'primary')
                                                                                 {
                                                                                    console.log ('L\'utente ha premuto "No, annulla"');
                                                                                    // Annulla l'azione
                                                                                 }
                                                                                 else
                                                                                 {
                                                                                    console.log ('Il dialogo è stato chiuso (es. con X o ESC) o non è stato selezionato un bottone specifico:', result);
                                                                                 }
                                                                                 */
                                                                              });
      }
   }


   async SelectAndScrollToEvent(idToSelect: number)
   {
      let rowToSelect: EventoElement | null = null;
      let selectedIndex: number = -1;
      for (let i=0;   i<this.listaEventi.length;   i++)
      {
         if (this.listaEventi[i].id == idToSelect)
         {
            rowToSelect = this.listaEventi[i];
            selectedIndex = i;
            break;
         }
      }

      this.debug++;
      if (rowToSelect)
      {
         //await utils.Dlt_Sleep(5000);
         let rts: number = 0;
         let rpp: number = 20;
         let scr1: number = selectedIndex-rpp;
         if (scr1 > 0)
            rts = scr1 + (rpp/2);
         if (this.pTable)
         {
            console.log(`GoTo line ${rts}`)
            // Lasciare le due righe che seguono: sia la chiamata diretta che quella con timeout
            this.pTable.scrollTo ({'top': 25 * rts});
            setTimeout (() => {
               if (this.pTable)
                  this.pTable.scrollTo ({'top': 25 * rts});
            }, 0);
         }
         this.currEvent = rowToSelect;
      }
      else
      {
         console.warn(`Riga con ID ${idToSelect} non trovata.`);
      }
   }


   EventiDelGiorno (aDay: Date): Array<EventoElement>
   {
      let result: Array<EventoElement> = [];
      try
      {
         for (let iii=0;   iii<this.listaEventi.length;   iii++)
         {
            if ((this.listaEventi[iii].data.getFullYear() == aDay.getFullYear()) &&
                (this.listaEventi[iii].data.getMonth() == aDay.getMonth()) &&
                (this.listaEventi[iii].data.getDate() == aDay.getDate()))
            {
               result.push(this.listaEventi[iii]);
            }
         }
      }
      catch (e)
      {
         result = [];
      }
      return result;;
   }


   async DeleteSelected()
   {
      if (this.currEvent)
      {
         try
         {
            let listaGiorno: Array<EventoElement> = [];
            listaGiorno = this.EventiDelGiorno (this.currEvent.data);
            if (listaGiorno.length > 1)
            {
               // c'è più di un evento per il giorno selezionato:
               //  cancello l'evento
               //this.isLoadingEv = true;
               await this.SetLoading(4);
               const response = await firstValueFrom (this.eventServ.DeleteData(this.currEvent.id));

               if (response.ok)
               {
                  await this.logService.AddToLog (loggedUser, `Cancellato Evento '${this.currEvent.id}'`);
                  this.RefreshData();
                  this.cdr.detectChanges ();
               }
               else
               {
                  const dlgData: MessDlgData = {
                     title:      'ERRORE',
                     subtitle:   "Errore nella cancellazione dei dati",
                     message:    `${response.message}`,
                     messtype:   'error',
                     btncaption: 'Chiudi'
                  };
                  this.messageDialogService.showMessage (dlgData, '600px');
               }
            }
            else
            {
               // c'è solo un evento nel giorno selezionato
               //  azzero l'evento senza cancellare il record
               //this.isLoadingEv = true;
               await this.SetLoading(5);
               const response = await firstValueFrom (this.eventServ.updateData (this.currEvent.id,
                                                                                 (this.currEvent.data) ? this.currEvent.data.toLocaleDateString ('ja-JP') : "",
                                                                                 `00:00`,
                                                                                 `00:00`,
                                                                                 0,
                                                                                 0,
                                                                                 "",
                                                                                 "",
                                                                                 "",
                                                                                 "",
                                                                                 false,
                                                                                 TipoEvento.EventoVuoto,
                                                                                 this.currEvent.season_id,
                                                                                 this.currEvent.master_id));

               if (response.ok)
               {
                  //await this.LoadEvents();
                  await this.RefreshData();
                  this.cdr.detectChanges ();
               }
               else
               {
                  const dlgData: MessDlgData = {
                     title:      'ERRORE',
                     subtitle:   "Errore nell'aggiornamento dei dati",
                     message:    `${response.message}`,
                     messtype:   'error',
                     btncaption: 'Chiudi'
                  };
                  this.messageDialogService.showMessage (dlgData, '600px');
               }
            }
         }
         catch(e)
         {

         }
         finally
         {
            //this.isLoadingEv = false;
            await this.SetLoading(0);
         }
      }
   }


   OnFilterRisorsa()
   {
   }


   OnFilterGruppo()
   {
   }


   async GetWindowSize()
   {
      this.windowHeight = window.innerHeight;
      let sh: number = this.windowHeight - 110 - 90 - 180;
      if (sh < 110)
         sh = 110;
      this.scrollHeight = `${sh}px`;
   }


   @HostListener('window:resize', ['$event'])
   async onResize(event: any)
   {
      await this.GetWindowSize();
   }


   async RefreshData()
   {
      setTimeout(() => { console.log("RICARICO"); window.location.reload(); }, 50);
      window.location.reload();
   }


   TimeStart()
   {
      if (!this.isRunning)
      {
         this.isRunning = true;
         this.timerInterval = setInterval(() => {
            if (this.totalSeconds > 0)
            {
               this.totalSeconds--;
               this.updateCrono();
               this.cdr.detectChanges();
            }
            else
            {
               this.TimeStop();
               // Aggiungi qui la logica per quando il tempo è scaduto
            }
         }, 1000);
      }

   }


   TimeStop(): void
   {
      if (this.timerInterval)
      {
         clearInterval(this.timerInterval);
         this.isRunning = false;
      }
   }


   private updateCrono(): void
   {
      const minutes = Math.floor(this.totalSeconds / 60);
      const seconds = this.totalSeconds % 60;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
      const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
      this.cronoTime = `${formattedMinutes}:${formattedSeconds}`;
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


   PlayerClicked(id: string)
   {
      this.currPlayer = id;
   }


   TeamClicked(id: string)
   {
      this.currTeam = id;
   }


   BenchClicked(id: string)
   {
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


   async DataBtn1Clicked (id: string)
   {
      const theComponent = this.dataCompInstances.get (id);
      if (theComponent)
      {
         this.debugstr = `${id} btn-1`;
         theComponent.Flash();
      }
   }


   DataBtn2Clicked (id: string)
   {
      const theComponent = this.dataCompInstances.get (id);
      if (theComponent)
      {
         this.debugstr = `${id} btn-2`;
         theComponent.Flash();
      }
   }


   async PointsWrong1 (id: string)
   {
      const theComponent = this.pointsCompInstances.get (id);
      if (theComponent)
      {
         this.debugstr = `${id} wrong`;
         theComponent.Flash();
      }
   }


   async PointsOk1 (id: string)
   {
      const theComponent = this.pointsCompInstances.get (id);
      if (theComponent)
      {
         this.debugstr = `${id} ok`;
         theComponent.Flash();
      }
   }


   async PointsWrong2 (id: string)
   {
      const theComponent = this.pointsCompInstances.get (id);
      if (theComponent)
      {
         this.debugstr = `${id} tap-out`;
         theComponent.Flash();
      }
   }


   async PointsOk2 (id: string)
   {
      const theComponent = this.pointsCompInstances.get (id);
      if (theComponent)
      {
         this.debugstr = `${id} tap-in`;
         theComponent.Flash();
      }
   }


   public GetSocieta(): string
   {
      if (this.currSocieta)
         return `${this.currSocieta.nome}`;
      else
         return "-";
   }


   public GetSeason(): string
   {
      if (this.currSeason)
         return this.currSeason.nome;
      else
         return "-";
   }


   async EditMatchHeader(match: MatchHeader)
   {
      this.currMatchHeader = match;
      this.diagMatchHeader = CreateEmptyMatchHeader();
      this.diagMatchHeader = JSON.parse(JSON.stringify(match, null, 3));
      if ((this.currFase) && (this.diagMatchHeader))
      {
         this.diagMatchHeader.phaseId_link = this.currFase?.id;
         this.diagMatchHeader.phaseNome_lk = this.currFase?.nome;
         this.diagMatchHeader.phaseAbbrev_lk = this.currFase?.abbrev;
      }
      this.diagMatchHeader_IsNew = false;
      this.dialogVisible_MatchHeader = true;
   }


   async OnAddMatch ()
   {
      this.diagMatchHeader = CreateEmptyMatchHeader();
      if ((this.currFase) && (this.diagMatchHeader) && (this.currChamp))
      {
         this.diagMatchHeader.phaseId_link = this.currFase?.id;
         this.diagMatchHeader.phaseNome_lk = this.currFase?.nome;
         this.diagMatchHeader.phaseAbbrev_lk = this.currFase?.abbrev;
         //
         this.diagMatchHeader.champId_lk = this.currChamp?.id;
         this.diagMatchHeader.champNome_lk = this.currChamp?.nome;
      }
      this.diagMatchHeader_IsNew = true;
      this.dialogVisible_MatchHeader = true;
   }


   async DeleteMatchHeader(match: MatchHeader)
   {
      const dlgData: MessDlgData = {
         title:               'Cancellazione Match',
         subtitle:            '',
         message:             `Sei veramente sicuro di voloer cancellare il match '<b>${match.myTeamNome_lk} - ${match.oppoTeamNome_lk}</b>' dal database?`,
         messtype:            'warning',
         btncaption:          'Annulla',
         showCancelButton:    true,
         cancelButtonCaption: 'Sì, procedi'
      };

      this.messageDialogService.showMessage (dlgData, '', true).subscribe (result =>
                     {
                        if (result === 'secondary')
                        {
                           this.matchHeaderServ.DeleteData(match.id).subscribe (async data =>
                                                                               {
                                                                                  if (data)
                                                                                  {
                                                                                     if (data.ok)
                                                                                     {
                                                                                        if ((this.currSeason) && (this.currChamp) && (this.currFase))
                                                                                        {
                                                                                           await this.LoadChamp (this.currSeason.id);
                                                                                           await this.LoadPhase (this.currChamp.id);
                                                                                           await this.LoadMatchHeader (this.currFase.id);
                                                                                           this.cdr.detectChanges ();
                                                                                        }
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
                                                                               })
                        }
                     });
   }


   async OpenMatch (match: MatchHeader)
   {
      this.dialogVisible_Players = true;
   }


   async MatchStatus(match: MatchHeader)
   {
      this.currMatchHeader = match;
      if (this.currMatchHeader)
      {
         this.diagMatchStatus_Items = [];
         this.diagMatchStatus_Items.push (matchStatusType.notPlayed);
         this.diagMatchStatus_Items.push (matchStatusType.playing);
         this.diagMatchStatus_Items.push (matchStatusType.terminated);
         if (this.currMatchHeader.matchStatus == matchStatusType.playing.code)
            this.diagMatchStatus_Status = matchStatusType.playing;
         else if (this.currMatchHeader.matchStatus == matchStatusType.terminated.code)
            this.diagMatchStatus_Status = matchStatusType.terminated;
         else
            this.diagMatchStatus_Status = matchStatusType.notPlayed;
         this.dialogVisible_MatchStatus = true;
      }
   }


   async onMatchHeaderDblClick (item: MatchHeader)
   {
      await this.OpenMatch(item);
   }


   MatchStatusToString (item: MatchHeader): string
   {
      switch (item.matchStatus)
      {
         case matchStatusType.terminated.code: return matchStatusType.terminated.abbrev;
         case matchStatusType.playing.code:    return matchStatusType.playing.abbrev;
         default:                            return matchStatusType.notPlayed.abbrev;
      }
   }


   async SalvaMatchHeader(datiMH: { mh: MatchHeader})
   {
      this.dialogVisible_MatchHeader = false;
      if (this.diagMatchHeader_IsNew)
      {
         this.currMatchHeader = JSON.parse(JSON.stringify(datiMH.mh, null, 3));
         if (this.currMatchHeader)
         {
            const dataForDb: string = JSON.stringify (this.matchHeaderServ.MatchHeaderToDb (this.currMatchHeader), null, -1);
            let rrr = await firstValueFrom (this.matchHeaderServ.addNewData(dataForDb));
            if ((this.currSeason) && (this.currChamp) && (this.currFase))
            {
               await this.LoadChamp (this.currSeason.id);
               await this.LoadPhase (this.currChamp.id);
               await this.LoadMatchHeader (this.currFase.id);
               this.cdr.detectChanges ();
            }
         }
      }
      else
      {
         this.currMatchHeader = JSON.parse(JSON.stringify(datiMH.mh, null, 3));
         if (this.currMatchHeader)
         {
            const dataForDb: string = JSON.stringify (this.matchHeaderServ.MatchHeaderToDb (this.currMatchHeader), null, -1);
            let rrr = await firstValueFrom (this.matchHeaderServ.updateData (this.currMatchHeader.id, dataForDb));
            if ((this.currSeason) && (this.currChamp) && (this.currFase))
            {
               await this.LoadChamp (this.currSeason.id);
               await this.LoadPhase (this.currChamp.id);
               await this.LoadMatchHeader (this.currFase.id);
               this.cdr.detectChanges ();
            }
         }
      }
   }


   AnnullaMatchHeader()
   {
      this.dialogVisible_MatchHeader = false;
   }


   MatchDate(): Date
   {
      if (this.currMatchHeader)
         return this.currMatchHeader.matchDate;
      else
         return this.today;
   }


   onMatchHeaderDialogShow()
   {
      if (this.matchHeaderComp)
         this.matchHeaderComp.onDialogShown();
   }


   async onPlayersComponentShow()
   {
      if (this.playersComp)
         await this.playersComp.onComponentShow(1);
   }


   DialogMatchStatusAnnulla()
   {
      this.dialogVisible_MatchStatus = false;
   }


   async DialogMatchStatusSalva()
   {
      this.dialogVisible_MatchStatus = false;
      if ((this.currMatchHeader) && (this.currMatchHeader.matchStatus != this.diagMatchStatus_Status.code))
      {
         this.currMatchHeader.matchStatus = this.diagMatchStatus_Status.code;
         const dataForDb: string = JSON.stringify (this.matchHeaderServ.MatchHeaderToDb (this.currMatchHeader), null, -1);
         let rrr = await firstValueFrom (this.matchHeaderServ.updateData (this.currMatchHeader.id, dataForDb));
         if ((this.currSeason) && (this.currChamp) && (this.currFase))
         {
            await this.LoadChamp (this.currSeason.id);
            await this.LoadPhase (this.currChamp.id);
            await this.LoadMatchHeader (this.currFase.id);
            this.cdr.detectChanges ();
         }
      }
   }


   SalvaPlayersDiag()
   {
      this.dialogVisible_Players = false;
   }


   AnnullaPlayersDiag()
   {
      this.dialogVisible_Players = false;
   }


   protected readonly CreateEmptyMatchHeader = CreateEmptyMatchHeader;
}
