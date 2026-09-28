import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, catchError, switchMap} from 'rxjs';
import {MatchSyncService} from './match-sync.service';
import {
   TDSMatchRosterDb,
   TDSMatchRoster,
   TDSMatchRosterData
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
   // inject() e non parametro del costruttore: MatchSyncService a sua volta usa questo service
   private matchSync = inject(MatchSyncService);


   constructor (private http: HttpClient)
   {
   }


   // Le modifiche ancora in coda (es. fatte offline) prevalgono su quanto letto dal server/cache: roster
   // completo della partita (se ne è stato salvato uno) e nome visualizzato dei giocatori
   // (playername_lk = player.nomedisp)
   private async WithPendingWrites<T> (data: T,
                                       matchHeaderId: number | null = null): Promise<T>
   {
      const resp: any = data;
      if (!resp || !resp.elements)
         return data;
      const overlay = async (rows: any[]) =>
      {
         const pendingRoster = (matchHeaderId != null) ? await this.matchSync.PendingRoster(matchHeaderId) : undefined;
         const res = [...(pendingRoster ?? rows)];
         for (let i = 0; i < res.length; i++)
         {
            const nome = await this.matchSync.PendingPlayerName(Number(res[i].playerid_link));
            if (nome !== undefined)
               res[i] = { ...res[i], playername_lk: nome };
         }
         return res;
      };
      if (Array.isArray(resp.elements))
         return { ...resp, elements: await overlay(resp.elements) } as T;
      const [row] = await overlay([resp.elements]);
      return { ...resp, elements: row } as T;
   }


   getAllData (matchHeaderId: number | null): Observable<any>
   {
      const operation: string = "all";
      let qryTenant: string = "";
      if (matchHeaderId != null)
         qryTenant = `&match=${matchHeaderId}`;
      const url: string = `${this.apiUrl}?operation=${operation}` + qryTenant;
      return this.http.get<TDSMatchRosterData>(url).pipe (
         // offline, senza copia in cache (es. partita mai aperta prima): basta il roster salvato in coda
         catchError (async err =>
         {
            const pending = (matchHeaderId != null) ? await this.matchSync.PendingRoster(matchHeaderId) : undefined;
            if (!pending)
               throw err;
            return { ok: true, message: '', elements: [] } as any as TDSMatchRosterData;
         }),
         switchMap (resp => this.WithPendingWrites (resp, matchHeaderId)),
         tap (value => {  }),
         map ((dataFromDb) => {
                 return {
                    ok:         dataFromDb.ok,
                    message:    dataFromDb.message,
                    elements:   dataFromDb.elements.map (dbElement => {
                                                            const dbElm: TDSMatchRosterDb = (dbElement as TDSMatchRosterDb);
                                                            const mhElem: TDSMatchRoster = this.MatchRosterFromDb (dbElm);
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
      return this.http.get<any> (url).pipe (switchMap (resp => this.WithPendingWrites (resp)));
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


   MatchRosterFromDb (dnElem: TDSMatchRosterDb): TDSMatchRoster
   {
      const result: TDSMatchRoster = {
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


   MatchRosterToDb (mh: TDSMatchRoster): TDSMatchRosterDb
   {
      const result: TDSMatchRosterDb = {
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
