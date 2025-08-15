import {
   Component,
   ViewChild,
   OnInit,
   AfterViewInit,
   ChangeDetectionStrategy,
   ChangeDetectorRef, isDevMode
} from '@angular/core';
import {
   RouterOutlet,
   RouterModule,
   RouterLink,
   RouterLinkActive, Router
} from '@angular/router';
import {ToolbarModule} from 'primeng/toolbar';
import {ButtonModule} from 'primeng/button';
import {AuthService} from './services/auth.service';
import {
   CommonModule,
   NgIf
} from '@angular/common';
import {MenuItem, PrimeIcons } from 'primeng/api';
import {MenuModule} from 'primeng/menu';
import {Menu} from 'primeng/menu';
import { PrimeNGConfig } from 'primeng/api';
import * as currentPackage from "../../package.json";
import {InitLoggedUser, loggedUser} from "./services/users.service";
import {utils} from "./common/utils";
import {LogService} from "./services/log.service";
import {TimerCompComponent} from "./common/timer-comp/timer-comp.component";
import {PlayerCompComponent} from "./common/player-comp/player-comp.component";



@Component ({
               selector:        'app-root',
               standalone:      true,
               imports:         [
                  RouterOutlet,
                  RouterLink,
                  ToolbarModule,
                  ButtonModule,
                  NgIf,
                  RouterModule,
                  MenuModule,
                  CommonModule,
                  TimerCompComponent,
                  PlayerCompComponent
               ],
               templateUrl:     './app.component.html',
               styleUrl:        './app.component.css',
               changeDetection: ChangeDetectionStrategy.OnPush
            })
export class AppComponent implements AfterViewInit, OnInit
{
   public pkg: { name: string; version: string; copyrights: string } = currentPackage;

   title = 'ResSchedulerAuth';
   mnuPartita: MenuItem[] | undefined;
   mnuStrumenti: MenuItem[] | undefined;
   appVersion: string = "V. ";
   appTitle: string = "RS";
   appCopyrights: string = "";
   separatore: string = "   ::     ";

   // Rimuovi la dichiarazione diretta tabelleMenuRef!: Menu;
   // Useremo un setter privato per gestirlo

   constructor (public router: Router,
                public authService: AuthService,
                private cdr: ChangeDetectorRef,
                private primengConfig: PrimeNGConfig,
                private logService: LogService)
   {
      if (utils.IsDevMode == null)
         utils.IsDevMode = isDevMode();
      //
      this.mnuPartita = [
         {
            label: "",
            items: [
               {label: "Modifica Numeri/Nomi", icon: 'pi pi-book', styleClass: 'icona-default', routerLink: ['/']},
               {label: "Azioni", icon: 'pi pi-bolt', styleClass: 'icona-gialla', routerLink: ['/']},
               {label: "Tempi di gioco", icon: 'pi pi-stopwatch', styleClass: 'icona-default', routerLink: ['/']},
               {label: "Falli totali", icon: 'pi pi-flag-fill', styleClass: 'icona-rossa', routerLink: ['/']}
            ]
         },
         {
            separator: true
         },
         {
            label: "",
            items: [
               {label: "Azzera solo tempi di gioco", icon: 'pi pi-sync', styleClass: 'icona-arancio', routerLink: ['/']},
               {label: "Azzera tutta la partita", icon: 'pi pi-times', styleClass: 'icona-arancio', routerLink: ['/']}
            ]
         },
      ];
      this.mnuStrumenti = [
         {
            label: "",
            items: [
               {label: "Statistiche", icon: 'pi pi-chart-line', styleClass: 'icona-default', routerLink: ['/']},
               {label: "Database", icon: 'pi pi-table', styleClass: 'icona-default', routerLink: ['/database']}
            ]
         },
         {
            separator: true
         },
         {
            label: "",
            items: [
               {label: "Configurazione", icon: 'pi pi-wrench', styleClass: 'icona-default', routerLink: ['/']},
               {label: "Utenti", icon: 'pi pi-users', styleClass: 'icona-default', routerLink: ['/userstable']}
            ]
         }
      ];
      //
      this.appTitle = this.pkg.name;
      ;
      this.appVersion = `  (v. ${this.pkg.version})   `;
      this.appCopyrights = `${this.pkg.copyrights}`;
   }


   // Definisci una variabile privata per il riferimento al menu
   private _strumentiMenuInstance!: Menu;
   private _partitaMenuInstance!: Menu;


   // Usa un setter per @ViewChild per reagire quando il menu diventa disponibile
   @ViewChild ('strumentiMenu', {static: false})
   set strumentiMenuRef (menu: Menu)
   {
      if (menu)
      {
         this._strumentiMenuInstance = menu;
      }
   }


   // Usa un setter per @ViewChild per reagire quando il menu diventa disponibile
   @ViewChild ('partitaMenu', {static: false})
   set partitaMenuRef (menu: Menu)
   {
      if (menu)
      {
         this._partitaMenuInstance = menu;
      }
   }


   ngOnInit ()
   {
      this.cdr.detectChanges ();
      console.log (`User: ${loggedUser.nome}`);
   }


   ngAfterViewInit (): void
   {
      // Questo hook si esegue presto, prima che il menu sia nel DOM.
      // La logica di gestione del menu iniziale ora è nel setter di tabelleMenuRef.
      this.primengConfig.setTranslation ({
                                            firstDayOfWeek:  1,
                                            dayNames:        ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
                                            dayNamesShort:   ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
                                            dayNamesMin:     ["D", "L", "M", "M", "G", "V", "S"],
                                            monthNames:      [
                                               "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
                                               "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
                                            ],
                                            monthNamesShort: [
                                               "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
                                               "Lug", "Ago", "Set", "Ott", "Nov", "Dic"
                                            ],
                                            today:           'Oggi',
                                            clear:           'Pulisci',
                                            dateFormat:      'dd/mm/yyyy'
                                         });

   }


   logout (): void
   {
      this.logService.AddToLog (loggedUser, "Logout");
      utils.removeFromSessionStorage ("BBS_Logged_User");
      InitLoggedUser ();
      this.cdr.detectChanges ();
      this.authService.logout ();
      InitLoggedUser ();
      this.cdr.detectChanges ();
      if (utils.IsDevMode)
      {
         setTimeout (() => { window.location.reload(); }, 1500);
         window.location.href = '/';
         window.location.reload();
      }
      else
      {
         setTimeout (() => { window.location.reload(); }, 1500);
         window.location.href = utils.startingPath;
         window.location.reload();
      }
   }


   // Il metodo toggleTabelleMenu può continuare a usare il riferimento passato dal template
   StrumentiMenuClick (event: MouseEvent, menu: Menu)
   {
      // Qui `menu` è il riferimento valido passato dal template
      menu.toggle (event);
      this.cdr.detectChanges (); // Forziamo un ciclo di change detection
   }


   PartitaMenuClick (event: MouseEvent, menu: Menu)
   {
      // Qui `menu` è il riferimento valido passato dal template
      menu.toggle (event);
      this.cdr.detectChanges (); // Forziamo un ciclo di change detection
   }


   IsAdmin (): boolean
   {
      return (loggedUser.attributo >= 255);
   }


   protected readonly loggedUser = loggedUser;
}
