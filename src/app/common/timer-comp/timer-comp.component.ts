
import {Component, OnInit, OnDestroy, Input, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
// PrimeNG modules
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {TooltipModule} from "primeng/tooltip";
import {InputMaskModule} from "primeng/inputmask";
import {FormsModule} from "@angular/forms";
import { DialogModule } from 'primeng/dialog';



@Component ({
               selector:    'app-timer-comp',
               standalone:  true,
               imports:     [
                  CommonModule,
                  ButtonModule,
                  TooltipModule,
                  InputMaskModule,
                  FormsModule,
                  DialogModule
               ],
               templateUrl: './timer-comp.component.html',
               styleUrl:    './timer-comp.component.css'
            })
export class TimerCompComponent implements OnInit, OnDestroy
{

   // Input personalizzabili
   @Input () initialMinutes: number = 10;
   @Input () instanceId: string = 'default';
   @Input () currQuarter: string = "1q";

   // Output per la comunicazione con il componente padre
   @Output () timeUpdated = new EventEmitter<{ id: string, time: number }> ();
   @Output () started = new EventEmitter<{ id: string }> ();
   @Output () stopped = new EventEmitter<{ id: string }> ();

   // Variabili interne
   private timerInterval: any;
   private totalSeconds: number = 600;
   private startTime: number = 600;
   private pausedTime: number = 600;
   public displayTime: string = '10:00';
   public isRunning: boolean = false;
   colSfondoStop: string = "#3949ab";
   colSfondoStart: string = "#a0e77f";
   colSfondo: string = this.colSfondoStop;
   deltaTime: number = 0;
   inEditing: boolean = false;
   newTimeValue: string = "";
   quartiVisible: boolean = false;


   // Chiavi dinamiche per localStorage
   private get startTimeKey (): string
   {
      return `countdownStartTime-${this.instanceId}`;
   }


   private get pausedTimeKey (): string
   {
      return `countdownPausedTime-${this.instanceId}`;
   }


   ngOnInit (): void
   {
      const savedPausedTime = localStorage.getItem (this.pausedTimeKey);
      const savedStartTime = localStorage.getItem (this.startTimeKey);

      // Se c'è un tempo in pausa, il timer riparte da lì
      if (savedPausedTime)
      {
         this.totalSeconds = parseInt (savedPausedTime, 10);
         this.updateDisplay (this.totalSeconds);
      }
      // Se il timer era in esecuzione prima del refresh, riprende
      else if (savedStartTime)
      {
         this.totalSeconds = this.initialMinutes * 60;
         this.startTime = parseInt (savedStartTime, 10);
         this.isRunning = true;
         this.startCountdown ();
      }
      else
      {
         // Altrimenti, resetta il timer con il valore iniziale
         this.resetTimer ();
      }
      this.updateDisplay ();
      this.deltaTime = 0;
   }


   start (): void
   {
      if (!this.isRunning)
      {
         this.colSfondo = this.colSfondoStart;
         this.isRunning = true;

         const savedPausedTime = localStorage.getItem (this.pausedTimeKey);

         // Se il cronometro era in pausa, riprende da dove si era fermato
         if (savedPausedTime)
         {
            this.totalSeconds = parseInt (savedPausedTime, 10) + this.deltaTime +1;
            localStorage.removeItem (this.pausedTimeKey);
         }
         else
         {
            // Altrimenti, parte dall'inizio
            this.totalSeconds = this.initialMinutes * 60;
         }

         this.startTime = Date.now ();
         localStorage.setItem (this.startTimeKey, this.startTime.toString ());
         this.startCountdown ();
         this.started.emit ({id: this.instanceId});
         this.deltaTime = 0;
      }
   }


   stop (): void
   {
      this.colSfondo = this.colSfondoStop;
      if (this.timerInterval)
      {
         clearInterval (this.timerInterval);
         this.isRunning = false;

         // Calcola il tempo rimanente e lo salva nel localStorage
         const timeElapsed = (Date.now () - this.startTime) / 1000;
         const timeLeft = Math.floor (this.totalSeconds - timeElapsed);
         this.pausedTime = timeLeft > 0 ? timeLeft : 0;
         localStorage.setItem (this.pausedTimeKey, this.pausedTime.toString ());
         localStorage.removeItem (this.startTimeKey);

         this.stopped.emit ({id: this.instanceId});
         this.updateDisplay (this.pausedTime);
      }
   }


   private startCountdown (): void
   {
      this.timerInterval = setInterval (() =>
                                        {
                                           const timeElapsed = (Date.now () - this.startTime) / 1000;
                                           const timeLeft = this.totalSeconds - timeElapsed;

                                           if (timeLeft > 0)
                                           {
                                              this.updateDisplay (timeLeft);
                                              this.timeUpdated.emit ({id:     this.instanceId,
                                                                        time: Math.floor (timeLeft)
                                                                     });
                                           }
                                           else
                                           {
                                              this.stop ();
                                              this.updateDisplay (0);
                                              this.timeUpdated.emit ({id: this.instanceId, time: 0});
                                           }
                                        }, 1000);
   }


   resetTimer (): void
   {
      if (this.isRunning == false)
      {
         this.totalSeconds = this.initialMinutes * 60;
         this.startTime = Date.now ();
         this.clearLocalStorage ();
      }
   }


   updateDisplay (seconds: number = this.totalSeconds): void
   {
      const minutes = Math.floor (seconds / 60);
      const remainingSeconds = Math.floor (seconds % 60);
      const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
      const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;
      this.displayTime = `${formattedMinutes}:${formattedSeconds}`;
   }


   private clearLocalStorage (): void
   {
      localStorage.removeItem (this.startTimeKey);
      localStorage.removeItem (this.pausedTimeKey);
   }


   ngOnDestroy (): void
   {
      this.stop ();
   }


   PiuUno()
   {
      if (this.isRunning)
      {
         this.totalSeconds += 1;
      }
      else
      {
         this.deltaTime += 1;
         let savedPausedTime: string | null = null;
         savedPausedTime = localStorage.getItem (this.pausedTimeKey);
         if (savedPausedTime)
         {
            const tt: number = parseInt (savedPausedTime, 10) + this.deltaTime;
            this.updateDisplay (tt);
         }
      }
   }


   MenoUno()
   {
      if (this.isRunning)
      {
         this.totalSeconds -= 1;
      }
      else
      {
         this.deltaTime -= 1;
         let savedPausedTime: string | null = null;
         savedPausedTime = localStorage.getItem (this.pausedTimeKey);
         if (savedPausedTime)
         {
            const tt: number = parseInt (savedPausedTime, 10) + this.deltaTime;
            this.updateDisplay (tt);
         }
      }
   }


   MenoCinque()
   {
      if (this.isRunning)
      {
         this.totalSeconds -= 5;
      }
      else
      {
         this.deltaTime -= 5;
         let savedPausedTime: string | null = null;
         savedPausedTime = localStorage.getItem (this.pausedTimeKey);
         if (savedPausedTime)
         {
            const tt: number = parseInt (savedPausedTime, 10) + this.deltaTime;
            this.updateDisplay (tt);
         }
      }
   }


   EditTime()
   {
      if (this.isRunning)
         return;
      this.inEditing = true;
      this.newTimeValue = this.displayTime;
   }


   CancelEditing()
   {
      this.inEditing = false;
   }


   SaveEditing()
   {
      this.inEditing = false;
      if (this.newTimeValue != "")
      {
         const sm: string = this.newTimeValue.substring(0,2);
         const ss: string = this.newTimeValue.substring(3,5);
         const min: number = parseInt(sm, 10);
         const sec: number = parseInt(ss, 10);
         //if ((min != NaN) && (sec != NaN))
         {
            const tot = sec + (60 * min);
            this.updateDisplay (tot);
            this.pausedTime = tot;
            localStorage.setItem (this.pausedTimeKey, this.pausedTime.toString ());
            localStorage.removeItem (this.startTimeKey);
         }
      }
   }


   SelezionaQuarto (quarto: string)
   {
      this.currQuarter = quarto;
      this.quartiVisible = false;
   }


   public CurrentTime(): number
   {
      const timeElapsed = (Date.now () - this.startTime) / 1000;
      return (this.totalSeconds - timeElapsed);
   }


   public GetTimeSeconds(): number
   {
      if (this.isRunning)
         return Math.floor(this.CurrentTime());
      else
         return this.pausedTime;
   }


   public GetQuarterNumber(): number
   {
      return parseInt(this.currQuarter, 10);
   }

}
