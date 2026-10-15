import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {AuthService} from './services/auth.service';
import {IsAllenatore, loggedUser} from './services/users.service';



@Injectable ({
                providedIn: 'root'
             })
export class AuthGuard implements CanActivate
{

   constructor (private authService: AuthService,
                private router: Router)
   {

   }


   canActivate (): boolean
   {
      if (this.authService.isAuthenticated ())
      {
         return true;
      }
      else
      {
         this.router.navigate (['/login']);
         return false;
      }
   }
}



// pagine del database (e relative schede di modifica): non accessibili all'allenatore, nemmeno scrivendo
// l'indirizzo a mano (la voce di menu è già disabilitata); l'allenatore torna alla dashboard
@Injectable ({
                providedIn: 'root'
             })
export class NoAllenatoreGuard implements CanActivate
{

   constructor (private router: Router)
   {

   }


   canActivate (): boolean
   {
      if (IsAllenatore ())
      {
         this.router.navigate (['/']);
         return false;
      }
      return true;
   }
}



// pagine riservate all'amministratore (log): gli altri tornano alla dashboard anche scrivendo l'indirizzo a mano
@Injectable ({
                providedIn: 'root'
             })
export class AdminGuard implements CanActivate
{

   constructor (private router: Router)
   {

   }


   canActivate (): boolean
   {
      if (loggedUser.attributo >= 255)
         return true;
      this.router.navigate (['/']);
      return false;
   }
}
