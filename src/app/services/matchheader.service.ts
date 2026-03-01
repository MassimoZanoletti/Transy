import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
   IDSMatchHeaderDb,
   IDSMatchHeader, IDSMatchHeadersData
} from "../models/datamod";
import { map,
   tap } from "rxjs/operators";
import { utils,
      matchStatusType,
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
      return this.http.get<IDSMatchHeadersData>(url).pipe (
         tap (value => {  }),
         map ((dataFromDb) => {
            return {
               ok:         dataFromDb.ok,
               message:    dataFromDb.message,
               elements:   dataFromDb.elements.map (dbElement => {
                     const dbElm: IDSMatchHeaderDb = (dbElement as IDSMatchHeaderDb);
                     const mhElem: IDSMatchHeader = this.MatchHeaderFromDb (dbElm);
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
               aJsonStr: string): Observable<any>
   {
      const operation: string = "edit";
      const encodedJsonData = encodeURIComponent(aJsonStr);
      const url: string = `${this.apiUrl}?operation=${operation}&id=${aId}&data=${encodedJsonData}`;
      return this.http.get<any> (url);
   }


   addNewData (aJsonStr: string): Observable<any>
   {
      const operation: string = "add";
      const encodedJsonData = encodeURIComponent(aJsonStr);
      const url: string = `${this.apiUrl}?operation=${operation}&data=${encodedJsonData}`;
      return this.http.get<any> (url);
   }


   DeleteData (aId: number): Observable<any>
   {
      const operation: string = "delete";
      const url: string = `${this.apiUrl}?operation=${operation}&id=${aId}`;
      return this.http.get<any> (url);
   }


   MatchHeaderFromDb (dnElem: IDSMatchHeaderDb): IDSMatchHeader
   {
      const dateOptions: Intl.DateTimeFormatOptions = {
         day: '2-digit',      // Garantisce 01, 02, ..., 31
         month: '2-digit',    // Garantisce 01, 02, ..., 12
         year: 'numeric'      // Garantisce 2025
      };
      const dt: Date = new Date (dnElem.matchdate);
      let st: string = dnElem.matchstatus;
      if (st === "")
         st = matchStatusType.notPlayed.code;
      let mt: string = dnElem.myteamtimeout;
      if (mt.length < 9)
         mt = timeouts.timeoutAll;
      let ot: string = dnElem.myteamtimeout;
      if (ot.length < 9)
         ot = timeouts.timeoutAll;
      let at: boolean = false;
      if (Number(dnElem.athome) != 0)
         at = true;
      else
         at = false;
      const result: IDSMatchHeader = {
         id: Number(dnElem.id),
         title: dnElem.title,
         matchNumber: Number(dnElem.matchnumber),
         matchDate: dt,
         matchDateStr: dt.toLocaleDateString("default", dateOptions),
         atHome: at,
         giornata: dnElem.giornata,
         location: dnElem.location,
         arbitro1: dnElem.arbitro1,
         arbitro2: dnElem.arbitro2,
         matchStatus: st,
         matchEventsFile: dnElem.matcheventsfile,
         matchDataFile: dnElem.matchdatafile,
         exportedFile: dnElem.exportedfile,
         phaseId_link: Number(dnElem.phaseid_link),
         phaseNome_lk: dnElem.phasenome_lk,
         phaseAbbrev_lk: dnElem.phaseabbrev_lk,
         champId_lk:        dnElem.champid_lk,
         champNome_lk:      dnElem.champnome_lk,
         myTeamId_link :    Number(dnElem.myteamid_link),
         myTeamNome_lk :    dnElem.myteamnome_lk,
         myTeamAbbrev_lk:   dnElem.myteamabbrev_lk,
         myTeamDelta:       Number(dnElem.myteamdelta),
         myTeamColor :      dnElem.myteamcolor,
         myTeamTimeout:     mt,
         myTeamInCampo:     dnElem.myteamincampo,
         myTeamPoints:      Number(dnElem.myteampoints),
         myCoach1Id_link :  Number(dnElem.mycoach1id_link),
         myCoach2Id_link :  Number(dnElem.mycoach2id_link),
         oppoTeamId_link :  Number(dnElem.oppoteamid_link),
         oppoTeamNome_lk :  dnElem.oppoteamnome_lk,
         oppoTeamAbbrev_lk: dnElem.oppoteamabbrev_lk,
         oppoTeamDelta:     Number(dnElem.oppoteamdelta),
         oppoTeamColor :    dnElem.oppoteamcolor,
         oppoTeamTimeout:   ot,
         oppoTeamInCampo:   dnElem.oppoteamincampo,
         oppoTeamPoints:    Number(dnElem.oppoteampoints),
         oppoCoach1Id_link: Number(dnElem.oppocoach1id_link),
         oppoCoach2Id_link: Number(dnElem.oppocoach2id_link)
      };
      return result;
   }


   MatchHeaderToDb (mh: IDSMatchHeader): IDSMatchHeaderDb
   {
      const parts = mh.matchDateStr.split('/');
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      mh.matchDate = new Date(year, month - 1, day);
      const dbDateStr: string = `${mh.matchDate.getFullYear()}-${String(mh.matchDate.getMonth()+1).padStart(2, '0')}-${String(mh.matchDate.getDate()).padStart(2, '0')}`;
      const result: IDSMatchHeaderDb = {
         id: Number(mh.id),
         phaseid_link: Number(mh.phaseId_link),
         myteamid_link: Number(mh.myTeamId_link),
         oppoteamid_link: Number(mh.oppoTeamId_link),
         title: mh.title,
         matchnumber: Number(mh.matchNumber),
         matchdate: dbDateStr,
         athome: Boolean(mh.atHome),
         arbitro1: mh.arbitro1,
         arbitro2: mh.arbitro2,
         mycoach1id_link: Number(mh.myCoach1Id_link),
         mycoach2id_link: Number(mh.myCoach2Id_link),
         oppocoach1id_link: Number(mh.oppoCoach1Id_link),
         oppocoach2id_link: Number(mh.oppoCoach2Id_link),
         myteamdelta: Number(mh.myTeamDelta),
         oppoteamdelta: Number(mh.oppoTeamDelta),
         myteamcolor: mh.myTeamColor,
         oppoteamcolor: mh.oppoTeamColor,
         location: mh.location,
         giornata: mh.giornata,
         myteamtimeout: mh.myTeamTimeout,
         oppoteamtimeout: mh.oppoTeamTimeout,
         matchstatus: mh.matchStatus,
         matcheventsfile: mh.matchEventsFile,
         matchdatafile: mh.matchDataFile,
         myteamincampo: mh.myTeamInCampo,
         oppoteamincampo: mh.oppoTeamInCampo,
         myteampoints: Number(mh.myTeamPoints),
         oppoteampoints: Number(mh.oppoTeamPoints),
         exportedfile: mh.exportedFile,
         champnome_lk: mh.champNome_lk,
         myteamnome_lk: mh.myTeamNome_lk,
         oppoteamnome_lk: mh.oppoTeamNome_lk,
         phasenome_lk: mh.phaseNome_lk,
         champid_lk: mh.champId_lk,
         myteamabbrev_lk: mh.myTeamAbbrev_lk,
         oppoteamabbrev_lk: mh.oppoTeamAbbrev_lk,
         phaseabbrev_lk: mh.phaseAbbrev_lk
      };
      return result;
   }

}
