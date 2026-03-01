unit BSDEvo.Wnd.Main;

interface

uses
  Winapi.Windows,
  Winapi.Messages,
  System.SysUtils,
  System.Variants,
  System.Classes,
  System.Generics.Collections,
  System.IOUtils,
  Vcl.Graphics,
  Vcl.Controls,
  Vcl.Forms,
  Vcl.Dialogs,
  Winapi.ShellAPI,
  cxClasses,
  dxSkinsCore,
  dxSkinsDefaultPainters,
  dxSkinsdxStatusBarPainter,
  cxLookAndFeelPainters,
  dxSkinscxPCPainter,
  dxSkinsdxBarPainter,
  dxSkinsdxDockControlPainter,
  cxLookAndFeels,
  dxSkinsForm,
  dxSkinDarkSide,
  cxGraphics,
  cxControls,
  cxContainer,
  cxEdit,
  dxBar,
  cxGroupBox,
  dxStatusBar,
  cxSplitter,
  Vcl.Menus,
  cxStyles,
  cxCustomData,
  cxFilter,
  cxData,
  cxDataStorage,
  cxNavigator,
  Data.DB,
  cxDBData,
  cxTextEdit,
  cxGridCustomTableView,
  cxGridTableView,
  cxGridDBTableView,
  cxGridLevel,
  cxGridCustomView,
  cxGrid,
  Vcl.StdCtrls,
  cxButtons,
  cxLabel,
  ovcfiler,
  ovcstore,
  ovcbase,
  ovcstate,
  cxGridCardView,
  cxGridDBCardView,
  cxGridCustomLayoutView,
  cxSpinEdit,
  cxCalendar,
  cxCheckBox,
  dxColorEdit,
  dxBarBuiltInMenu,
  cxPC,
  cxImage,
  cxListBox,
  cxMaskEdit,
  EComponent,
  Vcl.ExtCtrls,
  cxInplaceContainer,
  cxVGrid,
  cxOI,

  Jpeg,
  pngImage,
  dxGDIPlusClasses,
  DaletGlobalsUnit,
  TntUtils_str,
  TntUtils_Dlg,
  TntUtils_Sys,
  TntUtils_Wnd,
  SkinUtils,
  LogClientUnit,
  BSDEvo.Wnd.Splash,
  BSDEvo.Unt.Publics,
  BSDEvo.DMod.DataMod,
  BSDEvo.DB.Wnd.BrowseSeasons,
  BSDEvo.DB.Wnd.BrowseChamps,
  BSDEvo.DB.Wnd.Databases,
  BSDEvo.DB.Dlg.NewEditMatchHeader,
  BSDEvo.DB.Dlg.NewEditRoster,
  BSDEvo.Dlg.Sostituzione,
  BSDEvo.Dlg.Config,
  BSDEvo.Frm.Player,
  BSDEvo.Frm.Timer,
  BSDEvo.Frm.Roster,
  BSDEvo.Frm.Team,
  BSDEvo.Frm.GL,
  BSDEvo.Frm.Shoot,
  BSDEvo.Frm.Data,
  BSDEvo.Wnd.Actions,
  BSDEvo.Dlg.About,
  BSDEvo.Dlg.MatchStatus,
  BSDEvo.Wnd.Statistiche,
  BSDEvo.Dlg.Exit,
  BSDEvo.Dlg.SetPlayTimes,
  BSDEvo.Dlg.SetGlobalFouls,
  BSDEvo.Wnd.ImportLog,
  dxCore, dxCoreClasses, dxHashUtils,
  dxSpreadSheetCore, dxSpreadSheetCoreHistory,
  dxSpreadSheetConditionalFormatting,
  dxSpreadSheetConditionalFormattingRules, dxSpreadSheetClasses,
  dxSpreadSheetContainers, dxSpreadSheetFormulas, dxSpreadSheetHyperlinks,
  dxSpreadSheetFunctions, dxSpreadSheetGraphics, dxSpreadSheetPrinting,
  dxSpreadSheetTypes, dxSpreadSheetUtils, dxSpreadSheet,
  dxSpreadSheetReportDesigner, dxmdaset, cxMemo, dxSkinCoffee,
  cxImageComboBox, Vcl.ImgList, dxSkinBlack, dxSkinBlue, dxSkinBlueprint,
  dxSkinCaramel, dxSkinDarkRoom, dxSkinDevExpressDarkStyle,
  dxSkinDevExpressStyle, dxSkinFoggy, dxSkinGlassOceans,
  dxSkinHighContrast, dxSkiniMaginary, dxSkinLilian, dxSkinLiquidSky,
  dxSkinLondonLiquidSky, dxSkinMcSkin, dxSkinMetropolis,
  dxSkinMetropolisDark, dxSkinMoneyTwins, dxSkinOffice2007Black,
  dxSkinOffice2007Blue, dxSkinOffice2007Green, dxSkinOffice2007Pink,
  dxSkinOffice2007Silver, dxSkinOffice2010Black, dxSkinOffice2010Blue,
  dxSkinOffice2010Silver, dxSkinOffice2013DarkGray,
  dxSkinOffice2013LightGray, dxSkinOffice2013White,
  dxSkinOffice2016Colorful, dxSkinOffice2016Dark, dxSkinPumpkin,
  dxSkinSeven, dxSkinSevenClassic, dxSkinSharp, dxSkinSharpPlus,
  dxSkinSilver, dxSkinSpringTime, dxSkinStardust, dxSkinSummer2008,
  dxSkinTheAsphaltWorld, dxSkinValentine, dxSkinVisualStudio2013Blue,
  dxSkinVisualStudio2013Dark, dxSkinVisualStudio2013Light, dxSkinVS2010,
  dxSkinWhiteprint, dxSkinXmas2008Blue;



resourcestring
   Str_SkinFileNotFound                   = 'File skin interfaccia non trovato:\n"%s"';
   Str_SkinNotFoundInFile                 = 'Skin interfaccia selezionata "%s"\nnon presente nel file di skin %s';
   Str_SeasonNotDefined                   = 'Stagione non definita.'#13#10'Selezionarne una';
   Str_SureToCloseApp                     = '\n\n\nSicuro di voler chiudere l''applicazione?\n\n\n';
   Str_NonPossibileAprireilMatch          = '\n\n\nERRORE\n\nNon è possibile aprire il match selezionato perchè non è stato trovato nel database.\n\n\n';
   Str_PlayNumber                         = '%s';
   Str_MatchDay                           = '%s';
   str_MatchSeason                        = '%s';
   Str_MatchChamp                         = '%s';
   Str_MatchPhase                         = '%s (%s)';
   Str_HeadCoach                          = 'Head coach: %s';
   Str_Assistant                          = '1° Assist.: %s';
   Str_SicuroModificareMatch              = '\n\n\nAttenzione\n\nIl match corrente è già iniziato.\nSei sicuro di voler apportare modifiche?\n\n\n';
   Str_SicuroModificareRoster             = '\n\n\nAttenzione\n\nIl match corrente è già iniziato.\nSei proprio sicuro di voler apportare modifiche al roster?\n\n\n';
   Str_PtiDiff                            = 'Diff: %s%d';
   Str_PtiDiffQrt                         = 'Diff quarto: %s%d';
   Str_PnlComandiDescApri                 = ' Comandi (click per aprire) ';
   Str_PnlComandiDescChiudi               = ' Comandi (click per chiudere) ';
   Str_Giocatore                          = 'Giocatore';
   Str_Min                                = 'Min.';
   Str_Punti                              = 'Pti.';
   Str_TL                                 = 'TL';
   Str_T2                                 = 'T2';
   Str_T3                                 = 'T3';
   Str_Tdc                                = 'T.d.c.';
   Str_FalliFatti                         = 'FF';
   Str_FalliSubiti                        = 'FS';
   Str_RimbDifesa                         = 'RD';
   Str_RimbAttacco                        = 'RA';
   Str_RimbTot                            = 'R Tot';
   Str_PallePerse                         = 'PP';
   Str_PalleRecuperate                    = 'PR';
   Str_Assist                             = 'As';
   Str_StopFatte                          = 'St.F';
   Str_StopSubite                         = 'St.S';
   Str_PIR                                = 'PIR';
   Str_VIR                                = 'VIR';
   Str_OER                                = 'OER';
   Str_PlusMinus                          = '+/-';
   Str_Allen                              = 'Allen.: ';
   Str_Vice                               = 'Vice: ';
   Str_Avversari                          = 'Avversari';
   Str_NonEntrato                         = 'n.e.';
   Str_Arbitro                            = 'Arbitro: %s';
   Str_Arbitri                            = 'Arbitri: %s, %s';
   Str_Parziali                           = 'Parziali:';
   Str_Progressivi                        = 'Progressivi:';
   Str_FileNonTrovato                     = 'File non trovato: %s';
   Str_AzzeraPartita                      = '\n\n\nATTENZIONE\n\nQuesto comando eliminerà tutti gli eventi della partita e si tratta di una operazione non recuperabile.\n\nSei sicuro di voler procedere?\n\n\n';
   Str_FileNotFound                       = '\n\n\nERRORE\n\nIl file\n%s\nnon è stato trovato nel sistema.\n\nCercato in:\n%s\n%s\n%s\n\n\n';
   Str_SalvareNelCloud                    = '\n\n\nVuoi salvare i dati nel cloud?\n\n\n';
   Str_CloudFolderNotExists               = '\n\n\nLa cartella specificata per il salvataggio nel cloud non esiste.\n\nSi desidera crarla?\n\n\n';
   Str_ConcludereMatch                    = '\n\n\nVuoi concludere il match?\n\n\n';
   Str_SicuroRecuperoDaCloud              = '\n\n\nSei sicuro di voler recuperare il database dal cloud?\n\nI tuoi dati attuali saranno sovrascritti.\n\n\n';
   Str_OperazioneCompletata               = '\n\n\nOperazione completata con successo\n\n\n';
   Str_SureToImportOldFormat              = '\n\n\nATTENZIONE\n\nSei veramente sicuro di voler importare i dati da un file in formato vecchio?\n\nTutti gli eventuali dati inseriti verranno sovrascritti.\n\n\n';
   Str_EliminaMatch_s                     = '\n\n\nATTENZIONE\n\nSei veramente sicuro di voler eliminare il match\n%s?\n\nTutti i dati ad esso associati saranno cancellati.\n\n\n';



const
   ColPlr_Sz   = 90; // player
   ColTim_Sz   = 41; // time
   ColPti_Sz   = 40; // punti
   ColTL_Sz    = 60; // tl
   ColT2_Sz    = 60; // t2
   ColT3_Sz    = 60; // t3
   ColTdx_Sz   = 60; // tdc
   ColFF_Sz    = 36; // ff
   ColFS_Sz    = 36; // fs
   ColRAt_Sz   = 36; // rd
   ColRDi_Sz   = 36; // ra
   ColRTo_Sz   = 38; // rt
   ColPPe_Sz   = 36; // pp
   ColPRe_Sz   = 36; // pr
   ColAss_Sz   = 36; // ass
   ColSFa_Sz   = 36; // stop fatte
   ColSSu_Sz   = 36; // stop subite
   ColPir_Sz   = 36; // pir
   ColOer_Sz   = 36; // oer
   ColVir_Sz   = 36; // vir
   ColPM_Sz    = 36; // +/-
   ColPQ1_Sz   = 30; // pti q1
   ColPQ2_Sz   = 30; // pti q2
   ColPQ3_Sz   = 30; // pti q3
   ColPQ4_Sz   = 30; // pti q4
   ColPEt_Sz   = 30; // pti extra time




type
//   TFieldPlayersFrames  = array [1..MaxFieldPlayers] of TTFrmPlayer;
//   TRosterPlayersFrames = array [1..MaxRosterPlayers] of TTFrmRoster;


  TMainWind = class(TForm)
    TheSkinCtrl: TdxSkinController;
    StatBar: TdxStatusBar;
    BarManTheBarMan: TdxBarManager;
    MainMenuBar: TdxBar;
    MnuExit: TdxBarButton;
    MnuFile: TdxBarSubItem;
    PnlMainPanel: TcxGroupBox;
    PnlLeft: TcxGroupBox;
    SplitV1: TcxSplitter;
    PnlRight: TcxGroupBox;
    PnlSeason: TcxGroupBox;
    PnlRecents: TcxGroupBox;
    PnlDbTop: TcxGroupBox;
    Pnlchamp: TcxGroupBox;
    PnlMatch: TcxGroupBox;
    LabCurrSeason: TcxLabel;
    Lab1: TcxLabel;
    BtnSeasonChange: TcxButton;
    ViewChamp: TcxGridDBTableView;
    LevelChamp: TcxGridLevel;
    GrdChamp: TcxGrid;
    ViewChampDispName: TcxGridDBColumn;
    ViewMatches: TcxGridDBTableView;
    LevelMatches: TcxGridLevel;
    GrdMatches: TcxGrid;
    BtnMatchNew: TcxButton;
    BtnMatchOpen: TcxButton;
    MnuDatabases: TdxBarButton;
    GridPhase: TcxGrid;
    ViewPhase: TcxGridDBTableView;
    LevelPhase: TcxGridLevel;
    ViewPhaseID: TcxGridDBColumn;
    ViewPhaseLinkChamp: TcxGridDBColumn;
    ViewPhaseDispName: TcxGridDBColumn;
    ViewPhaseChampName: TcxGridDBColumn;
    ViewPhaseAbbrev: TcxGridDBColumn;
    OvcFormState: TOvcFormState;
    OvcRegistryStore: TOvcRegistryStore;
    ViewMatchesID: TcxGridDBColumn;
    ViewMatchesLinkPhase: TcxGridDBColumn;
    ViewMatchesLinkMyTeam: TcxGridDBColumn;
    ViewMatchesLinkOpponentTeam: TcxGridDBColumn;
    ViewMatchesTitle: TcxGridDBColumn;
    ViewMatchesNumber: TcxGridDBColumn;
    ViewMatchesPlayDate: TcxGridDBColumn;
    ViewMatchesHome: TcxGridDBColumn;
    ViewMatchesMyResultDelta: TcxGridDBColumn;
    ViewMatchesOppResultDelta: TcxGridDBColumn;
    ViewMatchesReferee1: TcxGridDBColumn;
    ViewMatchesReferee2: TcxGridDBColumn;
    ViewMatchesMyTeamColor: TcxGridDBColumn;
    ViewMatchesOppTeamColor: TcxGridDBColumn;
    ViewMatchesLocation: TcxGridDBColumn;
    ViewMatchesDay: TcxGridDBColumn;
    BtnMatchEditSelected: TcxButton;
    ViewCardMatches: TcxGridDBCardView;
    ViewCardMatchesTitle: TcxGridDBCardViewRow;
    ViewCardMatchesNumber: TcxGridDBCardViewRow;
    ViewCardMatchesPlayDate: TcxGridDBCardViewRow;
    ViewCardMatchesHome: TcxGridDBCardViewRow;
    ViewCardMatchesReferee1: TcxGridDBCardViewRow;
    ViewCardMatchesReferee2: TcxGridDBCardViewRow;
    ViewCardMatchesMyTeamColor: TcxGridDBCardViewRow;
    ViewCardMatchesOppTeamColor: TcxGridDBCardViewRow;
    ViewCardMatchesLocation: TcxGridDBCardViewRow;
    ViewCardMatchesDay: TcxGridDBCardViewRow;
    ViewCardMatchesMyTeamName: TcxGridDBCardViewRow;
    ViewCardMatchesOppTeamName: TcxGridDBCardViewRow;
    BtnMatchRoseter: TcxButton;
    BtnMatchDelete: TcxButton;
    PgCtrlMain: TcxPageControl;
    TabArchivio: TcxTabSheet;
    TabPartita: TcxTabSheet;
    PnlArchivio: TcxGroupBox;
    PnlPartita: TcxGroupBox;
    PgCtrlPartita: TcxPageControl;
    TabAnagrafica: TcxTabSheet;
    PnlAnagraficaPartita: TcxGroupBox;
    LabMatchDate: TcxLabel;
    LabMatchLocation: TcxLabel;
    LabPlayNumber: TcxLabel;
    LabDay: TcxLabel;
    LabMatchSeason: TcxLabel;
    LabMatchChamp: TcxLabel;
    LabMatchPhase: TcxLabel;
    cxLabel1: TcxLabel;
    cxLabel2: TcxLabel;
    cxLabel3: TcxLabel;
    cxLabel4: TcxLabel;
    cxLabel5: TcxLabel;
    LabMatchTeams: TcxLabel;
    TabGioco: TcxTabSheet;
    PnlMatchLeftColor: TcxGroupBox;
    PnlMatchRightColor: TcxGroupBox;
    ImgMatchLeft: TcxImage;
    ImgMatchRight: TcxImage;
    cxLabel6: TcxLabel;
    LabMatchReferee1: TcxLabel;
    LabMatchReferee2: TcxLabel;
    LbMatchLeft: TcxListBox;
    LbMatchRight: TcxListBox;
    LabHeadCoachLeft: TcxLabel;
    LabAssistantLeft: TcxLabel;
    LabHeadCoachRight: TcxLabel;
    LabAssistantRight: TcxLabel;
    BtnEditRoster2: TcxButton;
    BtnEditMatch2: TcxButton;
    SpinDeltaLeft: TcxSpinEdit;
    SpinDeltaRight: TcxSpinEdit;
    BtnDeltaDownLeft: TcxButton;
    BtnDeltaDownRight: TcxButton;
    BtnDeltaUpLeft: TcxButton;
    BtnDeltaUpRight: TcxButton;
    MnuConfig: TdxBarButton;
    TimerOffErrorLed: TTimer;
    PnlCommands: TcxGroupBox;
    BtnSost: TcxButton;
    BtnUndo: TcxButton;
    BtnCheckPoint: TcxButton;
    LabDiff: TcxLabel;
    LabDiffQuarto: TcxLabel;
    TmrMainRefresh: TTimer;
    MnuPartita: TdxBarSubItem;
    MnuActions: TdxBarButton;
    TabExcel: TcxTabSheet;
    PnlExcel: TcxGroupBox;
    SSheet: TdxSpreadSheet;
    PnlExcelCommands: TcxGroupBox;
    ChkMappaTiro: TcxCheckBox;
    LabExcelFName: TcxLabel;
    BtnEsportaExcelNew: TcxButton;
    Btn1: TcxButton;
    BtnExcelOpenFile: TcxButton;
    BtnExcelOpenFolder: TcxButton;
    SaveDlg: TSaveDialog;
    PnlMatchCommands: TcxGroupBox;
    MemTblRecent: TdxMemData;
    MemTblRecentChampName: TStringField;
    MemTblRecentPhaseName: TStringField;
    MemTblRecentMatchTitle: TStringField;
    MemTblRecentGiornata: TStringField;
    MemTblRecentMatchDate: TDateField;
    DsRecent: TDataSource;
    GrdRecentLevel1: TcxGridLevel;
    GrdRecent: TcxGrid;
    GrdRecentDBCardView1: TcxGridDBCardView;
    GrdRecentDBCardView1RecId: TcxGridDBCardViewRow;
    GrdRecentDBCardView1ChampName: TcxGridDBCardViewRow;
    GrdRecentDBCardView1PhaseName: TcxGridDBCardViewRow;
    GrdRecentDBCardView1MatchTitle: TcxGridDBCardViewRow;
    GrdRecentDBCardView1Giornata: TcxGridDBCardViewRow;
    GrdRecentDBCardView1MatchDate: TcxGridDBCardViewRow;
    MemTblRecentMatchID: TIntegerField;
    MnuStrumenti: TdxBarSubItem;
    MnuRisoluzioni: TdxBarSubItem;
    MnuSVGA: TdxBarButton;
    MnuYoga: TdxBarButton;
    MnuHD: TdxBarButton;
    MemoOp: TcxMemo;
    Help: TdxBarSubItem;
    MnuAbout: TdxBarButton;
    FrmMyTeam: TTFrmTeam;
    FrmOppoTeam: TTFrmTeam;
    FrmTime: TTFrmTimer;
    FrmShootTL: TFrmShoot;
    FrmShootT2: TFrmShoot;
    FrmShootT3: TFrmShoot;
    FrmRimba: TFrmData;
    FrmPalle: TFrmData;
    FrmStopp: TFrmData;
    FrmFalli: TFrmData;
    FrmAssist: TFrmData;
    MnuClearEvents: TdxBarButton;
    MemTblRecentTeams: TStringField;
    MemTblRecentMatchStatus: TStringField;
    GrdRecentDBCardView1MatchStatus: TcxGridDBCardViewRow;
    ViewCardMatchesRow1: TcxGridDBCardViewRow;
    ViewCardMatchesMatchStatus: TcxGridDBCardViewRow;
    ViewCardMatchesMyTeamPoints: TcxGridDBCardViewRow;
    ViewCardMatchesOppTeamPoints: TcxGridDBCardViewRow;
    BtnMatchStatus: TcxButton;
    ImgLstMatchStatus: TcxImageList;
    MnuStatistiche: TdxBarButton;
    MnuCopyFromCloud: TdxBarButton;
    MnuAzzeraTempi: TdxBarButton;
    BtnImportFromOld: TcxButton;
    OpenDlg: TOpenDialog;
    MnuSetPlayingTimes: TdxBarButton;
    LabParziali: TcxLabel;
    LabProgressivi: TcxLabel;
    MnuGlobalFouls: TdxBarButton;
    MnuImportFromLog: TdxBarButton;
    MnuReopenDB: TdxBarButton;
    MnuEditNumbersNames: TdxBarButton;
    BtnOppoRimbAtt: TcxButton;
    procedure FormCreate(Sender: TObject);
    procedure MnuExitClick(Sender: TObject);
    procedure FormClose(Sender: TObject; var Action: TCloseAction);
    procedure FormActivate(Sender: TObject);
    procedure FormShow(Sender: TObject);
    procedure BtnSeasonChangeClick(Sender: TObject);
    procedure MnuDatabasesClick(Sender: TObject);
    procedure FormDestroy(Sender: TObject);
    procedure FormCloseQuery(Sender: TObject; var CanClose: Boolean);
    procedure ViewChampFocusedRecordChanged(Sender: TcxCustomGridTableView;
      APrevFocusedRecord, AFocusedRecord: TcxCustomGridRecord;
      ANewItemRecordFocusingChanged: Boolean);
    procedure BtnMatchNewClick(Sender: TObject);
    procedure ViewPhaseFocusedRecordChanged(Sender: TcxCustomGridTableView;
      APrevFocusedRecord, AFocusedRecord: TcxCustomGridRecord;
      ANewItemRecordFocusingChanged: Boolean);
    procedure BtnMatchEditSelectedClick(Sender: TObject);
    procedure BtnMatchRoseterClick(Sender: TObject);
    procedure BtnMatchOpenClick(Sender: TObject);
    procedure BtnEditMatch2Click(Sender: TObject);
    procedure BtnEditRoster2Click(Sender: TObject);
    procedure BtnDeltaUpRightClick(Sender: TObject);
    procedure BtnDeltaDownRightClick(Sender: TObject);
    procedure BtnDeltaUpLeftClick(Sender: TObject);
    procedure BtnDeltaDownLeftClick(Sender: TObject);
    procedure MnuConfigClick(Sender: TObject);
    procedure TimerOffErrorLedTimer(Sender: TObject);
    procedure FormResize(Sender: TObject);
    procedure PnlCommandsClick(Sender: TObject);
    procedure PgCtrlPartitaPageChanging(Sender: TObject;
      NewPage: TcxTabSheet; var AllowChange: Boolean);
    procedure TmrMainRefreshTimer(Sender: TObject);
    procedure BtnSostClick(Sender: TObject);
    procedure TabGiocoDblClick(Sender: TObject);
    procedure MnuActionsClick(Sender: TObject);
    procedure BtnUndoClick(Sender: TObject);
    procedure BtnCheckPointClick(Sender: TObject);
    procedure BtnEsportaExcelNewClick(Sender: TObject);
    procedure Btn1Click(Sender: TObject);
    procedure BtnExcelOpenFileClick(Sender: TObject);
    procedure BtnExcelOpenFolderClick(Sender: TObject);
    procedure ChkMappaTiroPropertiesEditValueChanged(Sender: TObject);
    procedure GrdRecentDBCardView1DblClick(Sender: TObject);
    procedure MnuSVGAClick(Sender: TObject);
    procedure MnuYogaClick(Sender: TObject);
    procedure MnuHDClick(Sender: TObject);
    procedure MnuAboutClick(Sender: TObject);
    procedure MnuClearEventsClick(Sender: TObject);
    procedure ViewCardMatchesDblClick(Sender: TObject);
    procedure BtnMatchStatusClick(Sender: TObject);
    procedure MnuStatisticheClick(Sender: TObject);
    procedure MnuCopyFromCloudClick(Sender: TObject);
    procedure MnuAzzeraTempiClick(Sender: TObject);
    procedure BtnImportFromOldClick(Sender: TObject);
    procedure BtnMatchDeleteClick(Sender: TObject);
    procedure MnuSetPlayingTimesClick(Sender: TObject);
    procedure MnuGlobalFoulsClick(Sender: TObject);
    procedure MnuImportFromLogClick(Sender: TObject);
    procedure MnuReopenDBClick(Sender: TObject);
    procedure MnuEditNumbersNamesClick(Sender: TObject);
    procedure BtnOppoRimbAttClick(Sender: TObject);
  private
    { Private declarations }
    MyCoach1   :String;
    MyCoach2   :String;
    OppoCoach1 :String;
    OppoCoach2 :String;
    Primavolta :Boolean;
    PrimoGioco :Boolean;
    CurrSel    :TObject;
    CloseAndSave  :Boolean;
    function  ExecuteEditRoster :Boolean;
    procedure ExecuteEditMatch;
    procedure Excel_Titoli (aView :TdxSpreadSheetTableView);
    procedure Excel_Intestazioni (aView :TdxSpreadSheetTableView);
    procedure Excel_IntestazioniOppo (aView :TdxSpreadSheetTableView);
    procedure Excel_StatMyTeam (aView :TdxSpreadSheetTableView);
    procedure Excel_StatOppTeam (aView :TdxSpreadSheetTableView);
    procedure Excel_PageSettings (aView :TdxSpreadSheetTableView);
    procedure Excel_MappaDiTiro (aView :TdxSpreadSheetTableView);
    procedure Excel_ProgressoEventi (aView :TdxSpreadSheetTableView);
    procedure SelectRecent;
    procedure InternalEditMatch;
    procedure HideInterface;
    procedure ShowInterface;
  public
    { Public declarations }
    EndShow  :Boolean;
    MyFieldPlayers   :TObjectList<TTFrmPlayer>;
    OppoFieldPlayers :TObjectList<TTFrmPlayer>;
    MyRoster         :TObjectList<TTFrmRoster>;
    OppoRoster       :TObjectList<TTFrmRoster>;
    ImgCont          :TdxSpreadSheetPictureContainer;
    Img              :TdxSmartImage;
    //MyFieldPlayers   :array [1..MaxFieldPlayers] of TTFrmPlayer;//TFieldPlayersFrames;
    //OppoFieldPlayers :array [1..MaxFieldPlayers] of TTFrmPlayer;//TFieldPlayersFrames;
    //MyRoster         :array [1..MaxRosterPlayers] of TTFrmRoster;//TRosterPlayersFrames;
    //OppoRoster       :array [1..MaxRosterPlayers] of TTFrmRoster;//TRosterPlayersFrames;
    procedure LoadSkin;
    function  GeneraCaption (aTitle :String) :String;
    procedure ShowCurrSeason;
    procedure OpenMatch (var  aMatch   :TCurrMatch;
                         aID           :Longint;
                         aCloseBefore  :Boolean;
                         aChangeTab    :Boolean = True);
    procedure CloseMatch (var  aMatch   :TCurrMatch;
                          SaveData :Boolean);
    function  GetTimeStr (aTimeInSec :Integer) :string;
    procedure AddOperation (aQrt    :LongInt;
                            aTime   :Longint;
                            aOper   :TOperationType;
                            aMyTeam :Boolean;
                            aPlr1   :TMatchPlayer;
                            aPlr2   :TMatchPlayer;
                            aDesc   :String;
                            aIParam :Longint;
                            aDesc2  :String); overload;
    procedure AddOperation (aOper   :TOperationType;
                            aMyTeam :Boolean;
                            aPlr1   :TMatchPlayer;
                            aPlr2   :TMatchPlayer;
                            aDesc   :String;
                            aIParam :Longint;
                            aDesc2  :String); overload;
    procedure AddOperation (aOper :TOperation); overload;
    procedure ChiudiQuarto;
    procedure IniziaQuarto;
    procedure RefreshFrames;
    procedure ErrorStatusLedActive;
    procedure ErrorStatusLedInactive;
    procedure WriteStatusText (aStr :string);
    procedure ResizeInterface;
    function  GetQuarterPlayed :LongInt;
    function  GetCurrQuarter :Longint;
    function  GetCurrTime :LongInt;
    procedure StopThetime (DoSave :Boolean = True);
    procedure UpdateSelection (Sender :TObject);
    procedure RefreshAllFrames;
    function  GetTimeInSec :LongInt;
    function  GetCurrMyTeamScore :LongInt;
    function  GetCurrOppTeamScore :LongInt;
    procedure SortFieldList;
    procedure UpdateDiff;
    procedure UndoLastCommand;
    procedure AddCheckPoint;
    procedure CreaExcel;
    function  CreateExcelFileName :String;
    procedure ShowRecent;
    procedure OnOperationListChanged;
    procedure ExecuteAutoSave;
    procedure RefreshMatchInfos (aMatch :TCurrMatch);
    procedure UpdateParzialiProgressivi;
    procedure SelectMyTeamPlayer (Plr :TMatchPlayer);
    procedure SelectOppoTeamPlayer (Plr :TMatchPlayer);
    procedure ResetStartedTime;
  end;




var
  MainWind: TMainWind;










implementation

{$R *.dfm}



uses
   TntExceptionHandler,
   BSDEvo.DMod.EurekaLogDataMod;





{ TMainWind }

procedure TMainWind.FormCreate(Sender: TObject);
var
   Xxx   :LongInt;
   Num   :LongInt;
   Tot   :Longint;
   procedure UpdateFrameSplash;
   begin
      Inc (Num);
      SplashWnd.Info (Format ('Frames creation... (%d%%)', [(Num*100) div Tot]), True);
   end;
begin
   Primavolta := True;
   PrimoGioco := True;
   SplashWnd.Info ('Initializing main window...', True);
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMainWind.FormCreate ()', []);
   try
      try
         Left := 0;
         Top  := 0;
         Width := 1020;
         Height := 762;
         Num := 0;
         Tot := (2*MaxFieldPlayers)+(2*MaxRosterPlayers);
         OvcRegistryStore.KeyName := RegKey_WindowsPos;
         SkinUtils_SkinController := TheSkinCtrl;
         LoadSkin;
         EndShow  := False;
         ErrorStatusLedInactive;
         ImgCont := Nil;
         Img := Nil;
         BSDECfg.Read;
         SplashWnd.Info ('Opening database...', True);
         if (DMod.Connection_Open()) then
            DMod.Tables_Open();
         MyFieldPlayers   := TObjectList<TTFrmPlayer>.Create;
         OppoFieldPlayers := TObjectList<TTFrmPlayer>.Create;
         for Xxx:=0 to Pred(MaxFieldPlayers) do
         begin
            UpdateFrameSplash;
            MyFieldPlayers.Add (TTFrmPlayer.Create (TabGioco));
             MyFieldPlayers[Xxx].Parent := TabGioco;
             MyFieldPlayers[Xxx].IsLeft := True;
             MyFieldPlayers[Xxx].Name := Format ('MyFldPlayer%d', [Xxx]);
            //
            UpdateFrameSplash;
            OppoFieldPlayers.Add (TTFrmPlayer.Create (TabGioco));
             OppoFieldPlayers[Xxx].Parent := TabGioco;
             OppoFieldPlayers[Xxx].IsLeft := False;
             OppoFieldPlayers[Xxx].Name := Format ('OpFldPlayer%d', [Xxx]);
         end;
         MyRoster    := TObjectList<TTFrmRoster>.Create;
         OppoRoster  := TObjectList<TTFrmRoster>.Create;
         for Xxx:=0 to Pred(MaxRosterPlayers) do
         begin
            UpdateFrameSplash;
            MyRoster.Add (TTFrmRoster.Create(TabGioco));
             MyRoster[Xxx].Parent := TabGioco;
             MyRoster[Xxx].Name := Format ('MyRoster%d', [Xxx]);
            UpdateFrameSplash;
            OppoRoster.Add (TTFrmRoster.Create(TabGioco));
             OppoRoster[Xxx].Parent := TabGioco;
             OppoRoster[Xxx].Name := Format ('OpRoster%d', [Xxx]);
         end;
         CurrSel := nil;
         Memoop.Lines.Text := '';
         OpList.OnChanged := OnOperationListChanged;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMainWind.FormCreate] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMainWind.FormCreate', []);
   end;
end;


procedure TMainWind.FormShow(Sender: TObject);
var
   Xxx   :LongInt;
   Num   :LongInt;
   Tot   :Longint;
   procedure UpdateFrameSplash;
   begin
      Inc (Num);
      SplashWnd.Info (Format ('Frames initialization... (%d%%)', [(Num*100) div Tot]), True);
   end;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMainWind.FormShow ()', []);
   try
      try
         Num := 0;
         Tot := 6+(2*MaxFieldPlayers)+(2*MaxRosterPlayers);
         UpdateFrameSplash;
         ViewChamp.OptionsView.NoDataToDisplayInfoText := Str_NoDataToDisplay;
         ViewPhase.OptionsView.NoDataToDisplayInfoText := Str_NoDataToDisplay;
         ViewMatches.OptionsView.NoDataToDisplayInfoText := Str_NoDataToDisplay;
         ViewCardMatches.OptionsView.NoDataToDisplayInfoText := Str_NoDataToDisplay;
         ShowCurrSeason;
         PgCtrlMain.ActivePageIndex := 0;
         WriteStatusText ('');
         //
         UpdateFrameSplash;
         FrmMyTeam.IsLeft := True;
         FrmMyTeam.Init;
         FrmMyTeam.Colors.Init (BSDECfg);
         FrmMyTeam.TeamData := Nil;
         FrmMyTeam.UpdtSel := UpdateSelection;
         FrmMyTeam.Update;
         UpdateFrameSplash;
         FrmOppoTeam.IsLeft := False;
         FrmOppoTeam.Init;
         FrmOppoTeam.Colors.Init (BSDECfg);
         FrmOppoTeam.TeamData := Nil;
         FrmOppoTeam.UpdtSel := UpdateSelection;
         FrmOppoTeam.Update;
         UpdateFrameSplash;
         FrmTime.Init;
         //
         for Xxx:=0 to Pred(MaxFieldPlayers) do
         begin
            UpdateFrameSplash;
            MyFieldPlayers[Xxx].Colors.Init (BSDECfg);
            MyFieldPlayers[Xxx].Init;
            MyFieldPlayers[Xxx].IsLeft := True;
            MyFieldPlayers[Xxx].UpdtSel := UpdateSelection;
            //
            UpdateFrameSplash;
            OppoFieldPlayers[Xxx].Colors.Init (BSDECfg);
            OppoFieldPlayers[Xxx].Init;
            OppoFieldPlayers[Xxx].IsLeft := False;
            OppoFieldPlayers[Xxx].UpdtSel := UpdateSelection;
         end;
         for Xxx:=0 to Pred(MaxRosterPlayers) do
         begin
            UpdateFrameSplash;
            MyRoster[Xxx].Colors.Init (BSDECfg);
            MyRoster[Xxx].Init;
            MyRoster[Xxx].UpdtSel := UpdateSelection;
            //
            UpdateFrameSplash;
            OppoRoster[Xxx].Colors.Init (BSDECfg);
            OppoRoster[Xxx].Init;
            OppoRoster[xxx].UpdtSel := UpdateSelection;
         end;
         //
         UpdateFrameSplash;
         FrmShootTL.DataKind := fdkTLiberi;
         FrmShootT2.DataKind := fdkT2;
         FrmShootT3.DataKind := fdkT3;
         FrmRimba.DataKind := fdkRimbalzi;
         FrmPalle.DataKind := fdkPalle;
         FrmStopp.DataKind := fdkStoppate;
         FrmFalli.DataKind := fdkFalli;
         FrmAssist.DataKind := fdkAssist;
         //
         UpdateFrameSplash;
         ShowRecent;
         //
         StatBar.Panels[1].Text := ExceptCounter.ToString();
         EndShow  := True;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMainWind.FormShow] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMainWind.FormShow', []);
   end;
end;


procedure TMainWind.FormActivate(Sender: TObject);
begin
   Caption := GeneraCaption('');
   if (PrimaVolta) then
   begin
      if (SplashWnd <> nil) then
      begin
         SplashWnd.Close;
         SplashWnd.Free;
         SplashWnd := nil;
      end;
   end;
   PrimaVolta := False;
end;


procedure TMainWind.FormCloseQuery(Sender: TObject; var CanClose: Boolean);
var
   Res   :Longint;
begin
   (*
   CanClose := (YnDlg (Str_SureToCloseApp, []) = mrYes);
   if (CanClose) then
   begin
   end;
   *)
   Res := AskExitProgram();
   CanClose := (Res <> 0);
   CloseAndSave := (Res = 2);
end;


procedure TMainWind.FormClose(Sender: TObject; var Action: TCloseAction);
var
   Path     :string;
   Sss      :string;
   OkToSave :Boolean;
   Res      :LongInt;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMainWind.FormClose ()', []);
   try
      try
         CloseMatch (CurrMatch, True);
         DMod.Connection_Close;
         BSDECfg.Save;
         //
         //if (BSDECfg.SaveInCloudAtExit.ValueAsBool) then
         if (CloseAndsave) then
         begin
            Path := AddSlash (Trim (BSDECfg.CloudFolder.ValueAsString));
            if (Path <> '\') then
            begin
               //OkToSave := (YNDlg (Str_SalvareNelCloud, []) = mrYes);
               OkToSave := True;
               if ((OkToSave) and (not DirectoryExists (Path))) then
               begin
                  OkToSave := (YNDlg (Str_CloudFolderNotExists, [Path]) = mrYes);
                  if (OkToSave) then
                     ForceDirectories (Path);
               end;
               //
               if (OkToSave) then
               begin
                  Res := DMod.CopyToCloud();
                  if (Res <> 1) then
                  begin
                     case Res of
                        -1:   Sss := 'Impossibile creare cartella destinazione.';
                        -2:   Sss := 'Impossibile creare file di backup.';
                        -3:   Sss := 'Impossibile copiare il file.';
                        else  Sss := Format ('Errore durante la copia nel cloud: %d', [res]);
                     end;
                     ErrDlg('\n\n\nCopia nel cloud fallita.\n%s\n\n\n', [Sss]);
                  end;
               end;
            end;
         end;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMainWind.FormClose] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMainWind.FormClose', []);
   end;
end;


procedure TMainWind.FormDestroy(Sender: TObject);
var
   Xxx   :Longint;
begin
   MyFieldPlayers.Free;
   OppoFieldPlayers.Free;
   MyRoster.Free;
   OppoRoster.Free;
end;


procedure TMainWind.FormResize(Sender: TObject);
begin
   ResizeInterface;
end;








////////////////////////////////////////////////////////////////////////////////////



function TMainWind.GeneraCaption(aTitle: String): String;
var
   Sss   :String;
   S2    :String;
   Bld   :string;
begin
   try
      if (aTitle = '') then
         Sss := Dalet_Globals.App_Version.ProductName
      else
         Sss := aTitle;
      if (Sss = '') then
         Sss := Dalet_Globals.App_Name;
      S2 := Dalet_Globals.App_Version.CompanyName;
      if (S2 <> '') then
         S2 := 'by '+S2;
      Bld := Dalet_Globals.App_Version.PrivateBuild;
      if (Bld = '#{REVISION}') then
         Bld := ''
      else
         Bld := '.'+Bld;
      Result := Sss + Format ('   %s%s [%s]  %s', [Dalet_Globals.App_Version.FileVersion, Bld, Dalet_Globals.App_Version.BuildDate, {$IFDEF WIN64}' x64'{$ELSE}' x32'{$ENDIF}]);
      {$IF Defined (BETA)}
      Result := '<<BETA>>  '+Result;
      {$IFEND}
   except
      Result := 'BasketScoutDream Evolution';
   end;
end;


procedure TMainWind.LoadSkin;
var
   Sf    :string;
   SkVer :Longint;
begin
   try
      Sf := AddSlash (ExtractFilePath (Application.ExeName))+'BSDEvoSkin.Skinres';  // Checked
      if (FileExists (Sf)) then
      begin
         if (dxSkinsUserSkinLoadFromFile (Sf, 'Dark')) then
         begin
            TheSkinCtrl.SkinName := 'UserSkin';
         end
         else
         begin
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Warning, '[TMainWind.LoadSkin] "Dark" skin not found in skin file: "%s"', [Sf]);
            ErrDlg (Str_SkinNotFoundInFile, ['Dark', Sf]);
         end;
      end
      else
      begin
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Warning, '[TMainWind.LoadSkin] Skin file not found: "%s"', [Sf]);
         ErrDlg (Str_SkinFileNotFound, [Sf]);
      end;
      SkVer := SkinUtils.GetIntegerPropFromSkin (TheSkinCtrl, Self, '_Dalet_SkinVersion', -1);
   except
      on E:Exception do
      begin
         UpdateExceptionCounter;
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMainWind.LoadSkin] Exception "%s"', [E.Message]);
      end;
   end;
end;


procedure TMainWind.MnuAboutClick(Sender: TObject);
begin
   ShowAbout;
end;


procedure TMainWind.MnuActionsClick(Sender: TObject);
begin
   ShowActions;
end;


procedure TMainWind.MnuAzzeraTempiClick(Sender: TObject);
   procedure ClearTeam (aTm :TMatchTeam);
   var
      Xxx   :LongInt;
   begin
      for Xxx:=Low(aTm.Quintetto) to High (aTm.Quintetto) do
         aTm.Quintetto[Xxx] := False;
      aTm.ResetPlayersTime;
   end;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMainWind.MnuAzzeraTempiClick ()', []);
   try
      try
         if (Assigned (FrmTime)) then
         begin
            FrmTime.CurrentQuarter := 1;
            FrmTime.CurrentTime := 60*BSDECfg.DurationRegulTime.ValueAsInteger;
            FrmTime.DisplayTime;
            FrmTime.DisplayQuarter;
         end;
         ClearTeam (CurrMatch.MyTeam);
         ClearTeam (CurrMatch.OppTeam);
         MainWind.RefreshFrames;
         OnOperationListChanged;
         UpdateSelection(Nil);
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMainWind.MnuAzzeraTempiClick] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMainWind.MnuAzzeraTempiClick', []);
   end;
end;


procedure TMainWind.MnuClearEventsClick(Sender: TObject);
   procedure ClearTeam (aTm :TMatchTeam);
   var
      Xxx   :LongInt;
   begin
      for Xxx:=1 to 2 do
         aTm.Timeout1[Xxx] := False;
      for Xxx:=1 to 3 do
         aTm.Timeout2[Xxx] := False;
      for Xxx:=1 to 4 do
         aTm.TimeoutExtra[Xxx] := False;
      for Xxx:=Low(aTm.Quintetto) to High (aTm.Quintetto) do
         aTm.Quintetto[Xxx] := False;
      aTm.ResetQuarti;
      aTm.DeltaRes := 0;
      aTm.ResetPlayersData;
   end;
begin
   if (YNDlg (Str_AzzeraPartita, []) <> mrYes) then
      Exit;
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMainWind.MnuClearEventsClick ()', []);
   try
      try
         if (Assigned (FrmTime)) then
         begin
            FrmTime.CurrentQuarter := 1;
            FrmTime.CurrentTime := 60*BSDECfg.DurationRegulTime.ValueAsInteger;
            FrmTime.DisplayTime;
            FrmTime.DisplayQuarter;
         end;
         CurrentQuarter := GetCurrQuarter;
         CurrMatch.MatchStatus := msNotPlayed;
         ClearTeam (CurrMatch.MyTeam);
         ClearTeam (CurrMatch.OppTeam);
         OpList.Clear;
         CurrMatch.SaveToDB (True);
         MainWind.RefreshFrames;
         OnOperationListChanged;
         UpdateSelection(Nil);
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMainWind.MnuClearEventsClick] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMainWind.MnuClearEventsClick', []);
   end;
end;


procedure TMainWind.MnuConfigClick(Sender: TObject);
begin
   if (ConfigApplication()) then
   begin
   end;
end;


procedure TMainWind.MnuCopyFromCloudClick(Sender: TObject);
var
   OldCur   :TCursor;
begin
   OldCur := Screen.Cursor;
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMainWind.MnuCopyFromCloudClick ()', []);
   try
      try
         if (YNDlg (Str_SicuroRecuperoDaCloud, []) <> mrYes) then
         begin
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Info, '[TMainWind.MnuCopyFromCloudClick] Operation cancelled by user', []);
            Exit;
         end;
         SetCur (crHourGlass);
         PgCtrlMain.Visible := False;
         DMod.CopyFromCloud();
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMainWind.MnuCopyFromCloudClick] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      PgCtrlMain.Visible := True;
      SetCur (OldCur);
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMainWind.MnuCopyFromCloudClick', []);
   end;
end;

procedure TMainWind.MnuDatabasesClick(Sender: TObject);
begin
   DatabasesWindow;
end;


procedure TMainWind.MnuEditNumbersNamesClick(Sender: TObject);
begin
   BtnEditRoster2Click(BtnEditRoster2);
end;

procedure TMainWind.MnuExitClick(Sender: TObject);
begin
   Close;
end;


procedure TMainWind.MnuGlobalFoulsClick(Sender: TObject);
var
   Tm :TMatchTeam;
begin
Exit;
   if (not FrmOppoTeam.IsSelected) then
      Tm := CurrMatch.MyTeam
   else
      Tm := CurrMatch.OppTeam;
   if (SetGlobalFouls (Tm, CurrentQuarter)) then
   begin
   end;
end;

procedure TMainWind.MnuHDClick(Sender: TObject);
begin
   Width  := 1920;
   Height := 1080;
end;


procedure TMainWind.MnuImportFromLogClick(Sender: TObject);
begin
   ImportaDaLog;
end;

procedure TMainWind.MnuReopenDBClick(Sender: TObject);
begin
   MsgDlg('\n\nOperation result: %d\n\n', [DMod.CloseAndReopenAll]);
end;

procedure TMainWind.MnuSetPlayingTimesClick(Sender: TObject);
var
   Tm :TMatchTeam;
begin
   if (not FrmOppoTeam.IsSelected) then
      Tm := CurrMatch.MyTeam
   else
      Tm := CurrMatch.OppTeam;
   if (PlayingTimeSetting (Tm)) then
   begin
   end;
end;

procedure TMainWind.MnuStatisticheClick(Sender: TObject);
var
   TeamID      :LongInt;
   TeamName    :string;
   MatchList   :TList<Integer>;
   Xxx         :LongInt;
begin
   TeamID      := 0;
   MatchList   := TList<Integer>.Create;
   ViewChamp.DataController.DataSource := Nil;
   ViewPhase.DataController.DataSource := Nil;
   ViewCardMatches.DataController.DataSource := Nil;
   try
      ExecuteStats (TeamID, TeamName, MatchList);
      //
      DMod.Connection_Close;
      if (DMod.Connection_Open()) then
      begin
         DMod.Tables_Open();
      end;
   finally
      ViewChamp.DataController.DataSource := DMod.DsChampFilt;
      ViewPhase.DataController.DataSource := DMod.DsPhaseFilt;
      ViewCardMatches.DataController.DataSource := DMod.DsMatchHeader;
      ShowCurrSeason;
      ShowRecent;
      MatchList.Free;
   end;
end;

procedure TMainWind.MnuSVGAClick(Sender: TObject);
begin
   Width  := 1024;
   Height := 768;
end;


procedure TMainWind.MnuYogaClick(Sender: TObject);
begin
   Width  := 1376;
   Height := 768;
end;


procedure TMainWind.ShowCurrSeason;
begin
   try
      if (BSDECfg.CurrentSeason.ValueAsInteger < 1) then
      begin
         LabCurrSeason.Caption := Str_SeasonNotDefined;
         DMod.TblChampFilt.Filter := Format ('LinkSeason = %d', [0]);
         DMod.TblChampFilt.Filtered := True;
         DMod.TblPhaseFilt.Filter := Format ('LinkChamp = %d', [0]);
         DMod.TblPhaseFilt.Filtered := True;
         BSDECfg.CurrSeasonName := '';
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Warning, '[TMainWind.ShowCurrSeason] Season not yet selected', []);
         Exit;
      end;
      if (DMod.TblSeasons.Locate ('ID', BSDECfg.CurrentSeason.ValueAsInteger)) then
      begin
         LabCurrSeason.Caption := DMod.TblSeasonsDispName.AsString;
         BSDECfg.CurrSeasonName := DMod.TblSeasonsDispName.AsString;
         DMod.TblChampFilt.Filter := Format ('LinkSeason = %d', [BSDECfg.CurrentSeason.ValueAsInteger]);
         DMod.TblChampFilt.Filtered := True;
         DMod.TblPhaseFilt.Filter := Format ('LinkChamp = %d', [DMod.TblChampFiltID.AsInteger]);
         DMod.TblPhaseFilt.Filtered := True;
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Debug, '[TMainWind.ShowCurrSeason] Selected Season ID is %d', [BSDECfg.CurrentSeason.ValueAsInteger]);
      end
      else
      begin
         LabCurrSeason.Caption := Str_SeasonNotDefined;
         DMod.TblChampFilt.Filter := Format ('LinkSeason = %d', [0]);
         DMod.TblChampFilt.Filtered := True;
         DMod.TblPhaseFilt.Filter := Format ('LinkChamp = %d', [0]);
         DMod.TblPhaseFilt.Filtered := True;
         BSDECfg.CurrSeasonName := '';
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Warning, '[TMainWind.ShowCurrSeason] Selected Season (%d) not found in database', [BSDECfg.CurrentSeason.ValueAsInteger]);
         Exit;
      end;
   except
      on E:Exception do
      begin
         UpdateExceptionCounter;
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMainWind.ShowCurrSeason] Exception "%s"', [E.Message]);
      end;
   end;
end;


procedure TMainWind.SelectMyTeamPlayer(Plr: TMatchPlayer);
var
    Roster  :TObjectList<TTFrmRoster>;
    Xxx     :LongInt;
begin
   if (Plr = nil) then
   begin
      FrmMyTeam.ExecuteSelect;
      Exit;
   end;
   Roster := MyRoster;
   for Xxx:=0 to Pred(Roster.Count) do
   begin
      if ((Roster[Xxx].PlayerData <> Nil) and (Plr.PlayNumber = Roster[Xxx].PlayerData.PlayNumber)) then
      begin
         Roster[xxx].ExecuteSelect;
         Break;
      end;
   end;
end;

procedure TMainWind.SelectOppoTeamPlayer(Plr: TMatchPlayer);
var
    Roster  :TObjectList<TTFrmRoster>;
    Xxx     :LongInt;
begin
   if (Plr = nil) then
   begin
      FrmOppoTeam.ExecuteSelect;
      Exit;
   end;
   Roster := OppoRoster;
   for Xxx:=0 to Pred(Roster.Count) do
   begin
      if ((Roster[Xxx].PlayerData <> Nil) and (Plr.PlayNumber = Roster[Xxx].PlayerData.PlayNumber)) then
      begin
         Roster[xxx].ExecuteSelect;
         Break;
      end;
   end;
end;

procedure TMainWind.SelectRecent;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMainWind.SelectRecent ()', []);
   try
      try
         DMod.TblMatchHeader.Filtered := False;
         DMod.TblMatchHeader.Filter := '';
         DMod.TblMatchHeader.First;
         if (DMod.TblMatchHeader.Locate ('ID', MemTblRecentMatchID.AsInteger)) then
         begin
            OpenMatch (CurrMatch, MemTblRecentMatchID.AsInteger, True);
         end;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMainWind.SelectRecent] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMainWind.SelectRecent', []);
   end;
end;


procedure TMainWind.ShowRecent;
var
   Xxx   :Longint;
   aID   :LongInt;
   OldID :Longint;
   FltOn :Boolean;
   FltSt :string;
   Sss   :string;
   S2    :string;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMainWind.ShowRecent ()', []);
   FltOn := DMod.TblMatchHeader.Filtered;
   FltSt := DMod.TblMatchHeader.Filter;
   OldID := DMod.TblMatchHeaderID.AsInteger;
   MemTblRecent.DisableControls;
   DMod.TblMatchHeader.DisableControls;
   try
      try
         DMod.TblMatchHeader.Active := True;
         MemTblRecent.Active := True;
         while (MemTblRecent.RecordCount > 0) do
            MemTblRecent.Delete;
         DMod.TblMatchHeader.Filtered := False;
         DMod.TblMatchHeader.Filter := '';
         DMod.TblMatchHeader.First;
         // Prima verifico che nella lista dei recenti ci siano degli ID validi che corrispondono a record nel database
         for Xxx:=Pred(RecentMatches.Count) downto 0 do
         begin
            aID := StrToIntDef (RecentMatches[Xxx], 0);
            if (aID > 0) then
            begin
               if (not DMod.TblMatchHeader.Locate ('ID', aID)) then
                  RecentMatches.Delete (Xxx);
            end
            else
               RecentMatches.Delete (Xxx);
         end;
         // Sulla base della lista popolo la tabella dei recenti
         for Xxx:=0 to Pred(RecentMatches.Count) do
         begin
            aID := StrToIntDef (RecentMatches[Xxx], 0);
            DMod.TblMatchHeader.Locate ('ID', aID);
            MemTblRecent.Append;
            try
               MemTblRecentChampName.AsString := DMod.TblMatchHeaderChampCalc.AsString;
               MemTblRecentPhaseName.AsString := DMod.TblMatchHeaderPhaseLook.AsString;
               MemTblRecentMatchTitle.AsString := DMod.TblMatchHeaderTitle.AsString;
               MemTblRecentGiornata.AsString := DMod.TblMatchHeaderDay.AsString;
               MemTblRecentMatchDate.AsDateTime := DMod.TblMatchHeaderPlayDate.AsDateTime;
               MemTblRecentMatchID.AsInteger := DMod.TblMatchHeaderID.AsInteger;
               if (DMod.TblMatchHeaderHome.AsBoolean) then
               begin
                  MemTblRecentTeams.AsString := Trim (DMod.TblMatchHeaderMyTeamName.AsString) + ' - ' + Trim (DMod.TblMatchHeaderOppTeamName.AsString);
                  S2 := Format ('%d - %d   :   ', [Dmod.TblMatchHeaderMyTeamPoints.AsInteger, DMod.TblMatchHeaderOppTeamPoints.AsInteger]);
               end
               else
               begin
                  MemTblRecentTeams.AsString := Trim (DMod.TblMatchHeaderOppTeamName.AsString) + ' - ' + Trim (DMod.TblMatchHeaderMyTeamName.AsString);
                  S2 := Format ('%d - %d   :   ', [Dmod.TblMatchHeaderOppTeamPoints.AsInteger, DMod.TblMatchHeaderMyTeamPoints.AsInteger]);
               end;
               MemTblRecentMatchStatus.AsString := S2+TMatchStatus.ToDesc (DMod.TblMatchHeaderMatchStatus.AsInteger);
            finally
               MemTblRecent.Post;
            end;
         end;
         MemTblRecent.First;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMainWind.ShowRecent] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      DMod.TblMatchHeader.Filter := FltSt;
      DMod.TblMatchHeader.Filtered := FltOn;
      DMod.TblMatchHeader.First;
      DMod.TblMatchHeader.Locate ('ID', OldID);
      DMod.TblMatchHeader.EnableControls;
      MemTblRecent.EnableControls;
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMainWind.ShowRecent', []);
   end;
end;


procedure TMainWind.SortFieldList;
var
   Xxx   :LongInt;
   P1    :TMatchPlayer;
   P2    :TMatchPlayer;
   N1    :LongInt;
   N2    :LongInt;
begin
   if (not BSDECfg.FieldPlayersSorting.ValueAsBool) then
      Exit;
   //
   Xxx := 1;
   while (Xxx < 5) do
   begin
      P1 := MyFieldPlayers[Xxx-1].PlayerData;
      P2 := MyFieldPlayers[Xxx].PlayerData;
      N1 := StrToIntDef(P1.PlayNumber, -1);
      N2 := StrToIntDef(P2.PlayNumber, -1);
      if (N1 > N2) then
      begin
         MyFieldPlayers[Xxx-1].PlayerData := P2;
         MyFieldPlayers[Xxx].PlayerData   := P1;
         Xxx := 1;
      end
      else
         Inc (Xxx);
   end;
   //
   Xxx := 1;
   while (Xxx < 5) do
   begin
      P1 := OppoFieldPlayers[Xxx-1].PlayerData;
      P2 := OppoFieldPlayers[Xxx].PlayerData;
      N1 := StrToIntDef(P1.PlayNumber, -1);
      N2 := StrToIntDef(P2.PlayNumber, -1);
      if (N1 > N2) then
      begin
         OppoFieldPlayers[Xxx-1].PlayerData := P2;
         OppoFieldPlayers[Xxx].PlayerData   := P1;
         Xxx := 1;
      end
      else
         Inc (Xxx);
   end;
end;


procedure TMainWind.StopThetime (DoSave :Boolean = True);
begin
   FrmTime.ExecuteTimeStop (DoSave);
end;


procedure TMainWind.TabGiocoDblClick(Sender: TObject);
begin
   ShowActions;
end;


procedure TMainWind.TimerOffErrorLedTimer(Sender: TObject);
begin
   TimerOffErrorLed.Enabled := False;
   ErrorStatusLedInactive;
end;


procedure TMainWind.TmrMainRefreshTimer(Sender: TObject);
begin
   TmrMainRefresh.Enabled := False;
   RefreshAllFrames;
end;


procedure TMainWind.UndoLastCommand;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMainWind.UndoLastCommand ()', []);
   try
      try
         if ((Assigned (OpList)) and (OpList.Count > 0)) then
            OpList.RemoveAction (OpList.Count-1);
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMainWind.UndoLastCommand] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMainWind.UndoLastCommand', []);
   end;
end;


procedure TMainWind.UpdateDiff;
var
   Diff  :Longint;
   DiffQ :LongInt;
   Cq    :LongInt;
begin
   Cq := GetCurrQuarter-1;
   if (Cq < 0) then
      Cq := 0;
   if ((FrmMyTeam = Nil) or (FrmMyTeam.TeamData = Nil) or (FrmOppoTeam = Nil) or (FrmOppoTeam.TeamData = Nil))then
   begin
      LabDiff.Caption := '';
      LabDiffQuarto.Caption := '';
      Exit;
   end;
   Diff  := FrmMyTeam.TeamData.Punti - FrmOppoTeam.TeamData.Punti;
   DiffQ := FrmMyTeam.TeamData.Quarto[Cq].Punti - FrmOppoTeam.TeamData.Quarto[Cq].Punti;
   LabDiff.Caption         := Format (Str_PtiDiff,    [IIF((Diff<0), '-', '+'), Abs(Diff)]);
   LabDiffQuarto.Caption   := Format (Str_PtiDiffQrt, [IIF((DiffQ<0), '-', '+'), Abs(DiffQ)]);
end;


procedure TMainWind.UpdateParzialiProgressivi;
var
   Xxx   :Longint;
   My    :LongInt;
   Oppo  :LongInt;
   S1    :string;
   S2    :string;
begin
   S1 := 'Parziali';
   S2 := 'Progressivi';
   My := 0;
   Oppo := 0;
   for Xxx:=0 to 7 do
   begin
      if (Currmatch.MyTeam.Quarto[Xxx].Status <> qsNotPlayed) then
      begin
         My := My + Currmatch.MyTeam.Quarto[Xxx].Punti;
         Oppo := Oppo + Currmatch.OppTeam.Quarto[Xxx].Punti;
         S1 := S1+#13#10+Format('%d-%d    (%s%d)', [Currmatch.MyTeam.Quarto[Xxx].Punti, Currmatch.OppTeam.Quarto[Xxx].Punti,
                                                    IIF (((Currmatch.MyTeam.Quarto[Xxx].Punti-Currmatch.OppTeam.Quarto[Xxx].Punti)>0), '+', ''),
                                                    Currmatch.MyTeam.Quarto[Xxx].Punti-Currmatch.OppTeam.Quarto[Xxx].Punti]);
         S2 := S2+#13#10+Format('%d-%d    (%s%d)', [My, Oppo, IIF (((My-Oppo)>0), '+', ''), My-Oppo]);
      end;
   end;
   LabParziali.Caption := S1;
   LabParziali.Refresh;
   LabProgressivi.Caption := S2;
   LabProgressivi.Refresh;
end;

procedure TMainWind.UpdateSelection(Sender: TObject);
var
   FrmPl :TTFrmPlayer;
   FrmRo :TTFrmRoster;
   Xxx   :Longint;
begin
   CurrSel := nil;
   FrmMyTeam.IsSelected := False;
   FrmOppoTeam.IsSelected := False;
   for Xxx:=0 to Pred(MaxFieldPlayers) do
   begin
      FrmPl := TTFrmPlayer(MyFieldPlayers[Xxx]);
      FrmPl.IsSelected := False;
   end;
   for Xxx:=0 to Pred(MaxFieldPlayers) do
   begin
      FrmPl := TTFrmPlayer(OppoFieldPlayers[Xxx]);
      FrmPl.IsSelected := False;
   end;
   for Xxx:=0 to Pred(MaxRosterPlayers) do
   begin
      FrmRo := TTFrmRoster(MyRoster[Xxx]);
      FrmRo.IsSelected := False;
   end;
   for Xxx:=0 to Pred(MaxRosterPlayers) do
   begin
      FrmRo := TTFrmRoster(OppoRoster[Xxx]);
      FrmRo.IsSelected := False;
   end;
   if (Sender is TMatchPlayer) then
   begin
      //PnlCommands.Caption := Format ('Giocatore %s: %s', [TMatchPlayer(Sender).PlayNumber, TMatchPlayer(Sender).Name]);
      FrmShootTL.Team := Nil;
      FrmShootT2.Team := Nil;
      FrmShootT3.Team := Nil;
      FrmRimba.Team := Nil;
      FrmPalle.Team := Nil;
      FrmFalli.Team := Nil;
      FrmStopp.Team := Nil;
      FrmAssist.Team := Nil;
      FrmShootTL.Player := TMatchPlayer(Sender);
      FrmShootT2.Player := TMatchPlayer(Sender);
      FrmShootT3.Player := TMatchPlayer(Sender);
      FrmRimba.Player   := TMatchPlayer(Sender);
      FrmPalle.Player   := TMatchPlayer(Sender);
      FrmFalli.Player   := TMatchPlayer(Sender);
      FrmStopp.Player   := TMatchPlayer(Sender);
      FrmAssist.Player  := TMatchPlayer(Sender);
      FrmShootTL.Update;
      FrmShootT2.Update;
      FrmShootT3.Update;
      FrmRimba.Update;
      FrmPalle.Update;
      FrmFalli.Update;
      FrmStopp.Update;
      FrmAssist.Update;
      //LabNome.Caption := PnlCommands.Caption;
      //LabNome.Visible := True;
      //TimerNome.Enabled := True;
      //LabNome.BringToFront;
      CurrSel := TMatchPlayer(Sender);
   end;
   if (Sender is TMatchTeam) then
   begin
      //PnlCommands.Caption := Format ('TEAM %s', [TTeamMatch(Sender).TeamName]);
      FrmShootTL.Player := nil;
      FrmShootT2.Player := nil;
      FrmShootT3.Player := Nil;
      FrmRimba.Player := nil;
      FrmPalle.Player := nil;
      FrmFalli.Player := nil;
      FrmStopp.Player := nil;
      FrmAssist.Player := nil;
      FrmShootTL.Team := TMatchTeam(Sender);
      FrmShootT2.Team := TMatchTeam(Sender);
      FrmShootT3.Team := TMatchTeam(Sender);
      FrmRimba.Team := TMatchTeam(Sender);
      FrmPalle.Team := TMatchTeam(Sender);
      FrmFalli.Team := TMatchTeam(Sender);
      FrmStopp.Team := TMatchTeam(Sender);
      FrmAssist.Team := TMatchTeam(Sender);
      FrmShootTL.Update;
      FrmShootT2.Update;
      FrmShootT3.Update;
      FrmRimba.Update;
      FrmPalle.Update;
      FrmFalli.Update;
      FrmStopp.Update;
      FrmAssist.Update;
      //LabNome.Caption := PnlCommands.Caption;
      //LabNome.Visible := True;
      //TimerNome.Enabled := True;
      //LabNome.BringToFront;
      CurrSel := TMatchTeam(Sender);
   end;
   UpdateDiff;
end;


procedure TMainWind.ViewCardMatchesDblClick(Sender: TObject);
begin
   HideInterface;
   try
      OpenMatch (CurrMatch, DMod.TblMatchHeaderID.AsInteger, True);
   finally
      ShowInterface;
   end;
end;


procedure TMainWind.ViewChampFocusedRecordChanged (Sender: TcxCustomGridTableView;
                                                   APrevFocusedRecord,
                                                   AFocusedRecord: TcxCustomGridRecord;
                                                   ANewItemRecordFocusingChanged: Boolean);
begin
   DMod.TblPhaseFilt.Filter := Format ('LinkChamp = %d', [DMod.TblChampFiltID.AsInteger]);
   DMod.TblPhaseFilt.Filtered := True;
end;


procedure TMainWind.ViewPhaseFocusedRecordChanged (Sender: TcxCustomGridTableView;
                                                   APrevFocusedRecord,
                                                   AFocusedRecord: TcxCustomGridRecord;
                                                   ANewItemRecordFocusingChanged: Boolean);
begin
   DMod.TblMatchHeader.Filter := Format ('LinkPhase = %d', [DMod.TblPhaseFiltID.AsInteger]);
   DMod.TblMatchHeader.Filtered := True;
   DMod.TblMatchHeader.Last;
end;


procedure TMainWind.WriteStatusText(aStr: string);
begin
   StatBar.Panels[2].Text := aStr;
   StatBar.Refresh;
end;


procedure TMainWind.BtnSeasonChangeClick(Sender: TObject);
var
   Id :Longint;
begin
   Id := GetSeason();
   if (Id > 0) then
      BSDECfg.CurrentSeason.ValueAsInteger := Id;
   ShowCurrSeason;
end;


procedure TMainWind.BtnSostClick(Sender: TObject);
var
   DoSave   :Boolean;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMainWind.BtnSostClick ()', []);
   DoSave := False;
   try
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Debug, '[TMainWind.BtnSostClick] Stopping the time...', []);
      StopTheTime (False);
      DelayAndProcess(250);
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Debug, '[TMainWind.BtnSostClick] Time stopped', []);
      if (Sostituisci (not FrmOppoTeam.IsSelected)) then
      begin
         if (FrmOppoTeam.IsSelected) then
         begin
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Debug, '[TMainWind.BtnSostClick] Sostituzione OpponentTeam', []);
            FrmOppoTeam.ExecuteSelect;
         end
         else
         begin
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Debug, '[TMainWind.BtnSostClick] Sostituzione MyTeam', []);
            FrmMyTeam.ExecuteSelect;
         end;
         if (FrmTime.CurrentTime < 1) then
         begin
            ChiudiQuarto;
         end;
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Debug, '[TMainWind.BtnSostClick] Updating interface', []);
         RefreshAllFrames;
         DoSave := True;
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Debug, '[TMainWind.BtnSostClick] Update selection', []);
         UpdateSelection (CurrMatch.MyTeam);
      end;
   finally
      if (DoSave) then
      begin
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Debug, '[TMainWind.BtnSostClick] Save data of match', []);
         CurrMatch.SaveToDB (True);
      end;
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMainWind.BtnSostClick ()', []);
   end;
end;


procedure TMainWind.BtnUndoClick(Sender: TObject);
begin
   UndoLastCommand();
end;


procedure TMainWind.ErrorStatusLedActive;
begin
   TdxStatusBarStateIndicatorPanelStyle(StatBar.Panels[0].PanelStyle).Indicators[0].IndicatorType := sitPurple;
end;


procedure TMainWind.ErrorStatusLedInactive;
begin
   TdxStatusBarStateIndicatorPanelStyle(StatBar.Panels[0].PanelStyle).Indicators[0].IndicatorType := sitOff;
end;


procedure TMainWind.ExecuteAutoSave;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMainWind.ExecuteAutosave ()', []);
   try
      try
         if (InDBSaving) then
         begin
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Notify, '[TMainWind.ExecuteAutoSave] Operation skipped because alredy in progress', []);
            Exit;
         end;
         if (LastSaveTimeLessThan (2000)) then
         begin
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Notify, '[TMainWind.ExecuteAutoSave] Operation skipped because done just now', []);
            Exit;
         end;
         if (CurrMatch.MatchOpen) then
         begin
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Info, 'Autosaving match %s', [CurrMatch.Title]);
            //if (OpList.Modified) then
            //   OpList.Save (True);
            //CurrMatch.SaveToDB;
            with TSaveThread.Create (CurrMatch) do
               Resume;
         end;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMainWind.ExecuteAutoSave] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMainWind.ExecuteAutoSave ()', []);
   end;
end;


procedure TMainWind.ExecuteEditMatch;
var
   Reload   :Boolean;
begin
   if (CurrMatch.RecID = DMod.TblMatchHeaderID.AsInteger) then
      Reload := True
   else
      Reload := False;
   NewEditMatchHeader (False);
   if (Reload) then
   begin
      CloseMatch (CurrMatch, False);
      OpenMatch (CurrMatch, CurrMatch.RecID, True);
   end;
end;


function TMainWind.ExecuteEditRoster :Boolean;
var
   Xxx   :Longint;
   Idx   :Longint;
   Plr   :TMatchPlayer;
   Found :Boolean;
begin
   Result := False;
   MyCoach1 := DMod.TblMatchHeaderMyCoach1.AsString;
   MyCoach2 := DMod.TblMatchHeaderMyCoach2.AsString;
   OppoCoach1 := DMod.TblMatchHeaderOppCoach1.AsString;
   OppoCoach2 := DMod.TblMatchHeaderOppCoach2.AsString;
   NewEditRoster (DMod.TblMatchHeaderID.AsInteger,
                      MyCoach1, MyCoach2,
                      OppoCoach1, Oppocoach2);
   // Controllo che non ci siano stati spostamenti dei giocatori nella lista del roster
   if (CurrMatch.RecID = DMod.TblMatchHeaderID.AsInteger) then
   begin
      //
      // MyTeam
      //
      CurrMatch.MyTeam.HeadCoach := MyCoach1;
      CurrMatch.MyTeam.Assistent1 := MyCoach2;
      for Xxx:=0 to Pred(CurrMatch.MyTeam.Roster.Count) do
      begin
         Plr := TMatchPlayer(CurrMatch.MyTeam.Roster.Items[Xxx]);
         Plr.InternalSort := -1;
      end;
      DMod.TblMatchRoster.Filter := Format ('(LinkMatchHeader = %d) AND (IsMyTeam = True)', [CurrMatch.RecID]);
      DMod.TblMatchRoster.Filtered := True;
      DMod.TblMatchRoster.First;
      for Xxx:=0 to Pred(CurrMatch.MyTeam.Roster.Count) do
      begin
         Idx := 0;
         Plr := TMatchPlayer(CurrMatch.MyTeam.Roster.Items[Xxx]);
         while (not DMod.TblMatchRoster.Eof) do
         begin
            if (Plr.PlayerRecID = DMod.TblMatchRosterLinkPlayer.AsInteger) then
            begin
               Plr.InternalSort := Idx+1;
               Plr.RosterRecID := DMod.TblMatchRosterID.AsInteger;
               Plr.PlayNumber := DMod.TblMatchRosterPlayNumber.AsString;
               Plr.InQuintetto := DMod.TblMatchRosterQuintetto.AsBoolean;
               Plr.Captain := DMod.TblMatchRosterCaptain.AsBoolean;
               Break;
            end;
            DMod.TblMatchRoster.Next;
            Inc (Idx);
         end;
      end;
      // ciclo opposto, partendo dal database
      DMod.TblMatchRoster.First;
      Idx := 0;
      while (not DMod.TblMatchRoster.Eof) do
      begin
         Found := False;
         for Xxx:=0 to Pred(CurrMatch.MyTeam.Roster.Count) do
         begin
            Plr := TMatchPlayer(CurrMatch.MyTeam.Roster.Items[Xxx]);
            if (Plr.PlayerRecID = DMod.TblMatchRosterLinkPlayer.AsInteger) then
            begin
               Plr.InternalSort := Idx+1;
               Plr.RosterRecID := DMod.TblMatchRosterID.AsInteger;
               Plr.PlayNumber := DMod.TblMatchRosterPlayNumber.AsString;
               Plr.InQuintetto := DMod.TblMatchRosterQuintetto.AsBoolean;
               Plr.Captain := DMod.TblMatchRosterCaptain.AsBoolean;
               Found := True;
               Break;
            end;
         end;
         if (not Found) then
         begin
            // un nuovo giocatore è stato aggiunto
            Plr := TMatchPlayer.Create;
            //
            Plr.RosterRecID   := DMod.TblMatchRosterID.AsInteger;
            Plr.PlayerRecID   := DMod.TblMatchRosterLinkPlayer.AsInteger;
            Plr.PlayNumber    := DMod.TblMatchRosterPlayNumber.AsString;
            Plr.Name          := DMod.TblMatchRosterDbgPlayer.AsString;
            Plr.Captain       := DMod.TblMatchRosterCaptain.AsBoolean;
            Plr.InQuintetto   := DMod.TblMatchRosterQuintetto.AsBoolean;
            Plr.IsMyTeam      := DMod.TblMatchRosterIsMyTeam.AsBoolean;
            //
            CurrMatch.MyTeam.Roster.Add(Plr);
         end;
         DMod.TblMatchRoster.Next;
         Inc (Idx);
      end;
      // Cancellazione giocatori non più presenti
      for Xxx:=Pred(CurrMatch.MyTeam.Roster.Count) downto 0 do
      begin
         if (TMatchPlayer(CurrMatch.MyTeam.Roster.Items[Xxx]).InternalSort < 0) then
            CurrMatch.MyTeam.Roster.Delete (Xxx);
      end;
      // Ordinamento
      Xxx := 1;
      while (Xxx < CurrMatch.MyTeam.Roster.Count) do
      begin
         if (TMatchPlayer(CurrMatch.MyTeam.Roster.Items[Xxx-1]).InternalSort > TMatchPlayer(CurrMatch.MyTeam.Roster.Items[Xxx]).InternalSort) then
         begin
            CurrMatch.MyTeam.Roster.Exchange (Xxx-1, Xxx);
            Xxx := 1;
         end
         else
            Inc (Xxx);
      end;
      //
      // OppenentTeam
      //
      CurrMatch.OppTeam.HeadCoach := OppoCoach1;
      CurrMatch.OppTeam.Assistent1 := OppoCoach2;
      for Xxx:=0 to Pred(CurrMatch.OppTeam.Roster.Count) do
      begin
         Plr := TMatchPlayer(CurrMatch.OppTeam.Roster.Items[Xxx]);
         Plr.InternalSort := -1;
      end;
      DMod.TblMatchRoster.Filter := Format ('(LinkMatchHeader = %d) AND (IsMyTeam = False)', [CurrMatch.RecID]);
      DMod.TblMatchRoster.Filtered := True;
      DMod.TblMatchRoster.First;
      for Xxx:=0 to Pred(CurrMatch.OppTeam.Roster.Count) do
      begin
         Idx := 0;
         Plr := TMatchPlayer(CurrMatch.OppTeam.Roster.Items[Xxx]);
         while (not DMod.TblMatchRoster.Eof) do
         begin
            if (Plr.PlayerRecID = DMod.TblMatchRosterLinkPlayer.AsInteger) then
            begin
               Plr.InternalSort := Idx+1;
               Plr.RosterRecID := DMod.TblMatchRosterID.AsInteger;
               Plr.PlayNumber := DMod.TblMatchRosterPlayNumber.AsString;
               Plr.InQuintetto := DMod.TblMatchRosterQuintetto.AsBoolean;
               Plr.Captain := DMod.TblMatchRosterCaptain.AsBoolean;
               Break;
            end;
            DMod.TblMatchRoster.Next;
            Inc (Idx);
         end;
      end;
      // ciclo opposto, partendo dal database
      DMod.TblMatchRoster.First;
      Idx := 0;
      while (not DMod.TblMatchRoster.Eof) do
      begin
         Found := False;
         for Xxx:=0 to Pred(CurrMatch.OppTeam.Roster.Count) do
         begin
            Plr := TMatchPlayer(CurrMatch.OppTeam.Roster.Items[Xxx]);
            if (Plr.PlayerRecID = DMod.TblMatchRosterLinkPlayer.AsInteger) then
            begin
               Plr.InternalSort := Idx+1;
               Plr.RosterRecID := DMod.TblMatchRosterID.AsInteger;
               Plr.PlayNumber := DMod.TblMatchRosterPlayNumber.AsString;
               Plr.InQuintetto := DMod.TblMatchRosterQuintetto.AsBoolean;
               Plr.Captain := DMod.TblMatchRosterCaptain.AsBoolean;
               Found := True;
               Break;
            end;
         end;
         if (not Found) then
         begin
            // un nuovo giocatore è stato aggiunto
            Plr := TMatchPlayer.Create;
            //
            Plr.RosterRecID   := DMod.TblMatchRosterID.AsInteger;
            Plr.PlayerRecID   := DMod.TblMatchRosterLinkPlayer.AsInteger;
            Plr.PlayNumber    := DMod.TblMatchRosterPlayNumber.AsString;
            Plr.Name          := DMod.TblMatchRosterDbgPlayer.AsString;
            Plr.Captain       := DMod.TblMatchRosterCaptain.AsBoolean;
            Plr.InQuintetto   := DMod.TblMatchRosterQuintetto.AsBoolean;
            Plr.IsMyTeam      := DMod.TblMatchRosterIsMyTeam.AsBoolean;
            //
            CurrMatch.OppTeam.Roster.Add(Plr);
         end;
         DMod.TblMatchRoster.Next;
         Inc (Idx);
      end;
      // Cancellazione giocatori non più presenti
      for Xxx:=Pred(CurrMatch.OppTeam.Roster.Count) downto 0 do
      begin
         if (TMatchPlayer(CurrMatch.OppTeam.Roster.Items[Xxx]).InternalSort < 0) then
            CurrMatch.OppTeam.Roster.Delete (Xxx);
      end;
      // Ordinamento
      Xxx := 1;
      while (Xxx < CurrMatch.OppTeam.Roster.Count) do
      begin
         if (TMatchPlayer(CurrMatch.OppTeam.Roster.Items[Xxx-1]).InternalSort > TMatchPlayer(CurrMatch.OppTeam.Roster.Items[Xxx]).InternalSort) then
         begin
            CurrMatch.OppTeam.Roster.Exchange (Xxx-1, Xxx);
            Xxx := 1;
         end
         else
            Inc (Xxx);
      end;
      //
      //
      //
      Result := True;
   end;
end;


procedure TMainWind.BtnCheckPointClick(Sender: TObject);
begin
   AddCheckPoint;
end;


procedure TMainWind.BtnDeltaDownLeftClick(Sender: TObject);
begin
   SpinDeltaLeft.Value := SpinDeltaLeft.Value-1;
   if (CurrMatch.Home) then
      CurrMatch.MyTeam.DeltaRes := SpinDeltaLeft.Value
   else
      CurrMatch.OppTeam.DeltaRes := SpinDeltaLeft.Value;
end;


procedure TMainWind.BtnDeltaDownRightClick(Sender: TObject);
begin
   SpinDeltaRight.Value := SpinDeltaRight.Value-1;
   if (CurrMatch.Home) then
      CurrMatch.OppTeam.DeltaRes := SpinDeltaRight.Value
   else
      CurrMatch.MyTeam.DeltaRes := SpinDeltaRight.Value;
end;


procedure TMainWind.BtnDeltaUpLeftClick(Sender: TObject);
begin
   SpinDeltaLeft.Value := SpinDeltaLeft.Value+1;
   if (CurrMatch.Home) then
      CurrMatch.MyTeam.DeltaRes := SpinDeltaLeft.Value
   else
      CurrMatch.OppTeam.DeltaRes := SpinDeltaLeft.Value;
end;


procedure TMainWind.BtnDeltaUpRightClick(Sender: TObject);
begin
   SpinDeltaRight.Value := SpinDeltaRight.Value+1;
   if (CurrMatch.Home) then
      CurrMatch.OppTeam.DeltaRes := SpinDeltaRight.Value
   else
      CurrMatch.MyTeam.DeltaRes := SpinDeltaRight.Value;
end;


procedure TMainWind.BtnEditMatch2Click(Sender: TObject);
begin
   if (CurrMatch.MatchStatus <> msNotPlayed) then
   begin
      if (YnDlg (Str_SicuroModificareMatch, []) <> mrYes) then
         Exit;
   end;
   InternalEditMatch;
end;


procedure TMainWind.InternalEditMatch;
var
   ID :LongInt;
begin
   ID := CurrMatch.RecID;
   if (DMod.TblMatchHeader.Locate ('ID', ID)) then
   begin
      ExecuteEditMatch;
      if (CurrMatch.RecID <> ID) then
      begin
         if (DMod.TblMatchHeader.Locate ('ID', ID)) then
         begin
            OpenMatch (CurrMatch, ID, True);//DMod.TblMatchHeaderID.AsInteger);
         end;
      end;
      LabMatchTeams.Refresh;
   end;
end;


procedure TMainWind.BtnEditRoster2Click(Sender: TObject);
var
   Ris   :Boolean;
   Started  :Boolean;
begin
   Started := False;
   if (CurrMatch.MatchStatus <> msNotPlayed) then
   begin
      if (YnDlg (Str_SicuroModificareRoster, []) <> mrYes) then
         Exit;
      Started := True;
   end;
   DMod.TblMatchHeader.Locate ('ID', CurrMatch.RecID);
   Ris := ExecuteEditRoster;
   if (Started = False) then
   begin
      OpenMatch (CurrMatch, DMod.TblMatchHeaderID.AsInteger, Ris);
   end;
   LabMatchTeams.Refresh;
   RefreshMatchInfos (CurrMatch);
end;


procedure TMainWind.BtnMatchDeleteClick(Sender: TObject);
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMainWind.BtnMatchDeleteClick ()', []);
   try
      try
         if (YNDlg (Str_EliminaMatch_s, [DMod.TblMatchHeaderTitle.AsString]) <> mrYes) then
         begin
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Notify, '[TMainWind.BtnMatchDeleteClick] Operazione annullata dall''utente.', []);
            Exit;
         end;
         DMod.DeleteMatchHeader (DMod.TblMatchHeaderID.AsInteger);
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMainWind.BtnMatchDeleteClick] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMainWind.BtnMatchDeleteClick', []);
   end;
end;


procedure TMainWind.BtnMatchEditSelectedClick(Sender: TObject);
begin
   ExecuteEditMatch;
end;


procedure TMainWind.BtnMatchNewClick(Sender: TObject);
begin
   NewEditMatchHeader (True);
end;


procedure TMainWind.BtnMatchOpenClick(Sender: TObject);
begin
   HideInterface;
   try
      OpenMatch (CurrMatch, DMod.TblMatchHeaderID.AsInteger, True);
   finally
      ShowInterface;
   end;
end;


procedure TMainWind.BtnMatchRoseterClick(Sender: TObject);
begin
   ExecuteEditRoster;
end;


procedure TMainWind.BtnMatchStatusClick(Sender: TObject);
var
   Ms :TMatchStatus;
begin
   Ms.SetFrom (DMod.TblMatchHeaderMatchStatus.AsInteger);
   if (EditMatchStatus (Ms)) then
   begin
      DMod.TblMatchHeader.Edit;
      DMod.TblMatchHeaderMatchStatus.AsInteger := Ms.ToInt();
      DMod.TblMatchHeader.Post;
   end;
end;

procedure TMainWind.BtnOppoRimbAttClick(Sender: TObject);
begin
   FrmOppoTeam.ExecuteSelect;
   FrmRimba.BtnBottom.Click();
end;

procedure TMainWind.OnOperationListChanged;
begin
   try
      MemoOp.Lines.Text := OpList.ToText;
      MemoOp.InnerControl.Perform (EM_LINESCROLL, 0,  MemoOp.Lines.Count);
   except
      on E:Exception do
      begin
         UpdateExceptionCounter;
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMainWind.OnOperationListChanged] Exception "%s"', [E.Message]);
      end;
   end;
end;


procedure TMainWind.OpenMatch (var  aMatch   :TCurrMatch;
                               aID           :Integer;
                               aCloseBefore  :Boolean;
                               aChangeTab    :Boolean = True);
var
   Xxx   :Longint;
//   Yyy   :Longint;
//   Plr   :TMatchPlayer;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMainWind.OpenMatch (%d, %s)', [aID, BoolToStr(aCloseBefore)]);
   try
      try
         if (aCloseBefore) then
            CloseMatch (aMatch, True);
         if (not DMod.TblMatchHeader.Locate ('ID', aID)) then
         begin
            ErrDlg (Str_NonpossibileAprireilMatch, [aID]);
            Exit;
         end;
         aMatch.ReadFromDB (aID);
         aMatch.MatchOpen := True;
         if (not aChangeTab) then
            Exit;
         TabPartita.Enabled := aMatch.MatchOpen;
         RefreshMatchInfos (aMatch);
         FrmMyTeam.TeamData := aMatch.MyTeam;
         FrmOppoTeam.TeamData := aMatch.OppTeam;
         FrmMyTeam.Update;
         FrmOppoTeam.Update;
         PgCtrlMain.ActivePageIndex := 1;
         PgCtrlPartita.ActivePageIndex := 0;
         WriteStatusText (Format ('  [%s]  |  %s', [LabMatchChamp.Caption, LabMatchTeams.Caption]));
         PnlCommands.BringToFront;
         PnlCommands.Height := 24;
         PnlCommands.Left := MyFieldPlayers[0].Left+MyFieldPlayers[0].Width+3;
         PnlCommands.Top := FrmTime.Top+FrmTime.Height+1;
         PnlCommands.Caption := Str_PnlComandiDescChiudi;
         if (PnlCommands.Visible) then
            LabDiff.Left := PnlCommands.Left+PnlCommands.Width+5
         else
            LabDiff.Left := PnlCommands.Left+5;
         LabDiff.Top := PnlCommands.Top-3;
         LabDiff.Refresh;
         LabDiffQuarto.Left := LabDiff.Left + LabDiff.Width + 15;
         LabDiffQuarto.Top := LabDiff.Top+LabDiff.Height-LabDiffQuarto.Height-2;
         LabDiffQuarto.Refresh;
         LabProgressivi.Left := FrmMyTeam.Left+FrmMyTeam.Width+10;
         LabProgressivi.Top := FrmMyTeam.Top+10;
         LabParziali.Left := FrmTime.Left+FrmTime.Width+10;
         LabParziali.Top := FrmMyTeam.Top+10;


         FrmShootTL.Left := PnlCommands.Left+6;
         FrmShootTL.Top  := PnlCommands.Top+PnlCommands.Height+3;
         FrmShootT2.Left := FrmShootTL.Left;
         FrmShootT2.Top  := FrmShootTL.Top+FrmShootTL.Height+6;
         FrmShootT3.Left := FrmShootT2.Left;
         FrmShootT3.Top  := FrmShootT2.Top+FrmShootT2.Height+6;

         FrmRimba.Left := FrmShootTL.Left+FrmShootTL.Width+6;
         FrmRimba.Top  := FrmShootTL.Top;
         FrmPalle.Left := FrmShootTL.Left+FrmShootTL.Width+6;
         FrmPalle.Top  := FrmRimba.Top+FrmRimba.Height+6;
         FrmStopp.Left := FrmShootTL.Left+FrmShootTL.Width+6;
         FrmStopp.Top  := FrmPalle.Top+FrmPalle.Height+6;

         FrmAssist.Left := FrmPalle.Left+FrmPalle.Width+6;
         FrmAssist.Top  := FrmPalle.Top;
         //FrmFalli.Left := FrmAssist.Left + FrmAssist.Width +6;
         //FrmFalli.Top  := FrmShootTL.Top;
         FrmFalli.Left := FrmOppoTeam.Left - FrmFalli.Width - 6;
         FrmFalli.Top  := FrmOppoTeam.Top + FrmOppoTeam.Height + FrmFalli.Height;

         BtnSost.Left := FrmAssist.Left;
         BtnSost.Top  := FrmRimba.Top;//FrmAssist.Top+FrmAssist.Height+6;
         BtnUndo.Left := FrmAssist.Left+FrmAssist.Width-BtnUndo.Width;
         BtnUndo.Top  := BtnSost.Top;
         BtnCheckPoint.Left   := FrmAssist.Left;
         BtnCheckPoint.Top    := BtnSost.Top+Btnsost.Height+6;
         BtnCheckPoint.Height := FrmRimba.Top+FrmRimba.Height-BtnCheckPoint.Top;

         BtnOppoRimbAtt.Left := FrmOppoTeam.Left;
         BtnOppoRimbAtt.Top := FrmOppoTeam.Top+FrmOppoTeam.Height+3;
         //
         MnuPartita.Enabled := True;
         //
         LabExcelFName.Caption := CreateExcelFileName();
         UpdateDiff;
         //
         Xxx := RecentMatches.IndexOf (aMatch.RecID.ToString());
         if (Xxx < 0) then
            RecentMatches.Insert (0, aMatch.RecID.ToString())
         else if (Xxx > 0) then
         begin
            while (Xxx > 0) do
            begin
               RecentMatches.Exchange (Xxx, Xxx-1);
               Dec (Xxx);
            end;
         end;
         RecentMatches.SaveToFile (RecentFName);
         ShowRecent;
         aMatch.SaveToDB (True);
         ResizeInterface;
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Info, 'Match open: %s', [aMatch.Title]);
         OnOperationListChanged;
         UpdateParzialiProgressivi;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMainWind.OpenMatch(%d)] Exception "%s"', [aID, E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMainWind.OpenMatch', []);
   end;
end;


procedure TMainWind.CloseMatch (var  aMatch   :TCurrMatch;
                                SaveData :Boolean);
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMainWind.CloseMatch (%s)', [BoolToStr(SaveData)]);
   try
      try
         if (aMatch.MatchOpen) then
         begin
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Info, 'Closing match %s', [aMatch.Title]);
            aMatch.MatchOpen := False;
            if (SaveData) then
            begin
               //if (OpList.Modified) then
               //   OpList.Save (True);
               aMatch.SaveToDB (True);
            end;
         end;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMainWind.CloseMatch] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMainWind.CloseMatch', []);
   end;
end;


function TMainWind.GetCurrMyTeamScore: LongInt;
begin
   Result := FrmMyTeam.TeamData.Punti;
end;


function TMainWind.GetCurrOppTeamScore: LongInt;
begin
   Result := FrmOppoTeam.TeamData.Punti;
end;


function TMainWind.GetCurrQuarter: Longint;
begin
   Result := 0;
   if (Assigned (FrmTime)) then
      Result := FrmTime.CurrentQuarter;
end;


function TMainWind.GetCurrTime: LongInt;
begin
   Result := FrmTime.CurrentTime;
end;


function TMainWind.GetQuarterPlayed: LongInt;
var
   xxx   :LongInt;
begin
   Result := 0;
   for Xxx:=1 to MaxQuarters do
   begin
      if (CurrMatch.MyTeam.Quarto[Xxx-1].Status <> qsNotPlayed) then
         Inc (Result);
   end;
end;


function TMainWind.GetTimeInSec: LongInt;
begin
   Result := FrmTime.CurrentTime;
end;


function TMainWind.GetTimeStr (aTimeInSec :LongInt) :string;
var
   Nn :LongInt;
   Ss :LongInt;
begin
   if (aTimeInSec > 0) then
   begin
      Nn := aTimeInSec Div 60;
      Ss := aTimeInSec Mod 60;
      Result := Format('Q%d|%0.2d:%0.2d', [FrmTime.CurrentQuarter, Nn, Ss]);
   end
   else
      Result := Format('Q%d|%s', [FrmTime.CurrentQuarter, FrmTime.CurrentTimeStr(True)]);
end;


procedure TMainWind.GrdRecentDBCardView1DblClick(Sender: TObject);
begin
   HideInterface;
   try
      SelectRecent;
   finally
      ShowInterface;
   end;
end;


procedure TMainWind.HideInterface;
begin
   try
      PgCtrlMain.Visible := False;
      Refresh;
   except
   end;
end;


procedure TMainWind.ShowInterface;
begin
   try
      PgCtrlMain.Visible := True;
      Refresh;
   except
   end;
end;


procedure TMainWind.AddOperation (aQrt       :Longint;
                                  aTime      :Longint;
                                  aOper      :TOperationType;
                                  aMyTeam    :Boolean;
                                  aPlr1      :TMatchPlayer;
                                  aPlr2      :TMatchPlayer;
                                  aDesc      :String;
                                  aIParam    :Longint;
                                  aDesc2     :String);
begin
   try
      OpList.Add (TOperation.Create (aQrt, aTime, aOper, aMyTeam, aPlr1, aPlr2, aDesc, aIParam, aDesc2));
   except
      on E:Exception do
      begin
         UpdateExceptionCounter;
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMainWind.AddOperation] Exception "%s"', [E.Message]);
      end;
   end;
end;


procedure TMainWind.AddOperation (aOper      :TOperationType;
                                  aMyTeam    :Boolean;
                                  aPlr1      :TMatchPlayer;
                                  aPlr2      :TMatchPlayer;
                                  aDesc      :String;
                                  aIParam    :Longint;
                                  aDesc2     :String);
begin
   try
      OpList.Add (TOperation.Create (aOper, aMyTeam, aPlr1, aPlr2, aDesc, aIParam, aDesc2));
   except
      on E:Exception do
      begin
         UpdateExceptionCounter;
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMainWind.AddOperation] Exception "%s"', [E.Message]);
      end;
   end;
end;


procedure TMainWind.AddCheckPoint;
begin
   try
      AddOperation (TOperation.Create (totCheckPoint, True, nil, nil, 'CheckPoint', 0, ''));
   except
      on E:Exception do
      begin
         UpdateExceptionCounter;
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMainWind.AddCheckPoint] Exception "%s"', [E.Message]);
      end;
   end;
end;


procedure TMainWind.AddOperation(aOper :TOperation);
(*
var
   sss:string;
*)
begin
   try
      OpList.Add (aOper);
      (*
      sss := aOper.tojsonstring;
      if (sss <> '') then
      begin
      end;
      *)
   except
      on E:Exception do
      begin
         UpdateExceptionCounter;
         LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMainWind.AddOperation] Exception "%s"', [E.Message]);
      end;
   end;
end;


procedure TMainWind.IniziaQuarto;
var
   Xxx   :LongInt;
begin
   CurrMatch.MyTeam.Quarto[GetCurrQuarter-1].Status := qsPlaying;
   CurrMatch.OppTeam.Quarto[GetCurrQuarter-1].Status := qsPlaying;
   for Xxx:=0 to Pred(CurrMatch.MyTeam.Roster.Count) do
   begin
      if (CurrMatch.MyTeam.Player(Xxx).InGioco) then
         CurrMatch.MyTeam.Player(Xxx).fPMIn := (CurrMatch.MyTeam.Punti - CurrMatch.OppTeam.Punti);
   end;
   for Xxx:=0 to Pred(CurrMatch.OppTeam.Roster.Count) do
   begin
      if (CurrMatch.OppTeam.Player(Xxx).InGioco) then
         CurrMatch.OppTeam.Player(Xxx).fPMIn := (CurrMatch.OppTeam.Punti - CurrMatch.MyTeam.Punti);
   end;
   if (GetCurrQuarter = 1) then
      CurrMatch.MatchStatus := msPlaying;
end;


procedure TMainWind.ChiudiQuarto;
var
   Xxx   :Longint;
   Plr   :TMatchPlayer;
   Cq    :LongInt;
begin
   Cq := GetCurrQuarter;
   for Xxx:=0 to Pred(CurrMatch.MyTeam.Roster.Count) do
   begin
      Plr := CurrMatch.MyTeam.Player(xxx);
      if (Plr.InGioco) then
      begin
         Plr.OutTime := 0;
         Plr.CurrCronotime := 0;
         Plr.TempoGioco := Plr.TempoGioco + (Plr.InTime-Plr.OutTime);
         Plr.InGioco := False;
         Plr.PlusMinus := Plr.PlusMinus + ((CurrMatch.MyTeam.Punti-CurrMatch.OppTeam.Punti) - Plr.fPMIn);
      end;
      Plr.InTime := 0;
      Plr.OutTime := 0;
   end;
   for Xxx:=0 to Pred(CurrMatch.OppTeam.Roster.Count) do
   begin
      Plr := CurrMatch.OppTeam.Player(xxx);
      if (Plr.InGioco) then
      begin
         Plr.OutTime := 0;
         Plr.CurrCronotime := 0;
         Plr.TempoGioco := Plr.TempoGioco + (Plr.InTime-Plr.OutTime);
         Plr.InGioco := False;
         Plr.PlusMinus := Plr.PlusMinus + ((CurrMatch.OppTeam.Punti-CurrMatch.MyTeam.Punti) - Plr.fPMIn);
      end;
      Plr.InTime := 0;
      Plr.OutTime := 0;
   end;
   //
   CurrMatch.MyTeam.Quarto[Cq-1].Status := qsPlayed;
   CurrMatch.OppTeam.Quarto[Cq-1].Status := qsPlayed;
   (*
   if ((Cq > 3) and (CurrMatch.MatchStatus = msPlaying)) then
   begin
      if (YNDlg (Str_ConcludereMatch, []) = mrYes) then
      begin
         CurrMatch.MatchStatus := msTerminated;
      end;
   end;
   *)
   //
   RefreshFrames;
   PlaySound (tseQuarterEnd);
end;


procedure TMainWind.ChkMappaTiroPropertiesEditValueChanged (Sender: TObject);
begin
   CreaExcel;
end;


procedure TMainWind.PgCtrlPartitaPageChanging (Sender: TObject;
                                               NewPage: TcxTabSheet;
                                               var AllowChange: Boolean);
var
   Old :TCursor;
begin
   Old := SetCur(crHourGlass);
   DelayAndProcess(10);
   Refresh;
   try
      //if ((NewPage.TabIndex = 1) and (PrimoGioco)) then
      if (NewPage.TabIndex = 1) then
      begin
         PrimoGioco := False;
         TmrMainRefresh.Enabled := True;
         ResizeInterface;
      end;
      if (NewPage.TabIndex = 2) then
         CreaExcel;
   finally
      SetCur(Old);
   end;
end;


procedure TMainWind.PnlCommandsClick(Sender: TObject);
begin
   if (PnlCommands.Height = 24) then
   begin
      PnlCommands.Height := 150;
      PnlCommands.Caption := Str_PnlComandiDescChiudi
   end
   else
   begin
      PnlCommands.Height := 24;
      PnlCommands.Caption := Str_PnlComandiDescApri;
   end;
end;


procedure TMainWind.RefreshAllFrames;
begin
   RefreshFrames;
   FrmMyTeam.Refresh;
   FrmOppoTeam.Refresh;
end;


procedure TMainWind.RefreshFrames;
var
   Xxx   :LongInt;
begin
   if (not EndShow) then
      Exit;
   for Xxx:=0 to Pred(MaxFieldPlayers) do
   begin
      MyFieldPlayers[Xxx].Update;
      OppoFieldPlayers[Xxx].Update;
   end;
   for Xxx:=0 to Pred(MaxRosterPlayers) do
   begin
      MyRoster[Xxx].Update;
      OppoRoster[Xxx].Update;
   end;
   FrmShootTL.Update;
   FrmShootT2.Update;
   FrmShootT3.Update;
   FrmRimba.Update;
   FrmPalle.Update;
   FrmStopp.Update;
   FrmFalli.Update;
   FrmAssist.Update;
   //
   FrmMyTeam.Update;      // Lasciare in fondo
   FrmOppoTeam.Update;    // Lasciare in fondo
   //
   UpdateDiff;
end;


procedure TMainWind.RefreshMatchInfos (aMatch :TCurrMatch);
var
   Xxx   :Longint;
   Yyy   :Longint;
   Plr   :TMatchPlayer;
begin
//   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMainWind.RefreshMatchInfos ()', []);
   try
      try
         LabMatchDate.Caption := FormatDateTime ('c', aMatch.PlayDate);
         LabMatchLocation.Caption := aMatch.Location;
         LabPlayNumber.Caption := Format (Str_PlayNumber, [aMatch.PlayNumber]);
         LabDay.Caption := Format (Str_MatchDay, [aMatch.Day]);
         LabMatchSeason.Caption := Format (Str_MatchSeason, [aMatch.Season]);
         LabMatchChamp.Caption := Format (Str_MatchChamp, [aMatch.Champ]);
         LabMatchPhase.Caption := Format (Str_MatchPhase, [aMatch.Phase2, aMatch.Phase1]);
         LabMatchReferee1.Caption := aMatch.Referee1;
         LabMatchReferee2.Caption := aMatch.Referee2;
         if (aMatch.Home) then
         begin
            LabMatchTeams.Caption := aMatch.MyTeam.Name + ' - ' + aMatch.OppTeam.Name;
            PnlMatchLeftColor.Style.Color := aMatch.MyTeam.Color;
            PnlMatchRightColor.Style.Color := aMatch.OppTeam.Color;
            ImgMatchLeft.Picture.Bitmap.Assign (aMatch.MyTeam.Logo);
            ImgMatchRight.Picture.Bitmap.Assign (aMatch.OppTeam.Logo);
            LbMatchLeft.Items.Clear;
            for Xxx:=0 to Pred(MaxRosterPlayers) do
            begin
               MyRoster[Xxx].Visible := False;
               OppoRoster[Xxx].Visible := False;
               if (Xxx < MaxFieldPlayers) then
               begin
                  MyFieldPlayers[Xxx].Visible := False;
                  OppoFieldPlayers[Xxx].Visible := False;
               end;
            end;
            for Xxx:=0 to Pred(aMatch.MyTeam.Roster.Count) do
            begin
               Plr := TMatchPlayer(aMatch.MyTeam.Roster.Items[Xxx]);
               LbMatchLeft.Items.Add (Format ('%s)   %s   %s', [Plr.PlayNumber, Plr.Name, IIF (Plr.Captain, '©', '')]));
               MyRoster[Xxx].Visible := True;
               MyRoster[Xxx].PlayerData := Plr;
               if (aMatch.MyTeam.Color <> clNone) then
                  MyRoster[xxx].BorderColor := aMatch.MyTeam.Color;
               if (Xxx < MaxFieldPlayers) then
               begin
                  MyFieldPlayers[Xxx].Visible := True;
                  MyFieldPlayers[Xxx].PlayerData := Plr;
                  if (aMatch.MyTeam.Color <> clNone) then
                     MyFieldPlayers[Xxx].BorderColor := aMatch.MyTeam.Color;
               end;
            end;
            Yyy := 0;
            for Xxx:=0 to Pred(aMatch.MyTeam.Roster.Count) do
            begin
               Plr := TMatchPlayer(aMatch.MyTeam.Roster.Items[Xxx]);
               if ((Plr.InGioco) and (Yyy < 5)) then
               begin
                  MyFieldPlayers[Yyy].PlayerData := Plr;
                  Inc (Yyy);
               end;
            end;
            LbMatchRight.Items.Clear;
            for Xxx:=0 to Pred(aMatch.OppTeam.Roster.Count) do
            begin
               Plr := TMatchPlayer(aMatch.OppTeam.Roster.Items[Xxx]);
               LbMatchRight.Items.Add (Format ('%s)   %s   %s', [Plr.PlayNumber, Plr.Name, IIF (Plr.Captain, '©', '')]));
               OppoRoster[Xxx].Visible := True;
               OppoRoster[Xxx].PlayerData := Plr;
               if (aMatch.OppTeam.Color <> clNone) then
                  OppoRoster[xxx].BorderColor := aMatch.OppTeam.Color;
               if (Xxx < MaxFieldPlayers) then
               begin
                  OppoFieldPlayers[Xxx].Visible := True;
                  OppoFieldPlayers[Xxx].PlayerData := Plr;
                  if (aMatch.OppTeam.Color <> clNone) then
                     OppoFieldPlayers[Xxx].BorderColor := aMatch.OppTeam.Color;
               end;
            end;
            Yyy := 0;
            for Xxx:=0 to Pred(aMatch.OppTeam.Roster.Count) do
            begin
               Plr := TMatchPlayer(aMatch.OppTeam.Roster.Items[Xxx]);
               if ((Plr.InGioco) and (Yyy < 5)) then
               begin
                  OppoFieldPlayers[Yyy].PlayerData := Plr;
                  Inc (Yyy);
               end;
            end;
            LabHeadCoachLeft.Caption := Format (Str_HeadCoach, [aMatch.MyTeam.HeadCoach]);
            if (Trim (aMatch.MyTeam.Assistent1) = '') then
               LabAssistantLeft.Caption := ''
            else
               LabAssistantLeft.Caption := Format (Str_Assistant, [aMatch.MyTeam.Assistent1]);
            LabHeadCoachRight.Caption := Format (Str_HeadCoach, [aMatch.OppTeam.HeadCoach]);
            if (Trim (aMatch.OppTeam.Assistent1) = '') then
               LabAssistantRight.Caption := ''
            else
               LabAssistantRight.Caption := Format (Str_Assistant, [aMatch.OppTeam.Assistent1]);
            SpinDeltaLeft.Value := aMatch.MyTeam.DeltaRes;
            SpinDeltaRight.Value := aMatch.OppTeam.DeltaRes;
         end
         else
         begin
            LabMatchTeams.Caption := aMatch.OppTeam.Name + ' - ' + aMatch.MyTeam.Name;
            PnlMatchLeftColor.Style.Color := aMatch.OppTeam.Color;
            PnlMatchRightColor.Style.Color := aMatch.MyTeam.Color;
            ImgMatchLeft.Picture.Bitmap.Assign (aMatch.OppTeam.Logo);
            ImgMatchRight.Picture.Bitmap.Assign (aMatch.MyTeam.Logo);
            LbMatchLeft.Items.Clear;
            for Xxx:=0 to Pred(MaxRosterPlayers) do
            begin
               MyRoster[Xxx].Visible := False;
               OppoRoster[Xxx].Visible := False;
            end;
            for Xxx:=0 to Pred(aMatch.OppTeam.Roster.Count) do
            begin
               Plr := TMatchPlayer(aMatch.OppTeam.Roster.Items[Xxx]);
               LbMatchLeft.Items.Add (Format ('%s)   %s   %s', [Plr.PlayNumber, Plr.Name, IIF (Plr.Captain, '©', '')]));
               OppoRoster[Xxx].Visible := True;
               OppoRoster[Xxx].PlayerData := Plr;
               if (aMatch.OppTeam.Color <> clNone) then
                  OppoRoster[xxx].BorderColor := aMatch.OppTeam.Color;
               if (Xxx < MaxFieldPlayers) then
               begin
                  OppoFieldPlayers[Xxx].Visible := True;
                  OppoFieldPlayers[Xxx].PlayerData := Plr;
                  if (aMatch.OppTeam.Color <> clNone) then
                     OppoFieldPlayers[Xxx].BorderColor := aMatch.OppTeam.Color;
               end;
            end;
            Yyy := 0;
            for Xxx:=0 to Pred(aMatch.OppTeam.Roster.Count) do
            begin
               Plr := TMatchPlayer(aMatch.OppTeam.Roster.Items[Xxx]);
               if ((Plr.InGioco) and (Yyy < 5)) then
               begin
                  OppoFieldPlayers[Yyy].PlayerData := Plr;
                  Inc (Yyy);
               end;
            end;
            LbMatchRight.Items.Clear;
            for Xxx:=0 to Pred(aMatch.MyTeam.Roster.Count) do
            begin
               Plr := TMatchPlayer(aMatch.MyTeam.Roster.Items[Xxx]);
               LbMatchRight.Items.Add (Format ('%s)   %s   %s', [Plr.PlayNumber, Plr.Name, IIF (Plr.Captain, '©', '')]));
               MyRoster[Xxx].Visible := True;
               MyRoster[Xxx].PlayerData := Plr;
               if (aMatch.MyTeam.Color <> clNone) then
                  MyRoster[xxx].BorderColor := aMatch.MyTeam.Color;
               if (Xxx < MaxFieldPlayers) then
               begin
                  MyFieldPlayers[Xxx].Visible := True;
                  MyFieldPlayers[Xxx].PlayerData := Plr;
                  if (aMatch.MyTeam.Color <> clNone) then
                     MyFieldPlayers[Xxx].BorderColor := aMatch.MyTeam.Color;
               end;
            end;
            Yyy := 0;
            for Xxx:=0 to Pred(aMatch.MyTeam.Roster.Count) do
            begin
               Plr := TMatchPlayer(aMatch.MyTeam.Roster.Items[Xxx]);
               if ((Plr.InGioco) and (Yyy < 5)) then
               begin
                  MyFieldPlayers[Yyy].PlayerData := Plr;
                  Inc (Yyy);
               end;
            end;
            LabHeadCoachRight.Caption := Format (Str_HeadCoach, [aMatch.MyTeam.HeadCoach]);
            if (Trim (aMatch.MyTeam.Assistent1) = '') then
               LabAssistantRight.Caption := ''
            else
               LabAssistantRight.Caption := Format (Str_Assistant, [aMatch.MyTeam.Assistent1]);
            LabHeadCoachLeft.Caption := Format (Str_HeadCoach, [aMatch.OppTeam.HeadCoach]);
            if (Trim (aMatch.OppTeam.Assistent1) = '') then
               LabAssistantLeft.Caption := ''
            else
               LabAssistantLeft.Caption := Format (Str_Assistant, [aMatch.OppTeam.Assistent1]);
            SpinDeltaLeft.Value := aMatch.OppTeam.DeltaRes;
            SpinDeltaRight.Value := aMatch.MyTeam.DeltaRes;
         end;
         FrmMyTeam.Update;
         FrmOppoTeam.Update;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMainWind.RefreshMatchInfos] Exception "%s"', [E.Message]);
         end;
      end;
   finally
//      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMainWind.RefreshMatchInfos', []);
   end;
end;


procedure TMainWind.ResizeInterface;
var
   Xxx         :Longint;
   Yyy         :Longint;
   Y           :LongInt;
   HRost       :LongInt;
   HorDir      :Boolean;
   ShOppo      :Boolean;
   TotFrm      :Longint;
   MaxPlayers  :Longint;
   TotRighe    :Longint;
   MTTotRiga   :Array of Longint;
   OTTotRiga   :Array of Longint;
   YRiga       :Array of Longint;
   FrmRosterW  :Longint;
   FrmRosterH  :Longint;
   Idx         :Longint;
   PanelLeft   :Longint;
   PanelRight  :Longint;
begin
   if (BSDECfg.RosterHorizontalDir <> nil) then
      HorDir := BSDECfg.RosterHorizontalDir.ValueAsBool
   else
      HorDir := False;
   if (BSDECfg.ShowOpponentFive <> nil) then
      ShOppo := BSDECfg.ShowOpponentFive.ValueAsBool
   else
      ShOppo := False;
   FrmMyTeam.Left := 1;
   FrmMyTeam.Top := 1;
   //
   FrmOppoTeam.Left := TabGioco.Width-FrmOppoTeam.width-1;
   FrmOppoTeam.Top := 1;
   //
   FrmTime.Left := (TabGioco.Width div 2) - (FrmTime.Width Div 2);
   FrmTime.Top := 1;
   //
   if (EndShow) then   // Se è completamente finito l'evento di Mainwind.Show
   begin
      MaxPlayers := 0;
      HRost := MyRoster[0].Height;
      FrmRosterW := MyRoster[0].Width;
      FrmRosterH := MyRoster[0].Height;
      if (CurrMatch.MyTeam.Roster.Count > MaxPlayers) then
         MaxPlayers := CurrMatch.MyTeam.Roster.Count;
      if (CurrMatch.OppTeam.Roster.Count > MaxPlayers) then
         MaxPlayers := CurrMatch.OppTeam.Roster.Count;
      if (MaxPlayers <= 6) then
      begin
         TotRighe := 1;
         SetLength (MTTotRiga, 3);
         SetLength (OTTotRiga, 3);
         SetLength (YRiga, 3);
         MTTotRiga[0] := CurrMatch.MyTeam.Roster.Count;
         MTTotRiga[1] := 0;
         MTTotRiga[2] := 0;
         OTTotRiga[0] := CurrMatch.OppTeam.Roster.Count;
         OTTotRiga[1] := 0;
         OTTotRiga[2] := 0;
         YRiga[0] := TabGioco.ClientHeight - HRost;
         YRiga[1] := 10000;
         YRiga[2] := 10000;
      end
      else if (MaxPlayers <= 12) then
      begin
         TotRighe := 2;
         SetLength (MTTotRiga, 3);
         SetLength (OTTotRiga, 3);
         SetLength (YRiga, 3);
         if (CurrMatch.MyTeam.Roster.Count <= 6) then
         begin
            MTTotRiga[0] := CurrMatch.MyTeam.Roster.Count;
            MTTotRiga[1] := 0;
            MTTotRiga[2] := 0;
         end
         else
         begin
            MTTotRiga[0] := 6;
            MTTotRiga[1] := CurrMatch.MyTeam.Roster.Count - 6;
            MTTotRiga[2] := 0;
         end;
         if (CurrMatch.OppTeam.Roster.Count <= 6) then
         begin
            OTTotRiga[0] := CurrMatch.OppTeam.Roster.Count;
            OTTotRiga[1] := 0;
            OTTotRiga[2] := 0;
         end
         else
         begin
            OTTotRiga[0] := 6;
            OTTotRiga[1] := CurrMatch.OppTeam.Roster.Count - 6;
            OTTotRiga[2] := 0;
         end;
         YRiga[0] := TabGioco.ClientHeight - (2*HRost);
         YRiga[1] := TabGioco.ClientHeight - (1*HRost);
         YRiga[2] := 10000;
      end
      else
      begin
         TotRighe := 3;
         SetLength (MTTotRiga, 3);
         SetLength (OTTotRiga, 3);
         SetLength (YRiga, 3);
         if (CurrMatch.MyTeam.Roster.Count <= 6) then
         begin
            MTTotRiga[0] := CurrMatch.MyTeam.Roster.Count;
            MTTotRiga[1] := 0;
            MTTotRiga[2] := 0;
         end
         else if (CurrMatch.MyTeam.Roster.Count <= 12) then
         begin
            MTTotRiga[0] := 6;
            MTTotRiga[1] := CurrMatch.MyTeam.Roster.Count - 6;
            MTTotRiga[2] := 0;
         end
         else
         begin
            MTTotRiga[0] := 6;
            MTTotRiga[1] := 6;
            MTTotRiga[2] := CurrMatch.MyTeam.Roster.Count - 12;
         end;
         //
         if (CurrMatch.OppTeam.Roster.Count <= 6) then
         begin
            OTTotRiga[0] := CurrMatch.OppTeam.Roster.Count;
            OTTotRiga[1] := 0;
            OTTotRiga[2] := 0;
         end
         else if (CurrMatch.OppTeam.Roster.Count <= 12) then
         begin
            OTTotRiga[0] := 6;
            OTTotRiga[1] := CurrMatch.OppTeam.Roster.Count - 6;
            OTTotRiga[2] := 0;
         end
         else
         begin
            OTTotRiga[0] := 6;
            OTTotRiga[1] := 6;
            OTTotRiga[2] := CurrMatch.OppTeam.Roster.Count - 12;
         end;
         //
         YRiga[0] := TabGioco.ClientHeight - (3*HRost);
         YRiga[1] := TabGioco.ClientHeight - (2*HRost);
         YRiga[2] := TabGioco.ClientHeight - (1*HRost);
      end;

      // Disegno i frame dei giocatori IN CAMPO
      HRost := MyRoster[0].Height;
      Y := FrmMyTeam.Top+FrmMyTeam.Height+1;
      for Xxx:=0 to Pred(MaxFieldPlayers) do
      begin
         MyFieldPlayers[Xxx].Left := 1;
         MyFieldPlayers[Xxx].Top := Y + ((Xxx)*MyFieldPlayers[Xxx].Height);
         //
         OppoFieldPlayers[Xxx].Left := TabGioco.Width-OppoFieldPlayers[Xxx].Width-1;
         OppoFieldPlayers[Xxx].Top := Y + ((Xxx)*OppoFieldPlayers[Xxx].Height);
         OppoFieldPlayers[Xxx].Visible := ShOppo;
      end;
      // Disegno i frame dei giocatori del ROSTER
      if (TotRighe = 1) then
      begin
         for Xxx:=0 to Pred(CurrMatch.MyTeam.Roster.Count) do
         begin
            Idx := Xxx;
            MyRoster[Idx].Left := 1 + (Idx*FrmRosterW);
            MyRoster[Idx].Top := YRiga[0];
         end;
         for Xxx:=0 to Pred(CurrMatch.OppTeam.Roster.Count) do
         begin
            Idx := CurrMatch.OppTeam.Roster.Count-Xxx;
            OppoRoster[Idx].Left := TabGioco.Width - (FrmRosterW*(OTTotRiga[Yyy]-Xxx+1)) -1;
            OppoRoster[Idx].Top := YRiga[0];
         end;
      end;
      if (TotRighe = 2) then
      begin
         for Yyy:=0 to 1 do
         begin
            for Xxx:=0 to Pred(MTTotRiga[Yyy]) do
            begin
               Idx := Xxx+(6*Yyy);
               MyRoster[Idx].Left := 1 + (Xxx*FrmRosterW);
               MyRoster[Idx].Top := YRiga[Yyy];
            end;
         end;
         for Yyy:=0 to 1 do
         begin
            for Xxx:=0 to Pred(OTTotRiga[Yyy]) do
            begin
               Idx := Xxx+(6*Yyy);
               OppoRoster[Idx].Left := TabGioco.Width - (FrmRosterW*(OTTotRiga[Yyy]-Xxx+1)) -1;
               OppoRoster[Idx].Top := YRiga[Yyy];
            end;
         end;
      end;
      if (TotRighe = 3) then
      begin
         for Yyy:=0 to 2 do
         begin
            for Xxx:=0 to Pred(MTTotRiga[Yyy]) do
            begin
               Idx := Xxx+(6*Yyy);
               MyRoster[Idx].Left := 1 + (Xxx*FrmRosterW);
               MyRoster[Idx].Top := YRiga[Yyy];
            end;
         end;
         for Yyy:=0 to 2 do
         begin
            for Xxx:=0 to Pred(OTTotRiga[Yyy]) do
            begin
               Idx := Xxx+(6*Yyy);
               OppoRoster[Idx].Left := TabGioco.Width - (FrmRosterW*(OTTotRiga[Yyy]-Xxx+1)) -1;
               OppoRoster[Idx].Top := YRiga[Yyy];
            end;
         end;
      end;
      PanelLeft := MyRoster[5].Left + FrmRosterW;
      PanelRight := OppoRoster[0].Left;

      (*
      //
      Y := MyFieldPlayers[MaxFieldPlayers-1].Top + MyFieldPlayers[MaxFieldPlayers-1].Height;
      Y := TabGioco.ClientHeight - 2*HRost;
      TotFrm := 6;
      for Xxx:=0 to TotFrm do
      begin
         if (HorDir) then
         begin
            MyRoster[Xxx].Left := 1 + ((Xxx)*MyRoster[Xxx].Width);
            MyRoster[Xxx].Top := Y;
            MyRoster[Xxx+(TotFrm+1)].Left := 1 + ((Xxx)*MyRoster[Xxx].Width);
            MyRoster[Xxx+(TotFrm+1)].Top := Y + HRost;
         end
         else
         begin
            MyRoster[Xxx*2].Left := 1 + ((Xxx)*MyRoster[0].Width);
            MyRoster[Xxx*2].Top := Y;
            MyRoster[(Xxx*2)+1].Left := 1 + ((Xxx)*MyRoster[0].Width);
            MyRoster[(Xxx*2)+1].Top := Y + HRost;
         end;
      end;
      for Xxx:=TotFrm downto 0 do
      begin
         if (HorDir) then
         begin
            OppoRoster[TotFrm-Xxx].Left := TabGioco.Width - (OppoRoster[0].Width*(Xxx+1)) -1;
            OppoRoster[TotFrm-Xxx].Top := Y;
            OppoRoster[TotFrm-Xxx+(TotFrm+1)].Left := TabGioco.Width - (OppoRoster[0].Width*(Xxx+1)) -1;
            OppoRoster[TotFrm-Xxx+(TotFrm+1)].Top := Y + HRost;
         end
         else
         begin
            OppoRoster[(TotFrm-Xxx)*2].Left := TabGioco.Width - (OppoRoster[0].Width*(Xxx+1)) -1;
            OppoRoster[(TotFrm-Xxx)*2].Top := Y;
            OppoRoster[((TotFrm-Xxx)*2)+1].Left := TabGioco.Width - (OppoRoster[0].Width*(Xxx+1)) -1;
            OppoRoster[((TotFrm-Xxx)*2)+1].Top := Y + HRost;
         end;
      end;
      *)
      // Disegno il pannello eventi
      MemoOp.Visible := (Width > 1100);
      if (MemoOp.Visible) then
      begin
         MemoOp.Left := PanelLeft + 3;
         MemoOp.Width := PanelRight-PanelLeft - 3;
         MemoOp.Top := FrmStopp.Top + FrmStopp.Height + 3;
         MemoOp.Height := TabGioco.ClientHeight - MemoOp.Top - 3;
         MemoOp.InnerControl.Perform (EM_LINESCROLL, 0,  MemoOp.Lines.Count);
      end;
   end;

   BtnOppoRimbAtt.Left := FrmOppoTeam.Left;
   BtnOppoRimbAtt.Top := FrmOppoTeam.Top+FrmOppoTeam.Height+3;

   SetLength (MTTotRiga, 0);
   SetLength (OTTotRiga, 0);
   SetLength (YRiga, 0);

end;


procedure TMainWind.Excel_Intestazioni(aView: TdxSpreadSheetTableView);
var
   Cell        :TdxSpreadSheetCell;
   Sss         :string;
   S1          :string;
   S2          :string;
   Xxx         :LongInt;
   Yyy         :LongInt;
   Rrr         :Longint;
   Num         :Longint;
   Clr         :TColor;

   procedure AltRiga (aRrr :LongInt;
                      aAlt :LongInt);
   begin
      if (aView.Rows[aRrr] = nil) then
         aView.CreateCell (aRrr, 0);
      aView.Rows[aRrr].Size := aAlt;
   end;
begin
   // Intestazioni delle colonne
   aView.CreateCell (ExcelInfos.MyTeamFirstRow,  0).SetText (Str_Giocatore);
   aView.CreateCell (ExcelInfos.MyTeamFirstRow,  2).SetText (Str_Min);
   aView.CreateCell (ExcelInfos.MyTeamFirstRow,  1).SetText (Str_Punti);
   aView.CreateCell (ExcelInfos.MyTeamFirstRow,  3).SetText (Str_TL);
   aView.CreateCell (ExcelInfos.MyTeamFirstRow,  4).SetText (Str_T2);
   aView.CreateCell (ExcelInfos.MyTeamFirstRow,  5).SetText (Str_T3);
   aView.CreateCell (ExcelInfos.MyTeamFirstRow,  6).SetText (Str_Tdc);
   aView.CreateCell (ExcelInfos.MyTeamFirstRow,  7).SetText (Str_FalliFatti);
   aView.CreateCell (ExcelInfos.MyTeamFirstRow,  8).SetText (Str_FalliSubiti);
   aView.CreateCell (ExcelInfos.MyTeamFirstRow,  9).SetText (Str_RimbDifesa);
   aView.CreateCell (ExcelInfos.MyTeamFirstRow, 10).SetText (Str_RimbAttacco);
   aView.CreateCell (ExcelInfos.MyTeamFirstRow, 11).SetText (Str_RimbTot);
   aView.CreateCell (ExcelInfos.MyTeamFirstRow, 12).SetText (Str_PallePerse);
   aView.CreateCell (ExcelInfos.MyTeamFirstRow, 13).SetText (Str_PalleRecuperate);
   aView.CreateCell (ExcelInfos.MyTeamFirstRow, 14).SetText (Str_Assist);
   aView.CreateCell (ExcelInfos.MyTeamFirstRow, 15).SetText (Str_StopFatte);
   aView.CreateCell (ExcelInfos.MyTeamFirstRow, 16).SetText (Str_StopSubite);
   if (BSDECfg.Excel_PIR.ValueAsBool) then
      aView.CreateCell (ExcelInfos.MyTeamFirstRow, ExcelInfos.PIRCol).SetText (Str_PIR);
   if (BSDECfg.Excel_OER.ValueAsBool) then
      aView.CreateCell (ExcelInfos.MyTeamFirstRow, ExcelInfos.OERCol).SetText (Str_OER);
   if (BSDECfg.Excel_VIR.ValueAsBool) then
      aView.CreateCell (ExcelInfos.MyTeamFirstRow, ExcelInfos.VIRCol).SetText (Str_VIR);
   if (BSDECfg.Excel_PlusMinus.ValueAsBool) then
      aView.CreateCell (ExcelInfos.MyTeamFirstRow, ExcelInfos.PlusMinusCol).SetText (Str_PlusMinus);
   aView.CreateCell (ExcelInfos.MyTeamFirstRow, ExcelInfos.PtQrtCol+0).SetText ('Q1');
   aView.CreateCell (ExcelInfos.MyTeamFirstRow, ExcelInfos.PtQrtCol+1).SetText ('Q2');
   aView.CreateCell (ExcelInfos.MyTeamFirstRow, ExcelInfos.PtQrtCol+2).SetText ('Q3');
   aView.CreateCell (ExcelInfos.MyTeamFirstRow, ExcelInfos.PtQrtCol+3).SetText ('Q4');
   aView.CreateCell (ExcelInfos.MyTeamFirstRow, ExcelInfos.PtQrtCol+4).SetText ('ET');
   // Allineamento delle intestazioni
   aView.CreateCell (ExcelInfos.MyTeamFirstRow,  0).Style.AlignHorz := ssahLeft;
   aView.CreateCell (ExcelInfos.MyTeamFirstRow,  2).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.MyTeamFirstRow,  1).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.MyTeamFirstRow,  3).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.MyTeamFirstRow,  4).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.MyTeamFirstRow,  5).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.MyTeamFirstRow,  6).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.MyTeamFirstRow,  7).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.MyTeamFirstRow,  8).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.MyTeamFirstRow,  9).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.MyTeamFirstRow, 10).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.MyTeamFirstRow, 11).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.MyTeamFirstRow, 12).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.MyTeamFirstRow, 13).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.MyTeamFirstRow, 14).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.MyTeamFirstRow, 15).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.MyTeamFirstRow, 16).Style.AlignHorz := ssahCenter;
   if (BSDECfg.Excel_PIR.ValueAsBool) then
      aView.CreateCell (ExcelInfos.MyTeamFirstRow, ExcelInfos.PIRCol).Style.AlignHorz := ssahCenter;
   if (BSDECfg.Excel_OER.ValueAsBool) then
      aView.CreateCell (ExcelInfos.MyTeamFirstRow, ExcelInfos.OERCol).Style.AlignHorz := ssahCenter;
   if (BSDECfg.Excel_VIR.ValueAsBool) then
      aView.CreateCell (ExcelInfos.MyTeamFirstRow, ExcelInfos.VIRCol).Style.AlignHorz := ssahCenter;
   if (BSDECfg.Excel_PlusMinus.ValueAsBool) then
      aView.CreateCell (ExcelInfos.MyTeamFirstRow, ExcelInfos.PlusMinusCol).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.MyTeamFirstRow, ExcelInfos.PtQrtCol+0).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.MyTeamFirstRow, ExcelInfos.PtQrtCol+1).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.MyTeamFirstRow, ExcelInfos.PtQrtCol+2).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.MyTeamFirstRow, ExcelInfos.PtQrtCol+3).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.MyTeamFirstRow, ExcelInfos.PtQrtCol+4).Style.AlignHorz := ssahCenter;
   // Larghezze delle colonne
   aView.Columns[ 0].Size := ColPlr_Sz; // player
   aView.Columns[ 2].Size := ColTim_Sz; // time
   aView.Columns[ 1].Size := ColPti_Sz; // punti
   aView.Columns[ 3].Size := ColTL_Sz; // tl
   aView.Columns[ 4].Size := ColT2_Sz; // t2
   aView.Columns[ 5].Size := ColT3_Sz; // t3
   aView.Columns[ 6].Size := ColTdx_Sz; // tdc
   aView.Columns[ 7].Size := ColFF_Sz; // ff
   aView.Columns[ 8].Size := ColFS_Sz; // fs
   aView.Columns[ 9].Size := ColRAt_Sz; // rd
   aView.Columns[10].Size := ColRDi_Sz; // ra
   aView.Columns[11].Size := ColRTo_Sz; // rt
   aView.Columns[12].Size := ColPPe_Sz; // pp
   aView.Columns[13].Size := ColPRe_Sz; // pr
   aView.Columns[14].Size := ColAss_Sz; // ass
   aView.Columns[15].Size := ColSFa_Sz; // st fat
   aView.Columns[16].Size := ColSSu_Sz; // st sub
   if (BSDECfg.Excel_PIR.ValueAsBool) then
      aView.Columns[ExcelInfos.PIRCol].Size := ColPir_Sz;
   if (BSDECfg.Excel_OER.ValueAsBool) then
      aView.Columns[ExcelInfos.OERCol].Size := ColOer_Sz;
   if (BSDECfg.Excel_VIR.ValueAsBool) then
      aView.Columns[ExcelInfos.VIRCol].Size := ColVir_Sz;
   if (BSDECfg.Excel_PlusMinus.ValueAsBool) then
      aView.Columns[ExcelInfos.PlusMinusCol].Size := ColPM_Sz;
   aView.Columns[ExcelInfos.PtQrtCol+0].Size := ColPQ1_Sz;
   aView.Columns[ExcelInfos.PtQrtCol+1].Size := ColPQ2_Sz;
   aView.Columns[ExcelInfos.PtQrtCol+2].Size := ColPQ3_Sz;
   aView.Columns[ExcelInfos.PtQrtCol+3].Size := ColPQ4_Sz;
   aView.Columns[ExcelInfos.PtQrtCol+4].Size := ColPEt_Sz;
   // Colore di sfondo delle celle con i titoli delle colonne
   for Xxx:=0 to (ExcelInfos.TotCols-1) do
   begin
      Cell := aView.CreateCell (ExcelInfos.MyTeamFirstRow, Xxx);
       Cell.Style.Brush.BackgroundColor := BSDECfg.ExcelColor_BckCols.ValueAsInteger;
       Cell.Style.Brush.Style := sscfsSolid;
       Cell.Style.Font.Style := [fsBold, fsItalic];
       Cell.Style.Font.Size := 12;
       Cell.Style.Font.Color := BSDECfg.ExcelColor_TxtCols.ValueAsInteger;
       Cell.Style.AlignVert := ssavCenter;
   end;
   // Fondo giocatori MyTeam
   if (BSDECfg.Excel_Bck3Rows.ValueAsBool) then
   begin
      for Yyy:=0 to Pred(CurrMatch.MyTeam.Roster.Count) do
      begin
         case (Yyy mod 3) of
            1:    Clr := BSDECfg.ExcelColor_BckRow2.ValueAsInteger;
            2:    Clr := BSDECfg.ExcelColor_BckRow3.ValueAsInteger;
            else  Clr := BSDECfg.ExcelColor_BckRow1.ValueAsInteger;
         end;
         for Xxx:=0 to (ExcelInfos.TotCols-1) do
         begin
            Cell := aView.CreateCell (ExcelInfos.MyTeamFirstRow+1+Yyy, Xxx);
             Cell.Style.Brush.BackgroundColor := Clr;
             Cell.Style.Brush.Style := sscfsSolid;
             Cell.Style.Font.Style := [];
             Cell.Style.Font.Size := 8;
             Cell.Style.Font.Color := clBlack;
             Cell.Style.AlignVert := ssavCenter;
         end;
         // Allineamento delle celle dati
         Rrr := ExcelInfos.MyTeamFirstRow+Yyy+1;
         aView.CreateCell (Rrr,  0).Style.AlignHorz := ssahLeft;
         aView.CreateCell (Rrr,  2).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  1).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  3).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  4).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  5).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  6).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  7).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  8).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  9).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 10).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 11).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 12).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 13).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 14).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 15).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 16).Style.AlignHorz := ssahCenter;
         if (BSDECfg.Excel_PIR.ValueAsBool) then
            aView.CreateCell (Rrr, ExcelInfos.PIRCol).Style.AlignHorz := ssahCenter;
         if (BSDECfg.Excel_OER.ValueAsBool) then
            aView.CreateCell (Rrr, ExcelInfos.OERCol).Style.AlignHorz := ssahCenter;
         if (BSDECfg.Excel_VIR.ValueAsBool) then
            aView.CreateCell (Rrr, ExcelInfos.VIRCol).Style.AlignHorz := ssahCenter;
         if (BSDECfg.Excel_PlusMinus.ValueAsBool) then
            aView.CreateCell (Rrr, ExcelInfos.PlusMinusCol).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+0).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+1).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+2).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+3).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+4).Style.AlignHorz := ssahCenter;
      end;
   end
   else
   begin
      for Yyy:=0 to Pred(CurrMatch.MyTeam.Roster.Count) do
      begin
         case (Yyy mod 2) of
            1:    Clr := BSDECfg.ExcelColor_BckRow2.ValueAsInteger;
            else  Clr := BSDECfg.ExcelColor_BckRow1.ValueAsInteger;
         end;
         for Xxx:=0 to (ExcelInfos.TotCols-1) do
         begin
            Cell := aView.CreateCell (ExcelInfos.MyTeamFirstRow+1+Yyy, Xxx);
             Cell.Style.Brush.BackgroundColor := Clr;
             Cell.Style.Brush.Style := sscfsSolid;
             Cell.Style.Font.Style := [];
             Cell.Style.Font.Size := 8;
             Cell.Style.Font.Color := clBlack;
             Cell.Style.AlignVert := ssavCenter;
         end;
         // Allineamento delle celle dati
         Rrr := ExcelInfos.MyTeamFirstRow+Yyy+1;
         aView.CreateCell (Rrr,  0).Style.AlignHorz := ssahLeft;
         aView.CreateCell (Rrr,  2).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  1).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  3).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  4).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  5).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  6).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  7).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  8).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  9).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 10).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 11).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 12).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 13).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 14).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 15).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 16).Style.AlignHorz := ssahCenter;
         if (BSDECfg.Excel_PIR.ValueAsBool) then
            aView.CreateCell (Rrr, ExcelInfos.PIRCol).Style.AlignHorz := ssahCenter;
         if (BSDECfg.Excel_OER.ValueAsBool) then
            aView.CreateCell (Rrr, ExcelInfos.OERCol).Style.AlignHorz := ssahCenter;
         if (BSDECfg.Excel_VIR.ValueAsBool) then
            aView.CreateCell (Rrr, ExcelInfos.VIRCol).Style.AlignHorz := ssahCenter;
         if (BSDECfg.Excel_PlusMinus.ValueAsBool) then
            aView.CreateCell (Rrr, ExcelInfos.PlusMinusCol).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+0).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+1).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+2).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+3).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+4).Style.AlignHorz := ssahCenter;
      end;
   end;
   // Riga totali
   for Xxx:=0 to (ExcelInfos.TotCols-1) do
   begin
      Cell := aView.CreateCell (ExcelInfos.MyTeamFirstRow+1+CurrMatch.MyTeam.Roster.Count, Xxx);
       Cell.Style.Brush.BackgroundColor := BSDECfg.ExcelColor_BckTots.ValueAsInteger;
       Cell.Style.Brush.Style := sscfsSolid;
       Cell.Style.Font.Style := [fsBold];
       Cell.Style.Font.Size := 9;
       Cell.Style.Font.Color := BSDECfg.ExcelColor_TxtTots.ValueAsInteger;
       Cell.Style.AlignVert := ssavCenter;
       Cell.Style.AlignHorz := ssahCenter;
       Cell.Style.WordWrap := True;
   end;
   // Allenatori
   if (CurrMatch.MyTeam.HeadCoach <> '') then
   begin
      if (BSDECfg.Excel_ScriviDescCoach.ValueAsBool) then
         S1 := Str_Allen
      else
         S1 := '';
      Cell := aView.CreateCell (ExcelInfos.MyTeamFirstRow+3+CurrMatch.MyTeam.Roster.Count, 0);
       Cell.Style.Font.Style := [];
       Cell.Style.Font.Size := 10;
       Cell.Style.AlignVert := ssavCenter;
       Cell.SetText (S1+CurrMatch.MyTeam.HeadCoach);
   end;
   if (CurrMatch.MyTeam.Assistent1 <> '') then
   begin
      if (BSDECfg.Excel_ScriviDescCoach.ValueAsBool) then
         S2 := Str_Allen
      else
         S2 := '';
      Cell := aView.CreateCell (ExcelInfos.MyTeamFirstRow+4+CurrMatch.MyTeam.Roster.Count, 0);
       Cell.Style.Font.Style := [];
       Cell.Style.Font.Size := 10;
       Cell.Style.AlignVert := ssavCenter;
       Cell.SetText (S2+CurrMatch.MyTeam.Assistent1);
   end;
   // Altezza riga intestazione colonne
   AltRiga (ExcelInfos.MyTeamFirstRow, 20);
   // Altezza riga totali
   AltRiga (ExcelInfos.MyTeamFirstRow+1+CurrMatch.MyTeam.Roster.Count, 33);
   AltRiga (ExcelInfos.MyTeamFirstRow+2+CurrMatch.MyTeam.Roster.Count, 7);
   AltRiga (ExcelInfos.MyTeamFirstRow+3+CurrMatch.MyTeam.Roster.Count, 19);
   AltRiga (ExcelInfos.MyTeamFirstRow+4+CurrMatch.MyTeam.Roster.Count, 19);
   AltRiga (ExcelInfos.MyTeamFirstRow+5+CurrMatch.MyTeam.Roster.Count, 7);
   // Altezza riga giocatori
   for Yyy:=0 to Pred(CurrMatch.MyTeam.Roster.Count) do
      AltRiga (ExcelInfos.MyTeamFirstRow+1+Yyy, 19);
   // Bordi delle colonne
   if (BSDECfg.Excel_DrawLines.ValueAsBool) then
   begin
      for Yyy:=ExcelInfos.MyTeamFirstRow to (ExcelInfos.MyTeamFirstRow+1+CurrMatch.MyTeam.Roster.Count) do
      begin
         aView.CreateCell (Yyy,  0).Style.Borders[bRight].Style := sscbsThin;
         aView.CreateCell (Yyy,  2).Style.Borders[bRight].Style := sscbsThin;
         aView.CreateCell (Yyy,  1).Style.Borders[bRight].Style := sscbsThin;
         aView.CreateCell (Yyy,  6).Style.Borders[bRight].Style := sscbsThin;
         aView.CreateCell (Yyy,  8).Style.Borders[bRight].Style := sscbsThin;
         aView.CreateCell (Yyy, 11).Style.Borders[bRight].Style := sscbsThin;
         aView.CreateCell (Yyy, 13).Style.Borders[bRight].Style := sscbsThin;
         aView.CreateCell (Yyy, 14).Style.Borders[bRight].Style := sscbsThin;
         aView.CreateCell (Yyy, 16).Style.Borders[bRight].Style := sscbsThin;
         aView.CreateCell (Yyy, ExcelInfos.PtQrtCol+0).Style.Borders[bLeft].Style := sscbsThin;
   //      aView.CreateCell (Yyy, 19).Style.Borders[bRight].Style := sscbsThin;
         //
         aView.CreateCell (Yyy,  0).Style.Borders[bRight].Color := BSDECfg.ExcelColor_Border.ValueAsInteger;
         aView.CreateCell (Yyy,  2).Style.Borders[bRight].Color := BSDECfg.ExcelColor_Border.ValueAsInteger;
         aView.CreateCell (Yyy,  1).Style.Borders[bRight].Color := BSDECfg.ExcelColor_Border.ValueAsInteger;
         aView.CreateCell (Yyy,  6).Style.Borders[bRight].Color := BSDECfg.ExcelColor_Border.ValueAsInteger;
         aView.CreateCell (Yyy,  8).Style.Borders[bRight].Color := BSDECfg.ExcelColor_Border.ValueAsInteger;
         aView.CreateCell (Yyy, 11).Style.Borders[bRight].Color := BSDECfg.ExcelColor_Border.ValueAsInteger;
         aView.CreateCell (Yyy, 13).Style.Borders[bRight].Color := BSDECfg.ExcelColor_Border.ValueAsInteger;
         aView.CreateCell (Yyy, 14).Style.Borders[bRight].Color := BSDECfg.ExcelColor_Border.ValueAsInteger;
         aView.CreateCell (Yyy, 16).Style.Borders[bRight].Color := BSDECfg.ExcelColor_Border.ValueAsInteger;
         aView.CreateCell (Yyy, ExcelInfos.PtQrtCol+0).Style.Borders[bLeft].Color := BSDECfg.ExcelColor_Border.ValueAsInteger;
   //      aView.CreateCell (Yyy, 19).Style.Borders[bRight].Color := BSDECfg.ExcelColor_Border.ValueAsInteger;
      end;
   end;
end;


procedure TMainWind.Excel_IntestazioniOppo(aView: TdxSpreadSheetTableView);
var
   Cell        :TdxSpreadSheetCell;
   Sss         :string;
   S1          :string;
   S2          :string;
   Xxx         :LongInt;
   Yyy         :LongInt;
   Num         :Longint;
   Rrr         :LongInt;
   Clr         :TColor;

   procedure AltRiga (aRrr :LongInt;
                      aAlt :LongInt);
   begin
      if (aView.Rows[aRrr] = nil) then
         aView.CreateCell (aRrr, 0);
      aView.Rows[aRrr].Size := aAlt;
   end;
begin
   // Intestazioni delle colonne
   if (BSDECfg.Excel_NomeAvversari.ValueAsBool) then
      aView.CreateCell (ExcelInfos.OppoTeamFirstRow, 0).SetText (CurrMatch.OppTeam.Name)
   else
      aView.CreateCell (ExcelInfos.OppoTeamFirstRow, 0).SetText (Str_Avversari);
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow,  2).SetText ('');
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow,  1).SetText (Str_Punti);
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow,  3).SetText (Str_TL);
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow,  4).SetText (Str_T2);
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow,  5).SetText (Str_T3);
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow,  6).SetText ('');
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow,  7).SetText (Str_FalliFatti);
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow,  8).SetText ('');
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow,  9).SetText (Str_RimbDifesa);
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow, 10).SetText (Str_RimbAttacco);
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow, 11).SetText (Str_RimbTot);
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow, 12).SetText (Str_PallePerse);
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow, 13).SetText (Str_PalleRecuperate);
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow, 14).SetText ('');
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow, 15).SetText ('');
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow, 16).SetText ('');
   if (BSDECfg.Excel_PIR.ValueAsBool) then
      aView.CreateCell (ExcelInfos.OppoTeamFirstRow, ExcelInfos.PIRCol).SetText ('');
   if (BSDECfg.Excel_OER.ValueAsBool) then
      aView.CreateCell (ExcelInfos.OppoTeamFirstRow, ExcelInfos.OERCol).SetText ('');
   if (BSDECfg.Excel_VIR.ValueAsBool) then
      aView.CreateCell (ExcelInfos.OppoTeamFirstRow, ExcelInfos.VIRCol).SetText ('');
   if (BSDECfg.Excel_PlusMinus.ValueAsBool) then
      aView.CreateCell (ExcelInfos.OppoTeamFirstRow, ExcelInfos.PlusMinusCol).SetText ('');
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow, ExcelInfos.PtQrtCol+0).SetText ('Q1');
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow, ExcelInfos.PtQrtCol+1).SetText ('Q2');
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow, ExcelInfos.PtQrtCol+2).SetText ('Q3');
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow, ExcelInfos.PtQrtCol+3).SetText ('Q4');
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow, ExcelInfos.PtQrtCol+4).SetText ('ET');
   // Allineamento delle intestazioni
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow,  0).Style.AlignHorz := ssahLeft;
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow,  2).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow,  1).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow,  3).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow,  4).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow,  5).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow,  6).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow,  7).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow,  8).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow,  9).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow, 10).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow, 11).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow, 12).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow, 13).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow, 14).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow, 15).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow, 16).Style.AlignHorz := ssahCenter;
   if (BSDECfg.Excel_PIR.ValueAsBool) then
      aView.CreateCell (ExcelInfos.OppoTeamFirstRow, ExcelInfos.PIRCol).Style.AlignHorz := ssahCenter;
   if (BSDECfg.Excel_OER.ValueAsBool) then
      aView.CreateCell (ExcelInfos.OppoTeamFirstRow, ExcelInfos.OERCol).Style.AlignHorz := ssahCenter;
   if (BSDECfg.Excel_VIR.ValueAsBool) then
      aView.CreateCell (ExcelInfos.OppoTeamFirstRow, ExcelInfos.VIRCol).Style.AlignHorz := ssahCenter;
   if (BSDECfg.Excel_PlusMinus.ValueAsBool) then
      aView.CreateCell (ExcelInfos.OppoTeamFirstRow, ExcelInfos.PlusMinusCol).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow, ExcelInfos.PtQrtCol+0).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow, ExcelInfos.PtQrtCol+1).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow, ExcelInfos.PtQrtCol+2).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow, ExcelInfos.PtQrtCol+3).Style.AlignHorz := ssahCenter;
   aView.CreateCell (ExcelInfos.OppoTeamFirstRow, ExcelInfos.PtQrtCol+4).Style.AlignHorz := ssahCenter;
   // Larghezze delle colonne
   (*
   aView.Columns[ 0].Size := 90;
   aView.Columns[ 1].Size := 39;
   aView.Columns[ 2].Size := 44;
   aView.Columns[ 3].Size := 62;
   aView.Columns[ 4].Size := 62;
   aView.Columns[ 5].Size := 62;
   aView.Columns[ 6].Size := 62;
   aView.Columns[ 7].Size := 37;
   aView.Columns[ 8].Size := 37;
   aView.Columns[ 9].Size := 37;
   aView.Columns[10].Size := 37;
   aView.Columns[11].Size := 38;
   aView.Columns[12].Size := 37;
   aView.Columns[13].Size := 37;
   aView.Columns[14].Size := 37;
   aView.Columns[15].Size := 37;
   aView.Columns[16].Size := 37;
   if (BSDECfg.Excel_PIR.ValueAsBool) then
      aView.Columns[ExcelInfos.PIRCol].Size := 37;
   if (BSDECfg.Excel_OER.ValueAsBool) then
      aView.Columns[ExcelInfos.OERCol].Size := 37;
   if (BSDECfg.Excel_VIR.ValueAsBool) then
      aView.Columns[ExcelInfos.VIRCol].Size := 37;
   if (BSDECfg.Excel_PlusMinus.ValueAsBool) then
      aView.Columns[ExcelInfos.PlusMinusCol].Size := 37;
   *)
   // Colore di sfondo delle celle con i titoli delle colonne
   for Xxx:=0 to (ExcelInfos.TotCols-1) do
   begin
      Cell := aView.CreateCell (ExcelInfos.OppoTeamFirstRow, Xxx);
       Cell.Style.Brush.BackgroundColor := BSDECfg.ExcelColor_BckCols.ValueAsInteger;
       Cell.Style.Brush.Style := sscfsSolid;
       Cell.Style.Font.Style := [fsBold, fsItalic];
       Cell.Style.Font.Size := 12;
       Cell.Style.Font.Color := BSDECfg.ExcelColor_TxtCols.ValueAsInteger;
       Cell.Style.AlignVert := ssavCenter;
   end;
   // Fondo giocatori OppoTeam
   if (BSDECfg.Excel_Bck3Rows.ValueAsBool) then
   begin
      for Yyy:=0 to Pred(CurrMatch.OppTeam.Roster.Count) do
      begin
         case (Yyy mod 3) of
            1:    Clr := BSDECfg.ExcelColor_BckRow2.ValueAsInteger;
            2:    Clr := BSDECfg.ExcelColor_BckRow3.ValueAsInteger;
            else  Clr := BSDECfg.ExcelColor_BckRow1.ValueAsInteger;
         end;
         for Xxx:=0 to (ExcelInfos.TotCols-1) do
         begin
            Cell := aView.CreateCell (ExcelInfos.OppoTeamFirstRow+1+Yyy, Xxx);
             Cell.Style.Brush.BackgroundColor := Clr;
             Cell.Style.Brush.Style := sscfsSolid;
             Cell.Style.Font.Style := [];
             Cell.Style.Font.Size := 8;
             Cell.Style.Font.Color := clBlack;
             Cell.Style.AlignVert := ssavCenter;
         end;
         // Allineamento delle celle dati
         Rrr := ExcelInfos.OppoTeamFirstRow+Yyy+1;
         aView.CreateCell (Rrr,  0).Style.AlignHorz := ssahLeft;
         aView.CreateCell (Rrr,  2).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  1).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  3).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  4).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  5).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  6).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  7).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  8).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  9).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 10).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 11).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 12).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 13).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 14).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 15).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 16).Style.AlignHorz := ssahCenter;
         if (BSDECfg.Excel_PIR.ValueAsBool) then
            aView.CreateCell (Rrr, ExcelInfos.PIRCol).Style.AlignHorz := ssahCenter;
         if (BSDECfg.Excel_OER.ValueAsBool) then
            aView.CreateCell (Rrr, ExcelInfos.OERCol).Style.AlignHorz := ssahCenter;
         if (BSDECfg.Excel_VIR.ValueAsBool) then
            aView.CreateCell (Rrr, ExcelInfos.VIRCol).Style.AlignHorz := ssahCenter;
         if (BSDECfg.Excel_PlusMinus.ValueAsBool) then
            aView.CreateCell (Rrr, ExcelInfos.PlusMinusCol).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+0).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+1).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+2).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+3).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+4).Style.AlignHorz := ssahCenter;
      end;
   end
   else
   begin
      for Yyy:=0 to Pred(CurrMatch.OppTeam.Roster.Count) do
      begin
         case (Yyy mod 2) of
            1:    Clr := BSDECfg.ExcelColor_BckRow2.ValueAsInteger;
            else  Clr := BSDECfg.ExcelColor_BckRow1.ValueAsInteger;
         end;
         for Xxx:=0 to (ExcelInfos.TotCols-1) do
         begin
            Cell := aView.CreateCell (ExcelInfos.OppoTeamFirstRow+1+Yyy, Xxx);
             Cell.Style.Brush.BackgroundColor := Clr;
             Cell.Style.Brush.Style := sscfsSolid;
             Cell.Style.Font.Style := [];
             Cell.Style.Font.Size := 8;
             Cell.Style.Font.Color := clBlack;
             Cell.Style.AlignVert := ssavCenter;
         end;
         // Allineamento delle celle dati
         Rrr := ExcelInfos.OppoTeamFirstRow+Yyy+1;
         aView.CreateCell (Rrr,  0).Style.AlignHorz := ssahLeft;
         aView.CreateCell (Rrr,  2).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  1).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  3).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  4).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  5).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  6).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  7).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  8).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr,  9).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 10).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 11).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 12).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 13).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 14).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 15).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, 16).Style.AlignHorz := ssahCenter;
         if (BSDECfg.Excel_PIR.ValueAsBool) then
            aView.CreateCell (Rrr, ExcelInfos.PIRCol).Style.AlignHorz := ssahCenter;
         if (BSDECfg.Excel_OER.ValueAsBool) then
            aView.CreateCell (Rrr, ExcelInfos.OERCol).Style.AlignHorz := ssahCenter;
         if (BSDECfg.Excel_VIR.ValueAsBool) then
            aView.CreateCell (Rrr, ExcelInfos.VIRCol).Style.AlignHorz := ssahCenter;
         if (BSDECfg.Excel_PlusMinus.ValueAsBool) then
            aView.CreateCell (Rrr, ExcelInfos.PlusMinusCol).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+0).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+1).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+2).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+3).Style.AlignHorz := ssahCenter;
         aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+4).Style.AlignHorz := ssahCenter;
      end;
   end;
   // Riga totali
   for Xxx:=0 to (ExcelInfos.TotCols-1) do
   begin
      Cell := aView.CreateCell (ExcelInfos.OppoTeamFirstRow+1+CurrMatch.OppTeam.Roster.Count, Xxx);
       Cell.Style.Brush.BackgroundColor := BSDECfg.ExcelColor_BckTots.ValueAsInteger;
       Cell.Style.Brush.Style := sscfsSolid;
       Cell.Style.Font.Style := [fsBold];
       Cell.Style.Font.Size := 9;
       Cell.Style.Font.Color := BSDECfg.ExcelColor_TxtTots.ValueAsInteger;
       Cell.Style.AlignVert := ssavCenter;
       Cell.Style.AlignHorz := ssahCenter;
       Cell.Style.WordWrap := True;
   end;
   // Allenatori
   if (CurrMatch.OppTeam.HeadCoach <> '') then
   begin
      if (BSDECfg.Excel_ScriviDescCoach.ValueAsBool) then
         S1 := Str_Allen
      else
         S1 := '';
      Cell := aView.CreateCell (ExcelInfos.OppoTeamFirstRow+3+CurrMatch.OppTeam.Roster.Count, 0);
       Cell.Style.Font.Style := [];
       Cell.Style.Font.Size := 10;
       Cell.Style.AlignVert := ssavCenter;
       Cell.SetText (S1+CurrMatch.OppTeam.HeadCoach);
   end;
   if (CurrMatch.OppTeam.Assistent1 <> '') then
   begin
      if (BSDECfg.Excel_ScriviDescCoach.ValueAsBool) then
         S2 := Str_Vice
      else
         S2 := '';
      Cell := aView.CreateCell (ExcelInfos.OppoTeamFirstRow+4+CurrMatch.OppTeam.Roster.Count, 0);
       Cell.Style.Font.Style := [];
       Cell.Style.Font.Size := 10;
       Cell.Style.AlignVert := ssavCenter;
       Cell.SetText (S2+CurrMatch.OppTeam.Assistent1);
   end;
   // Bordi delle colonne
   if (BSDECfg.Excel_DrawLines.ValueAsBool) then
   begin
      for Yyy:=ExcelInfos.OppoTeamFirstRow to (ExcelInfos.OppoTeamFirstRow+1+CurrMatch.OppTeam.Roster.Count) do
      begin
         aView.CreateCell (Yyy,  0).Style.Borders[bRight].Style := sscbsThin;
         aView.CreateCell (Yyy,  2).Style.Borders[bRight].Style := sscbsThin;
         aView.CreateCell (Yyy,  1).Style.Borders[bRight].Style := sscbsThin;
         aView.CreateCell (Yyy,  6).Style.Borders[bRight].Style := sscbsThin;
         aView.CreateCell (Yyy,  8).Style.Borders[bRight].Style := sscbsThin;
         aView.CreateCell (Yyy, 11).Style.Borders[bRight].Style := sscbsThin;
         aView.CreateCell (Yyy, 13).Style.Borders[bRight].Style := sscbsThin;
         aView.CreateCell (Yyy, 14).Style.Borders[bRight].Style := sscbsThin;
         aView.CreateCell (Yyy, 16).Style.Borders[bRight].Style := sscbsThin;
         aView.CreateCell (Yyy, ExcelInfos.PtQrtCol+0).Style.Borders[bLeft].Style := sscbsThin;
   //      aView.CreateCell (Yyy, 19).Style.Borders[bRight].Style := sscbsThin;
         //
         aView.CreateCell (Yyy,  0).Style.Borders[bRight].Color := BSDECfg.ExcelColor_Border.ValueAsInteger;
         aView.CreateCell (Yyy,  2).Style.Borders[bRight].Color := BSDECfg.ExcelColor_Border.ValueAsInteger;
         aView.CreateCell (Yyy,  1).Style.Borders[bRight].Color := BSDECfg.ExcelColor_Border.ValueAsInteger;
         aView.CreateCell (Yyy,  6).Style.Borders[bRight].Color := BSDECfg.ExcelColor_Border.ValueAsInteger;
         aView.CreateCell (Yyy,  8).Style.Borders[bRight].Color := BSDECfg.ExcelColor_Border.ValueAsInteger;
         aView.CreateCell (Yyy, 11).Style.Borders[bRight].Color := BSDECfg.ExcelColor_Border.ValueAsInteger;
         aView.CreateCell (Yyy, 13).Style.Borders[bRight].Color := BSDECfg.ExcelColor_Border.ValueAsInteger;
         aView.CreateCell (Yyy, 14).Style.Borders[bRight].Color := BSDECfg.ExcelColor_Border.ValueAsInteger;
         aView.CreateCell (Yyy, 16).Style.Borders[bRight].Color := BSDECfg.ExcelColor_Border.ValueAsInteger;
         aView.CreateCell (Yyy, ExcelInfos.PtQrtCol+0).Style.Borders[bLeft].Color := BSDECfg.ExcelColor_Border.ValueAsInteger;
   //      aView.CreateCell (Yyy, 19).Style.Borders[bRight].Color := BSDECfg.ExcelColor_Border.ValueAsInteger;
      end;
   end;
   // Altezza riga intestazione colonne
   AltRiga (ExcelInfos.OppoTeamFirstRow, 20);
   // Altezza riga totali
   Num := ExcelInfos.OppoTeamFirstRow+CurrMatch.OppTeam.Roster.Count;
   AltRiga (Num+1, 33);
   AltRiga (Num+2, 7);
   AltRiga (Num+3, 19);
   AltRiga (Num+4, 19);
   // Altezza riga giocatori
   for Yyy:=0 to Pred(CurrMatch.OppTeam.Roster.Count) do
      AltRiga (ExcelInfos.OppoTeamFirstRow+1+Yyy, 19);
end;


procedure TMainWind.Excel_MappaDiTiro(aView: TdxSpreadSheetTableView);
var
   aRow  :Longint;
   aCol  :Longint;
   Cell  :TdxSpreadSheetCell;
   Rrr   :TRect;
   P1    :TPoint;
   P2    :TPoint;
   BaseImg     :TBitmap;
   FinalImg    :TJPEGImage;
   LittleImg   :array [0..11] of TBitmap;
   FullImg     :TBitmap;
   W1,H1       :Longint;
   Xxx         :Longint;
   Yyy         :Longint;
   Zzz         :Longint;
   OriFn       :String;
   DstFn       :String;
   K           :Double;
   TotPerRow   :Longint;
   TotPerCol   :Longint;
   Pl          :TMatchPlayer;

   function GetFile (aFn :String) :String;
   begin
      Result := AddSlash(Dalet_Globals.Folder_Data)+aFn;
      if (not FileExists (Result)) then
         Result := AddSlash(ExtractFilePath (Application.ExeName))+aFn;
      if (not FileExists (Result)) then
         Result := AddSlash(ExtractFilePath (Application.ExeName))+'CFG\'+aFn;
   end;

   function GetX (aX :Longint) :Longint;
   begin
      Result := Trunc (Ax/K);
   end;
   function GetY (aY :Longint) :Longint;
   begin
      Result := Trunc (Ay/K);
   end;
   procedure ExecutePlayer (Rea   :TRealizzazione;
                            aImg :TBitmap);
   var
      DoPaint  :Boolean;
      Clr      :TColor;
   begin
      DoPaint := False;
      if (Rea.Tipo = trT2) then
      begin
         DoPaint := True;
      end;
      if (Rea.Tipo = trT3) then
      begin
         DoPaint := True;
      end;
      if (DoPaint) then
      begin
         if (Rea.Punti > 0) then
         begin
            case (Rea.Quarto) of
               1: Clr := BSDECfg.ShootColorQrt1Yes.ValueAsInteger;
               2: Clr := BSDECfg.ShootColorQrt2Yes.ValueAsInteger;
               3: Clr := BSDECfg.ShootColorQrt3Yes.ValueAsInteger;
               4: Clr := BSDECfg.ShootColorQrt4Yes.ValueAsInteger;
               else Clr := BSDECfg.ShootColorQrtExtraYes.ValueAsInteger;
            end;
            aImg.Canvas.Pen.Color := Clr;
            aImg.Canvas.Brush.Color := Clr;
            aImg.Canvas.Ellipse(GetX(Rea.PosX)-3,GetY(Rea.PosY)-3, GetX(Rea.PosX)+3,GetY(Rea.PosY)+3);
         end
         else
         begin
            case (Rea.Quarto) of
               1: Clr := BSDECfg.ShootColorQrt1No.ValueAsInteger;
               2: Clr := BSDECfg.ShootColorQrt2No.ValueAsInteger;
               3: Clr := BSDECfg.ShootColorQrt3No.ValueAsInteger;
               4: Clr := BSDECfg.ShootColorQrt4No.ValueAsInteger;
               else Clr := BSDECfg.ShootColorQrtExtraNo.ValueAsInteger;
            end;
            aImg.Canvas.Pen.Color := Clr;
            aImg.Canvas.Pen.Width := 2;
            aImg.Canvas.MoveTo (GetX(Rea.PosX)-3,GetY(Rea.PosY)-3);
            aImg.Canvas.LineTo (GetX(Rea.PosX)+3,GetY(Rea.PosY)+3);
            aImg.Canvas.MoveTo (GetX(Rea.PosX)-3,GetY(Rea.PosY)+3);
            aImg.Canvas.LineTo (GetX(Rea.PosX)+3,GetY(Rea.PosY)-3);
         end;
      end;
   end;
begin
   try
      if (Img <> Nil) then
         FreeAndNil (Img);
      if (ImgCont <> Nil) then
         FreeAndNil (ImgCont);

      aRow := BSDECfg.Excel_MappaTiroRow.ValueAsInteger;
      aCol := 1;
      //
      TotPerRow := 4;
      TotPerCol := 12 Div TotPerRow;
      W1 := 920 Div TotPerRow;
      for Xxx:=0 to 11 do
         LittleImg[Xxx] := TBitmap.Create;
      FullImg := TBitmap.Create;
      try
         BaseImg  := TBitmap.Create;
         try
            OriFn := GetFile ('BkField.jpg');
            if (not FileExists (OriFn)) then
            begin
               ErrDlg (Str_FileNotFound, ['BkField.jpg',
                                          Dalet_Globals.Folder_Data,
                                          AddSlash(ExtractFilePath (Application.ExeName)),
                                          AddSlash(ExtractFilePath (Application.ExeName))+'CFG\']);
            end
            else
            begin
              BaseImg.LoadFromfile (OriFn);
              K := BaseImg.Width/W1;
              H1 := Trunc (BaseImg.Height/K);
              for Xxx:=0 to 11 do
              begin
                 LittleImg[Xxx].Width := W1;
                 LittleImg[Xxx].Height := H1;
                 LittleImg[Xxx].Canvas.StretchDraw (Rect(0,0, W1,H1), BaseImg);
              end;
            end;
         finally
            BaseImg.Free;
         end;

         for Xxx:=0 to Pred(CurrMatch.MyTeam.Roster.Count) do
         begin
            Pl := TMatchPlayer(CurrMatch.MyTeam.Player (Xxx));
            LittleImg[xxx].Canvas.TextOut (5, H1-40, Format ('%s) %s', [Pl.PlayNumber2, Pl.Name]));
            if (Pl.T2Tentati > 0) then
               LittleImg[xxx].Canvas.TextOut (W1 div 2, H1-40, Format ('T2:  %d/%d (%s%%)', [Pl.T2Realizz, Pl.T2Tentati, Pl.T2Perc]));
            if (Pl.T3Tentati > 0) then
               LittleImg[xxx].Canvas.TextOut (W1 div 2, H1-28, Format ('T3:  %d/%d (%s%%)', [Pl.T3Realizz, Pl.T3Tentati, Pl.T3Perc]));
            if (Pl.TdcTentati > 0) then
               LittleImg[xxx].Canvas.TextOut (W1 div 2, H1-16, Format ('Tdc: %d/%d (%s%%)', [Pl.TdcRealizz, Pl.TdcTentati, Pl.TdcPerc]));
            for Yyy:=0 to Pred(Pl.realizzazioni.Count) do
               ExecutePlayer (TRealizzazione(Pl.Realizzazioni[Yyy]), LittleImg[xxx]);
         end;

         FullImg.Width := W1*TotPerRow;
         FullImg.Height := H1*TotPerCol;
         Zzz := 0;
         for Yyy:=0 to Pred(TotPerCol) do
         begin
            for Xxx:=0 to Pred(TotPerRow) do
            begin
               FullImg.Canvas.Draw (Xxx*W1, Yyy*H1, LittleImg[Zzz]);
               Inc (Zzz);
            end;
         end;
         FinalImg := TJPegImage.Create;
         try
            FinalImg.Assign (FullImg);
            DstFn := AddSlash(extractFilePath(Application.ExeName))+'FullField.jpg';
            FinalImg.SaveToFile (DstFn);
         finally
            FinalImg.Free;
         end;
      finally
         FullImg.Free;
         for Xxx:=0 to 11 do
            LittleImg[Xxx].Free;
      end;
      Img := TdxSmartImage.Create;
      ImgCont := TdxSpreadSheetPictureContainer(aView.Containers.Add(TdxSpreadSheetPictureContainer));
      //
      Img.LoadFromFile (DstFn);
      Img.Transparent := False;
      Imgcont.Visible := True;
      Imgcont.AnchorType := catAbsolute;
      Cell := aView.CreateCell (aRow,     0{aCol});
      Rrr := Cell.GetAbsoluteBounds();
      P1 := Point (Rrr.Left+BSDECfg.Excel_MappaTiroOffsetX.ValueAsInteger, Rrr.Top+BSDECfg.Excel_MappaTiroOffsetY.ValueAsInteger);
      P2 := Point (Img.Width, Img.Height);
      Imgcont.AnchorPoint1.Offset := P1;
      Imgcont.AnchorPoint2.Offset := P2;
      Imgcont.Picture.Image := Img;
      Imgcont.Visible := True;
      DeleteFile (DstFn);
   except
      on E:Exception do
      begin
      end;
   end;
end;


procedure TMainWind.Excel_ProgressoEventi (aView: TdxSpreadSheetTableView);
var
   aRow  :Longint;
   aCol  :Longint;
   Cell  :TdxSpreadSheetCell;
   Rrr   :TRect;
   P1    :TPoint;
   P2    :TPoint;
   BaseImg     :TBitmap;
   FinalImg    :TJPEGImage;
   LittleImg   :array [0..11] of TBitmap;
   FullImg     :TBitmap;
   W1,H1       :Longint;
   Xxx         :Longint;
   Yyy         :Longint;
   Zzz         :Longint;
   OriFn       :String;
   DstFn       :String;
   K           :Double;
   TotPerRow   :Longint;
   TotPerCol   :Longint;
   Pl          :TMatchPlayer;
   Sss         :string;
   TotCols     :LongInt;
   Plr         :TMatchPlayer;
   Data        :TStringList;
   Tme         :string;
   Rg          :Longint;
   Flt         :Boolean;

   function GetFile (aFn :String) :String;
   begin
      Result := AddSlash(Dalet_Globals.Folder_Data)+aFn;
      if (not FileExists (Result)) then
         Result := AddSlash(ExtractFilePath (Application.ExeName))+aFn;
      if (not FileExists (Result)) then
         Result := AddSlash(ExtractFilePath (Application.ExeName))+'CFG\'+aFn;
   end;

   function GetX (aX :Longint) :Longint;
   begin
      Result := Trunc (Ax/K);
   end;
   function GetY (aY :Longint) :Longint;
   begin
      Result := Trunc (Ay/K);
   end;
   procedure ExecutePlayer (Rea   :TRealizzazione;
                            aImg :TBitmap);
   var
      DoPaint  :Boolean;
      Clr      :TColor;
   begin
      DoPaint := False;
      if (Rea.Tipo = trT2) then
      begin
         DoPaint := True;
      end;
      if (Rea.Tipo = trT3) then
      begin
         DoPaint := True;
      end;
      if (DoPaint) then
      begin
         if (Rea.Punti > 0) then
         begin
            case (Rea.Quarto) of
               1: Clr := BSDECfg.ShootColorQrt1Yes.ValueAsInteger;
               2: Clr := BSDECfg.ShootColorQrt2Yes.ValueAsInteger;
               3: Clr := BSDECfg.ShootColorQrt3Yes.ValueAsInteger;
               4: Clr := BSDECfg.ShootColorQrt4Yes.ValueAsInteger;
               else Clr := BSDECfg.ShootColorQrtExtraYes.ValueAsInteger;
            end;
            aImg.Canvas.Pen.Color := Clr;
            aImg.Canvas.Brush.Color := Clr;
            aImg.Canvas.Ellipse(GetX(Rea.PosX)-3,GetY(Rea.PosY)-3, GetX(Rea.PosX)+3,GetY(Rea.PosY)+3);
         end
         else
         begin
            case (Rea.Quarto) of
               1: Clr := BSDECfg.ShootColorQrt1No.ValueAsInteger;
               2: Clr := BSDECfg.ShootColorQrt2No.ValueAsInteger;
               3: Clr := BSDECfg.ShootColorQrt3No.ValueAsInteger;
               4: Clr := BSDECfg.ShootColorQrt4No.ValueAsInteger;
               else Clr := BSDECfg.ShootColorQrtExtraNo.ValueAsInteger;
            end;
            aImg.Canvas.Pen.Color := Clr;
            aImg.Canvas.Pen.Width := 2;
            aImg.Canvas.MoveTo (GetX(Rea.PosX)-3,GetY(Rea.PosY)-3);
            aImg.Canvas.LineTo (GetX(Rea.PosX)+3,GetY(Rea.PosY)+3);
            aImg.Canvas.MoveTo (GetX(Rea.PosX)-3,GetY(Rea.PosY)+3);
            aImg.Canvas.LineTo (GetX(Rea.PosX)+3,GetY(Rea.PosY)-3);
         end;
      end;
   end;
begin
   try
      (*
      if (Img <> Nil) then
         FreeAndNil (Img);
      if (ImgCont <> Nil) then
         FreeAndNil (ImgCont);

      aRow := BSDECfg.Excel_MappaTiroRow.ValueAsInteger;
      aCol := 1;
      //
      TotPerRow := 4;
      TotPerCol := 12 Div TotPerRow;
      W1 := 920 Div TotPerRow;
      for Xxx:=0 to 11 do
         LittleImg[Xxx] := TBitmap.Create;
      FullImg := TBitmap.Create;
      try
         BaseImg  := TBitmap.Create;
         try
            OriFn := GetFile ('BkField.jpg');
            if (not FileExists (OriFn)) then
            begin
               ErrDlg (Str_FileNotFound, ['BkField.jpg',
                                          Dalet_Globals.Folder_Data,
                                          AddSlash(ExtractFilePath (Application.ExeName)),
                                          AddSlash(ExtractFilePath (Application.ExeName))+'CFG\']);
            end
            else
            begin
              BaseImg.LoadFromfile (OriFn);
              K := BaseImg.Width/W1;
              H1 := Trunc (BaseImg.Height/K);
              for Xxx:=0 to 11 do
              begin
                 LittleImg[Xxx].Width := W1;
                 LittleImg[Xxx].Height := H1;
                 LittleImg[Xxx].Canvas.StretchDraw (Rect(0,0, W1,H1), BaseImg);
              end;
            end;
         finally
            BaseImg.Free;
         end;

         for Xxx:=0 to Pred(CurrMatch.MyTeam.Roster.Count) do
         begin
            Pl := TMatchPlayer(CurrMatch.MyTeam.Player (Xxx));
            LittleImg[xxx].Canvas.TextOut (5, H1-40, Format ('%s) %s', [Pl.PlayNumber2, Pl.Name]));
            if (Pl.T2Tentati > 0) then
               LittleImg[xxx].Canvas.TextOut (W1 div 2, H1-40, Format ('T2:  %d/%d (%s%%)', [Pl.T2Realizz, Pl.T2Tentati, Pl.T2Perc]));
            if (Pl.T3Tentati > 0) then
               LittleImg[xxx].Canvas.TextOut (W1 div 2, H1-28, Format ('T3:  %d/%d (%s%%)', [Pl.T3Realizz, Pl.T3Tentati, Pl.T3Perc]));
            if (Pl.TdcTentati > 0) then
               LittleImg[xxx].Canvas.TextOut (W1 div 2, H1-16, Format ('Tdc: %d/%d (%s%%)', [Pl.TdcRealizz, Pl.TdcTentati, Pl.TdcPerc]));
            for Yyy:=0 to Pred(Pl.realizzazioni.Count) do
               ExecutePlayer (TRealizzazione(Pl.Realizzazioni[Yyy]), LittleImg[xxx]);
         end;

         FullImg.Width := W1*TotPerRow;
         FullImg.Height := H1*TotPerCol;
         Zzz := 0;
         for Yyy:=0 to Pred(TotPerCol) do
         begin
            for Xxx:=0 to Pred(TotPerRow) do
            begin
               FullImg.Canvas.Draw (Xxx*W1, Yyy*H1, LittleImg[Zzz]);
               Inc (Zzz);
            end;
         end;
         FinalImg := TJPegImage.Create;
         try
            FinalImg.Assign (FullImg);
            DstFn := AddSlash(extractFilePath(Application.ExeName))+'FullField.jpg';
            FinalImg.SaveToFile (DstFn);
         finally
            FinalImg.Free;
         end;
      finally
         FullImg.Free;
         for Xxx:=0 to 11 do
            LittleImg[Xxx].Free;
      end;
      Img := TdxSmartImage.Create;
      ImgCont := TdxSpreadSheetPictureContainer(aView.Containers.Add(TdxSpreadSheetPictureContainer));
      //
      Img.LoadFromFile (DstFn);
      Img.Transparent := False;
      Imgcont.Visible := True;
      Imgcont.AnchorType := catAbsolute;
      Cell := aView.CreateCell (aRow,     0{aCol});
      Rrr := Cell.GetAbsoluteBounds();
      P1 := Point (Rrr.Left+BSDECfg.Excel_MappaTiroOffsetX.ValueAsInteger, Rrr.Top+BSDECfg.Excel_MappaTiroOffsetY.ValueAsInteger);
      P2 := Point (Img.Width, Img.Height);
      Imgcont.AnchorPoint1.Offset := P1;
      Imgcont.AnchorPoint2.Offset := P2;
      Imgcont.Picture.Image := Img;
      Imgcont.Visible := True;
      DeleteFile (DstFn);
      *)
      (*
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
      *)
      Data := TStringList.Create;
      for Xxx:=0 to (OpList.Count-1) do
      begin
         if ((OpList.Items[Xxx].Oper = totTLYes) or (OpList.Items[Xxx].Oper = totT2Yes) or (OpList.Items[Xxx].Oper = totT3Yes)) then
         begin
            Data.Add(Format('%d) %d;%d-%d (%s)', [Xxx, Longint(OpList.Items[Xxx].Oper),
                                              OpList.Items[Xxx].Quarter,
                                              OpList.Items[Xxx].Time,
                                              OpList.Items[Xxx].Desc]));
         end;
      end;
      //
      Rg := 50;
      for Xxx:=0 to (Data.Count-1) do
      begin
         if (Data[Xxx] <> '') then
         begin
            Cell := aView.CreateCell (Rg+Xxx, 1);
            Cell.AsString := Data[xxx];
         end;
      end;
      Data.Free;
   except
      on E:Exception do
      begin
      end;
   end;
end;


procedure TMainWind.Excel_PageSettings(aView: TdxSpreadSheetTableView);
var
   LastCol  :Longint;
   LastRow  :LongInt;
begin
   try
      aView.OptionsPrint.Page.Paper.SizeID := 9;  // A4
      aView.OptionsPrint.Page.Orientation := oppoLandScape;
      aView.OptionsPrint.Page.Margins.Left   := 0;
      aView.OptionsPrint.Page.Margins.Right  := 0;
      aView.OptionsPrint.Page.Margins.Top    := 0;
      aView.OptionsPrint.Page.Margins.Bottom := 0;
      aView.OptionsPrint.Source.Area.Reset;
      aView.OptionsPrint.Source.Area.Left := 0;
      aView.OptionsPrint.Source.Area.Top  := 0;
      LastCol := 21;//16;
      if (BSDECfg.Excel_PIR.ValueAsBool) then
         Inc (LastCol);
      if (BSDECfg.Excel_OER.ValueAsBool) then
         Inc (LastCol);
      if (BSDECfg.Excel_VIR.ValueAsBool) then
         Inc (LastCol);
      if (BSDECfg.Excel_PlusMinus.ValueAsBool) then
         Inc (LastCol);
      if (ChkMappaTiro.Checked) then
         LastRow := BSDECfg.Excel_MappaTiroInfo.ValueAsInteger
      else
         LastRow := ExcelInfos.LastRow;
      aView.OptionsPrint.Source.Area.Right := LastCol;
      aView.OptionsPrint.Source.Area.Bottom := LastRow;
   except
   end;
end;


procedure TMainWind.Excel_StatMyTeam(aView: TdxSpreadSheetTableView);
var
   Cell        :TdxSpreadSheetCell;
   Sss         :string;
   TotCols     :LongInt;
   Xxx         :LongInt;
   Yyy         :LongInt;
   Rrr         :LongInt;
   Plr         :TMatchPlayer;
   Data        :TStringList;
   Tme         :string;
begin
   Data := TStringList.Create;
   for Yyy:=0 to Pred(CurrMatch.MyTeam.Roster.Count) do
   begin
      Data.Clear;
      Plr := nil;
      Rrr := ExcelInfos.MyTeamFirstRow+1+Yyy;
      Plr := CurrMatch.MyTeam.Player(Yyy);
      if (Plr <> nil) then
      begin
         Data.Add (Format ('%s%s) %s%s', [IIF ((Plr.InQuintetto), Chr($2022), ' '), Plr.PlayNumber, IIF ((Plr.Captain), '© ', ''), Plr.Name]));
         if (Plr.InGioco) then
            Tme := Format ('''%s', [Plr.TotalPlayingTimeStr])
         else
         begin
            if (Plr.TempoGiocoStr = '00:00') then
               Tme := Str_NonEntrato
            else
               Tme := Plr.TempoGiocoStr;
         end;
         if (Tme <> Str_NonEntrato) then
         begin
            //Data.Add (Tme);
            Data.Add (Format ('%d', [Plr.Punti]));
            Data.Add (Tme);
            if (Plr.TLTentati > 0) then
               Data.Add (Format ('%d/%d (%s%%)', [Plr.TLRealizz, Plr.TLTentati, Plr.TLPerc]))
            else
               Data.Add('');
            if (Plr.T2Tentati > 0) then
               Data.Add (Format ('%d/%d (%s%%)', [Plr.T2Realizz, Plr.T2Tentati, Plr.T2Perc]))
            else
               Data.Add('');
            if (Plr.T3Tentati > 0) then
               Data.Add (Format ('%d/%d (%s%%)', [Plr.T3Realizz, Plr.T3Tentati, Plr.T3Perc]))
            else
               Data.Add('');
            if (Plr.TdcTentati > 0) then
               Data.Add (Format ('%d/%d (%s%%)', [Plr.TdcRealizz, Plr.TdcTentati, Plr.TdcPerc]))
            else
               Data.Add('');
            Data.Add (Format ('%d', [Plr.FalliFatti]));
            Data.Add (Format ('%d', [Plr.FalliSubiti]));
            Data.Add (Format ('%d', [Plr.RimbDifesa]));
            Data.Add (Format ('%d', [Plr.RimbAttacco]));
            Data.Add (Format ('%d', [Plr.Rimbalzi]));
            Data.Add (Format ('%d', [Plr.PPerse]));
            Data.Add (Format ('%d', [Plr.PRecuperate]));
            Data.Add (Format ('%d', [Plr.Assist]));
            Data.Add (Format ('%d', [Plr.StoppFatte]));
            Data.Add (Format ('%d', [Plr.StoppSubite]));
            if (BSDECfg.Excel_PIR.ValueAsBool) then
               Data.Add (Format ('%d', [Round (Plr.PIR)]));
            if (BSDECfg.Excel_OER.ValueAsBool) then
               Data.Add (Format ('%1.1f', [Plr.OER]));
            (* TOIMPLEMENT
            if (BSDECfg.Excel_VIR.ValueAsBool) then
               Data.Add (Format ('%d', [Round (Plr.)]));
            *)
            if (BSDECfg.Excel_PlusMinus.ValueAsBool) then
               Data.Add (Format ('%d', [Plr.PlusMinus]));
            Data.Add (Format ('%d', [Plr.PtiQ1]));
            Data.Add (Format ('%d', [Plr.PtiQ2]));
            Data.Add (Format ('%d', [Plr.PtiQ3]));
            Data.Add (Format ('%d', [Plr.PtiQ4]));
            Data.Add (Format ('%d', [Plr.PtiEt]));
         end
         else
         begin
            //Data.Add (Tme);
            Data.Add ('');
            Data.Add (Tme);
            Data.Add ('');
            Data.Add ('');
            Data.Add ('');
            Data.Add ('');
            Data.Add ('');
            Data.Add ('');
            Data.Add ('');
            Data.Add ('');
            Data.Add ('');
            Data.Add ('');
            Data.Add ('');
            Data.Add ('');
            Data.Add ('');
            Data.Add ('');
            if (BSDECfg.Excel_PIR.ValueAsBool) then
               Data.Add ('');
            if (BSDECfg.Excel_OER.ValueAsBool) then
               Data.Add ('');
            (* TOIMPLEMENT
            if (BSDECfg.Excel_VIR.ValueAsBool) then
               Data.Add ('');
            *)
            if (BSDECfg.Excel_PlusMinus.ValueAsBool) then
               Data.Add ('');
            Data.Add ('');
            Data.Add ('');
            Data.Add ('');
            Data.Add ('');
            Data.Add ('');
         end;
      end;
      //
      for Xxx:=0 to (Data.Count-1) do
      begin
         if (Data[Xxx] <> '') then
         begin
            Cell := aView.CreateCell (Rrr, Xxx);
            Cell.AsString := Data[xxx];
         end;
      end;
   end;
   Rrr := ExcelInfos.MyTeamFirstRow+CurrMatch.MyTeam.Roster.Count+1;
   aView.CreateCell (Rrr,  2).SetText (Format ('''%s', [CurrMatch.MyTeam.TotTempoGiocoStr]));
   aView.CreateCell (Rrr,  1).SetText (Format ('%d', [CurrMatch.MyTeam.Punti]));
   aView.CreateCell (Rrr,  3).SetText (Format (Str_TL+': %d/%d'+#13#10+'(%s%%)',  [CurrMatch.MyTeam.TLRealizz, CurrMatch.MyTeam.TLTentati, CurrMatch.MyTeam.TLPerc]));
   aView.CreateCell (Rrr,  4).SetText (Format (Str_T2+': %d/%d'+#13#10+'(%s%%)',  [CurrMatch.MyTeam.T2Realizz, CurrMatch.MyTeam.T2Tentati, CurrMatch.MyTeam.T2Perc]));
   aView.CreateCell (Rrr,  5).SetText (Format (Str_T3+': %d/%d'+#13#10+'(%s%%)',  [CurrMatch.MyTeam.T3Realizz, CurrMatch.MyTeam.T3Tentati, CurrMatch.MyTeam.T3Perc]));
   aView.CreateCell (Rrr,  6).SetText (Format ('Tdc'+': %d/%d'+#13#10+'(%s%%)', [CurrMatch.MyTeam.TdcRealizz, CurrMatch.MyTeam.TdcTentati, CurrMatch.MyTeam.TdcPerc]));
   aView.CreateCell (Rrr,  7).SetText (Format ('%d', [CurrMatch.MyTeam.FalliFatti]));
   aView.CreateCell (Rrr,  8).SetText (Format ('%d', [CurrMatch.MyTeam.FalliSubiti]));
   aView.CreateCell (Rrr,  9).SetText (Format ('%d', [CurrMatch.MyTeam.RimbDifesa]));
   aView.CreateCell (Rrr, 10).SetText (Format ('%d', [CurrMatch.MyTeam.RimbAttacco]));
   aView.CreateCell (Rrr, 11).SetText (Format ('%d', [CurrMatch.MyTeam.Rimbalzi]));
   aView.CreateCell (Rrr, 12).SetText (Format ('%d', [CurrMatch.MyTeam.PPerse]));
   aView.CreateCell (Rrr, 13).SetText (Format ('%d', [CurrMatch.MyTeam.PRecuperate]));
   aView.CreateCell (Rrr, 14).SetText (Format ('%d', [CurrMatch.MyTeam.Assist]));
   aView.CreateCell (Rrr, 15).SetText (Format ('%d', [CurrMatch.MyTeam.StoppFatte]));
   aView.CreateCell (Rrr, 16).SetText (Format ('%d', [CurrMatch.MyTeam.StoppSubite]));
   Xxx := 17;
   if (BSDECfg.Excel_PIR.ValueAsBool) then
   begin
      aView.CreateCell (Rrr, Xxx).SetText (Format ('%d', [Round (CurrMatch.MyTeam.PIR)]));
      Inc (Xxx);
   end;
   if (BSDECfg.Excel_OER.ValueAsBool) then
   begin
      aView.CreateCell (Rrr, Xxx).SetText (Format ('%1.1f', [CurrMatch.MyTeam.OER]));
      Inc (Xxx);
   end;
   (*  TOIMPLEMENT
   if (BSDECfg.Excel_VIR.ValueAsBool) then
   begin
      aView.CreateCell (Rrr, Xxx).SetText (Format ('%d', [CurrMatch.MyTeam.VIR]));
      Inc (Xxx);
   end;
   *)
   (*
   aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+0).SetText (Format ('%d', [0]));
   aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+1).SetText (Format ('%d', [0]));
   aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+2).SetText (Format ('%d', [0]));
   aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+3).SetText (Format ('%d', [0]));
   aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+4).SetText (Format ('%d', [0]));
   *)
   Data.Free;
end;


procedure TMainWind.Excel_StatOppTeam(aView: TdxSpreadSheetTableView);
var
   Cell        :TdxSpreadSheetCell;
   Sss         :string;
   TotCols     :LongInt;
   Xxx         :LongInt;
   Yyy         :LongInt;
   Rrr         :LongInt;
   Plr         :TMatchPlayer;
   Data        :TStringList;
   Tme         :string;
begin
   Data := TStringList.Create;
   for Yyy:=0 to Pred(CurrMatch.OppTeam.Roster.Count) do
   begin
      Data.Clear;
      Plr := nil;
      Rrr := ExcelInfos.OppoTeamFirstRow+1+Yyy;
      Plr := CurrMatch.OppTeam.Player(Yyy);
      if (Plr <> nil) then
      begin
         Data.Add (Format ('%s%s) %s%s', [IIF ((Plr.InQuintetto), Chr($2022), ' '), Plr.PlayNumber, IIF ((Plr.Captain), '© ', ''), Plr.Name]));
         (*
         if (Plr.InGioco) then
            Tme := Format ('''%s', [Plr.TotalPlayingTimeStr])
         else
         begin
            if (Plr.TempoGiocoStr = '00:00') then
               Tme := 'n.e.'
            else
               Tme := Plr.TempoGiocoStr;
         end;
         if (Tme <> 'n.e.') then
         begin
            Data.Add (Tme);
            Data.Add (Format ('%d', [Plr.Punti]));
         end
         else
         begin
            Data.Add (Tme);
            Data.Add ('');
         end;
         *)
         //Data.Add (' ');
         Data.Add (Format ('%d', [Plr.Punti]));
         Data.Add (' ');
         if (Plr.TLTentati > 0) then
            Data.Add (Format ('%d/%d (%s%%)', [Plr.TLRealizz, Plr.TLTentati, Plr.TLPerc]))
         else
            Data.Add ('');
         if (Plr.T2Realizz > 0) then
            Data.Add (Format ('%d', [Plr.T2Realizz]))
         else
            Data.Add ('');
         if (Plr.T3Realizz > 0) then
            Data.Add (Format ('%d', [Plr.T3Realizz]))
         else
            Data.Add ('');
         if (Plr.TdcRealizz > 0) then
            Data.Add (Format ('%d', [Plr.TdcRealizz]))
         else
            Data.Add ('');
         Data.Add (Format ('%d', [Plr.FalliFatti]));
         Data.Add ('');
         Data.Add ('');
         Data.Add ('');
         Data.Add ('');
         Data.Add ('');
         Data.Add ('');
         Data.Add ('');
         Data.Add ('');
         Data.Add ('');
         if (BSDECfg.Excel_PIR.ValueAsBool) then
            Data.Add ('');
         if (BSDECfg.Excel_OER.ValueAsBool) then
            Data.Add ('');
         (* TOIMPLEMENT
         if (BSDECfg.Excel_VIR.ValueAsBool) then
            Data.Add ('');
         *)
         if (BSDECfg.Excel_PlusMinus.ValueAsBool) then
            Data.Add ('');
         Data.Add (Format ('%d', [Plr.PtiQ1]));
         Data.Add (Format ('%d', [Plr.PtiQ2]));
         Data.Add (Format ('%d', [Plr.PtiQ3]));
         Data.Add (Format ('%d', [Plr.PtiQ4]));
         Data.Add (Format ('%d', [Plr.PtiEt]));
      end;
      //
      for Xxx:=0 to (Data.Count-1) do
      begin
         if (Data[Xxx] <> '') then
         begin
            Cell := aView.CreateCell (Rrr, Xxx);
            Cell.SetText (Data[xxx]);
         end;
      end;
      //
   end;
   Rrr := ExcelInfos.OppoTeamFirstRow+CurrMatch.OppTeam.Roster.Count+1;
   //aView.CreateCell (Rrr,  1).SetText (Format ('''%s', [CurrMatch.OppTeam.TotTempoGiocoStr]));
   aView.CreateCell (Rrr,  1).SetText (Format ('%d', [CurrMatch.OppTeam.Punti]));
   if (CurrMatch.OppTeam.TLTentati > 0) then
      aView.CreateCell (Rrr,  3).SetText (Format (Str_TL+': %d/%d'+#13#10+'(%s%%)',  [CurrMatch.OppTeam.TLRealizz, CurrMatch.OppTeam.TLTentati, CurrMatch.OppTeam.TLPerc]));
   if (CurrMatch.OppTeam.T2Tentati > 0) then
      aView.CreateCell (Rrr,  4).SetText (Format (Str_T2+': %d/%d'+#13#10+'(%s%%)',  [CurrMatch.OppTeam.T2Realizz, CurrMatch.OppTeam.T2Tentati, CurrMatch.OppTeam.T2Perc]));
   if (CurrMatch.OppTeam.T3Tentati > 0) then
      aView.CreateCell (Rrr,  5).SetText (Format (Str_T3+': %d/%d'+#13#10+'(%s%%)',  [CurrMatch.OppTeam.T3Realizz, CurrMatch.OppTeam.T3Tentati, CurrMatch.OppTeam.T3Perc]));
   if (CurrMatch.OppTeam.TdcTentati > 0) then
      aView.CreateCell (Rrr,  6).SetText (Format (Str_Tdc+': %d/%d'+#13#10+'(%s%%)', [CurrMatch.OppTeam.TdcRealizz, CurrMatch.OppTeam.TdcTentati, CurrMatch.OppTeam.TdcPerc]));
   aView.CreateCell (Rrr,  7).SetText (Format ('%d', [CurrMatch.OppTeam.FalliFatti]));
   aView.CreateCell (Rrr,  9).SetText (Format ('%d', [CurrMatch.OppTeam.RimbDifesa]));
   aView.CreateCell (Rrr, 10).SetText (Format ('%d', [CurrMatch.OppTeam.RimbAttacco]));
   aView.CreateCell (Rrr, 11).SetText (Format ('%d', [CurrMatch.OppTeam.Rimbalzi]));
   aView.CreateCell (Rrr, 12).SetText (Format ('%d', [CurrMatch.OppTeam.PPerse]));
   aView.CreateCell (Rrr, 13).SetText (Format ('%d', [CurrMatch.OppTeam.PRecuperate]));
   (*
   aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+0).SetText (Format ('%d', [0]));
   aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+1).SetText (Format ('%d', [0]));
   aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+2).SetText (Format ('%d', [0]));
   aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+3).SetText (Format ('%d', [0]));
   aView.CreateCell (Rrr, ExcelInfos.PtQrtCol+4).SetText (Format ('%d', [0]));
   *)
   Data.Free;
end;


procedure TMainWind.Excel_Titoli (aView :TdxSpreadSheetTableView);
var
   Cell        :TdxSpreadSheetCell;
   Sss         :string;
   S1          :string;
   S2          :string;
   TotCols     :LongInt;
   Xxx         :LongInt;
   My          :LongInt;
   Oppo        :LongInt;
begin
   //
   Cell := aView.CreateCell (ExcelInfos.StartRow, 0);
    if (CurrMatch.Home) then
      Cell.SetText (Format ('%s - %s    %d - %d', [CurrMatch.MyTeam.Name, CurrMatch.OppTeam.Name, CurrMatch.MyTeam.Punti, CurrMatch.OppTeam.Punti]))
    else
      Cell.SetText (Format ('%s - %s    %d - %d', [CurrMatch.OppTeam.Name, CurrMatch.MyTeam.Name, CurrMatch.OppTeam.Punti, CurrMatch.MyTeam.Punti]));
    Cell.Style.Font.Name := 'Calibri';
    Cell.Style.Font.Style := [fsBold];
    Cell.Style.Font.Size := 24;
    Cell.Style.Font.Color := BSDECfg.ExcelColor_Title.ValueAsInteger;
    Cell.Style.AlignHorz := ssahLeft;
   Cell := aView.CreateCell (ExcelInfos.StartRow+1, 0);
    Cell.SetText (FormatDateTime ('d mmm yyyy', CurrMatch.PlayDate));
    Cell.Style.Font.Name := 'Calibri';
    Cell.Style.Font.Style := [fsBold, fsItalic];
    Cell.Style.Font.Size := 14;
    Cell.Style.Font.Color := BSDECfg.ExcelColor_Champ.ValueAsInteger;
    Cell.Style.AlignHorz := ssahLeft;
   Cell := aView.CreateCell (ExcelInfos.StartRow+1, 2);
    Cell.SetText (Format ('Stag %s,   Camp %s,   Fase %s (%s)', [CurrMatch.Season, CurrMatch.Champ, CurrMatch.Phase2, CurrMatch.Phase1]));
    Cell.Style.Font.Name := 'Calibri';
    Cell.Style.Font.Style := [fsBold, fsItalic];
    Cell.Style.Font.Size := 14;
    Cell.Style.Font.Color := BSDECfg.ExcelColor_Champ.ValueAsInteger;
    Cell.Style.AlignHorz := ssahLeft;
   Sss := '';
   if ((CurrMatch.Referee1 <> '') and (CurrMatch.Referee2 <> '')) then
      Sss := Format (Str_Arbitri, [CurrMatch.Referee1, CurrMatch.Referee2]);
   if ((CurrMatch.Referee1 <> '') and (CurrMatch.Referee2 = '')) then
      Sss := Format (Str_Arbitro, [CurrMatch.Referee1]);
   if ((CurrMatch.Referee1 = '') and (CurrMatch.Referee2 <> '')) then
      Sss := Format (Str_Arbitro, [CurrMatch.Referee2]);
   if (Sss <> '') then
   begin
      Cell := aView.CreateCell (ExcelInfos.StartRow, 11);
       Cell.SetText (Sss);
       Cell.Style.Font.Name := 'Calibri';
       Cell.Style.Font.Style := [];
       Cell.Style.Font.Size := 12;
       Cell.Style.Font.Color := clBlack;
       Cell.Style.AlignHorz := ssahLeft;
       Cell.Style.AlignVert := ssavCenter;
   end;
   Cell := aView.CreateCell (ExcelInfos.StartRow+2, 2);
    Cell.SetText (Str_Parziali);
    Cell.Style.Font.Name := 'Calibri';
    Cell.Style.Font.Style := [fsBold];
    Cell.Style.Font.Size := 12;
    Cell.Style.Font.Color := BSDECfg.ExcelColor_Parziali.ValueAsInteger;
    Cell.Style.AlignHorz := ssahRight;
    Cell.Style.AlignVert := ssavCenter;
   Cell := aView.CreateCell (ExcelInfos.StartRow+3, 2);
    Cell.SetText (Str_Progressivi);
    Cell.Style.Font.Name := 'Calibri';
    Cell.Style.Font.Style := [fsBold];
    Cell.Style.Font.Size := 12;
    Cell.Style.Font.Color := BSDECfg.ExcelColor_Parziali.ValueAsInteger;
    Cell.Style.AlignHorz := ssahRight;
    Cell.Style.AlignVert := ssavCenter;
   My := 0;
   Oppo := 0;
   for Xxx:=0 to 7 do
   begin
      if (Currmatch.MyTeam.Quarto[Xxx].Status <> qsNotPlayed) then
      begin
         My := My + Currmatch.MyTeam.Quarto[Xxx].Punti;
         Oppo := Oppo + Currmatch.OppTeam.Quarto[Xxx].Punti;
         if (CurrMatch.Home) then
         begin
            S1 := Format('%d-%d', [Currmatch.MyTeam.Quarto[Xxx].Punti, Currmatch.OppTeam.Quarto[Xxx].Punti]);
            S2 := Format('%d-%d', [My, Oppo]);
         end
         else
         begin
            S1 := Format('%d-%d', [Currmatch.OppTeam.Quarto[Xxx].Punti, Currmatch.MyTeam.Quarto[Xxx].Punti]);
            S2 := Format('%d-%d', [Oppo, My]);
         end;
         Cell := aView.CreateCell (ExcelInfos.StartRow+2, 3+xxx);
          Cell.Style.Font.Name := 'Calibri';
          Cell.Style.Font.Style := [fsBold];
          Cell.Style.Font.Size := 12;
          Cell.Style.Font.Color := BSDECfg.ExcelColor_Parziali.ValueAsInteger;
          Cell.Style.AlignHorz := ssahCenter;
          Cell.Style.AlignVert := ssavCenter;
          Cell.SetText (S1);
         Cell := aView.CreateCell (ExcelInfos.StartRow+3, 3+xxx);
          Cell.Style.Font.Name := 'Calibri';
          Cell.Style.Font.Style := [fsBold];
          Cell.Style.Font.Size := 12;
          Cell.Style.Font.Color := BSDECfg.ExcelColor_Parziali.ValueAsInteger;
          Cell.Style.AlignHorz := ssahCenter;
          Cell.Style.AlignVert := ssavCenter;
          Cell.SetText (S2);
      end;
   end;
   // Altezza riga titolo
   aView.Rows[ExcelInfos.StartRow].Size := 34;
   aView.Rows[ExcelInfos.StartRow+1].Size := 25;
   aView.Rows[ExcelInfos.StartRow+2].Size := 16;
   aView.Rows[ExcelInfos.StartRow+3].Size := 16;
end;


procedure TMainWind.CreaExcel;
var
   aView       :TdxSpreadSheetTableView;
   Cell        :TdxSpreadSheetCell;
   Bmp         :TBitmap;
   Xxx         :Longint;
   Yyy         :Longint;
begin
   aView := SSheet.ActiveSheetAsTable;
   aView.BeginUpdate;
   SSheet.BeginUpdate;
   try
      try
         ExcelInfos.MyTeamRows := CurrMatch.MyTeam.Roster.Count;
         if (CurrMatch.MyTeam.HeadCoach <> '') then
            ExcelInfos.MyTeamRows := ExcelInfos.MyTeamRows + 1;
         if (CurrMatch.MyTeam.Assistent1 <> '') then
            ExcelInfos.MyTeamRows := ExcelInfos.MyTeamRows + 1;
         //
         ExcelInfos.OppoTeamRows := CurrMatch.OppTeam.Roster.Count;
         if (CurrMatch.OppTeam.HeadCoach <> '') then
            ExcelInfos.OppoTeamRows := ExcelInfos.OppoTeamRows + 1;
         if (CurrMatch.OppTeam.Assistent1 <> '') then
            ExcelInfos.OppoTeamRows := ExcelInfos.OppoTeamRows + 1;
         //
         aView.ClearCells (Rect(0,0, 100,100));
         // Rendo uniformi tutte le righe
         for Yyy:=0 to ExcelInfos.LastRow do
         begin
            for Xxx:=0 to Pred(ExcelInfos.TotCols) do
            begin
               Cell := aView.CreateCell (Yyy, Xxx);
                Cell.Style.Font.Name := 'Calibri';
                Cell.Style.Font.Size := 8;
                Cell.Style.AlignVert := ssavCenter;
            end;
            Cell := aView.CreateCell (Yyy, 0);
             Cell.SetText (' ');
         end;
         Excel_Titoli (aView);
         Excel_StatMyTeam (aView);
         Excel_StatOppTeam (aView);
         Excel_Intestazioni (aView);
         Excel_IntestazioniOppo (aView);
         if (ChkMappaTiro.Checked) then
         begin
            Excel_MappaDiTiro (aView);
            for Xxx:=1 to 4 do
            begin
               if (CurrMatch.MyTeam.Quarto[Xxx-1].Status <> qsNotPlayed) then
               begin
                  //
                  Cell := aView.CreateCell (BSDECfg.Excel_MappaTiroInfo.ValueAsInteger, 7+((Xxx-1)*2));
                  Cell.Style.Font.Name := 'Calibri';
                  Cell.Style.Font.Size := 8;
                  Cell.SetText (Format('%dQ',[Xxx]));
                  Cell.Style.AlignHorz := ssahCenter;
                  //
                  Cell := aView.CreateCell (BSDECfg.Excel_MappaTiroInfo.ValueAsInteger, 7+((Xxx-1)*2)+1);
                  if (Xxx = 1) then
                     Cell.Style.Brush.BackgroundColor := BSDECfg.ShootColorQrt1Yes.ValueAsInteger;
                  if (Xxx = 2) then
                     Cell.Style.Brush.BackgroundColor := BSDECfg.ShootColorQrt2Yes.ValueAsInteger;
                  if (Xxx = 3) then
                     Cell.Style.Brush.BackgroundColor := BSDECfg.ShootColorQrt3Yes.ValueAsInteger;
                  if (Xxx = 4) then
                     Cell.Style.Brush.BackgroundColor := BSDECfg.ShootColorQrt4Yes.ValueAsInteger;
               end;
            end;
            for Xxx:=5 to 5 do
            begin
               if (CurrMatch.MyTeam.Quarto[Xxx-1].Status <> qsNotPlayed) then
               begin
                  //
                  Cell := aView.CreateCell (BSDECfg.Excel_MappaTiroInfo.ValueAsInteger, 7+((Xxx-1)*2));
                  Cell.Style.Font.Name := 'Calibri';
                  Cell.Style.Font.Size := 8;
                  Cell.SetText (Format('%dET',[Xxx-4]));
                  Cell.Style.AlignHorz := ssahCenter;
                  //
                  Cell := aView.CreateCell (BSDECfg.Excel_MappaTiroInfo.ValueAsInteger, 7+((Xxx-1)*2)+1);
                  Cell.Style.Brush.BackgroundColor := BSDECfg.ShootColorQrtExtraYes.ValueAsInteger;
               end;
            end;
         end
         else
         begin
            if (Img <> Nil) then
               FreeAndNil (Img);
            if (ImgCont <> Nil) then
               FreeAndNil (ImgCont);
         end;
         //
         Excel_ProgressoEventi (aView);
         //
         Excel_PageSettings (aView);
         aView.BottomRow := BSDECfg.Excel_MappaTiroInfo.ValueAsInteger;
         aView.MakeVisible (BSDECfg.Excel_MappaTiroInfo.ValueAsInteger, 1);
         aView.TopRow := 1;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMainWind.CreaExcel] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      aView.EndUpdate;
      SSheet.EndUpdate;
   end;
end;


function TMainWind.CreateExcelFileName: String;
var
   Fldr  :String;
   Fn    :string;
begin
   Fn := CurrMatch.GetLastExcelFile;
   if (FileExists (Fn)) then
   begin
      Fldr := AddSlash (ExtractFilePath (Fn));
      Fn := ExtractFileName (Fn);
   end
   else
   begin
      Fldr := AddSlash(CurrMatch.GetExcelExportFolder());
      Fn := CurrMatch.Title
   end;
   if (Pos ('.XLSX', Fn) < 1) then
      Fn := Fn+'.XLSX';
   Result := Format ('%s%s', [Fldr, Fn]);
end;


procedure TMainWind.BtnEsportaExcelNewClick(Sender: TObject);
var
   Fn    :string;
   Fldr  :string;
begin
   (*
   Fn := CreateExcelfileName;
   SaveDlg.DefaultExt := 'XLSX';
   SaveDlg.FilterIndex := 1;
   if ((Trim (LastExportFolder.ValueAsString) <> '') and (DirectoryExists (LastExportFolder.ValueAsString))) then
      SaveDlg.InitialDir := AddSlash(LastExportFolder.ValueAsString)
   else
      SaveDlg.InitialDir := AddSlash(CurrMatch.GetExcelExportFolder());
   SaveDlg.FileName := Fn;
   if (SaveDlg.Execute()) then
   begin
      SSheet.SaveToFile (SaveDlg.FileName);
      LastExportFolder.ValueAsString := ExtractFilePath (SaveDlg.FileName);
      LabExcelFName.Caption := SaveDlg.FileName;
   end;
   *)
   Fn := CreateExcelfileName;
   SaveDlg.DefaultExt := 'XLSX';
   SaveDlg.FilterIndex := 1;
   Fldr := ExtractFilePath (Fn);
   SaveDlg.InitialDir := Fldr;
   SaveDlg.FileName := Fn;
   if (SaveDlg.Execute()) then
   begin
      Fldr := ExtractFilePath (SaveDlg.FileName);
      if (not DirectoryExists (Fldr)) then
         ForceDirectories (Fldr);
      SSheet.SaveToFile (SaveDlg.FileName);
      LabExcelFName.Caption := SaveDlg.FileName;
      CurrMatch.SetLastExcelFile (SaveDlg.FileName);
   end;
end;


procedure TMainWind.BtnExcelOpenFileClick(Sender: TObject);
var
   Sss   :String;
begin
   Sss := LabExcelFName.Caption;
   if (FileExists (Sss)) then
      ShellExecute (GetDesktopWindow, 'open', PChar (Sss), nil, nil, SW_SHOWNORMAL)
   else
      MsgDlg (Str_FileNonTrovato, [Sss]);
end;


procedure TMainWind.BtnExcelOpenFolderClick(Sender: TObject);
var
   Sss   :String;
begin
   Sss := LabExcelFName.Caption;
   if (FileExists (Sss)) then
      ShellExecute (GetDesktopWindow, 'open', PChar (extractFilepath(Sss)), nil, nil, SW_SHOWNORMAL)
   else
      MsgDlg (Str_FileNonTrovato, [Sss]);
end;


procedure TMainWind.BtnImportFromOldClick(Sender: TObject);
var
   Fn :string;
begin
   LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_EnterMethod, 'TMainWind.BtnImportFromOldClick ()', []);
   try
      try
         if (YNDlg (Str_SureToImportOldFormat, []) <> mrYes) then
         begin
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Notify, '[TMainWind.BtnImportFromOldClick] Operation aborted by user', []);
            Exit;
         end;
         if (OpenDlg.Execute()) then
         begin
            Fn := OpenDlg.FileName;
            if (not FileExists (Fn)) then
               Exit;
            CurrMatch.ImportFromOldFormat (Fn);
            CurrMatch.SaveToDB (True);
            RefreshMatchInfos (CurrMatch);
            InternalEditMatch;
            RefreshMatchInfos (CurrMatch);
//            BtnEditRoster2Click(nil);
//            RefreshMatchInfos (CurrMatch);
         end;
      except
         on E:Exception do
         begin
            UpdateExceptionCounter;
            LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_Fatal, '[TMainWind.BtnImportFromOldClick] Exception "%s"', [E.Message]);
         end;
      end;
   finally
      LogSendWriteFmt (LogWriteUI_Yes, LogMsgType_ExitMethod, 'TMainWind.BtnImportFromOldClick', []);
   end;
end;


procedure TMainWind.Btn1Click(Sender: TObject);
begin
   BtnEsportaExcelNewClick(nil);
   BtnExcelOpenFileClick(nil);
end;


procedure TMainWind.ResetStartedTime;
begin
   FrmTime.ResetStartedTime;
end;

end.




