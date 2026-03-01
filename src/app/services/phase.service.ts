import {map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
   IDSPhase
} from "../models/datamod";



@Injectable({
  providedIn: 'root'
})
export class PhaseService
{
   private apiUrl = 'https://www.basketsarezzo.com/code/backend/bbs/api_phase.php';

   constructor (private http: HttpClient)
   {
   }


   getAllData (champ: number | null): Observable<any>
   {
      const operation: string = "all";
      let qryTenant: string = "";
      if (champ != null)
         qryTenant = `&champ=${champ}`;
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

}
