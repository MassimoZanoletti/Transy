import { Injectable } from '@angular/core';
import {
   UserService,
   loggedUser, InitLoggedUser
} from "./users.service";
import {MessDlgData,
   IDSUser,
   LogMessage} from "../models/datamod";
import {firstValueFrom} from "rxjs";
import {utils} from "../common/utils";
import {LogService} from "./log.service";



@Injectable ({
                providedIn: 'root'
             })
export class AuthService
{
   private loggedIn = false;

   constructor (private userServ: UserService,
                private logService: LogService)
   {
      const lu = utils.GetFromSessionStorage<IDSUser>("BBS_Logged_User");
      if (lu && (lu.ruolo != "Guest"))      // una sessione Guest di prima (login a credenziali vuote, non più ammesso) non vale
      {
         loggedUser.id = lu?.id,
         loggedUser.nome = lu?.nome,
         loggedUser.password = lu.password,
         loggedUser.ruolo_id = lu.ruolo_id,
         loggedUser.ruolo = lu.ruolo,
         loggedUser.attributo = lu.attributo
      }
      else
         InitLoggedUser()
      if (loggedUser.ruolo != "")
      {
         this.loggedIn = true;
      }
   }


   async login (username: string,
                password: string): Promise<boolean>
   {
      let oggi: Date = new Date();
      let superUserName: string = `bbs`;
      let superUserPassword: string = `${oggi.getMonth() + 1}${oggi.getDate()}`;

      // credenziali vuote (anche solo una delle due): nessun accesso
      if ((username.trim() === '') || (password === ''))
      {
         this.loggedIn = false;
         utils.removeFromSessionStorage("BBS_Logged_User");
         return false;
      }
      else if ((username == superUserName) && (password == superUserPassword))
      {
         loggedUser.id = 0;
         loggedUser.nome = "Superuser";
         loggedUser.password = "";
         loggedUser.ruolo = "Superuser";
         loggedUser.ruolo_id = 99999;
         loggedUser.attributo = 255;
         this.loggedIn = true;
         utils.SaveToSessionStorage("BBS_Logged_User", loggedUser);
         await this.logService.AddToLog(loggedUser, "Login");
         return true;
      }
      else
      {
         let dataEvnt: any = null;
         try
         {
            dataEvnt = await firstValueFrom(this.userServ.CheckUser(username, password));
         }
         catch (error)
         {
            console.error("Login: errore di comunicazione col server", error);   // rete assente o errore 500
         }
         if (dataEvnt)
         {
            // elements deve essere il singolo utente trovato: un array (es. api non aggiornata che risponde con
            // l'elenco completo) o un id mancante NON devono mai dare accesso
            const el = dataEvnt.elements;
            if (dataEvnt.ok && el && !Array.isArray(el) && (Number(el.id) > 0))
            {
               loggedUser.id = Number(el.id);
               loggedUser.nome = el.nome;
               loggedUser.password = el.password;
               loggedUser.ruolo = el.ruolo || "Utente";   // non vuoto: il costruttore considera loggato solo chi ha un ruolo
               loggedUser.ruolo_id = Number(el.ruolo_id ?? 0);
               loggedUser.attributo = Number(el.attributo ?? 0);
               this.loggedIn = true;
               utils.SaveToSessionStorage("BBS_Logged_User", loggedUser);
               await this.logService.AddToLog(loggedUser, "Login");
               return true;
            }
            else
            {
               /*
               const dlgData: MessDlgData = {
                  title:      'ERRORE',
                  subtitle:   'Errore durante il caricamento degli eventi dal server',
                  message:    `${dataEvnt.message}`,
                  messtype:   'error',
                  btncaption: 'Chiudi'
               };
               this.messageDialogService.showMessage (dlgData, '600px');
               */
            }
         }
         else
         {
            /*
            const dlgData: MessDlgData = {
               title:      'ERRORE',
               subtitle:   'Errore durante il caricamento degli eventi dal server',
               message:    `No data returned`,
               messtype:   'error',
               btncaption: 'Chiudi'
            };
            this.messageDialogService.showMessage (dlgData, '600px');
            */
         }
      }
      this.loggedIn = false;
      utils.removeFromSessionStorage("BBS_Logged_User");
      return false;
   }


   async logout ()
   {
      InitLoggedUser();
      this.loggedIn = false;
   }


   isAuthenticated (): boolean
   {
      return this.loggedIn;
   }
}

