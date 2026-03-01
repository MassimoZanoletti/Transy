
import {
   ChangeDetectorRef, Component,
   OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService} from "../../services/auth.service";
import { Router} from "@angular/router";
import { SeasonsService} from "../../services/seasons.service";
import {MessDlgData, IDSSeason} from "../../models/datamod";
import { MessageDialogService } from "../../services/message-dialog.service";

// PrimeNG modules
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector:    'app-season-edit',
  standalone:  true,
  imports:     [

     CommonModule,
     FormsModule,
     InputTextModule,
     CalendarModule,
     ButtonModule,
     CardModule

  ],
  templateUrl: './season-edit.component.html',
  styleUrl:    './season-edit.component.css'
})
export class SeasonEditComponent implements OnInit
{
   id: number = 0;
   nome = '';
   abbrev: string = "";
   tenantId: number = 0;
   theError = false;
   errorMessage: string = "Il campo non può essere vuoto";
   operazione: string = "";


   constructor (private authService: AuthService,
                private resourceService: SeasonsService,
                private router: Router,
                private cdr: ChangeDetectorRef,
                private messageDialogService: MessageDialogService)
   {
   }


   ngOnInit ()
   {
      this.id = history.state.id;
      this.tenantId = history.state.tenantId;
      if (this.id > 0)
      {
         this.operazione = "Modifica ";
         this.resourceService.getSingleData (this.id).subscribe (data =>
                                                                 {
                                                                    if (data)
                                                                    {
                                                                       if (data.ok)
                                                                       {
                                                                          this.nome = (data.elements as IDSSeason).nome;
                                                                          this.abbrev = (data.elements as IDSSeason).abbrev;
                                                                          this.tenantId = (data.elements as IDSSeason).tenantid_link;
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
            this.resourceService.updateData (this.id,
                                             this.nome,
                                             this.abbrev,
                                             this.tenantId).subscribe ({
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
            this.resourceService.addNewData(this.nome,
                                            this.abbrev,
                                            this.tenantId).subscribe ({
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

