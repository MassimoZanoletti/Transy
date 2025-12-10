import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
   MatchRosterDb,
   MatchRoster,
   MatchRosterData
} from "../models/datamod";
import { map,
   tap } from "rxjs/operators";
import { utils,
   matchStatusType,
   timeouts } from "../common/utils";



@Injectable({
  providedIn: 'root'
})
export class MatchrosterService
{
   private apiUrl = 'https://www.basketsarezzo.com/code/backend/bbs/api_matchroster.php';


   constructor (private http: HttpClient)
   {
   }


   getAllData (matchHeaderId: number | null): Observable<any>
   {
      const operation: string = "all";
      let qryTenant: string = "";
      if (matchHeaderId != null)
         qryTenant = `&match=${matchHeaderId}`;
      const url: string = `${this.apiUrl}?operation=${operation}` + qryTenant;
      return this.http.get<MatchRosterData>(url).pipe (
         tap (value => {  }),
         map ((dataFromDb) => {
                 return {
                    ok:         dataFromDb.ok,
                    message:    dataFromDb.message,
                    elements:   dataFromDb.elements.map (dbElement => {
                                                            const dbElm: MatchRosterDb = (dbElement as MatchRosterDb);
                                                            const mhElem: MatchRoster = this.MatchRosterFromDb (dbElm);
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


   DeleteAllMatchRoster (aMatchHeaderId: number): Observable<any>
   {
      const operation: string = "deleteroster";
      const url: string = `${this.apiUrl}?operation=${operation}&matchheaderid=${aMatchHeaderId}`;
      return this.http.get<any> (url);
   }


   DeleteAllMatchTeamRoster (aMatchHeaderId: number,
                             aIsMyTeam: boolean): Observable<any>
   {
      const operation: string = "deleteroster";
      const url: string = `${this.apiUrl}?operation=${operation}&matchheaderid=${aMatchHeaderId}&myteam=${aIsMyTeam}`;
      return this.http.get<any> (url);
   }


   MatchRosterFromDb (dnElem: MatchRosterDb): MatchRoster
   {
      const result: MatchRoster = {
         id: Number(dnElem.id),
         matchHeaderId_link: Number(dnElem.matchheaderid_link),
         playerId_link: Number(dnElem.playerid_link),
         playNumber: dnElem.playnumber,
         capitano: (String(dnElem.capitano)=='1')?true:false,
         isMyTeam: (String(dnElem.ismyteam)=='1')?true:false,
         quintetto: (String(dnElem.quintetto)=='1')?true:false,
         dbgMatch: dnElem.dbgmatch,
         dbgPlayer: dnElem.dbgplayer,
         type: dnElem.type,
         playerName_lk: dnElem.playername_lk,
         matchRosterIndex: ""
      };
      return result;
   }


   MatchRosterToDb (mh: MatchRoster): MatchRosterDb
   {
      const result: MatchRosterDb = {
         id: Number(mh.id),
         matchheaderid_link: Number(mh.matchHeaderId_link),
         playerid_link: Number(mh.playerId_link),
         playnumber: mh.playNumber,
         capitano: Boolean(mh.capitano),
         ismyteam: Boolean(mh.isMyTeam),
         quintetto: Boolean(mh.quintetto),
         dbgmatch: mh.dbgMatch,
         dbgplayer: mh.dbgPlayer,
         type: mh.type,
         playername_lk: ""
      };
      return result;
   }

}
