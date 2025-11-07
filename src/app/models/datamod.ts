


export interface User
{
   id: number;
   nome: string;
   password: string;
   ruolo: string;
   ruolo_id: number;
   attributo: number
}


export interface Societa
{
   id: number;
   nome: string;
}


export interface Season
{
   id: number;
   nome: string;
   abbrev: string;
   tenantid_link: number;
}


export interface Champ
{
   id: number;
   nome: string;
   abbrev: string;
   seasonid_link: number;
}


export interface Phase
{
   id: number;
   nome: string;
   abbrev: string;
   champid_link: number;
   exportfolder: string;
}


export interface Team
{
   id: number;
   nome: string;
   abbrev: string;
   champid_link: number;
   logo: string;
}


export interface IPlayer
{
   id: number;
   nomedisp: string;
   anno: number;
   ruolo: string;
   numero: string;
   altezza: number;
   teamid_link: number;
}


export interface MatchHeadersData {
   ok: boolean;
   message: string;
   elements: Array<MatchHeaderDb>;
}

export interface MatchHeaderDb
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

export interface MatchHeader
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
   myCoach1Iid_link : number;
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


export function CreateEmptyMatchHeader(): MatchHeader
{
   return {
      id: 0,
      giornata: "",
      location: "",
      matchStatus: "",
      matchDateStr: "",
      arbitro1: "",
      arbitro2: "",
      atHome: true,
      champId_lk: 0,
      champNome_lk: "",
      exportedFile: "",
      matchDataFile: "",
      matchDate: new Date(),
      matchEventsFile: "",
      matchNumber: 0,
      myCoach1Iid_link: 0,
      myCoach2Id_link: 0,
      myTeamAbbrev_lk: "",
      myTeamColor: "",
      myTeamDelta: 0,
      myTeamId_link: 0,
      myTeamInCampo: "",
      myTeamNome_lk: "",
      myTeamPoints: 0,
      myTeamTimeout: "",
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


export interface MatchRoster
{
   /*
    ID              INTEGER,
    LinkMatchHeader INTEGER,
    LinkPlayer      INTEGER,
    PlayNumber      VARCHAR(255),
    Captain         BOOLEAN default 0,
    IsMyTeam        BOOLEAN default 0,
    Quintetto       BOOLEAN default 0,
    DbgMatch        VARCHAR(50),
    DbgPlayer       VARCHAR(50)
   */
   /*
      TblMatchRosterID: TFDAutoIncField;
      TblMatchRosterCaptain: TBooleanField;
      TblMatchRosterDbgMatch: TWideStringField;
      TblMatchRosterDbgPlayer: TWideStringField;
      TblMatchRosterIsMyTeam: TBooleanField;
      TblMatchRosterLinkMatchHeader: TIntegerField;
      TblMatchRosterLinkPlayer: TIntegerField;
      TblMatchRosterPlayerNameLook: TStringField;
      TblMatchRosterPlayNumber: TWideStringField;
      TblMatchRosterQuintetto: TBooleanField;
      TblMatchRosterRosterIndexCalc: TStringField;
   */
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


export interface Quarter
{
   /*
    ID                INTEGER,
    LinkMatchHeader   INTEGER,
    Num               INTEGER,
    IsRegular         BOOLEAN default 0,
    Status            INTEGER,
    MyTeamStartPoint  INTEGER,
    OppTeamStartPoint INTEGER,
    MyTeamCurrPoint   INTEGER,
    OppTeamCurrPoint  INTEGER,
    MyTeamFouls       INTEGER,
    OppTeamFouls      INTEGER,
    MyTeamBonus       BOOLEAN default 0,
    OppTeamBonus      BOOLEAN default 0
   */
   /*
      TblQuarterID: TFDAutoIncField;
      TblQuarterIsRegular: TBooleanField;
      TblQuarterLinkMatchHeader: TIntegerField;
      TblQuarterMyTeamBonus: TBooleanField;
      TblQuarterMyTeamCurrPoint: TIntegerField;
      TblQuarterMyTeamFouls: TIntegerField;
      TblQuarterMyTeamStartPoint: TIntegerField;
      TblQuarterNum: TIntegerField;
      TblQuarterOppTeamBonus: TBooleanField;
      TblQuarterOppTeamCurrPoint: TIntegerField;
      TblQuarterOppTeamFouls: TIntegerField;
      TblQuarterOppTeamStartPoint: TIntegerField;
      TblQuarterStatus: TIntegerField;
   */
}


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
