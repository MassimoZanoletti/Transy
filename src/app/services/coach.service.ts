import {map} from 'rxjs/operators';
import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, catchError, switchMap} from 'rxjs';
import {
   IDSTeam,
   TDSCoach
} from "../models/datamod";
import {MatchSyncService} from './match-sync.service';



@Injectable({
  providedIn: 'root'
})
export class CoachService
{
   private apiUrl = 'https://www.basketsarezzo.com/code/backend/bbs/api_coach.php';
   // inject() e non parametro del costruttore: MatchSyncService a sua volta usa questo service
   private matchSync = inject(MatchSyncService);

   constructor (private http: HttpClient)
   {
   }


   getAllData (team: number | null): Observable<any>
   {
      const operation: string = "all";
      let qryTenant: string = "";
      if (team != null)
         qryTenant = `&team=${team}`;
      const url: string = `${this.apiUrl}?operation=${operation}` + qryTenant;
      return this.http.get<any>(url).pipe (
         // offline senza copia in cache: almeno gli allenatori creati localmente
         catchError (async err =>
         {
            if ((team == null) || ((await this.matchSync.PendingCreated('createcoach', team)).length === 0))
               throw err;
            return { ok: true, message: '', elements: [] };
         }),
         switchMap (async resp =>
         {
            // allenatori creati localmente (in palestra) e non ancora arrivati al server, con l'id provvisorio
            if ((team != null) && resp && Array.isArray(resp.elements))
               resp = { ...resp, elements: [...resp.elements, ...await this.matchSync.PendingCreated('createcoach', team)] };
            return resp;
         }));
   }


   getSingleData (aId: number): Observable<any>
   {
      const operation: string = "single";
      const url: string = `${this.apiUrl}?operation=${operation}&id=${aId}`;
      return this.http.get<any> (url);
   }


   updateData (aId: number,
               aName: string,
               aTeamId: number): Observable<any>
   {
      const operation: string = "edit";
      const url: string = `${this.apiUrl}?operation=${operation}`+
         `&id=${aId}`+
         `&nome=${aName}`+
         `&teamid_link=${aTeamId}`;
      console.log(url);
      return this.http.get<any> (url);
   }


   addNewData (aName: string,
               aTeamId: number): Observable<any>
   {
      const operation: string = "add";
      const url: string = `${this.apiUrl}?operation=${operation}`+
         `&nome=${aName}`+
         `&teamid_link=${aTeamId}`;
      return this.http.get<any> (url);
   }


   AddOrEdit (aName: string,
              aTeamId: number): Observable<any>
   {
      const operation: string = "addoredit";
      const url: string = `${this.apiUrl}?operation=${operation}`+
         `&nome=${aName}`+
         `&teamid_link=${aTeamId}`;
      return this.http.get<any> (url);
   }


   DeleteData (aId: number): Observable<any>
   {
      const operation: string = "delete";
      const url: string = `${this.apiUrl}?operation=${operation}&id=${aId}`;
      return this.http.get<any> (url);
   }

}
