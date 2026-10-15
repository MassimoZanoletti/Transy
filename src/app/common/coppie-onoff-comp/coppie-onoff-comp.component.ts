import {Component, Input} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {SelectButtonModule} from 'primeng/selectbutton';
import {TooltipModule} from 'primeng/tooltip';
import {COLORE_NOI} from "../grafico-differenza";
import {MIN_POSSESSI_RATING, MinutiQuintetto, NetQuintetto, NumQ, PlusMinusQuintetto, TInCampoStat, TQuintettoStat} from "../quintetti";
import {
   ColoreCoppia,
   DiffOnOff,
   ETICHETTE_METRICA,
   MatriceCoppie,
   MaxScalaCoppie,
   OnOff,
   TestoCoppia,
   TMatriceCoppie,
   TMetricaCoppie,
   TOnOffGiocatore,
   ValoreCoppia
} from "../coppie-onoff";


// On/Off dei giocatori e matrice delle coppie (tab "Statistiche" della partita e pagina "Statistiche
// campionato"), ricavati dai quintetti della squadra.
@Component({
   selector:    'app-coppie-onoff-comp',
   standalone:  true,
   imports:     [FormsModule, SelectButtonModule, TooltipModule],
   templateUrl: './coppie-onoff-comp.component.html',
   styleUrl:    './coppie-onoff-comp.component.css'
})
export class CoppieOnoffCompComponent
{
   @Input() set quintetti (q: TQuintettoStat[])
   {
      this.onOff = OnOff(q ?? []);
      this.matrice = MatriceCoppie(q ?? []);
      this.AggiornaScala();
   }

   public onOff: TOnOffGiocatore[] = [];
   public matrice: TMatriceCoppie = { giocatori: [], celle: [] };
   public metrica: TMetricaCoppie = 'pm';
   public readonly opzioniMetrica = [
      { label: '+/-', value: 'pm' },
      { label: 'Minuti', value: 'min' },
      { label: 'Net', value: 'net' }
   ];
   private maxScala = 1;

   public readonly Min = (c: TInCampoStat) => (c.secondi > 0) ? MinutiQuintetto(c) : '';
   public readonly Pm = (c: TInCampoStat) => (c.secondi > 0) ? PlusMinusQuintetto(c) : null;
   public readonly Net = NetQuintetto;
   public readonly Diff = DiffOnOff;
   public readonly Num = NumQ;
   public readonly Testo = TestoCoppia;
   public readonly tooltipOnOff = this.Tooltip('On/Off',
      `Come va la squadra con il giocatore in campo (On) e in panchina (Off). Net: punti fatti meno subiti ogni 100 possessi, solo con almeno ${MIN_POSSESSI_RATING} possessi. On - Off positivo: con lui in campo la squadra rende di più.`);


   EtichettaMetrica (): string
   {
      return ETICHETTE_METRICA[this.metrica];
   }


   AggiornaScala (): void
   {
      this.maxScala = MaxScalaCoppie(this.matrice, this.metrica);
   }


   // fondo della cella: colore della scala con trasparenza secondo l'intensità
   Fondo (c: TInCampoStat): string
   {
      const col = ColoreCoppia(ValoreCoppia(c, this.metrica), this.maxScala);
      if (!col)
         return 'transparent';
      const alfa = Math.round(255 * (0.15 + 0.7 * col.k)).toString(16).padStart(2, '0');
      return `${col.colore}${alfa}`;
   }


   // sul rosso chiaro intenso il testo chiaro non si legge: testo scuro
   TestoScuro (c: TInCampoStat): boolean
   {
      const col = ColoreCoppia(ValoreCoppia(c, this.metrica), this.maxScala);
      return (!!col) && (col.colore === COLORE_NOI) && (col.k > 0.45);
   }


   TitoloCella (i: number,
                j: number): string
   {
      const a = this.matrice.giocatori[i];
      const b = this.matrice.giocatori[j];
      const c = this.matrice.celle[i][j];
      const chi = (i === j) ? `${a.numero} ${a.nome}` : `${a.numero} ${a.nome} + ${b.numero} ${b.nome}`;
      if (c.secondi <= 0)
         return `${chi}: mai in campo insieme`;
      const net = NetQuintetto(c);
      return `${chi}: ${MinutiQuintetto(c)} min, punti ${c.noi.punti}-${c.loro.punti} (${NumQ(PlusMinusQuintetto(c), true) || '0'})` +
             ((net !== null) ? `, Net ${NumQ(net, true)}` : '');
   }


   private Tooltip (titolo: string,
                    descrizione: string): string
   {
      return `<span class='tt-titolo'><b>${titolo}</b></span><br><span class='tt-testo'>${descrizione}</span>`;
   }
}
