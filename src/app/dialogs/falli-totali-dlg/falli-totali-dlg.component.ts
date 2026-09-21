
import {Component, ElementRef, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TableModule} from 'primeng/table';
import {TabViewModule} from 'primeng/tabview';
import {ButtonModule} from 'primeng/button';
import {CheckboxModule} from 'primeng/checkbox';
import {InputMaskModule} from 'primeng/inputmask';
import {InputTextModule} from 'primeng/inputtext';
import {TFallo, TMatchPlayer} from "../../models/datamod";
import {matchGlobs} from "../../common/curr-match";


// Una riga per ogni fallo del giocatore (5 per giocatore): "fallo" è un CLONE (come già fa fallo-dlg),
// modificato liberamente qui e scritto sul giocatore reale solo al click su "Ok" (BtnOk), così "Annulla"
// può scartare le modifiche senza toccare nulla. "tempoStr" è la rappresentazione mm:ss editabile del
// campo fTempo, allineata da OnTempoChange (stesso schema di tempi-gioco-dlg).
type TFalloEditRow = { fallo: TFallo, tempoStr: string };
type TPlayerFalliRow = { player: TMatchPlayer, falliRows: Array<TFalloEditRow> };
type TFalliTotaliTeam = { teamName: string, rows: Array<TPlayerFalliRow> };


@Component({
   selector:    'app-falli-totali-dlg',
   standalone:  true,
   imports: [
      CommonModule,
      FormsModule,
      TableModule,
      TabViewModule,
      ButtonModule,
      CheckboxModule,
      InputMaskModule,
      InputTextModule,
   ],
   templateUrl: './falli-totali-dlg.component.html',
   styleUrl:    './falli-totali-dlg.component.css'
})
export class FalliTotaliDlgComponent
{
   public teams: Array<TFalliTotaliTeam> = [];

   @Output() ok = new EventEmitter<void>();
   @Output() annulla = new EventEmitter<void>();


   constructor (private elRef: ElementRef<HTMLElement>)
   {
   }


   onComponentShow ()
   {
      const buildTeam = (teamName: string, roster: TMatchPlayer[]): TFalliTotaliTeam => ({
         teamName,
         rows: roster.map(p => ({
            player:    p,
            falliRows: p.falliFatti().map(f => this.BuildFalloEditRow(f.Clone()))
         }))
      });
      this.teams = [
         buildTeam(matchGlobs.currMatch?.myTeam()?.name() ?? '', matchGlobs.currMatch?.myTeam()?.Roster ?? []),
         buildTeam(matchGlobs.currMatch?.oppTeam()?.name() ?? '', matchGlobs.currMatch?.oppTeam()?.Roster ?? [])
      ];
   }


   private BuildFalloEditRow (fallo: TFallo): TFalloEditRow
   {
      return { fallo, tempoStr: this.FormatTempo(fallo.fTempo) };
   }


   private FormatTempo (seconds: number): string
   {
      const sec = Math.max(0, Math.trunc(seconds || 0));
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
   }


   // Richiamato quando l'utente completa/lascia il campo mm:ss di un fallo: interpreta il testo digitato,
   // limita i secondi a 0-59, riallinea fTempo e riformatta il testo mostrato (stesso schema usato in
   // tempi-gioco-dlg per OnTempiGiocoTimeChange).
   OnTempoChange (row: TFalloEditRow)
   {
      const parts = (row.tempoStr || '').split(':');
      const mm = parseInt(parts[0], 10) || 0;
      const ss = Math.min(59, parseInt(parts[1], 10) || 0);
      row.fallo.fTempo = mm * 60 + ss;
      row.tempoStr = this.FormatTempo(row.fallo.fTempo);
   }


   TotFalliRow (row: TPlayerFalliRow): number
   {
      return row.falliRows.filter(fr => fr.fallo.fCommesso).length;
   }


   // Quando si espande un giocatore in fondo alla lista, le 5 righe dei suoi falli possono restare in
   // parte fuori dall'area visibile: scrolla automaticamente in modo che siano tutte visibili. Rimandato
   // a dopo il render (setTimeout) perché al momento dell'evento la riga espansa non esiste ancora nel DOM.
   OnRowExpand (event: { data: TPlayerFalliRow })
   {
      const key = event.data.player.playerRecID;
      setTimeout(() =>
      {
         const togglerRow = this.elRef.nativeElement.querySelector(`tr[data-player-key="${key}"]`);
         const expansionRow = togglerRow?.nextElementSibling as HTMLElement | null;
         expansionRow?.scrollIntoView({ block: 'end', behavior: 'smooth' });
      });
   }


   BtnOk ()
   {
      for (const team of this.teams)
      {
         for (const row of team.rows)
         {
            row.player.falliFatti.set(row.falliRows.map(fr => fr.fallo));
         }
      }
      this.ok.emit();
   }


   BtnAnnulla ()
   {
      this.annulla.emit();
   }
}
