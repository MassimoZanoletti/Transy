import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
   MatchHeaderDb,
   MatchHeader, MatchHeadersData
} from "../models/datamod";
import { map,
   tap } from "rxjs/operators";
import { utils,
      jobStatusType,
      timeouts } from "../common/utils";



@Injectable({
  providedIn: 'root'
})
export class MatchheaderService
{
   private apiUrl = 'https://www.basketsarezzo.com/code/backend/bbs/api_matchheader.php';


   constructor (private http: HttpClient)
   {
   }


   getAllData (phase: number | null): Observable<any>
   {
      const operation: string = "all";
      let qryTenant: string = "";
      if (phase != null)
         qryTenant = `&phase=${phase}`;
      const url: string = `${this.apiUrl}?operation=${operation}` + qryTenant;
      return this.http.get<MatchHeadersData>(url).pipe (
         tap (value => {  }),
         map ((dataFromDb) => {
            return {
               ok:         dataFromDb.ok,
               message:    dataFromDb.message,
               elements:   dataFromDb.elements.map (dbElement => {
                     const dbElm: MatchHeaderDb = (dbElement as MatchHeaderDb);
                     const mhElem: MatchHeader = this.MatchHeaderFromDb (dbElm);
                     return mhElem;
                  } // map internal
               ) // map internal
               } // return
              } // map
         ) // map
      ); // pipe
   }


   getSingleData (aId: number): Observable<any>
   {
      const operation: string = "single";
      const url: string = `${this.apiUrl}?operation=${operation}&id=${aId}`;
      return this.http.get<any> (url);
   }


   updateData (aId: number,
               aName: string,
               aAbbrev: string,
               aExportFolder: string,
               aChampId: number): Observable<any>
   {
      const operation: string = "edit";
      const url: string = `${this.apiUrl}?operation=${operation}&id=${aId}&nome=${aName}&abbrev=${aAbbrev}&champid_link=${aChampId}&exportfolder=${aExportFolder}`;
      return this.http.get<any> (url);
   }


   addNewData (aName: string,
               aAbbrev: string,
               aExportFolder: string,
               aChampId: number): Observable<any>
   {
      const operation: string = "add";
      const url: string = `${this.apiUrl}?operation=${operation}&nome=${aName}&abbrev=${aAbbrev}&champid_link=${aChampId}&exportfolder=${aExportFolder}`;
      return this.http.get<any> (url);
   }


   DeleteData (aId: number): Observable<any>
   {
      const operation: string = "delete";
      const url: string = `${this.apiUrl}?operation=${operation}&id=${aId}`;
      return this.http.get<any> (url);
   }


   MatchHeaderFromDb (dnElem: MatchHeaderDb): MatchHeader
   {
      const dateOptions: Intl.DateTimeFormatOptions = {
         day: '2-digit',      // Garantisce 01, 02, ..., 31
         month: '2-digit',    // Garantisce 01, 02, ..., 12
         year: 'numeric'      // Garantisce 2025
      };
      const dt: Date = new Date (dnElem.matchdate);
      let st: string = dnElem.matchstatus;
      if (st === "")
         st = jobStatusType.notPlayed;
      let mt: string = dnElem.myteamtimeout;
      if (mt.length < 9)
         mt = timeouts.timeoutAll;
      let ot: string = dnElem.myteamtimeout;
      if (ot.length < 9)
         ot = timeouts.timeoutAll;
      const result: MatchHeader = {
         id: dnElem.id,
         title: dnElem.title,
         matchNumber: dnElem.matchnumber,
         matchDate: dt,
         matchDateStr: dt.toLocaleDateString("default", dateOptions),
         atHome: dnElem.athome,
         giornata: dnElem.giornata,
         location: dnElem.location,
         arbitro1: dnElem.arbitro1,
         arbitro2: dnElem.arbitro2,
         matchStatus: st,
         matchEventsFile: dnElem.matcheventsfile,
         matchDataFile: dnElem.matchdatafile,
         exportedFile: dnElem.exportedfile,
         phaseId_link: dnElem.phaseid_link,
         phaseNome_lk: dnElem.phasenome_lk,
         phaseAbbrev_lk: dnElem.phaseabbrev_lk,
         champId_lk: dnElem.champid_lk,
         champNome_lk: dnElem.champnome_lk,
         myTeamId_link : dnElem.myteamid_link,
         myTeamNome_lk : dnElem.myteamnome_lk,
         myTeamAbbrev_lk: dnElem.myteamabbrev_lk,
         myTeamDelta: dnElem.myteamdelta,
         myTeamColor : dnElem.myteamcolor,
         myTeamTimeout: mt,
         myTeamInCampo: dnElem.myteamincampo,
         myTeamPoints: dnElem.myteampoints,
         myCoach1Iid_link : dnElem.mycoach1id_link,
         myCoach2Id_link : dnElem.mycoach2id_link,
         oppoTeamId_link : dnElem.oppoteamid_link,
         oppoTeamNome_lk : dnElem.oppoteamnome_lk,
         oppoTeamAbbrev_lk: dnElem.oppoteamabbrev_lk,
         oppoTeamDelta: dnElem.oppoteamdelta,
         oppoTeamColor : dnElem.oppoteamcolor,
         oppoTeamTimeout: ot,
         oppoTeamInCampo: dnElem.oppoteamincampo,
         oppoTeamPoints: dnElem.oppoteampoints,
         oppoCoach1Id_link: dnElem.oppocoach1id_link,
         oppoCoach2Id_link: dnElem.oppocoach2id_link
      };
      return result;
   }

}
