
import {
   ChangeDetectorRef,
   Component,
   OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService} from "../../services/auth.service";
import { Router} from "@angular/router";
import {loggedUser, UserService} from "../../services/users.service";
import {firstValueFrom} from "rxjs";
import { MessDlgData,
   IDSUser } from "../../models/datamod";
import { MessageDialogService } from "../../services/message-dialog.service";
import {ButtonDirective} from "primeng/button";
import {CardModule} from "primeng/card";
import {InputTextModule} from "primeng/inputtext";
import {InputNumberModule} from "primeng/inputnumber";
import {NgIf} from "@angular/common";
import {PaginatorModule} from "primeng/paginator";
import {PrimeTemplate} from "primeng/api";
import {DropdownModule} from 'primeng/dropdown';
import {utils} from "../../common/utils";
import { LogService } from "../../services/log.service";



@Component({
  selector:    'app-user-edit',
  standalone:  true,
              imports: [
                 FormsModule,
                 ButtonDirective,
                 InputNumberModule,
                 CardModule,
                 InputTextModule,
                 NgIf,
                 PaginatorModule,
                 PrimeTemplate,
                 DropdownModule
              ],
  templateUrl: './user-edit.component.html',
  styleUrl:    './user-edit.component.css'
})
export class UserEditComponent implements OnInit
{
   fromWhere: string = "";
   isLoading: boolean = false;
   id: number = 0;
   nome = '';
   password: string = "";
   ruoloDesc: string = "Utente";      // valori di default per un nuovo utente
   ruoloAttrib: number = 1;
   isSaving: boolean = false;

   theError = false;
   errorMessage: string = "Il campo non può essere vuoto";
   operazione: string = "";

   constructor (private authService: AuthService,
                private resourceService: UserService,
                private router: Router,
                private cdr: ChangeDetectorRef,
                private messageDialogService: MessageDialogService,
                private logService: LogService)
   {
   }


   async ngOnInit ()
   {
      this.id = history.state.id;
      if (history.state.from)
         this.fromWhere = history.state.from;
      //
      // un utente normale può modificare solo se stesso (non aggiungere né modificare altri)
      if (!this.ShowRuolo() && ((this.id ?? 0) <= 0 || this.id != loggedUser.id))
      {
         await this.Annulla();
         return;
      }
      //
      if (this.id > 0)
      {
         this.operazione = "Modifica ";
         this.isLoading = true;
         this.resourceService.getSingleData (this.id).subscribe (data =>
                                                                 {
                                                                    if (data)
                                                                    {
                                                                       if (data.ok)
                                                                       {
                                                                          this.nome = (data.elements as IDSUser).nome; // data.elements NON è un array ma invece è semplicemente il solo elementp selezionato
                                                                          this.password = (data.elements as IDSUser).password;
                                                                          this.ruoloDesc = data.elements.ruolo_desc ?? "";      // l'api restituisce i nomi delle colonne del db
                                                                          this.ruoloAttrib = Number(data.elements.ruolo_attrib ?? 0);
                                                                       }
                                                                    }
                                                                    this.cdr.detectChanges();
                                                                    this.isLoading = false;
                                                                 });
      }
      else
      {
         this.operazione = "Aggiungi Nuovo ";
         this.isLoading = false;
      }
   }


   async Salva()
   {
      this.nome = this.nome.trim();
      if (this.nome == "")
      {
         this.errorMessage = "Il nome non può essere vuoto.";
         this.theError = true;
         return;
      }
      if (this.password == "")
      {
         this.errorMessage = "La password non può essere vuota.";
         this.theError = true;
         return;
      }
      this.theError = false;
      //
      this.isSaving = true;
      const subtitle: string = (this.id > 0) ? "Errore nell'aggiornamento dei dati" : "Errore nella scrittura dei dati";
      try
      {
         const response = (this.id > 0)
            ? await firstValueFrom(this.resourceService.updateData(this.id, this.nome, this.password, this.ruoloDesc, this.ruoloAttrib))
            : await firstValueFrom(this.resourceService.addNewData(this.nome, this.password, this.ruoloDesc, this.ruoloAttrib));
         if (response?.ok)
         {
            // se l'utente ha modificato se stesso, aggiorno anche i dati della sessione
            if ((this.id > 0) && (this.id == loggedUser.id))
            {
               loggedUser.nome = this.nome;
               loggedUser.password = this.password;
               utils.SaveToSessionStorage("BBS_Logged_User", loggedUser);
            }
            await this.Annulla();      // torna alla pagina di provenienza
         }
         else
            this.MostraErrore(subtitle, response?.message ?? "Nessun dato ritornato");
      }
      catch (error: any)
      {
         this.MostraErrore(subtitle, error?.message ?? `${error}`);
      }
      finally
      {
         this.isSaving = false;
         this.cdr.detectChanges();
      }
   }


   private MostraErrore(subtitle: string,
                        message: string)
   {
      const dlgData: MessDlgData = {
         title:      'ERRORE',
         subtitle:   subtitle,
         message:    message,
         messtype:   'error',
         btncaption: 'Chiudi'
      };
      this.messageDialogService.showMessage(dlgData, '600px');
   }


   async Annulla()
   {
      if (this.fromWhere == "single")
         this.router.navigate(['/settings']);
      else
         this.router.navigate(['/userstable']);
   }


   ShowRuolo(): boolean
   {
      return (loggedUser.attributo >= 255);
   }
}
