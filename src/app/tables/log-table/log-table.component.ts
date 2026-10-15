import {ChangeDetectorRef, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import {BlockUIModule} from "primeng/blockui";
import {Button, ButtonModule} from "primeng/button";
import {CardModule} from "primeng/card";
import {CommonModule, NgIf} from "@angular/common";
import {PrimeTemplate} from "primeng/api";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {Table, TableModule} from "primeng/table";
import {TooltipModule} from "primeng/tooltip";
import {InputTextModule} from "primeng/inputtext";
import { LogMessage,
   MessDlgData} from "../../models/datamod";
import {Router} from "@angular/router";
import {MessageDialogService} from "../../services/message-dialog.service";
import {LogService} from "../../services/log.service";
import {loggedUser} from "../../services/users.service";
import {firstValueFrom} from "rxjs";

@Component({
  selector:    'app-log-table',
  standalone:  true,
              imports: [
                 Button,
                 PrimeTemplate,
                 TableModule,
                 TooltipModule,
                 CommonModule,
                 ButtonModule,
                 TooltipModule,
                 CardModule,
                 ProgressSpinnerModule,
                 BlockUIModule,
                 InputTextModule
              ],
  templateUrl: './log-table.component.html',
  styleUrl:    './log-table.component.css'
})
// Consultazione del log del server (solo amministratori: voce di menu e rotta protette)
export class LogTableComponent implements OnInit
{
   windowHeight: number = 110;
   scrollHeight: string = "110px";
   isLoading: boolean = false;
   public tblData: Array<LogMessage> = [];
   // pulizia: righe più vecchie di MESI_PULIZIA mesi (il bottone compare solo se ce ne sono)
   public readonly MESI_PULIZIA = 6;
   public righeVecchie: number = 0;
   @ViewChild ('tabella') tabella?: Table;


   constructor (public router: Router,
                private cdr: ChangeDetectorRef,
                public theDataService: LogService,
                private messageDialogService: MessageDialogService)
   {
   }


   ngOnInit (): void
   {
      this.GetWindowSize ();
      //
      this.isLoading = true;
      this.LoadData ();
   }


   LoadData ()
   {
      this.isLoading = true;
      this.theDataService.getAllData().subscribe (data =>
                                                  {
                                                     if (data)
                                                     {
                                                        if (data.ok)
                                                        {
                                                           // il server dà le righe più recenti per prime: qui le più vecchie in alto
                                                           this.tblData = [...(data.elements ?? [])].reverse ();
                                                           this.ScrollAllaFine ();
                                                           this.ContaRigheVecchie ();
                                                        }
                                                        else
                                                        {
                                                           const dlgData: MessDlgData = {
                                                              title:      'ERRORE',
                                                              subtitle:   'Errore durante il caricamento dei dati dal server',
                                                              message:    `${data.message}`,
                                                              messtype:   'error',
                                                              btncaption: 'Chiudi'
                                                           };
                                                           this.messageDialogService.showMessage (dlgData, '600px');
                                                        }
                                                     }
                                                     else
                                                     {
                                                        const dlgData: MessDlgData = {
                                                           title:      'ERRORE',
                                                           subtitle:   'Errore durante il caricamento dei dati dal server',
                                                           message:    `No data returned`,
                                                           messtype:   'error',
                                                           btncaption: 'Chiudi'
                                                        };
                                                        this.messageDialogService.showMessage (dlgData, '600px');
                                                     }
                                                     this.isLoading = false;
                                                     this.cdr.detectChanges ();
                                                  });
   }


   // quante righe sono più vecchie di MESI_PULIZIA mesi (sul server: la tabella mostra solo le ultime)
   async ContaRigheVecchie ()
   {
      try
      {
         const r = await firstValueFrom (this.theDataService.getCountOld (this.MESI_PULIZIA));
         this.righeVecchie = r?.ok ? Number (r.elements?.count ?? 0) : 0;
      }
      catch
      {
         this.righeVecchie = 0;      // senza risposta il bottone non compare
      }
      this.cdr.detectChanges ();
   }


   PulisciLog ()
   {
      const dlgData: MessDlgData = {
         title:               'Pulizia log',
         subtitle:            '',
         message:             `Vuoi cancellare definitivamente le <b>${this.righeVecchie}</b> righe di log più vecchie di ${this.MESI_PULIZIA} mesi?`,
         messtype:            'warning',
         btncaption:          'Annulla',
         showCancelButton:    true,
         cancelButtonCaption: 'Sì, cancella'
      };
      this.messageDialogService.showMessage (dlgData, '', true).subscribe (async result =>
      {
         if (result !== 'secondary')
            return;
         this.isLoading = true;
         try
         {
            const r = await firstValueFrom (this.theDataService.deleteOld (this.MESI_PULIZIA));
            if (r?.ok)
               this.theDataService.AddToLog (loggedUser, "Log ripulito",
                                             `cancellate ${r.elements?.deleted ?? 0} righe precedenti al ${r.elements?.limite ?? ''}`);
            else
               this.messageDialogService.showMessage ({ title: 'ERRORE', subtitle: 'Pulizia del log non riuscita',
                                                        message: `${r?.message ?? 'Nessun dato ritornato'}`, messtype: 'error', btncaption: 'Chiudi' }, '600px');
         }
         catch (e: any)
         {
            this.messageDialogService.showMessage ({ title: 'ERRORE', subtitle: 'Pulizia del log non riuscita',
                                                     message: e?.message ?? `${e}`, messtype: 'error', btncaption: 'Chiudi' }, '600px');
         }
         this.LoadData ();      // ricarica tabella e conteggio (il bottone sparisce)
      });
   }


   // dopo il disegno delle righe: in vista le più recenti (in fondo)
   private ScrollAllaFine ()
   {
      setTimeout (() =>
      {
         const contenitore: HTMLElement | null = this.tabella?.el?.nativeElement?.querySelector ('.p-datatable-wrapper') ?? null;
         if (contenitore)
            contenitore.scrollTop = contenitore.scrollHeight;
      });
   }


   getRowColorClass (rowIndex: number): string
   {
      if ((rowIndex % 3) == 1)
         return "row-bck-1";
      if ((rowIndex % 3) == 2)
         return "row-bck-2";
      return "row-bck-0";
   }


   async GetWindowSize ()
   {
      this.windowHeight = window.innerHeight;
      let sh: number = this.windowHeight - 80 - 10 - 180;
      if (sh < 110)
         sh = 110;
      this.scrollHeight = `${sh}px`;
   }


   @HostListener ('window:resize', ['$event'])
   async onResize (event: any)
   {
      await this.GetWindowSize ();
   }


}

