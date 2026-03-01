
import { signal, computed, WritableSignal, Signal } from '@angular/core';
import {TFallo,
   TMatchPlayer,
   TMatchTeam,
   TQuarterTeam,
   TRealizzazione,
   TTipoRealizzazione} from "../models/datamod";
import {matchGlobs} from "./curr-match";
import {utils} from "./utils";


export namespace OperIntStatus
{
   export const OperIntStatus_None: number  = 0;
   export const OperIntStatus_Ignore: number = 1;
   export const OperIntStatus_Done: number   = 2;

}



export enum TOperationType
{
   totUndefined,
   totTLYes,
   totTLNo,
   totT2Yes,
   totT2No,
   totT3Yes,
   totT3No,
   totFalloFatto,
   totFalloSubito,
   totRimbDifesa,
   totRimbAttacco,
   totPPersa,
   totPRecuperata,
   totStopSubita,
   totStopFatta,
   totAssist,
   totSostituz,
   totQuintetto,
   totTimeStart,
   totTimeStop,
   totCheckPoint
}
export namespace TOperationType
{
   export function toString(value: TOperationType): string { return TOperationType[value]; }
   export function fromString (value: string): TOperationType { return (TOperationType as any)[value]; }
   export function Desc(value: TOperationType): string
   {
      switch (value)
      {
         case TOperationType.totUndefined:   return "          ";
         case TOperationType.totTLNo:        return "TL no     ";
         case TOperationType.totTLYes:       return "TL Ok     ";
         case TOperationType.totT2No:        return "T2 no     ";
         case TOperationType.totT2Yes:       return "T2 Ok     ";
         case TOperationType.totT3No:        return "T3 no     ";
         case TOperationType.totT3Yes:       return "T3 Ok     ";
         case TOperationType.totFalloFatto:  return "FFatto    ";
         case TOperationType.totFalloSubito: return "FSubito   ";
         case TOperationType.totRimbDifesa:  return "Rimb Dif  ";
         case TOperationType.totRimbAttacco: return "Rimb Att  ";
         case TOperationType.totPPersa:      return "P Persa   ";
         case TOperationType.totPRecuperata: return "P Recup   ";
         case TOperationType.totStopSubita:  return "Stop Sub  ";
         case TOperationType.totStopFatta:   return "Stop Fat  ";
         case TOperationType.totAssist:      return "Assist    ";
         case TOperationType.totSostituz:    return "Sostit    ";
         case TOperationType.totQuintetto:   return "Quintet   ";
         case TOperationType.totTimeStart:   return "TimeStart ";
         case TOperationType.totTimeStop:    return "TimeStop  ";
         case TOperationType.totCheckPoint:  return "Checkpoint";
         default:                            return "?????     ";
      }
   }
   export function fromDesc (aStr: string): TOperationType
   {
      let result: TOperationType = TOperationType.totUndefined;

      aStr = aStr.toUpperCase();
      for (const key in TOperationType)
      {
         if (isNaN(Number(key)))
         {
            const value: TOperationType = ((TOperationType[key as keyof typeof TOperationType]) as TOperationType);
            const desc: string = Desc (value).toUpperCase();
            if (aStr == desc)
               result = value;
         }
      }
      return result;
   }
}




export class TOperation
{
   public readonly quarter = signal<number>(0);
   public readonly time = signal<number>(600);
   public readonly oper = signal<TOperationType>(TOperationType.totUndefined);
   public readonly myTeam = signal<boolean>(true);
   public readonly player1 = signal<TMatchPlayer | null>(null);
   public readonly player2 = signal<TMatchPlayer | null>(null);
   public readonly desc = signal<string>('');
   public readonly desc2 = signal<string>('');
   public readonly iParam = signal<number>(0);
   public readonly counter = signal<number>(0);
   public readonly internalStatus = signal<number>(OperIntStatus.OperIntStatus_Done);


   public constructor(aQrt?: number,
                      aTime?: number,
                      aOper?: TOperationType,
                      aMyTeam?: boolean,
                      aPlr1?: TMatchPlayer,
                      aPlr2?: TMatchPlayer,
                      aDesc?: string,
                      aIParam?: number,
                      aDesc2?: string)
   {
      this.quarter.set (0);
      this.time.set (600);
      this.oper.set (TOperationType.totUndefined);
      this.myTeam.set (true);
      this.player1.set (null);
      this.player2.set (null);
      this.desc.set ('');
      this.desc2.set ('');
      this.iParam.set (0);
      this.counter.set (0);
      this.internalStatus.set (OperIntStatus.OperIntStatus_Done);
      if (aQrt != null)
         this.quarter.set(aQrt);
      if (aTime != null)
         this.time.set(aTime);
      if (aOper != null)
         this.oper.set(aOper);
      if (aMyTeam != null)
         this.myTeam.set(aMyTeam);
      if (aPlr1 != null)
         this.player1.set(aPlr1);
      if (aPlr2 != null)
         this.player2.set(aPlr2);
      if (aDesc != null)
         this.desc.set(aDesc);
      if (aIParam != null)
         this.iParam.set(aIParam);
      if (aDesc2 != null)
         this.desc2.set(aDesc2);   }


   public static CreateFromString (fromStr: string,
                                   aMyTeam: TMatchTeam,
                                   aOppTeam: TMatchTeam): TOperation
   {
      const o: TOperation = new TOperation();
      if (fromStr && fromStr.length > 0)
      {
         await o.SetFromString(fromStr, aMyTeam, aOppTeam);
      }
      return o;
   }


   public static CreateFromJSON (data: any): TOperation
   {
      const o:TOperation = new TOperation();

      if (data.fQuarter !== undefined)
         o.quarter.set(data.fQuarter);
      if (data.fTime !== undefined)
         o.time.set(data.fTime);
      if (data.fOper !== undefined)
         o.oper.set(data.fOper);
      if (data.fMyTeam !== undefined)
         o.myTeam.set(data.fMyTeam);
      if (data.fDesc !== undefined)
         o.desc.set(data.fDesc);
      if (data.fDesc2 !== undefined)
         o.desc2.set(data.fDesc2);
      if (data.fIParam !== undefined)
         o.iParam.set(data.fIParam);
      if (data.fCounter !== undefined)
         o.counter.set(data.fCounter);
      if (data.fInternalStatus !== undefined)
         o.internalStatus.set(data.fInternalStatus);
      /*
      // Attenzione: se TMatchPlayer è una classe complessa,
      // andrebbe ricostruita anche quella con un suo metodo statico
      o.fPlayer1 = data.fPlayer1;
      o.fPlayer2 = data.fPlayer2;
      */

      return o;
   }


   public Clone (): TOperation
   {
      return new TOperation(this.quarter(),
                            this.time(),
                            this.oper(),
                            this.myTeam(),
                            this.player1(),
                            this.player2(),
                            this.desc(),
                            this.iParam(),
                            this.desc2());
   }


   public readonly MyTeamStr = computed(() =>
   {
      let result = this.myTeam() ? "MyTeam  " : "OppoTeam";
      const op = this.oper();
      const ip = this.iParam();

      switch (op)
      {
         case TOperationType.totTimeStart: return ip === 1 ? "Quarter Start" : "Time Start";
         case TOperationType.totTimeStop:  return ip === 1 ? "Quarter Stop" : "Time Stop";
         case TOperationType.totCheckPoint: return "";
         default: return result;
      }
   });

   public readonly Player1Str = computed(() =>
   {
      const p1 = this.player1();
      if (!p1)
         return "";

      let result = `${p1.PlayNumber2()} (${p1.playName()})`;
      switch (this.oper())
      {
         case TOperationType.totSostituz: return "Out " + result;
         case TOperationType.totTimeStart:
         case TOperationType.totTimeStop:
         case TOperationType.totCheckPoint: return "";
         default: return result;
      }
   });

   public readonly Player2Str = computed(() =>
   {
     const p1 = this.player2();
     if (!p1)
        return "";

     let result = `${p1.PlayNumber2()} (${p1.playName()})`;
     switch (this.oper())
     {
        case TOperationType.totSostituz: return "Out " + result;
        case TOperationType.totTimeStart:
        case TOperationType.totTimeStop:
        case TOperationType.totCheckPoint: return "";
        default: return result;
     }
   });


   public isSame(aOper: TOperation | null): boolean
   {
      if (!aOper)
         return false;
      try
      {
         let plr1: TMatchPlayer | null;
         let plr2: TMatchPlayer | null;
         let p1: boolean;
         let p2: boolean;
         plr1 = this.player1():
         plr2 = this.player2();
         if ((plr1) && (aOper.player1()))
            p1 = (plr1.playNumber() == aOper.player1()?.playNumber());
         else if ((!plr1) && (!aOper.player1()))
            p1 = true;
         else
            p1 = false;
         if ((plr2) && (aOper.player2()))
            p2 = (plr2.playNumber() == aOper.player2()?.playNumber());
         else if ((!plr2) && (!aOper.player2()))
            p2 = true;
         else
            p2 = false;
         const q = aOper.quarter();
         const t = aOper.time();
         const op = aOper.oper();
         const my = aOper.myTeam();
         const d = aOper.desc();
         const ip = aOper.iParam();
         return (
            (q === this.quarter()) &&
            (t === this.time()) &&
            (op === this.oper()) &&
            (my === this.myTeam()) &&
            (p1) &&
            (p2) &&
            (d === this.desc()) &&
            (ip === this.iParam())
         );
      }
      catch (e: any)
      {
         return false;
      }
   }


   public toString = computed(() =>
   {
      let s2: string;
      let tm: string;
      let p1Num: string;
      let p1Na: string;
      let p2Num: string;
      let result: string = "";

      try
      {
         if (await this.myTeam())
            tm = "MyTeam  ";
         else
            tm = "OppoTeam";
         //
         let pl1: TMatchPlayer | null = this.player1();
         if (pl1 != null)
         {
            p1Num = pl1.PlayNumber2();
            p1Na = pl1.playName();
         }
         else
         {
            p1Num = "";
            p1Na = "";
         }
         //
         let pl2: TMatchPlayer | null = this.player2();
         if (pl2 != null)
         {
            p2Num = pl2.PlayNumber2();
         }
         else
         {
            p2Num = "";
         }
         //
         switch (this.oper())
         {
            case TOperationType.totTLYes:       s2 = `${tm}|${p1Num}|(${p1Na})|[]|${this.desc()}`; break
            case TOperationType.totTLNo:        s2 = `${tm}|${p1Num}|(${p1Na})|[]|${this.desc()}`; break
            case TOperationType.totT2Yes:       s2 = `${tm}|${p1Num}|(${p1Na})|[]|${this.desc()}|${this.desc2()}`; break
            case TOperationType.totT2No:        s2 = `${tm}|${p1Num}|(${p1Na})|[]|${this.desc()}|${this.desc2()}`; break
            case TOperationType.totT3Yes:       s2 = `${tm}|${p1Num}|(${p1Na})|[]|${this.desc()}|${this.desc2()}`; break
            case TOperationType.totT3No:        s2 = `${tm}|${p1Num}|(${p1Na})|[]|${this.desc()}|${this.desc2()}`; break
            case TOperationType.totFalloFatto:  s2 = `${tm}|${p1Num}|(${p1Na})|${this.desc()}}`; break
            case TOperationType.totFalloSubito: s2 = `${tm}|${p1Num}|(${p1Na})`; break
            case TOperationType.totRimbDifesa:  s2 = `${tm}|${p1Num}|(${p1Na})`; break
            case TOperationType.totRimbAttacco: s2 = `${tm}|${p1Num}|(${p1Na})`; break
            case TOperationType.totPPersa:      s2 = `${tm}|${p1Num}|(${p1Na})|${this.desc()}`; break
            case TOperationType.totPRecuperata: s2 = `${tm}|${p1Num}|(${p1Na})`; break
            case TOperationType.totStopSubita:  s2 = `${tm}|${p1Num}|(${p1Na})`; break
            case TOperationType.totStopFatta:   s2 = `${tm}|${p1Num}|(${p1Na})`; break
            case TOperationType.totAssist:      s2 = `${tm}|${p1Num}|(${p1Na})`; break
            case TOperationType.totSostituz:    s2 = `${tm}|Out${p1Num}|In(${p2Num})`; break
            case TOperationType.totQuintetto:   s2 = `${tm}|${p1Num}|${p1Na}|${this.desc2()}`; break
            case TOperationType.totTimeStart:   s2 = (this.iParam()==1)?"QrtStart":"TimStart"; break
            case TOperationType.totTimeStop:    s2 = (this.iParam()==1)?"QrtStop ":"TimStop "; break
            case TOperationType.totCheckPoint:  s2 = `-------`; break
            default:                            s2 = `       `; break
         }
         const opTime: number = this.time();
         result = `Q${this.quarter()}|${utils.GetTimeStr(opTime)}|${TOperationType.Desc(this.oper())}|${s2}`;
      }
      catch (e: any)
      {
         result = '';
      }
      return result;
   })


   public async SetFromString (aStr: string,
                               aMyTeam: TMatchTeam,
                               aOppTeam: TMatchTeam): Promise<void>
   {
      /*
      try
      {
         if (globalThis.OperationFromString)
         {
            // assume this helper fills an object or returns a structure
            const tmp = globalThis.OperationFromString(aStr, aMyTeam, aOppTeam);
            if (tmp) {
               // copy relevant fields if present
               if (tmp.Quarter !== undefined) this.fQuarter = tmp.Quarter;
               if (tmp.Time !== undefined) this.fTime = tmp.Time;
               if (tmp.Oper !== undefined) this.fOper = tmp.Oper;
               if (tmp.MyTeam !== undefined) this.fMyTeam = tmp.MyTeam;
               if (tmp.Player1 !== undefined) this.fPlayer1 = tmp.Player1;
               if (tmp.Player2 !== undefined) this.fPlayer2 = tmp.Player2;
               if (tmp.Desc !== undefined) this.fDesc = tmp.Desc;
               if (tmp.Desc2 !== undefined) this.fDesc2 = tmp.Desc2;
               if (tmp.IParam !== undefined) this.fIParam = tmp.IParam;
               if (tmp.Counter !== undefined) this.fCounter = tmp.Counter;
               if (tmp.InternalStatus !== undefined) this.fInternalStatus = tmp.InternalStatus;
            }
            return;
         }

         // Fallback: simple 'key=value;' pairs or CSV: we attempt to parse numbers inside string
         // This is conservative: you can override by setting globalThis.OperationFromString
         const parts = aStr.split(globalThis.OPERATION_SEPARATOR ?? ',').map((s) => s.trim());
         // If not enough parts, do nothing.
         if (parts.length >= 1) {
            const q = parseInt(parts[0] || '0', 10);
            if (!isNaN(q)) this.fQuarter = q;
         }
         // Further parsing is domain-specific; keep conservative fallback.
      } catch (e: any) {
         if (globalThis.UpdateExceptionCounter) globalThis.UpdateExceptionCounter();
      }
      */
   }


} // class TOperation









export class TOperationList
{
   private fList: TOperation[] = [];
   private fChanged: boolean = false;
   private fModified: boolean = false;
   private fCounter: number = 0;
   public OnChanged?: () => void;

   private constructor()
   {
   }


   public static async Create(): Promise<TOperationList>
   {
      const lst = new TOperationList();
      lst.fList = [];
      lst.fChanged = false;
      return lst;
   }

   public async Destroy(): Promise<void>
   {
      for (const op of this.fList)
      {
         if (op && (op as any).Destroy)
         {
            //await op.Destroy();
         }
      }
      this.fList = [];
   }


   public async GetCount(): Promise<number>
   {
      return this.fList.length;
   }


   public async GetChanged(): Promise<boolean>
   {
      return this.fChanged;
   }


   public async SetChanged(value: boolean): Promise<void>
   {
      this.fChanged = value;
   }


   public async GetItem(index: number): Promise<TOperation | null>
   {
      if (index < 0 || index >= this.fList.length)
      {
         return null;
      }
      return this.fList[index];
   }


   public async SetItem(index: number, value: TOperation): Promise<void>
   {
      if (index < 0 || index >= this.fList.length)
      {
         return;
      }
      this.fList[index] = value;
      this.fChanged = true;
   }


   public async IndexOf (aItem: TOperation): Promise<number>
   {
      let result: number = -1;

      try
      {
         for (let i=0;   i<this.fList.length;   i++)
         {
            const itm: TOperation = this.fList[i];
            if ((await this.Compare(aItem, itm) == 0)
            {
               result = i;
               break;
            }
         }
      }
      catch (e)
      {
         result = -999;
      }
      return result;
   }


   public async Add(item: TOperation): Promise<void>
   {
      this.fCounter++;
      item.counter.set (this.fCounter);
      this.fList.push(item);
      await this.Sort();
      this.fModified = true;
      if (this.OnChanged)
         this.OnChanged();
   }


   public async AddNoSort(item: TOperation): Promise<void>
   {
      this.fCounter++;
      item.counter.set (this.fCounter);
      this.fList.push(item);
   }


   public async Refresh(): Promise<void>
   {
      await this.Sort();
      this.fModified = true;
      if (this.OnChanged)
         this.OnChanged();
   }


   private async CompareByIdx (i1: number,
                               i2: number): Promise<number>
   {
      const itm1: TOperation = this.fList[i1];
      const itm2: TOperation = this.fList[i2];
      return (await this.Compare(itm1, itm2));
   }


   private async Compare (itm1: TOperation,
                          itm2: TOperation): Promise<number>
   {
      const q1: number = itm1.quarter();
      const q2: number = itm2.quarter();
      const t1: number = itm1.time();
      const t2: number = itm2.time();
      const c1: number = itm1.counter();
      const c2: number = itm2.counter();

      if (q1 < q2)
         return -1;
      if (q1 > q2)
         return +1;

      if (t1 > t2)
         return -1;
      if (t1 < t2)
         return +1;

      if (c1 < c2)
         return -1;
      if (c1 > c2)
         return +1;

      return 0;
   }


   private async QuickSort (L: number,
                            R: number): Promise<void>
   {
      let I = L, J = R;
      let P = (L + R) >> 1;

      do
      {
         while (await this.Compare(I, P) < 0) I++;
         while (await this.Compare(J, P) > 0) J--;

         if (I <= J)
         {
            [this.fList[I], this.fList[J]] = [this.fList[J], this.fList[I]];

            if (P === I) P = J;
            else if (P === J) P = I;

            I++; J--;
         }
      } while (I <= J);

      if (L < J)
         await this.QuickSort(L, J);
      if (I < R)
         await this.QuickSort(I, R);
   }


   public async Sort(): Promise<void>
   {
      if (this.fList.length > 1)
      {
         await this.QuickSort(0, this.fList.length - 1);
      }
   }


   public async RemoveAction (arg: TOperation | number): Promise<boolean>
   {
      let result: boolean = false;
      let aItem: TOperation | null = null;
      let toDelete: boolean;
      let idx: number;
      let ff: TFallo
      let Qrt: TQuarterTeam | null;
      let pl: TMatchPlayer | null;

      try
      {
         if (typeof arg === 'number')
         {
            aItem = this.fList[Number(arg)] ?? null;
         }
         else
         {
            aItem = (arg as TOperation);
         }
         if (!aItem)
            return false;
         //
         idx = await this.IndexOf(aItem);
         if (idx >= 0)
         {
            switch (aItem.oper())
            {
               case TOperationType.totUndefined:
               case TOperationType.totQuintetto:
               case TOperationType.totTimeStart:
               case TOperationType.totTimeStop:
               case TOperationType.totCheckPoint:
                  toDelete = false;
                  break;
               case TOperationType.totTLYes:
               case TOperationType.totT2Yes:
               case TOperationType.totT3Yes:
               case TOperationType.totTLNo:
               case TOperationType.totT2No:
               case TOperationType.totT3No:
                  toDelete = await this.TogliRealizzazione (aItem);
                  break;
               case TOperationType.totFalloFatto:
                  pl = aItem.player1();
                  if (pl != null)
                  {
                     for (let i=1;   i<=5;   i++)
                     {
                        ff = pl.GeTFallo(i);
                        if ((ff.fCommesso) && (ff.fQuarto == (aItem.quarter())) && (ff.fTempo == (aItem.time())))
                        {
                           await (pl.GeTFallo(i)).Reset();
                           Qrt = null;
                           if (matchGlobs.currMatch)
                           {
                              if ((aItem.myTeam ()) && (matchGlobs.currMatch.myTeam))
                              {
                                 Qrt = matchGlobs.currMatch.myTeam.GetQuarto (ff.fQuarto);
                              }
                              else if ((aItem.myTeam () == false) && (matchGlobs.currMatch.oppTeam))
                              {
                                 Qrt = matchGlobs.currMatch.oppTeam.GetQuarto (ff.fQuarto):
                              }
                           }
                           if (Qrt != null)
                           {
                              Qrt.falliQrt = Qrt.falliQrt - 1;
                              if (Qrt.falliQrt < 0)
                                 Qrt.falliQrt = 0;
                              toDelete = true;
                           }
                        }
                     }
                  }
                  break;
               case TOperationType.totFalloSubito:
                  pl = aItem.player1();
                  if (pl != null)
                  {
                     const fs: number = pl.falliSubiti();
                     if (fs > 0)
                     {
                        pl.falliSubiti.set (fs - 1);
                        toDelete = true;
                     }
                  }
                  break;
               case TOperationType.totRimbDifesa:
                  pl = aItem.player1();
                  if (pl != null)
                  {
                     const rd: number = pl.rimbDifesa();
                     if (rd > 0)
                     {
                        pl.rimbDifesa.set(rd-1);
                        toDelete = true;
                     }
                  }
                  break;
               case TOperationType.totRimbAttacco:
                  pl = aItem.player1();
                  if (pl != null)
                  {
                     const ra: number = pl.rimbAttacco();
                     if (ra > 0)
                     {
                        pl.rimbAttacco.set(ra-1);
                        toDelete = true;
                     }
                  }
                  break;
               case TOperationType.totPPersa:
                  pl = aItem.player1();
                  if (pl != null)
                  {
                     const vv: number = pl.pPerse();
                     if (vv > 0)
                     {
                        pl.pPerse.set(vv-1);
                        toDelete = true;
                     }
                  }
                  break;
               case TOperationType.totPRecuperata:
                  pl = aItem.player1();
                  if (pl != null)
                  {
                     const vv: number = pl.pRecuperate();
                     if (vv > 0)
                     {
                        pl.pRecuperate.set(vv-1);
                        toDelete = true;
                     }
                  }
                  break;
               case TOperationType.totStopSubita:
                  pl = aItem.player1();
                  if (pl != null)
                  {
                     const vv: number = pl.stoppSubite();
                     if (vv > 0)
                     {
                        pl.stoppSubite.set(vv-1);
                        toDelete = true;
                     }
                  }
                  break;
               case TOperationType.totStopFatta:
                  pl = aItem.player1();
                  if (pl != null)
                  {
                     const vv: number = pl.stoppFatte();
                     if (vv > 0)
                     {
                        pl.stoppFatte.set(vv-1);
                        toDelete = true;
                     }
                  }
                  break;
               case TOperationType.totAssist:
                  pl = aItem.player1();
                  if (pl != null)
                  {
                     const vv: number = pl.assist();
                     if (vv > 0)
                     {
                        pl.assist.set(vv-1);
                        toDelete = true;
                     }
                  }
                  break;
               case TOperationType.totSostituz:
                  toDelete = false;
                  break;
               default:
                  toDelete = false;
                  break;
            }// switch
            if (toDelete == true)
            {
               this.fList.splice (idx, 1);
            }
         }//if (idx >= 0)
         result = true:
         this.fModified = true;
         if (this.OnChanged)
            this.OnChanged();
      }
      catch (e)
      {
         result = false;
      }
      return result;
   }


   private async TogliRealizzazione (aOper: TOperation): Promise<boolean>
   {
      let result: boolean = false;
      let Qrt: TQuarterTeam | null;
      let pl: TMatchPlayer | null;
      let idx: number = -1;
      let tmp: TRealizzazione | null;
      let ot: TOperationType;
      let tr: TTipoRealizzazione = TTipoRealizzazione.trUndefined;

      try
      {
         if (aOper == null)
            return result;
         if ((aOper.player1()) == null)
            return result;
         ot = aOper.oper();
         switch (ot)
         {
            case TOperationType.totTLYes:
            case TOperationType.totTLNo:
               tr = TTipoRealizzazione.trTL;
               break;
            case TOperationType.totT2Yes:
            case TOperationType.totT2No:
               tr = TTipoRealizzazione.trT2;
               break;
            case TOperationType.totT3Yes:
            case TOperationType.totT3No:
               tr = TTipoRealizzazione.trT3;
               break;
         }
         if (tr != TTipoRealizzazione.trUndefined)
         {
            pl = aOper.player1();
            if (pl != null)
            {
               for (let yyy=0;   yyy<(pl.realizzazioni.length);   yyy++)
               {
                  tmp = pl.realizzazioni()[yyy];
                  if ((tmp.rTipo == tr) && (tmp.rTempo == (aOper.time())) && (tmp.rQuarto == (aOper.quarter())))
                  {
                     idx = yyy;
                     break;
                  }
               }
            }
            if (idx >= 0)
            {
               (aOper.player1())?.realizzazioni().slice(idx, 1);
               result = true;
            }
         }
      }
      catch (e)
      {
         result = false;
      }
      return result;
   }


   public async SaveToJsonStr(): Promise<string>
   {
      let result: string = "[]";
      try
      {
         result = JSON.stringify(this.fList, null, -1);
      }
      catch (e)
      {
         result = "[]";
      }
      return result;
   }


   public async LoadFromJsonStr(jsonStr: string): Promise<boolean>
   {
      let result: boolean = true;
      try
      {
         const datiGrezzi: any[] = JSON.parse(jsonStr);
         this.fList = [];
         for (const item of datiGrezzi)
         {
            const operazione: TOperation = await TOperation.CreateFromJSON(item);
            this.fList.push(operazione);
         }
      }
      catch (e)
      {
         result = false;
      }
      return result;
   }



} // class TOperationList



