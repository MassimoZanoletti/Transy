
import {
   ChangeDetectorRef,
   Component,
   OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService} from "../../services/auth.service";
import { Router} from "@angular/router";
import { EventiService } from "../../services/eventi.service";
import { LogService } from "../../services/log.service";
import { loggedUser } from "../../services/users.service";
import {
   MessDlgData,
   EventoElement,
   TipoEvento
} from "../../models/datamod";
import { MessageDialogService } from "../../services/message-dialog.service";

// PrimeNG modules
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from "primeng/dropdown";
import { InputGroupModule } from "primeng/inputgroup";
import { CheckboxModule } from 'primeng/checkbox';
import {utils} from "../../common/utils";
import {firstValueFrom} from "rxjs";



@Component({
  selector:    'app-evento-edit',
  standalone:  true,
              imports: [
                 CommonModule,
                 FormsModule,
                 InputTextModule,
                 CalendarModule,
                 ButtonModule,
                 CardModule,
                 DropdownModule,
                 InputGroupModule,
                 CheckboxModule
              ],
  templateUrl: './evento-edit.component.html',
  styleUrl:    './evento-edit.component.css'
})
export class EventoEditComponent implements OnInit
{
   id: number = 0;
   request: string = "";
   isAdd: boolean = false;
   year: number = 0;
   month: number = 0;
   day: number = 0;
   season_id: number = 0;
   master_id: number = 0;
   errorMessage: string = "Il campo non può essere vuoto";
   theError = false;
   operazione: string = "";
   data: Date |  null = null;
   orainizio: Date |  null = null;
   orafine: Date |  null = null;
   casa: string = "";
   ospite: string = "";
   indirizzo: string = "";
   commento: string = "";
   arbitraggio: boolean = false;
   lastGroup: number | null = 0;
   lastResource: number | null = 0;


   constructor (private authService: AuthService,
                private eventiService: EventiService,
                private router: Router,
                private cdr: ChangeDetectorRef,
                private messageDialogService: MessageDialogService,
                private logService: LogService)
   {
   }


   async ngOnInit ()
   {
      this.id = Number(history.state.id);
      this.isAdd = Boolean(history.state.isadd);
      this.year = Number(history.state.year);
      this.month = Number(history.state.month);
      this.day = Number(history.state.day);
      this.request = history.state.request.toString();
      this.season_id = Number(history.state.season_id);
      //
      this.lastGroup = utils.GetFromSessionStorage("BBS_Editing_Event_LastGroup");
      if (this.lastGroup == null)
         this.lastGroup = 0;
      this.lastResource = utils.GetFromSessionStorage("BBS_Editing_Event_LastResource");
      if (this.lastResource == null)
         this.lastResource = 0;
      //
      console.log(`EDIT: 2`);
      if (this.id > 0)
      {
         console.log(`EDIT: id > 0`);
         this.operazione = `Modifica `;
         console.log(`EDIT: operazione: ${this.operazione}`);
         const dataRes = await firstValueFrom(this.eventiService.getSingleData(this.id));
         if ((dataRes) && (dataRes.ok))
         {
            this.data = new Date((dataRes.elements as EventoElement).data);
            this.orainizio = await this.TimeFromString((dataRes.elements as EventoElement).data, (dataRes.elements as EventoElement).orainizio);
            this.orafine = await this.TimeFromString((dataRes.elements as EventoElement).data, (dataRes.elements as EventoElement).orafine);
            this.casa = (dataRes.elements as EventoElement).casa;
            this.ospite = (dataRes.elements as EventoElement).ospite;
            this.indirizzo = (dataRes.elements as EventoElement).luogo;
            this.commento = (dataRes.elements as EventoElement).commento;
            const tmpB: string = (dataRes.elements as EventoElement).arbitraggio.toString();
            this.arbitraggio = (tmpB!="0")?true:false;
         }
      }
      else
      {
         console.log(`EDIT: id == 0`);
         this.operazione = `Nuovo `;
         console.log(`EDIT: operazione: ${this.operazione}`);
         this.data = new Date();
         this.data.setFullYear(this.year);
         this.data.setMonth(this.month-1);
         this.data.setDate(this.day);
         this.data.setHours(0,0,0,0);
         //
         this.orainizio = new Date(this.data);
         this.orainizio.setHours(0,0,0,0);
         //
         this.orafine = new Date(this.data);
         this.orafine.setHours(0,0,0,0);
      }
      this.cdr.detectChanges();
   }


   async TimeFromString(aDate: Date,
                        aTime: Date): Promise<Date>
   {
      const sTime: string = aTime.toString();
      let result: Date = new Date (aDate);
      const hours: number = parseInt(sTime.substring(0, 2), 10);
      const minutes: number = parseInt(sTime.substring(3, 5), 10);
      result.setHours(hours, minutes, 0, 0);
      return result;
   }


   async Salva()
   {
      try
      {
         console.log("Salva");
         //
         //
         console.log(this.arbitraggio);
         //
         if (this.isAdd)
         {
            const response = await firstValueFrom (this.eventiService.addNewData((this.data) ? this.data.toLocaleDateString ('ja-JP') : "",
                                                                                 `${this.orainizio?.getHours ()}:${this.orainizio?.getMinutes ()}`,
                                                                                 `${this.orafine?.getHours ()}:${this.orafine?.getMinutes ()}`,
                                                                                 0,
                                                                                 0,
                                                                                 this.casa,
                                                                                 this.ospite,
                                                                                 this.indirizzo,
                                                                                 this.commento,
                                                                                 this.arbitraggio,
                                                                                 TipoEvento.EventoNormale,
                                                                                 this.season_id,
                                                                                 this.master_id));

            if (response.ok)
            {
               console.log ('Item aggiunto:', response);
               await this.logService.AddToLog (loggedUser, `Aggiunto Nuovo Evento `);
               this.router.navigate (['/']);
            }
            else
            {
               const dlgData: MessDlgData = {
                  title:      'ERRORE',
                  subtitle:   "Errore nell'inserimento dei dati",
                  message:    `${response.message}`,
                  messtype:   'error',
                  btncaption: 'Chiudi'
               };
               this.messageDialogService.showMessage (dlgData, '600px');
            }
         }
         else
         {
            const response = await firstValueFrom (this.eventiService.updateData (this.id,
                                                                                  (this.data) ? this.data.toLocaleDateString ('ja-JP') : "",
                                                                                  `${this.orainizio?.getHours ()}:${this.orainizio?.getMinutes ()}`,
                                                                                  `${this.orafine?.getHours ()}:${this.orafine?.getMinutes ()}`,
                                                                                  0,
                                                                                  0,
                                                                                  this.casa,
                                                                                  this.ospite,
                                                                                  this.indirizzo,
                                                                                  this.commento,
                                                                                  this.arbitraggio,
                                                                                  TipoEvento.EventoNormale,
                                                                                  this.season_id,
                                                                                  this.master_id));

            if (response.ok)
            {
               console.log ('Item aggiornato:', response);
               await this.logService.AddToLog (loggedUser, `Modificato Evento '${this.id}'`);
               this.router.navigate (['/']);
            }
            else
            {
               const dlgData: MessDlgData = {
                  title:      'ERRORE',
                  subtitle:   "Errore nell'aggiornamento dei dati",
                  message:    `${response.message}`,
                  messtype:   'error',
                  btncaption: 'Chiudi'
               };
               this.messageDialogService.showMessage (dlgData, '600px');
            }
         }
      }
      catch (error: any)
      { // Cattura sia gli errori HTTP che altri errori di codice
         console.error("Errore durante l'inserimento dell'item:", error);
         await this.logService.AddToLog (loggedUser, `Errore durante l'inserimento dell'item: '${JSON.stringify(error,null,-1)}'`);
         const dlgData: MessDlgData = {
            title: 'ERRORE',
            subtitle: "Errore nell'inserimento dei dati",
            message: `${error.message || 'Si è verificato un errore inatteso.'}`,
            messtype: 'error',
            btncaption: 'Chiudi'
         };
         this.messageDialogService.showMessage(dlgData, '600px');
      }

      /*
      if (this.nome.trim() == "")
      {
         this.errorMessage = "Il nome non può essere vuoto.";
         this.theError = true;
      }
      else
      {
         if (this.id > 0)
         {
            // EDIT
            if ((this.dataInizio != null) && (this.dataFine != null))
               this.resourceService.updateData (this.id,
                                                this.nome,
                                                this.dataInizio.toLocaleDateString('ja-JP'),
                                                this.dataFine.toLocaleDateString('ja-JP')).subscribe ({
                                                                                                         next:  (response) =>
                                                                                                                   {
                                                                                                                      if (response.ok)
                                                                                                                      {
                                                                                                                         console.log ('Item aggiornato:', response);
                                                                                                                         this.router.navigate (['/seasonstable']);
                                                                                                                      }
                                                                                                                      else
                                                                                                                      {
                                                                                                                         const dlgData: MessDlgData = {
                                                                                                                            title: 'ERRORE',
                                                                                                                            subtitle: "Errore nell'aggiornamento dei dati",
                                                                                                                            message: `${response.message}`,
                                                                                                                            messtype: 'error',
                                                                                                                            btncaption: 'Chiudi'
                                                                                                                         };
                                                                                                                         this.messageDialogService.showMessage(dlgData, '600px');
                                                                                                                      }
                                                                                                                   },
                                                                                                         error: (error) =>
                                                                                                                   {
                                                                                                                      const dlgData: MessDlgData = {
                                                                                                                         title: 'ERRORE',
                                                                                                                         subtitle: "Errore nell'aggiornamento dei dati",
                                                                                                                         message: `${error.message}`,
                                                                                                                         messtype: 'error',
                                                                                                                         btncaption: 'Chiudi'
                                                                                                                      };
                                                                                                                      this.messageDialogService.showMessage(dlgData, '600px');
                                                                                                                   }
                                                                                                      });
         }
         else
         {
            // ADD NEW
            if ((this.dataInizio != null) && (this.dataFine != null))
               this.resourceService.addNewData(this.nome,
                                               this.dataInizio.toLocaleDateString('ja-JP'),
                                               this.dataFine.toLocaleDateString('ja-JP')).subscribe ({
                                                                                                        next:  (response) =>
                                                                                                                  {
                                                                                                                     if (response.ok)
                                                                                                                     {
                                                                                                                        console.log ('Item aggiunto:', response);
                                                                                                                        this.router.navigate (['/seasonstable']);
                                                                                                                     }
                                                                                                                     else
                                                                                                                     {
                                                                                                                        const dlgData: MessDlgData = {
                                                                                                                           title: 'ERRORE',
                                                                                                                           subtitle: "Errore nella scrittura dei dati",
                                                                                                                           message: `${response.message}`,
                                                                                                                           messtype: 'error',
                                                                                                                           btncaption: 'Chiudi'
                                                                                                                        };
                                                                                                                        this.messageDialogService.showMessage(dlgData, '600px');
                                                                                                                     }
                                                                                                                  },
                                                                                                        error: (error) =>
                                                                                                                  {
                                                                                                                     const dlgData: MessDlgData = {
                                                                                                                        title: 'ERRORE',
                                                                                                                        subtitle: "Errore nella scrittura dei dati",
                                                                                                                        message: `${error.message}`,
                                                                                                                        messtype: 'error',
                                                                                                                        btncaption: 'Chiudi'
                                                                                                                     };
                                                                                                                     this.messageDialogService.showMessage(dlgData, '600px');
                                                                                                                  }
                                                                                                     });
         }
      }
      */
   }


   async Annulla()
   {
      this.router.navigate(['/']);
   }


   async SetOraFine()
   {
      if ((this.orainizio) && (this.orafine))
      {
         const newOraFine = new Date(this.orainizio || new Date());
         newOraFine.setHours(this.orainizio.getHours() + 2, this.orainizio.getMinutes(), 0, 0);
         this.orafine = newOraFine;
      }
   }


   async OnCasaClick()
   {
   }


   async OnOspiteClick()
   {
   }


   async OnIndirizzoClick()
   {
   }


   SetTrasferta()
   {
   }


}
