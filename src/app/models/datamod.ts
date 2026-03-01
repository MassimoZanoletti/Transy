
import { signal,
   computed,
   WritableSignal,
   Signal } from '@angular/core';
import {
   globs,
   utils } from "../common/utils";



export interface IDSUser
{
   id: number;
   nome: string;
   password: string;
   ruolo: string;
   ruolo_id: number;
   attributo: number
}


export interface IDSSocieta
{
   id: number;
   nome: string;
}


export interface IDSSeason
{
   id: number;
   nome: string;
   abbrev: string;
   tenantid_link: number;
}


export interface IDSChamp
{
   id: number;
   nome: string;
   abbrev: string;
   seasonid_link: number;
}


export interface IDSPhase
{
   id: number;
   nome: string;
   abbrev: string;
   champid_link: number;
   exportfolder: string;
}


export interface IDSTeam
{
   type: string;
   id: number;
   nome: string;
   abbrev: string;
   champid_link: number;
   logo: string;
}


export interface IDSPlayer
{
   id: number;
   nomedisp: string;
   anno: number;
   ruolo: string;
   numero: string;
   altezza: number;
   teamid_link: number;
}


export type TDSPlayer =
{
   type: string;
   id: number;
   nomedisp: string;
   anno: number;
   ruolo: string;
   numero: string;
   altezza: number;
   teamid_link: number;
}

export function CreateEmptyPlayer(): TDSPlayer
{
   return {
      type: "tdsplayer",
      id: 0,
      nomedisp: "",
      anno: 0,
      ruolo: "",
      numero: "",
      altezza: 0,
      teamid_link: 0
   };
}


export interface IDSMatchHeadersData
{
   ok: boolean;
   message: string;
   elements: Array<IDSMatchHeaderDb>;
}

export interface IDSMatchHeaderDb
{
   id: number;
   phaseid_link: number;
   myteamid_link : number;
   oppoteamid_link : number;
   title: string;
   matchnumber : number;
   matchdate: string;
   athome: boolean;
   arbitro1: string;
   arbitro2: string;
   mycoach1id_link : number;
   mycoach2id_link : number;
   oppocoach1id_link : number;
   oppocoach2id_link : number;
   myteamdelta: number;
   oppoteamdelta: number;
   myteamcolor : string;
   oppoteamcolor : string;
   location: string;
   giornata: string;
   myteamtimeout: string;
   oppoteamtimeout: string;
   matchstatus: string;
   matcheventsfile: string;
   matchdatafile: string;
   myteamincampo: string;
   oppoteamincampo: string;
   myteampoints: number;
   oppoteampoints: number;
   exportedfile: string;
   champnome_lk: string;
   myteamnome_lk : string;
   oppoteamnome_lk : string;
   phasenome_lk: string;
   champid_lk: number;
   myteamabbrev_lk: string
   oppoteamabbrev_lk: string
   phaseabbrev_lk: string
}

export interface IDSMatchHeader
{
   id: number;
   title: string;
   matchNumber : number;
   matchDate: Date;
   matchDateStr: string;
   atHome: boolean;
   giornata: string;
   location: string;
   arbitro1: string;
   arbitro2: string;
   matchStatus: string;
   matchEventsFile: string;
   matchDataFile: string;
   exportedFile: string;
   phaseId_link: number;
   phaseNome_lk: string;
   phaseAbbrev_lk: string
   champId_lk: number;
   champNome_lk: string;
   myTeamId_link : number;
   myTeamNome_lk : string;
   myTeamAbbrev_lk: string
   myTeamDelta: number;
   myTeamColor : string;
   myTeamTimeout: string;
   myTeamInCampo: string;
   myTeamPoints: number;
   myCoach1Id_link : number;
   myCoach2Id_link : number;
   oppoTeamId_link : number;
   oppoTeamNome_lk : string;
   oppoTeamAbbrev_lk: string
   oppoTeamDelta: number;
   oppoTeamColor : string;
   oppoTeamTimeout: string;
   oppoTeamInCampo: string;
   oppoTeamPoints: number;
   oppoCoach1Id_link : number;
   oppoCoach2Id_link : number;
}


export function CreateEmptyMatchHeader(): IDSMatchHeader
{
   return {
      id: 0,
      giornata: "",
      location: "",
      matchStatus: "",
      matchDateStr: "",
      arbitro1:          "",
      arbitro2:          "",
      atHome:            true,
      champId_lk:        0,
      champNome_lk:      "",
      exportedFile:      "",
      matchDataFile:     "",
      matchDate:         new Date(),
      matchEventsFile:   "",
      matchNumber:       0,
      myCoach1Id_link:   0,
      myCoach2Id_link:   0,
      myTeamAbbrev_lk:   "",
      myTeamColor:       "",
      myTeamDelta:       0,
      myTeamId_link:     0,
      myTeamInCampo:     "",
      myTeamNome_lk:     "",
      myTeamPoints:      0,
      myTeamTimeout:     "",
      oppoCoach1Id_link: 0,
      oppoCoach2Id_link: 0,
      oppoTeamAbbrev_lk: "",
      oppoTeamColor: "",
      oppoTeamDelta: 0,
      oppoTeamId_link: 0,
      oppoTeamInCampo: "",
      oppoTeamNome_lk: "",
      oppoTeamPoints: 0,
      oppoTeamTimeout: "",
      phaseAbbrev_lk: "",
      phaseId_link: 0,
      title: "",
      phaseNome_lk: ""
   };
}


export type TDSMatchRosterData =
{
   ok: boolean;
   message: string;
   elements: Array<TDSMatchRosterDb>;
}



export type TDSMatchRosterDb =
{
   id: number;
   matchheaderid_link: number;
   playerid_link: number;
   playnumber: string;
   capitano: boolean;
   ismyteam: boolean;
   quintetto: boolean;
   dbgmatch: string;
   dbgplayer: string;
   type: string;
   playername_lk: string;
}


export type TDSMatchRoster =
{
   id: number;
   matchHeaderId_link: number;
   playerId_link: number;
   playNumber: string;
   capitano: boolean;
   isMyTeam: boolean;
   quintetto: boolean;
   dbgMatch: string;
   dbgPlayer: string;
   type: string;
   playerName_lk: string;
   matchRosterIndex: string;
}


export function CreateEmptyMatchRoster(): TDSMatchRoster
{
   return {
      id: 0,
      matchHeaderId_link: 0,
      playerId_link: 0,
      playNumber: "",
      capitano: false,
      isMyTeam: false,
      quintetto: false,
      dbgMatch: "",
      dbgPlayer: "",
      type: "",
      playerName_lk: "",
      matchRosterIndex: ""
   };
}


export type TDSCoach =
{
   id: number;
   nome: string;
   teamid_link: number;
}


export function CreateEmptyCoach(): TDSCoach
{
   return {
      id: 0,
      nome: "",
      teamid_link: 0
   };
}



export type TDSQuartoDb =
{
   id: number;
   matchheaderid_link: number;
   num: number;
   isregular: boolean;
   status: string;
   myteamstartpoint: number;
   oppoteamstartpoint: number;
   myteamcurrpoint: number;
   oppoteamcurrpoint: number;
   myteamfouls: number;
   oppoteamfouls: number;
   myteambonus: boolean;
   oppoteambonus: boolean;
}


export type TDSQuartoData =
{
   ok: boolean;
   message: string;
   elements: Array<TDSQuartoDb>;
}


export type TDSQuarto =
{
   id: number;
   matchHeaderId_link: number;
   num: number;
   isRegular: boolean;
   status: string;
   myTeamStartPoint: number;
   oppoTeamStartPoint: number;
   myTeamCurrPoint: number;
   oppoTeamCurrPoint: number;
   myTeamFouls: number;
   oppoTeamFouls: number;
   myTeamBonus: boolean;
   oppoTeamBonus: boolean;
}


export function CreateEmptyQuarto(): TDSQuarto
{
   return {
      id:                 0,
      matchHeaderId_link: 0,
      num:                0,
      isRegular:          true,
      status:             "",
      myTeamStartPoint:   0,
      oppoTeamStartPoint: 0,
      myTeamCurrPoint:    0,
      oppoTeamCurrPoint:  0,
      myTeamFouls:        0,
      oppoTeamFouls:      0,
      myTeamBonus:        false,
      oppoTeamBonus: false
   };
}



export interface MatchEvents
{
   /*
    ID              INTEGER,
    LinkMatchHeader INTEGER,
    LinkTeam1       INTEGER,
    LinkPlayer1     INTEGER,
    LinkTeam2       INTEGER,
    LinkPlayer2     INTEGER,
    Quarter         VARCHAR(255),
    Time            VARCHAR(255),
    EventID         INTEGER,
    EventDesc       VARCHAR(255),
    EventExtraID    INTEGER,
    EventExtraDesc  VARCHAR(255)
   */
   /*
      TblMatchEventsID: TFDAutoIncField;
      TblMatchEventsEventDesc: TWideStringField;
      TblMatchEventsEventExtraDesc: TWideStringField;
      TblMatchEventsEventExtraID: TIntegerField;
      TblMatchEventsEventID: TIntegerField;
      TblMatchEventsLinkMatchHeader: TIntegerField;
      TblMatchEventsLinkPlayer1: TIntegerField;
      TblMatchEventsLinkPlayer2: TIntegerField;
      TblMatchEventsLinkTeam1: TIntegerField;
      TblMatchEventsLinkTeam2: TIntegerField;
      TblMatchEventsQuarter: TWideStringField;
      TblMatchEventsTime: TWideStringField;
   */
}


export interface PlayerStats
{
   /*
    ID              INTEGER,
    LinkPlayer      INTEGER,
    LinkMatch       INTEGER,
    Minuti          INTEGER,
    Punti           INTEGER,
    TLT             INTEGER,
    TLR             INTEGER,
    T2T             INTEGER,
    T2R             INTEGER,
    T3T             INTEGER,
    T3R             INTEGER,
    TDCT            INTEGER,
    TDCR            INTEGER,
    FalliCommessi   INTEGER,
    Fallisubiti     INTEGER,
    RimbalziDifesa  INTEGER,
    RimbalziAttacco INTEGER,
    Rimbalzitotali  INTEGER,
    PallePerse      INTEGER,
    PalleRecuperate INTEGER,
    StoppateSubite  INTEGER,
    StoppateFatte   INTEGER,
    Assist          INTEGER,
    PIR             INTEGER,
    OER             INTEGER,
    PlusMinus       INTEGER
   */
   /*
      TblPlayerTeamName: TStringField;
      TblPlayerStatsID: TFDAutoIncField;
      TblPlayerStatsAssist: TIntegerField;
      TblPlayerStatsFalliCommessi: TIntegerField;
      TblPlayerStatsFallisubiti: TIntegerField;
      TblPlayerStatsLinkMatch: TIntegerField;
      TblPlayerStatsLinkPlayer: TIntegerField;
      TblPlayerStatsMinuti: TIntegerField;
      TblPlayerStatsOER: TIntegerField;
      TblPlayerStatsPallePerse: TIntegerField;
      TblPlayerStatsPalleRecuperate: TIntegerField;
      TblPlayerStatsPIR: TIntegerField;
      TblPlayerStatsPlusMinus: TIntegerField;
      TblPlayerStatsPunti: TIntegerField;
      TblPlayerStatsRimbalziAttacco: TIntegerField;
      TblPlayerStatsRimbalziDifesa: TIntegerField;
      TblPlayerStatsRimbalzitotali: TIntegerField;
      TblPlayerStatsStoppateFatte: TIntegerField;
      TblPlayerStatsStoppateSubite: TIntegerField;
      TblPlayerStatsT2R: TIntegerField;
      TblPlayerStatsT2T: TIntegerField;
      TblPlayerStatsT3R: TIntegerField;
      TblPlayerStatsT3T: TIntegerField;
      TblPlayerStatsTDCR: TIntegerField;
      TblPlayerStatsTDCT: TIntegerField;
      TblPlayerStatsTLR: TIntegerField;
      TblPlayerStatsTLT: TIntegerField;
   */
}





export class TFallo
{
   public fCommesso: boolean = false;
   public numLiberi: number = 0;
   public fTecnico: boolean = false;
   public fAntisportivo: boolean = false;
   public fEspulsione: boolean = false;
   public fQuarto: number = 0;
   public fTempo: number = 0;  // tempo di gioco relativo al quarto (in secondi)


   constructor()
   {
      this.Reset();
   }


   public async Reset()
   {
      this.fCommesso = false;
      this.numLiberi = 0;
      this.fTecnico = false;
      this.fAntisportivo = false;
      this.fEspulsione = false;
      this.fQuarto = 0;
      this.fTempo = 0;
   }


   public Clone(): TFallo
   {
      const copia: TFallo = new TFallo();
      Object.assign(copia, this);
      return copia;
   }


   public SaveToJson(): any
   {
      let result = {
         commesso: this.fCommesso,
         numLiberi: this.numLiberi,
         tecnico: this.fTecnico,
         antisportivo: this.fAntisportivo,
         espulsione: this.fEspulsione,
         quarto: this.fQuarto,
         tempo: this.fTempo
      };
      return result;
   }


   public LoadFromJson (aSrc: any)
   {
      if (aSrc == null)
         return;
      if (aSrc.commesso)
         this.fCommesso = aSrc.commesso;
      if (aSrc.numLiberi)
         this.numLiberi = aSrc.numLiberi;
      if (aSrc.tecnico)
         this.fTecnico = aSrc.tecnico;
      if (aSrc.antisportivo)
         this.fAntisportivo = aSrc.antisportivo;
      if (aSrc.espulsione)
         this.fEspulsione = aSrc.espulsione;
      if (aSrc.quarto)
         this.fQuarto = aSrc.quarto;
      if (aSrc.tempo)
         this.fTempo = aSrc.tempo;
   }
}




export enum TQuarterStatus
{
   qsNotPlayed = 0,
   qsPlaying = 1,
   qaPlayed = 2
}
export namespace TQuarterStatus
{
   export function toString(value: TQuarterStatus): string { return TQuarterStatus[value]; }
   export function fromString (value: string): TQuarterStatus { return (TQuarterStatus as any)[value]; }
}




export class TQuarterTeam
{
   private _fNumQuarto: number = 0;
   private _fPunti: number = 0;
   private _fFalli: number = 0;
   private _fBonus: boolean = false;
   private _falliPerBonus: number = 4;
   private _fStatus: TQuarterStatus = TQuarterStatus.qsNotPlayed;


   constructor (aNum: number,
                aFalliPerBonus: number)
   {
      this.numQuarto = aNum;
      this._falliPerBonus = aFalliPerBonus;
      this.Reset();
   }


   public Clone(): TQuarterTeam
   {
      const copia: TQuarterTeam = new TQuarterTeam(this.numQuarto, this._falliPerBonus);
      copia._fPunti = this._fPunti;
      copia._fFalli = this._fFalli;
      copia._fBonus = this._fBonus;
      copia._fStatus = this._fStatus;
      return copia;
   }


   public SaveToJson(): any
   {
      let result = {
         numQuarto: this._fNumQuarto,
         punti: this._fPunti,
         falli: this._fFalli,
         bonus: this._fBonus,
         falliPerBonus: this._falliPerBonus,
         status: this._fStatus
      };
      return result;
   }


   public LoadFromJson (aSrc: any)
   {
      if (aSrc == null)
         return;
      if (aSrc.numQuarto)
         this.numQuarto = aSrc.numQuarto;
      if (aSrc.punti)
         this.punti = aSrc.punti;
      if (aSrc.falliPerBonus)
         this._falliPerBonus = aSrc.falliPerBonus;
      if (aSrc.falli)
         this.falliQrt = aSrc.falli;
      if (aSrc.status)
         this.status = aSrc.status;
   }


   get numQuarto(): number { return this._fNumQuarto; }
   set numQuarto(value: number) { this._fNumQuarto = value; }

   get punti(): number { return this._fPunti; }
   set punti(value: number) { this._fPunti = value; }

   get falliQrt(): number { return this._fFalli; }
   set falliQrt(value: number)
   {
      this._fFalli = value;
      this._fBonus = (this._fFalli >= this._falliPerBonus);
   }

   get bonus(): boolean { return this._fBonus; }
   set bonus(value: boolean) { this._fBonus = value; }

   get status(): TQuarterStatus { return this._fStatus; }
   set status(value: TQuarterStatus) { this._fStatus = value; }


   public Reset(): void
   {
      this.punti = 0;
      this.falliQrt = 0;
      this.bonus = false;
      this.status = TQuarterStatus.qsNotPlayed;
   }

} // class TQuarterTeam





export enum TTipoRealizzazione
{
   trUndefined = 0,
   trTL = 1,
   trT2 = 2,
   trT3 = 3
}
export namespace TTipoRealizzazione
{
   export function toString(value: TTipoRealizzazione): string { return TTipoRealizzazione[value]; }
   export function fromString (value: string): TTipoRealizzazione { return (TTipoRealizzazione as any)[value]; }
}


export class TRealizzazione
{
   public id: number;
   public rQuarto: number;
   public rTempo: number;
   public rTipo: TTipoRealizzazione;
   public rPunti: number;
   public rPosX: number;
   public rPosY: number;
   public rPlr: TMatchPlayer | null;


   constructor ()
   {
      this.id = 0;
      this.rQuarto = 0;
      this.rTempo = 0;
      this.rTipo = TTipoRealizzazione.trUndefined;
      this.rPunti = 0;
      this.rPosX = 0;
      this.rPosY = 0;
      this.rPlr = null;
   }


   async Add (aTipo: TTipoRealizzazione,
              aQrt: number,
              aTempo: number,
              aFatto: boolean,
              aX: number,
              aY: number)
   {
      this.rTipo = aTipo;
      this.rQuarto = aQrt;
      this.rTempo = aTempo;
      if (aFatto)
      {
         if (aTipo == TTipoRealizzazione.trTL)
            this.rPunti = 1;
         if (aTipo == TTipoRealizzazione.trT2)
            this.rPunti = 2;
         if (aTipo == TTipoRealizzazione.trT3)
            this.rPunti = 3;
      }
      else
         this.rPunti = 0;
      this.rPosX = aX;
      this.rPosY = aY;
   }


   public Clone(): TRealizzazione
   {
      const copia: TRealizzazione = new TRealizzazione();
      Object.assign(copia, this);
      if (this.rPlr != null)
      {
         if (copia.rPlr == null)
            copia.rPlr = new TMatchPlayer();
         copia.rPlr = this.rPlr.Clone ();
      }
      else
      {
         copia.rPlr = null;
      }
      return copia;
   }


   public SaveToJson(): any
   {
      let result = {
         id: this.id,
         quarto: this.rQuarto,
         tempo: this.rTempo,
         tipo: this.rTipo,
         punti: this.rPunti,
         posX: this.rPosX,
         posY: this.rPosY,
         plr: (this.rPlr == null) ? "null" : { id: this.rPlr.playerRecID, name: this.rPlr.playName}
      };
      return result;
   }


} // class TRealizzazione




export class TMatchPlayer
{
   private _fakeFouls: number = 0;

   public playerRecID: number = 0;
   public rosterRecID: number = 0;
   public _simulation: boolean = false;
   public fPMIn: number = 0;
   public currCronotime: number = 0;
   public internalSort: number = 0;

   public tempoGioco        = signal<number>(0);
   public falliSubiti       = signal<number>(0);
   public rimbAttacco       = signal<number>(0);
   public rimbDifesa        = signal<number>(0);
   public pRecuperate       = signal<number>(0);
   public pPerse            = signal<number>(0);
   public stoppSubite       = signal<number>(0);
   public stoppFatte        = signal<number>(0);
   public assist            = signal<number>(0);
   public inTime            = signal<number>(0);
   public outTime           = signal<number>(0);
   public IsMyTeam          = signal<boolean>(true);
   public inGioco           = signal<boolean>(false);
   public inQuintetto       = signal<boolean>(false);
   public isMyTeam          = signal<boolean>(true);
   public falliFatti        = signal<TFallo[]>([]);
   public realizzazioni		= signal<TRealizzazione[]>([]);
   public plusMinus          = signal<number>(0);
   public playName = signal<string>("");
   public playNumber = signal<string>("");
   public captain = signal<boolean>(false);


   constructor()
   {
      this.initFouls();
      this.reset();
   }


   private initFouls()
   {
      this.falliFatti.set([]);
      const initialFouls: TFallo[] = [];
      for (let iii =0;   iii<globs.maxPlayerFouls;   iii++)
      {
         initialFouls.push(new TFallo());
      }
      this.falliFatti.set(initialFouls);
   }


   public reset(): void
   {
      this._simulation = false;
      this._fakeFouls = 0;
      this.playerRecID = 0;
      this.rosterRecID = 0;
      this.playName.set("");
      this.playNumber.set("");
      this.captain.set(false);
      this.inQuintetto.set(false);
      this.isMyTeam.set(true);
      this.inGioco.set(false);
      this.realizzazioni.set([]);
      this.tempoGioco.set(0);
      this.falliSubiti.set(0);
      this.rimbAttacco.set(0);
      this.rimbDifesa.set(0);
      this.pPerse.set(0);
      this.pRecuperate.set(0);
      this.stoppSubite.set(0);
      this.stoppFatte.set(0);
      this.assist.set(0);
      this.plusMinus.set(0);

      this.falliFatti().forEach(f => f.Reset?.()); // Se Reset è sincrono
   }


   public Clone(): TMatchPlayer
   {
      const copia: TMatchPlayer = new TMatchPlayer();
      copia._simulation = this._simulation;
      copia._fakeFouls = this._fakeFouls;
      copia.playerRecID = this.playerRecID;
      copia.rosterRecID = this.rosterRecID;
      copia.playName.set(this.playName());
      copia.playNumber.set(this.playNumber());
      copia.captain.set(this.captain());
      copia.inQuintetto.set(this.inQuintetto());
      copia.isMyTeam.set(this.isMyTeam());
      copia.inGioco.set(this.inGioco());
      copia.tempoGioco.set(this.tempoGioco());
      copia.falliSubiti.set(this.falliSubiti());
      copia.rimbAttacco.set(this.rimbAttacco());
      copia.rimbDifesa.set(this.rimbDifesa());
      copia.pPerse.set(this.pPerse());
      copia.pRecuperate.set(this.pRecuperate());
      copia.stoppSubite.set(this.stoppSubite());
      copia.stoppFatte.set(this.stoppFatte());
      copia.assist.set(this.assist());
      copia.plusMinus.set(this.plusMinus());
      copia.realizzazioni.set(this.realizzazioni().map(r => r.Clone()));
      copia.falliFatti.set(this.falliFatti().map(f => f.Clone()));

      return copia;
   }


   public SaveToJson(): any
   {
      let result = {
         fakeFouls: this._fakeFouls,
         playerRecID: this.playerRecID,
         _simulation: this._simulation,
         fPMIn: this.fPMIn,
         currCronotime: this.currCronotime,
         internalSort: this.internalSort,
         tempoGioco: this.tempoGioco(),
         falliSubiti: this.falliSubiti(),
         rimbAttacco: this.rimbAttacco(),
         rimbDifesa: this.rimbDifesa(),
         pRecuperate: this.pRecuperate(),
         pPerse: this.pPerse(),
         stoppSubite: this.stoppSubite(),
         stoppFatte: this.stoppFatte(),
         assist: this.assist(),
         inTime: this.inTime(),
         outTime: this.outTime(),
         IsMyTeam: this.IsMyTeam(),
         inGioco: this.inGioco(),
         inQuintetto: this.inQuintetto(),
         isMyTeam: this.isMyTeam(),
         plusMinus: this.plusMinus(),
         playName: this.playName(),
         playNumber: this.playNumber(),
         captain: this.captain(),
         //falliFatti: [],
         //realizzazioni: [],
         falliFatti: this.falliFatti().map(fff => fff.SaveToJson()),
         realizzazioni: this.realizzazioni().map(rrr => rrr.SaveToJson())
      };
      /*
      for (let i=0;   i<this.falliFatti.length;   i++)
      {
         const fff: TFallo = this.falliFatti()[i];
         result.falliFatti.push(fff.SaveToJson());
      }
      */
      /*
      for (let i=0;   i<this.realizzazioni.length;   i++)
      {
         const rrr: TRealizzazione = this.realizzazioni()[i];
         result.realizzazioni.push(rrr.SaveToJson());
      }
      */
      return result;
   }


   public CalcolaPunti: Signal<number> = computed(() =>
   {
      return this.realizzazioni().reduce((acc, r) =>
      {
         if (r.rPunti <= 0)
            return acc;

         switch (r.rTipo)
         {
            case TTipoRealizzazione.trTL:
               return acc + 1;
            case TTipoRealizzazione.trT2:
               return acc + 2;
            case TTipoRealizzazione.trT3:
               return acc + 3;
            default:
               return acc;
         }
      }, 0);
   });


   public GetFalliFatti: Signal<number> = computed(() =>
   {
      return this.falliFatti().filter(f => f.fCommesso).length;
   });


   public CalcRimbalzi: Signal<number> = computed(() =>
   {
      return this.rimbAttacco() + this.rimbDifesa();
   });


   // --- Calcoli Tiri Liberi (TL) ---
   public CalcTLRealizz : Signal<number> = computed(() =>
      { return this.realizzazioni().filter(r => r.rTipo === TTipoRealizzazione.trTL && r.rPunti > 0).length; });
   public CalcTLTentati: Signal<number> = computed(() =>
      { return this.realizzazioni().filter(r => r.rTipo === TTipoRealizzazione.trTL).length; });
   public CalcTLPunti: Signal<number> = computed(() =>{ return this.CalcTLRealizz(); });
   public CalcTLPerc: Signal<string> = computed(() =>
   {
      const t = this.CalcTLTentati();
      return t > 0 ? ((this.CalcTLRealizz() * 100) / t).toFixed(0) : "0";
   });
   public CalcTLData: Signal<string> = computed(() =>
   {
      const t = this.CalcTLTentati();
      return t > 0 ? `${this.CalcTLRealizz()}/${t} (${this.CalcTLPerc()}%)` : "";
   });


   // --- Calcoli Tiro da 2 (T2) ---
   public CalcT2Realizz: Signal<number> = computed(() =>
      { return this.realizzazioni().filter(r => r.rTipo === TTipoRealizzazione.trT2 && r.rPunti > 0).length; });
   public CalcT2Tentati: Signal<number> = computed(() =>
      { return this.realizzazioni().filter(r => r.rTipo === TTipoRealizzazione.trT2).length; });
   public CalcT2Punti: Signal<number> = computed(() =>
      { return this.CalcT2Realizz() * 2; });
   public CalcT2Perc: Signal<string> = computed(() =>
   {
      const t = this.CalcT2Tentati();
      return t > 0 ? ((this.CalcT2Realizz() * 100) / t).toFixed(0) : "0";
   });
   public CalcT2Data: Signal<string> = computed(() =>
   {
      const t = this.CalcT2Tentati();
      return t > 0 ? `${this.CalcT2Realizz()}/${t} (${this.CalcT2Perc()}%)` : "";
   });


   // --- Calcoli Tiro da 3 (T3) ---
   public CalcT3Realizz: Signal<number> = computed(() =>
      { return this.realizzazioni().filter(r => r.rTipo === TTipoRealizzazione.trT3 && r.rPunti > 0).length; });
   public CalcT3Tentati: Signal<number> = computed(() =>
      { return this.realizzazioni().filter(r => r.rTipo === TTipoRealizzazione.trT3).length; });
   public CalcT3Punti: Signal<number> = computed(() =>
      { return this.CalcT3Realizz() * 3; });
   public CalcT3Perc: Signal<string> = computed(() =>
   {
      const t = this.CalcT3Tentati();
      return t > 0 ? ((this.CalcT3Realizz() * 100) / t).toFixed(0) : "0";
   });
   public CalcT3Data: Signal<string> = computed(() =>
   {
      const t = this.CalcT3Tentati();
      return t > 0 ? `${this.CalcT3Realizz()}/${t} (${this.CalcT3Perc()}%)` : "";
   });


   // --- Calcoli Totale Dal Campo (Tdc) ---
   public CalcTdcRealizz: Signal<number> = computed(() =>
      { return (this.CalcT2Realizz()) + (this.CalcT3Realizz()); });
   public CalcTdcTentati: Signal<number> = computed(() =>
      { return (this.CalcT2Tentati()) + (this.CalcT3Tentati()); });
   public CalcTdcPunti: Signal<number> = computed(() =>
      { return (this.CalcT2Punti()) + (this.CalcT3Punti()); });
   public CalcTdcPerc: Signal<string> = computed(() =>
   {
      const t = this.CalcTdcTentati();
      return t > 0 ? ((this.CalcTdcRealizz() * 100) / t).toFixed(0) : "0";
   });
   public CalcTdcData: Signal<string> = computed(() =>
   {
      const t = this.CalcTdcTentati();
      return t > 0 ? `${this.CalcTdcRealizz()}/${t} (${this.CalcTdcPerc()}%)` : "";
   });


   // --- OER & PIR ---
   public CalcOER: Signal<number> = computed(() =>
   {
      const denom = (this.CalcTdcTentati()) + ((this.CalcTLTentati()) / 2.0) + this.pPerse();
      return Math.abs(denom) > 0.0001 ? (this.CalcolaPunti()) / denom : 0.0;
   });


   public CalcOERMin: Signal<number> = computed(() =>
   {
      const tgTot = this.TempoGiocoTot(false);
      if (tgTot <= 0)
         return 0.0;

      // Simulo accesso a configurazione globale
      const quartiGiocati = (globalThis as any).MainWind?.GetQuarterPlayed() || 1;
      const durReg = globs.DurationRegulTime;
      const durExtra = globs.DurationExtraTime;

      let totPartita = (quartiGiocati <= globs.MaxRegQuarters)
         ? quartiGiocati * durReg
         : (globs.MaxRegQuarters * durReg) + ((quartiGiocati - globs.MaxRegQuarters) * durExtra);

      const totPartitaMin = totPartita / 60;
      const tgGiocatoreMin = tgTot / 60;
      return ((this.CalcOER()) * totPartitaMin) / tgGiocatoreMin;
   });


   public CalcPIR: Signal<number> = computed(() =>
   {
      const pos = (this.CalcolaPunti()) + (this.CalcRimbalzi()) + this.assist() + this.pRecuperate() + this.stoppFatte() + this.falliSubiti();
      const neg = ((this.CalcTdcTentati()) - (this.CalcTdcRealizz())) +
                           ((this.CalcTLTentati()) - (this.CalcTLRealizz())) +
                           this.pPerse() + this.stoppSubite() + (this.GetFalliFatti());
      return pos - neg;
   });


   public CalcPIRMin: Signal<number> = computed(() =>
   {
      const tgTot = this.TempoGiocoTot(false);
      if (tgTot <= 0)
         return 0.0;
      const quartiGiocati = (globalThis as any).MainWind?.GetQuarterPlayed() || 1;
      const durReg = globs.DurationRegulTime;
      const durExtra = globs.DurationExtraTime;

      let totPartita = (quartiGiocati <= globs.MaxRegQuarters)
         ? quartiGiocati * durReg
         : (globs.MaxRegQuarters * durReg) + ((quartiGiocati - globs.MaxRegQuarters) * durExtra);

      return ((this.CalcPIR()) * (totPartita / 60)) / (tgTot / 60);
   });


   // --- Gestione Tempo Gioco ---
   public TempoGiocoTot(aAncheInGioco: boolean): number
   {
      let res = 0;
      if (aAncheInGioco && this.inGioco())
      {
         res = this.inTime() - ((globalThis as any).MainWind?.FrmTime?.CurrentTime || 0);
      }
      res += this.tempoGioco();
      return res < 0 ? 0 : res;
   }


   public TotalPlayingTimeStr: Signal<string> = computed(() =>
   {
      const tm = this.TempoGiocoTot(true);
      return `${Math.floor(tm / 60).toString().padStart(2, '0')}:${(tm % 60).toString().padStart(2, '0')}`;
   });


   public CalcolaTempoGiocoStr: Signal<string> = computed(() =>
   {
      let vvv = this.TempoGiocoTot (false);
      if (this.inGioco())
         vvv += (this.inTime() - this.currCronotime);
      return `${Math.floor (vvv / 60).toString ().padStart (2, '0')}:${(vvv % 60).toString ().padStart (2, '0')}`;
   });


   public CurrentPlayingTimeStr (currTime: number): string
   {
      if (!this.inGioco())
         return "";
      const tm = this.inTime() - currTime;
      return `${Math.floor (tm / 60).toString ().padStart (2, '0')}:${(tm % 60).toString ().padStart (2, '0')}`;
   }


   // --- Punti per Quarto ---
   public CalcPtiQ1: Signal<number> = computed(() =>
      { return this.realizzazioni().filter(r => r.rQuarto === 1 && r.rPunti > 0).reduce((a, b) => a + b.rPunti, 0); });
   public CalcPtiQ2: Signal<number> = computed(() =>
      { return this.realizzazioni().filter(r => r.rQuarto === 2 && r.rPunti > 0).reduce((a, b) => a + b.rPunti, 0); });
   public CalcPtiQ3: Signal<number> = computed(() =>
      { return this.realizzazioni().filter(r => r.rQuarto === 3 && r.rPunti > 0).reduce((a, b) => a + b.rPunti, 0); });
   public CalcPtiQ4: Signal<number> = computed(() =>
      { return this.realizzazioni().filter(r => r.rQuarto === 4 && r.rPunti > 0).reduce((a, b) => a + b.rPunti, 0); });
   public CalcPtiEt: Signal<number> = computed(() =>
      { return this.realizzazioni().filter(r => r.rQuarto > 4 && r.rPunti > 0).reduce((a, b) => a + b.rPunti, 0); });

   // --- Utility Pubbliche ---
   public TotPunti: Signal<number> = computed(() =>
      { return this._simulation ? 28 : this.CalcolaPunti(); });
   public TotFalli: Signal<number> = computed(() =>
      { return this._simulation ? this._fakeFouls : this.GetFalliFatti(); });
   public GetTeamCode: Signal<string> = computed(() =>
      { return this.isMyTeam() ? "MYTEAM" : "OPPONENT"; });
   public PlayNumber2: Signal<string> = computed(() =>
      { return this.playNumber().padStart(2, ' '); });

   public ChangeFakeFouls(aNum: number) { this._fakeFouls = aNum; }
   public GeTFallo(n: number): TFallo { return this.falliFatti()[n - 1]; }

   // --- Database & Stream ---
   public async SaveToDB(): Promise<void>
   {
      console.log("TMatchPlayer.SaveToDB");
      // Logica specifica DMod qui...
   }

   public async SaveToStream(stream: any, rootNode: any): Promise<void>
   {
      // Implementazione logica XML basata sul tuo sorgente...
   }

   public async LoadFromStream(stream: any, rootNode: any): Promise<void>
   {
      // Implementazione logica XML basata sul tuo sorgente...
   }


} // class TMatchPlayer


//====================================================================================

// esempio di utilizzo:    const team = await TMatchTeam.Create(true);

export class TMatchTeam
{
   public timeout1 = signal<string>("OO");
   public timeout2 = signal<string>("OOO");
   public timeoutExtra = signal<string>("OOOO");
   public currQuarter  = signal<number>(0);
   public quarti = signal<TQuarterTeam[]>([]);
   public rimbAttacco = signal<number>(0);
   public rimbDifesa = signal<number>(0);
   public pPerse = signal<number>(0);
   public pRecuperate = signal<number>(0);
   public name = signal<string>("");
   public abbrev = signal<string>("");
   public color = signal<string>("#FFFFFF");
   public falliTeam = signal<TFallo[]>([]);

   public IsMyTeam: boolean = false;
   public TeamRecID: number = 0;
   public MatchRecID: number = 0;
   public HeadCoach: string = '';
   public Assistent1: string = '';
   public Roster: TMatchPlayer[] = []; // TObjectList
   public DeltaRes: number = 0;
   public QuintettoQuarto: boolean[] = [];


   constructor(aMyTeam: boolean)
   {
      this.IsMyTeam = aMyTeam;
      for (let iii=0;   iii<(globs.MaxRegQuarters+globs.MaxExtraQuarters);   iii++)
      {
         this.QuintettoQuarto.push(false);
      }
      this.Initialize();
   }


   private Initialize()
   {
      try
      {
         this.TeamRecID = 0;
         this.MatchRecID = 0;
         this.name.set("");
         this.abbrev.set("");
         this.HeadCoach = '';
         this.Assistent1 = '';
         this.DeltaRes = 0;
         this.Roster = [];
         this.color.set("#FFFFFF");
         this.quarti.set([]);
         this.pPerse.set(0);
         this.pRecuperate.set(0);
         this.rimbDifesa.set(0);
         this.rimbAttacco.set(0);
         this.QuintettoQuarto.fill(false);

         this.quarti.set([]);
         this.falliTeam.set([]);
         this.Roster = [];
         const totalQuarters = globs.MaxRegQuarters + globs.MaxExtraQuarters;
         for (let xxx=1;   xxx<=totalQuarters;   xxx++)
         {
            let qrt = new TQuarterTeam(xxx, globs.FalliPerBonus);
            qrt.Reset();
            this.quarti().push(qrt);
         }
      }
      catch (e)
      {
         console.error(JSON.stringify(e));
      }
   }


   public Clone(): TMatchTeam
   {
      const copia: TMatchTeam = new TMatchTeam(this.IsMyTeam);
      copia.IsMyTeam = this.IsMyTeam;
      copia.TeamRecID = this.TeamRecID;
      copia.MatchRecID = this.MatchRecID;
      copia.HeadCoach = this.HeadCoach;
      copia.Assistent1 = this.Assistent1;
      copia.DeltaRes = this.DeltaRes;
      //
      copia.timeout1.set(this.timeout1());
      copia.timeout2.set(this.timeout2());
      copia.timeoutExtra.set(this.timeoutExtra());
      copia.currQuarter.set(this.currQuarter());
      copia.rimbAttacco.set(this.rimbAttacco());
      copia.rimbDifesa.set(this.rimbDifesa());
      copia.pPerse.set(this.pPerse());
      copia.pRecuperate.set(this.pRecuperate());
      copia.name.set(this.name());
      copia.abbrev.set(this.abbrev());
      copia.color.set(this.color());
      //
      copia.QuintettoQuarto = [...this.QuintettoQuarto];
      copia.Roster = this.Roster.map(r => r.Clone());
      copia.quarti.set(this.quarti().map(q => q.Clone()));
      copia.falliTeam.set(this.falliTeam().map(f => f.Clone()));

      return copia;
   }


   public SaveToJson(): any
   {
      let result: any = {
         timeout1: this.timeout1(),
         timeout2: this.timeout2(),
         timeoutExtra: this.timeoutExtra(),
         currQuarter: this.currQuarter(),
         quarti: this.quarti().map(qqq => qqq.SaveToJson()),
         rimbAttacco: this.rimbAttacco(),
         rimbDifesa: this.rimbDifesa(),
         pPerse: this.pPerse(),
         pRecuperate: this.pRecuperate(),
         name: this.name(),
         abbrev: this.abbrev(),
         color: this.color(),
         falliTeam: this.falliTeam().map(fff => fff.SaveToJson()),
         IsMyTeam: this.IsMyTeam,
         TeamRecID: this.TeamRecID,
         MatchRecID: this.MatchRecID,
         HeadCoach: this.HeadCoach,
         Assistent1: this.Assistent1,
         Roster: this.Roster.map(rrr => rrr.SaveToJson()),
         DeltaRes: this.DeltaRes,
         QuintettoQuarto: this.QuintettoQuarto
      }
      /*
      for (let i=0;   i<this.quarti.length;   i++)
      {
         const qrt = this.quarti()[i];
         result.quarti.push(qrt.SaveToJson());
      }
      for (let i=0;   i<this.falliTeam.length;   i++)
      {
         const fff = this.falliTeam()[i];
         result.falliTeam.push(fff.SaveToJson());
      }
      */
      return result;
   }


   public FromJson (data: any)
   {
      /*
      {
        "id": "1",
        "nome": "Sarezzo",
        "abbrev": "SAR",
        "logo": "vichingo",
        "champid_link": "1"
      }
      */
      if (!data)
         return;

      this.name.set(data.nome || "");
      this.abbrev.set(data.abbrev || "");
      this.color.set(data.color || "#FFFFFF");
      this.TeamRecID = data.id || 0;
      this.HeadCoach = data.HeadCoach || '';
      this.Assistent1 = data.Assistent1 || '';

      // Se hai anche il roster nel JSON, dovrai istanziare i singoli TMatchPlayer
      if (data.Roster && Array.isArray(data.Roster))
      {
         // Esempio: this.Roster = data.Roster.map(p => new TMatchPlayer().LoadFromData(p));
      }
   }


   public GetRimbAttacco : Signal<number> = computed(() => { return this.rimbAttacco(); })
   public GetRimbDifesa : Signal<number> = computed(() => { return this.rimbDifesa(); })
   public GetPRecuperate : Signal<number> = computed(() => { return this.pRecuperate(); })
   public GetPPerse : Signal<number> = computed(() => { return this.pPerse(); })
   public GetCurrQuarter : Signal<number> = computed(() => { return this.currQuarter(); })
   public GetQuarti : Signal<TQuarterTeam[]> = computed(() => { return this.quarti(); })


   public GetQuarto(n: number): TQuarterTeam | null
   {
      if ((this.quarti.length > 0) && (n >= 0) && (n < this.quarti.length))
      {
         return this.quarti()[n];
      }
      return null;
   }


   public GetTimeout1(n: number): boolean
   {
      if (n > 0 && n < 3)
      {
         const tmp: string = this.timeout1();
         return (tmp[n-1] == 'X');
      }
      return false;
   }

   public GetTimeout2(n: number): boolean
   {
      if (n > 0 && n < 4)
      {
         const tmp: string = this.timeout2();
         return (tmp[n-1] == 'X');
      }
      return false;
   }

   public GetTimeoutExtra(n: number): boolean
   {
      if (n > 0 && n < 5)
      {
         const tmp: string = this.timeoutExtra();
         return (tmp[n-1] == 'X');
      }
      return false;
   }


   public SetTimeout1(n: number,
                      value: boolean)
   {
      if (n > 0 && n < 3)
      {
         n--;
         let sss: string = this.timeout1();
         if (value)
            sss = sss.slice(0, n) + 'X' + sss.slice(n + 1);
         else
            sss = sss.slice(0, n) + 'X' + sss.slice(n + 1);
         this.timeout1.set(sss);
      }
   }

   public SetTimeout2(n: number,
                      value: boolean)
   {
      if (n > 0 && n < 4)
      {
         n--;
         let sss: string = this.timeout2();
         if (value)
            sss = sss.slice(0, n) + 'X' + sss.slice(n + 1);
         else
            sss = sss.slice(0, n) + 'X' + sss.slice(n + 1);
         this.timeout1.set(sss);
      }
   }

   public SetTimeoutExtra(n: number,
                          value: boolean)
   {
      if (n > 0 && n < 5)
      {
         n--;
         let sss: string = this.timeoutExtra();
         if (value)
            sss = sss.slice(0, n) + 'X' + sss.slice(n + 1);
         else
            sss = sss.slice(0, n) + 'X' + sss.slice(n + 1);
         this.timeout1.set(sss);
      }
   }


   public GetTotTempoGioco: Signal<number> = computed(() =>
   {
      let result = 0;
      for (let xxx = 0; xxx < this.Roster.length; xxx++)
      {
         const pl: TMatchPlayer | null = this.PlayerByIdx(xxx);
         if (pl != null)
            result += pl.TempoGiocoTot(false);
      }
      return result;
   })


   public GetTotTempoGiocoStr: Signal<string> = computed(() =>
   {
      const vvv = this.GetTotTempoGioco();
      const nn = Math.floor(vvv / 60);
      const ss = vvv % 60;
      return `${nn.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
   })


   public PlayerByNumber(aNumb: string): TMatchPlayer | null
   {
      for (let xxx = 0; xxx < this.Roster.length; xxx++)
      {
         const plr: TMatchPlayer | null = this.PlayerByIdx(xxx);
         if (plr != null)
            if (plr.playNumber().trim() === aNumb.trim())
            {
               return plr;
            }
      }
      return null;
   }


   public PlayerByID(aID: number): TMatchPlayer | null
   {
      for (let xxx = 0; xxx < this.Roster.length; xxx++)
      {
         const plr: TMatchPlayer | null = this.PlayerByIdx(xxx);
         if (plr != null)
            if (plr.playerRecID === aID)
            {
               return plr;
            }
      }
      return null;
   }


   public PlayerByIdx(aIdx: number): TMatchPlayer | null
   {
      if ((this.Roster.length > 0) && (aIdx >= 0) && (aIdx < this.Roster.length))
      {
         return this.Roster[aIdx];
      }
      return null;
   }

   public async ReadFromDB(aTeamID?: number, aMatchID?: number): Promise<void>
   {
      /*
      const targetTeamID = aTeamID ?? this.TeamRecID;
      const targetMatchID = aMatchID ?? this.MatchRecID;

      (globalThis as any).LogSendWriteFmt(0, 0, 'TMatchTeam.ReadFromDB (%d, %d)', [targetTeamID, targetMatchID]);

      try {
         const dMod = (globalThis as any).DMod;
         if (!(await dMod.TblTeam.Locate('ID', targetTeamID))) return;

         this.TeamRecID = targetTeamID;
         this.Name = dMod.TblTeamDispName.AsString;
         this.Abbrev = dMod.TblTeamAbbrev.AsString;

         const ms = new (globalThis as any).TMemoryStream();
         try {
            await dMod.TblTeamLogo.SaveToStream(ms);
            ms.Position = 0;
            await this.Logo.LoadFromStream(ms);
         } finally {
            ms.Free();
         }

         this.Roster = [];
         dMod.TblMatchRoster.Filtered = false;
         dMod.TblMatchRoster.Filter = `(LinkMatchHeader = ${targetMatchID}) AND (IsMyTeam = ${this.IsMyTeam.toString()})`;
         dMod.TblMatchRoster.Filtered = true;

         // Simulazione loop dataset
         dMod.TblMatchRoster.First();
         while (!dMod.TblMatchRoster.Eof) {
            let plr = new (globalThis as any).TMatchPlayer();
            plr.RosterRecID = dMod.TblMatchRosterID.AsInteger;
            plr.PlayerRecID = dMod.TblMatchRosterLinkPlayer.AsInteger;
            plr.PlayNumber = dMod.TblMatchRosterPlayNumber.AsString;
            plr.Name = dMod.TblMatchRosterDbgPlayer.AsString;
            plr.Captain = dMod.TblMatchRosterCaptain.AsBoolean;
            plr.InQuintetto = dMod.TblMatchRosterQuintetto.AsBoolean;
            plr.IsMyTeam = dMod.TblMatchRosterIsMyTeam.AsBoolean;
            this.Roster.push(plr);
            dMod.TblMatchRoster.Next();
         }

         for (let xxx = 0; xxx <= 7; xxx++) {
            const qrt = await this.GetQuarto(xxx);
            if (qrt) await qrt.LoadFromDB(targetMatchID, xxx + 1, this.IsMyTeam);
         }

      } catch (e: any) {
         (globalThis as any).UpdateExceptionCounter();
         (globalThis as any).LogSendWriteFmt(0, 0, '[TMatchTeam.ReadFromDB] Exception "%s"', [e.message]);
      }
      */
   }


   public ResetAll()
   {
      try
      {
         this.IsMyTeam = false;
         this.TeamRecID = 0;
         this.MatchRecID = 0;
         this.name.set('');
         this.abbrev.set("");
         this.HeadCoach = '';
         this.Assistent1 = '';
         this.DeltaRes = 0;
         this.Roster = [];
         this.color.set("#FFFFFF");
         this.pPerse.set(0);
         this.pRecuperate.set(0);
         this.rimbDifesa.set(0);
         this.rimbAttacco.set(0);
         this.quarti.set([]);
         this.ResetQuarti();
      }
      catch (e: any)
      {

      }
   }

   public ResetMatchData()
   {
      this.HeadCoach = '';
      this.Assistent1 = '';
      this.DeltaRes = 0;
      this.Roster = [];
      this.color.set("#FFFFFF");
      this.pPerse.set(0);
      this.pRecuperate.set(0);
      this.rimbDifesa.set(0);
      this.rimbAttacco.set(0);
      this.ResetQuarti();
      this.ResetPlayersTime();
      this.ResetPlayersData();
   }


   public ResetPlayersData()
   {
      for (let xxx =0;   xxx<this.Roster.length;   xxx++)
      {
         let plr = this.Roster[xxx];
         plr.tempoGioco.set(0);
         // Gestione array falli
         if (plr.falliFatti)
         {
            for (let yyy=0;   yyy<plr.falliFatti.length;   yyy++)
            {
               plr.falliFatti()[yyy].Reset();
            }
         }
         plr.falliSubiti.set (0);
         plr.rimbAttacco.set (0);
         plr.rimbDifesa.set (0);
         plr.pRecuperate.set (0);
         plr.pPerse.set (0);
         plr.assist.set (0);
         plr.stoppFatte.set (0);
         plr.stoppSubite.set (0);
         plr.realizzazioni.set ([]);
         plr.inTime.set (600);
         plr.outTime.set (600);
         plr.inGioco.set (false);
         //plr.qui (false);
         //plr.fa_FakeFouls = 0;
      }
   }

   public ResetPlayersTime()
   {
      for (let xxx=0;   xxx<this.Roster.length;   xxx++)
      {
         let plr = this.Roster[xxx];
         plr.tempoGioco.set (0);
         plr.inTime.set (600);
         plr.outTime.set (600);
         //plr.InGioco = false;
         //plr.InQuintetto = false;
      }
   }

   public ResetQuarti()
   {
      for (let xxx = 0; xxx < this.quarti.length; xxx++)
      {
         this.quarti()[xxx].Reset();
      }
   }

   public async SaveToDB(): Promise<void>
   {
      /*
      const dMod = (globalThis as any).DMod;
      dMod.TblMatchRoster.Filtered = false;
      dMod.TblMatchRoster.Filter = `(LinkMatchHeader = ${this.MatchRecID}) AND (IsMyTeam = ${this.IsMyTeam.toString()})`;
      dMod.TblMatchRoster.Filtered = true;

      for (let xxx = 0; xxx < this.Roster.length; xxx++) {
         let plr = this.Roster[xxx];
         if (await dMod.TblMatchRoster.Locate('ID', plr.RosterRecID)) {
            await dMod.TblMatchRoster.Edit();
            dMod.TblMatchRosterQuintetto.AsBoolean = plr.InQuintetto;
            await dMod.TblMatchRoster.Post();
         }
      }
      dMod.TblMatchRoster.Filtered = false;
      */
   }


   public CalcPunti: Signal<number> = computed(() =>
   {
      let result = 0;
      for (let xxx = 0; xxx < this.Roster.length; xxx++)
      {
         const pl: TMatchPlayer | null = this.PlayerByIdx(xxx);
         if (pl != null)
            result += pl.CalcolaPunti();
      }
      return result + this.DeltaRes;
   })


   public CalcTLPerc: Signal<string> = computed(() =>
   {
      let result = "0%";

      try
      {
         const tentati = this.CalcTLTentati();
         if (tentati > 0)
         {
            const perc = ((this.CalcTLRealizz()) * 100.0) / tentati;
            result = `${Math.trunc(Math.round(perc))}%`;
         }
      }
      catch (e)
      {
         result = "0%";
      }
      return result;
   })


   public CalcTLRealizz: Signal<number> = computed(() =>
   {
      let result = 0;
      try
      {
         for (let xxx = 0; xxx < this.Roster.length; xxx++)
         {
            const pl: TMatchPlayer | null = this.PlayerByIdx(xxx);
            if (pl != null)
               result += pl.CalcTLRealizz();
         }
      }
      catch (e)
      {
         result = 0;
      }
      return result;
   })


   public CalcTLTentati: Signal<number> = computed(() =>
   {
      let result = 0;
      try
      {
         for (let xxx=0;   xxx<this.Roster.length;  xxx++)
         {
            const pl: TMatchPlayer | null = this.PlayerByIdx(xxx);
            if (pl != null)
               result += pl.CalcTLTentati();
         }
      }
      catch (e)
      {
         result = 0;
      }
      return result;
   })


   public CalcRimbalzi: Signal<number> = computed(() =>
   {
      let result = (this.rimbAttacco()) + (this.rimbDifesa());
      for (let xxx=0;   xxx<this.Roster.length;   xxx++)
      {
         const pl: TMatchPlayer | null = this.PlayerByIdx(xxx);
         if (pl != null)
            result += (pl.rimbAttacco() + pl.rimbDifesa());
      }
      return result;
   })


   public CalcPIR: Signal<number> = computed(() =>
   {
      let result = 0;
      for (let xxx=0;   xxx<this.Roster.length;   xxx++)
      {
         const pl: TMatchPlayer | null = this.PlayerByIdx(xxx);
         if (pl != null)
            result += pl.CalcPIR();
      }
      return result;
   })


   public CalcAssist: Signal<number> = computed(() =>
   {
      let result = 0;
      for (let xxx=0;   xxx<this.Roster.length;   xxx++)
      {
         const pl: TMatchPlayer | null = this.PlayerByIdx(xxx);
         if (pl != null)
            result += pl.assist();
      }
      return result;
   })


} // class TMatchTeam

//====================================================================================




/*
export class TMatchPlayer
{
   private _FakeFouls      :number;
   private fTempoGioco     :number;   // secondi del tempo di gioco
   private fFalliSubiti    :number;
   private fRealizzazioni  :Array<TRealizzazione>;
   private fRimbAttacco    :number;
   private fRimbDifesa     :number;
   private fPRecuperate    :number;
   private fPPerse         :number;
   private fStoppSubite    :number;
   private fStoppFatte     :number;
   private fAssist         :number;
   private fInTime         :number;
   private fOutTime        :number;
   private fIsMyTeam       :boolean;
   private fInGioco        :boolean;
   private fPlusMinus      :number;
   private fInQuintetto    :boolean;

   public PlayerRecID    :number;
   public RosterRecID    :number;
   public Name           :string;
   public PlayNumber     :string;
   public Captain        :boolean;
   public _Simulation    :boolean;
   public fPMIn          :number;
   public CurrCronotime  :number;
   public fFalliFatti    :Array<TFallo>;
   public InternalSort   :number;


   constructor ()
   {
      this._FakeFouls      = 0;
      this._Simulation     = false;
      this.fTempoGioco     = 0;
      this.fFalliSubiti    = 0;
      this.fRealizzazioni  = [];
      this.fRimbAttacco    = 0;
      this.fRimbDifesa     = 0;
      this.fPRecuperate    = 0;
      this.fPPerse         = 0;
      this.fStoppSubite    = 0;
      this.fStoppFatte     = 0;
      this.fAssist         = 0;
      this.fInTime         = 0;
      this.fOutTime        = 0;
      this.fIsMyTeam       = true;
      this.fInGioco        = false;
      this.fPlusMinus      = 0;
      this.fInQuintetto    = false;
      this. PlayerRecID    = 0;
      this. RosterRecID    = 0;
      this. Name           = "";
      this. PlayNumber     = "";
      this. Captain        = false;
      this. fPMIn          = 0;
      this. CurrCronotime  = 0;
      this. fFalliFatti    = [];
      this. InternalSort   = 0;
   }


   //-------------------- PRIVATE ---------------------------------
   private async CalcOER(): Promise<number>
   {
      let result: number = 0;
      let Denom: number = (await this.GetTdcTentati() + (await this.GetTLTentati()/2.0) + await this.GetPPerse());
      if (Math.abs(Denom) > 0.0001)
         result = await this.GetPunti()/Denom;
      return result;
   }


   private async CalcOERMin(): Promise<number>
   {
      let result: number = 0;
      let Tg: number;
      let Tot: number;
      let Ss: number;
      let quartiGiocati: number;
      let tem: number = await this.GetTempoGiocoTot();

      if (tem > 0)
      {
         // calcolo il tempo totale della partita
         quartiGiocati = utils.GetQuarterPlayed();
         if (quartiGiocati <= 4)
            Tot = quartiGiocati*10;
         else
            Tot = 40 + ((quartiGiocati-4)*5);
         Tot = ((Tot*100.00)/60.00)/100.00;
         // calcolo il tempo giocato effettivo del giocatore
         Tg = Math.trunc(tem / 60);
         Ss = tem % 60;
         Tg = Tg + (((Ss*100.00)/60.0)/100.00);
         result = ((await this.GetOER())*Tot)/Tg;
      }
      return result;
   }


   private async CalcolaPunti(): Promise<number>
   {

   }


   private async CalcolaTempoGiocoStr(): Promise<string>
   {
      let result: string = "";
      let Vvv: number = await this.GetTempoGiocoTot();
      if (this.fInGioco)
         Vvv = Vvv+(this.fInTime-this.CurrCronotime);
      const Nn: number = Math.trunc(Vvv / 60);
      const Ss: number = Vvv % 60;
      result = `${Nn.toString().padStart(2, '0')}:${Ss.toString().padStart(2, '0')}`;

      return result;
   }





   //-------------------- PUBLIC ---------------------------------

   public async GetTempoGioco(): Promise<number>
   {
      if (this.fTempoGioco < 0)
         return 0;
      else
         return this.fTempoGioco;
   }

   public async SetTempoGioco(value: number)
   {
      if (value < 0)
         this.fTempoGioco = 0;
      else
         this.fTempoGioco = value;
   }

   public async GetTempoGiocoStr(): Promise<string>
   {
      return this.CalcolaTempoGiocoStr();
   }

   public async GetTempoGiocoTot(): Promise<number>
   {
      return await this.GetTempoGioco();
   }

   async CurrentPlayingTimeStr (currTime: number): Promise<string>
   {
      let result:string = "";

      if (this.fInGioco)
      {
         const tm = this.fInTime
      }
      return result;
   }


   public async GetOER(): Promise<number>
   {
      return await this.CalcOER();
   }


   public async GetFalliFatti(): Promise<number>
   {
      let result: number = 0;

      for (let iii=0;   iii<globs.maxPlayerFouls;   iii++)
      {
         if (this.fFalliFatti[iii].fCommesso)
            result++;
      }
      return result;
   }


   public async GetFalliSubiti(): Promise<number>
   {
      return this.fFalliSubiti;
   }

   public async SetFalliSubiti(value: number)
   {
      if (value >= 0)
         this.fFalliSubiti = value;
      else
         this.fFalliSubiti = 0;
   }


   public async G
}
*/



export namespace TipoEvento
{
   export const EventoVuoto: number = 0;
   export const EventoNormale: number = 1;
   export const EventoMaster: number = 2;
   export const EventoPeriodico: number = 3;
}


export interface EventoDbElement
{
   id: number;
   data: string;
   orainizio: string;
   orafine: string;
   risorsa_id: number;
   gruppo_id: number;
   casa: string;
   ospite: string;
   luogo: string;
   commento: string;
   arbitraggio: number;
   tipoevento: number;
   season_id: number;
   season: string;
   risorsa: string;
   risorsatxt: string;
   risorsabck: string;
   gruppo: string;
   gruppotxt: string
   gruppobck: string;
   master_id: number;
}


export interface EventoDb
{
   ok: boolean;
   message: string;
   elements: EventoDbElement[];
}


export interface EventoElement
{
   id: number;
   data: Date;
   orainizio: Date;
   orafine: Date;
   risorsa_id: number;
   gruppo_id: number;
   casa: string;
   ospite: string;
   luogo: string;
   commento: string;
   arbitraggio: boolean;
   tipoevento: number;
   risorsa: string;
   risorsatxt: string;
   risorsabck: string;
   gruppo: string;
   gruppotxt: string
   gruppobck: string;
   season_id: number;
   season: string;
   master_id: number;
}


export interface LogMessage
{
   id: number;
   datetime: string;
   user_id: number;
   user: string
   description: string;
}






// src/app/models/mess-dlg-data.model.ts
export interface MessDlgData {
   title: string;
   subtitle?: string;
   message: string;
   btncaption?: string; // Caption for the primary (OK/Yes) button
   messtype?: 'info' | 'warning' | 'error';
   showCancelButton?: boolean; // New: true to show a second button (e.g., No/Cancel)
   cancelButtonCaption?: string; // New: Caption for the second button
}

// Aggiungiamo un tipo per il risultato del dialogo per maggiore chiarezza
export type MessDialogResult = boolean | 'primary' | 'secondary' | undefined;
// 'confirm' o true per il bottone principale (OK/Sì)
// 'cancel' o false per il secondo bottone (Annulla/No)
// undefined se chiuso dalla 'X' o ESC






