
import {Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ButtonModule} from 'primeng/button';
import {InputMaskModule} from 'primeng/inputmask';
import {TMatchPlayer} from "../../models/datamod";
import {utils} from "../../common/utils";
import {matchGlobs} from "../../common/curr-match";


type TTempiGiocoRow = { player: TMatchPlayer, seconds: number, timeStr: string };
type TTempiGiocoTeam = { teamName: string, teamColor: string, rows: Array<TTempiGiocoRow> };


@Component({
   selector:    'app-tempi-gioco-dlg',
   standalone:  true,
   imports: [
      CommonModule,
      FormsModule,
      ButtonModule,
      InputMaskModule,
   ],
   templateUrl: './tempi-gioco-dlg.component.html',
   styleUrl:    './tempi-gioco-dlg.component.css'
})
export class TempiGiocoDlgComponent
{
   public tempiGiocoTeams: Array<TTempiGiocoTeam> = [];
   private tempiGiocoOpenClockSec: number = 0;

   @Output() ok = new EventEmitter<void>();
   @Output() annulla = new EventEmitter<void>();


   // "nowSec" è il tempo davvero corrente del cronometro (non un valore "congelato"): questa finestra deve
   // sempre mostrare il totale reale, anche se aperta a cronometro in corsa. Lo teniamo anche per BtnOk(),
   // così il salvataggio è l'esatto inverso di questo calcolo (stesso istante di riferimento).
   async onComponentShow (myTeamColor: string,
                          oppoTeamColor: string,
                          nowSec: number)
   {
      const myTeam = matchGlobs.currMatch?.myTeam();
      const oppTeam = matchGlobs.currMatch?.oppTeam();
      this.tempiGiocoOpenClockSec = nowSec;
      // Include anche lo stint in corso per chi è attualmente in campo (vedi TMatchPlayer.GetTempoGiocoLive).
      const buildRow = (p: TMatchPlayer): TTempiGiocoRow =>
      {
         const liveExtra = p.inGioco() ? Math.max(0, p.inTime() - nowSec) : 0;
         const seconds = p.tempoGioco() + liveExtra;
         return { player: p, seconds, timeStr: this.GetTempiGiocoTimeStr(seconds) };
      };
      this.tempiGiocoTeams = [
         {
            teamName:  myTeam?.name() ?? '',
            teamColor: myTeamColor,
            rows:      (myTeam?.Roster ?? []).map(buildRow)
         },
         {
            teamName:  oppTeam?.name() ?? '',
            teamColor: oppoTeamColor,
            rows:      (oppTeam?.Roster ?? []).map(buildRow)
         }
      ];
   }


   // Colore leggibile (bianco/nero) sopra lo sfondo colorato della squadra (formula YIQ),
   // stessa logica usata per le dialog Sostituzione/Timeout.
   GetContrastTextColor (bgColor: string): string
   {
      const hex = (bgColor || '#FFFFFF').replace('#', '');
      if (hex.length !== 6)
         return '#000000';
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return yiq >= 128 ? '#000000' : '#ffffff';
   }


   GetTempiGiocoTimeStr (seconds: number): string
   {
      const sec = Math.max(0, Math.trunc(seconds || 0));
      const mm = Math.trunc(sec / 60);
      const ss = sec % 60;
      return `${utils.Dlt_PadDigits(mm, 2)}:${utils.Dlt_PadDigits(ss, 2)}`;
   }


   GetTempiGiocoTotaleStr (rows: Array<TTempiGiocoRow>): string
   {
      const tot = rows.reduce((acc, r) => acc + (r.seconds || 0), 0);
      return this.GetTempiGiocoTimeStr(tot);
   }


   // Richiamato quando l'utente completa/lascia il campo mm:ss di una riga: interpreta il testo digitato,
   // limita i secondi a 0-59 (i minuti sono già limitati a 0-99 dalla mask), riallinea "seconds" e
   // riformatta il testo mostrato in modo che l'eventuale correzione sia visibile.
   OnTempiGiocoTimeChange (row: TTempiGiocoRow)
   {
      const parts = (row.timeStr || '').split(':');
      const mm = parseInt(parts[0], 10) || 0;
      const ss = Math.min(59, parseInt(parts[1], 10) || 0);
      row.seconds = mm * 60 + ss;
      row.timeStr = this.GetTempiGiocoTimeStr(row.seconds);
   }


   BtnOk ()
   {
      for (const team of this.tempiGiocoTeams)
      {
         for (const row of team.rows)
         {
            const newTotal = Math.max(0, Math.trunc(row.seconds || 0));
            if (row.player.inGioco())
            {
               // Il giocatore è ancora in campo: il "precedente" (tempoGioco) resta invariato, è storia già
               // consolidata. Tutta la differenza va sullo stint in corso, spostando "inTime" in modo che
               // (inTime - tempo al momento dell'apertura) riproduca esattamente il nuovo totale — permette
               // di correggere il totale anche sotto lo stint già trascorso, cosa che sottrarlo da tempoGioco
               // non può fare (andrebbe negativo e verrebbe perso).
               const newInCampo = Math.max(0, newTotal - row.player.tempoGioco());
               row.player.inTime.set(this.tempiGiocoOpenClockSec + newInCampo);
            }
            else
            {
               row.player.tempoGioco.set(newTotal);
            }
         }
      }
      this.ok.emit();
   }


   BtnAnnulla ()
   {
      this.annulla.emit();
   }
}
