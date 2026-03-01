import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
   TDSQuartoDb,
   TDSQuarto,
   TDSQuartoData,
} from "../models/datamod";
import { map,
   tap } from "rxjs/operators";
import { utils,
   matchStatusType,
   timeouts } from "../common/utils";



@Injectable({
  providedIn: 'root'
})
export class QuartoService
{
   private apiUrl = 'https://www.basketsarezzo.com/code/backend/bbs/api_quarto.php';


   constructor (private http: HttpClient)
   {
   }


   getAllData (matchHeaderId: number | null): Observable<any>
   {
      const operation: string = "all";
      let qryTenant: string = "";
      if (matchHeaderId != null)
         qryTenant = `&match=${matchHeaderId}`;
      const url: string = `${this.apiUrl}?operation=${operation}` + qryTenant;
      return this.http.get<TDSQuartoData>(url).pipe (
         tap (value => {  }),
         map ((dataFromDb) => {
                 return {
                    ok:         dataFromDb.ok,
                    message:    dataFromDb.message,
                    elements:   dataFromDb.elements.map (dbElement => {
                                                            const dbElm: TDSQuartoDb = (dbElement as TDSQuartoDb);
                                                            const mhElem: TDSQuarto = this.QuartoFromDb (dbElm);
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
      return this.http.get<any> (url);
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


   DeleteAllQuarterOfMatch (aMatchHeaderId: number): Observable<any>
   {
      const operation: string = "deletequarter";
      const url: string = `${this.apiUrl}?operation=${operation}&matchheaderid=${aMatchHeaderId}`;
      return this.http.get<any> (url);
   }


   QuartoFromDb (dnElem: TDSQuartoDb): TDSQuarto
   {
      const result: TDSQuarto = {
         id:                 Number(dnElem.id),
         matchHeaderId_link: Number(dnElem.matchheaderid_link),
         num:                Number(dnElem.num),
         isRegular:          (String(dnElem.isregular)=='1')?true:false,
         status:             dnElem.status,
         myTeamStartPoint:   Number(dnElem.myteamstartpoint),
         oppoTeamStartPoint: Number(dnElem.oppoteamstartpoint),
         myTeamCurrPoint:    Number(dnElem.myteamcurrpoint),
         oppoTeamCurrPoint:  Number(dnElem.oppoteamcurrpoint),
         myTeamFouls:        Number(dnElem.myteamfouls),
         oppoTeamFouls:      Number(dnElem.oppoteamfouls),
         myTeamBonus:        (String(dnElem.myteambonus)=='1')?true:false,
         oppoTeamBonus: (String(dnElem.oppoteambonus)=='1')?true:false
      };
      return result;
   }


   QuartoToDb (mh: TDSQuarto): TDSQuartoDb
   {
      const result: TDSQuartoDb = {
         id: Number(mh.id),
         matchheaderid_link: Number(mh.matchHeaderId_link),
         num: Number(mh.num),
         isregular: Boolean(mh.isRegular),
         myteamstartpoint: Number(mh.myTeamStartPoint),
         oppoteamstartpoint: Number(mh.oppoTeamStartPoint),
         myteamcurrpoint: Number(mh.myTeamCurrPoint),
         oppoteamcurrpoint: Number(mh.oppoTeamCurrPoint),
         myteamfouls: Number(mh.myTeamFouls),
         oppoteamfouls: Number(mh.oppoTeamFouls),
         myteambonus: Boolean(mh.myTeamBonus),
         oppoteambonus: Boolean(mh.oppoTeamBonus),
         status: mh.status
      };
      return result;
   }

}
