
import {Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TableModule} from 'primeng/table';
import {TabViewModule} from 'primeng/tabview';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {TMatchPlayer} from "../../models/datamod";
import {matchGlobs} from "../../common/curr-match";
import {PlayerService} from "../../services/player.service";
import {firstValueFrom} from "rxjs";


// "numeroEdit"/"nomeEdit" sono i valori editabili (su cui l'utente digita); "origNumero"/"origNome" sono
// gli originali al momento dell'apertura, usati in BtnOk per capire quali giocatori sono stati davvero
// modificati — il numero si applica sempre e solo alla partita corrente, il nome anche al database
// giocatori (vedi la nota nel component).
type TNumeriNomiRow = { player: TMatchPlayer, numeroEdit: string, nomeEdit: string, origNumero: string, origNome: string };
type TNumeriNomiTeam = { teamName: string, rows: Array<TNumeriNomiRow> };


@Component({
   selector:    'app-numeri-nomi-dlg',
   standalone:  true,
   imports: [
      CommonModule,
      FormsModule,
      TableModule,
      TabViewModule,
      ButtonModule,
      InputTextModule,
   ],
   templateUrl: './numeri-nomi-dlg.component.html',
   styleUrl:    './numeri-nomi-dlg.component.css'
})
export class NumeriNomiDlgComponent
{
   public teams: Array<TNumeriNomiTeam> = [];
   public salvando: boolean = false;

   @Output() ok = new EventEmitter<void>();
   @Output() annulla = new EventEmitter<void>();


   constructor (private playerService: PlayerService)
   {
   }


   onComponentShow ()
   {
      const buildTeam = (teamName: string, roster: TMatchPlayer[]): TNumeriNomiTeam => ({
         teamName,
         rows: roster.map(p => ({
            player:     p,
            numeroEdit: p.playNumber(),
            nomeEdit:   p.playName(),
            origNumero: p.playNumber(),
            origNome:   p.playName()
         }))
      });
      this.teams = [
         buildTeam(matchGlobs.currMatch?.myTeam()?.name() ?? '', matchGlobs.currMatch?.myTeam()?.Roster ?? []),
         buildTeam(matchGlobs.currMatch?.oppTeam()?.name() ?? '', matchGlobs.currMatch?.oppTeam()?.Roster ?? [])
      ];
   }


   // Il numero di maglia si applica solo alla partita in corso (non tocca l'anagrafica giocatore): basta
   // scriverlo sul TMatchPlayer. Il nome invece è un dato anagrafico condiviso: va corretto anche sul
   // database giocatori, altrimenti la modifica sparirebbe alla prossima apertura/nuova partita dello
   // stesso giocatore. Per non perdere gli altri campi dell'anagrafica (cognome, ruolo, altezza, ecc.),
   // rileggiamo il record completo dal server e lo riscriviamo cambiando solo "nomedisp".
   async BtnOk ()
   {
      this.salvando = true;
      const nameUpdates: Array<{ player: TMatchPlayer, nome: string }> = [];
      for (const team of this.teams)
      {
         for (const row of team.rows)
         {
            const numero = (row.numeroEdit ?? '').trim();
            const nome = (row.nomeEdit ?? '').trim();
            if (numero !== row.origNumero)
               row.player.playNumber.set(numero);
            if (nome !== row.origNome)
            {
               row.player.playName.set(nome);
               nameUpdates.push({ player: row.player, nome });
            }
         }
      }
      for (const upd of nameUpdates)
      {
         await this.SalvaNomeSulDatabase(upd.player, upd.nome);
      }
      this.salvando = false;
      this.ok.emit();
   }


   private async SalvaNomeSulDatabase (player: TMatchPlayer,
                                       nuovoNome: string): Promise<void>
   {
      if (!player.playerRecID)
         return;
      try
      {
         const resp = await firstValueFrom (this.playerService.getSingleData (player.playerRecID));
         const el = resp?.elements;
         if (!resp?.ok || !el)
            return;
         await firstValueFrom (this.playerService.updateData (
            el.id, el.cognome, el.nome, nuovoNome, el.anno, el.ruolo, el.numero, el.altezza, el.foto, el.teamid_link
         ));
      }
      catch (e)
      {
         console.error('Errore salvataggio nome giocatore sul database', e);
      }
   }


   BtnAnnulla ()
   {
      this.annulla.emit();
   }
}
