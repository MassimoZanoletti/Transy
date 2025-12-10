import {map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
   Team,
   Coach
} from "../models/datamod";



@Injectable({
  providedIn: 'root'
})
export class CoachService
{
   private apiUrl = 'https://www.basketsarezzo.com/code/backend/bbs/api_coach.php';

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
