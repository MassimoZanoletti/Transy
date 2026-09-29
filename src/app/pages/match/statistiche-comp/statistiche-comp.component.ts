import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TableModule} from 'primeng/table';
import {TooltipModule} from 'primeng/tooltip';
import {ButtonModule} from 'primeng/button';
import {DividerModule} from 'primeng/divider';
import {IDSMatchHeader} from "../../../models/datamod";
import {matchGlobs} from "../../../common/curr-match";
import {globs} from "../../../common/utils";
import {AndamentoQuarti, MinutiPerQuarto, TabellaSquadra, TContestoLive, TQuartoAndamento, TTabellaStat, TTiriStat} from "../../../common/statistiche";


// Tab "Statistiche" della partita: stessa impostazione della pagina "Tabelle" di nebula (intestazione,
// andamento per quarto, tabella per giocatore di MyTeam e di OppoTeam con i totali di squadra).
// I dati si ricalcolano con Aggiorna() (all'apertura del tab e col pulsante "Aggiorna").
@Component({
   selector:    'app-statistiche-comp',
   standalone:  true,
   imports: [
      CommonModule,
      TableModule,
      TooltipModule,
      ButtonModule,
      DividerModule
   ],
   templateUrl: './statistiche-comp.component.html',
   styleUrl:    './statistiche-comp.component.css'
})
export class StatisticheCompComponent
{
   @Input() matchHeader: IDSMatchHeader | null = null;
   @Input() myCoach1: string = '';
   @Input() myCoach2: string = '';
   @Input() oppoCoach1: string = '';
   @Input() oppoCoach2: string = '';
   // situazione del cronometro (quarto, tempo, quarti giocati), fornita dalla pagina della partita
   @Input() getContestoLive: () => TContestoLive = () => ({ quarto: 1, tempo: globs.DurationRegulTime, quartoGiocato: () => false });

   public readonly tooltipPir  = this.Tooltip('Performance Index Rating', 'Indice di valutazione globale che tiene conto di tutto ma non dei minuti giocati.');
   public readonly tooltipOer  = this.Tooltip('Offensive Efficency Rating', 'Indice di efficienza offensiva.');
   public readonly tooltipEfg  = this.Tooltip('Effective Field Goal perc.', 'Indice di efficienza nel tiro dal campo (senza liberi), con peso maggiore per tiri da 3.');
   public readonly tooltipTs   = this.Tooltip('True Shooting perc.', 'Indice di efficienza realizzativa considerando anche i liberi.');

   public titolo: string = '';
   public punteggio: string = '';
   public andamento: TQuartoAndamento[] = [];
   public tabelle: TTabellaStat[] = [];
   public aggiornatoAlle: string = '';


   Aggiorna (): void
   {
      const cm = matchGlobs.currMatch;
      const mh = this.matchHeader;
      if (!cm || !mh)
         return;
      const myTeam = cm.myTeam();
      const oppTeam = cm.oppTeam();
      const ops = cm.matchOperList()?.items() ?? [];
      const live = this.getContestoLive();
      const quartiGiocati: number[] = [];
      for (let q = 1; q <= globs.MaxRegQuarters + globs.MaxExtraQuarters; q++)
      {
         const punti = (myTeam?.GetQuarto(q - 1)?.punti ?? 0) + (oppTeam?.GetQuarto(q - 1)?.punti ?? 0);
         if (live.quartoGiocato(q) || (punti > 0))
            quartiGiocati.push(q);
      }
      const giocatori = [...(myTeam?.Roster ?? []), ...(oppTeam?.Roster ?? [])];
      const minuti = MinutiPerQuarto(ops, giocatori, live);

      const myNome = mh.myTeamNome_lk;
      const oppNome = mh.oppoTeamNome_lk;
      const myPunti = myTeam?.CalcPunti() ?? 0;
      const oppPunti = oppTeam?.CalcPunti() ?? 0;
      this.titolo = mh.atHome ? `${myNome} - ${oppNome}` : `${oppNome} - ${myNome}`;
      this.punteggio = mh.atHome ? `${myPunti} - ${oppPunti}` : `${oppPunti} - ${myPunti}`;
      this.andamento = AndamentoQuarti(ops, myTeam, oppTeam, mh.atHome, quartiGiocati, live);
      // la pagina della partita usa l'id ("0") quando l'allenatore non è indicato
      const coach = (c: string) => ((c ?? '').trim() === '0') ? '' : c;
      this.tabelle = [
         TabellaSquadra(myTeam, myNome, true, minuti, quartiGiocati, coach(this.myCoach1), coach(this.myCoach2)),
         TabellaSquadra(oppTeam, oppNome, false, minuti, quartiGiocati, coach(this.oppoCoach1), coach(this.oppoCoach2))
      ];
      const ora = new Date();
      this.aggiornatoAlle = `${String(ora.getHours()).padStart(2, '0')}:${String(ora.getMinutes()).padStart(2, '0')}:${String(ora.getSeconds()).padStart(2, '0')}`;
   }


   Arbitri (): string
   {
      return [this.matchHeader?.arbitro1, this.matchHeader?.arbitro2].filter(a => !!a).join(' - ');
   }


   CasaTrasferta (): string
   {
      const luogo = this.matchHeader?.location ? ` (${this.matchHeader.location})` : '';
      return (this.matchHeader?.atHome ? 'in casa' : 'in trasferta') + luogo;
   }


   Giornata (): string
   {
      const num = this.matchHeader?.matchNumber ? ` (${this.matchHeader.matchNumber})` : '';
      return `${this.matchHeader?.giornata ?? ''}${num}`;
   }


   // "realizzati/tentati" + percentuale (troncata, come nebula); vuoto se nessun tentativo
   TiriStr (t: TTiriStat): string
   {
      return (t.tentati > 0) ? `${t.realizzati}/${t.tentati}` : '';
   }


   TiriPerc (t: TTiriStat): string
   {
      return (t.tentati > 0) ? `(${Math.trunc(100 * t.realizzati / t.tentati)}%)` : '';
   }


   private Tooltip (titolo: string,
                    descrizione: string): string
   {
      return `<span style='color: #ffff00'><b>${titolo}</b></span><br><span style='font-size: 0.8rem;'>${descrizione}</span>`;
   }
}
