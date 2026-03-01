import {map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
   IDSSeason
} from "../models/datamod";



@Injectable ({
                providedIn: 'root'
             })
export class SeasonsService
{
   private apiUrl = 'https://www.basketsarezzo.com/code/backend/bbs/api_seasons.php';

   constructor (private http: HttpClient)
   {
   }


   getAllData (tenant: number | null): Observable<any>
   {
      const operation: string = "all";
      let qryTenant: string = "";
      if (tenant != null)
         qryTenant = `&tenant=${tenant}`;
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
               aTenantId: number): Observable<any>
   {
      const operation: string = "edit";
      const url: string = `${this.apiUrl}?operation=${operation}&id=${aId}&nome=${aName}&abbrev=${aAbbrev}&tenantid_link=${aTenantId}`;
      return this.http.get<any> (url);
   }


   addNewData (aName: string,
               aAbbrev: string,
               aTenantId: number): Observable<any>
   {
      const operation: string = "add";
      const url: string = `${this.apiUrl}?operation=${operation}&nome=${aName}&abbrev=${aAbbrev}&tenantid_link=${aTenantId}`;
      return this.http.get<any> (url);
   }


   DeleteData (aId: number): Observable<any>
   {
      const operation: string = "delete";
      const url: string = `${this.apiUrl}?operation=${operation}&id=${aId}`;
      return this.http.get<any> (url);
   }

}
