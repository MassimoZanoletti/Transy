import {map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
   Champ
} from "../models/datamod";



@Injectable({
  providedIn: 'root'
})
export class CampionatiService
{
   private apiUrl = 'https://www.basketsarezzo.com/code/backend/bbs/api_champs.php';

   constructor (private http: HttpClient)
   {
   }


   getAllData (season: number | null): Observable<any>
   {
      const operation: string = "all";
      let qryTenant: string = "";
      if (season != null)
         qryTenant = `&season=${season}`;
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
               aName: string,
               aAbbrev: string,
               aSeasonId: number): Observable<any>
   {
      const operation: string = "edit";
      const url: string = `${this.apiUrl}?operation=${operation}&id=${aId}&nome=${aName}&abbrev=${aAbbrev}&seasonid_link=${aSeasonId}`;
      return this.http.get<any> (url);
   }


   addNewData (aName: string,
               aAbbrev: string,
               aSeasonId: number): Observable<any>
   {
      const operation: string = "add";
      const url: string = `${this.apiUrl}?operation=${operation}&nome=${aName}&abbrev=${aAbbrev}&seasonid_link=${aSeasonId}`;
      return this.http.get<any> (url);
   }


   DeleteData (aId: number): Observable<any>
   {
      const operation: string = "delete";
      const url: string = `${this.apiUrl}?operation=${operation}&id=${aId}`;
      return this.http.get<any> (url);
   }

}
