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

