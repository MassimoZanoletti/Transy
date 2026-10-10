
import {
   Component,
   ViewChild,
   OnInit,
   AfterViewInit,
   ChangeDetectionStrategy,
   ChangeDetectorRef,
   isDevMode,
   HostListener,
   OnDestroy
} from '@angular/core';
import {
   RouterOutlet,
   RouterModule,
   RouterLink,
   RouterLinkActive,
   Router,
   NavigationEnd
} from '@angular/router';
import {ToolbarModule} from 'primeng/toolbar';
import {ButtonModule} from 'primeng/button';
import {AuthService} from './services/auth.service';
import {
   CommonModule,
   NgIf
} from '@angular/common';
import {MenuItem, MessageService, PrimeIcons } from 'primeng/api';
import {ToastModule} from 'primeng/toast';
import {MatchSyncService} from './services/match-sync.service';
import {MenuModule} from 'primeng/menu';
import {Menu} from 'primeng/menu';
import { PrimeNGConfig } from 'primeng/api';
import * as currentPackage from "../../package.json";
import {InitLoggedUser, loggedUser} from "./services/users.service";
import { globs,
         utils} from "./common/utils";
import {LogService} from "./services/log.service";
import {TimerCompComponent} from "./common/timer-comp/timer-comp.component";
import {PlayerCompComponent} from "./common/player-comp/player-comp.component";
import {TeamCompComponent} from "./common/team-comp/team-comp.component";
import { filter } from 'rxjs/operators';
import { interval, Subscription } from 'rxjs';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';



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
                  PlayerCompComponent,
                  TeamCompComponent,
                  ToastModule
               ],
               // MessageService proprio: solo per gli avvisi globali (toast "sync"), le pagine hanno il loro
               providers:       [MessageService],
               templateUrl:     './app.component.html',
               styleUrl:        './app.component.css',
               changeDetection: ChangeDetectionStrategy.OnPush
            })
export class AppComponent implements AfterViewInit, OnInit, OnDestroy
{
   public pkg: { name: string; version: string; copyrights: string, comp_date: string } = currentPackage;

   title = 'BBSAuth';
   mnuPartita: MenuItem[] | undefined;
   mnuStrumenti: MenuItem[] | undefined;
   //appVersion: string = "V. ";
   //appTitle: string = "RS";
   //appCopyrights: string = "";
   separatore: string = "   ::     ";
   // PWA: nuova versione dell'app scaricata dal service worker, pronta all'uso
   updateDisponibile: boolean = false;
   private swSubs: Subscription[] = [];

   // Rimuovi la dichiarazione diretta tabelleMenuRef!: Menu;
   // Useremo un setter privato per gestirlo

   constructor (public router: Router,
                public authService: AuthService,
                private cdr: ChangeDetectorRef,
                private primengConfig: PrimeNGConfig,
                private logService: LogService,
                private swUpdate: SwUpdate,
                private matchSync: MatchSyncService,
                private msgService: MessageService)
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
               {label: "Azzera tutta la partita", icon: 'pi pi-times', styleClass: 'icona-arancio', routerLink: ['/']}
            ]
         },
      ];
      this.mnuStrumenti = [
         {
            label: "",
            items: [
               {label: "Database", icon: 'pi pi-table', styleClass: 'icona-default', routerLink: ['/database']}
            ]
         },
         {
            separator: true
         },
         {
            label: "",
            items: [
               {label: "Configurazione", icon: 'pi pi-wrench', styleClass: 'icona-default', routerLink: ['/settings']},
               {label: "Utenti", icon: 'pi pi-users', styleClass: 'icona-default', routerLink: ['/userstable']}
            ]
         },
         {
            separator: true
         },
         {
            label: "",
            items: [
               {label: "Info", icon: 'pi pi-info-circle', styleClass: 'icona-default', routerLink: ['/info']}
            ]
         }
      ];
      //
      globs.appName = this.pkg.name;
      globs.appDate = this.pkg.comp_date;
      globs.appVersion = `  (v. ${this.pkg.version})   `;
      globs.appCopyrights = `${this.pkg.copyrights}`;
   }


   // Definisci una variabile privata per il riferimento al menu
   private _strumentiMenuInstance!: Menu;
   /*
   private _partitaMenuInstance!: Menu;
   */


   // Usa un setter per @ViewChild per reagire quando il menu diventa disponibile
   @ViewChild ('strumentiMenu', {static: false})
   set strumentiMenuRef (menu: Menu)
   {
      if (menu)
      {
         this._strumentiMenuInstance = menu;
      }
   }


/*
   // Usa un setter per @ViewChild per reagire quando il menu diventa disponibile
   @ViewChild ('partitaMenu', {static: false})
   set partitaMenuRef (menu: Menu)
   {
      if (menu)
      {
         this._partitaMenuInstance = menu;
      }
   }
   */


   // Doppio tocco: un secondo click su un bottone entro DOPPIO_TOCCO_MS dal precedente, sullo stesso bottone
   // o nello stesso punto dello schermo (es. Start che diventa Stop, OK di una finestra che si chiude e lascia
   // sotto il dito un altro bottone), viene scartato prima che arrivi ai gestori di Angular (fase di capture).
   // Esclusi i bottoni con l'attributo data-multitocco (es. +1/-1 secondo del cronometro, da premere a raffica).
   private static readonly DOPPIO_TOCCO_MS = 400;
   private static readonly DOPPIO_TOCCO_PX = 30;
   private ultimoTocco: { t: number, x: number, y: number, el: Element | null } = { t: 0, x: 0, y: 0, el: null };

   private FiltraDoppioTocco = (ev: MouseEvent): void =>
   {
      const el = (ev.target instanceof Element) ? ev.target.closest('button, .p-button, [role="button"]') : null;
      if ((!el) || (el.closest('[data-multitocco]')))
         return;
      const prec = this.ultimoTocco;
      const vicino = (el === prec.el) ||
                     ((Math.abs(ev.clientX - prec.x) <= AppComponent.DOPPIO_TOCCO_PX) && (Math.abs(ev.clientY - prec.y) <= AppComponent.DOPPIO_TOCCO_PX));
      if (vicino && ((ev.timeStamp - prec.t) < AppComponent.DOPPIO_TOCCO_MS))
      {
         ev.stopImmediatePropagation();
         ev.preventDefault();
         return;
      }
      this.ultimoTocco = { t: ev.timeStamp, x: ev.clientX, y: ev.clientY, el };
   };


   ngOnInit ()
   {
      window.addEventListener('beforeunload', this.beforeUnloadHandler);
      document.addEventListener('click', this.FiltraDoppioTocco, true);
      this.InitServiceWorkerUpdates ();
      // Modifiche (intestazione, roster, nomi) rifiutate dal server all'invio dalla coda: possono arrivare
      // in qualunque momento e su qualunque pagina, quindi l'avviso è qui
      this.swSubs.push (this.matchSync.writeRejected.subscribe (msg =>
         this.msgService.add ({ key: 'sync', severity: 'error', summary: 'Salvataggio non riuscito', detail: msg, sticky: true })));
      //
      this.router.events
         .pipe(
            // 1. Filtra solo gli eventi di fine navigazione
            filter((event) => event instanceof NavigationEnd),

            // 2. Filtra solo se l'URL di destinazione contiene la rotta specifica
            //    (Es. /match/1234 o /match?param=x)
            filter((event: any) => event.url.includes("/match"))
         )
         .subscribe(() => {
            // A questo punto, l'evento scatta SOLO quando l'utente naviga su /match (o un suo derivato)

            // Naviga l'albero delle rotte attive fino all'ultima foglia
            let route = this.router.routerState.root;
            while (route.firstChild) {
               route = route.firstChild;
            }

            // 💡 Leggi i Path Parameters per la pagina 'match'
            route.queryParamMap.subscribe(params => {
               const tmp = params.get('id');
               if (tmp)
                  globs.openedMatchHeaderId = Number(tmp);
            });
         });      //
      this.cdr.detectChanges ();
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


   /*
   PartitaMenuClick (event: MouseEvent, menu: Menu)
   {
      // Qui `menu` è il riferimento valido passato dal template
      menu.toggle (event);
      this.cdr.detectChanges (); // Forziamo un ciclo di change detection
   }
   */


   IsAdmin (): boolean
   {
      return (loggedUser.attributo >= 255);
   }


   ngOnDestroy() {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
      document.removeEventListener('click', this.FiltraDoppioTocco, true);
      this.swSubs.forEach (sub => sub.unsubscribe ());
   }


   // PWA: la nuova versione viene solo segnalata, mai attivata automaticamente
   // (un reload improvviso durante una partita dal vivo non e' accettabile)
   private InitServiceWorkerUpdates (): void
   {
      if (!this.swUpdate.isEnabled)
         return;
      this.swSubs.push (this.swUpdate.versionUpdates
         .pipe (filter ((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
         .subscribe (() => {
            this.updateDisponibile = true;
            this.cdr.markForCheck ();
         }));
      this.swSubs.push (this.swUpdate.unrecoverable.subscribe (evt => {
         console.error ('Service worker in stato non recuperabile:', evt.reason);
         this.updateDisponibile = true;
         this.cdr.markForCheck ();
      }));
      // Controllo periodico (ogni 15 minuti) se l'app resta aperta a lungo
      this.swSubs.push (interval (15 * 60 * 1000).subscribe (() => {
         if (navigator.onLine)
            this.swUpdate.checkForUpdate ().catch (err => console.warn ('checkForUpdate:', err));
      }));
   }


   AggiornaApp (): void
   {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
      window.location.reload ();
   }


   beforeUnloadHandler(event: BeforeUnloadEvent)
   {
      const msg: String = "Se veramente sicuro di voler chiudere l'applicazione?"; // Un valore qualsiasi o una stringa vuota
      event.preventDefault(); // Necessario in alcuni browser, ma obsoleto in altri
      event.returnValue = msg;
      return false; // Per compatibilità con i browser meno recenti
   }


   MatchAperto(): boolean
   {
      return (globs.openedMatchHeaderId > 0);
   }


   protected readonly loggedUser = loggedUser;
   protected readonly globs = globs;
}
