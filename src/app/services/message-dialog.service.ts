import { Injectable } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessDlgData, MessDialogResult  } from '../models/datamod';
import { MessDialogPrimeNgComponent } from '../dialogs/mess-dialog/mess-dialog.component';
import { Observable } from 'rxjs';
import { LogService } from './log.service';
import { loggedUser } from './users.service';

@Injectable({
               providedIn: 'root' // Disponibile globalmente nell'applicazione standalone
            })
export class MessageDialogService {

   private dialogRef: DynamicDialogRef | undefined;

   constructor(private dialogService: DialogService,
               private logService: LogService) { }

   /**
    * Mostra un dialogo di messaggio personalizzato.
    * @param data I dati del messaggio (titolo, messaggio, tipo, ecc.)
    * @param width La larghezza del dialogo (es. '500px', '70%').
    * @param disableClose Impedisce la chiusura cliccando fuori o con ESC (default: true).
    * @returns Un Observable che emette il risultato alla chiusura del dialogo.
    */
   showMessage(data: MessDlgData, width: string = '500px', disableClose: boolean = true): Observable<MessDialogResult> {
      // ogni errore mostrato all'utente finisce anche nel log del server
      if (data.messtype === 'error')
         this.logService.AddErrorToLog (loggedUser, [data.title, data.subtitle, data.message].filter (t => !!t).join (' | '));
      this.dialogRef = this.dialogService.open(MessDialogPrimeNgComponent, {
         data: data,
         header: '', // Mantenuto vuoto per usare il tuo header interno
         width: width,
         modal: true,
         closable: !disableClose,
         dismissableMask: !disableClose,
         styleClass: `messagedlg-${data.messtype || 'info'}`
      });

      // Restituisci l'observable onClose per il componente chiamante
      return this.dialogRef.onClose as Observable<MessDialogResult>;
   }

   closeDialog(result?: MessDialogResult): void {
      if (this.dialogRef) {
         this.dialogRef.close(result);
         this.dialogRef = undefined;
      }
   }
}
