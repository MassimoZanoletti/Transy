import {map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
   IDSTeam
} from "../models/datamod";



@Injectable({
  providedIn: 'root'
})
export class PlayerService
{
   private apiUrl = 'https://www.basketsarezzo.com/code/backend/bbs/api_player.php';

   constructor (private http: HttpClient)
   {
   }


   getAllData (champ: number | null): Observable<any>
   {
      const operation: string = "all";
      let qryTenant: string = "";
      if (champ != null)
         qryTenant = `&team=${champ}`;
      const url: string = `${this.apiUrl}?operation=${operation}` + qryTenant;
      return this.http.get<any>(url);
   }


   getSingleData (aId: number): Observable<any>
   {
      const operation: string = "single";
      const url: string = `${this.apiUrl}?operation=${operation}&id=${aId}`;
      return this.http.get<any> (url);
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
