
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IDSUser } from '../models/datamod';



export let loggedUser: IDSUser = {
   id: 0,
   nome: "",
   password: "",
   ruolo: "",
   ruolo_id: 0,
   attributo: 0
}


export function InitLoggedUser()
{
   loggedUser = {
      id: 0,
      nome: "",
      password: "",
      ruolo_id: 0,
      ruolo: "",
      attributo: 0
   };
}

@Injectable({
               providedIn: 'root'
            })
export class UserService
{
   private apiUrl = 'https://www.basketsarezzo.com/code/backend/bbs/api_users.php'; // Assicurati che questo sia corretto

   constructor(private http: HttpClient)
   {
   }


   getAllData(): Observable<any>
   {
      const operation: string = "all";
      const url: string = `${this.apiUrl}?operation=${operation}`;
      return this.http.get<any>(url);
   }


   getSingleData(aId: number): Observable<any>
   {
      const operation: string = "single";
      const url: string = `${this.apiUrl}?operation=${operation}&id=${aId}`;
      return this.http.get<any>(url);
   }


   // api_users.php legge ruolo_desc e ruolo_attrib: se mancano, l'UPDATE li scrive a NULL
   updateData (aId: number,
               aName: string,
               aPassword: string,
               aRuoloDesc: string,
               aRuoloAttrib: number): Observable<any>
   {
      const operation: string = "edit";
      const url: string = `${this.apiUrl}?operation=${operation}&id=${aId}&nome=${encodeURIComponent(aName)}&password=${encodeURIComponent(aPassword)}&ruolo_desc=${encodeURIComponent(aRuoloDesc)}&ruolo_attrib=${aRuoloAttrib}`;
      return this.http.get<any>(url);
   }


   addNewData (aName: string,
               aPassword: string,
               aRuoloDesc: string,
               aRuoloAttrib: number): Observable<any>
   {
      const operation: string = "add";
      const url: string = `${this.apiUrl}?operation=${operation}&nome=${encodeURIComponent(aName)}&password=${encodeURIComponent(aPassword)}&ruolo_desc=${encodeURIComponent(aRuoloDesc)}&ruolo_attrib=${aRuoloAttrib}`;
      return this.http.get<any>(url);
   }


   DeleteData (aId: number): Observable<any>
   {
      const operation: string = "delete";
      const url: string = `${this.apiUrl}?operation=${operation}&id=${aId}`;
      return this.http.get<any>(url);
   }


   CheckUser (aName: string,
              aPassword: string): Observable<any>
   {
      const operation: string = "check";
      const url: string = `${this.apiUrl}?operation=${operation}&nome=${encodeURIComponent(aName)}&password=${encodeURIComponent(aPassword)}`;
      return this.http.get<any>(url);
   }

}
