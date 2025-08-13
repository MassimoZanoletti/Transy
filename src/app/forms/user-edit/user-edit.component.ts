
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
import { MessDlgData,
   User } from "../../models/datamod";
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
                                                                          this.nome = (data.elements as User).nome; // data.elements NON è un array ma invece è semplicemente il solo elementp selezionato
                                                                          this.password = (data.elements as User).password;
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
         }
         else
         {
            // ADD NEW
         }
      }
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
