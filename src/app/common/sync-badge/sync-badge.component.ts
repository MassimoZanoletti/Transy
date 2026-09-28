import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
// PrimeNG modules
import {TooltipModule} from "primeng/tooltip";
import {MatchSyncService} from "../../services/match-sync.service";



// Stato del salvataggio sul server (coda di MatchSyncService): eventi di gioco, intestazione, roster,
// giocatori/allenatori nuovi. Solo indicatore, non cliccabile: i nuovi tentativi di invio sono automatici.
@Component ({
               selector:    'app-sync-badge',
               standalone:  true,
               imports:     [
                  CommonModule,
                  TooltipModule
               ],
               templateUrl: './sync-badge.component.html',
               styleUrl:    './sync-badge.component.css'
            })
export class SyncBadgeComponent
{
   constructor (public matchSync: MatchSyncService)
   {
   }


   Tooltip (): string
   {
      if (this.matchSync.lastError())
         return this.matchSync.lastError();
      if (!this.matchSync.online())
         return 'Offline: le modifiche sono salvate in locale e verranno inviate al ritorno della connessione';
      return (this.matchSync.pendingCount() === 0) ? 'Tutto salvato sul server' : 'Invio al server in corso';
   }
}
