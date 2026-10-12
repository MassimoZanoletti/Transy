import {Component, Input} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {SelectButtonModule} from 'primeng/selectbutton';
import {TooltipModule} from 'primeng/tooltip';
import {COLORE_NOI} from "../grafico-differenza";
import {DefAsse, NumU, ScaleUsage, TAsseVolume, TDefAsse, TUsageSquadra, TUsoGiocatore} from "../usage";


// Volume ed efficienza (tab "Statistiche" della partita e pagina "Statistiche campionato"): grafico a
// dispersione volume / TS% (un punto per giocatore col numero di maglia) e tabella accanto. Il volume
// sull'asse orizzontale è l'usage % (rispetto ai minuti in campo) o i tentativi di tiro (volume grezzo).
@Component({
   selector:    'app-usage-comp',
   standalone:  true,
   imports:     [FormsModule, SelectButtonModule, TooltipModule],
   templateUrl: './usage-comp.component.html',
   styleUrl:    './usage-comp.component.css'
})
export class UsageCompComponent
{
   @Input() set usage (u: TUsageSquadra | null)
   {
      this._usage = u;
      this.Prepara();
   }
   get usage (): TUsageSquadra | null { return this._usage; }
   private _usage: TUsageSquadra | null = null;
   // pagina del campionato: tentativi di tiro per partita
   @Input() set campionato (c: boolean)
   {
      this._campionato = c;
      this.Prepara();
   }
   get campionato (): boolean { return this._campionato; }
   private _campionato = false;

   public asse: TAsseVolume = 'usage';
   public readonly opzioniAsse = [{ label: 'Usage %', value: 'usage' }, { label: 'Tentativi di tiro', value: 'tiri' }];

   public readonly W = 560;
   public readonly H = 380;
   public readonly ML = 48;
   public readonly MR = 14;
   public readonly MT = 14;
   public readonly MB = 42;
   public readonly coloreNoi = COLORE_NOI;
   public readonly Num = NumU;
   public def: TDefAsse | null = null;
   public scala = { xMax: 40, xPasso: 10, yMin: 30, yMax: 80 };
   public punti: TUsoGiocatore[] = [];
   public grigliaX: number[] = [];
   public grigliaY: number[] = [];
   public hover: TUsoGiocatore | null = null;
   public tooltipLettura = '';
   public readonly tooltipUsage = `<span style='color: #ffff00'><b>Usage % (USG%)</b></span><br><span style='font-size: 0.8rem;'>` +
      `Quota dei possessi della squadra che il giocatore chiude (tiro, liberi o palla persa) mentre è in campo. ` +
      `Con 5 in campo la media è 20%: sopra 25-30% è il terminale offensivo. Va letto con il TS%: usage alto e TS% ` +
      `basso vuol dire molti possessi resi poco.</span>`;
   public readonly tooltipTiri = `<span style='color: #ffff00'><b>Tentativi di tiro</b></span><br><span style='font-size: 0.8rem;'>` +
      `Volume grezzo: tiri dal campo tentati + 0,44 x liberi tentati (a partita nel campionato). A differenza ` +
      `dell'usage non tiene conto dei minuti: premia chi gioca di più.</span>`;
   public readonly tooltipTs = `<span style='color: #ffff00'><b>TS% (True Shooting)</b></span><br><span style='font-size: 0.8rem;'>` +
      `Efficienza al tiro considerando anche i liberi: punti / (2 x (TdC tentati + 0,44 x TL tentati)).</span>`;


   Prepara (): void
   {
      this.hover = null;
      const u = this._usage;
      if (!u)
         return;
      const def = DefAsse(u, this.asse, this._campionato);
      this.def = def;
      this.scala = ScaleUsage(u, def);
      this.punti = u.giocatori.filter(g => (def.valore(g) !== null) && (g.ts !== null));
      this.grigliaX = [];
      for (let v = 0; v <= this.scala.xMax + 1e-9; v += this.scala.xPasso)
         this.grigliaX.push(Math.round(v * 1000) / 1000);
      this.grigliaY = [];
      for (let v = this.scala.yMin; v <= this.scala.yMax; v += 10)
         this.grigliaY.push(v);
      this.tooltipLettura = `<span style='color: #ffff00'><b>Come leggere il grafico</b></span><br><span style='font-size: 0.8rem;'>` +
         `${def.didascalia.intro}<br>` + def.didascalia.zone.map(z => `&bull; ${z}`).join('<br>') + `</span>`;
   }


   ValoreX (g: TUsoGiocatore): number
   {
      return this.def?.valore(g) ?? 0;
   }


   X (v: number): number
   {
      return this.ML + (this.W - this.ML - this.MR) * v / this.scala.xMax;
   }


   Y (v: number): number
   {
      return this.MT + (this.H - this.MT - this.MB) * (this.scala.yMax - v) / (this.scala.yMax - this.scala.yMin);
   }


   Min (s: number): string
   {
      const r = Math.round(s);
      return `${Math.floor(r / 60)}:${String(r % 60).padStart(2, '0')}`;
   }


   SogliaMinuti (): number
   {
      return Math.round((this._usage?.minSecondi ?? 0) / 60);
   }


   Titolo (g: TUsoGiocatore): string
   {
      return `${g.numero} ${g.nome}: usage ${NumU(g.usage)}%, tiri ${NumU(g.tiri)}${this._campionato ? ' a partita' : ''}, ` +
             `TS% ${NumU(g.ts)}%, ${g.punti} punti in ${this.Min(g.secondi)}`;
   }
}
