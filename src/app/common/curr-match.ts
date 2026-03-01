
import { signal,
   WritableSignal,
   computed } from '@angular/core';
import {matchStatusType,
   utils} from "./utils";
import {TimerCompComponent} from "./timer-comp/timer-comp.component";
import {CreateEmptyMatchHeader,
   IDSMatchHeader,
   TFallo,
   TMatchTeam} from "../models/datamod";
import {MatchheaderService} from "../services/matchheader.service";
import {MatchrosterService} from "../services/matchroster.service";
import {TeamService} from "../services/team.service";
import {firstValueFrom} from "rxjs";



export class TSavedMatch
{
   public lastTabIndex: number = -1;
   public lastMatchId: number = 0;
   public currSelectionType: string = "";
   public currSelectionId: number = 0;
   //
   public currMyTeamScore: number = 0;
   public currOppoTeamScore: number = 0;
   public currQuarter: number = 0;
   public currQuarterPlayed: number = 0;
   //
   public compTimer: TimerCompComponent | null = null;


   async LoadFromStorage(): Promise<boolean>
   {
      let result: boolean = false;
      const tmp: TSavedMatch | null = utils.GetFromSessionStorage<TSavedMatch>("BBS_SavedMatch");
      if (tmp != null)
      {
         this.currSelectionType = tmp.currSelectionType;
         this.currSelectionId = tmp.currSelectionId;
         this.lastMatchId = tmp.lastMatchId;
         this.lastTabIndex = tmp.lastTabIndex;
         this.currMyTeamScore = tmp.currMyTeamScore;
         this.currOppoTeamScore = tmp.currOppoTeamScore;
         this.currQuarter = tmp.currQuarter;
         this.currQuarterPlayed = tmp.currQuarterPlayed;
         result = true;
      }
      return result;
   }


   async SaveToStorage()
   {
      utils.SaveToSessionStorage("BBS_SavedMatch", this);
   }


   async GetTimeInSec(): Promise<number>
   {
      if (this.compTimer != null)
         return this.compTimer.CurrentTime();
      else
         return 0;
   }
}




export namespace matchGlobs
{
   export let currSavedMatch: TSavedMatch = new TSavedMatch();
   export let currMatch: TCurrMatch | null = null;
}






export class TCurrMatch
{
   // Campi Privati
   private fInternalExcelExportFolder: string = "";

   public matchHeader = signal<IDSMatchHeader>(CreateEmptyMatchHeader());
   public matchStatus = signal<matchStatusType.Status>(matchStatusType.notPlayed);
   public matchOpen = signal<boolean>(false);
   public season = signal<string>("");
   public myTeam = signal<TMatchTeam | null>(null);
   public oppTeam = signal<TMatchTeam | null>(null);


   public constructor (private servMatchHeader: MatchheaderService,
                       private servMatchRoster: MatchrosterService,
                       private servTeam: TeamService)
   {
      this.myTeam.set(new TMatchTeam(true));
      this.oppTeam.set(new TMatchTeam(false));
      this.matchStatus.set(matchStatusType.notPlayed);
      this.matchOpen.set(false);
   }


   public async SaveToStorage()
   {
      const dataToSave = {
         matchHeader: this.matchHeader(),
         matchStatus: this.matchStatus(),
         matchOpen: this.matchOpen(),
         season: this.season(),
         myTeam: this.myTeam() ? this.myTeam()!.SaveToJson() : null,
         oppTeam: this.oppTeam() ? this.oppTeam()!.SaveToJson() : null,
         fInternalExcelExportFolder: this.fInternalExcelExportFolder
      };
      utils.SaveToSessionStorage("BBS_CurrMatch", dataToSave);
   }


   public async LoadFromStorage()
   {
      try
      {
         const stored = sessionStorage.getItem ("BBS_CurrMatch");
         if (!stored)
            return;
         const data = JSON.parse (stored);
         if (data.matchHeader)
            this.matchHeader.set (data.matchHeader);
         if (data.matchStatus)
            this.matchStatus.set (data.matchStatus);
         if (data.matchOpen !== undefined)
            this.matchOpen.set (data.matchOpen);
         if (data.season)
            this.season.set (data.season);
         if (data.myTeam)
         {
            const team = new TMatchTeam (true);
            team.FromJson (data.myTeam);
            this.myTeam.set (team);
         }
         if (data.oppTeam)
         {
            const team = new TMatchTeam (false);
            team.FromJson (data.oppTeam);
            this.oppTeam.set (team);
         }
      }
      catch (error)
      {
         console.error("Errore nel caricamento dal storage:", error);
      }
   }


   public async ReadFromDB(aMatchHeaderId: number): Promise<void>
   {
      if (aMatchHeaderId > 0)
      {
         const theData = await firstValueFrom (this.servMatchHeader.getSingleData(aMatchHeaderId));
         if ((theData) && (theData.ok))
         {
            let jsonEvents: any = [];
            this.matchHeader.set(theData.elements);
            const strEvents: string = this.matchHeader().matchEventsFile;
            if (strEvents != "")
            {
               try
               {
                  jsonEvents = JSON.parse(strEvents);
               }
               catch (e)
               {
                  jsonEvents = [];
               }
            }
            if (jsonEvents.length > 0)
            {

            }
            this.matchOpen.set (true);
         }
      }
      /*
      const targetID = aID ?? this.RecID;
      if (targetID <= 0)
         return;

      // Utilizzo del DataModule globale (DMod) come nel codice originale
      const found = await globalThis.DMod?.TblMatchHeader?.Locate('ID', targetID);
      if (found)
      {
         this.RecID = targetID;
         const row = globalThis.DMod.TblMatchHeader;
         this.Title = row.Title.AsString;
         this.Home = row.IsHome.AsBoolean;
         this.PlayDate = row.PlayDate.AsDateTime;
         this.PlayNumber = row.PlayNumber.AsString;
         this.Referee1 = row.Referee1.AsString;
         this.Referee2 = row.Referee2.AsString;
         this.Location = row.Location.AsString;
         this.Day = row.MatchDay.AsString;
         this.Season = row.Season.AsString;
         this.Champ = row.Championship.AsString;
         this.Phase1 = row.Phase1.AsString;
         this.Phase2 = row.Phase2.AsString;
         this.MatchStatus = row.Status.AsInteger;

         // Carica i dati dei due team
         if (this.MyTeam) await this.MyTeam.ReadFromDB(row.LinkTeamMy.AsInteger, this.RecID);
         if (this.OppTeam) await this.OppTeam.ReadFromDB(row.LinkTeamOpp.AsInteger, this.RecID);
      }
      */
   }


   /**
    * Riempie i campi del database con i valori attuali della classe
    */
   public async FillDbFields(): Promise<boolean>
   {
      /*
      try {
         const row = globalThis.DMod?.TblMatchHeader;
         if (!row) return false;

         row.Title.AsString = this.Title;
         row.IsHome.AsBoolean = this.Home;
         row.PlayDate.AsDateTime = this.PlayDate;
         row.PlayNumber.AsString = this.PlayNumber;
         row.Referee1.AsString = this.Referee1;
         row.Referee2.AsString = this.Referee2;
         row.Location.AsString = this.Location;
         row.MatchDay.AsString = this.Day;
         row.Season.AsString = this.Season;
         row.Championship.AsString = this.Champ;
         row.Phase1.AsString = this.Phase1;
         row.Phase2.AsString = this.Phase2;
         row.Status.AsInteger = this.MatchStatus;

         return true;
      } catch (e) {
         return false;
      }
      */
      return true;
   }


   /**
    * Salva il match sul DB
    */
   public async SaveToDB(aFullSave: boolean): Promise<void>
   {
      /*
      const row = globalThis.DMod?.TblMatchHeader;
      if (!row) return;

      if (await row.Locate('ID', this.RecID)) {
         await row.Edit();
      } else {
         await row.Append();
      }

      if (await this.FillDbFields()) {
         await row.Post();
         this.RecID = row.ID.AsInteger;

         if (aFullSave) {
            if (this.MyTeam) await this.MyTeam.SaveToDB();
            if (this.OppTeam) await this.OppTeam.SaveToDB();
         }
      }
      */
   }


   public async SaveToStream(aStream: any): Promise<void>
   {
      /*
      // Implementazione sintetica della logica XML presente nel Pascal
      const root = aStream.Root; // Assumendo interfaccia stream compatibile
      root.WriteInteger('RecID', this.RecID);
      root.WriteString('Title', this.Title);
      if (this.MyTeam) await this.MyTeam.SaveToStream(aStream, root.AddNode('MyTeam'));
      if (this.OppTeam) await this.OppTeam.SaveToStream(aStream, root.AddNode('OppTeam'));
      */
   }


   public async LoadFromStream(aStream: any): Promise<void>
   {
      /*
      const root = aStream.Root;
      this.RecID = root.ReadInteger('RecID');
      this.Title = root.ReadString('Title');
      if (this.MyTeam) await this.MyTeam.LoadFromStream(aStream, root.FindNode('MyTeam'));
      if (this.OppTeam) await this.OppTeam.LoadFromStream(aStream, root.FindNode('OppTeam'));
      */
   }


   public async GetExcelExportFolder(): Promise<string>
   {
      if (this.fInternalExcelExportFolder === "")
      {
         return ""; //globalThis.BSDECfg?.Excel_ExportFolder?.ValueAsString || "./export";
      }
      return this.fInternalExcelExportFolder;
   }


   public async GetLastExcelFile(): Promise<string>
   {
      return this.matchHeader().exportedFile;
   }


   public async SetLastExcelFile(aFn: string): Promise<void>
   {
      /*
      if (globalThis.BSDECfg) {
         globalThis.BSDECfg.LastExcelFile = aFn;
      }
      */
   }


   public async SetInCampoFromDB(): Promise<void>
   {
      // Logica per aggiornare chi è attualmente in gioco leggendo i record temporanei
      // Pascal: DMod.TblMatchRoster.Locate(...)
   }


   /**
    * Cerca un record specifico
    */
   public async FindRecord(aID: number): Promise<number>
   {
      /*
      const found = await globalThis.DMod?.TblMatchHeader?.Locate('ID', aID);
      return found ? aID : -1;
      */
      return -1;
   }

   /**
    * Importazione da vecchio formato
    */
   public async ImportFromOldFormat(aFn: string): Promise<void>
   {
      // Logica di parsing file .txt o .dat del vecchio sistema
   }
}
