import {ChangeDetectorRef, Component} from '@angular/core';
import {Router} from "@angular/router";
import {firstValueFrom} from "rxjs";
import {ButtonModule} from "primeng/button";
import {DividerModule} from "primeng/divider";
import {TableModule} from "primeng/table";
import {
   IDSChamp,
   IDSMatchHeader,
   IDSTeam,
   MessDlgData,
   TDSMatchRoster
} from "../../models/datamod";
import {TCurrMatch} from "../../common/curr-match";
import {TOperationList} from "../../common/operation";
import {TTiriStat} from "../../common/statistiche";
import {
   MediePartite,
   RicostruisciPartita,
   RigaPartita,
   TotaliPartite,
   TRigaStatCamp
} from "../../common/statistiche-campionato";
import {MatchheaderService} from "../../services/matchheader.service";
import {MatchrosterService} from "../../services/matchroster.service";
import {TeamService} from "../../services/team.service";
import {MatchSyncService} from "../../services/match-sync.service";
import {MessageDialogService} from "../../services/message-dialog.service";



// Dati passati dalla finestra "Statistiche campionato" della Dashboard (router state)
export interface TStatCampionatoParams
{
   team: IDSTeam;
   champ: IDSChamp;
   matches: Array<IDSMatchHeader>;
}



@Component ({
               selector:    'app-stat-campionato-page',
               standalone:  true,
               imports: [
                  ButtonModule,
                  DividerModule,
                  TableModule
               ],
               templateUrl: './stat-campionato-page.component.html',
               styleUrl:    './stat-campionato-page.component.css'
            })
export class StatCampionatoPageComponent
{
   public team: IDSTeam | null = null;
   public champ: IDSChamp | null = null;
   public matches: Array<IDSMatchHeader> = [];
   public righe: Array<TRigaStatCamp> = [];
   public totali: TRigaStatCamp | null = null;
   public medie: TRigaStatCamp | null = null;
   public elaborazione: boolean = false;
   // minimo e massimo per colonna, sulle sole righe delle partite (per i colori)
   private minMax: Record<string, { min: number, max: number }> = {};


   constructor (public router: Router,
                private cdr: ChangeDetectorRef,
                private servMatchHeader: MatchheaderService,
                private servMatchRoster: MatchrosterService,
                private servTeam: TeamService,
                private matchSync: MatchSyncService,
                private messageDialogService: MessageDialogService)
   {
      // la pagina si raggiunge solo dalla finestra di selezione delle partite: senza i suoi dati
      // (URL scritto a mano, refresh) si torna alla Dashboard
      const params: TStatCampionatoParams | undefined = this.router.getCurrentNavigation ()?.extras.state as TStatCampionatoParams | undefined;
      if ((params) && (params.team) && (params.champ) && (params.matches))
      {
         this.team = params.team;
         this.champ = params.champ;
         this.matches = params.matches;
      }
      else
         setTimeout (() => this.router.navigate (['/']));
   }


   // Ricalcola da zero la tabella, rileggendo roster ed eventi di ogni partita selezionata
   async ElaboraStatistiche ()
   {
      if ((!this.team) || (this.elaborazione))
         return;
      const teamId: number = Number(this.team.id);
      this.elaborazione = true;
      try
      {
         const righe: Array<TRigaStatCamp> = [];
         for (const mh of this.matches)
         {
            const [rosterData, { events }] = await Promise.all ([
               firstValueFrom (this.servMatchRoster.getAllData (mh.id)),
               this.matchSync.LoadMatchEvents (mh.id)
            ]);
            const roster: Array<TDSMatchRoster> = ((rosterData) && (rosterData.elements)) ? rosterData.elements : [];
            const cm = new TCurrMatch (this.servMatchHeader, this.servMatchRoster, this.servTeam);
            const opList = await TOperationList.Create ();
            RicostruisciPartita (cm, roster, events, (ev, my, opp) => this.matchSync.EventToOperation (ev, my, opp), opList);
            righe.push (RigaPartita (mh, cm, teamId));
         }
         this.righe = righe;
         this.minMax = {};
         for (const col of ['puntiF', 'puntiS', 'dif', 'ff', 'fs', 'rd', 'ra', 'rt', 'pp', 'pr', 'as', 'pir'] as const)
         {
            const valori = righe.map (r => r[col]);
            this.minMax[col] = { min: Math.min (...valori), max: Math.max (...valori) };
         }
         // percentuali: escluse le partite senza tentativi (cella vuota)
         for (const col of ['tl', 't2', 't3'] as const)
         {
            const valori = righe.map (r => this.PercVal (r[col])).filter ((v): v is number => v !== null);
            if (valori.length > 0)
               this.minMax[col] = { min: Math.min (...valori), max: Math.max (...valori) };
         }
         this.totali = TotaliPartite (righe);
         this.medie = MediePartite (this.totali, righe.length);
      }
      catch (err)
      {
         const dlgData: MessDlgData = {
            title:      'ERRORE',
            subtitle:   'Errore durante l\'elaborazione delle statistiche',
            message:    `${JSON.stringify(err,null,3)}`,
            messtype:   'error',
            btncaption: 'Chiudi'
         };
         this.messageDialogService.showMessage (dlgData, '600px');
      }
      finally
      {
         this.elaborazione = false;
         // le letture degli eventi finiscono in callback di IndexedDB, fuori dalla change detection di Angular
         this.cdr.detectChanges ();
      }
   }


   // numero con al massimo un decimale, alla italiana (68,2 / 61)
   Num (valore: number): string
   {
      return valore.toLocaleString ('it-IT', { maximumFractionDigits: 1 });
   }


   // classe colore per il valore più alto/basso della colonna: altoVerde = il valore più alto è il migliore
   // (punti fatti, differenza), altrimenti il migliore è il più basso (punti subiti). Nessun colore se tutti
   // i valori della colonna sono uguali.
   ColoreMinMax (valore: number,
                 colonna: string,
                 altoVerde: boolean): string
   {
      const mm = this.minMax[colonna];
      if ((!mm) || (mm.min === mm.max))
         return '';
      if (valore === mm.max)
         return altoVerde ? 'valore-migliore' : 'valore-peggiore';
      if (valore === mm.min)
         return altoVerde ? 'valore-peggiore' : 'valore-migliore';
      return '';
   }


   // percentuale arrotondata al decimale mostrato (così il confronto min/max segue quanto si vede);
   // null se nessun tentativo
   PercVal (t: TTiriStat): number | null
   {
      return (t.tentati > 0) ? Math.round (1000 * t.realizzati / t.tentati) / 10 : null;
   }


   ColorePerc (t: TTiriStat,
               colonna: string): string
   {
      const v = this.PercVal (t);
      return (v === null) ? '' : this.ColoreMinMax (v, colonna, true);
   }


   Perc (t: TTiriStat): string
   {
      // sempre una cifra decimale (50,0)
      return (t.tentati > 0) ? (100 * t.realizzati / t.tentati).toLocaleString ('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '';
   }


   TornaDashboard ()
   {
      this.router.navigate (['/']);
   }
}
