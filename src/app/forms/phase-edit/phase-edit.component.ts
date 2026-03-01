
import {
   ChangeDetectorRef, Component,
   OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService} from "../../services/auth.service";
import { Router} from "@angular/router";
import { PhaseService } from "../../services/phase.service";
import {
   MessDlgData,
   IDSPhase
} from "../../models/datamod";
import { MessageDialogService } from "../../services/message-dialog.service";

// PrimeNG modules
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import {CalendarModule} from "primeng/calendar";

@Component({
  selector:    'app-phase-edit',
  standalone:  true,
              imports: [
                 CommonModule,
                 FormsModule,
                 InputTextModule,
                 CalendarModule,
                 ButtonModule,
                 CardModule
              ],
  templateUrl: './phase-edit.component.html',
  styleUrl:    './phase-edit.component.css'
})
export class PhaseEditComponent implements OnInit
{
   id: number = 0;
   nome = '';
   abbrev: string = "";
   champId: number = 0;
   exportFolder: string = "";
   theError = false;
   errorMessage: string = "Il campo non può essere vuoto";
   operazione: string = "";


   constructor (private authService: AuthService,
                private theDataService: PhaseService,
                private router: Router,
                private cdr: ChangeDetectorRef,
                private messageDialogService: MessageDialogService)
   {
   }


   ngOnInit ()
   {
      this.id = history.state.id;
      this.champId = history.state.champId;
      if (this.id > 0)
      {
         this.operazione = "Modifica ";
         this.theDataService.getSingleData (this.id).subscribe (data =>
                                                                {
                                                                   if (data)
                                                                   {
                                                                      if (data.ok)
                                                                      {
                                                                         this.nome = (data.elements as IDSPhase).nome;
                                                                         this.abbrev = (data.elements as IDSPhase).abbrev;
                                                                         this.champId = (data.elements as IDSPhase).champid_link;
                                                                         this.exportFolder = (data.elements as IDSPhase).exportfolder;
                                                                      }
                                                                   }
                                                                   this.cdr.detectChanges();
                                                                });
      }
      else
      {
         this.operazione = "Aggiungi Nuova ";
      }
   }


   async Salva()
   {
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
            this.theDataService.updateData (this.id,
                                            this.nome,
                                            this.abbrev,
                                            this.exportFolder,
                                            this.champId).subscribe ({
                                                                         next:  (response) =>
                                                                                   {
                                                                                      if (response.ok)
                                                                                      {
                                                                                         console.log ('Item aggiornato:', response);
                                                                                         this.router.navigate(['/database']);
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
            this.theDataService.addNewData(this.nome,
                                           this.abbrev,
                                           this.exportFolder,
                                           this.champId).subscribe ({
                                                                        next:  (response) =>
                                                                                  {
                                                                                     if (response.ok)
                                                                                     {
                                                                                        console.log ('Item aggiunto:', response);
                                                                                        this.router.navigate(['/database']);
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
   }


   async Annulla()
   {
      this.router.navigate(['/database']);
   }

}

