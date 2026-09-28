import {map} from 'rxjs/operators';
import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, catchError, switchMap} from 'rxjs';
import {MatchSyncService} from './match-sync.service';
import {
   IDSTeam
} from "../models/datamod";



@Injectable({
  providedIn: 'root'
})
export class PlayerService
{
   private apiUrl = 'https://www.basketsarezzo.com/code/backend/bbs/api_player.php';
   // inject() e non parametro del costruttore: MatchSyncService a sua volta usa questo service
   private matchSync = inject(MatchSyncService);

   constructor (private http: HttpClient)
   {
   }


   // Il nome visualizzato ancora in coda (es. modificato offline da "Modifica Numeri/Nomi") prevale su
   // quanto letto dal server/cache
   private async WithPendingWrites (resp: any): Promise<any>
   {
      if (!resp || !resp.elements)
         return resp;
      const overlay = async (row: any) =>
      {
         const nome = await this.matchSync.PendingPlayerName(Number(row?.id));
         return (nome !== undefined) ? { ...row, nomedisp: nome } : row;
      };
      if (Array.isArray(resp.elements))
         return { ...resp, elements: await Promise.all(resp.elements.map(overlay)) };
      return { ...resp, elements: await overlay(resp.elements) };
   }


   getAllData (champ: number | null): Observable<any>
   {
      const operation: string = "all";
      let qryTenant: string = "";
      if (champ != null)
         qryTenant = `&team=${champ}`;
      const url: string = `${this.apiUrl}?operation=${operation}` + qryTenant;
      return this.http.get<any>(url).pipe (
         // offline senza copia in cache: almeno i giocatori creati localmente
         catchError (async err =>
         {
            if ((champ == null) || ((await this.matchSync.PendingCreated('createplayer', champ)).length === 0))
               throw err;
            return { ok: true, message: '', elements: [] };
         }),
         switchMap (async resp =>
         {
            resp = await this.WithPendingWrites (resp);
            // giocatori creati localmente (in palestra) e non ancora arrivati al server, con l'id provvisorio
            if ((champ != null) && resp && Array.isArray(resp.elements))
               resp = { ...resp, elements: [...resp.elements, ...await this.matchSync.PendingCreated('createplayer', champ)] };
            return resp;
         }));
   }


   getSingleData (aId: number): Observable<any>
   {
      const operation: string = "single";
      const url: string = `${this.apiUrl}?operation=${operation}&id=${aId}`;
      return this.http.get<any> (url).pipe (switchMap (resp => this.WithPendingWrites (resp)));
   }


   updateData (aId: number,
               aCognome: string,
               aName: string,
               aNomeDisp: string,
               aAnno: number,
               aRuolo: string,
               aNumero: string,
               aAltezza: number,
               aFoto: string,
               aTeamId: number): Observable<any>
   {
      const operation: string = "edit";
      const url: string = `${this.apiUrl}?operation=${operation}`+
         `&id=${aId}`+
         `&cognome=${aCognome}`+
         `&nome=${aName}`+
         `&nomedisp=${aNomeDisp}`+
         `&teamid_link=${aTeamId}`+
         `&ruolo=${aRuolo}`+
         `&numero=${aNumero}`+
         `&altezza=${aAltezza}`+
         `&foto=${aFoto}`+
         `&anno=${aAnno}`;
      console.log(url);
      return this.http.get<any> (url);
   }


   addNewData (aCognome: string,
               aName: string,
               aNomeDisp: string,
               aAnno: number,
               aRuolo: string,
               aNumero: string,
               aAltezza: number,
               aFoto: string,
               aTeamId: number): Observable<any>
   {
      const operation: string = "add";
      const url: string = `${this.apiUrl}?operation=${operation}`+
         `&cognome=${aCognome}`+
         `&nome=${aName}`+
         `&nomedisp=${aNomeDisp}`+
         `&teamid_link=${aTeamId}`+
         `&ruolo=${aRuolo}`+
         `&numero=${aNumero}`+
         `&altezza=${aAltezza}`+
         `&foto=${aFoto}`+
         `&anno=${aAnno}`;
      return this.http.get<any> (url);
   }


   DeleteData (aId: number): Observable<any>
   {
      const operation: string = "delete";
      const url: string = `${this.apiUrl}?operation=${operation}&id=${aId}`;
      return this.http.get<any> (url);
   }

}
