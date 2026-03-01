import {map, tap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
   CreateEmptyMatchHeader,
   IDSTeam, IDSMatchHeader, IDSMatchHeaderDb, IDSMatchHeadersData
} from "../models/datamod";



@Injectable({
  providedIn: 'root'
})
export class TeamService
{
   private apiUrl = 'https://www.basketsarezzo.com/code/backend/bbs/api_team.php';

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
      //return this.http.get<any>(url);
      return this.http.get<any>(url).pipe (
         tap (value => {  }),
         map ((dataFromDb) => {
                 return {
                    ok:         dataFromDb.ok,
                    message:    dataFromDb.message,
                    elements:   dataFromDb.elements.map ((dbElement: any) => {
                                                            const tmElem: IDSTeam = { type: "iteam", id: dbElement.id, abbrev: dbElement.abbrev, logo: dbElement.logo, nome: dbElement.nome, champid_link: dbElement.champid_link };
                                                            return tmElem;
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
               aName: string,
               aAbbrev: string,
               aLogo: string,
               aChampId: number): Observable<any>
   {
      const operation: string = "edit";
      const url: string = `${this.apiUrl}?operation=${operation}&id=${aId}&nome=${aName}&abbrev=${aAbbrev}&champid_link=${aChampId}&logo=${aLogo}`;
      return this.http.get<any> (url);
   }


   addNewData (aName: string,
               aAbbrev: string,
               aLogo: string,
               aChampId: number): Observable<any>
   {
      const operation: string = "add";
      const url: string = `${this.apiUrl}?operation=${operation}&nome=${aName}&abbrev=${aAbbrev}&champid_link=${aChampId}&logo=${aLogo}`;
      return this.http.get<any> (url);
   }


   DeleteData (aId: number): Observable<any>
   {
      const operation: string = "delete";
      const url: string = `${this.apiUrl}?operation=${operation}&id=${aId}`;
      return this.http.get<any> (url);
   }

}
