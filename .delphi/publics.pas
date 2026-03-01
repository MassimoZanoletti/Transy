unit BSDEvo.Unt.Publics;

interface

uses
   EBase,
   System.Classes,
   System.Contnrs,
   System.Generics.Collections,
   System.Variants,
   System.Types,
   Winapi.Windows,
   Vcl.Graphics,
   (*
   uLkJSON,
   *)
   DaletGlobalsUnit,
   FoldersUnit,
   BSDEvo.Unt.OldFormat,
   NativeXML,
   TntXmlUnit,
   TntUtils_Dlg,
   TntUtils_Sys;


resourcestring
   Str_NoDataToDisplay        = '<Nessun dato>';
   Str_MatchSyatus_NotPlayed  = 'Non giocato';
   Str_MatchSyatus_Playing    = 'In gioco';
   Str_MatchSyatus_Terminated = 'Terminato';
   Str_MatchSyatus_Finalized  = 'Finalizzato';
   Str_OpponentTeam_s         = '\n\n\nOpponent team\n%s\n\n\n';





const
   Op_TLYes          = 'TL OK';
   Op_TLNo           = 'TL No';
   Op_T2Yes          = 'T2 OK';
   Op_T2No           = 'T2 No';
   Op_T3Yes          = 'T3 OK';
   Op_T3No           = 'T3 No';
   Op_FalloF         = 'FaFat';
   Op_FalloS         = 'FaSub';
   Op_RimbD          = 'RiDif';
   Op_RimbA          = 'RiAtt';
   Op_PPersa         = 'PPers';
   Op_PRecup         = 'PRecu';
   Op_StopSubita     = 'StSub';
   Op_StopFatta      = 'StFat';
   Op_Assist         = 'Assis';
   Op_Sostit         = 'Sosti';
   Op_Timeout        = 'TOut ';
   Op_Quintetto      = 'Quint';
   Op_Time           = 'Time ';
   Op_CheckPoint     = '-----';


const
   MyTeamCode        = 'MyTm';
   OpponentTeamCode  = 'Oppo';
   TimeQuarterStart  = 'QSta';
   TimeQuarterStop   = 'QStp';
   TimeTimeStart     = 'Star';
   TimeTimeStop      = 'Stop';


const
   MaxFieldPlayers   = 5;
   MaxRosterPlayers  = 18;
   MaxQuarters       = 8;
   MaxRegQuarters    = 4;
   MaxExtraQuarters  = 4;
   MaxFouls          = 5;

const
   PercTiroFormat = '%1.0f';

const
   OperIntStatus_None   = 0;
   OperIntStatus_Ignore = 1;
   OperIntStatus_Done   = 2;

type
   TSoundEvent = (
                  tseSelection,
                  tseTimeStart,
                  tseTimeStop,
                  tseQuarterEnd,
                  tseFalloFatto,
                  tseFalloSubito,
                  tseCanestroFatto,
                  tseCanestroSbagliato,
                  tseRimbalzoDifesa,
                  tseRimbalzoAttacco,
                  tsePallaPersa,
                  tsePallaRecuperata,
                  tseStoppataSubita,
                  tseStoppataFatta,
                  tseAssist,
                  tseSostituzione
                 );
   TSoundEventHelper = record helper for TSoundEvent
      public
         class function ToString (Value :TSoundEvent) :String; overload; inline; static;
         class function ToInt (Value :TSoundEvent) :Longint; overload; inline; static;
         function  ToString :String; overload; inline;
         function  ToInt :Longint; overload; inline;
         procedure SetFrom (aStr :String); overload; inline;
         procedure SetFrom (aInt :Longint); overload; inline;
         function  LowInt :Longint; inline;
         function  HighInt :Longint; inline;
   end;

   TUpdateSelectionFn = procedure (Sender :TObject) of object;
   TOperationUpdateFn = procedure of object;


   TTipoRealizzazione   = (
                           trUndefined,
                           trLibero,
                           trT2,
                           trT3
                          );
   TTipoRealizzazioneHelper = record helper for TTipoRealizzazione
      public
         class function ToString (Value :TTipoRealizzazione) :String; overload; inline; static;
         class function ToInt (Value :TTipoRealizzazione) :Longint; overload; inline; static;
         function  ToString :String; overload; inline;
         function  ToInt :Longint; overload; inline;
         procedure SetFrom (aStr :String); overload; inline;
         procedure SetFrom (aInt :Longint); overload; inline;
         function  LowInt :Longint; inline;
         function  HighInt :Longint; inline;
   end;


   TQuarterStatus = (
                     qsNotPlayed,
                     qsPlaying,
                     qsPlayed
                    );
   TQuarterStatusHelper = record helper for TQuarterStatus
      public
         class function ToString (Value :TQuarterStatus) :String; overload; inline; static;
         class function ToInt (Value :TQuarterStatus) :Longint; overload; inline; static;
         function  ToString :String; overload; inline;
         function  ToInt :Longint; overload; inline;
         procedure SetFrom (aStr :String); overload; inline;
         procedure SetFrom (aInt :Longint); overload; inline;
         function  LowInt :Longint; inline;
         function  HighInt :Longint; inline;
   end;


   TMatchStatus   = (
                     msNotPlayed,
                     msPlaying,
                     msTerminated,
                     msFinalized
                    );
   TMatchStatusHelper = record helper for TMatchStatus
      public
         class function ToString (Value :TMatchStatus) :String; overload; inline; static;
         class function ToInt (Value :TMatchStatus) :Longint; overload; inline; static;
         class function ToDesc (Value :TMatchStatus) :String; overload; inline; static;
         class function ToDesc (IntValue :Longint) :String; overload; inline; static;
         function  ToString :String; overload; inline;
         function  ToInt :Longint; overload; inline;
         procedure SetFrom (aStr :String); overload; inline;
         procedure SetFrom (aInt :Longint); overload; inline;
         function  LowInt :Longint; inline;
         function  HighInt :Longint; inline;
         function  ToDesc :string; overload; inline;
   end;


   TDataKind   = (
                  fdkUndefined,
                  fdkTLiberi,
                  fdkT2,
                  fdkT3,
                  fdkFalli,
                  fdkRimbalzi,
                  fdkStoppate,
                  fdkPalle,
                  fdkAssist
                 );
   TDataKindHelper = record helper for TDataKind
      public
         class function ToString (Value :TDataKind) :String; overload; inline; static;
         class function ToInt (Value :TDataKind) :Longint; overload; inline; static;
         function  ToString :String; overload; inline;
         function  ToInt :Longint; overload; inline;
         procedure SetFrom (aStr :String); overload; inline;
         procedure SetFrom (aInt :Longint); overload; inline;
         function  LowInt :Longint; inline;
         function  HighInt :Longint; inline;
   end;




type
   TMatchPlayer = class;
   TConfigClass = class;


   TPlayerFrameColors   = class
      public
         BackgroundUnselected :TColor;
         BackgroundSelected   :TColor;
         BackgroundInGioco    :TColor;
         TextUnselected       :TColor;
         TextSelected         :TColor;
         FoulBack             :array[0..MaxFouls] of TColor;
         FoulText             :array[0..MaxFouls] of TColor;
         NameSelected         :TColor;
         NameUnselected       :TColor;
         NumberSelected       :TColor;
         NumberUnselected     :TColor;
         PointsSelected       :TColor;
         PointsUnselected     :TColor;
         QuintettoSelected    :TColor;
         QuintettoUnselected  :TColor;
         constructor Create;
         destructor  Destroy; override;
         procedure Init; overload;
         procedure Init (aCfg :TConfigClass); overload;
   end;

   TTeamFrameColors  = class
      public
         BackgroundUnselected :TColor;
         BackgroundSelected   :TColor;
         TextUnselected       :TColor;
         TextSelected         :TColor;
         TeamSelected         :TColor;
         TeamUnselected       :TColor;
         TeamBackSelected     :TColor;
         TeamBackUnselected   :TColor;
         PointsSelected       :TColor;
         PointsUnselected     :TColor;
         PuntiQrtSelected     :TColor;
         PuntiQrtUnselected   :TColor;
         FalliSelected        :TColor;
         FalliUnselected      :TColor;
         constructor Create;
         destructor  Destroy; override;
         procedure Init; overload;
         procedure Init (aCfg :TConfigClass); overload;
         procedure Assign (aSrc :TTeamFrameColors);
   end;

   TConfigClass   = class
      private
         fXMLFile :string;
         fXMLDoc  :TNativeXml;
      public
         CurrentSeason                    :TXMLNode;
         DurationRegulTime                :TXMLNode;
         DurationExtraTime                :TXMLNode;
         ShowFieldMyShoot                 :TXMLNode;
         ShowFieldOppoShoot               :TXMLNode;
         FieldPlayersSorting              :TXMLNode;
         SaveAtTimeStop                   :TXMLNode;
         SaveInCloudAtExit                :TXmlNode;
         CloudFolder                      :TXmlNode;
         PlayerColorBackgroundUnselected  :TXMLNode;
         PlayerColorBackgroundSelected    :TXMLNode;
         PlayerColorBackgroundInGioco     :TXMLNode;
         PlayerColorTextUnselected        :TXMLNode;
         PlayerColorTextSelected          :TXMLNode;
         PlayerColorNameSelected          :TXMLNode;
         PlayerColorNameUnselected        :TXMLNode;
         PlayerColorNumberSelected        :TXMLNode;
         PlayerColorNumberUnselected      :TXMLNode;
         PlayerColorPointsSelected        :TXMLNode;
         PlayerColorPointsUnselected      :TXMLNode;
         PlayerColorQuintettoSelected     :TXMLNode;
         PlayerColorQuintettoUnselected   :TXMLNode;
         PlayerColorFoulBack0             :TXMLNode;
         PlayerColorFoulBack1             :TXMLNode;
         PlayerColorFoulBack2             :TXMLNode;
         PlayerColorFoulBack3             :TXMLNode;
         PlayerColorFoulBack4             :TXMLNode;
         PlayerColorFoulBack5             :TXMLNode;
         PlayerColorFoulText0             :TXMLNode;
         PlayerColorFoulText1             :TXMLNode;
         PlayerColorFoulText2             :TXMLNode;
         PlayerColorFoulText3             :TXMLNode;
         PlayerColorFoulText4             :TXMLNode;
         PlayerColorFoulText5             :TXMLNode;
         TeamColorBackgroundUnselected    :TXMLNode;
         TeamColorBackgroundSelected      :TXMLNode;
         TeamColorTextUnselected          :TXMLNode;
         TeamColorTextSelected            :TXMLNode;
         TeamColorNameTextSelected        :TXMLNode;
         TeamColorNameTextUnselected      :TXMLNode;
         TeamColorNameBackSelected        :TXMLNode;
         TeamColorNameBackUnselected      :TXMLNode;
         TeamColorPointsSelected          :TXMLNode;
         TeamColorPointsUnselected        :TXMLNode;
         TeamColorPointQrtSelected        :TXMLNode;
         TeamColorPointQrtUnselected      :TXMLNode;
         TeamColorFoulSelected            :TXMLNode;
         TeamColorFoulUnselected          :TXMLNode;
         TimerFrameActiveColor1           :TXMLNode;
         TimerFrameActiveColor2           :TXMLNode;
         UseOpenGL                        :TXmlNode;
         ShootColorQrt1Yes                :TXmlNode;
         ShootColorQrt1No                 :TXmlNode;
         ShootColorQrt2Yes                :TXmlNode;
         ShootColorQrt2No                 :TXmlNode;
         ShootColorQrt3Yes                :TXmlNode;
         ShootColorQrt3No                 :TXmlNode;
         ShootColorQrt4Yes                :TXmlNode;
         ShootColorQrt4No                 :TXmlNode;
         ShootColorQrtExtraYes            :TXmlNode;
         ShootColorQrtExtraNo             :TXmlNode;
         Excel_PIR                        :TXmlNode;
         Excel_OER                        :TXmlNode;
         Excel_VIR                        :TXmlNode;
         Excel_PlusMinus                  :TXmlNode;
         Excel_Bck3Rows                   :TXmlNode;
         Excel_DrawLines                  :TXmlNode;
         Excel_NomeAvversari              :TXmlNode;
         Excel_ScriviDescCoach            :TXmlNode;
         Excel_MappaTiroRow               :TXmlNode;
         Excel_MappaTiroInfo              :TXmlNode;
         Excel_MappaTiroOffsetX           :TXmlNode;
         Excel_MappaTiroOffsetY           :TXmlNode;
         Excel_ExportFolder               :TXmlNode;
         ExcelColor_Title                 :TXmlNode;
         ExcelColor_Champ                 :TXmlNode;
         ExcelColor_Parziali              :TXmlNode;
         ExcelColor_BckCols               :TXmlNode;
         ExcelColor_TxtCols               :TXmlNode;
         ExcelColor_BckTots               :TXmlNode;
         ExcelColor_TxtTots               :TXmlNode;
         ExcelColor_BckRow1               :TXmlNode;
         ExcelColor_BckRow2               :TXmlNode;
         ExcelColor_BckRow3               :TXmlNode;
         ExcelColor_Border                :TXmlNode;
         RosterHorizontalDir              :TXmlNode;
         ShowOpponentFive                 :TXmlNode;
         FrameFlashDuration               :TXmlNode;
         CurrSeasonName                   :String;
         DefaultTextColor                 :TColor;
         DefaultBackColor                 :TColor;
      public
         constructor Create;
         destructor  Destroy; override;
         procedure Read; overload;
         procedure Read (aFn :String); overload;
         procedure Save; overload;
         procedure Save (aFn :String); overload;
         procedure ColorsFromPlayer (Cols :TPlayerFrameColors);
         procedure ColorsFromTeam (Cols :TTeamFrameColors);
      public
         property XMLFile  :String read fXMLFile write fXMLFile;
         property XMLDoc   :TNativeXML read fXMLDoc write fXMLDoc;
   end;


   TFalloFatto = record
      public
         Commesso       :Boolean;
         NumLiberi      :LongInt;
         Tecnico        :Boolean;
         Intenzionale   :Boolean;
         Antisportivo   :Boolean;
         Espulsione     :Boolean;
         Quarto         :LongInt;
         Tempo          :Longint;   // Tempo di gioco relativo al quarto
      public
         procedure Reset;
   end;


   TRealizzazione = class
      private
         fRecID   :Longint;
         fTempo   :LongInt;
         fTipo    :TTipoRealizzazione;
         fPunti   :LongInt;
         fPosX    :Longint;
         fPosY    :LongInt;
         fQuarto  :LongInt;
         fPlr     :TMatchPlayer;
      public
         constructor Create;
         destructor  Destroy;
         procedure Assign (aSrc :TRealizzazione);
         procedure TL (aTempo :LongInt;
                       aQrt   :Longint;
                       aFatto :Boolean;
                       aX     :LongInt;
                       aY     :LongInt);
         procedure T2 (aTempo :LongInt;
                       aQrt   :Longint;
                       aFatto :Boolean;
                       aX     :LongInt;
                       aY     :LongInt);
         procedure T3 (aTempo :LongInt;
                       aQrt   :Longint;
                       aFatto :Boolean;
                       aX     :LongInt;
                       aY     :LongInt);
         procedure SaveToStream (aStream     :TStream;
                                 aRootNode   :TXmlNode);
         procedure LoadFromStream (aStream     :TStream;
                                   aRootNode   :TXmlNode);
         procedure ImportFromOldFormat (aOld :TOldFormatRealizzazione);
      public
         property RecID    :Longint             read fRecID    write fRecID;
         property Tempo    :LongInt             read fTempo    write fTempo;
         property Tipo     :TTipoRealizzazione  read fTipo     write fTipo;
         property Punti    :LongInt             read fPunti    write fPunti;
         property PosX     :Longint             read fPosX     write fPosX;
         property PosY     :Longint             read fPosY     write fPosY;
         property Quarto   :Longint             read fQuarto   write fQuarto;
         property Plr      :TMatchPlayer        read fPlr      write fPlr;
   end;


   TQuarterTeam = class
      private
         fNumQuarto  :LongInt;
         fPunti      :LongInt;
         fFalli      :LongInt;
         fBonus      :Boolean;
         fStatus     :TQuarterStatus;
         procedure SetFalli(const Value: LongInt);
      public
         constructor Create (aNum :Longint);
         destructor  Destroy; override;
         procedure Assign (aSrc :TQuarterTeam);
         procedure Reset;
         procedure SaveToDB (aMatchId  :LongInt;
                             aQrtNum   :LongInt;
                             MyTm      :Boolean);
         procedure LoadFromDB (aMatchID   :LongInt;
                               aQrtNum    :Longint;
                               MyTm       :Boolean);
      public
         property NumQuarto   :Longint read fNumQuarto write fNumQuarto;
         property Punti       :LongInt read fPunti write fPunti;
         property FalliQrt    :LongInt read fFalli write SetFalli;
         property Bonus       :Boolean read fBonus write fBonus;
         property Status      :TQuarterStatus read fStatus write fStatus;
   end;


   TMatchPlayer = class
      private
         _FakeFouls  :Longint;
         fTempoGioco    :LongInt;   // secondi del tempo di gioco
         fFalliSubiti   :LongInt;
         fRealizzazioni :TObjectList;
         fRimbAttacco   :LongInt;
         fRimbDifesa    :LongInt;
         fPRecuperate   :LongInt;
         fPPerse        :LongInt;
         fStoppSubite   :LongInt;
         fStoppFatte    :LongInt;
         fAssist        :LongInt;
         fInTime        :LongInt;
         fOutTime       :Longint;
         fIsMyTeam      :Boolean;
         fInGioco       :Boolean;
         fPlusMinus     :LongInt;
         fInQuintetto   :Boolean;
         function CalcOER: Double;
         function CalcOERMin: Double;
         function CalcolaPunti: LongInt;
         function CalcolaTempoGiocoStr :String;
         function CalcPIR: Double;
         function CalcPIRMin: Double;
         function CalcRimbalzi: Longint;
         function CalcT2Data: string;
         function CalcT2Perc: String;
         function CalcT2Punti: LongInt;
         function CalcT2Realizz: LongInt;
         function CalcT2Tentati: LongInt;
         function CalcT3Data: string;
         function CalcT3Perc: String;
         function CalcT3Punti: LongInt;
         function CalcT3Realizz: LongInt;
         function CalcT3Tentati: LongInt;
         function CalcTdcData: string;
         function CalcTdcPerc: String;
         function CalcTdcPunti: LongInt;
         function CalcTdcRealizz: LongInt;
         function CalcTdcTentati: LongInt;
         function CalcTLData: string;
         function CalcTLPerc: String;
         function CalcTLPunti: LongInt;
         function CalcTLRealizz: LongInt;
         function CalcTLTentati: LongInt;
         function GetFalliFatti: LongInt;
         function GetFalloFatto(n: Integer): TFalloFatto;
         function GetInTime: LongInt;
         function GetOutTime: LongInt;
         function GetTempoGioco: LongInt;
         procedure SetInTime(const Value: LongInt);
         procedure SetOutTime(const Value: LongInt);
         procedure SetTempoGioco(const Value: LongInt);
         function CalcPtiQ1 :LongInt;
         function CalcPtiQ2 :LongInt;
         function CalcPtiQ3 :LongInt;
         function CalcPtiQ4 :LongInt;
         function CalcPtiEt :LongInt;
      public
         PlayerRecID    :Longint;
         RosterRecID    :Longint;
         Name           :String;
         PlayNumber     :String;
         Captain        :Boolean;
         _Simulation    :Boolean;
         fPMIn          :LongInt;
         CurrCronotime  :Longint;
         fFalliFatti    :Array[1..MaxFouls] of TFalloFatto;
         InternalSort   :LongInt;
         constructor Create;
         destructor  Destroy; override;
         procedure ChangeFakeFouls (aNum :Longint);
         function  TotPunti :Longint;
         function  TotFalli :Longint;
         function  GetTeamCode :string;
         function  TempoGiocoTot :LongInt; overload;
         function  TempoGiocoTot (aAncheInGioco :Boolean) :LongInt;  overload;
         function  CurrentPlayingTimeStr (CurrTime :Longint) :string;
         function  TotalPlayingTimeStr :string;
         procedure SaveToDB;
         procedure SaveToStream (aStream     :TStream;
                                 aRootNode   :TXmlNode);
         procedure LoadFromStream (aStream     :TStream;
                                   aRootNode   :TXmlNode);
         function  PlayNumber2 :string;
         procedure ImportRealizzFromOld (aOld :TOldFormatPlayer);
      public
         property TempoGioco     :LongInt read GetTempoGioco write SetTempoGioco;
         property TempoGiocoStr  :String read CalcolaTempoGiocoStr;
         property FalliFatti     :LongInt read GetFalliFatti;
         property FalliSubiti    :LongInt read fFalliSubiti write fFalliSubiti;
         property Realizzazioni  :TObjectList read fRealizzazioni write fRealizzazioni;
         property Punti          :LongInt read CalcolaPunti;
         property TLRealizz      :LongInt read CalcTLRealizz;
         property TLTentati      :LongInt read CalcTLTentati;
         property TLPunti        :LongInt read CalcTLPunti;
         property TLPerc         :String read CalcTLPerc;
         property T2Realizz      :LongInt read CalcT2Realizz;
         property T2Tentati      :LongInt read CalcT2Tentati;
         property T2Punti        :LongInt read CalcT2Punti;
         property T2Perc         :String read CalcT2Perc;
         property T3Realizz      :LongInt read CalcT3Realizz;
         property T3Tentati      :LongInt read CalcT3Tentati;
         property T3Punti        :LongInt read CalcT3Punti;
         property T3Perc         :String read CalcT3Perc;
         property TdcRealizz     :LongInt read CalcTdcRealizz;
         property TdcTentati     :LongInt read CalcTdcTentati;
         property TdcPunti       :LongInt read CalcTdcPunti;
         property TdcPerc        :String read CalcTdcPerc;
         property RimbAttacco    :Longint read fRimbAttacco write fRimbAttacco;
         property RimbDifesa     :Longint read fRimbDifesa write fRimbDifesa;
         property Rimbalzi       :Longint read CalcRimbalzi;
         property PRecuperate    :Longint read fPRecuperate write fPRecuperate;
         property PPerse         :Longint read fPPerse write fPPerse;
         property StoppSubite    :Longint read fStoppSubite write fStoppSubite;
         property StoppFatte     :Longint read fStoppFatte write fStoppFatte;
         property Assist         :Longint read fAssist write fAssist;
         property PIR            :Double read CalcPIR;
         property PIRMin         :Double read CalcPIRMin;
         property InTime         :LongInt read GetInTime write SetInTime;
         property OutTime        :LongInt read GetOutTime write SetOutTime;
         property IsMyTeam       :Boolean read fIsMyTeam write fIsMyTeam;
         property InGioco        :Boolean read fInGioco write fInGioco;
         property TLData         :string read CalcTLData;
         property T2Data         :string read CalcT2Data;
         property T3Data         :string read CalcT3Data;
         property TdcData        :string read CalcTdcData;
         property FalloFatto[n:Longint]   :TFalloFatto read GetFalloFatto;
         property OER            :Double read CalcOER;
         property OERMin         :Double read CalcOERMin;
         property PlusMinus      :Longint read fPlusMinus write fPlusMinus;
         property InQuintetto    :Boolean read fInQuintetto write fInQuintetto;
         property PtiQ1          :LongInt read CalcPtiQ1;
         property PtiQ2          :LongInt read CalcPtiQ2;
         property PtiQ3          :LongInt read CalcPtiQ3;
         property PtiQ4          :LongInt read CalcPtiQ4;
         property PtiEt          :LongInt read CalcPtiEt;
   end;


   TBoolArray2 = Array[1..2] of Boolean;
   TBoolArray3 = Array[1..3] of Boolean;
   TBoolArray4 = Array[1..MaxExtraQuarters] of Boolean;


   TMatchTeam = class
      private
         fTimeout1      :TBoolArray2;
         fTimeout2      :TBoolArray3;
         fTimeoutExtra  :TBoolArray4;
         fCurrQuarter   :LongInt;
         fQuarti        :TObjectList;
         //
         fRimbAttacco   :LongInt;
         fRimbDifesa    :LongInt;
         fPRecuperate   :LongInt;
         fPPerse        :LongInt;
         function GetTimeout1(n: Integer): Boolean;
         function GetTimeout2(n: Integer): Boolean;
         function GetTimeoutExtra(n: Integer): Boolean;
         procedure SetTimeout1(n: Integer; const Value: Boolean);
         procedure SetTimeout2(n: Integer; const Value: Boolean);
         procedure SetTimeoutExtra(n: Integer; const Value: Boolean);
         function GetQuarto(n: Integer): TQuarterTeam;
         function CalcPunti: LongInt;
         function CalcTLPerc: String;
         function CalcTLPunti: LongInt;
         function CalcTLRealizz: LongInt;
         function CalcTLTentati: LongInt;
         function CalcT2Perc: String;
         function CalcT2Punti: LongInt;
         function CalcT2Realizz: LongInt;
         function CalcT2Tentati: LongInt;
         function CalcT3Perc: String;
         function CalcT3Punti: LongInt;
         function CalcT3Realizz: LongInt;
         function CalcT3Tentati: LongInt;
         function CalcTdcPerc: String;
         function CalcTdcPunti: LongInt;
         function CalcTdcRealizz: LongInt;
         function CalcTdcTentati: LongInt;
         function CalcAssist: Longint;
         function CalcFalliFatti: LongInt;
         function CalcFalliSubiti: LongInt;
         function CalcPPerse: Longint;
         function CalcPRecuperate: Longint;
         function CalcRimbalzi: Longint;
         function CalcRimbAttacco: Longint;
         function CalcRimbDifesa: Longint;
         function CalcStoppFatte: Longint;
         function CalStoppSubite: Longint;
         function CalcOER: Double;
         function CalcPIR: Double;
         function GetTotTempoGioco: Longint;
         function GetTotTempoGiocoStr: String;
      public
         IsMyTeam       :Boolean;
         TeamRecID      :Longint;
         MatchRecID     :Longint;
         Name           :String;
         Abbrev         :String;
         Logo           :TBitmap;
         HeadCoach      :String;
         Assistent1     :String;
         Roster         :TObjectList;
         DeltaRes       :Longint;
         Color          :Longint;
         FalliTeam      :Array[1..MaxFouls] of TFalloFatto;
      public
         Quintetto   :Array[1..8] of Boolean;
         constructor Create (aMyTeam :Boolean);
         destructor  Destroy; override;
         procedure ReadFromDB; overload;
         procedure ReadFromDB (aTeamID :Longint;
                               aMatchID :Longint); overload;
         procedure SaveToDB;
         procedure SaveToStream (aStream     :TStream;
                                 aRootNode   :TXmlNode);
         procedure LoadFromStream (aStream     :TStream;
                                   aRootNode   :TXmlNode);
         function  Player (aIdx :Longint) :TMatchPlayer; overload; inline;
         function  Player (aNumb :String) :TMatchPlayer; overload;
         function  PlayerByID (aID :LongInt) :TMatchPlayer;
         procedure ResetQuarti;
         procedure ResetPlayersData;
         procedure ResetPlayersTime;
         procedure ResetAll;
         procedure ResetMatchData;
         property TRimbAttacco    :Longint read fRimbAttacco write fRimbAttacco;
         property TRimbDifesa     :Longint read fRimbDifesa write fRimbDifesa;
         property TPRecuperate    :Longint read fPRecuperate write fPRecuperate;
         property TPPerse         :Longint read fPPerse write fPPerse;
      public
         property Timeout1[n:Longint]     :Boolean read GetTimeout1 write SetTimeout1;
         property Timeout2[n:Longint]     :Boolean read GetTimeout2 write SetTimeout2;
         property TimeoutExtra[n:Longint] :Boolean read GetTimeoutExtra write SetTimeoutExtra;
         property Quarto[n:Longint]       :TQuarterTeam read GetQuarto;
         property Punti                   :LongInt read CalcPunti;
         property TLRealizz               :LongInt read CalcTLRealizz;
         property TLTentati               :LongInt read CalcTLTentati;
         property TLPunti                 :LongInt read CalcTLPunti;
         property TLPerc                  :String read CalcTLPerc;
         property T2Realizz               :LongInt read CalcT2Realizz;
         property T2Tentati               :LongInt read CalcT2Tentati;
         property T2Punti                 :LongInt read CalcT2Punti;
         property T2Perc                  :String read CalcT2Perc;
         property T3Realizz               :LongInt read CalcT3Realizz;
         property T3Tentati               :LongInt read CalcT3Tentati;
         property T3Punti                 :LongInt read CalcT3Punti;
         property T3Perc                  :String read CalcT3Perc;
         property TdcRealizz              :LongInt read CalcTdcRealizz;
         property TdcTentati              :LongInt read CalcTdcTentati;
         property TdcPunti                :LongInt read CalcTdcPunti;
         property TdcPerc                 :String read CalcTdcPerc;
         property RimbAttacco             :Longint read CalcRimbAttacco;
         property RimbDifesa              :Longint read CalcRimbDifesa;
         property Rimbalzi                :Longint read CalcRimbalzi;
         property PRecuperate             :Longint read CalcPRecuperate;
         property PPerse                  :Longint read CalcPPerse;
         property StoppSubite             :Longint read CalStoppSubite;
         property StoppFatte              :Longint read CalcStoppFatte;
         property Assist                  :Longint read CalcAssist;
         property FalliFatti              :LongInt read CalcFalliFatti;
         property FalliSubiti             :LongInt read CalcFalliSubiti;
         property PIR                     :Double read CalcPIR;
         property OER                     :Double read CalcOER;
         property TotTempoGioco           :Longint read GetTotTempoGioco;
         property TotTempoGiocoStr        :String read GetTotTempoGiocoStr;
         property Quarti                  :TObjectList read fQuarti write fQuarti;
         property CurrQuarter             :LongInt read fCurrQuarter write fCurrQuarter;
   end;



   TCurrMatch = class
      private
         InternalExcelExportFolder  :String;
      public
         RecID       :Longint;
         Title       :String;
         Home        :Boolean;
         PlayDate    :TDate;
         PlayNumber  :String;
         Referee1    :String;
         Referee2    :String;
         Location    :String;
         Day         :String;
         MyTeam      :TMatchTeam;
         OppTeam     :TMatchTeam;
         MatchStatus :TMatchStatus;
         MatchOpen   :Boolean;
         Season      :String;
         Champ       :String;
         Phase1      :String;
         Phase2      :String;
      public
         constructor Create;
         destructor  Destroy; override;
         procedure ReadFromDB; overload;
         procedure ReadFromDB (aID :Longint); overload;
         function  FillDbFields: Boolean;
         procedure SaveToDB (aFullSave :Boolean);
         procedure SaveToStream (aStream :TStream);
         procedure LoadFromStream (aStream :TStream);
         function  GetExcelExportFolder :string;
         procedure SetInCampoFromDB;
         function  GetLastExcelFile :string;
         procedure SetLastExcelFile (aFn :string);
         procedure ImportFromOldFormat (aFn :string);
         function  IsDBOk :LongInt;
         function  FindRecord (aID :LongInt) :Longint;
   end;



   TOperationType = (
                     totUndefined,
                     totTLYes,
                     totTLNo,
                     totT2Yes,
                     totT2No,
                     totT3Yes,
                     totT3No,
                     totFalloFatto,
                     totFalloSubito,
                     totRimbDifesa,
                     totRimbAttacco,
                     totPPersa,
                     totPRecuperata,
                     totStopSubita,
                     totStopFatta,
                     totAssist,
                     totSostituz,
                     totQuintetto,
                     totTimeStart,
                     totTimeStop,
                     totCheckPoint
                    );
   TOperationTypeHelper = record helper for TOperationType
      public
         class function ToString (Value :TOperationType) :String; overload; inline; static;
         class function ToInt (Value :TOperationType) :Longint; overload; inline; static;
         function  ToString :String; overload; inline;
         function  ToInt :Longint; overload; inline;
         procedure SetFrom (aStr :String); overload; inline;
         procedure SetFrom (aInt :Longint); overload; inline;
         procedure SetFromDesc (aStr :String); inline;
         function  LowInt :Longint; inline;
         function  HighInt :Longint; inline;
         function  Desc :string; inline;
   end;

   TOperation = class
      private
         fQuarter :LongInt;
         fTime    :LongInt;
         fOper    :TOperationType;
         fMyTeam  :Boolean;
         fPlayer1 :TMatchPlayer;
         fPlayer2 :TMatchPlayer;
         fDesc    :string;
         fDesc2   :string;
         fIParam  :Longint;
         fCounter :LongInt;
         fInternalStatus   :LongInt;
         function GetMyTeamStr: string;
         function GetPlayer1Str: string;
         function GetPlayer2Str: string;
         procedure SetIParam(const Value: LongInt);
      public
         constructor Create; overload;
         constructor Create (aQrt    :LongInt;
                             aTime   :Longint;
                             aOper   :TOperationType;
                             aMyTeam :Boolean;
                             aPlr1   :TMatchPlayer;
                             aPlr2   :TMatchPlayer;
                             aDesc   :String;
                             aIParam :Longint;
                             aDesc2 :String);  overload;
         constructor Create (aOper   :TOperationType;
                             aMyTeam :Boolean;
                             aPlr1   :TMatchPlayer;
                             aPlr2   :TMatchPlayer;
                             aDesc   :String;
                             aIParam :Longint;
                             aDesc2 :String);  overload;
         constructor Create (FromStr   :string;
                             aMyTeam   :TMatchTeam;
                             aOppTeam  :TMatchTeam);  overload;
         destructor  Destroy; override;
         procedure Assign (aSrc :TOperation);
         function  ToString :string;
         (*
         function  ToJSonString :string;
         *)
         procedure DescToGlobalPos;
         function IsSame (aOper :TOperation) :Boolean;
      public
         property Quarter     :LongInt          read fQuarter     write fQuarter;
         property Time        :LongInt          read fTime        write fTime   ;
         property Oper        :TOperationType   read fOper        write fOper   ;
         property MyTeam      :Boolean          read fMyTeam      write fMyTeam ;
         property Player1     :TMatchPlayer     read fPlayer1     write fPlayer1;
         property Player2     :TMatchPlayer     read fPlayer2     write fPlayer2;
         property Desc        :string           read fDesc        write fDesc   ;
         property Desc2       :string           read fDesc2       write fDesc2  ;
         property IParam      :LongInt          read fIParam      write SetIParam ;
         property Counter     :LongInt          read fCounter     write fCounter;
         property MyTeamStr   :string           read GetMyTeamStr;
         property Player1Str  :string           read GetPlayer1Str;
         property Player2Str  :string           read GetPlayer2Str;
         property InternalStatus :LongInt       read fInternalStatus write fInternalStatus;
   end;



   TOperationListSaveResult   = (
                                 olsrUndefined,
                                 olsrOk,
                                 olsrGenericError,
                                 olsrException
                                );
   TOperationListSaveResultHelper = record helper for TOperationListSaveResult
      public
         class function ToString (Value :TOperationListSaveResult) :String; overload; inline; static;
         class function ToInt (Value :TOperationListSaveResult) :Longint; overload; inline; static;
         function  ToString :String; overload; inline;
         function  ToInt :Longint; overload; inline;
         procedure SetFrom (aStr :String); overload; inline;
         procedure SetFrom (aInt :Longint); overload; inline;
         function  LowInt :Longint; inline;
         function  HighInt :Longint; inline;
   end;
   TOperationListHack = TObjectList<TOperation>;
   TOperationList = class (TOperationListHack)
      private
         type
            TSortFn = function({List :TOperationList; }Index1, Index2 :Integer): Integer of object;
         var
         fCounter    :LongInt;
         fModified   :Boolean;
         function Compare (I1  :Integer;
                           I2  :Integer) :Integer;
         procedure QuickSort (L, R     :Integer;
                              SCompare :TSortFn);
      public
         Onchanged   :TOperationUpdateFn;
         constructor Create;
         destructor  Destroy; override;
         procedure Add (aItem :TOperation);
         procedure AddNoSort (aItem :TOperation);
         procedure Refresh;
         procedure Sort;
         function  RemoveAction (aItem :TOperation) :Boolean; overload;
         function  RemoveAction (aIndex :Longint) :Boolean; overload;
         function  Save (aForce :Boolean) :TOperationListSaveResult;
         function  Load :TOperationListSaveResult;
         function  ToText :String;
      public
         property Counterf :LongInt read fCounter;
         property Modified :Boolean read fModified write fModified;
   end;


   TExcelInfos = record
      public
         StartRow          :LongInt;
         HeaderRows        :LongInt;
         SepRows           :LongInt;
         MyTeamRows        :LongInt;
         OppoTeamRows      :Longint;
         constructor Create (aOwner :TObject);
         function MyTeamFirstRow    :LongInt;
         function OppoTeamFirstRow  :LongInt;
         function TotRows           :LongInt;
         function LastRow           :Longint;
         function TotCols           :LongInt;
         function PIRCol            :LongInt;
         function OERCol            :LongInt;
         function VIRCol            :LongInt;
         function PlusMinusCol      :LongInt;
         function PtQrtCol          :LongInt;
   end;


   TPlayerStats = class
      private
         fPlayerID         :LongInt;
         fPlayerName       :string;
         fTotMatch         :LongInt;
         fTotTempo         :LongInt;      // secondi
         fTotFalliFatti    :LongInt;
         fTotFalliSubiti   :LongInt;
         fTotPunti         :LongInt;
         fTotTLRealizz     :LongInt;
         fTotTLTentati     :LongInt;
         fTotT2Realizz     :LongInt;
         fTotT2Tentati     :LongInt;
         fTotT3Realizz     :LongInt;
         fTotT3Tentati     :LongInt;
         fTotRimbAttacco   :Longint;
         fTotRimbDifesa    :Longint;
         fTotPRecuperate   :Longint;
         fTotPPerse        :Longint;
         fTotStoppSubite   :Longint;
         fTotStoppFatte    :Longint;
         fTotAssist        :Longint;
         fTotPIR           :Longint;
         fTotOER           :Double;
         fTotPlusMinus     :LongInt;
         function CalcAssistMatch: Double;
         function CalcAssistMin: Double;
         function CalcFFattiMatch: Double;
         function CalcFFattiMin: Double;
         function CalcFSubitiMatch: Double;
         function CalcFSubitiMin: Double;
         function CalcOERMatch: Double;
         function CalcOERMin: Double;
         function CalcPIRMatch: Double;
         function CalcPIRMin: Double;
         function CalcPlusMinusMatch: Double;
         function CalcPlusMinusMin: Double;
         function CalcPPerseMatch: Double;
         function CalcPPerseMin: Double;
         function CalcPRecuperateMatch: Double;
         function CalcPRecuperateMin: Double;
         function CalcPuntiMatch: Double;
         function CalcPuntiMin: Double;
         function CalcRimbalzi: LongInt;
         function CalcRimbalziMatch: Double;
         function CalcRimbalziMin: Double;
         function CalcRimbAttaccoMatch: Double;
         function CalcRimbAttaccoMin: Double;
         function CalcRimbDifesaMatch: Double;
         function CalcRimbDifesaMin: Double;
         function CalcT2Perc: Double;
         function CalcT2PercStr: string;
         function CalcT3Perc: Double;
         function CalcT3PercStr: string;
         function CalcTdcPerc: Double;
         function CalcTdcPercStr: string;
         function CalcTdcrealizz: Longint;
         function CalcTdcTentati: Longint;
         function CalcTempoMatch: Double;
         function CalcTLPerc: Double;
         function CalcTLPercStr: string;
      public
         constructor Create;
         destructor  Destroy; override;
         procedure AddMatch (Tempo        :LongInt; // in secondi
                             Punti        :LongInt;
                             TLRealizz    :LongInt;
                             TLTentati    :Longint;
                             T2Realizz    :Longint;
                             T2Tentati    :Longint;
                             T3Realizz    :Longint;
                             T3Tentati    :Longint;
                             FFatti       :Longint;
                             FSubiti      :Longint;
                             RimbDifesa   :Longint;
                             RimbAttacco  :Longint;
                             PPerse       :Longint;
                             PRecuperate  :Longint;
                             StoppSubite  :Longint;
                             StoppFatte   :Longint;
                             Assist       :LongInt;
                             Pir          :Longint;
                             Oer          :Double;
                             PlusMinus    :Longint);
         procedure Reset;
      public
         property PlayerID          :LongInt read fPlayerID write fPlayerID;
         property PlayerName        :string  read fPlayerName write fPlayerName;
         property TotMatch          :LongInt read fTotMatch write fTotMatch;
         property TotTempo          :LongInt read fTotTempo write fTotTempo;
         property TotPunti          :LongInt read fTotPunti write fTotPunti;
         property TotTLRealizz      :LongInt read fTotTLRealizz write fTotTLRealizz;
         property TotTLTentati      :LongInt read fTotTLTentati write fTotTLTentati;
         property TotT2Realizz      :LongInt read fTotT2Realizz write fTotT2Realizz;
         property TotT2Tentati      :LongInt read fTotT2Tentati write fTotT2Tentati;
         property TotT3Realizz      :LongInt read fTotT3Realizz write fTotT3Realizz;
         property TotT3Tentati      :LongInt read fTotT3Tentati write fTotT3Tentati;
         property TotFalliFatti     :LongInt read fTotFalliFatti write fTotFalliFatti;
         property TotFalliSubiti    :LongInt read fTotFalliSubiti write fTotFalliSubiti;
         property TotRimbAttacco    :Longint read fTotRimbAttacco write fTotRimbAttacco;
         property TotRimbDifesa     :Longint read fTotRimbDifesa write fTotRimbDifesa;
         property TotPRecuperate    :Longint read fTotPRecuperate write fTotPRecuperate;
         property TotPPerse         :Longint read fTotPPerse write fTotPPerse;
         property TotStoppSubite    :Longint read fTotStoppSubite write fTotStoppSubite;
         property TotStoppFatte     :Longint read fTotStoppFatte write fTotStoppFatte;
         property TotAssist         :Longint read fTotAssist write fTotAssist;
         property TotPIR            :Longint read fTotPIR write fTotPIR;
         property TotOER            :Double  read fTotOER write fTotOER;
         property TotPlusMinus      :Longint read fTotPlusMinus write fTotPlusMinus;
         //
         property TempoMatch        :Double read CalcTempoMatch;
         property PuntiMatch        :Double read CalcPuntiMatch;
         property PuntiMin          :Double read CalcPuntiMin;
         property TLPerc            :Double read CalcTLPerc;
         property TLPercStr         :string read CalcTLPercStr;
         property T2Perc            :Double read CalcT2Perc;
         property T2PercStr         :string read CalcT2PercStr;
         property T3Perc            :Double read CalcT3Perc;
         property T3PercStr         :string read CalcT3PercStr;
         property TotTdcTentati     :Longint read CalcTdcTentati;
         property TotTdcRealizz     :Longint read CalcTdcrealizz;
         property TdcPerc           :Double read CalcTdcPerc;
         property TdcPercStr        :string read CalcTdcPercStr;
         property FFattiMatch       :Double read CalcFFattiMatch;
         property FFattiMin         :Double read CalcFFattiMin;
         property FSubitiMatch      :Double read CalcFSubitiMatch;
         property FSubitiMin        :Double read CalcFSubitiMin;
         property RimbDifesaMatch   :Double read CalcRimbDifesaMatch;
         property RimbDifesaMin     :Double read CalcRimbDifesaMin;
         property RimbAttaccoMatch  :Double read CalcRimbAttaccoMatch;
         property RimbAttaccoMin    :Double read CalcRimbAttaccoMin;
         property Rimbalzi          :LongInt read CalcRimbalzi;
         property RimbalziMatch     :Double read CalcRimbalziMatch;
         property RimbalziMin       :Double read CalcRimbalziMin;
         property PPerseMatch       :Double read CalcPPerseMatch;
         property PPerseMin         :Double read CalcPPerseMin;
         property PRecuperateMatch  :Double read CalcPRecuperateMatch;
         property PRecuperateMin    :Double read CalcPRecuperateMin;
         property AssistMatch       :Double read CalcAssistMatch;
         property AssistMin         :Double read CalcAssistMin;
         property PIRMatch          :Double read CalcPIRMatch;
         property PIRMin            :Double read CalcPIRMin;
         property OERMatch          :Double read CalcOERMatch;
         property OERMin            :Double read CalcOERMin;
         property PlusMinusMatch    :Double read CalcPlusMinusMatch;
         property PlusMinusMin      :Double read CalcPlusMinusMin;
   end;

   TMatchStats = class
      private
         fMatchID          :LongInt;
         fMatchTitle       :string;
         fMatchOpponent    :string;
         fMatchHome        :Boolean;
         fMatchDay         :string;
         fMatchDate        :TDateTime;
         fMatchSeason      :String;
         fMatchChamp       :string;
         fTotFalliFatti    :LongInt;
         fTotFalliSubiti   :LongInt;
         fTotPuntiFatti    :LongInt;
         fTotPuntiSubiti   :LongInt;
         fTotTLRealizz     :LongInt;
         fTotTLTentati     :LongInt;
         fTotT2Realizz     :LongInt;
         fTotT2Tentati     :LongInt;
         fTotT3Realizz     :LongInt;
         fTotT3Tentati     :LongInt;
         fTotRimbAttacco   :Longint;
         fTotRimbDifesa    :Longint;
         fTotPRecuperate   :Longint;
         fTotPPerse        :Longint;
         fTotStoppSubite   :Longint;
         fTotStoppFatte    :Longint;
         fTotAssist        :Longint;
         fTotPIR           :Longint;
         fTotOER           :Double;
         fTotPlusMinus     :LongInt;
      public
         constructor Create; overload;
         constructor Create (aMatch :TCurrMatch); overload;
         destructor  Destroy; override;
         procedure Reset;
         procedure AddMatch (aMatch :TCurrMatch);
      public
         property MatchID          :LongInt     read fMatchID        write fMatchID       ;
         property MatchTitle       :string      read fMatchTitle     write fMatchTitle    ;
         property MatchOpponent    :string      read fMatchOpponent  write fMatchOpponent ;
         property MatchHome        :Boolean     read fMatchHome      write fMatchHome     ;
         property MatchDay         :string      read fMatchDay       write fMatchDay   ;
         property MatchDate        :TDateTime   read fMatchDate      write fMatchDate  ;
         property MatchSeason      :String      read fMatchSeason    write fMatchSeason;
         property MatchChamp       :string      read fMatchChamp     write fMatchChamp ;
         property TotFalliFatti    :LongInt read fTotFalliFatti  write fTotFalliFatti ;
         property TotFalliSubiti   :LongInt read fTotFalliSubiti write fTotFalliSubiti;
         property TotPuntiFatti    :LongInt read fTotPuntiFatti  write fTotPuntiFatti ;
         property TotPuntiSubiti   :LongInt read fTotPuntiSubiti write fTotPuntiSubiti;
         property TotTLRealizz     :LongInt read fTotTLRealizz   write fTotTLRealizz  ;
         property TotTLTentati     :LongInt read fTotTLTentati   write fTotTLTentati  ;
         property TotT2Realizz     :LongInt read fTotT2Realizz   write fTotT2Realizz  ;
         property TotT2Tentati     :LongInt read fTotT2Tentati   write fTotT2Tentati  ;
         property TotT3Realizz     :LongInt read fTotT3Realizz   write fTotT3Realizz  ;
         property TotT3Tentati     :LongInt read fTotT3Tentati   write fTotT3Tentati  ;
         property TotRimbAttacco   :Longint read fTotRimbAttacco write fTotRimbAttacco;
         property TotRimbDifesa    :Longint read fTotRimbDifesa  write fTotRimbDifesa ;
         property TotPRecuperate   :Longint read fTotPRecuperate write fTotPRecuperate;
         property TotPPerse        :Longint read fTotPPerse      write fTotPPerse     ;
         property TotStoppSubite   :Longint read fTotStoppSubite write fTotStoppSubite;
         property TotStoppFatte    :Longint read fTotStoppFatte  write fTotStoppFatte ;
         property TotAssist        :Longint read fTotAssist      write fTotAssist     ;
         property TotPIR           :Longint read fTotPIR         write fTotPIR        ;
         property TotOER           :Double  read fTotOER         write fTotOER        ;
         property TotPlusMinus     :LongInt read fTotPlusMinus   write fTotPlusMinus  ;
   end;

   TTeamStats = class
      private
         fTeamID           :LongInt;
         fTeamName         :string;
         fTotMatch         :LongInt;
         fTotFalliFatti    :LongInt;
         fTotFalliSubiti   :LongInt;
         fTotPuntiFatti    :LongInt;
         fTotPuntiSubiti   :LongInt;
         fTotTLRealizz     :LongInt;
         fTotTLTentati     :LongInt;
         fTotT2Realizz     :LongInt;
         fTotT2Tentati     :LongInt;
         fTotT3Realizz     :LongInt;
         fTotT3Tentati     :LongInt;
         fTotRimbAttacco   :Longint;
         fTotRimbDifesa    :Longint;
         fTotPRecuperate   :Longint;
         fTotPPerse        :Longint;
         fTotStoppSubite   :Longint;
         fTotStoppFatte    :Longint;
         fTotAssist        :Longint;
         fTotPIR           :Longint;
         fTotOER           :Double;
         fTotPlusMinus     :LongInt;
         fPlayers          :TObjectList<TPlayerStats>;
         fMatches          :TObjectList<TMatchStats>;
      public
         constructor Create; overload;
         constructor Create (aTeamID   :LongInt;
                             aTeamName :string); overload;
         destructor  Destroy; override;
         procedure AddMatch (aMatch :TCurrMatch);
         function  AddPlayer (aPlr :TMatchPlayer) :TPlayerStats;
         procedure Reset;
      public
         property TeamID           :LongInt                    read fTeamID         write fTeamID        ;
         property TeamName         :string                     read fTeamName       write fTeamName      ;
         property TotMatch         :LongInt                    read fTotMatch       write fTotMatch      ;
         property TotFalliFatti    :LongInt                    read fTotFalliFatti  write fTotFalliFatti ;
         property TotFalliSubiti   :LongInt                    read fTotFalliSubiti write fTotFalliSubiti;
         property TotPuntiFatti    :LongInt                    read fTotPuntiFatti  write fTotPuntiFatti ;
         property TotPuntiSubiti   :LongInt                    read fTotPuntiSubiti write fTotPuntiSubiti;
         property TotTLRealizz     :LongInt                    read fTotTLRealizz   write fTotTLRealizz  ;
         property TotTLTentati     :LongInt                    read fTotTLTentati   write fTotTLTentati  ;
         property TotT2Realizz     :LongInt                    read fTotT2Realizz   write fTotT2Realizz  ;
         property TotT2Tentati     :LongInt                    read fTotT2Tentati   write fTotT2Tentati  ;
         property TotT3Realizz     :LongInt                    read fTotT3Realizz   write fTotT3Realizz  ;
         property TotT3Tentati     :LongInt                    read fTotT3Tentati   write fTotT3Tentati  ;
         property TotRimbAttacco   :Longint                    read fTotRimbAttacco write fTotRimbAttacco;
         property TotRimbDifesa    :Longint                    read fTotRimbDifesa  write fTotRimbDifesa ;
         property TotPRecuperate   :Longint                    read fTotPRecuperate write fTotPRecuperate;
         property TotPPerse        :Longint                    read fTotPPerse      write fTotPPerse     ;
         property TotStoppSubite   :Longint                    read fTotStoppSubite write fTotStoppSubite;
         property TotStoppFatte    :Longint                    read fTotStoppFatte  write fTotStoppFatte ;
         property TotAssist        :Longint                    read fTotAssist      write fTotAssist     ;
         property TotPIR           :Longint                    read fTotPIR         write fTotPIR        ;
         property TotOER           :Double                     read fTotOER         write fTotOER        ;
         property TotPlusMinus     :LongInt                    read fTotPlusMinus   write fTotPlusMinus  ;
         property Players          :TObjectList<TPlayerStats>  read fPlayers        write fPlayers       ;
         property Matches          :TObjectList<TMatchStats>   read fMatches        write fMatches       ;
   end;



   TSaveThread = class (TThreadEx)
      private
         aMatch   :TCurrMatch;
      protected
         procedure Execute; override;
         procedure DoJob;
      public
         constructor Create (Mtch :TCurrMatch);
         destructor  Destroy; override;
   end;



type
   TActionType = (
                  tatPPersaPlayer,
                  tatPPersaTeam
                 );




procedure PlaySound (aSoundEvent :TSoundEvent);
function  GetTimeStr (aTimeInSec :LongInt) :string;
function  CheckBtnPressTime :Boolean;
function  LastSaveTimeLessThan (aDelta :Int64) :Boolean;




var
   BSDECfg           :TConfigClass;
   RegKey_WindowsPos :String;
//   CurrMatch         :TCurrMatch;
   OpList            :TOperationList;
   CurrentQuarter    :LongInt;
   ExcelInfos        :TExcelInfos;
   RecentMatches     :TStringList;
   RecentFName       :string;
   LogOperation      :Boolean;


//threadvar
   InDBSaving        :Boolean;
   CurrMatch         :TCurrMatch;
   LastSaveTime      :Int64;



implementation

uses
   System.SysUtils,
   System.TypInfo,
   Data.DB,
   TntUtils_Str,
   TntUtils_StrLst,
   dxSkinsCore,
   SkinUtils,
   LogClientUnit,
   BSDEvo.DMod.EurekaLogDataMod,
   BSDEvo.DMod.DataMod,
   BSDEvo.Wnd.Main,
   BSDEvo.Dlg.Shoots,
//   BSDEvo.Unt.OldFormat,
   BSDEvo.Dlg.ImportPlayer;




var
   BtnPressTime   :Int64;




function LastSaveTimeLessThan (aDelta :Int64) :Boolean;
begin
   Result := ((GetMillisecCount()-LastSaveTime) < aDelta);
end;



function CheckBtnPressTime :Boolean;
var
   Pt :Int64;
begin
   Result := False;
   Pt := GetMillisecCount();
   Result := ((Pt-BtnPressTime) > 500);
   BtnPressTime := Pt;
end;






procedure PlaySound (aSoundEvent :TSoundEvent);
begin
//   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, '.PlaySound ()', []);
   try
      try
         case aSoundEvent of
            tseSelection: ;
            tseTimeStart: ;
            tseTimeStop:  ;
            tseQuarterEnd: ;
         end;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[.PlaySound] Exception "%s"', [E.Message]);
         end;
      end;
   finally
//      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, '.PlaySound', []);
   end;
end;


function  GetTimeStr (aTimeInSec :LongInt) :string;
var
   Nn :LongInt;
   Ss :LongInt;
begin
   Nn := aTimeInSec Div 60;
   Ss := aTimeInSec Mod 60;
   Result := Format('%0.2d:%0.2d', [Nn, Ss]);
end;






{ TConfigClass }

constructor TConfigClass.Create;
begin
   XMLDoc := Nil;
   XMLFile := AddSlash (Dalet_Globals.Folder_Cfg)+'BSDEvoCfg.XML';
   XMLDoc := TNativeXml.CreateName (Dalet_Globals.App_Name);
end;


destructor TConfigClass.Destroy;
begin
   XMLFile := '';
   if (Assigned (XMLDoc)) then
      XMLDoc.Free;
end;


procedure TConfigClass.Read (aFn :String);
var
   SkEl     :TdxSkinElement;
   SkGrp    :TdxSkinControlGroup;
   SkProp   :TdxSkinProperty;
begin
   //
   DefaultBackColor := RGB (32,32,32);
   SkEl := Nil;
   SkEl := GetElementFromSkin (Nil, Nil, 'Common', 'GroupPanelNoBorder');
   if (SkEl <> Nil) then
   begin
      DefaultBackColor := SkEl.Color;
   end;
   DefaultTextColor := clWhite;
   SkGrp := GetGroupFromSkin (Nil, Nil, 'Editors');
   if (SkGrp <> Nil) then
   begin
      SkProp := SkGrp.GetPropertyByName ('TextColor');
      if (SkProp <> Nil) then
         DefaultTextColor := TdxSkinColor(SkProp).Value
   end;
   //
   XMLDoc.XmlFormat := xfReadable;
   if (FileExists (aFn)) then
      XMLDoc.LoadFromFile (aFn);
   XMLDoc.XmlFormat := xfReadable;
   //
   CurrentSeason  := CreateNodeLink (XMLDoc.Root, '/CurrentSeason',  '0');
   CurrSeasonName := '';
   DurationRegulTime    := CreateNodeLink (XMLDoc.Root, '/General/Timing/DurationRegular',        IntTostr(10));
   DurationExtraTime    := CreateNodeLink (XMLDoc.Root, '/General/Timing/DurationExtra',          IntTostr(5));
   ShowFieldMyShoot     := CreateNodeLink (XMLDoc.Root, '/General/ShowField/MyShoot',             'True');
   ShowFieldOppoShoot   := CreateNodeLink (XMLDoc.Root, '/General/ShowField/OppoShoot',           'False');
   FieldPlayersSorting  := CreateNodeLink (XMLDoc.Root, '/General/FieldPlayerSorting',            'True');
   SaveAtTimeStop       := CreateNodeLink (XMLDoc.Root, '/General/SaveAtTimeStop',                'True');
   SaveInCloudAtExit    := CreateNodeLink (XMLDoc.Root, '/General/Cloud/SaveAtExit',              'True');
   CloudFolder          := CreateNodeLink (XMLDoc.Root, '/General/Cloud/Folder',                  '');
   UseOpenGL            := CreateNodeLink (XMLDoc.Root, '/General/UseOpenGL',                     'True');
   RosterHorizontalDir  := CreateNodeLink (XMLDoc.Root, '/General/RosterHorizontalDir',           'False');
   ShowOpponentFive     := CreateNodeLink (XMLDoc.Root, '/General/ShowOpponentFive',              'False');
   FrameFlashDuration   := CreateNodeLink (XMLDoc.Root, '/General/FrameFlashDuration',            '200');
   Excel_PIR               := CreateNodeLink (XMLDoc.Root, '/Excel/PIR',        'True');
   Excel_OER               := CreateNodeLink (XMLDoc.Root, '/Excel/OER',        'True');
   Excel_VIR               := CreateNodeLink (XMLDoc.Root, '/Excel/VIR',        'False');
   Excel_PlusMinus         := CreateNodeLink (XMLDoc.Root, '/Excel/PlusMinus',  'False');
   Excel_Bck3Rows          := CreateNodeLink (XMLDoc.Root, '/Excel/Bck3Rows',   'True');
   Excel_DrawLines         := CreateNodeLink (XMLDoc.Root, '/Excel/DrawLines',  'True');
   Excel_NomeAvversari     := CreateNodeLink (XMLDoc.Root, '/Excel/NomeAvversari',  'True');
   Excel_ScriviDescCoach   := CreateNodeLink (XMLDoc.Root, '/Excel/ScriviDescCoach',  'True');
   Excel_MappaTiroRow      := CreateNodeLink (XMLDoc.Root, '/Excel/MappaTiroRow',  '40');
   Excel_MappaTiroInfo     := CreateNodeLink (XMLDoc.Root, '/Excel/MappaTiroInfo',  '80');
   Excel_MappaTiroOffsetX  := CreateNodeLink (XMLDoc.Root, '/Excel/MappaTiroOffsetX',  '30');
   Excel_MappaTiroOffsetY  := CreateNodeLink (XMLDoc.Root, '/Excel/MappaTiroOffsetY',  '-3');
   Excel_ExportFolder      := CreateNodeLink (XMLDoc.Root, '/Excel/ExportFolder',  Dalet_Globals.Folder_Data);
   PlayerColorBackgroundUnselected  := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/Unselected/Back',        IntToStr(RGB (115,115,115)));
   PlayerColorTextUnselected        := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/Unselected/Text',        IntToStr(RGB (255,255,255)));
   PlayerColorNameUnselected        := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/Unselected/Name',        IntToStr(RGB (255,255,255)));
   PlayerColorNumberUnselected      := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/Unselected/Number',      IntToStr(RGB (255,255,000)));
   PlayerColorPointsUnselected      := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/Unselected/Point',       IntToStr(RGB (255,255,255)));
   PlayerColorQuintettoUnselected   := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/Unselected/Quintetto',   IntToStr(RGB (255,128,000)));
   PlayerColorBackgroundSelected    := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/Selected/Back',          IntToStr(RGB (128,255,128)));
   PlayerColorTextSelected          := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/Selected/Text',          IntToStr(RGB (000,000,000)));
   PlayerColorNameSelected          := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/Selected/Name',          IntToStr(RGB (000,000,000)));
   PlayerColorNumberSelected        := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/Selected/Number',        IntToStr(RGB (000,000,255)));
   PlayerColorPointsSelected        := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/Selected/Point',         IntToStr(RGB (000,000,000)));
   PlayerColorQuintettoSelected     := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/Selected/Quintetto',     IntToStr(RGB (255,128,000)));
   PlayerColorBackgroundInGioco     := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/InGioco/Back',           IntToStr(RGB (200,200,255)));
   PlayerColorFoulBack0             := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/Foul/Back0',             IntToStr(RGB (220,220,220)));
   PlayerColorFoulBack1             := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/Foul/Back1',             IntToStr(RGB (255,210,210)));
   PlayerColorFoulBack2             := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/Foul/Back2',             IntToStr(RGB (255,255,000)));
   PlayerColorFoulBack3             := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/Foul/Back3',             IntToStr(RGB (255,145,145)));
   PlayerColorFoulBack4             := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/Foul/Back4',             IntToStr(RGB (255,000,255)));
   PlayerColorFoulBack5             := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/Foul/Back5',             IntToStr(RGB (000,000,000)));
   PlayerColorFoulText0             := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/Foul/Text0',             IntToStr(RGB (000,128,000)));
   PlayerColorFoulText1             := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/Foul/Text1',             IntToStr(RGB (000,000,255)));
   PlayerColorFoulText2             := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/Foul/Text2',             IntToStr(RGB (000,000,255)));
   PlayerColorFoulText3             := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/Foul/Text3',             IntToStr(RGB (255,000,000)));
   PlayerColorFoulText4             := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/Foul/Text4',             IntToStr(RGB (255,255,255)));
   PlayerColorFoulText5             := CreateNodeLink (XMLDoc.Root, '/Colors/PlayerFrame/Foul/Text5',             IntToStr(RGB (255,255,255)));
   TeamColorBackgroundUnselected := CreateNodeLink (XMLDoc.Root, '/Colors/TeamFrame/Unselected/Back',       IntToStr(RGB (115,115,115)));
   TeamColorTextUnselected       := CreateNodeLink (XMLDoc.Root, '/Colors/TeamFrame/Unselected/Text',       IntToStr(RGB (255,255,255)));
   TeamColorNameTextUnselected   := CreateNodeLink (XMLDoc.Root, '/Colors/TeamFrame/Unselected/NameText',   IntToStr(RGB (000,000,000)));
   TeamColorNameBackUnselected   := CreateNodeLink (XMLDoc.Root, '/Colors/TeamFrame/Unselected/NameBack',   IntToStr(RGB (255,128,000)));
   TeamColorPointsUnselected     := CreateNodeLink (XMLDoc.Root, '/Colors/TeamFrame/Unselected/Points',     IntToStr(RGB (000,000,128)));
   TeamColorPointQrtUnselected   := CreateNodeLink (XMLDoc.Root, '/Colors/TeamFrame/Unselected/PointsQrt',  IntToStr(RGB (000,000,128)));
   TeamColorFoulUnselected       := CreateNodeLink (XMLDoc.Root, '/Colors/TeamFrame/Unselected/Fouls',      IntToStr(RGB (128,000,000)));
   TeamColorBackgroundSelected   := CreateNodeLink (XMLDoc.Root, '/Colors/TeamFrame/Selected/Back',         IntToStr(RGB (128,255,128)));
   TeamColorTextSelected         := CreateNodeLink (XMLDoc.Root, '/Colors/TeamFrame/Selected/Text',         IntToStr(RGB (000,000,000)));
   TeamColorNameTextSelected     := CreateNodeLink (XMLDoc.Root, '/Colors/TeamFrame/Selected/NameText',     IntToStr(RGB (000,000,000)));
   TeamColorNameBackSelected     := CreateNodeLink (XMLDoc.Root, '/Colors/TeamFrame/Selected/NameBack',     IntToStr(RGB (255,128,000)));
   TeamColorPointsSelected       := CreateNodeLink (XMLDoc.Root, '/Colors/TeamFrame/Selected/Points',       IntToStr(RGB (000,000,128)));
   TeamColorPointQrtSelected     := CreateNodeLink (XMLDoc.Root, '/Colors/TeamFrame/Selected/PointsQrt',    IntToStr(RGB (000,000,128)));
   TeamColorFoulSelected         := CreateNodeLink (XMLDoc.Root, '/Colors/TeamFrame/Selected/Fouls',        IntToStr(RGB (128,000,000)));
   TimerFrameActiveColor1     := CreateNodeLink (XMLDoc.Root, '/Colors/TimerFrame/ActiveColor1', IntToStr(RGB (175,255,175)));
   TimerFrameActiveColor2     := CreateNodeLink (XMLDoc.Root, '/Colors/TimerFrame/ActiveColor2', IntToStr(RGB (000,231,000)));
   ShootColorQrt1Yes          := CreateNodeLink (XMLDoc.Root, '/Colors/Qrt1/Yes',  IntToStr(RGB (255,000,000)));
   ShootColorQrt1No           := CreateNodeLink (XMLDoc.Root, '/Colors/Qrt1/No',   IntToStr(RGB (255,000,000)));
   ShootColorQrt2Yes          := CreateNodeLink (XMLDoc.Root, '/Colors/Qrt2/Yes',  IntToStr(RGB (023,177,255)));
   ShootColorQrt2No           := CreateNodeLink (XMLDoc.Root, '/Colors/Qrt2/No',   IntToStr(RGB (023,177,255)));
   ShootColorQrt3Yes          := CreateNodeLink (XMLDoc.Root, '/Colors/Qrt3/Yes',  IntToStr(RGB (143,077,000)));
   ShootColorQrt3No           := CreateNodeLink (XMLDoc.Root, '/Colors/Qrt3/No',   IntToStr(RGB (143,077,000)));
   ShootColorQrt4Yes          := CreateNodeLink (XMLDoc.Root, '/Colors/Qrt4/Yes',  IntToStr(RGB (016,128,016)));
   ShootColorQrt4No           := CreateNodeLink (XMLDoc.Root, '/Colors/Qrt4/No',   IntToStr(RGB (016,128,016)));
   ShootColorQrtExtraYes      := CreateNodeLink (XMLDoc.Root, '/Colors/Extra/Yes', IntToStr(RGB (174,000,205)));
   ShootColorQrtExtraNo       := CreateNodeLink (XMLDoc.Root, '/Colors/Extra/No',  IntToStr(RGB (174,000,205)));
   ExcelColor_Title     := CreateNodeLink (XMLDoc.Root, '/Colors/Excel/Title',      IntToStr(RGB (255,000,000)));
   ExcelColor_Champ     := CreateNodeLink (XMLDoc.Root, '/Colors/Excel/Champ',      IntToStr(RGB (000,000,000)));
   ExcelColor_Parziali  := CreateNodeLink (XMLDoc.Root, '/Colors/Excel/Parziali',   IntToStr(RGB (000,128,255)));
   ExcelColor_BckCols   := CreateNodeLink (XMLDoc.Root, '/Colors/Excel/BckCols',    IntToStr(RGB (255,190,000)));
   ExcelColor_TxtCols   := CreateNodeLink (XMLDoc.Root, '/Colors/Excel/TxtCols',    IntToStr(RGB (000,000,000)));
   ExcelColor_BckTots   := CreateNodeLink (XMLDoc.Root, '/Colors/Excel/BckTots',    IntToStr(RGB (186,102,255)));
   ExcelColor_TxtTots   := CreateNodeLink (XMLDoc.Root, '/Colors/Excel/TxtTots',    IntToStr(RGB (000,000,000)));
   ExcelColor_BckRow1   := CreateNodeLink (XMLDoc.Root, '/Colors/Excel/BckRow1',    IntToStr(RGB (255,255,255)));
   ExcelColor_BckRow2   := CreateNodeLink (XMLDoc.Root, '/Colors/Excel/BckRow2',    IntToStr(RGB (240,240,240)));
   ExcelColor_BckRow3   := CreateNodeLink (XMLDoc.Root, '/Colors/Excel/BckRow3',    IntToStr(RGB (225,225,225)));
   ExcelColor_Border    := CreateNodeLink (XMLDoc.Root, '/Colors/Excel/Border',     IntToStr(RGB (128,128,128)));
end;


procedure TConfigClass.Read;
begin
   Read (XMLFile);
end;


procedure TConfigClass.Save (aFn :String);
begin
   XMLDoc.XmlFormat := xfReadable;
   XMLDoc.UseFullNodes := True;
   XMLDoc.CommentString := Dalet_Globals.App_Description;
   ForceDirectories (ExtractFilePath (aFn));
   XMLDoc.SaveToFile (aFn);
end;


procedure TConfigClass.Save;
begin
   Save (XMLFile);
end;


procedure TConfigClass.ColorsFromPlayer(Cols: TPlayerFrameColors);
begin
   PlayerColorBackgroundUnselected.ValueAsInteger := Cols.BackgroundUnselected;
   PlayerColorBackgroundSelected.ValueAsInteger   := Cols.BackgroundSelected;
   PlayerColorBackgroundInGioco.ValueAsInteger    := Cols.BackgroundInGioco;
   PlayerColorFoulText0.ValueAsInteger            := Cols.FoulText[0];
   PlayerColorFoulBack0.ValueAsInteger            := Cols.FoulBack[0];
   PlayerColorFoulText1.ValueAsInteger            := Cols.FoulText[1];
   PlayerColorFoulBack1.ValueAsInteger            := Cols.FoulBack[1];
   PlayerColorFoulText2.ValueAsInteger            := Cols.FoulText[2];
   PlayerColorFoulBack2.ValueAsInteger            := Cols.FoulBack[2];
   PlayerColorFoulText3.ValueAsInteger            := Cols.FoulText[3];
   PlayerColorFoulBack3.ValueAsInteger            := Cols.FoulBack[3];
   PlayerColorFoulText4.ValueAsInteger            := Cols.FoulText[4];
   PlayerColorFoulBack4.ValueAsInteger            := Cols.FoulBack[4];
   PlayerColorFoulText5.ValueAsInteger            := Cols.FoulText[5];
   PlayerColorFoulBack5.ValueAsInteger            := Cols.FoulBack[5];
   PlayerColorTextUnselected.ValueAsInteger       := Cols.TextUnselected;
   PlayerColorTextSelected.ValueAsInteger         := Cols.TextSelected;
   PlayerColorNameUnselected.ValueAsInteger       := Cols.NameUnselected;
   PlayerColorNameSelected.ValueAsInteger         := Cols.NameSelected;
   PlayerColorNumberUnselected.ValueAsInteger     := Cols.NumberUnselected;
   PlayerColorNumberSelected.ValueAsInteger       := Cols.NumberSelected;
   PlayerColorPointsUnselected.ValueAsInteger     := Cols.PointsSelected;
   PlayerColorPointsSelected.ValueAsInteger       := Cols.PointsUnselected;
   PlayerColorQuintettoSelected.ValueAsInteger    := Cols.QuintettoSelected;
   PlayerColorQuintettoUnselected.ValueAsInteger  := Cols.QuintettoUnselected;
end;


procedure TConfigClass.ColorsFromTeam(Cols: TTeamFrameColors);
begin
   TeamColorBackgroundUnselected.ValueAsInteger := Cols.BackgroundUnselected;
   TeamColorBackgroundSelected.ValueAsInteger   := Cols.BackgroundSelected;
   TeamColorTextUnselected.ValueAsInteger       := Cols.TextUnselected;
   TeamColorTextSelected.ValueAsInteger         := Cols.TextSelected;
   TeamColorNameTextSelected.ValueAsInteger     := Cols.TeamSelected;
   TeamColorNameTextUnselected.ValueAsInteger   := Cols.TeamUnselected;
   TeamColorNameBackSelected.ValueAsInteger     := Cols.TeamBackSelected;
   TeamColorNameBackUnselected.ValueAsInteger   := Cols.TeamBackUnselected;
   TeamColorPointsSelected.ValueAsInteger       := Cols.PointsSelected;
   TeamColorPointsUnselected.ValueAsInteger     := Cols.PointsUnselected;
   TeamColorPointQrtSelected.ValueAsInteger     := Cols.PuntiQrtSelected;
   TeamColorPointQrtUnselected.ValueAsInteger   := Cols.PuntiQrtUnselected;
   TeamColorFoulSelected.ValueAsInteger         := Cols.FalliSelected;
   TeamColorFoulUnselected.ValueAsInteger       := Cols.FalliUnselected;
end;






{ TMatchStatusHelper }

class function TMatchStatusHelper.ToInt(Value: TMatchStatus): Longint;
begin
   Result := Value.ToInt();
end;


class function TMatchStatusHelper.ToString (Value :TMatchStatus): String;
begin
   Result := Value.ToString();
end;


class function TMatchStatusHelper.ToDesc (Value :TMatchStatus) :String;
begin
   Result := Value.ToDesc();
end;


class function TMatchStatusHelper.ToDesc(IntValue: Integer): String;
begin
//   if ((LowInt <= IntValue) and (HighInt >= IntValue)) then
   begin
      Result := TMatchStatus(IntValue).ToDesc();
   end;
end;


procedure TMatchStatusHelper.SetFrom(aStr: String);
var
   Xxx   :TMatchStatus;
begin
   aStr := UpperTrim (aStr);
   for Xxx:=Low(TMatchStatus) to High(TMatchstatus) do
   begin
      if (aStr = UpperTrim (Xxx.ToString())) then
      begin
         Self := Xxx;
         Exit;
      end;
   end;
end;


procedure TMatchStatusHelper.SetFrom(aInt: Integer);
begin
   if ((LowInt <= aInt) and (HighInt >= aInt)) then
      Self := TMatchStatus(aInt);
end;


function TMatchStatusHelper.HighInt: Longint;
begin
   Result := Ord (High (TMatchStatus));
end;


function TMatchStatusHelper.LowInt: Longint;
begin
   Result := Ord (Low (TMatchStatus));
end;


function TMatchStatusHelper.ToDesc: string;
begin
   Result := '';
   case Self of
      msNotPlayed:   Result := Str_MatchSyatus_NotPlayed;
      msPlaying:     Result := Str_MatchSyatus_Playing;
      msTerminated:  Result := Str_MatchSyatus_Terminated;
      msFinalized:   Result := Str_MatchSyatus_Finalized;
   end;
end;


function TMatchStatusHelper.ToInt: Longint;
begin
   Result := Ord (Self);
end;


function TMatchStatusHelper.ToString: String;
begin
   Result := GetEnumName (TypeInfo(TMatchStatus), LongInt(Self));
end;







{ TDataKindHelper }

class function TDataKindHelper.ToInt(Value: TDataKind): Longint;
begin
   Result := Value.ToInt();
end;


procedure TDataKindHelper.SetFrom(aStr: String);
var
   Xxx   :TDataKind;
begin
   aStr := UpperTrim (aStr);
   for Xxx:=Low(TDataKind) to High(TDataKind) do
   begin
      if (aStr = UpperTrim (Xxx.ToString())) then
      begin
         Self := Xxx;
         Exit;
      end;
   end;
end;


procedure TDataKindHelper.SetFrom(aInt: Integer);
begin
   if ((LowInt <= aInt) and (HighInt >= aInt)) then
      Self := TDataKind(aInt);
end;


function TDataKindHelper.HighInt: Longint;
begin
   Result := Ord (High (TDataKind));
end;


function TDataKindHelper.LowInt: Longint;
begin
   Result := Ord (Low (TDataKind));
end;


function TDataKindHelper.ToInt: Longint;
begin
   Result := Ord (Self);
end;


function TDataKindHelper.ToString: String;
begin
   Result := GetEnumName (TypeInfo(TDataKind), LongInt(Self));
end;


class function TDataKindHelper.ToString (Value :TDataKind): String;
begin
   Result := Value.ToString();
end;







{ TCurrMatch }

constructor TCurrMatch.Create;
begin
   RecID       := 0;
   Title       := '';
   Home        := True;;
   PlayDate    := 0;
   PlayNumber  := '';
   Referee1    := '';
   Referee2    := '';
   Location    := '';
   Day         := '';
   MatchStatus := msNotPlayed;
   MyTeam      := TMatchTeam.Create (True);
   OppTeam     := TMatchTeam.Create (False);
   MatchOpen   := False;
   Season      := '';
   Champ       := '';
   Phase1      := '';
   Phase2      := '';
   InternalExcelExportFolder := '';
end;


destructor TCurrMatch.Destroy;
begin
   RecID       := 0;
   Title       := '';
   Home        := True;;
   PlayDate    := 0;
   PlayNumber  := '';
   Referee1    := '';
   Referee2    := '';
   Location    := '';
   Day         := '';
   Season      := '';
   Champ       := '';
   Phase1      := '';
   Phase2      := '';
   InternalExcelExportFolder := '';
   MyTeam.Free;
   OppTeam.Free;
   inherited;
end;


function TCurrMatch.GetExcelExportFolder :string;
var
   Sss   :string;
begin
   Result := Trim (BSDECfg.Excel_ExportFolder.ValueAsString);
   Sss := Trim (InternalExcelExportFolder);
   if ((Sss <> '') and (DirectoryExists (Sss))) then
      Result := Sss;
   Result := AddSlash (Result);
end;


procedure TCurrMatch.ReadFromDB;
begin
   ReadFromDB (RecID);
end;


procedure TCurrMatch.ReadFromDB (aID :Integer);
var
   Sss   :string;
   S2    :string;
   Lst   :TStringList;
   Xxx   :Longint;
   Ms    :TMemoryStream;
   function GetBit (aStr :string;
                    aPos :Integer) :Boolean;
   begin
      Result := False;
      if (aStr.Length >= aPos) then
         Result := (aStr[aPos] = '1');
   end;
begin
   if (InDBSaving) then
   begin
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Notify, '[TCurrMatch.ReadFromDB(%d)] Operation delayed because a saving operation is in progress. Try to wait.', [aID]);
      DelayAndProcess (1500);
   end;
   if (InDBSaving) then
   begin
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Notify, '[TCurrMatch.ReadFromDB(%d)] Operation skipped because a saving operation is in progress', [aID]);
      Exit;
   end;
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TCurrMatch.ReadFromDB (%d)', [aID]);
   LogOperation := False;
   try
      try
         if (not DMod.TblMatchHeader.Locate ('ID', aID)) then
         begin
            Exit;
         end;
         RecID       := aID;
         Title       := DMod.TblMatchHeaderTitle.AsString;
         Home        := DMod.TblMatchHeaderHome.AsBoolean;
         PlayDate    := DMod.TblMatchHeaderPlayDate.AsDateTime;
         PlayNumber  := DMod.TblMatchHeaderNumber.AsString;
         Referee1    := DMod.TblMatchHeaderReferee1.AsString;
         Referee2    := DMod.TblMatchHeaderReferee2.AsString;
         Location    := DMod.TblMatchHeaderLocation.AsString;
         Day         := DMod.TblMatchHeaderDay.AsString;
         MyTeam.ReadFromDB (DMod.TblMatchHeaderLinkMyTeam.AsInteger, aID);
         OppTeam.ReadFromDB (DMod.TblMatchHeaderLinkOpponentTeam.AsInteger, aID);
         MyTeam.HeadCoach   := DMod.TblMatchHeaderMyCoach1.AsString;
         MyTeam.Assistent1  := DMod.TblMatchHeaderMyCoach2.AsString;
         MyTeam.Color       := DMod.TblMatchHeaderMyTeamColor.AsInteger;
         OppTeam.HeadCoach  := DMod.TblMatchHeaderOppCoach1.AsString;
         OppTeam.Assistent1 := DMod.TblMatchHeaderOppCoach2.AsString;
         OppTeam.Color      := DMod.TblMatchHeaderOppTeamColor.AsInteger;
         Sss := DMod.TblMatchHeaderMyTeamTimeout.AsString;
         MyTeam.Timeout1[1] := GetBit (Sss, 1);
         MyTeam.Timeout1[2] := GetBit (Sss, 2);
         MyTeam.Timeout2[1] := GetBit (Sss, 3);
         MyTeam.Timeout2[2] := GetBit (Sss, 4);
         MyTeam.Timeout2[3] := GetBit (Sss, 5);
         MyTeam.TimeoutExtra[1] := GetBit (Sss, 6);
         MyTeam.TimeoutExtra[2] := GetBit (Sss, 7);
         MyTeam.TimeoutExtra[3] := GetBit (Sss, 8);
         MyTeam.TimeoutExtra[4] := GetBit (Sss, 9);
         MyTeam.DeltaRes := DMod.TblMatchHeaderMyResultDelta.AsInteger;
         Sss := DMod.TblMatchHeaderOppoTeamTimeout.AsString;
         OppTeam.Timeout1[1] := GetBit (Sss, 1);
         OppTeam.Timeout1[2] := GetBit (Sss, 2);
         OppTeam.Timeout2[1] := GetBit (Sss, 3);
         OppTeam.Timeout2[2] := GetBit (Sss, 4);
         OppTeam.Timeout2[3] := GetBit (Sss, 5);
         OppTeam.TimeoutExtra[1] := GetBit (Sss, 6);
         OppTeam.TimeoutExtra[2] := GetBit (Sss, 7);
         OppTeam.TimeoutExtra[3] := GetBit (Sss, 8);
         OppTeam.TimeoutExtra[4] := GetBit (Sss, 9);
         OppTeam.DeltaRes := DMod.TblMatchHeaderOppResultDelta.AsInteger;
         MatchStatus.SetFrom (DMod.TblMatchHeaderMatchStatus.AsInteger);
         if (DMod.TblPhase.Locate ('ID', DMod.TblMatchHeaderLinkPhase.AsInteger)) then
         begin
            Phase1   := DMod.TblPhaseDispName.AsString;
            Phase2   := DMod.TblPhaseAbbrev.AsString;;
            Champ    := DMod.TblPhaseChampName.AsString;
            Season   := BSDECfg.CurrSeasonName;
            InternalExcelExportFolder  := Trim (DMod.TblPhaseExcelExportFolder.AsString);
         end;
         //
         // A database Blob field contains a string list stream
         Lst   := TStringList.Create;
         Ms    := TMemoryStream.Create;
         Ms.Position := 0;
         DMod.TblMatchHeaderMatchEventsFile.SaveToStream (Ms);
         Ms.Position := 0;
         Lst.LoadFromStream (Ms);
         OpList.Clear;
         for Xxx:=0 to Pred(Lst.Count) do
         begin
            S2 := Lst[Xxx];
            OpList.AddNoSort (TOperation.Create (S2, MyTeam, OppTeam));
         end;
         OpList.Refresh;
         Ms.Free;
         Lst.Free;
         //
         // A database Blob field contains an XML stream
         // The XMl contains all information about match
         Ms := TMemoryStream.Create;
         try
            Ms.Position := 0;
            DMod.TblMatchHeaderMatchDataFile.SaveToStream (Ms);
            Ms.Position := 0;
            if (Ms.Size > 1) then
               LoadFromStream (Ms);
         finally
            Ms.Free;
         end;
         //
         SetInCampoFromDB;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TCurrMatch.ReadFromDB] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogOperation := True;
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TCurrMatch.ReadFromDB', []);
   end;
end;


function  TCurrMatch.FillDbFields: Boolean;
var
   Res   :Boolean;
   EIdx  :LongInt;
   Sss   :String;
   Xxx   :LongInt;
   Ms1   :TMemoryStream;
   Ms2   :TMemoryStream;
   Lst   :TStringList;
begin
   Res := True;
   Ms1   := Nil;
   Ms2   := Nil;
   EIdx := 1;
   try
      try
         Ms1   := TMemoryStream.Create;
         Ms2   := TMemoryStream.Create;
         EIdx := 100;
         DMod.TblMatchHeaderMyTeamPoints.AsInteger    := MyTeam.Punti;
         DMod.TblMatchHeaderOppTeamPoints.AsInteger   := OppTeam.Punti;
         DMod.TblMatchHeaderTitle.AsString         := Title;
         DMod.TblMatchHeaderHome.AsBoolean         := Home;
         DMod.TblMatchHeaderPlayDate.AsDateTime    := PlayDate;
         DMod.TblMatchHeaderNumber.AsString        := PlayNumber;
         DMod.TblMatchHeaderReferee1.AsString      := Referee1;
         DMod.TblMatchHeaderReferee2.AsString      := Referee2;
         DMod.TblMatchHeaderLocation.AsString      := Location;
         DMod.TblMatchHeaderDay.AsString           := Day;
         DMod.TblMatchHeaderMatchStatus.AsInteger  := MatchStatus.ToInt();
         Sss := '000000000';
         if (MyTeam.Timeout1[1]) then
            Sss[1] := '1';
         if (MyTeam.Timeout1[2]) then
            Sss[2] := '1';
         if (MyTeam.Timeout2[1]) then
            Sss[3] := '1';
         if (MyTeam.Timeout2[2]) then
            Sss[4] := '1';
         if (MyTeam.Timeout2[3]) then
            Sss[5] := '1';
         if (MyTeam.TimeoutExtra[1]) then
            Sss[6] := '1';
         if (MyTeam.TimeoutExtra[2]) then
            Sss[7] := '1';
         if (MyTeam.TimeoutExtra[3]) then
            Sss[8] := '1';
         if (MyTeam.TimeoutExtra[4]) then
            Sss[9] := '1';
         DMod.TblMatchHeaderMyTeamTimeout.AsString    := sss;
         DMod.TblMatchHeaderMyResultDelta.AsInteger   := MyTeam.DeltaRes;
         DMod.TblMatchHeaderMyTeamColor.AsInteger     := MyTeam.Color;
         DMod.TblMatchHeaderMyCoach1.AsString         := MyTeam.HeadCoach;
         DMod.TblMatchHeaderMyCoach2.AsString         := MyTeam.Assistent1;
         Sss := '000000000';
         if (OppTeam.Timeout1[1]) then
            Sss[1] := '1';
         if (OppTeam.Timeout1[2]) then
            Sss[2] := '1';
         if (OppTeam.Timeout2[1]) then
            Sss[3] := '1';
         if (OppTeam.Timeout2[2]) then
            Sss[4] := '1';
         if (OppTeam.Timeout2[3]) then
            Sss[5] := '1';
         if (OppTeam.TimeoutExtra[1]) then
            Sss[6] := '1';
         if (OppTeam.TimeoutExtra[2]) then
            Sss[7] := '1';
         if (OppTeam.TimeoutExtra[3]) then
            Sss[8] := '1';
         if (OppTeam.TimeoutExtra[4]) then
            Sss[9] := '1';
         DMod.TblMatchHeaderOppoTeamTimeout.AsString  := Sss;
         DMod.TblMatchHeaderOppResultDelta.AsInteger  := OppTeam.DeltaRes;
         DMod.TblMatchHeaderOppTeamColor.AsInteger    := OppTeam.Color;
         DMod.TblMatchHeaderOppCoach1.AsString        := OppTeam.HeadCoach;
         DMod.TblMatchHeaderOppCoach2.AsString        := OppTeam.Assistent1;
         EIdx := 110;
         //
         Sss := '';
         for Xxx:=0 to Pred(MyTeam.Roster.Count) do
         begin
            if (TMatchPlayer(MyTeam.Roster[Xxx]).InGioco) then
               Sss := Sss + TMatchPlayer(MyTeam.Roster[Xxx]).PlayerRecID.ToString() + #13#10;
         end;
         DMod.TblMatchHeaderMyTeamInCampo.AsString := Sss;
         EIdx := 120;
         //
         Sss := '';
         for Xxx:=0 to Pred(OppTeam.Roster.Count) do
         begin
            if (TMatchPlayer(OppTeam.Roster[Xxx]).InGioco) then
               Sss := Sss + TMatchPlayer(OppTeam.Roster[Xxx]).PlayerRecID.ToString() + #13#10;
         end;
         DMod.TblMatchHeaderOppoTeamInCampo.AsString := Sss;
         EIdx := 130;
         //
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Notify, '[TCurrMatch.FillDbFields] MyTeam.Quarter.SaveToDB', []);
         for Xxx:=0 to 7 do
            MyTeam.Quarto[xxx].SaveToDB (RecID, Xxx+1, True);
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Notify, '[TCurrMatch.FillDbFields] OppTeam.Quarter.SaveToDB', []);
         for Xxx:=0 to 7 do
            OppTeam.Quarto[xxx].SaveToDB (RecID, Xxx+1, False);
         EIdx := 140;
         //
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Notify, '[TCurrMatch.FillDbFields] Save events into blob', []);
         Lst := TStringList.Create;
         for Xxx:=0 to Pred(OpList.Count) do
            Lst.Add(OpList.Items[Xxx].ToString);
         Lst.SaveToStream(Ms1);
         Ms1.Position := 0;
         DMod.TblMatchHeaderMatchEventsFile.LoadFromStream (Ms1);
         Lst.Free;
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Notify, '[TCurrMatch.FillDbFields] Save data into blob', []);
         SaveToStream(Ms2);
         Ms2.Position := 0;
         DMod.TblMatchHeaderMatchDataFile.LoadFromStream (Ms2);
         EIdx := 150;
      except
         on E:Exception do
         begin
            Res := False;
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TCurrMatch.FillDbFields] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      if (Ms1 <> Nil) then
         Ms1.Free;
      if (Ms2 <> Nil) then
         Ms2.Free;
      Result := Res;
   end;
end;


procedure TCurrMatch.SaveToDB (aFullSave :Boolean);
var
   Lst   :TStringList;
   Xxx   :Longint;
   Ms1   :TMemoryStream;
   Ms2   :TMemoryStream;
   EIdx  :LongInt;
   SaveRis  :Boolean;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TCurrMatch.SaveToDB ()', []);
   DMod.TblSeasons.DisableControls;
   DMod.TblChamp.DisableControls;
   DMod.TblMatchEvents.DisableControls;
   DMod.TblMatchHeader.DisableControls;
   DMod.TblMatchRoster.DisableControls;
   DMod.TblPhase.DisableControls;
   DMod.TblPlayer.DisableControls;
   DMod.TblPlayerStats.DisableControls;
   DMod.TblQuarter.DisableControls;
   DMod.TblTeam.DisableControls;
   try
      Lst   := Nil;
      Ms1   := Nil;
      Ms2   := Nil;
      if (InDBSaving) then
      begin
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Notify, '[TCurrMatch.SaveToDB] Operation skipped because alredy in progress', []);
         Exit;
      end;
      if (LastSaveTimeLessThan (2000)) then
      begin
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Notify, '[TCurrMatch.SaveToDB] Operation skipped because done just now', []);
         Exit;
      end;
      EIdx := 0;
      LastSaveTime := GetMillisecCount();
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TCurrMatch.SaveToDB (FullSave:%s)', [BoolToStr(aFullSave)]);
      InDBSaving := True;
      Lst   := TStringList.Create;
      Ms1   := TMemoryStream.Create;
      Ms2   := TMemoryStream.Create;
      EIdx := 1;
      try
         try
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Debug, '[TCurrMatch.SaveToDB] Locating record %d...', [RecID]);
            EIdx := 2;
            if (IsDBOk() < 1) then
            begin
               LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Warning, '[TCurrMatch.SaveToDB] Database is not ready', []);
               try
                  DMod.TblMatchHeader.Close;
                  DelayAndProcess(10);
                  DMod.TblMatchHeader.Open;
               except
               end;
               EIdx := 4;
               if (IsDBOk() < 1) then
               begin
                  LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Warning, '[TCurrMatch.SaveToDB] Database is still not ready', []);
                  Exit;
               end;
            end;
            EIdx := 7;
            //if (not DMod.TblMatchHeader.Locate ('ID', RecID)) then
            if (FindRecord(RecID) < 1) then
            begin
               LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Warning, '[TCurrMatch.SaveToDB] Record ID %d not found in database', [RecID]);
               Exit;
            end;
            EIdx := 10;
            // Events are stored into a stringlist
            // String list is saved into a stream and the stream is stored into a Blob field of database
            for Xxx:=0 to Pred(OpList.Count) do
               Lst.Add (OpList.Items[Xxx].ToString);
            EIdx := 20;
            Lst.SaveToStream (Ms1);
            Ms1.Position := 0;
            EIdx := 30;
            // Match is also stored into an XML file
            // XML is saved into a (memory) stream and the stream is stored into a Blob field of database
            SaveToStream (Ms2);
            Ms2.Position := 0;
            EIdx := 40;
            //
            DMod.TblMatchHeader.Edit;
            try
               EIdx := 41;
               SaveRis := FillDbFields();
               EIdx := 42;
            except
               SaveRis := False;
            end;
            EIdx := 43;
            if (SaveRis) then
            begin
               EIdx := 44;
               try
                  DMod.TblMatchHeader.Post;
                  EIdx := 45;
               except
                  SaveRis := False;
               end;
               if (not SaveRis) then
               begin
                  LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Error, '[TCurrMatch.SaveToDB] Something gone wrong in DB saving', []);
                  LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Error, '[TCurrMatch.SaveToDB]    Try to close and reopen database', []);
                  EIdx := 46;
                  DelayAndProcess(200);
                  DMod.CloseAndReopenAll();
                  DelayAndProcess(200);
                  LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Notify, '[TCurrMatch.SaveToDB] Database reopened', []);
                  EIdx := 47;
                  //
                  Exit;
               end;
            end
            else
            begin
               EIdx := 50;
               try
                  LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Error, '[TCurrMatch.SaveToDB] Something gone wrong in DB saving', []);
                  LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Error, '[TCurrMatch.SaveToDB]    ... retrying next time', []);
                  DMod.TblMatchHeader.Cancel;
                  EIdx := 51;
                  Exit;
               except
               end;
               EIdx := 52;
            end;
            EIdx := 55;
            //
            if (aFullSave) then
            begin
               EIdx := 60;
               LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Notify, '[TCurrMatch.SaveToDB] Save quintetti into DB', []);
               try
                  MyTeam.SaveToDB;
               except
               end;
               try
                  OppTeam.SaveToDB;
               except
               end;
            end;
            EIdx := 70;
         except
            on E:Exception do
            begin
               UpdateExceptionCounter;
               LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TCurrMatch.SaveToDB] Exception at %d: "%s"', [EIdx, E.Message]);
            end;
         end;
      finally
         if (Lst <> nil) then
            Lst.Free;
         if (Ms1 <> nil) then
            Ms1.Free;
         if (Ms2 <> nil) then
            Ms2.Free;
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TCurrMatch.SaveToDB', []);
         InDBSaving := False;
         LastSaveTime := GetMillisecCount();
      end;
   finally
      DMod.TblSeasons.EnableControls;
      DMod.TblChamp.EnableControls;
      DMod.TblMatchEvents.EnableControls;
      DMod.TblMatchHeader.EnableControls;
      DMod.TblMatchRoster.EnableControls;
      DMod.TblPhase.EnableControls;
      DMod.TblPlayer.EnableControls;
      DMod.TblPlayerStats.EnableControls;
      DMod.TblQuarter.EnableControls;
      DMod.TblTeam.EnableControls;
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TCurrMatch.SaveToDB ()', []);
   end;
end;


procedure TCurrMatch.SaveToStream (aStream :TStream);
var
   ADoc        :TNativeXml;
   aRootNode   :TXmlNode;
   aNode1      :TXmlNode;
   Prefix      :String;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TCurrMatch.SaveToStream ()', []);
   try
      try
         try
            ADoc := TNativeXml.CreateName ('BasketScoutDreamEVODataFile');
         except
            aDoc := Nil;
         end;
         if (aDoc = Nil) then
            Exit;
         aRootNode := aDoc.Root;
         aDoc.CommentString := 'WebPorter';
         Prefix := '/Match';
         //
         aDoc.XmlFormat := xfReadable;
         aDoc.UseFullNodes := True;
         //
         aStream.Position := 0;
         aNode1 := CreateNodeLink (aRootNode, Prefix+'/MyTeam', '');
         MyTeam.SaveToStream (aStream, aNode1);
         aNode1 := CreateNodeLink (aRootNode, Prefix+'/OpponentTeam', '');
         OppTeam.SaveToStream (aStream, aNode1);
         //
         try
            if (aDoc <> Nil) then
            begin
               aDoc.SaveToStream (aStream);
               FreeAndNil (aDoc);
            end;
         except
         end;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TCurrMatch.SaveToStream] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TCurrMatch.SaveToStream', []);
   end;
end;


procedure TCurrMatch.SetInCampoFromDB;
var
   Sss   :string;
   Lst   :TStringList;
   Num   :LongInt;
   Xxx   :Longint;
   Plr   :TMatchPlayer;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TCurrMatch.SetInCampoFromDB ()', []);
   try
      try
         Sss := Trim (DMod.TblMatchHeaderMyTeamInCampo.AsString);
         if (Sss <> '') then
         begin
            for Xxx:=0 to Pred(MyTeam.Roster.Count) do
               TMatchPlayer(MyTeam.Roster[Xxx]).InGioco := False;
            Lst := TStringList.Create;
            try
               SeparaTokens (Sss, #13#10, Lst);
               for Xxx:=0 to Pred(Lst.Count) do
               begin
                  Sss := Trim (Lst[xxx]);
                  Num := StrToIntDef (Sss, 0);
                  if (Num > 0) then
                  begin
                     Plr := MyTeam.PlayerByID (Num);
                     if (Plr <> Nil) then
                        Plr.InGioco := True;
                  end;
               end;
            finally
               Lst.Free;
            end;
         end;
         //
         Sss := Trim (DMod.TblMatchHeaderOppoTeamInCampo.AsString);
         if (Sss <> '') then
         begin
            for Xxx:=0 to Pred(OppTeam.Roster.Count) do
               TMatchPlayer(OppTeam.Roster[Xxx]).InGioco := False;
            Lst := TStringList.Create;
            try
               SeparaTokens (Sss, #13#10, Lst);
               for Xxx:=0 to Pred(Lst.Count) do
               begin
                  Sss := Trim (Lst[xxx]);
                  Num := StrToIntDef (Sss, 0);
                  if (Num > 0) then
                  begin
                     Plr := OppTeam.PlayerByID (Num);
                     if (Plr <> Nil) then
                        Plr.InGioco := True;
                  end;
               end;
            finally
               Lst.Free;
            end;
         end;
         //
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TCurrMatch.SetInCampoFromDB] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TCurrMatch.SetInCampoFromDB', []);
   end;
end;


function TCurrMatch.GetLastExcelFile: string;
var
   Bk :TBookmark;
begin
   Result := '';
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TCurrMatch.GetLastExcelFile ()', []);
   try
      try
         Bk := DMod.TblMatchHeader.GetBookmark;
         try
            if (DMod.TblMatchHeader.Locate ('ID', Self.RecID, [])) then
            begin
               Result := Trim (DMod.TblMatchHeaderExcelFile.asString);
            end;
         finally
            DMod.TblMatchHeader.GotoBookmark (Bk);
            DMod.TblMatchHeader.FreeBookmark (Bk);
         end;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TCurrMatch.GetLastExcelFile] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TCurrMatch.GetLastExcelFile', []);
   end;
end;


procedure TCurrMatch.ImportFromOldFormat(aFn: string);
var
   aStream     :TStream;
   ADoc        :TNativeXml;
   aRootNode   :TXmlNode;
   aNode1      :TXmlNode;
   Prefix      :String;
   Dt          :Integer;
   Xxx         :Longint;
   Yyy         :Longint;
   Plr         :TOldFormatPlayer;
   NewPlr      :TMatchPlayer;
   MyPlayers   :TObjectList;
   OppPlayers  :TObjectList;
   aID         :LongInt;
   Ris         :LongInt;
   TblMRFltB   :Boolean;
   TblMRFltS   :string;
   TblPlFltB   :Boolean;
   TblPlFltS   :string;
   Found       :Boolean;
   ToAdd       :Boolean;
   MHID        :Longint;

   function CleanName (aStr :string) :string;
   var
      Ppp   :LongInt;
   begin
      Result := aStr;
      Ppp := Pos ('(K)', UpperCase(aStr));
      if (Ppp > 0) then
         aStr := Copy (aStr, 1, Ppp-1)+Copy (aStr, Ppp+3, 1000);
      Ppp := Pos ('(C)', UpperCase(aStr));
      if (Ppp > 0) then
         aStr := Copy (aStr, 1, Ppp-1)+Copy (aStr, Ppp+3, 1000);
      Ppp := Pos ('@', UpperCase(aStr));
      if (Ppp > 0) then
         aStr := Copy (aStr, 1, Ppp-1)+Copy (aStr, Ppp+1, 1000);
      Result := Trim (aStr);
   end;

begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TCurrMatch.ImportFromOldFormat (%s)', [aFn]);
   try
      try
         if (not FileExists (aFn)) then
            Exit;
         //RecID       :Longint;
         //Title       :String;
         //Home        :Boolean;
         //PlayDate    :TDate;
         //MatchOpen   :Boolean;
         //Season      :String;
         //Champ       :String;
         //Phase1      :String;
         //Phase2      :String;
         //PlayNumber  := '';
         Referee1    := '';
         Referee2    := '';
         //Location    := '';
         //Day         := '';
         MatchStatus := msPlaying;
         MyTeam.ResetMatchData;
         OppTeam.ResetMatchData;
         //
         aStream := TFileStream.Create (aFn, fmOpenRead);
         MyPlayers   := TObjectList.Create;
         OppPlayers  := TObjectList.Create;
         TblMRFltB := DMod.TblMatchRoster.Filtered;
         TblMRFltS := DMod.TblMatchRoster.Filter;
         TblPlFltB := DMod.TblPlayer.Filtered;
         TblPlFltS := DMod.TblPlayer.Filter;
         try
            ADoc := TNativeXml.CreateName ('BasketScoutDreamDataFile');
            aRootNode := aDoc.Root;
            aDoc.CommentString := 'SmileSoft';
            Prefix := '/Match';
            //
            aDoc.XmlFormat := xfReadable;
            aDoc.XmlFormat := xfReadable;
            aDoc.LoadFromStream (aStream);
            aDoc.XmlFormat := xfReadable;
            aRootNode := aDoc.Root;
            //Campionato := CreateNodeLink (aRootNode, Prefix+'/Campionato', '').ValueAsString;
            //Fase := CreateNodeLink (aRootNode, Prefix+'/Fase', '').ValueAsString;
            //Girone := CreateNodeLink (aRootNode, Prefix+'/Girone', '').ValueAsString;
            //Giornata := CreateNodeLink (aRootNode, Prefix+'/Giornata', '').ValueAsString;
            //Location := CreateNodeLink (aRootNode, Prefix+'/Location', '').ValueAsString;
            //Dt := CreateNodeLink (aRootNode, Prefix+'/Data', '0').ValueAsInteger;
            //MatchDate := Dt;
            //Home := CreateNodeLink (aRootNode, Prefix+'/InCasa', 'True').ValueAsBool;
            Xxx := CreateNodeLink (aRootNode, Prefix+'/Data', '0').ValueAsInteger;
            PlayDate := Xxx;
            Referee1 := CreateNodeLink (aRootNode, Prefix+'/Descrizione', '').ValueAsString;
            ///
            MyTeam.Timeout1[1] := CreateNodeLink (aRootNode, Prefix+'/MyTeam/Timeouts/1Tempo/1', 'False').ValueAsBool;
            MyTeam.Timeout1[2] := CreateNodeLink (aRootNode, Prefix+'/MyTeam/Timeouts/1Tempo/2', 'False').ValueAsBool;
            MyTeam.Timeout2[1] := CreateNodeLink (aRootNode, Prefix+'/MyTeam/Timeouts/2Tempo/1', 'False').ValueAsBool;
            MyTeam.Timeout2[2] := CreateNodeLink (aRootNode, Prefix+'/MyTeam/Timeouts/2Tempo/2', 'False').ValueAsBool;
            MyTeam.Timeout2[3] := CreateNodeLink (aRootNode, Prefix+'/MyTeam/Timeouts/2Tempo/3', 'False').ValueAsBool;
            MyTeam.TimeoutExtra[1] := CreateNodeLink (aRootNode, Prefix+'/MyTeam/Timeouts/Extra/1', 'False').ValueAsBool;
            MyTeam.TimeoutExtra[2] := CreateNodeLink (aRootNode, Prefix+'/MyTeam/Timeouts/Extra/2', 'False').ValueAsBool;
            MyTeam.TimeoutExtra[3] := CreateNodeLink (aRootNode, Prefix+'/MyTeam/Timeouts/Extra/3', 'False').ValueAsBool;
            MyTeam.TimeoutExtra[4] := CreateNodeLink (aRootNode, Prefix+'/MyTeam/Timeouts/Extra/4', 'False').ValueAsBool;
            MyTeam.HeadCoach  := CreateNodeLink (aRootNode, Prefix+'/MyTeam/Allenatore', '').ValueAsString;
            MyTeam.Assistent1 := CreateNodeLink (aRootNode, Prefix+'/MyTeam/Vice', '').ValueAsString;
            for Xxx:=1 to CreateNodeLink (aRootNode, Prefix+'/MyTeam/TotPlayers', '0').ValueAsInteger do
            begin
               aNode1 := CreateNodeLink (aRootNode, Prefix+'/MyTeam/Player'+IntToStr(Xxx), '');
               Plr := TOldFormatPlayer.Create;
               Plr.LoadFromStream (aNode1, aStream);
               MyPlayers.Add (Plr);
            end;
            //
            //
            OppTeam.Timeout1[1] := CreateNodeLink (aRootNode, Prefix+'/OpponentTeam/Timeouts/1Tempo/1', 'False').ValueAsBool;
            OppTeam.Timeout1[2] := CreateNodeLink (aRootNode, Prefix+'/OpponentTeam/Timeouts/1Tempo/2', 'False').ValueAsBool;
            OppTeam.Timeout2[1] := CreateNodeLink (aRootNode, Prefix+'/OpponentTeam/Timeouts/2Tempo/1', 'False').ValueAsBool;
            OppTeam.Timeout2[2] := CreateNodeLink (aRootNode, Prefix+'/OpponentTeam/Timeouts/2Tempo/2', 'False').ValueAsBool;
            OppTeam.Timeout2[3] := CreateNodeLink (aRootNode, Prefix+'/OpponentTeam/Timeouts/2Tempo/3', 'False').ValueAsBool;
            OppTeam.TimeoutExtra[1] := CreateNodeLink (aRootNode, Prefix+'/OpponentTeam/Timeouts/Extra/1', 'False').ValueAsBool;
            OppTeam.TimeoutExtra[2] := CreateNodeLink (aRootNode, Prefix+'/OpponentTeam/Timeouts/Extra/2', 'False').ValueAsBool;
            OppTeam.TimeoutExtra[3] := CreateNodeLink (aRootNode, Prefix+'/OpponentTeam/Timeouts/Extra/3', 'False').ValueAsBool;
            OppTeam.TimeoutExtra[4] := CreateNodeLink (aRootNode, Prefix+'/OpponentTeam/Timeouts/Extra/4', 'False').ValueAsBool;
            OppTeam.HeadCoach  := CreateNodeLink (aRootNode, Prefix+'/OpponentTeam/Allenatore', '').ValueAsString;
            OppTeam.Assistent1 := CreateNodeLink (aRootNode, Prefix+'/OpponentTeam/Vice', '').ValueAsString;
            for Xxx:=1 to CreateNodeLink (aRootNode, Prefix+'/OpponentTeam/TotPlayers', '0').ValueAsInteger do
            begin
               aNode1 := CreateNodeLink (aRootNode, Prefix+'/OpponentTeam/Player'+IntToStr(Xxx), '');
               Plr := TOldFormatPlayer.Create;
               Plr.LoadFromStream (aNode1, aStream);
               OppPlayers.Add (Plr);
            end;
            //
            //
            // Elimino tutti i record del match nel roster prima di aggiungere quelli nuovi
            DMod.TblMatchRoster.Filtered := False;
            DMod.TblMatchRoster.Filter := Format ('(LinkMatchHeader = %d)', [CurrMatch.RecID]);
            DMod.TblMatchRoster.Filtered := True;
            DMod.TblMatchRoster.First;
            while (DMod.TblMatchRoster.RecordCount > 0) do
               DMod.TblMatchRoster.Delete;
            DMod.TblMatchRoster.Filtered := False;
            MyTeam.Roster.Clear;
            for Xxx:=0 to Pred(MyPlayers.Count) do
            begin
               ToAdd := False;
               Plr := TOldFormatPlayer(MyPlayers.Items[xxx]);
               if ((Plr.NomeDisp.Trim() <> '') and (Plr.NumMaglia >= 0)) then
               begin
                  Ris := ImportPlayer (Plr, MyTeam.TeamRecID, MyTeam.Name, MyTeam.Color, aID);
                  case Ris of
                     ImportPlayerRes_Selected:
                     begin
                        DMod.TblPlayer.Filtered := False;
                        DMod.TblPlayer.First;
                        Found := DMod.TblPlayer.Locate('ID', aID);
                        DMod.TblMatchRoster.Append;
                        try
                           DMod.TblMatchRosterLinkMatchHeader.AsInteger := CurrMatch.RecID;
                           DMod.TblMatchRosterQuintetto.AsBoolean       := Plr.Quintetto;
                           DMod.TblMatchRosterCaptain.AsBoolean         := ((Pos ('(K)', UpperCase(Plr.NomeDisp)) > 0) or (Pos ('(C)', UpperCase(Plr.NomeDisp)) > 0) or (Pos ('@', Plr.NomeDisp) > 0));
                           DMod.TblMatchRosterIsMyTeam.AsBoolean        := True;
                           DMod.TblMatchRosterLinkPlayer.AsInteger      := aID;
                           DMod.TblMatchRosterPlayNumber.AsString       := Plr.NumMaglia.ToString();
                           DMod.TblMatchRosterDbgMatch.AsString         := CurrMatch.Title;
                           DMod.TblMatchRosterDbgPlayer.AsString        := IIF (Found, DMod.TblPlayerDispName.AsString, Plr.NomeDisp);
                        finally
                           DMod.TblMatchRoster.Post;
                           MHID := DMod.TblMatchRosterID.AsInteger;
                           ToAdd := True;
                        end;
                     end;
                     ImportPlayerRes_Created:
                     begin
                        aID:= 0;
                        DMod.TblPlayer.Append;
                        try
                           DMod.TblPlayerLinkTeam.AsInteger    := MyTeam.TeamRecID;
                           DMod.TblPlayerLastName.AsString     := '';
                           DMod.TblPlayerFirstName.AsString    := '';
                           DMod.TblPlayerDispName.AsString     := CleanName (Plr.NomeDisp);
                           DMod.TblPlayerBirthYear.AsString    := '';
                           DMod.TblPlayerPlayNumber.AsString   := Plr.NumMaglia.ToString();
                        finally
                           DMod.TblPlayer.Post;
                           aID := DMod.TblPlayerID.AsInteger;
                        end;
                        if (aID > 0) then
                        begin
                           Found := DMod.TblPlayer.Locate('ID', aID);
                           DMod.TblMatchRoster.Append;
                           try
                              DMod.TblMatchRosterLinkMatchHeader.AsInteger := CurrMatch.RecID;
                              DMod.TblMatchRosterQuintetto.AsBoolean       := Plr.Quintetto;
                              DMod.TblMatchRosterCaptain.AsBoolean         := ((Pos ('(K)', UpperCase(Plr.NomeDisp)) > 0) or (Pos ('(C)', UpperCase(Plr.NomeDisp)) > 0) or (Pos ('@', Plr.NomeDisp) > 0));
                              DMod.TblMatchRosterIsMyTeam.AsBoolean        := True;
                              DMod.TblMatchRosterLinkPlayer.AsInteger      := aID;
                              DMod.TblMatchRosterPlayNumber.AsString       := Plr.NumMaglia.ToString();
                              DMod.TblMatchRosterDbgMatch.AsString         := CurrMatch.Title;
                              DMod.TblMatchRosterDbgPlayer.AsString        := IIF (Found, DMod.TblPlayerDispName.AsString, Plr.NomeDisp);
                           finally
                              DMod.TblMatchRoster.Post;
                              MHID := DMod.TblMatchRosterID.AsInteger;
                              ToAdd := True;
                           end;
                        end;
                     end;
                  end;
                  //
                  if (ToAdd) then
                  begin
                     DMod.TblMatchRoster.Locate('ID', MHID);
                     NewPlr := TMatchPlayer.Create;
                     NewPlr.RosterRecID   := DMod.TblMatchRosterID.AsInteger;
                     NewPlr.PlayerRecID   := DMod.TblMatchRosterLinkPlayer.AsInteger;
                     NewPlr.PlayNumber    := DMod.TblMatchRosterPlayNumber.AsString;
                     NewPlr.Name          := DMod.TblMatchRosterDbgPlayer.AsString;
                     NewPlr.Captain       := DMod.TblMatchRosterCaptain.AsBoolean;
                     NewPlr.InQuintetto   := DMod.TblMatchRosterQuintetto.AsBoolean;
                     NewPlr.IsMyTeam      := DMod.TblMatchRosterIsMyTeam.AsBoolean;
                     //
                     NewPlr.TempoGioco := Plr.TempoGioco;
                     //NewPlr.FalliSubiti   :LongInt;
                     //NewPlr.Realizzazioni :TObjectList;
                     NewPlr.RimbAttacco   := Plr.RimbAttacco;
                     NewPlr.RimbDifesa    := Plr.RimbDifesa;
                     NewPlr.PRecuperate   := Plr.PRecuperate;
                     NewPlr.PPerse        := Plr.PPerse;
                     NewPlr.StoppSubite   := Plr.StoppSubite;
                     NewPlr.StoppFatte    := Plr.StoppFatte;
                     NewPlr.Assist        := Plr.Assist;
                     NewPlr.InGioco       := Plr.InGioco;
                     NewPlr.PlusMinus     := Plr.PlusMinus;
                     NewPlr.InQuintetto   := Plr.Quintetto;
                     NewPlr.FalliSubiti   := Plr.FalliSubiti;
                     for Yyy:=1 to 5 do
                     begin
                        NewPlr.fFalliFatti[Yyy].Commesso     := Plr.FalloFatto[Yyy].Commesso;
                        NewPlr.fFalliFatti[Yyy].NumLiberi    := Plr.FalloFatto[Yyy].NumLiberi;
                        NewPlr.fFalliFatti[Yyy].Tecnico      := Plr.FalloFatto[Yyy].Tecnico;
                        NewPlr.fFalliFatti[Yyy].Intenzionale := Plr.FalloFatto[Yyy].Intenzionale;
                        NewPlr.fFalliFatti[Yyy].Espulsione   := Plr.FalloFatto[Yyy].Espulsione;
                        NewPlr.fFalliFatti[Yyy].Quarto       := Plr.FalloFatto[Yyy].Quarto;
                        //NewPlr.fFalliFatti[Yyy].Tempo        := Plr.FalloFatto[Yyy].Commesso;
                     end;
                     NewPlr.ImportRealizzFromOld (Plr);
                     MyTeam.Roster.Add (NewPlr);
                  end;
               end;
            end;
            // Opponent team
            MsgDlg (Str_OpponentTeam_s, [OppTeam.Name]);
            OppTeam.Roster.Clear;
            for Xxx:=0 to Pred(OppPlayers.Count) do
            begin
               ToAdd := False;
               Plr := TOldFormatPlayer(OppPlayers.Items[xxx]);
               if ((Plr.NomeDisp.Trim() <> '') and (Plr.NumMaglia >= 0)) then
               begin
                  Ris := ImportPlayer (Plr, OppTeam.TeamRecID, OppTeam.Name, MyTeam.Color, aID);
                  case Ris of
                     ImportPlayerRes_Selected:
                     begin
                        DMod.TblPlayer.Filtered := False;
                        DMod.TblPlayer.First;
                        Found := DMod.TblPlayer.Locate('ID', aID);
                        DMod.TblMatchRoster.Append;
                        try
                           DMod.TblMatchRosterLinkMatchHeader.AsInteger := CurrMatch.RecID;
                           DMod.TblMatchRosterQuintetto.AsBoolean       := Plr.Quintetto;
                           DMod.TblMatchRosterCaptain.AsBoolean         := ((Pos ('(K)', UpperCase(Plr.NomeDisp)) > 0) or (Pos ('(C)', UpperCase(Plr.NomeDisp)) > 0) or (Pos ('@', Plr.NomeDisp) > 0));
                           DMod.TblMatchRosterIsMyTeam.AsBoolean        := False;
                           DMod.TblMatchRosterLinkPlayer.AsInteger      := aID;
                           DMod.TblMatchRosterPlayNumber.AsString       := Plr.NumMaglia.ToString();
                           DMod.TblMatchRosterDbgMatch.AsString         := CurrMatch.Title;
                           DMod.TblMatchRosterDbgPlayer.AsString        := IIF (Found, DMod.TblPlayerDispName.AsString, Plr.NomeDisp);
                        finally
                           DMod.TblMatchRoster.Post;
                           MHID := DMod.TblMatchRosterID.AsInteger;
                           ToAdd := True;
                        end;
                     end;
                     ImportPlayerRes_Created:
                     begin
                        aID:= 0;
                        DMod.TblPlayer.Append;
                        try
                           DMod.TblPlayerLinkTeam.AsInteger    := OppTeam.TeamRecID;
                           DMod.TblPlayerLastName.AsString     := '';
                           DMod.TblPlayerFirstName.AsString    := '';
                           DMod.TblPlayerDispName.AsString     := CleanName (Plr.NomeDisp);
                           DMod.TblPlayerBirthYear.AsString    := '';
                           DMod.TblPlayerPlayNumber.AsString   := Plr.NumMaglia.ToString();
                        finally
                           DMod.TblPlayer.Post;
                           aID := DMod.TblPlayerID.AsInteger;
                        end;
                        if (aID > 0) then
                        begin
                           Found := DMod.TblPlayer.Locate('ID', aID);
                           DMod.TblMatchRoster.Append;
                           try
                              DMod.TblMatchRosterLinkMatchHeader.AsInteger := CurrMatch.RecID;
                              DMod.TblMatchRosterQuintetto.AsBoolean       := Plr.Quintetto;
                              DMod.TblMatchRosterCaptain.AsBoolean         := ((Pos ('(K)', UpperCase(Plr.NomeDisp)) > 0) or (Pos ('(C)', UpperCase(Plr.NomeDisp)) > 0) or (Pos ('@', Plr.NomeDisp) > 0));
                              DMod.TblMatchRosterIsMyTeam.AsBoolean        := False;
                              DMod.TblMatchRosterLinkPlayer.AsInteger      := aID;
                              DMod.TblMatchRosterPlayNumber.AsString       := Plr.NumMaglia.ToString();
                              DMod.TblMatchRosterDbgMatch.AsString         := CurrMatch.Title;
                              DMod.TblMatchRosterDbgPlayer.AsString        := IIF (Found, DMod.TblPlayerDispName.AsString, Plr.NomeDisp);
                           finally
                              DMod.TblMatchRoster.Post;
                              MHID := DMod.TblMatchRosterID.AsInteger;
                              ToAdd := True;
                           end;
                        end;
                     end;
                  end;
                  //
                  if (ToAdd) then
                  begin
                     DMod.TblMatchRoster.Locate('ID', MHID);
                     NewPlr := TMatchPlayer.Create;
                     NewPlr.RosterRecID   := DMod.TblMatchRosterID.AsInteger;
                     NewPlr.PlayerRecID   := DMod.TblMatchRosterLinkPlayer.AsInteger;
                     NewPlr.PlayNumber    := DMod.TblMatchRosterPlayNumber.AsString;
                     NewPlr.Name          := DMod.TblMatchRosterDbgPlayer.AsString;
                     NewPlr.Captain       := DMod.TblMatchRosterCaptain.AsBoolean;
                     NewPlr.InQuintetto   := DMod.TblMatchRosterQuintetto.AsBoolean;
                     NewPlr.IsMyTeam      := DMod.TblMatchRosterIsMyTeam.AsBoolean;
                     //
                     NewPlr.TempoGioco := Plr.TempoGioco;
                     //NewPlr.FalliSubiti   :LongInt;
                     //NewPlr.Realizzazioni :TObjectList;
                     NewPlr.RimbAttacco   := Plr.RimbAttacco;
                     NewPlr.RimbDifesa    := Plr.RimbDifesa;
                     NewPlr.PRecuperate   := Plr.PRecuperate;
                     NewPlr.PPerse        := Plr.PPerse;
                     NewPlr.StoppSubite   := Plr.StoppSubite;
                     NewPlr.StoppFatte    := Plr.StoppFatte;
                     NewPlr.Assist        := Plr.Assist;
                     NewPlr.InGioco       := Plr.InGioco;
                     NewPlr.PlusMinus     := Plr.PlusMinus;
                     NewPlr.InQuintetto   := Plr.Quintetto;
                     NewPlr.FalliSubiti   := Plr.FalliSubiti;
                     for Yyy:=1 to 5 do
                     begin
                        NewPlr.fFalliFatti[Yyy].Commesso     := Plr.FalloFatto[Yyy].Commesso;
                        NewPlr.fFalliFatti[Yyy].NumLiberi    := Plr.FalloFatto[Yyy].NumLiberi;
                        NewPlr.fFalliFatti[Yyy].Tecnico      := Plr.FalloFatto[Yyy].Tecnico;
                        NewPlr.fFalliFatti[Yyy].Intenzionale := Plr.FalloFatto[Yyy].Intenzionale;
                        NewPlr.fFalliFatti[Yyy].Espulsione   := Plr.FalloFatto[Yyy].Espulsione;
                        NewPlr.fFalliFatti[Yyy].Quarto       := Plr.FalloFatto[Yyy].Quarto;
                        //NewPlr.fFalliFatti[Yyy].Tempo        := Plr.FalloFatto[Yyy].Commesso;
                     end;
                     NewPlr.ImportRealizzFromOld (Plr);
                     OppTeam.Roster.Add (NewPlr);
                  end;
               end;
            end;
            //
            //
            for Xxx:=0 to 7 do
            begin
               MyTeam.Quarto[xxx].Punti       := CreateNodeLink (aRootNode, Prefix+'/MyTeam/Quarto'+IntToStr(Xxx+1)+'/Punti', '0').ValueAsInteger;
               MyTeam.Quarto[xxx].FalliQrt    := CreateNodeLink (aRootNode, Prefix+'/MyTeam/Quarto'+IntToStr(Xxx+1)+'/Falli', '0').ValueAsInteger;
               MyTeam.Quarto[xxx].Bonus       := CreateNodeLink (aRootNode, Prefix+'/MyTeam/Quarto'+IntToStr(Xxx+1)+'/Bonus', 'False').ValueAsBool;
               MyTeam.Quarto[xxx].Status      := TQuarterStatus(CreateNodeLink (aRootNode, Prefix+'/MyTeam/Quarto'+IntToStr(Xxx+1)+'/Stato', '0').ValueAsInteger);
            end;
            for Xxx:=1 to 8 do
               MyTeam.Quintetto[Xxx] := CreateNodeLink (aRootNode, Prefix+'/MyTeam/Quintetto'+IntToStr(Xxx), 'False').ValueAsBool;
            //
            for Xxx:=0 to 7 do
            begin
               OppTeam.Quarto[xxx].Punti       := CreateNodeLink (aRootNode, Prefix+'/OpponentTeam/Quarto'+IntToStr(Xxx+1)+'/Punti', '0').ValueAsInteger;
               OppTeam.Quarto[xxx].FalliQrt    := CreateNodeLink (aRootNode, Prefix+'/OpponentTeam/Quarto'+IntToStr(Xxx+1)+'/Falli', '0').ValueAsInteger;
               OppTeam.Quarto[xxx].Bonus       := CreateNodeLink (aRootNode, Prefix+'/OpponentTeam/Quarto'+IntToStr(Xxx+1)+'/Bonus', 'False').ValueAsBool;
               OppTeam.Quarto[xxx].Status      := TQuarterStatus(CreateNodeLink (aRootNode, Prefix+'/OpponentTeam/Quarto'+IntToStr(Xxx+1)+'/Stato', '0').ValueAsInteger);
            end;
            for Xxx:=1 to 8 do
               OppTeam.Quintetto[Xxx] := CreateNodeLink (aRootNode, Prefix+'/OpponentTeam/Quintetto'+IntToStr(Xxx), 'False').ValueAsBool;
         finally
            aStream.Free;
            FreeAndNil (aDoc);
            MyPlayers.Free;
            OppPlayers.Free;
            DMod.TblMatchRoster.Filter := TblMRFltS;
            DMod.TblMatchRoster.Filtered := TblMRFltB;
            DMod.TblPlayer.Filter := TblPlFltS;
            DMod.TblPlayer.Filtered := TblPlFltB;
         end;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TCurrMatch.ImportFromOldFormat] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TCurrMatch.ImportFromOldFormat', []);
   end;
end;


function TCurrMatch.FindRecord(aID: Integer): Longint;
var
   Rb :Boolean;
   Bb :TBookmark;
begin
   Result := 0;
   Bb := nil;
   try
      try
         if (DMod.TblMatchHeader.Active) then
         begin
            Rb := DMod.TblMatchHeader.Locate ('ID', aID);
            if (not Rb) then
            begin
               DelayAndProcess(5);
               Bb := DMod.TblMatchHeader.GetBookmark;
               DMod.TblMatchHeader.First;
               Rb := DMod.TblMatchHeader.Locate ('ID', aID);
               if ((Not Rb) and (Bb <> Nil)) then
               begin
                  DMod.TblMatchHeader.GotoBookmark(Bb);
                  DMod.TblMatchHeader.FreeBookmark(Bb);
                  Bb := nil;
               end;
            end;
            if (Rb) then
               Result := 1
            else
               Result := 0;
         end;
      except
         Result := -1;
      end;
   finally
      if (Result < 1) then
      begin
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Warning, 'TCurrMatch.FindRecord(%d) : record not found -> %d', [aID, Result]);
      end;
   end;
end;


function TCurrMatch.IsDBOk: LongInt;
begin
   Result := 0;
   try
      try
         if (DMod.TblMatchHeader.Active) then
         begin
            if (not DMod.TblMatchHeader.Bof) then
            begin
               DMod.TblMatchHeader.Prior;
               DMod.TblMatchHeader.Next;
            end;
         end
         else
         begin
            DMod.TblMatchHeader.Open;
         end;
         Result := 1;
      except
         on E:Exception do
         begin
            Result := -1;
         end;
      end;
      //
      if (Result < 0) then
      begin
      end;
   finally
   end;
end;

procedure TCurrMatch.SetLastExcelFile(aFn: string);
var
   Bk :TBookmark;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TCurrMatch.SetLastExcelFile (%s)', [aFn]);
   try
      try
         aFn := Trim (aFn);
         Bk := DMod.TblMatchHeader.GetBookmark;
         try
            if (DMod.TblMatchHeader.Locate ('ID', Self.RecID, [])) then
            begin
               DMod.TblMatchHeader.Edit;
               try
                  DMod.TblMatchHeaderExcelFile.asString := aFn;
               finally
                  DMod.TblMatchHeader.Post;
               end;
            end;
         finally
            DMod.TblMatchHeader.GotoBookmark (Bk);
            DMod.TblMatchHeader.FreeBookmark (Bk);
         end;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TCurrMatch.SetLastExcelFile] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TCurrMatch.SetLastExcelFile', []);
   end;
end;


procedure TCurrMatch.LoadFromStream (aStream :TStream);
var
   ADoc        :TNativeXml;
   aRootNode   :TXmlNode;
   aNode1      :TXmlNode;
   Prefix      :String;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TCurrMatch.LoadFromStream ()', []);
   try
      try
         ADoc := TNativeXml.CreateName ('BasketScoutDreamEVODataFile');
         aRootNode := aDoc.Root;
         aDoc.CommentString := 'WebPorter';
         Prefix := '/Match';
         //
         aDoc.XmlFormat := xfReadable;
         aDoc.LoadFromStream (aStream);
         aDoc.XmlFormat := xfReadable;
         aRootNode := aDoc.Root;
         aNode1 := CreateNodeLink (aRootNode, Prefix+'/MyTeam', '');
         MyTeam.LoadFromStream (aStream, aNode1);
         aNode1 := CreateNodeLink (aRootNode, Prefix+'/OpponentTeam', '');
         OppTeam.LoadFromStream (aStream, aNode1);
         //
         try
            if (aDoc <> Nil) then
               FreeAndNil (aDoc);
         except
         end;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TCurrMatch.LoadFromStream] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TCurrMatch.LoadFromStream', []);
   end;
end;







{ TMatchTeam }

constructor TMatchTeam.Create (aMyTeam :Boolean);
var
   Xxx   :LongInt;
   Qrt   :TQuarterTeam;
begin
   IsMyTeam    := aMyTeam;
   TeamRecID   := 0;
   MatchRecID  := 0;
   Name        := '';
   Abbrev      := '';
   Logo        := Tbitmap.Create;
   HeadCoach   := '';
   Assistent1  := '';
   DeltaRes    := 0;
   Roster      := TObjectList.Create;
   Color       := 0;
   fQuarti  := TObjectList.Create;
   fPPerse     := 0;
   fPRecuperate := 0;
   fRimbDifesa := 0;
   fRimbAttacco := 0;
   for Xxx:=1 to (MaxRegQuarters+MaxExtraQuarters) do
   begin
      Qrt := TQuarterTeam.Create(Xxx);
      Qrt.Reset;
      fQuarti.Add (Qrt);
      //
      //Quintetto[Xxx] := False;
   end;
end;


destructor TMatchTeam.Destroy;
begin
   TeamRecID   := 0;
   MatchRecID  := 0;
   Name        := '';
   Abbrev      := '';
   Logo.Free;
   HeadCoach   := '';
   Assistent1  := '';
   DeltaRes    := 0;
   Roster.Free;
   fQuarti.Free;
   inherited;
end;


function TMatchTeam.GetQuarto(n: Integer): TQuarterTeam;
begin
   Result := nil;
   if ((fQuarti <> Nil) and (n >= 0) and (n < fQuarti.Count)) then
      Result := TQuarterTeam(fQuarti[n]);
end;


function TMatchTeam.GetTimeout1(n: Integer): Boolean;
begin
   Result := False;
   if ((n > 0) and (n < 3)) then
      Result := fTimeout1[n];
end;


function TMatchTeam.GetTimeout2(n: Integer): Boolean;
begin
   Result := False;
   if ((n > 0) and (n < 4)) then
      Result := fTimeout2[n];
end;


function TMatchTeam.GetTimeoutExtra(n: Integer): Boolean;
begin
   Result := False;
   if ((n > 0) and (n < 5)) then
      Result := fTimeoutExtra[n];
end;


function TMatchTeam.GetTotTempoGioco: Longint;
var
   Xxx   :Longint;
begin
   Result := 0;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).TempoGiocoTot;
end;


function TMatchTeam.GetTotTempoGiocoStr: String;
var
   Nn :LongInt;
   Ss :Longint;
   Vvv   :Longint;
begin
   Vvv := TotTempoGioco;
   Nn := Vvv Div 60;
   Ss := Vvv mod 60;
   Result := Format ('%0.2d:%0.2d', [Nn,Ss]);
end;


function TMatchTeam.Player(aNumb: String): TMatchPlayer;
var
   Xxx   :Longint;
begin
   Result := Nil;
   for Xxx:=0 to Pred(Roster.Count) do
   begin
      if (Player(Xxx).PlayNumber.Trim() = aNumb.Trim()) then
      begin
         Result := TMatchPlayer(Roster.Items[Xxx]);
         Exit;
      end;
   end;
end;


function TMatchTeam.PlayerByID (aID :Integer) :TMatchPlayer;
var
   Xxx   :Longint;
begin
   Result := nil;
   for Xxx:=0 to Pred(Roster.Count) do
   begin
      if (Player(Xxx).PlayerRecID = aID) then
      begin
         Result := TMatchPlayer(Roster.Items[Xxx]);
         Exit;
      end;
   end;
end;


function TMatchTeam.Player(aIdx: Integer): TMatchPlayer;
begin
   if ((aIdx >= 0) and (aIdx < Roster.Count)) then
      Result := TMatchPlayer(Roster.Items[aIdx])
   else
      Result := Nil;
end;


procedure TMatchTeam.ReadFromDB;
begin
   ReadFromDB (TeamRecID, MatchRecID);
end;


procedure TMatchTeam.ReadFromDB (aTeamID :Longint;
                                 aMatchID :Longint);
var
   Plr   :TMatchPlayer;
   Ms    :TMemoryStream;
   Xxx   :Longint;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMatchTeam.ReadFromDB (%d, %d)', [aTeamID, aMatchID]);
   try
      try
         if (not DMod.TblTeam.Locate ('ID', aTeamID)) then
         begin
            Exit;
         end;
         if (DMod.TblTeam.Locate ('ID', aTeamID)) then
         begin
            TeamRecId   := aTeamID;
            Name        := DMod.TblTeamDispName.AsString;
            Abbrev      := DMod.TblTeamAbbrev.AsString;
            Ms := TMemoryStream.Create;
            try
               DMod.TblTeamLogo.SaveToStream (Ms);
               Ms.Position := 0;
               Logo.LoadFromStream (Ms);
            finally
               Ms.Free;
            end;
            Roster.Clear;
            DMod.TblMatchRoster.Filtered := False;
            DMod.TblMatchRoster.Filter := Format ('(LinkMatchHeader = %d) AND (IsMyTeam = %s)', [aMatchID, IsMyTeam.ToString()]);
            DMod.TblMatchRoster.Filtered := True;
            DMod.TblMatchRoster.First;
            if (DMod.TblMatchRoster.RecordCount > 0) then
            begin
               MatchRecID  := aMatchID;
               HeadCoach   := '';
               Assistent1  := '';
               DeltaRes    := 0;
               while (not DMod.TblMatchRoster.Eof) do
               begin
                  Plr := TMatchPlayer.Create;
                  Plr.RosterRecID   := DMod.TblMatchRosterID.AsInteger;
                  Plr.PlayerRecID   := DMod.TblMatchRosterLinkPlayer.AsInteger;
                  Plr.PlayNumber    := DMod.TblMatchRosterPlayNumber.AsString;
                  Plr.Name          := DMod.TblMatchRosterDbgPlayer.AsString;
                  Plr.Captain       := DMod.TblMatchRosterCaptain.AsBoolean;
                  Plr.InQuintetto   := DMod.TblMatchRosterQuintetto.AsBoolean;
                  Plr.IsMyTeam      := DMod.TblMatchRosterIsMyTeam.AsBoolean;
                  //
                  Roster.Add (Plr);
                  //
                  DMod.TblMatchRoster.Next;
               end;
            end;
            for Xxx:=0 to 7 do
            begin
               Quarto[Xxx].LoadFromDB (aMatchID, Xxx+1, IsMyTeam);
            end;
         end;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMatchTeam.ReadFromDB] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMatchTeam.ReadFromDB', []);
   end;
end;


procedure TMatchTeam.ResetAll;
var
   Xxx   :LongInt;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMatchTeam.ResetAll ()', []);
   try
      try
         IsMyTeam    := False;
         TeamRecID   := 0;
         MatchRecID  := 0;
         Name        := '';
         Abbrev      := '';
         Logo        := Tbitmap.Create;
         HeadCoach   := '';
         Assistent1  := '';
         DeltaRes    := 0;
         Roster      := TObjectList.Create;
         Color       := 0;
         fQuarti  := TObjectList.Create;
         fPPerse     := 0;
         fPRecuperate := 0;
         fRimbDifesa := 0;
         fRimbAttacco := 0;
         ResetQuarti;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMatchTeam.ResetAll] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMatchTeam.ResetAll', []);
   end;
end;


procedure TMatchTeam.ResetMatchData;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMatchTeam.ResetMatchData ()', []);
   try
      try
         HeadCoach   := '';
         Assistent1  := '';
         DeltaRes    := 0;
         Roster.Clear;
         Color       := 0;
         fPPerse     := 0;
         fPRecuperate := 0;
         fRimbDifesa := 0;
         fRimbAttacco := 0;
         ResetQuarti;
         ResetPlayersTime;
         ResetPlayersData;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMatchTeam.ResetMatchData] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMatchTeam.ResetMatchData', []);
   end;

end;


procedure TMatchTeam.ResetPlayersData;
var
   Xxx   :Longint;
   Yyy   :Longint;
   Plr   :TMatchPlayer;
begin
   for Xxx:=0 to Pred(Roster.Count) do
   begin
      Plr := TMatchPlayer(Roster[Xxx]);
      Plr.TempoGioco := 0;
      for Yyy:=Low(Plr.fFalliFatti) to High(Plr.fFalliFatti) do
         Plr.fFalliFatti[Yyy].Reset;
      Plr.FalliSubiti := 0;
      Plr.RimbAttacco := 0;
      Plr.RimbDifesa := 0;
      Plr.PRecuperate := 0;
      Plr.PPerse := 0;
      Plr.Assist := 0;
      Plr.StoppFatte := 0;
      Plr.StoppSubite := 0;
      Plr.Realizzazioni.Clear;
      Plr.InTime := 600;
      Plr.OutTime := 600;
      Plr.InGioco := False;
      Plr.InQuintetto := False;
      Plr._FakeFouls  := 0;
   end;
end;


procedure TMatchTeam.ResetPlayersTime;
var
   Xxx   :Longint;
   Yyy   :Longint;
   Plr   :TMatchPlayer;
begin
   for Xxx:=0 to Pred(Roster.Count) do
   begin
      Plr := TMatchPlayer(Roster[Xxx]);
      Plr.TempoGioco := 0;
      Plr.InTime := 600;
      Plr.OutTime := 600;
      Plr.InGioco := False;
      Plr.InQuintetto := False;
   end;
end;


procedure TMatchTeam.ResetQuarti;
var
   Xxx   :LongInt;
begin
   for Xxx:=0 to Pred(fQuarti.Count) do
      TQuarterTeam(fQuarti[Xxx]).Reset;
end;


procedure TMatchTeam.SaveToDB;
var
   Xxx   :LongInt;
   Plr   :TMatchPlayer;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMatchTeam.SaveToDB ()', []);
   try
      try
         DMod.TblMatchRoster.Filtered := False;
         DMod.TblMatchRoster.Filter := Format ('(LinkMatchHeader = %d) AND (IsMyTeam = %s)', [MatchRecID, IsMyTeam.ToString()]);
         DMod.TblMatchRoster.Filtered := True;
         DMod.TblMatchRoster.First;
         for Xxx:=0 to Pred(Roster.Count) do
         begin
            Plr := TMatchPlayer(Roster[Xxx]);
            if (DMod.TblMatchRoster.Locate ('ID', Plr.RosterRecID)) then
            begin
               DMod.TblMatchRoster.Edit;
               try
                  DMod.TblMatchRosterQuintetto.AsBoolean := Plr.InQuintetto;
               finally
                  DMod.TblMatchRoster.Post;
               end;
            end;
         end;
         DMod.TblMatchRoster.Filtered := False;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMatchTeam.SaveToDB] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMatchTeam.SaveToDB', []);
   end;
end;


procedure TMatchTeam.SaveToStream (aStream   :TStream;
                                   aRootNode :TXmlNode);
var
   Created  :Boolean;
   ADoc     :TNativeXml;
   Prefix   :String;
   Xxx      :Longint;
   function CreateNode (ThePath :String) :TXmlNode;
   begin
      Result := TXmlNode.CreateName (aDoc, ThePath);
      aRootNode.NodeAdd (Result);
   end;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMatchTeam.SaveToStream ()', []);
   try
      try
         Created := False;
         aDoc := aRootNode.Document;
         Prefix := '';
         aDoc.XmlFormat := xfReadable;
         aDoc.UseFullNodes := True;
         //
         CreateNodeLink (aRootNode, Prefix+'/Name', '').ValueAsString := Self.Name;
         CreateNodeLink (aRootNode, Prefix+'/CurrQuarter', '0').ValueAsInteger := Self.CurrQuarter;
         CreateNodeLink (aRootNode, Prefix+'/Timeouts/1Tempo/1', 'False').ValueAsBool := Timeout1[1];
         CreateNodeLink (aRootNode, Prefix+'/Timeouts/1Tempo/2', 'False').ValueAsBool := Timeout1[2];
         CreateNodeLink (aRootNode, Prefix+'/Timeouts/2Tempo/1', 'False').ValueAsBool := Timeout2[1];
         CreateNodeLink (aRootNode, Prefix+'/Timeouts/2Tempo/2', 'False').ValueAsBool := Timeout2[2];
         CreateNodeLink (aRootNode, Prefix+'/Timeouts/2Tempo/3', 'False').ValueAsBool := Timeout2[3];
         CreateNodeLink (aRootNode, Prefix+'/Timeouts/Extra/1', 'False').ValueAsBool := TimeoutExtra[1];
         CreateNodeLink (aRootNode, Prefix+'/Timeouts/Extra/2', 'False').ValueAsBool := TimeoutExtra[2];
         CreateNodeLink (aRootNode, Prefix+'/Timeouts/Extra/3', 'False').ValueAsBool := TimeoutExtra[3];
         CreateNodeLink (aRootNode, Prefix+'/Timeouts/Extra/4', 'False').ValueAsBool := TimeoutExtra[4];
         for Xxx:=1 to 8 do
         begin
            CreateNodeLink (aRootNode, Prefix+'/Quintetto'+IntToStr(Xxx), 'False').ValueAsBool := Quintetto[Xxx];
         end;
         //
         CreateNodeLink (aRootNode, Prefix+'/TotPlayers', '0').ValueAsInteger := Roster.Count;
         for Xxx:=0 to Pred(Roster.Count) do
         begin
            TMatchPlayer(Roster[Xxx]).SaveToStream (aStream, CreateNodeLink (aRootNode, Prefix+'/Player'+IntToStr(Xxx+1), ''));
         end;
         //
         CreateNodeLink (aRootNode, Prefix+'/Dati/PPerse', '0').ValueAsInteger := TPPerse;
         CreateNodeLink (aRootNode, Prefix+'/Dati/Precuperate', '0').ValueAsInteger := TPRecuperate;
         CreateNodeLink (aRootNode, Prefix+'/Dati/RimbDifesa', '0').ValueAsInteger := TRimbDifesa;
         CreateNodeLink (aRootNode, Prefix+'/Dati/RimbAttacco', '0').ValueAsInteger := TRimbAttacco;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMatchTeam.SaveToStream] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMatchTeam.SaveToStream', []);
   end;
end;


procedure TMatchTeam.LoadFromStream (aStream    :TStream;
                                     aRootNode  :TXmlNode);
var
   ADoc     :TNativeXml;
   Prefix   :String;
   Xxx      :Longint;
   Tot      :Longint;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMatchTeam.LoadFromStream ()', []);
   try
      try
         aDoc := aRootNode.Document;
         Prefix := '';
         //
         CurrQuarter := CreateNodeLink (aRootNode, Prefix+'/CurrQuarter', '0').ValueAsInteger;
         Timeout1[1] := CreateNodeLink (aRootNode, Prefix+'/Timeouts/1Tempo/1', 'False').ValueAsBool;
         Timeout1[2] := CreateNodeLink (aRootNode, Prefix+'/Timeouts/1Tempo/2', 'False').ValueAsBool;
         Timeout2[1] := CreateNodeLink (aRootNode, Prefix+'/Timeouts/2Tempo/1', 'False').ValueAsBool;
         Timeout2[2] := CreateNodeLink (aRootNode, Prefix+'/Timeouts/2Tempo/2', 'False').ValueAsBool;
         Timeout2[3] := CreateNodeLink (aRootNode, Prefix+'/Timeouts/2Tempo/3', 'False').ValueAsBool;
         TimeoutExtra[1] := CreateNodeLink (aRootNode, Prefix+'/Timeouts/Extra/1', 'False').ValueAsBool;
         TimeoutExtra[2] := CreateNodeLink (aRootNode, Prefix+'/Timeouts/Extra/2', 'False').ValueAsBool;
         TimeoutExtra[3] := CreateNodeLink (aRootNode, Prefix+'/Timeouts/Extra/3', 'False').ValueAsBool;
         TimeoutExtra[4] := CreateNodeLink (aRootNode, Prefix+'/Timeouts/Extra/4', 'False').ValueAsBool;
         //
         //
         for Xxx:=1 to 8 do
         begin
            Quintetto[Xxx] := CreateNodeLink (aRootNode, Prefix+'/Quintetto'+IntToStr(Xxx), 'False').ValueAsBool;
         end;
         //
         Tot := CreateNodeLink (aRootNode, Prefix+'/TotPlayers', '0').ValueAsInteger;
         for Xxx:=1 to Tot do
         begin
            TMatchPlayer(Roster[Xxx-1]).LoadFromStream (aStream, CreateNodeLink (aRootNode, Prefix+'/Player'+IntToStr(Xxx), ''));
         end;
         //
         TPPerse        := CreateNodeLink (aRootNode, Prefix+'/Dati/PPerse', '0').ValueAsInteger;
         TPRecuperate   := CreateNodeLink (aRootNode, Prefix+'/Dati/Precuperate', '0').ValueAsInteger;
         TRimbDifesa    := CreateNodeLink (aRootNode, Prefix+'/Dati/RimbDifesa', '0').ValueAsInteger;
         TRimbAttacco   := CreateNodeLink (aRootNode, Prefix+'/Dati/RimbAttacco', '0').ValueAsInteger;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMatchTeam.LoadFromStream] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMatchTeam.LoadFromStream', []);
   end;
end;


procedure TMatchTeam.SetTimeout1(n: Integer; const Value: Boolean);
begin
   if ((n > 0) and (n < 3)) then
      fTimeout1[n] := Value;
end;


procedure TMatchTeam.SetTimeout2(n: Integer; const Value: Boolean);
begin
   if ((n > 0) and (n < 4)) then
      fTimeout2[n] := Value;
end;


procedure TMatchTeam.SetTimeoutExtra(n: Integer; const Value: Boolean);
begin
   if ((n > 0) and (n < 5)) then
      fTimeoutExtra[n] := Value;
end;


function TMatchTeam.CalcAssist: Longint;
var
   Xxx   :Longint;
begin
   Result := 0;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).Assist;
end;


function TMatchTeam.CalcFalliFatti: LongInt;
var
   Xxx   :Longint;
begin
   Result := 0;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).FalliFatti;
end;


function TMatchTeam.CalcFalliSubiti: LongInt;
var
   Xxx   :Longint;
begin
   Result := 0;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).FalliSubiti;
end;


function TMatchTeam.CalcOER: Double;
var
   Xxx   :Longint;
begin
   Result := 0;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).OER;
end;


function TMatchTeam.CalcPIR: Double;
var
   Xxx   :Longint;
begin
   Result := 0;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).PIR;
end;


function TMatchTeam.CalcPPerse: Longint;
var
   Xxx   :Longint;
begin
   Result := TPPerse;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).PPerse;
end;


function TMatchTeam.CalcPRecuperate: Longint;
var
   Xxx   :Longint;
begin
   Result := TPRecuperate;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).PRecuperate;
end;


function TMatchTeam.CalcPunti: LongInt;
var
   Xxx   :Longint;
begin
   Result := 0;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).Punti;
   Result := Result+DeltaRes;
end;


function TMatchTeam.CalcTLPerc: String;
begin
   if (TLTentati > 0) then
      Result := Format (PercTiroFormat, [(TLRealizz*100)/TLTentati])
   else
      Result := '0';
end;


function TMatchTeam.CalcTLPunti: LongInt;
var
   Xxx   :LongInt;
begin
   Result := 0;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).TLPunti;
end;


function TMatchTeam.CalcTLRealizz: LongInt;
var
   Xxx   :LongInt;
begin
   Result := 0;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).TLRealizz;
end;


function TMatchTeam.CalcTLTentati: LongInt;
var
   Xxx   :LongInt;
begin
   Result := 0;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).TLTentati;
end;


function TMatchTeam.CalcRimbalzi: Longint;
var
   Xxx   :Longint;
begin
   Result := TRimbAttacco+TRimbDifesa;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).Rimbalzi;
end;


function TMatchTeam.CalcRimbAttacco: Longint;
var
   Xxx   :Longint;
begin
   Result := TRimbAttacco;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).RimbAttacco;
end;


function TMatchTeam.CalcRimbDifesa: Longint;
var
   Xxx   :Longint;
begin
   Result := TRimbDifesa;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).RimbDifesa;
end;


function TMatchTeam.CalcStoppFatte: Longint;
var
   Xxx   :Longint;
begin
   Result := 0;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).StoppFatte;
end;


function TMatchTeam.CalStoppSubite: Longint;
var
   Xxx   :Longint;
begin
   Result := 0;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).StoppSubite;
end;


function TMatchTeam.CalcT2Perc: String;
begin
   if (T2Tentati > 0) then
      Result := Format (PercTiroFormat, [(T2Realizz*100)/T2Tentati])
   else
      Result := '0';
end;


function TMatchTeam.CalcT2Punti: LongInt;
var
   Xxx   :LongInt;
begin
   Result := 0;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).T2Punti;
end;


function TMatchTeam.CalcT2Realizz: LongInt;
var
   Xxx   :LongInt;
begin
   Result := 0;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).T2Realizz;
end;


function TMatchTeam.CalcT2Tentati: LongInt;
var
   Xxx   :LongInt;
begin
   Result := 0;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).T2Tentati;
end;


function TMatchTeam.CalcT3Perc: String;
begin
   if (T3Tentati > 0) then
      Result := Format (PercTiroFormat, [(T3Realizz*100)/T3Tentati])
   else
      Result := '0';
end;


function TMatchTeam.CalcT3Punti: LongInt;
var
   Xxx   :LongInt;
begin
   Result := 0;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).T3Punti;
end;


function TMatchTeam.CalcT3Realizz: LongInt;
var
   Xxx   :LongInt;
begin
   Result := 0;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).T3Realizz;
end;


function TMatchTeam.CalcT3Tentati: LongInt;
var
   Xxx   :LongInt;
begin
   Result := 0;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).T3Tentati;
end;


function TMatchTeam.CalcTdcPerc: String;
begin
   if (TdcTentati > 0) then
      Result := Format (PercTiroFormat, [(TdcRealizz*100)/TdcTentati])
   else
      Result := '0';
end;


function TMatchTeam.CalcTdcPunti: LongInt;
var
   Xxx   :LongInt;
begin
   Result := 0;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).TdcPunti;
end;


function TMatchTeam.CalcTdcRealizz: LongInt;
var
   Xxx   :LongInt;
begin
   Result := 0;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).TdcRealizz;
end;


function TMatchTeam.CalcTdcTentati: LongInt;
var
   Xxx   :LongInt;
begin
   Result := 0;
   for Xxx:=0 to Pred(Roster.Count) do
      Result := Result + Player(Xxx).TdcTentati;
end;










{ TMatchPlayer }

constructor TMatchPlayer.Create;
begin
   _Simulation := False;
   _FakeFouls  := 0;
   PlayerRecID := 0;
   RosterRecID := 0;
   Name        := '';
   PlayNumber  := '';
   Captain     := False;
   InQuintetto := False;
   IsMyTeam    := True;
   InGioco     := False;
   fRealizzazioni := TObjectList.Create;
   InternalSort := 0;
end;


destructor TMatchPlayer.Destroy;
begin
   Name        := '';
   PlayNumber  := '';
   fRealizzazioni.Free;
   inherited;
end;


function TMatchPlayer.CurrentPlayingTimeStr(CurrTime: Integer): string;
var
   Ss :Longint;
   Nn :Longint;
   Tm :LongInt;
begin
   Result := '';
   if (InGioco) then
   begin
      Tm := InTime-Currtime;
      Nn := Tm Div 60;
      Ss := Tm Mod 60;
      Result := Format ('%0.2d:%0.2d', [nn,ss])
   end;
end;


function TMatchPlayer.CalcOER: Double;
var
   Denom :Double;
begin
   Denom := (TdcTentati + (TLTentati/2.0) + PPerse);
   if (Abs (Denom) > 0.0001) then
      Result := (Punti) / Denom
   else
      Result := 0.0;
   Result := Result * 1.0;
end;


function TMatchPlayer.CalcOERMin: Double;
var
   Tg    :Double;
   Tot   :Double;
   Ss    :LongInt;
   QuartiGiocati  :LongInt;
begin
   if (TempoGiocoTot > 0) then
   begin
      // Calcolo il tempo totale della partita
      QuartiGiocati := MainWind.GetQuarterPlayed;
      if (QuartiGiocati <= MaxRegQuarters) then
         Tot := QuartiGiocati*BSDECfg.DurationRegulTime.ValueAsInteger
      else
         Tot := (MaxRegQuarters*BSDECfg.DurationRegulTime.ValueAsInteger) + ((QuartiGiocati-MaxRegQuarters)*BSDECfg.DurationExtraTime.ValueAsInteger);
      Tot := ((Tot*100.00)/60.00)/100.0;
      // Calcolo il tempo di gioco effettivo del giocatore
      Tg := TempoGiocoTot div 60;
      Ss := TempoGiocoTot mod 60;
      Tg := Tg + (((Ss*100.0)/60.0)/100.0);
      Result := (OER*Tot)/Tg;
   end
   else
      Result := 0.0;
end;


function TMatchPlayer.CalcolaPunti: LongInt;
var
   Xxx   :LongInt;
   Rea   :TRealizzazione;
begin
   Result := 0;
   if (not Assigned (Realizzazioni)) then
      Exit;
   try
      for Xxx:=0 to Pred(Realizzazioni.Count) do
      begin
         try
            try
               Rea := TRealizzazione(Realizzazioni[Xxx]);
            except
               Rea := nil;
            end;
            if (Rea <> nil) then
            begin
               if (Rea.Punti > 0) then
               begin
                  case Rea.Tipo of
                     trLibero:   Result := Result+1;
                     trT2:       Result := Result+2;
                     trT3:       Result := Result+3;
                  end;
               end;
            end;
         except
         end;
      end;
   except
   end;
end;


function TMatchPlayer.CalcolaTempoGiocoStr :String;
var
   Nn :LongInt;
   Ss :Longint;
   Vvv   :Longint;
begin
   Vvv := TempoGiocoTot;
   if (InGioco) then
   begin
      Vvv := Vvv+(InTime-CurrCronotime);
   end;
   Nn := Vvv Div 60;
   Ss := Vvv mod 60;
   Result := Format ('%0.2d:%0.2d', [Nn,Ss]);
end;


function TMatchPlayer.CalcPIR: Double;
begin
//(Points + Rebounds + Assists + Steals + Blocks + Fouls Drawn) - (Missed Field Goals + Missed Free Throws + Turnovers + Shots Rejected + Fouls Committed).
   Result := (Punti + Rimbalzi + Assist + PRecuperate + StoppFatte + FalliSubiti) - ((TdcTentati-TdcRealizz) + (TLTentati-TLRealizz) + PPerse + StoppSubite + FalliFatti);
   Result := Result * 1.0;
end;


function TMatchPlayer.CalcPIRMin: Double;
var
   Tg             :Double;
   Tot            :Double;
   Ss             :LongInt;
   QuartiGiocati  :LongInt;
begin
   if (TempoGiocoTot > 0) then
   begin
      // Calcolo il tempo totale della partita
      QuartiGiocati := MainWind.GetQuarterPlayed;
      if (QuartiGiocati <= MaxRegQuarters) then
         Tot := QuartiGiocati*BSDECfg.DurationRegulTime.ValueAsInteger
      else
         Tot := (MaxRegQuarters*BSDECfg.DurationRegulTime.ValueAsInteger) + ((QuartiGiocati-MaxRegQuarters)*BSDECfg.DurationExtraTime.ValueAsInteger);
      Tot := ((Tot*100.00)/60.00)/100.0;
      // Calcolo il tempo di gioco effettivo del giocatore
      Tg := TempoGiocoTot div 60;
      Ss := TempoGiocoTot mod 60;
      Tg := Tg + (((Ss*100.0)/60.0)/100.0);
      //Result := PIR/Tg;
      Result := (PIR*Tot)/Tg;
   end
   else
      Result := 0.0;
end;


function TMatchPlayer.CalcPtiEt: LongInt;
var
   Xxx   :LongInt;
   Rea   :TRealizzazione;
begin
   Result := 0;
   if (not Assigned (Realizzazioni)) then
      Exit;
   for Xxx:=0 to Pred(Realizzazioni.Count) do
   begin
      Rea := TRealizzazione(Realizzazioni[Xxx]);
      if ((Rea.Quarto > 4) and (Rea.Punti > 0)) then
         Result := Result+Rea.Punti;
   end;
end;


function TMatchPlayer.CalcPtiQ1: LongInt;
var
   Xxx   :LongInt;
   Rea   :TRealizzazione;
begin
   Result := 0;
   if (not Assigned (Realizzazioni)) then
      Exit;
   for Xxx:=0 to Pred(Realizzazioni.Count) do
   begin
      Rea := TRealizzazione(Realizzazioni[Xxx]);
      if ((Rea.Quarto = 1) and (Rea.Punti > 0)) then
         Result := Result+Rea.Punti;
   end;
end;


function TMatchPlayer.CalcPtiQ2: LongInt;
var
   Xxx   :LongInt;
   Rea   :TRealizzazione;
begin
   Result := 0;
   if (not Assigned (Realizzazioni)) then
      Exit;
   for Xxx:=0 to Pred(Realizzazioni.Count) do
   begin
      Rea := TRealizzazione(Realizzazioni[Xxx]);
      if ((Rea.Quarto = 2) and (Rea.Punti > 0)) then
         Result := Result+Rea.Punti;
   end;
end;


function TMatchPlayer.CalcPtiQ3: LongInt;
var
   Xxx   :LongInt;
   Rea   :TRealizzazione;
begin
   Result := 0;
   if (not Assigned (Realizzazioni)) then
      Exit;
   for Xxx:=0 to Pred(Realizzazioni.Count) do
   begin
      Rea := TRealizzazione(Realizzazioni[Xxx]);
      if ((Rea.Quarto = 3) and (Rea.Punti > 0)) then
         Result := Result+Rea.Punti;
   end;
end;


function TMatchPlayer.CalcPtiQ4: LongInt;
var
   Xxx   :LongInt;
   Rea   :TRealizzazione;
begin
   Result := 0;
   if (not Assigned (Realizzazioni)) then
      Exit;
   for Xxx:=0 to Pred(Realizzazioni.Count) do
   begin
      Rea := TRealizzazione(Realizzazioni[Xxx]);
      if ((Rea.Quarto = 4) and (Rea.Punti > 0)) then
         Result := Result+Rea.Punti;
   end;
end;


function TMatchPlayer.CalcRimbalzi: Longint;
begin
   Result := RimbAttacco + RimbDifesa;
end;


function TMatchPlayer.CalcT2Data :string;
begin
   Result := '';
   if (T2Tentati > 0) then
      Result := Format ('%d/%d (%s%%)', [T2Realizz, T2Tentati, T2Perc]);
end;


function TMatchPlayer.CalcT2Perc :String;
begin
   if (T2Tentati > 0) then
      Result := Format (PercTiroFormat, [(T2Realizz*100)/T2Tentati])
   else
      Result := '0';
end;


function TMatchPlayer.CalcT2Punti :LongInt;
begin
   Result := CalcT2Realizz * 2;
end;


function TMatchPlayer.CalcT2Realizz :LongInt;
var
   Xxx   :LongInt;
   Rea   :TRealizzazione;
begin
   Result := 0;
   if (not Assigned (Realizzazioni)) then
      Exit;
   for Xxx:=0 to Pred(Realizzazioni.Count) do
   begin
      Rea := TRealizzazione(Realizzazioni[Xxx]);
      if ((Rea.Tipo = trT2) and (Rea.Punti > 0)) then
         Result := Result+1;
   end;
end;


function TMatchPlayer.CalcT2Tentati :LongInt;
var
   Xxx   :LongInt;
   Rea   :TRealizzazione;
begin
   Result := 0;
   if (not Assigned (Realizzazioni)) then
      Exit;
   for Xxx:=0 to Pred(Realizzazioni.Count) do
   begin
      Rea := TRealizzazione(Realizzazioni[Xxx]);
      if (Rea.Tipo = trT2) then
         Result := Result+1;
   end;
end;


function TMatchPlayer.CalcT3Data :string;
begin
   Result := '';
   if (T3Tentati > 0) then
      Result := Format ('%d/%d (%s%%)', [T3Realizz, T3Tentati, T3Perc]);
end;


function TMatchPlayer.CalcT3Perc :String;
begin
   if (T3Tentati > 0) then
      Result := Format (PercTiroFormat, [(T3Realizz*100)/T3Tentati])
   else
      Result := '0';
end;


function TMatchPlayer.CalcT3Punti :LongInt;
begin
   Result := CalcT3Realizz * 3;
end;


function TMatchPlayer.CalcT3Realizz :LongInt;
var
   Xxx   :LongInt;
   Rea   :TRealizzazione;
begin
   Result := 0;
   if (not Assigned (Realizzazioni)) then
      Exit;
   for Xxx:=0 to Pred(Realizzazioni.Count) do
   begin
      Rea := TRealizzazione(Realizzazioni[Xxx]);
      if ((Rea.Tipo = trT3) and (Rea.Punti > 0)) then
         Result := Result+1;
   end;
end;


function TMatchPlayer.CalcT3Tentati :LongInt;
var
   Xxx   :LongInt;
   Rea   :TRealizzazione;
begin
   Result := 0;
   if (not Assigned (Realizzazioni)) then
      Exit;
   for Xxx:=0 to Pred(Realizzazioni.Count) do
   begin
      Rea := TRealizzazione(Realizzazioni[Xxx]);
      if (Rea.Tipo = trT3) then
         Result := Result+1;
   end;
end;


function TMatchPlayer.CalcTdcData :string;
begin
   Result := '';
   if (TdcTentati > 0) then
      Result := Format ('%d/%d (%s%%)', [TdcRealizz, TdcTentati, TdcPerc]);
end;


function TMatchPlayer.CalcTdcPerc :String;
begin
   if (TdcTentati > 0) then
      Result := Format (PercTiroFormat, [(TdcRealizz*100)/TdcTentati])
   else
      Result := '0';
end;


function TMatchPlayer.CalcTdcPunti :LongInt;
begin
   Result := T2Punti + T3Punti;
end;


function TMatchPlayer.CalcTdcRealizz :LongInt;
begin
   Result := T2Realizz + T3Realizz;
end;


function TMatchPlayer.CalcTdcTentati :LongInt;
begin
   Result := T2Tentati + T3Tentati;
end;


function TMatchPlayer.CalcTLData :string;
begin
   Result := '';
   if (TLTentati > 0) then
      Result := Format ('%d/%d (%s%%)', [TLRealizz, TLTentati, TLPerc]);
end;


function TMatchPlayer.CalcTLPerc :String;
begin
   if (TLTentati > 0) then
      Result := Format (PercTiroFormat, [(TLRealizz*100)/TLTentati])
   else
      Result := '0';
end;


function TMatchPlayer.CalcTLPunti :LongInt;
begin
   Result := CalcTLRealizz;
end;


function TMatchPlayer.CalcTLRealizz :LongInt;
var
   Xxx   :LongInt;
   Rea   :TRealizzazione;
begin
   Result := 0;
   if (not Assigned (Realizzazioni)) then
      Exit;
   for Xxx:=0 to Pred(Realizzazioni.Count) do
   begin
      Rea := TRealizzazione(Realizzazioni[Xxx]);
      if ((Rea.Tipo = trLibero) and (Rea.Punti > 0)) then
         Result := Result+1;
   end;
end;


function TMatchPlayer.CalcTLTentati :LongInt;
var
   Xxx   :LongInt;
   Rea   :TRealizzazione;
begin
   Result := 0;
   if (not Assigned (Realizzazioni)) then
      Exit;
   for Xxx:=0 to Pred(Realizzazioni.Count) do
   begin
      Rea := TRealizzazione(Realizzazioni[Xxx]);
      if (Rea.Tipo = trLibero) then
         Result := Result+1;
   end;
end;


procedure TMatchPlayer.ChangeFakeFouls (aNum :Integer);
begin
   _FakeFouls := aNum;
end;


function TMatchPlayer.GetFalliFatti :LongInt;
var
   Xxx   :LongInt;
begin
   Result := 0;
   for Xxx:=1 to MaxFouls do
   begin
      if (fFalliFatti[Xxx].Commesso) then
         Result := Result + 1;
   end;
end;


function TMatchPlayer.GetFalloFatto (n :Integer) :TFalloFatto;
begin
   Result := fFalliFatti[n];
end;


function TMatchPlayer.GetInTime :LongInt;
begin
   Result := fInTime;
end;


function TMatchPlayer.GetOutTime :LongInt;
begin
   Result := fOutTime;
end;


function TMatchPlayer.GetTeamCode :string;
begin
   if (IsMyTeam) then
      Result := MyTeamCode
   else
      Result := OpponentTeamCode;
end;


function TMatchPlayer.GetTempoGioco :LongInt;
begin
   if (fTempoGioco < 0) then
      Result := 0
   else
      Result := fTempoGioco;
end;


procedure TMatchPlayer.ImportRealizzFromOld (aOld :TOldFormatPlayer);
var
   Xxx      :LongInt;
   NewRea   :TRealizzazione;
begin
   Realizzazioni.Clear;
   for Xxx:=0 to Pred(aOld.Realizzazioni.Count) do
   begin
      NewRea := TRealizzazione.Create;
      NewRea.Plr := Self;
      NewRea.ImportFromOldFormat (TOldFormatRealizzazione(aOld.Realizzazioni[Xxx]));
      Realizzazioni.Add (NewRea);
   end;
end;


function TMatchPlayer.PlayNumber2 :string;
begin
   Result := PlayNumber;
   while (Length (Result) < 2) do
      Result := ' '+Result;
end;


procedure TMatchPlayer.SaveToDB;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMatchPlayer.SaveToDB ()', []);
   try
      try
         //PlayerRecID   := DMod.TblMatchRosterID.AsInteger;
         //RosterRecID   := DMod.TblMatchRosterLinkPlayer.AsInteger;
         if (not DMod.TblMatchRoster.Locate ('ID', PlayerRecID)) then
         begin
            Exit;
         end;
         DMod.TblMatchRoster.Edit;
         try
         finally
            DMod.TblMatchRoster.Post;
         end;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMatchPlayer.SaveToDB] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMatchPlayer.SaveToDB', []);
   end;
end;


procedure TMatchPlayer.SaveToStream (aStream: TStream;
                                     aRootNode: TXmlNode);
var
   Created  :Boolean;
   ADoc     :TNativeXml;
   Prefix   :String;
   Xxx      :Longint;
begin
   //LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMatchPlayer.SaveToStream ()', []);
   try
      try
         Created := False;
         aDoc := aRootNode.Document;
         Prefix := '';
         aDoc.XmlFormat := xfReadable;
         aDoc.UseFullNodes := True;
         //
         CreateNodeLink (aRootNode, Prefix+'/PlayerRecID',        '0').ValueAsInteger  := PlayerRecID;
         CreateNodeLink (aRootNode, Prefix+'/Name',               '').ValueAsString    := Name;
         CreateNodeLink (aRootNode, Prefix+'/PlayNumber',         '').ValueAsString    := PlayNumber;
         CreateNodeLink (aRootNode, Prefix+'/IsMyTeam',           'True').ValueAsBool  := IsMyTeam;
         CreateNodeLink (aRootNode, Prefix+'/Captain',            'False').ValueAsBool := Captain;
         CreateNodeLink (aRootNode, Prefix+'/TempoGioco',         '0').ValueAsInteger  := TempoGioco;
         CreateNodeLink (aRootNode, Prefix+'/FalliSubiti',        '0').ValueAsInteger  := FalliSubiti;
         CreateNodeLink (aRootNode, Prefix+'/RimbDifesa',         '0').ValueAsInteger  := RimbDifesa;
         CreateNodeLink (aRootNode, Prefix+'/RimbAttacco',        '0').ValueAsInteger  := RimbAttacco;
         CreateNodeLink (aRootNode, Prefix+'/PallePerse',         '0').ValueAsInteger  := PPerse;
         CreateNodeLink (aRootNode, Prefix+'/PalleRecuperate',    '0').ValueAsInteger  := PRecuperate;
         CreateNodeLink (aRootNode, Prefix+'/StoppateSubite',     '0').ValueAsInteger  := StoppSubite;
         CreateNodeLink (aRootNode, Prefix+'/StoppateFatte',      '0').ValueAsInteger  := StoppFatte;
         CreateNodeLink (aRootNode, Prefix+'/Assist',             '0').ValueAsInteger  := Assist;
         CreateNodeLink (aRootNode, Prefix+'/Intime',             '0').ValueAsInteger  := InTime;
         CreateNodeLink (aRootNode, Prefix+'/OutTime',            '0').ValueAsInteger  := OutTime;
         CreateNodeLink (aRootNode, Prefix+'/InGioco',            'False').ValueAsBool := InGioco;
         CreateNodeLink (aRootNode, Prefix+'/PlusMinus',          '0').ValueAsInteger  := PlusMinus;
         CreateNodeLink (aRootNode, Prefix+'/InQuintetto',        'False').ValueAsBool := InQuintetto;
         for Xxx:=1 to 5 do
         begin
            CreateNodeLink (aRootNode, Prefix+'/Fallo'+IntToStr(Xxx)+'/Commesso',      'False').ValueAsBool := FalloFatto[Xxx].Commesso;
            CreateNodeLink (aRootNode, Prefix+'/Fallo'+IntToStr(Xxx)+'/Quarto',        '0').ValueAsInteger  := FalloFatto[Xxx].Quarto;
            CreateNodeLink (aRootNode, Prefix+'/Fallo'+IntToStr(Xxx)+'/NumLiberi',     '0').ValueAsInteger  := FalloFatto[Xxx].NumLiberi;
            CreateNodeLink (aRootNode, Prefix+'/Fallo'+IntToStr(Xxx)+'/Tecnico',       'False').ValueAsBool := FalloFatto[Xxx].Tecnico;
            CreateNodeLink (aRootNode, Prefix+'/Fallo'+IntToStr(Xxx)+'/Intenzionale',  'False').ValueAsBool := FalloFatto[Xxx].Intenzionale;
            CreateNodeLink (aRootNode, Prefix+'/Fallo'+IntToStr(Xxx)+'/Antisportivo',  'False').ValueAsBool := FalloFatto[Xxx].Antisportivo;
            CreateNodeLink (aRootNode, Prefix+'/Fallo'+IntToStr(Xxx)+'/Espulsione',    'False').ValueAsBool := FalloFatto[Xxx].Espulsione;
         end;
         CreateNodeLink (aRootNode, Prefix+'/TotRealizzazioni',   '0').ValueAsInteger  := Realizzazioni.Count;
         for Xxx:=0 to Pred(Realizzazioni.Count) do
         begin
            TRealizzazione(Realizzazioni[Xxx]).SaveToStream (aStream, CreateNodeLink (aRootNode, Prefix+'/Realizzazione'+IntToStr(Xxx+1), ''));
         end;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMatchPlayer.SaveToStream] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      //LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMatchPlayer.SaveToStream', []);
   end;
end;


procedure TMatchPlayer.LoadFromStream (aStream: TStream;
                                       aRootNode: TXmlNode);
var
   ADoc     :TNativeXml;
   Prefix   :String;
   Xxx      :Longint;
   Tot      :Longint;
   Rea      :TRealizzazione;
begin
   //LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMatchPlayer.LoadFromStream ()', []);
   try
      try
         aDoc := aRootNode.Document;
         Prefix := '';
         //
         if (PlayerRecID <> CreateNodeLink (aRootNode, Prefix+'/PlayerRecID',        '0').ValueAsInteger) then
            Exit;
         TempoGioco  := CreateNodeLink (aRootNode, Prefix+'/TempoGioco',         '0').ValueAsInteger;
         FalliSubiti := CreateNodeLink (aRootNode, Prefix+'/FalliSubiti',        '0').ValueAsInteger;
         RimbDifesa  := CreateNodeLink (aRootNode, Prefix+'/RimbDifesa',         '0').ValueAsInteger;
         RimbAttacco := CreateNodeLink (aRootNode, Prefix+'/RimbAttacco',        '0').ValueAsInteger;
         PPerse      := CreateNodeLink (aRootNode, Prefix+'/PallePerse',         '0').ValueAsInteger;
         PRecuperate := CreateNodeLink (aRootNode, Prefix+'/PalleRecuperate',    '0').ValueAsInteger;
         StoppSubite := CreateNodeLink (aRootNode, Prefix+'/StoppateSubite',     '0').ValueAsInteger;
         StoppFatte  := CreateNodeLink (aRootNode, Prefix+'/StoppateFatte',      '0').ValueAsInteger;
         Assist      := CreateNodeLink (aRootNode, Prefix+'/Assist',             '0').ValueAsInteger;
         InTime      := CreateNodeLink (aRootNode, Prefix+'/Intime',             '0').ValueAsInteger;
         OutTime     := CreateNodeLink (aRootNode, Prefix+'/OutTime',            '0').ValueAsInteger;
         InGioco     := CreateNodeLink (aRootNode, Prefix+'/InGioco',            'False').ValueAsBool;
         PlusMinus   := CreateNodeLink (aRootNode, Prefix+'/PlusMinus',          '0').ValueAsInteger;
         InQuintetto := CreateNodeLink (aRootNode, Prefix+'/InQuintetto',        'False').ValueAsBool;
         for Xxx:=1 to 5 do
         begin
            fFalliFatti[Xxx].Commesso      := CreateNodeLink (aRootNode, Prefix+'/Fallo'+IntToStr(Xxx)+'/Commesso',      'False').ValueAsBool;
            fFalliFatti[Xxx].Quarto        := CreateNodeLink (aRootNode, Prefix+'/Fallo'+IntToStr(Xxx)+'/Quarto',        '0').ValueAsInteger;
            fFalliFatti[Xxx].NumLiberi     := CreateNodeLink (aRootNode, Prefix+'/Fallo'+IntToStr(Xxx)+'/NumLiberi',     '0').ValueAsInteger;
            fFalliFatti[Xxx].Tecnico       := CreateNodeLink (aRootNode, Prefix+'/Fallo'+IntToStr(Xxx)+'/Tecnico',       'False').ValueAsBool;
            fFalliFatti[Xxx].Intenzionale  := CreateNodeLink (aRootNode, Prefix+'/Fallo'+IntToStr(Xxx)+'/Intenzionale',  'False').ValueAsBool;
            fFalliFatti[Xxx].Antisportivo  := CreateNodeLink (aRootNode, Prefix+'/Fallo'+IntToStr(Xxx)+'/Antisportivo',  'False').ValueAsBool;
            fFalliFatti[Xxx].Espulsione    := CreateNodeLink (aRootNode, Prefix+'/Fallo'+IntToStr(Xxx)+'/Espulsione',    'False').ValueAsBool;
         end;
         Tot := CreateNodeLink (aRootNode, Prefix+'/TotRealizzazioni',   '0').ValueAsInteger;
         Realizzazioni.Clear;
         for Xxx:=1 to Tot do
         begin
            Rea := TRealizzazione.Create;
            Rea.LoadFromStream (aStream, CreateNodeLink (aRootNode, Prefix+'/Realizzazione'+IntToStr(Xxx), ''));
            Realizzazioni.Add (Rea);
         end;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMatchPlayer.LoadFromStream] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      //LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMatchPlayer.LoadFromStream', []);
   end;
end;


procedure TMatchPlayer.SetInTime (const Value :LongInt);
begin
   if (fInTime <> Value) then
      fInTime := Value;
end;


procedure TMatchPlayer.SetOutTime (const Value :LongInt);
begin
   fOutTime := Value;
end;


procedure TMatchPlayer.SetTempoGioco (const Value :LongInt);
begin
   if (Value < 0) then
      fTempoGioco := 0
   else
      fTempoGioco := Value;
end;


function TMatchPlayer.TempoGiocoTot (aAncheInGioco :Boolean) :LongInt;
begin
   if ((aAncheInGioco) and (InGioco)) then
      Result := InTime-MainWind.FrmTime.CurrentTime
   else
      Result := 0;
   Result := Result+TempoGioco;
   if (Result < 0) then
      Result := 0;
end;


function TMatchPlayer.TempoGiocoTot :LongInt;
begin
   Result := TempoGioco;
end;


function TMatchPlayer.TotalPlayingTimeStr :string;
var
   Ss :Longint;
   Nn :Longint;
   Tm :LongInt;
begin
   Result := '';
   Tm := TempoGiocotot (True);
   Nn := Tm Div 60;
   Ss := Tm Mod 60;
   Result := Format ('%0.2d:%0.2d', [nn,ss])
end;


function TMatchPlayer.TotFalli :Longint;
begin
   if (_Simulation) Then
   begin
      Result := _FakeFouls;
      Exit;
   end;
   Result := GetFalliFatti;
end;


function TMatchPlayer.TotPunti :Longint;
begin
   if (_Simulation) Then
   begin
      Result := 28;
      Exit;
   end;
   Result := CalcolaPunti();
end;








{ TTipoRealizzazioneHelper }

procedure TTipoRealizzazioneHelper.SetFrom (aInt :Integer);
begin
   if ((LowInt <= aInt) and (HighInt >= aInt)) then
      Self := TTipoRealizzazione(aInt);
end;


procedure TTipoRealizzazioneHelper.SetFrom (aStr :String);
var
   Xxx   :TTipoRealizzazione;
begin
   aStr := UpperTrim (aStr);
   for Xxx:=Low(TTipoRealizzazione) to High(TTipoRealizzazione) do
   begin
      if (aStr = UpperTrim (Xxx.ToString())) then
      begin
         Self := Xxx;
         Exit;
      end;
   end;
end;


function TTipoRealizzazioneHelper.HighInt :Longint;
begin
   Result := Ord (High (TTipoRealizzazione));
end;


function TTipoRealizzazioneHelper.LowInt :Longint;
begin
   Result := Ord (Low (TTipoRealizzazione));
end;


function TTipoRealizzazioneHelper.ToInt :Longint;
begin
   Result := Ord (Self);
end;


class function TTipoRealizzazioneHelper.ToInt (Value :TTipoRealizzazione) :Longint;
begin
   Result := Value.ToInt();
end;


class function TTipoRealizzazioneHelper.ToString (Value :TTipoRealizzazione) :String;
begin
   Result := Value.ToString();
end;


function TTipoRealizzazioneHelper.ToString :String;
begin
   Result := GetEnumName (TypeInfo(TTipoRealizzazione), LongInt(Self));
end;







{ TQuarterStatusHelper }

procedure TQuarterStatusHelper.SetFrom (aInt :Integer);
begin
   if ((LowInt <= aInt) and (HighInt >= aInt)) then
      Self := TQuarterStatus(aInt);
end;


procedure TQuarterStatusHelper.SetFrom (aStr :String);
var
   Xxx   :TQuarterStatus;
begin
   aStr := UpperTrim (aStr);
   for Xxx:=Low(TQuarterStatus) to High(TQuarterStatus) do
   begin
      if (aStr = UpperTrim (Xxx.ToString())) then
      begin
         Self := Xxx;
         Exit;
      end;
   end;
end;


function TQuarterStatusHelper.HighInt :Longint;
begin
   Result := Ord (High (TQuarterStatus));
end;


function TQuarterStatusHelper.LowInt :Longint;
begin
   Result := Ord (Low (TQuarterStatus));
end;


function TQuarterStatusHelper.ToInt :Longint;
begin
   Result := Ord (Self);
end;


class function TQuarterStatusHelper.ToInt (Value :TQuarterStatus) :Longint;
begin
   Result := Value.ToInt();
end;


class function TQuarterStatusHelper.ToString (Value :TQuarterStatus) :String;
begin
   Result := Value.ToString();
end;


function TQuarterStatusHelper.ToString :String;
begin
   Result := GetEnumName (TypeInfo(TQuarterStatus), LongInt(Self));
end;







{ TFalloFatto }

procedure TFalloFatto.Reset;
begin
   Commesso       := False;
   NumLiberi      := 0;
   Tecnico        := False;
   Intenzionale   := False;
   Antisportivo   := False;
   Espulsione     := False;
   Quarto         := 0;
   Tempo          := 0;   // Tempo di gioco relativo al quarto
end;







{ TRealizzazione }

constructor TRealizzazione.Create;
begin
   inherited;
   RecID    := 0;
   Tempo    := 0;
   Tipo     := trUndefined;
   Punti    := 0;
   PosX     := 0;
   PosY     := 0;
   Quarto   := 0;
   Plr      := Nil;
end;


destructor TRealizzazione.Destroy;
begin
   Plr := Nil;
   inherited;
end;


procedure TRealizzazione.ImportFromOldFormat(aOld: TOldFormatRealizzazione);
begin
   //Tempo    := aSrc.Tempo;
   case aOld.Tipo of
      tofrUndefined: Tipo := trUndefined;
      tofrLibero:    Tipo := trLibero;
      tofrT2:        Tipo := trT2;
      tofrT3:        Tipo := trT3;
   end;
   Punti    := aOld.Punti;
   PosX     := aOld.PosX;
   PosY     := aOld.PosY;
   Quarto   := aOld.Quarto;
end;


procedure TRealizzazione.Assign (aSrc :TRealizzazione);
begin
   // RecID not to be assigned
   Tempo    := aSrc.Tempo;
   Tipo     := aSrc.Tipo;
   Punti    := aSrc.Punti;
   PosX     := aSrc.PosX;
   PosY     := aSrc.PosY;
   Quarto   := aSrc.Quarto;
   Plr      := aSrc.Plr;
end;


procedure TRealizzazione.T2 (aTempo :Longint;
                             aQrt   :Longint;
                             aFatto :Boolean;
                             aX, aY :Longint);
begin
   Tempo   := aTempo;
   Tipo    := trT2;
   if (aFatto) then
      Punti   := 2
   else
      Punti   := 0;
   PosX    := aX;
   PosY    := aY;
   Quarto  := aQrt;
end;


procedure TRealizzazione.T3 (aTempo :Longint;
                             aQrt   :Longint;
                             aFatto :Boolean;
                             aX, aY :Longint);
begin
   Tempo   := aTempo;
   Tipo    := trT3;
   if (aFatto) then
      Punti   := 3
   else
      Punti   := 0;
   PosX    := aX;
   PosY    := aY;
   Quarto  := aQrt;
end;


procedure TRealizzazione.TL (aTempo :Longint;
                             aQrt   :Longint;
                             aFatto :Boolean;
                             aX, aY :Longint);
begin
   Tempo   := aTempo;
   Tipo    := trLibero;
   if (aFatto) then
      Punti   := 1
   else
      Punti   := 0;
   PosX    := aX;
   PosY    := aY;
   Quarto  := aQrt;
end;


procedure TRealizzazione.SaveToStream (aStream: TStream;
                                       aRootNode: TXmlNode);
var
   Created  :Boolean;
   ADoc     :TNativeXml;
   Prefix   :String;
   Xxx      :Longint;
begin
   //LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TRealizzazione.SaveToStream ()', []);
   try
      try
         Created := False;
         aDoc := aRootNode.Document;
         Prefix := '';
         aDoc.XmlFormat := xfReadable;
         aDoc.UseFullNodes := True;
         //
         CreateNodeLink (aRootNode, Prefix+'/Quarto', '0').ValueAsInteger  := Quarto;
         CreateNodeLink (aRootNode, Prefix+'/Tempo',  '0').ValueAsInteger  := Tempo;
         CreateNodeLink (aRootNode, Prefix+'/Tipo',   '0').ValueAsInteger  := Ord (Tipo);
         CreateNodeLink (aRootNode, Prefix+'/Punti',  '0').ValueAsInteger  := Punti;
         CreateNodeLink (aRootNode, Prefix+'/PosX',   '-1').ValueAsInteger := PosX;
         CreateNodeLink (aRootNode, Prefix+'/PosY',   '-1').ValueAsInteger := PosY;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TRealizzazione.SaveToStream] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      //LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TRealizzazione.SaveToStream', []);
   end;
end;


procedure TRealizzazione.LoadFromStream (aStream: TStream;
                                         aRootNode: TXmlNode);
var
   ADoc     :TNativeXml;
   Prefix   :String;
   Xxx      :Longint;
   Tot      :Longint;
begin
   //LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TRealizzazione.LoadFromStream ()', []);
   try
      try
         aDoc := aRootNode.Document;
         Prefix := '';
         //
         Quarto      := CreateNodeLink (aRootNode, Prefix+'/Quarto', '0').ValueAsInteger;
         Tempo       := CreateNodeLink (aRootNode, Prefix+'/Tempo',  '0').ValueAsInteger;
         Tipo        := TTipoRealizzazione(CreateNodeLink (aRootNode, Prefix+'/Tipo',   '0').ValueAsInteger);
         Punti       := CreateNodeLink (aRootNode, Prefix+'/Punti',  '0').ValueAsInteger;
         PosX        := CreateNodeLink (aRootNode, Prefix+'/PosX',   '-1').ValueAsInteger;
         PosY        := CreateNodeLink (aRootNode, Prefix+'/PosY',   '-1').ValueAsInteger;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TRealizzazione.LoadFromStream] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      //LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TRealizzazione.LoadFromStream', []);
   end;
end;











{ TTeamFrameColors }

procedure TTeamFrameColors.Assign (aSrc :TTeamFrameColors);
begin
   BackgroundUnselected := aSrc.BackgroundUnselected;
   BackgroundSelected   := aSrc.BackgroundSelected  ;
   TextUnselected       := aSrc.TextUnselected      ;
   TextSelected         := aSrc.TextSelected        ;
   TeamSelected         := aSrc.TeamSelected        ;
   TeamUnselected       := aSrc.TeamUnselected      ;
   TeamBackSelected     := aSrc.TeamBackSelected    ;
   TeamBackUnselected   := aSrc.TeamBackUnselected  ;
   PointsSelected       := aSrc.PointsSelected      ;
   PointsUnselected     := aSrc.PointsUnselected    ;
   PuntiQrtSelected     := aSrc.PuntiQrtSelected    ;
   PuntiQrtUnselected   := aSrc.PuntiQrtUnselected  ;
   FalliSelected        := aSrc.FalliSelected       ;
   FalliUnselected      := aSrc.FalliUnselected     ;
end;


constructor TTeamFrameColors.Create;
begin
   inherited;
   Init;
end;


destructor TTeamFrameColors.Destroy;
begin
   inherited;
end;


procedure TTeamFrameColors.Init;
begin
   BackgroundUnselected := RGB (115,115,115);
   BackgroundSelected   := RGB (128,255,128);
   TextUnselected       := clWhite;
   TextSelected         := clBlack;
   TeamSelected         := clBlack;
   TeamUnselected       := clBlack;
   TeamBackSelected     := RGB (255,128,0);
   TeamBackUnselected   := RGB (255,128,0);
   PointsSelected       := clNavy;
   PointsUnselected     := clNavy;
   PuntiQrtSelected     := clNavy;
   PuntiQrtUnselected   := clNavy;
   FalliSelected        := clMaroon;
   FalliUnselected      := clMaroon;
end;


procedure TTeamFrameColors.Init (aCfg :TConfigClass);
begin
   if (aCfg = Nil) then
   begin
      Init;
      Exit;
   end;
   BackgroundUnselected := aCfg.TeamColorBackgroundUnselected.ValueAsInteger;
   BackgroundSelected   := aCfg.TeamColorBackgroundSelected.ValueAsInteger;
   TextUnselected       := aCfg.TeamColorTextUnselected.ValueAsInteger;
   TextSelected         := aCfg.TeamColorTextSelected.ValueAsInteger;
   TeamSelected         := aCfg.TeamColorNameTextSelected.ValueAsInteger;
   TeamUnselected       := aCfg.TeamColorNameTextUnselected.ValueAsInteger;
   TeamBackSelected     := aCfg.TeamColorNameBackSelected.ValueAsInteger;
   TeamBackUnselected   := aCfg.TeamColorNameBackUnselected.ValueAsInteger;
   PointsSelected       := aCfg.TeamColorPointsSelected.ValueAsInteger;
   PointsUnselected     := aCfg.TeamColorPointsUnselected.ValueAsInteger;
   PuntiQrtSelected     := aCfg.TeamColorPointQrtSelected.ValueAsInteger;
   PuntiQrtUnselected   := aCfg.TeamColorPointQrtUnselected.ValueAsInteger;
   FalliSelected        := aCfg.TeamColorFoulSelected.ValueAsInteger;
   FalliUnselected      := aCfg.TeamColorFoulUnselected.ValueAsInteger;
end;








{ TPlayerFrameColors }

constructor TPlayerFrameColors.Create;
begin
   inherited;
   Init;
end;


destructor TPlayerFrameColors.Destroy;
begin
   inherited;
end;


procedure TPlayerFrameColors.Init;
begin
   BackgroundUnselected := RGB (115,115,115);
   BackgroundSelected   := RGB (128,255,128);
   BackgroundInGioco    := RGB (200,200,255);
   FoulText[0]          := RGB (0,128,0);
   FoulBack[0]          := RGB (220,220,220);
   FoulText[1]          := RGB (0,0,255);
   FoulBack[1]          := RGB (255,210,210);
   FoulText[2]          := RGB (0,0,255);
   FoulBack[2]          := RGB (255,255,0);
   FoulText[3]          := RGB (255,0,0);
   FoulBack[3]          := RGB (255,145,145);
   FoulText[4]          := RGB (255,255,255);
   FoulBack[4]          := RGB (255,0,255);
   FoulText[5]          := RGB (255,255,255);
   FoulBack[5]          := RGB (0,0,0);
   TextUnselected       := clWhite;
   TextSelected         := clBlack;
   NameUnselected       := clWhite;
   NameSelected         := clBlack;
   NumberUnselected     := clWhite;
   NumberSelected       := clBlack;
   PointsSelected       := clBlack;
   PointsUnselected     := clWhite;
   QuintettoSelected    := clMaroon;
   QuintettoUnselected  := clMaroon;
end;


procedure TPlayerFrameColors.Init (aCfg :TConfigClass);
begin
   if (aCfg = Nil) then
   begin
      Init;
      Exit;
   end;
   BackgroundUnselected := aCfg.PlayerColorBackgroundUnselected.ValueAsInteger;
   BackgroundSelected   := aCfg.PlayerColorBackgroundSelected.ValueAsInteger;
   BackgroundInGioco    := aCfg.PlayerColorBackgroundInGioco.ValueAsInteger;
   FoulText[0]          := aCfg.PlayerColorFoulText0.ValueAsInteger;
   FoulBack[0]          := aCfg.PlayerColorFoulBack0.ValueAsInteger;
   FoulText[1]          := aCfg.PlayerColorFoulText1.ValueAsInteger;
   FoulBack[1]          := aCfg.PlayerColorFoulBack1.ValueAsInteger;
   FoulText[2]          := aCfg.PlayerColorFoulText2.ValueAsInteger;
   FoulBack[2]          := aCfg.PlayerColorFoulBack2.ValueAsInteger;
   FoulText[3]          := aCfg.PlayerColorFoulText3.ValueAsInteger;
   FoulBack[3]          := aCfg.PlayerColorFoulBack3.ValueAsInteger;
   FoulText[4]          := aCfg.PlayerColorFoulText4.ValueAsInteger;
   FoulBack[4]          := aCfg.PlayerColorFoulBack4.ValueAsInteger;
   FoulText[5]          := aCfg.PlayerColorFoulText5.ValueAsInteger;
   FoulBack[5]          := aCfg.PlayerColorFoulBack5.ValueAsInteger;
   TextUnselected       := aCfg.PlayerColorTextUnselected.ValueAsInteger;
   TextSelected         := aCfg.PlayerColorTextSelected.ValueAsInteger;
   NameUnselected       := aCfg.PlayerColorNameUnselected.ValueAsInteger;
   NameSelected         := aCfg.PlayerColorNameSelected.ValueAsInteger;
   NumberUnselected     := aCfg.PlayerColorNumberUnselected.ValueAsInteger;
   NumberSelected       := aCfg.PlayerColorNumberSelected.ValueAsInteger;
   PointsUnselected     := aCfg.PlayerColorPointsUnselected.ValueAsInteger;
   PointsSelected       := aCfg.PlayerColorPointsSelected.ValueAsInteger;
   QuintettoUnselected  := aCfg.PlayerColorQuintettoUnselected.ValueAsInteger;
   QuintettoSelected    := aCfg.PlayerColorQuintettoSelected.ValueAsInteger;
end;








{ TSoundEventHelper }

procedure TSoundEventHelper.SetFrom (aInt :Integer);
begin
   if ((LowInt <= aInt) and (HighInt >= aInt)) then
      Self := TSoundEvent(aInt);
end;


procedure TSoundEventHelper.SetFrom (aStr :String);
var
   Xxx   :TSoundEvent;
begin
   aStr := UpperTrim (aStr);
   for Xxx:=Low(TSoundEvent) to High(TSoundEvent) do
   begin
      if (aStr = UpperTrim (Xxx.ToString())) then
      begin
         Self := Xxx;
         Exit;
      end;
   end;
end;


function TSoundEventHelper.HighInt :Longint;
begin
   Result := Ord (High (TSoundEvent));
end;


function TSoundEventHelper.LowInt :Longint;
begin
   Result := Ord (Low (TSoundEvent));
end;


function TSoundEventHelper.ToInt :Longint;
begin
   Result := Ord (Self);
end;


class function TSoundEventHelper.ToInt (Value :TSoundEvent) :Longint;
begin
   Result := Value.ToInt();
end;


class function TSoundEventHelper.ToString (Value :TSoundEvent): String;
begin
   Result := Value.ToString();
end;


function TSoundEventHelper.ToString: String;
begin
   Result := GetEnumName (TypeInfo(TSoundEvent), LongInt(Self));
end;







{ TQuarterTeam }

constructor TQuarterTeam.Create (aNum :Integer);
begin
   inherited Create;
   NumQuarto := aNum;
   Reset;
end;


destructor TQuarterTeam.Destroy;
begin
   inherited;
end;


procedure TQuarterTeam.Assign (aSrc :TQuarterTeam);
begin
   NumQuarto   := aSrc.NumQuarto;
   Punti       := aSrc.Punti;
   FalliQrt    := aSrc.FalliQrt;
   Bonus       := aSrc.Bonus;
   Status      := aSrc.Status;
end;


procedure TQuarterTeam.Reset;
begin
   Punti    := 0;
   FalliQrt := 0;
   Bonus    := False;
   Status   := qsNotPlayed;
end;


procedure TQuarterTeam.LoadFromDB (aMatchID, aQrtNum  :Integer;
                                   MyTm: Boolean);
begin
   //LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TQuarterTeam.LoadFromDB (%d, %d, %s)', [aMatchId, aQrtNum, BoolToStr(MyTm)]);
   try
      try
         if (DMod.TblQuarter.Locate ('LinkMatchHeader;Num', VarArrayOf ([aMatchID, aQrtNum]), [])) then
         begin
            if (MyTm) then
            begin
               Status.SetFrom (DMod.TblQuarterStatus.AsInteger);
               Bonus := DMod.TblQuarterMyTeamBonus.AsBoolean;
               FalliQrt := DMod.TblQuarterMyTeamFouls.AsInteger;
               Punti := DMod.TblQuarterMyTeamCurrPoint.AsInteger;
            end
            else
            begin
               Bonus := DMod.TblQuarterOppTeamBonus.AsBoolean;
               FalliQrt := DMod.TblQuarterOppTeamFouls.AsInteger;
               Punti := DMod.TblQuarterOppTeamCurrPoint.AsInteger;
            end;
         end;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TQuarterTeam.LoadFromDB] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      //LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TQuarterTeam.LoadFromDB', []);
   end;
end;


procedure TQuarterTeam.SaveToDB (aMatchId  :LongInt;
                                 aQrtNum   :LongInt;
                                 MyTm      :Boolean);
begin
   //LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TQuarterTeam.SaveToDB (%d, %d, %s)', [aMatchId, aQrtNum, BoolToStr(Mytm)]);
   try
      try
         if (DMod.TblQuarter.Locate ('LinkMatchHeader;Num', VarArrayOf ([aMatchID, aQrtNum]), [])) then
            DMod.TblQuarter.Edit
         else
            DMod.TblQuarter.Append;
         try
            (*
            DMod.TblQuarterIsRegular.AsBoolean := (aQrtNum < 5);
            DMod.TblQuarterNum.AsInteger := aQrtNum;
            DMod.TblQuarterLinkMatchHeader.AsInteger := aMatchId;
            DMod.TblQuarterStatus.AsInteger := Status.ToInt();
            *)
            if (MyTm) then
            begin
               DMod.TblQuarterIsRegular.AsBoolean := (aQrtNum < 5);
               DMod.TblQuarterNum.AsInteger := aQrtNum;
               DMod.TblQuarterLinkMatchHeader.AsInteger := aMatchId;
               DMod.TblQuarterStatus.AsInteger := Status.ToInt();

               DMod.TblQuarterMyTeamBonus.AsBoolean := Bonus;
               DMod.TblQuarterMyTeamFouls.AsInteger := FalliQrt;
               DMod.TblQuarterMyTeamCurrPoint.AsInteger := Punti;
               //
               DMod.TblQuarterOppTeamBonus.AsBoolean := DMod.TblQuarterOppTeamBonus.AsBoolean;
            end
            else
            begin
               DMod.TblQuarterOppTeamBonus.AsBoolean := Bonus;
               DMod.TblQuarterOppTeamFouls.AsInteger := FalliQrt;
               DMod.TblQuarterOppTeamCurrPoint.AsInteger := Punti;
               //
               DMod.TblQuarterMyTeamBonus.AsBoolean := DMod.TblQuarterMyTeamBonus.AsBoolean;
            end;
         finally
            DMod.TblQuarter.Post;
         end;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TQuarterTeam.SaveToDB (%d, %d, %s)] Exception "%s"', [aMatchId, aQrtNum, BoolToStr(Mytm), E.Message]);
         end;
      end;
   finally
      //LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TQuarterTeam.SaveToDB', []);
   end;
end;

procedure TQuarterTeam.SetFalli(const Value: Integer);
begin
   fFalli := Value;
   Bonus := (fFalli >= 4);
end;









{ TOperationTypeHelper }

class function TOperationTypeHelper.ToInt (Value :TOperationType) :Longint;
begin
   Result := Value.ToInt();
end;


procedure TOperationTypeHelper.SetFrom (aStr :String);
var
   Xxx   :TOperationType;
begin
   aStr := UpperTrim (aStr);
   for Xxx:=Low(TOperationType) to High(TOperationType) do
   begin
      if (aStr = UpperTrim (Xxx.ToString())) then
      begin
         Self := Xxx;
         Exit;
      end;
   end;
end;


procedure TOperationTypeHelper.SetFrom (aInt :Integer);
begin
   if ((LowInt <= aInt) and (HighInt >= aInt)) then
      Self := TOperationType(aInt);
end;


procedure TOperationTypeHelper.SetFromDesc (aStr :String);
var
   Xxx   :TOperationType;
begin
   aStr := UpperTrim (aStr);
   for Xxx:=Low(TOperationType) to High(TOperationType) do
   begin
      if (aStr = UpperTrim (Xxx.Desc)) then
      begin
         Self := Xxx;
         Exit;
      end;
   end;
end;


function TOperationTypeHelper.Desc :string;
begin
   case Self of
      totTLYes:         Result := 'TL Ok     ';
      totTLNo:          Result := 'TL no     ';
      totT2Yes:         Result := 'T2 Ok     ';
      totT2No:          Result := 'T2 no     ';
      totT3Yes:         Result := 'T3 Ok     ';
      totT3No:          Result := 'T3 No     ';
      totFalloFatto:    Result := 'FFatto    ';
      totFalloSubito:   Result := 'FSubito   ';
      totRimbDifesa:    Result := 'Rimb Dif  ';
      totRimbAttacco:   Result := 'Rimb Att  ';
      totPPersa:        Result := 'P Persa   ';
      totPRecuperata:   Result := 'P Recup   ';
      totStopSubita:    Result := 'Stop Sub  ';
      totStopFatta:     Result := 'Stop Fat  ';
      totAssist:        Result := 'Assist    ';
      totSostituz:      Result := 'Sostit    ';
      totQuintetto:     Result := 'Quintet   ';
      totTimeStart:     Result := 'TimeStart ';
      totTimeStop:      Result := 'TimeStop  ';
      totCheckPoint:    Result := 'Checkpoint';
      else              Result := '?????     ';
   end;
end;


function TOperationTypeHelper.HighInt :Longint;
begin
   Result := Ord (High (TOperationType));
end;


function TOperationTypeHelper.LowInt :Longint;
begin
   Result := Ord (Low (TOperationType));
end;


function TOperationTypeHelper.ToInt :Longint;
begin
   Result := Ord (Self);
end;


function TOperationTypeHelper.ToString :String;
begin
   Result := GetEnumName (TypeInfo(TOperationType), LongInt(Self));
end;


class function TOperationTypeHelper.ToString (Value :TOperationType) :String;
begin
   Result := Value.ToString();
end;









{ TOperation }

constructor TOperation.Create;
begin
   try
      inherited;
      fQuarter := 0;
      fTime    := 600;
      fOper    := totUndefined;
      fMyTeam  := True;
      fPlayer1 := Nil;
      fPlayer2 := Nil;
      fDesc    := '';
      fDesc2   := '';
      fIParam  := 0;
      fCounter := 0;
      fInternalStatus := OperIntStatus_None;
   except
      on E:Exception do
      begin
         UpdateExceptionCounter;
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TOperation.Create ()] Exception "%s"', [E.Message]);
      end;
   end;
end;


constructor TOperation.Create (aQrt    :Integer;
                               aTime   :Integer;
                               aOper   :TOperationType;
                               aMyTeam :Boolean;
                               aPlr1   :TMatchPlayer;
                               aPlr2   :TMatchPlayer;
                               aDesc   :String;
                               aIParam :Longint;
                               aDesc2  :String);
begin
   try
      inherited Create;
      fQuarter := aQrt;
      fTime    := aTime;
      fOper    := aOper;
      fMyTeam  := aMyTeam;
      fPlayer1 := aPlr1;
      fPlayer2 := aPlr2;
      fDesc    := aDesc;
      fDesc2   := aDesc2;
      IParam   := aIParam;
      fCounter := 0;
      fInternalStatus := OperIntStatus_None;
   except
      on E:Exception do
      begin
         UpdateExceptionCounter;
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TOperation.Create (%d, %d, %s, %s, %s, %s, %s, %d)] Exception "%s"', [aQrt, aTime, aOper.ToString(), aMyTeam.ToString(), IIF((aPlr1<>nil), 'Plr1', 'Nil'), IIF((aPlr2<>nil), 'Plr2', 'Nil'), aDesc, aIParam, E.Message]);
      end;
   end;
end;


constructor TOperation.Create (aOper: TOperationType;
                               aMyTeam: Boolean;
                               aPlr1: TMatchPlayer;
                               aPlr2: TMatchPlayer;
                               aDesc: String;
                               aIParam: Integer;
                               aDesc2 :String);
begin
   try
      inherited Create;
      fQuarter := MainWind.GetCurrQuarter();
      fTime    := MainWind.GetTimeInSec();
      fOper    := aOper;
      fMyTeam  := aMyTeam;
      fPlayer1 := aPlr1;
      fPlayer2 := aPlr2;
      fDesc    := aDesc;
      fDesc2   := aDesc2;
      IParam   := aIParam;
      fCounter := 0;
      fInternalStatus := OperIntStatus_None;
   except
      on E:Exception do
      begin
         UpdateExceptionCounter;
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TOperation.Create (%s, %s, %s, %s, %s, %d)] Exception "%s"', [aOper.ToString(), aMyTeam.ToString(), IIF((aPlr1<>nil), 'Plr1', 'Nil'), IIF((aPlr2<>nil), 'Plr2', 'Nil'), aDesc, aIParam, E.Message]);
      end;
   end;
end;


constructor TOperation.Create (FromStr    :string;
                               aMyTeam    :TMatchTeam;
                               aOppTeam   :TMatchTeam);
var
   Lst   :TStringList;
   S1    :string;
   S2    :string;
   P     :LongInt;
   Op    :TOperationType;
   Team  :TMatchTeam;
begin
   try
      FromStr := Trim (FromStr);
      inherited Create;
      fQuarter := 0;
      fTime    := 600;
      fOper    := totUndefined;
      fMyTeam  := True;
      fPlayer1 := Nil;
      fPlayer2 := Nil;
      fDesc    := '';
      fDesc2   := '';
      fIParam  := 0;
      fCounter := 0;
      Team     := nil;
      fInternalStatus := OperIntStatus_None;
      if (FromStr <> '') then
      begin
         Lst := TStringList.Create;
         try
            SeparaTokens (FromStr, '|', Lst);
            if (Lst.Count > 3) then
            begin
               (*
                  Lst[0]: Quarter
                      1 : Time
                      2 : Operation descr
                      3 : starting from here depends on operation type
               *)
               // Quarter
               S1 := Copy (Lst[0], 2, 1000);
               fQuarter := StrToIntDef (S1, 0);
               // Time
               P := Pos (':', Lst[1]);
               S1 := Copy (Lst[1], 1, P-1);
               S2 := Copy (Lst[1], P+1, 1000);
               fTime := 60*StrToIntDef (S1, 0) + StrToIntDef (S2, 0);
               // Oper
               Op.SetFromDesc (Trim (Lst[2]));
               case Op of
                  totTLYes,
                  totTLNo:
                  begin
                     (*
                        3 : Operation time
                        4 : player number
                        5 : player name
                        6 : punteggio
                        7 : desc
                     *)
                     fOper := Op;
                     MyTeam := (UpperTrim(Lst[3]) = 'MYTEAM');
                     if (MyTeam) then
                        Team := aMyTeam
                     else
                        Team := aOppTeam;
                     if (Team <> nil) then
                     begin
                        Player1 := Team.Player (Lst[4]);
                        Player2 := nil;
                     end;
                     Desc := Lst[7];
                  end;
                  totT2Yes,
                  totT2No,
                  totT3Yes,
                  totT3No:
                  begin
                     (*
                        3 : Operation time
                        4 : player number
                        5 : player name
                        6 : punteggio
                        7 : desc
                        8 : desc2
                     *)
                     fOper := Op;
                     MyTeam := (UpperTrim(Lst[3]) = 'MYTEAM');
                     if (MyTeam) then
                        Team := aMyTeam
                     else
                        Team := aOppTeam;
                     if (Team <> nil) then
                     begin
                        Player1 := Team.Player (Lst[4]);
                        Player2 := nil;
                     end;
                     Desc := Lst[7];
                     if (Lst.Count > 8) then
                        fDesc2 := Lst[8];
                  end;
                  totFalloFatto:
                  begin
                     (*
                        3 : Operation time
                        4 : player number
                        5 : player name
                        6 : desc
                     *)
                     fOper := Op;
                     MyTeam := (UpperTrim(Lst[3]) = 'MYTEAM');
                     if (MyTeam) then
                        Team := aMyTeam
                     else
                        Team := aOppTeam;
                     if (Team <> nil) then
                     begin
                        Player1 := Team.Player (Lst[4]);
                        Player2 := nil;
                     end;
                     Desc := Lst[6];
                  end;
                  totFalloSubito:
                  begin
                     (*
                        3 : Operation time
                        4 : player number
                        5 : player name
                     *)
                     fOper := Op;
                     MyTeam := (UpperTrim(Lst[3]) = 'MYTEAM');
                     if (MyTeam) then
                        Team := aMyTeam
                     else
                        Team := aOppTeam;
                     if (Team <> nil) then
                     begin
                        Player1 := Team.Player (Lst[4]);
                        Player2 := nil;
                     end;
                  end;
                  totRimbDifesa,
                  totRimbAttacco:
                  begin
                     (*
                        3 : Operation time
                        4 : player number
                        5 : player name
                     *)
                     fOper := Op;
                     MyTeam := (UpperTrim(Lst[3]) = 'MYTEAM');
                     if (MyTeam) then
                        Team := aMyTeam
                     else
                        Team := aOppTeam;
                     if (Team <> nil) then
                     begin
                        Player1 := Team.Player (Lst[4]);
                        Player2 := nil;
                     end;
                  end;
                  totPPersa:
                  begin
                     (*
                        3 : Operation time
                        4 : player number
                        5 : player name
                        6 : desc
                     *)
                     fOper := Op;
                     MyTeam := (UpperTrim(Lst[3]) = 'MYTEAM');
                     if (MyTeam) then
                        Team := aMyTeam
                     else
                        Team := aOppTeam;
                     if (Team <> nil) then
                     begin
                        Player1 := Team.Player (Lst[4]);
                        Player2 := nil;
                     end;
                     Desc := Lst[6];
                  end;
                  totPRecuperata:
                  begin
                     (*
                        3 : Operation time
                        4 : player number
                        5 : player name
                     *)
                     fOper := Op;
                     MyTeam := (UpperTrim(Lst[3]) = 'MYTEAM');
                     if (MyTeam) then
                        Team := aMyTeam
                     else
                        Team := aOppTeam;
                     if (Team <> nil) then
                     begin
                        Player1 := Team.Player (Lst[4]);
                        Player2 := nil;
                     end;
                  end;
                  totStopSubita,
                  totStopFatta:
                  begin
                     (*
                        3 : Operation time
                        4 : player number
                        5 : player name
                     *)
                     fOper := Op;
                     MyTeam := (UpperTrim(Lst[3]) = 'MYTEAM');
                     if (MyTeam) then
                        Team := aMyTeam
                     else
                        Team := aOppTeam;
                     if (Team <> nil) then
                     begin
                        Player1 := Team.Player (Lst[4]);
                        Player2 := nil;
                     end;
                  end;
                  totAssist:
                  begin
                     fOper := Op;
                     MyTeam := (UpperTrim(Lst[3]) = 'MYTEAM');
                     (*
                        3 : Operation time
                        4 : player number
                        5 : player name
                     *)
                     MyTeam := (UpperTrim(Lst[3]) = 'MYTEAM');
                     if (MyTeam) then
                        Team := aMyTeam
                     else
                        Team := aOppTeam;
                     if (Team <> nil) then
                     begin
                        Player1 := Team.Player (Lst[4]);
                        Player2 := nil;
                     end;
                  end;
                  totSostituz:
                  begin
                     (*
                        3 : Operation time
                        4 : player1 number
                        5 : player2 number
                     *)
                     fOper := Op;
                     MyTeam := (UpperTrim(Lst[3]) = 'MYTEAM');
                     if (MyTeam) then
                        Team := aMyTeam
                     else
                        Team := aOppTeam;
                     if (Team <> nil) then
                     begin
                        Player1 := Team.Player (Copy (Lst[4], 4, 100));
                        Player2 := Team.Player (Copy (Lst[5], 3, 100));
                     end;
                  end;
                  totQuintetto:
                  begin
                     (*
                        3 : Operation time
                        4 : player number
                        5 : player name
                     *)
                     fOper := Op;
                     MyTeam := (UpperTrim(Lst[3]) = 'MYTEAM');
                     if (MyTeam) then
                        Team := aMyTeam
                     else
                        Team := aOppTeam;
                     if (Team <> nil) then
                     begin
                        Player1 := Team.Player (Lst[4]);
                        Player2 := nil;
                     end;
                  end;
                  totTimeStart:
                  begin
                     (*
                        3 : IParam (1=QuarterStart; else TimeStart)
                     *)
                     fOper := Op;
                     if (StrToIntDef (Lst[3], 0) = 0) then
                        IParam := 0
                     else
                        IParam := 1;
                  end;
                  totTimeStop:
                  begin
                     (*
                        3 : IParam (1=QuarterStop; else TimeStop)
                     *)
                     fOper := Op;
                     if (StrToIntDef (Lst[3], 0) = 0) then
                        IParam := 0
                     else
                        IParam := 1;
                  end;
                  totCheckPoint:
                  begin
                     fOper := Op;
                  end;
                  else
                  begin
                  end;
               end;
               (*
               case Op of
                  totTLYes:         S2 := Format ('%s|%s|(%s)|[%s]', [Tm, Player1.PlayNumber2, Player1.Name, ''{fPti}]);
                  totTLNo:          S2 := Format ('%s|%s|(%s)|[%s]', [Tm, Player1.PlayNumber2, Player1.Name, ''{fPti}]);
                  totT2Yes:         S2 := Format ('%s|%s|(%s)|[%s]|%s', [Tm, Player1.PlayNumber2, Player1.Name, ''{fPti}, Desc]);
                  totT2No:          S2 := Format ('%s|%s|(%s)|[%s]|%s', [Tm, Player1.PlayNumber2, Player1.Name, ''{fPti}, Desc]);
                  totT3Yes:         S2 := Format ('%s|%s|(%s)|[%s]|%s', [Tm, Player1.PlayNumber2, Player1.Name, ''{fPti}, Desc]);
                  totT3No:          S2 := Format ('%s|%s|(%s)|[%s]|%s', [Tm, Player1.PlayNumber2, Player1.Name, ''{fPti}, Desc]);
                  -totFalloFatto:    S2 := Format ('%s|%s|(%s)|%s', [Tm, Player1.PlayNumber2, Player1.Name, Desc]);
                  -totFalloSubito:   S2 := Format ('%s|%s|(%s)', [Tm, Player1.PlayNumber2, Player1.Name]);
                  -totRimbDifesa:    S2 := Format ('%s|%s|(%s)', [Tm, Player1.PlayNumber2, Player1.Name]);
                  -totRimbAttacco:   S2 := Format ('%s|%s|(%s)', [Tm, Player1.PlayNumber2, Player1.Name]);
                  -totPPersa:        S2 := Format ('%s|%s|(%s)|%s', [Tm, Player1.PlayNumber2, Player1.Name, Desc]);
                  -totPRecuperata:   S2 := Format ('%s|%s|(%s)', [Tm, Player1.PlayNumber2, Player1.Name]);
                  -totStopSubita:    S2 := Format ('%s|%s|(%s)', [Tm, Player1.PlayNumber2, Player1.Name]);
                  -totStopFatta:     S2 := Format ('%s|%s|(%s)', [Tm, Player1.PlayNumber2, Player1.Name]);
                  -totAssist:        S2 := Format ('%s|%s|(%s)', [Tm, Player1.PlayNumber2, Player1.Name]);
                  -totSostituz:      S2 := Format ('%s|Out%s|In%s', [Tm, Player1.PlayNumber2, Player2.PlayNumber2]);
                  -totQuintetto:     S2 := Format ('%s|%s|%s', [Tm, Player1.PlayNumber2, Player1.Name]);
                  -totTimeStart:     S2 := IIF ((IParam=1), 'QrtStart', 'TimStart');
                  -totTimeStop:      S2 := IIF ((IParam=1), 'QrtStop ', 'TimStop ');
                  -totCheckPoint:    S2 := '-------';
                  else              S2 := '       ';
               end;
               *)
            end;
         finally
            Lst.Free;
         end;
      end;
   except
      on E:Exception do
      begin
         UpdateExceptionCounter;
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TOperation.Create (%s)] Exception "%s"', [FromStr, E.Message]);
      end;
   end;
end;


destructor TOperation.Destroy;
begin
   fPlayer1 := Nil;
   fPlayer2 := Nil;
   fDesc    := '';
   inherited;
end;


function TOperation.GetMyTeamStr :string;
begin
   Result := '';
   try
      if (MyTeam) then
         Result := 'MyTeam  '
      else
         Result := 'OppoTeam';
      case Oper of
         totTimeStart:     Result := IIF ((IParam=1), 'Quarter Start', 'Time Start');
         totTimeStop:      Result := IIF ((IParam=1), 'Quarter Stop', 'Time Stop');
         totCheckPoint:    Result := '';
      end;
   except
      on E:Exception do
      begin
         UpdateExceptionCounter;
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TOperation.GetMyTeamStr] Exception "%s"', [E.Message]);
      end;
   end;
end;


function TOperation.GetPlayer1Str :string;
begin
   Result := '';
   if (Player1 = nil) then
      Exit;
   Result := Player1.PlayNumber2+' ('+Player1.Name+')';
   case Oper of
      totSostituz:      Result := 'Out '+Result;
      //totQuintetto:     Result := Format ('%s|%s|%s', [Tm, Player1.PlayNumber2, Player1.Name]);
      totTimeStart:     Result := '';
      totTimeStop:      Result := '';
      totCheckPoint:    Result := '';
   end;
end;


function TOperation.GetPlayer2Str :string;
begin
   Result := '';
   if (Player2 = nil) then
      Exit;
   Result := Player2.PlayNumber2+' ('+Player2.Name+')';
   case Oper of
      totSostituz:      Result := 'In  '+Result;
      //totQuintetto:     Result := Format ('%s|%s|%s', [Tm, Player2.PlayNumber2, Player2.Name]);
      totTimeStart:     Result := '';
      totTimeStop:      Result := '';
      totCheckPoint:    Result := '';
   end;
end;


function TOperation.IsSame(aOper: TOperation): Boolean;
var
   P1 :Boolean;
   P2 :Boolean;
begin
   Result := False;
   if (aOper <> nil) then
   begin
      if ((fPlayer1 <> nil) and (aOper.Player1 <> Nil)) then
      begin
         P1 := (fPlayer1.PlayNumber = aOper.Player1.PlayNumber);
      end
      else if ((fPlayer1 = nil) and (aOper.Player1 = Nil)) then
      begin
         P1 := True;
      end
      else
         P1 := False;
      //
      if ((fPlayer2 <> nil) and (aOper.Player2 <> Nil)) then
      begin
         P2 := (fPlayer2.PlayNumber = aOper.Player2.PlayNumber);
      end
      else if ((fPlayer2 = nil) and (aOper.Player2 = Nil)) then
      begin
         P2 := True;
      end
      else
         P2 := False;
      //
      Result := ((fQuarter = aOper.Quarter) and
                 (fTime = aOper.Time) and
                 (fOper = aOper.Oper) and
                 (fMyTeam = aOper.MyTeam) and
                 (P1) and
                 (P2) and
                 (fDesc = aOper.Desc) and
                 (fCounter = aOper.Counter) and
                 (fInternalStatus = aOper.InternalStatus));
   end;
end;

procedure TOperation.SetIParam (const Value :LongInt);
begin
   fIParam := Value;
end;


function TOperation.ToString :string;
var
   S1    :string;
   S2    :string;
   Tm    :string;
   P1Num :string;
   P1Na  :string;
   P2Num :string;
begin
   Result := '';
   try
      if (MyTeam) then
         Tm := 'MyTeam  '
      else
         Tm := 'OppoTeam';
      if (Player1 <> nil) then
      begin
         P1Num := Player1.PlayNumber2;
         P1Na := Player1.Name;
      end
      else
      begin
         P1Num := '';
         P1Na := '';
      end;
      if (Player2 <> nil) then
         P2Num := Player2.PlayNumber2
      else
         P2Num := '';
      case Oper of
         totTLYes:         S2 := Format ('%s|%s|(%s)|[%s]|%s', [Tm, P1Num, P1Na, '', Desc]);
         totTLNo:          S2 := Format ('%s|%s|(%s)|[%s]|%s', [Tm, P1Num, P1Na, '', Desc]);
         totT2Yes:         S2 := Format ('%s|%s|(%s)|[%s]|%s|%s', [Tm, P1Num, P1Na, '', Desc, fDesc2]);
         totT2No:          S2 := Format ('%s|%s|(%s)|[%s]|%s|%s', [Tm, P1Num, P1Na, '', Desc, fDesc2]);
         totT3Yes:         S2 := Format ('%s|%s|(%s)|[%s]|%s|%s', [Tm, P1Num, P1Na, '', Desc, fDesc2]);
         totT3No:          S2 := Format ('%s|%s|(%s)|[%s]|%s|%s', [Tm, P1Num, P1Na, '', Desc, fDesc2]);
         totFalloFatto:    S2 := Format ('%s|%s|(%s)|%s',      [Tm, P1Num, P1Na, Desc]);
         totFalloSubito:   S2 := Format ('%s|%s|(%s)',         [Tm, P1Num, P1Na]);
         totRimbDifesa:    S2 := Format ('%s|%s|(%s)',         [Tm, P1Num, P1Na]);
         totRimbAttacco:   S2 := Format ('%s|%s|(%s)',         [Tm, P1Num, P1Na]);
         totPPersa:        S2 := Format ('%s|%s|(%s)|%s',      [Tm, P1Num, P1Na, Desc]);
         totPRecuperata:   S2 := Format ('%s|%s|(%s)',         [Tm, P1Num, P1Na]);
         totStopSubita:    S2 := Format ('%s|%s|(%s)',         [Tm, P1Num, P1Na]);
         totStopFatta:     S2 := Format ('%s|%s|(%s)',         [Tm, P1Num, P1Na]);
         totAssist:        S2 := Format ('%s|%s|(%s)',         [Tm, P1Num, P1Na]);
         totSostituz:      S2 := Format ('%s|Out%s|In%s',      [Tm, P1Num, P2Num]);
         totQuintetto:     S2 := Format ('%s|%s|%s|%s',        [Tm, P1Num, P1Na, Desc2]);
         totTimeStart:     S2 := IIF ((IParam=1), 'QrtStart', 'TimStart');
         totTimeStop:      S2 := IIF ((IParam=1), 'QrtStop ', 'TimStop ');
         totCheckPoint:    S2 := '-------';
         else              S2 := '       ';
      end;
      S1 := Format ('Q%d|%s|%s|%s', [Quarter, GetTimeStr(Time), Oper.Desc, S2]);
      Result := S1;
   except
      on E:Exception do
      begin
         UpdateExceptionCounter;
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TOperation.ToString] Exception "%s"', [E.Message]);
      end;
   end;
end;


(*
function TOperation.ToJSonString :string;
var
   S1    :string;
   S2    :string;
   Tm    :string;
   P1Num :string;
   P1Na  :string;
   P2Num :string;
   P2Na  :string;
   jsObj :TlkJSONobject;
   jsData:TlkJSONobject;
   jsDt1 :TlkJSONobject;
   jsDt2 :TlkJSONobject;
   lv:Integer;
begin
   Result := '';
   try
      jsData := TlkJSONobject.Create(True);
      jsObj := TlkJSONobject.Create(True);
      jsObj.Add('Qrt', Format ('Q%d', [Quarter]));
      jsObj.Add('Time', GetTimeStr(Time));
      jsObj.Add('Operation', Oper.Desc);
      case Oper of
         totTimeStart,
         totTimeStop:   jsObj.Add('Actor', 'TIME');
         totCheckPoint: jsObj.Add('Actor', 'CheckPoint');
         else
         begin
            if (MyTeam) then
               jsObj.Add('Actor', 'MyTeam')
            else
               jsObj.Add('Actor', 'OppoTeam');
         end;
      end;
      if (MyTeam) then
         Tm := 'MyTeam  '
      else
         Tm := 'OppoTeam';
      if (Player1 <> nil) then
      begin
         P1Num := Player1.PlayNumber2;
         P1Na := Player1.Name;
      end
      else
      begin
         P1Num := '';
         P1Na := '';
      end;
      if (Player2 <> nil) then
      begin
         P2Num := Player2.PlayNumber2;
         P2Na := Player2.Name;
      end
      else
      begin
         P2Num := '';
         P2Na := '';
      end;
      case Oper of
         totTLYes,
         totTLNo,
         totT2Yes,
         totT2No,
         totT3Yes,
         totT3No:
         begin
            jsDt1 := TlkJSONobject.Create(True);
            jsDt1.Add('Number', P1Num);
            jsDt1.Add('Name', P1Na);
            jsData.Add ('Player', jsDt1);
         end;
         totFalloFatto,
         totFalloSubito:
         begin
            jsDt1 := TlkJSONobject.Create(True);
            jsDt1.Add('Number', P1Num);
            jsDt1.Add('Name', P1Na);
            jsData.Add ('Player', jsDt1);
         end;
         totRimbDifesa:    S2 := Format ('%s|%s|(%s)',         [Tm, P1Num, P1Na]);
         totRimbAttacco:   S2 := Format ('%s|%s|(%s)',         [Tm, P1Num, P1Na]);
         totPPersa:        S2 := Format ('%s|%s|(%s)|%s',      [Tm, P1Num, P1Na, Desc]);
         totPRecuperata:   S2 := Format ('%s|%s|(%s)',         [Tm, P1Num, P1Na]);
         totStopSubita:    S2 := Format ('%s|%s|(%s)',         [Tm, P1Num, P1Na]);
         totStopFatta:     S2 := Format ('%s|%s|(%s)',         [Tm, P1Num, P1Na]);
         totAssist:        S2 := Format ('%s|%s|(%s)',         [Tm, P1Num, P1Na]);
         totSostituz:      S2 := Format ('%s|Out%s|In%s',      [Tm, P1Num, P2Num]);
         totQuintetto:     S2 := Format ('%s|%s|%s|%s',        [Tm, P1Num, P1Na, Desc2]);
         totTimeStart:     S2 := IIF ((IParam=1), 'QrtStart', 'TimStart');
         totTimeStop:      S2 := IIF ((IParam=1), 'QrtStop ', 'TimStop ');
         totCheckPoint:    S2 := '-------';
         else              S2 := '       ';
      end;
      jsObj.Add('Data', jsData);
      jsObj.Add('Descr', Desc);
      jsObj.Add('Descr-2', Desc2);
      lv := 0;
      S1 := GenerateReadableText(jsObj,lv);
      Result := S1;
   except
      on E:Exception do
      begin
         UpdateExceptionCounter;
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TOperation.ToJSonString] Exception "%s"', [E.Message]);
      end;
   end;
end;
*)


procedure TOperation.Assign (aSrc :TOperation);
begin
   try
      if (aSrc <> nil) then
      begin
         fQuarter := aSrc.fQuarter;
         fTime    := aSrc.fTime;
         fOper    := aSrc.fOper;
         fMyTeam  := aSrc.fMyTeam;
         fPlayer1 := aSrc.fPlayer1;
         fPlayer2 := aSrc.fPlayer2;
         fDesc    := aSrc.fDesc;
         fCounter := aSrc.fCounter;
         IParam   := aSrc.IParam;
         fInternalStatus := aSrc.InternalStatus;
      end;
   except
      on E:Exception do
      begin
         UpdateExceptionCounter;
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TOperation.Assign] Exception "%s"', [E.Message]);
      end;
   end;
end;


procedure TOperation.DescToGlobalPos;
var
   Lst   :TStringList;
   x,y   :Longint;
begin
   GlobalPx := -1;
   GlobalPy := -1;
   if (fDesc2 <> '') then
   begin
      Lst := TStringList.Create;
      SeparaTokens(fDesc2, ';', Lst);
      if (Lst.Count = 2) then
      begin
         x := StrToIntDef (Trim(Lst[0]), -1);
         y := StrToIntDef (Trim(Lst[1]), -1);
         if ((x > -1) and (y > -1)) then
         begin
            GlobalPx := x;
            GlobalPy := y;
         end;
      end;
   end;
end;










{ TOperationList }

constructor TOperationList.Create;
begin
   inherited;
   fCounter := 0;
   Modified := False;
   OnChanged := Nil;
end;


destructor TOperationList.Destroy;
begin
   inherited;
end;


procedure TOperationList.Add (aItem :TOperation);
begin
   Inc (fCounter);
   aItem.fCounter := fCounter;
   inherited Add (aItem);
   Sort;
   Modified := True;
   if (@OnChanged <> nil) then
      OnChanged();
   if (LogOperation) then
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Info, '********** %s', [aItem.ToString]);
end;


procedure TOperationList.AddNoSort (aItem :TOperation);
begin
   Inc (fCounter);
   aItem.fCounter := fCounter;
   inherited Add (aItem);
   if (LogOperation) then
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Info, '********** %s', [aItem.ToString]);
end;


procedure TOperationList.Refresh;
begin
   Sort;
   Modified := True;
   if (@OnChanged <> nil) then
      OnChanged();
end;


function TOperationList.Compare (I1, I2 :Integer): Integer;
var
   Itm1, Itm2 :TOperation;
begin
   Result := 0;
   Itm1 := TOperation(Self.Items[I1]);
   Itm2 := TOperation(Self.Items[I2]);
   if (Itm1.Quarter < Itm2.Quarter) then
   begin
      Result := -1;
      Exit;
   end
   else if (Itm1.Quarter > Itm2.Quarter) then
   begin
      Result := +1;
      Exit;
   end
   else
   begin
      // stesso quarto: guardo il tempo
      if (Itm1.Time > Itm2.Time) then
      begin
         Result := -1;
         Exit;
      end
      else if (Itm1.Time < Itm2.Time) then
      begin
         Result := +1;
         Exit;
      end
      else
      begin
         // anche stesso tempo: guardo il counter
         if (Itm1.Counter < Itm2.Counter) then
         begin
            Result := -1;
            Exit;
         end
         else if (Itm1.Counter > Itm2.Counter) then
         begin
            Result := +1;
            Exit;
         end;
      end;
   end;
end;


procedure TOperationList.QuickSort (L, R     :Integer;
                                    SCompare :TSortFn);
var
   I, J, P: Integer;
begin
   repeat
      I := L;
      J := R;
      P := (L + R) shr 1;
      repeat
         while (SCompare ({Self, }I, P)) < 0 do
            Inc(I);
         while (SCompare ({Self, }J, P)) > 0 do
            Dec(J);
         if (I <= J) then
         begin
            Exchange (I, J);
            if (P = I) then
               P := J
            else
               if (P = J) then
                  P := I;
            Inc (I);
            Dec (J);
         end;
      until (I > J);
      if (L < J) then
         QuickSort (L, J, SCompare);
      L := I;
   until (I >= R);
end;


function TOperationList.RemoveAction (aItem :TOperation) :Boolean;
var
   ToDelete :Boolean;
   Idx      :LongInt;
   Xxx      :LongInt;
   Ff       :TFalloFatto;
   Qrt      :TQuarterTeam;

   function TogliRealizzazione (aOper :TOperation) :Boolean;
   var
      Yyy   :LongInt;
      Real  :TRealizzazione;
      Tmp   :TRealizzazione;
      Tipo  :TTipoRealizzazione;
   begin
      Result := False;
      try
         if (aOper = nil) then
            Exit;
         if ((aOper.Oper <> totTLNo) and (aOper.Oper <> totTLYes) and
             (aOper.Oper <> totT2No) and (aOper.Oper <> totT2Yes) and
             (aOper.Oper <> totT3No) and (aOper.Oper <> totT3Yes)) then
            Exit;
         if (aOper.Player1 = nil) then
            Exit;
         case aOper.Oper of
            totTLNo,
            totTLYes:   Tipo := trLibero;
            totT2No,
            totT2Yes:   Tipo := trT2;
            totT3No,
            totT3Yes:   Tipo := trT3;
            else        Tipo := trUndefined;
         end;
         if (Tipo = trUndefined) then
            Exit;
         Real := nil;
         for Yyy:=Pred(aOper.Player1.Realizzazioni.Count) downto 0 do
         begin
            Tmp := TRealizzazione(aOper.Player1.Realizzazioni.Items[Yyy]);
            if ((Tmp.Tipo = Tipo) and
                (Tmp.Tempo = aOper.Time) and
                (Tmp.Quarto = aOper.Quarter)) then
            begin
               Real := TRealizzazione(aOper.Player1.Realizzazioni.Items[Yyy]);
               break;
            end;
         end;
         (*
         if (Real = nil) then
            Exit;
         aOper.Player1.Realizzazioni.Remove (Real);
         *)
         if (Real <> nil) then
            aOper.Player1.Realizzazioni.Remove (Real);
         Result := True;
      except
         Result := False;
      end;
   end;

begin
   Result := False;
   if (aItem = nil) then
      Exit;
   try
      ToDelete := False;
      Idx := Self.IndexOf (aItem);
      if (Idx >= 0) then
      begin
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Info, '[TOperationList.RemoveAction] Removing action "%s"', [aItem.ToString]);
         case aItem.Oper of
            totUndefined:     ToDelete := True;
            totQuintetto:     ToDelete := True;
            totTimeStart:     ToDelete := True;
            totTimeStop:      ToDelete := True;
            totCheckPoint:    ToDelete := True;
            totTLYes:
            begin
               ToDelete := TogliRealizzazione (aItem);
            end;
            totTLNo:
            begin
               ToDelete := TogliRealizzazione (aItem);
            end;
            totT2Yes:
            begin
               ToDelete := TogliRealizzazione (aItem);
            end;
            totT2No:
            begin
               ToDelete := TogliRealizzazione (aItem);
            end;
            totT3Yes:
            begin
               ToDelete := TogliRealizzazione (aItem);
            end;
            totT3No:
            begin
               ToDelete := TogliRealizzazione (aItem);
            end;
            totFalloFatto:
            begin
               if (aItem.Player1 <> nil) then
               begin
                  for Xxx:=1 to 5 do
                  begin
                     Ff := aItem.Player1.FalloFatto[Xxx];
                     if ((Ff.Commesso) and (Ff.Quarto = aItem.Quarter) and (Ff.Tempo = aItem.Time)) then
                     begin
                        Ff.Reset;
                        if (aItem.MyTeam) then
                           Qrt := CurrMatch.MyTeam.GetQuarto (aItem.Quarter-1)
                        else
                           Qrt := CurrMatch.MyTeam.GetQuarto (aItem.Quarter-1);
                        Qrt.FalliQrt := Qrt.FalliQrt-1;
                        ToDelete := True;
                        break;
                     end;
                  end;
               end;
               ////////   TOFIX
            end;
            totFalloSubito:
            begin
               if ((aItem.Player1 <> nil) and (aItem.Player1.FalliSubiti > 0)) then
               begin
                  aItem.Player1.FalliSubiti := aItem.Player1.FalliSubiti-1;
                  ToDelete := True;
               end;
            end;
            totRimbDifesa:
            begin
               if ((aItem.Player1 <> nil) and (aItem.Player1.RimbDifesa > 0)) then
               begin
                  aItem.Player1.RimbDifesa := aItem.Player1.RimbDifesa-1;
                  ToDelete := True;
               end;
            end;
            totRimbAttacco:
            begin
               if ((aItem.Player1 <> nil) and (aItem.Player1.RimbAttacco > 0)) then
               begin
                  aItem.Player1.RimbAttacco := aItem.Player1.RimbAttacco-1;
                  ToDelete := True;
               end;
            end;
            totPPersa:
            begin
               if ((aItem.Player1 <> nil) and (aItem.Player1.PPerse > 0)) then
               begin
                  aItem.Player1.PPerse := aItem.Player1.PPerse-1;
                  ToDelete := True;
               end;
            end;
            totPRecuperata:
            begin
               if ((aItem.Player1 <> nil) and (aItem.Player1.PRecuperate > 0)) then
               begin
                  aItem.Player1.PRecuperate := aItem.Player1.PRecuperate-1;
                  ToDelete := True;
               end;
            end;
            totStopSubita:
            begin
               if ((aItem.Player1 <> nil) and (aItem.Player1.StoppSubite > 0)) then
               begin
                  aItem.Player1.StoppSubite := aItem.Player1.StoppSubite-1;
                  ToDelete := True;
               end;
            end;
            totStopFatta:
            begin
               if ((aItem.Player1 <> nil) and (aItem.Player1.StoppFatte > 0)) then
               begin
                  aItem.Player1.StoppFatte := aItem.Player1.StoppFatte-1;
                  ToDelete := True;
               end;
            end;
            totAssist:
            begin
               if ((aItem.Player1 <> nil) and (aItem.Player1.Assist > 0)) then
               begin
                  aItem.Player1.Assist := aItem.Player1.Assist-1;
                  ToDelete := True;
               end;
            end;
            totSostituz:
            begin
            end;
         end;
         if (ToDelete) then
            Delete (Idx);
      end;
      MainWind.RefreshAllFrames;
      Result := True;
      Modified := True;
      if (@OnChanged <> nil) then
         OnChanged();
   except
      on E:Exception do
      begin
         UpdateExceptionCounter;
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TOperationList.RemoveItem (%s)] Exception "%s"', [aItem.ToString(), E.Message]);
      end;
   end;
end;


function TOperationList.RemoveAction (aIndex :Integer) :Boolean;
begin
   Result := False;
   if ((Count < 1) or (aIndex < 1) or (aIndex >= Count)) then
      Exit;
   Result := RemoveAction (Items[aIndex]);
end;


function TOperationList.Load :TOperationListSaveResult;
begin
   Result := olsrUndefined;
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TOperationList.Load ()', []);
   try
      try
         //
         Result := olsrOk;
         Modified := False;
      except
         on E:Exception do
         begin
            Result := olsrException;
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TOperationList.Load] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TOperationList.Load  -->>  %s', [Result.ToString()]);
   end;
end;


function TOperationList.Save (aForce :Boolean) :TOperationListSaveResult;
var
   Fn    :string;
   Xxx   :LongInt;
   Lst   :TStringList;
begin
   Result := olsrUndefined;
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TOperationList.Save (Force:%s)', [BoolToStr(aForce)]);
   try
      try
         if ((aForce) or ((CurrMatch.MatchOpen) and ((CurrMatch.MatchStatus = msPlaying) or (CurrMatch.MatchStatus = msNotPlayed)))) then
         begin
            // Saving actions to temporary file
            Fn := AddSlash (Dalet_Globals.Folder_Data)+Currmatch.Title+'.TXT';
            Lst   := TStringList.Create;
            for Xxx:=0 to Pred(Count) do
            begin
               Lst.Add (Items[Xxx].ToString);
            end;
            Lst.SaveToFile (Fn);
            Lst.Free;
            //
            Modified := False;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Info, 'Match operation saved to temporary file %s', [Fn]);
         end
         else
         begin
            // Saving actions to DB
            Modified := False;
         end;
         //
         Result := olsrOk;
      except
         on E:Exception do
         begin
            Result := olsrException;
               UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TOperationList.Save] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TOperationList.Save  -->>  %s', [Result.ToString()]);
   end;
end;


procedure TOperationList.Sort;
begin
   if (Count > 1) then
   begin
      QuickSort (0, Pred(Count), Compare);
   end;
end;


function TOperationList.ToText :String;
var
   Xxx   :Longint;
begin
   Result := '/-------------\';
   for Xxx:=0 to Pred(Count) do
   begin
      Result := Result+#13#10+Items[Xxx].ToString;
   end;
end;










{ TExcelInfos }

constructor TExcelInfos.Create (aOwner :TObject);
begin
   inherited;
   StartRow       := 0;
   HeaderRows     := 4;
   SepRows        := 4;
   MyTeamRows     := 3;
   OppoTeamRows   := 3;
end;


function TExcelInfos.MyTeamFirstRow :LongInt;
begin
   Result := StartRow+HeaderRows;
end;


function TExcelInfos.OppoTeamFirstRow: LongInt;
begin
   Result := MyTeamFirstRow+MyTeamRows+SepRows;
end;


function TExcelInfos.TotCols: LongInt;
begin
   Result := 22;//17;
   if (BSDECfg.Excel_PIR.ValueAsBool) then
      Inc (Result);
   if (BSDECfg.Excel_OER.ValueAsBool) then
      Inc (Result);
   if (BSDECfg.Excel_VIR.ValueAsBool) then
      Inc (Result);
   if (BSDECfg.Excel_PlusMinus.ValueAsBool) then
      Inc (Result);
end;


function TExcelInfos.TotRows: LongInt;
begin
   Result := HeaderRows+MyTeamRows+SepRows+OppoTeamRows+SepRows;
end;


function TExcelInfos.LastRow: Longint;
begin
   Result := StartRow+TotRows;
end;


function TExcelInfos.PIRCol: LongInt;
begin
   Result := 17;
end;


function TExcelInfos.OERCol: LongInt;
begin
   Result := 17;
   if (BSDECfg.Excel_PIR.ValueAsBool) then
      Inc (Result);
end;


function TExcelInfos.VIRCol: LongInt;
begin
   Result := 17;
   if (BSDECfg.Excel_PIR.ValueAsBool) then
      Inc (Result);
   if (BSDECfg.Excel_OER.ValueAsBool) then
      Inc (Result);
end;


function TExcelInfos.PlusMinusCol: LongInt;
begin
   Result := 17;
   if (BSDECfg.Excel_PIR.ValueAsBool) then
      Inc (Result);
   if (BSDECfg.Excel_OER.ValueAsBool) then
      Inc (Result);
   if (BSDECfg.Excel_VIR.ValueAsBool) then
      Inc (Result);
end;


function TExcelInfos.PtQrtCol: LongInt;
begin
   Result := 17;
   if (BSDECfg.Excel_PIR.ValueAsBool) then
      Inc (Result);
   if (BSDECfg.Excel_OER.ValueAsBool) then
      Inc (Result);
   if (BSDECfg.Excel_VIR.ValueAsBool) then
      Inc (Result);
   if (BSDECfg.Excel_PlusMinus.ValueAsBool) then
      Inc (Result);
end;











{ TOperationListSaveResultHelper }

class function TOperationListSaveResultHelper.ToInt (Value :TOperationListSaveResult) :Longint;
begin
   Result := Value.ToInt();
end;


procedure TOperationListSaveResultHelper.SetFrom (aStr :String);
var
   Xxx   :TOperationListSaveResult;
begin
   aStr := UpperTrim (aStr);
   for Xxx:=Low(TOperationListSaveResult) to High(TOperationListSaveResult) do
   begin
      if (aStr = UpperTrim (Xxx.ToString())) then
      begin
         Self := Xxx;
         Exit;
      end;
   end;
end;


procedure TOperationListSaveResultHelper.SetFrom (aInt :Integer);
begin
   if ((LowInt <= aInt) and (HighInt >= aInt)) then
      Self := TOperationListSaveResult(aInt);
end;


function TOperationListSaveResultHelper.HighInt :Longint;
begin
   Result := Ord (High (TOperationListSaveResult));
end;


function TOperationListSaveResultHelper.LowInt :Longint;
begin
   Result := Ord (Low (TOperationListSaveResult));
end;


function TOperationListSaveResultHelper.ToInt :Longint;
begin
   Result := Ord (Self);
end;


function TOperationListSaveResultHelper.ToString :String;
begin
   Result := GetEnumName (TypeInfo(TOperationListSaveResult), LongInt(Self));
end;


class function TOperationListSaveResultHelper.ToString (Value :TOperationListSaveResult) :String;
begin
   Result := Value.ToString();
end;













{ TPlayerStats }

constructor TPlayerStats.Create;
begin
   inherited;
   Reset;
end;

destructor TPlayerStats.Destroy;
begin
   inherited;
end;

procedure TPlayerStats.Reset;
begin
   fPlayerID         := 0;
   fPlayerName       := '';
   fTotFalliFatti    := 0;
   fTotFalliSubiti   := 0;
   fTotPunti         := 0;
   fTotTLRealizz     := 0;
   fTotTLTentati     := 0;
   fTotT2Realizz     := 0;
   fTotT2Tentati     := 0;
   fTotT3Realizz     := 0;
   fTotT3Tentati     := 0;
   fTotRimbAttacco   := 0;
   fTotRimbDifesa    := 0;
   fTotPRecuperate   := 0;
   fTotPPerse        := 0;
   fTotStoppSubite   := 0;
   fTotStoppFatte    := 0;
   fTotAssist        := 0;
   fTotPIR           := 0;
   fTotOER           := 0.0;
   fTotPlusMinus     := 0;
   fTotMatch         := 0;
   fTotTempo         := 0;      // secondi
end;


procedure TPlayerStats.AddMatch (Tempo,      // in secondi
                                 Punti,
                                 TLRealizz,
                                 TLTentati,
                                 T2Realizz,
                                 T2Tentati,
                                 T3Realizz,
                                 T3Tentati,
                                 FFatti,
                                 FSubiti,
                                 RimbDifesa,
                                 RimbAttacco,
                                 PPerse,
                                 PRecuperate,
                                 StoppSubite,
                                 StoppFatte,
                                 Assist,
                                 Pir            :Integer;
                                 Oer            :Double;
                                 PlusMinus      :Integer);
begin
   fTotMatch         := fTotMatch + 1;
   fTotTempo         := fTotTempo       + Tempo;
   fTotPunti         := fTotPunti       + Punti;
   fTotTLRealizz     := fTotTLRealizz   + TLRealizz;
   fTotTLTentati     := fTotTLTentati   + TLTentati;
   fTotT2Realizz     := fTotT2Realizz   + T2Realizz;
   fTotT2Tentati     := fTotT2Tentati   + T2Tentati;
   fTotT3Realizz     := fTotT3Realizz   + T3Realizz;
   fTotT3Tentati     := fTotT3Tentati   + T3Tentati;
   fTotFalliFatti    := fTotFalliFatti  + FFatti;
   fTotFalliSubiti   := fTotFalliSubiti + FSubiti;
   fTotRimbAttacco   := fTotRimbAttacco + RimbAttacco;
   fTotRimbDifesa    := fTotRimbDifesa  + RimbDifesa;
   fTotPRecuperate   := fTotPRecuperate + PRecuperate;
   fTotPPerse        := fTotPPerse      + PPerse;
   fTotStoppSubite   := fTotStoppSubite + StoppSubite;
   fTotStoppFatte    := fTotStoppFatte  + StoppFatte;
   fTotAssist        := fTotAssist      + Assist;
   fTotPIR           := fTotPIR         + Pir;
   fTotOER           := fTotOER         + Oer;
   fTotPlusMinus     := fTotPlusMinus   + PlusMinus;
end;

function TPlayerStats.CalcTempoMatch   :Double;
begin
   if (TotMatch > 0) then
      Result := TotTempo/TotMatch
   else
      Result := 0;
end;

function TPlayerStats.CalcAssistMatch: Double;
begin
   if (TotMatch > 0) then
      Result := TotAssist/TotMatch
   else
      Result := 0;
end;

function TPlayerStats.CalcAssistMin: Double;
begin
   if (TotTempo > 0) then
      Result := (TotAssist/(TotTempo/60))
   else
      Result := 0;
end;

function TPlayerStats.CalcFFattiMatch: Double;
begin
   if (TotMatch > 0) then
      Result := TotFalliFatti/TotMatch
   else
      Result := 0;
end;

function TPlayerStats.CalcFFattiMin: Double;
begin
   if (TotTempo > 0) then
      Result := (TotFalliFatti/(TotTempo/60))
   else
      Result := 0;
end;

function TPlayerStats.CalcFSubitiMatch: Double;
begin
   if (TotMatch > 0) then
      Result := TotFalliSubiti/TotMatch
   else
      Result := 0;
end;

function TPlayerStats.CalcFSubitiMin: Double;
begin
   if (TotTempo > 0) then
      Result := (TotFalliSubiti/(TotTempo/60))
   else
      Result := 0;
end;

function TPlayerStats.CalcOERMatch: Double;
begin
   if (TotMatch > 0) then
      Result := TotOER/TotMatch
   else
      Result := 0;
end;

function TPlayerStats.CalcOERMin: Double;
begin
   if (TotTempo > 0) then
      Result := (TotOER/(TotTempo/60))
   else
      Result := 0;
end;

function TPlayerStats.CalcPIRMatch: Double;
begin
   if (TotMatch > 0) then
      Result := TotPIR/TotMatch
   else
      Result := 0;
end;

function TPlayerStats.CalcPIRMin: Double;
begin
   if (TotTempo > 0) then
      Result := (TotPIR/(TotTempo/60))
   else
      Result := 0;
end;

function TPlayerStats.CalcPlusMinusMatch: Double;
begin
   if (TotMatch > 0) then
      Result := TotPlusMinus/TotMatch
   else
      Result := 0;
end;

function TPlayerStats.CalcPlusMinusMin: Double;
begin
   if (TotTempo > 0) then
      Result := (TotPlusMinus/(TotTempo/60))
   else
      Result := 0;
end;

function TPlayerStats.CalcPPerseMatch: Double;
begin
   if (TotMatch > 0) then
      Result := TotPPerse/TotMatch
   else
      Result := 0;
end;

function TPlayerStats.CalcPPerseMin: Double;
begin
   if (TotTempo > 0) then
      Result := (TotPPerse/(TotTempo/60))
   else
      Result := 0;
end;

function TPlayerStats.CalcPRecuperateMatch: Double;
begin
   if (TotMatch > 0) then
      Result := TotPRecuperate/TotMatch
   else
      Result := 0;
end;

function TPlayerStats.CalcPRecuperateMin: Double;
begin
   if (TotTempo > 0) then
      Result := (TotPRecuperate/(TotTempo/60))
   else
      Result := 0;
end;

function TPlayerStats.CalcPuntiMatch: Double;
begin
   if (TotMatch > 0) then
      Result := TotPunti/TotMatch
   else
      Result := 0;
end;

function TPlayerStats.CalcPuntiMin: Double;
begin
   if (TotTempo > 0) then
      Result := (TotPunti/(TotTempo/60))
   else
      Result := 0;
end;

function TPlayerStats.CalcRimbalzi: LongInt;
begin
   Result := TotRimbDifesa + TotRimbAttacco;
end;

function TPlayerStats.CalcRimbalziMatch: Double;
begin
   if (TotMatch > 0) then
      Result := CalcRimbalzi/TotMatch
   else
      Result := 0;
end;

function TPlayerStats.CalcRimbalziMin: Double;
begin
   if (TotTempo > 0) then
      Result := (CalcRimbalzi/(TotTempo/60))
   else
      Result := 0;
end;

function TPlayerStats.CalcRimbAttaccoMatch: Double;
begin
   if (TotMatch > 0) then
      Result := TotRimbAttacco/TotMatch
   else
      Result := 0;
end;

function TPlayerStats.CalcRimbAttaccoMin: Double;
begin
   if (TotTempo > 0) then
      Result := (TotRimbAttacco/(TotTempo/60))
   else
      Result := 0;
end;

function TPlayerStats.CalcRimbDifesaMatch: Double;
begin
   if (TotMatch > 0) then
      Result := TotRimbDifesa/TotMatch
   else
      Result := 0;
end;

function TPlayerStats.CalcRimbDifesaMin: Double;
begin
   if (TotTempo > 0) then
      Result := (TotRimbDifesa/(TotTempo/60))
   else
      Result := 0;
end;

function TPlayerStats.CalcT2Perc: Double;
begin
   if (TotT2Tentati > 0) then
      Result := (100*TotT2realizz)/TotT2Tentati
   else
      Result := 0;
end;

function TPlayerStats.CalcT2PercStr: string;
var
   Vvv   :Double;
begin
   Vvv := T2Perc;
   if (Vvv < 0.1) then
      Result := '0%'
   else if (Vvv > 99.9) then
      Result := '100%'
   else
      Result := Format (PercTiroFormat+'%%', [Vvv]);
end;

function TPlayerStats.CalcT3Perc: Double;
begin
   if (TotT3Tentati > 0) then
      Result := (100*TotT3realizz)/TotT3Tentati
   else
      Result := 0;
end;

function TPlayerStats.CalcT3PercStr: string;
var
   Vvv   :Double;
begin
   Vvv := T3Perc;
   if (Vvv < 0.1) then
      Result := '0%'
   else if (Vvv > 99.9) then
      Result := '100%'
   else
      Result := Format (PercTiroFormat+'%%', [Vvv]);
end;

function TPlayerStats.CalcTdcPerc: Double;
begin
   if (TotTdcTentati > 0) then
      Result := (100*TotTdcrealizz)/TotTdcTentati
   else
      Result := 0;
end;

function TPlayerStats.CalcTdcPercStr: string;
var
   Vvv   :Double;
begin
   Vvv := TdcPerc;
   if (Vvv < 0.1) then
      Result := '0%'
   else if (Vvv > 99.9) then
      Result := '100%'
   else
      Result := Format (PercTiroFormat+'%%', [Vvv]);
end;

function TPlayerStats.CalcTdcrealizz: Longint;
begin
   Result := TotT2Realizz + TotT3Realizz;
end;

function TPlayerStats.CalcTdcTentati: Longint;
begin
   Result := TotT2Tentati + TotT3Tentati;
end;

function TPlayerStats.CalcTLPerc: Double;
begin
   if (TotTLTentati > 0) then
      Result := (100*TotTLrealizz)/TotTLTentati
   else
      Result := 0;
end;

function TPlayerStats.CalcTLPercStr: string;
var
   Vvv   :Double;
begin
   Vvv := TLPerc;
   if (Vvv < 0.1) then
      Result := '0%'
   else if (Vvv > 99.9) then
      Result := '100%'
   else
      Result := Format (PercTiroFormat+'%%', [Vvv]);
end;









{ TTeamStats }

constructor TTeamStats.Create;
begin
   inherited Create;
   fTeamID           := 0;
   fTeamName         := '';
   fPlayers          := TObjectList<TPlayerStats>.Create;
   fMatches          := TObjectList<TMatchStats>.Create;
   Reset;
end;

function TTeamStats.AddPlayer(aPlr: TMatchPlayer) :TPlayerStats;
var
   Xxx   :LongInt;
begin
   Result := nil;
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TTeamStats.AddPlayer ()', []);
   try
      try
         for Xxx:=0 to Pred(fPlayers.Count) do
         begin
            if (aPlr.PlayerRecID = fPlayers[Xxx].fPlayerID) then
            begin
               Result := fPlayers[Xxx];
               Break;
            end;
         end;
         if (Result = nil) then
         begin
            Result := TPlayerStats.Create;
            Result.fPlayerID := aPlr.PlayerRecID;
            Result.fPlayerName := aPlr.Name;
            fPlayers.Add (Result);
         end;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TTeamStats.AddPlayer] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TTeamStats.AddPlayer', []);
   end;
end;

constructor TTeamStats.Create (aTeamID    :Integer;
                               aTeamName  :string);
begin
   Create;
   fTeamID           := aTeamID;
   fTeamName         := aTeamName;
end;

destructor TTeamStats.Destroy;
begin
   fTeamName := '';
   fPlayers.Clear;
   fPlayers.Free;
   fMatches.Clear;
   fMatches.Free;
   inherited;
end;

procedure TTeamStats.Reset;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TTeamStats.Reset ()', []);
   try
      try
         fTotMatch         := 0;
         fTotFalliFatti    := 0;
         fTotFalliSubiti   := 0;
         fTotPuntiFatti    := 0;
         fTotPuntiSubiti   := 0;
         fTotTLRealizz     := 0;
         fTotTLTentati     := 0;
         fTotT2Realizz     := 0;
         fTotT2Tentati     := 0;
         fTotT3Realizz     := 0;
         fTotT3Tentati     := 0;
         fTotRimbAttacco   := 0;
         fTotRimbDifesa    := 0;
         fTotPRecuperate   := 0;
         fTotPPerse        := 0;
         fTotStoppSubite   := 0;
         fTotStoppFatte    := 0;
         fTotAssist        := 0;
         fTotPIR           := 0;
         fTotOER           := 0.0;
         fTotPlusMinus     := 0;
         fPlayers.Clear;
         fMatches.Clear;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TTeamStats.Reset] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TTeamStats.Reset', []);
   end;

end;

procedure TTeamStats.AddMatch (aMatch :TCurrMatch);
var
   Team     :TMatchTeam;
   StatPlr  :TPlayerStats;
   StatMtch :TMatchStats;
   Plr      :TMatchPlayer;
   Xxx      :Longint;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TTeamStats.AddMatch (%s)', [aMatch.Title]);
   try
      try
         Team := nil;
         if (aMatch.OppTeam.TeamRecID = fTeamID) then
         begin
            Team := aMatch.OppTeam;
            fTotPuntiSubiti := fTotPuntiSubiti + aMatch.MyTeam.CalcPunti;
         end
         else
         begin
            Team := aMatch.MyTeam;
            fTotPuntiSubiti := fTotPuntiSubiti + aMatch.OppTeam.CalcPunti;
         end;
         if (Team = nil) then
            Exit;
         for Xxx:=0 to Pred(Team.Roster.Count) do
         begin
            Plr := TMatchPlayer(Team.Roster.Items[Xxx]);
            StatPlr := AddPlayer (Plr);
            if (StatPlr <> nil) then
            begin
               StatPlr.AddMatch (Plr.TempoGioco, Plr.Punti,
                                 Plr.TLRealizz, Plr.TLTentati,
                                 Plr.T2Realizz, Plr.T2Tentati,
                                 Plr.T3Realizz, Plr.T3Tentati,
                                 Plr.FalliFatti, Plr.FalliSubiti,
                                 Plr.RimbDifesa, Plr.RimbAttacco,
                                 Plr.PPerse, Plr.PRecuperate,
                                 Plr.StoppSubite, Plr.StoppFatte,
                                 Plr.Assist,
                                 Round(Plr.PIR),
                                 Plr.OER,
                                 Plr.PlusMinus);
               fTotFalliFatti    := fTotFalliFatti  + Plr.FalliFatti;
               fTotFalliSubiti   := fTotFalliSubiti + Plr.FalliSubiti;
               fTotPuntiFatti    := fTotPuntiFatti  + Plr.Punti;
               fTotTLRealizz     := fTotTLRealizz   + Plr.TLRealizz;
               fTotTLTentati     := fTotTLTentati   + Plr.TLTentati;
               fTotT2Realizz     := fTotT2Realizz   + Plr.T2Realizz;
               fTotT2Tentati     := fTotT2Tentati   + Plr.T2Tentati;
               fTotT3Realizz     := fTotT3Realizz   + Plr.T3Realizz;
               fTotT3Tentati     := fTotT3Tentati   + Plr.T3Tentati;
               fTotRimbAttacco   := fTotRimbAttacco + Plr.RimbAttacco;
               fTotRimbDifesa    := fTotRimbDifesa  + Plr.RimbDifesa;
               fTotPRecuperate   := fTotPRecuperate + Plr.PRecuperate;
               fTotPPerse        := fTotPPerse      + Plr.PPerse;
               fTotStoppSubite   := fTotStoppSubite + Plr.StoppSubite;
               fTotStoppFatte    := fTotStoppFatte  + Plr.StoppFatte;
               fTotAssist        := fTotAssist      + Plr.Assist;
               fTotPIR           := fTotPIR         + Round(Plr.PIR);
               fTotOER           := fTotOER         + Plr.OER;
               fTotPlusMinus     := fTotPlusMinus   + Plr.PlusMinus;
            end;
         end;
         //
         StatMtch := nil;
         for Xxx:=0 to Pred(fMatches.Count) do
         begin
            if (aMatch.RecID = fMatches[Xxx].fMatchID) then
            begin
               StatMtch := fMatches[Xxx];
               Break;
            end;
         end;
         if (StatMtch = nil) then
         begin
            StatMtch := TMatchStats.Create;
            fMatches.Add (StatMtch);
         end;
         StatMtch.AddMatch (aMatch);
         //
         Inc (fTotMatch);
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TTeamStats.AddMatch] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TTeamStats.AddMatch', []);
   end;
end;









{ TMatchStats }

constructor TMatchStats.Create;
begin
   inherited;
   Reset;
end;

constructor TMatchStats.Create(aMatch: TCurrMatch);
begin
   inherited Create;
   fMatchID          := aMatch.RecID;
   fMatchTitle       := aMatch.Title;
   fMatchOpponent    := aMatch.OppTeam.Name;
   fMatchHome        := aMatch.Home;
   fMatchDay         := aMatch.Day;
   fMatchDate        := aMatch.PlayDate;
   fMatchSeason      := aMatch.Season;
   fMatchChamp       := aMatch.Champ;
end;

destructor TMatchStats.Destroy;
begin
   fMatchTitle       := '';
   fMatchOpponent    := '';
   fMatchDay         := '';
   fMatchSeason      := '';
   fMatchChamp       := '';
   inherited;
end;

procedure TMatchStats.Reset;
begin
   fTotFalliFatti    := 0;
   fTotFalliSubiti   := 0;
   fTotPuntiFatti    := 0;
   fTotPuntiSubiti   := 0;
   fTotTLRealizz     := 0;
   fTotTLTentati     := 0;
   fTotT2Realizz     := 0;
   fTotT2Tentati     := 0;
   fTotT3Realizz     := 0;
   fTotT3Tentati     := 0;
   fTotRimbAttacco   := 0;
   fTotRimbDifesa    := 0;
   fTotPRecuperate   := 0;
   fTotPPerse        := 0;
   fTotStoppSubite   := 0;
   fTotStoppFatte    := 0;
   fTotAssist        := 0;
   fTotPIR           := 0;
   fTotOER           := 0.0;
   fTotPlusMinus     := 0;
end;

procedure TMatchStats.AddMatch (aMatch: TCurrMatch);
begin
   fMatchID          := aMatch.RecID;
   fMatchTitle       := aMatch.Title;
   fMatchOpponent    := aMatch.OppTeam.Name;
   fMatchHome        := aMatch.Home;
   fMatchDay         := aMatch.Day;
   fMatchDate        := aMatch.PlayDate;
   fMatchSeason      := aMatch.Season;
   fMatchChamp       := aMatch.Champ;
   //
   fTotFalliFatti    := aMatch.MyTeam.FalliFatti;
   fTotFalliSubiti   := aMatch.MyTeam.FalliSubiti;
   fTotPuntiFatti    := aMatch.MyTeam.Punti;
   fTotPuntiSubiti   := aMatch.OppTeam.Punti;
   fTotTLRealizz     := aMatch.MyTeam.TLRealizz;
   fTotTLTentati     := aMatch.MyTeam.TLTentati;
   fTotT2Realizz     := aMatch.MyTeam.T2Realizz;
   fTotT2Tentati     := aMatch.MyTeam.T2Tentati;
   fTotT3Realizz     := aMatch.MyTeam.T3Realizz;
   fTotT3Tentati     := aMatch.MyTeam.T3Tentati;
   fTotRimbAttacco   := aMatch.MyTeam.RimbAttacco;
   fTotRimbDifesa    := aMatch.MyTeam.RimbDifesa;
   fTotPRecuperate   := aMatch.MyTeam.PRecuperate;
   fTotPPerse        := aMatch.MyTeam.PPerse;
   fTotStoppSubite   := aMatch.MyTeam.StoppSubite;
   fTotStoppFatte    := aMatch.MyTeam.StoppFatte;
   fTotAssist        := aMatch.MyTeam.Assist;
   fTotPIR           := Round(aMatch.MyTeam.PIR);
   fTotOER           := aMatch.MyTeam.OER;
end;










{ TSaveThread }

constructor TSaveThread.Create (Mtch :TCurrMatch);
begin
   inherited Create (True, 'TSaveThread');
   FreeOnTerminate := True;
   aMatch := Mtch;
end;

destructor TSaveThread.Destroy;
begin
   inherited;
end;

procedure TSaveThread.DoJob;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TSaveThread.DoJob ()', []);
   try
      aMatch.SaveToDB (False);
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TSaveThread.DoJob ()', []);
   end;
end;

procedure TSaveThread.Execute;
begin
   inherited;
   Sleep(100);
   Synchronize (DoJob);
end;










initialization
   RegKey_WindowsPos := '\Software\WebPorter\BSDEvo\Windows\';
   CurrMatch         := TCurrMatch.Create;
   BSDECfg           := Nil;
   OpList            := TOperationList.Create;
   CurrentQuarter    := 0;
   BtnPressTime      := 0;
   ExcelInfos        := TExcelInfos.Create(Nil);
   RecentMatches     := TStringList.Create;
   InDBSaving        := False;
   LastSaveTime      := 0;
   LogOperation      := True;



finalization
   BSDECfg.Free;
   CurrMatch.Free;
   OpList.Free;
   RecentMatches.Free;



end.
