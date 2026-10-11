import {Component, Input} from '@angular/core';
import {
   COLORE_SVANTAGGIO,
   COLORE_VANTAGGIO,
   DescrizionePunto,
   Gradini,
   EtichettaQuarto,
   LimiteY,
   PassoY,
   PuntoAlTempo,
   TPuntoDiff,
   TSerieDiff
} from "../grafico-differenza";
import {TempoStr} from "../statistiche";


// Grafico a video (SVG) dello scarto lungo la partita: area a gradini blu (vantaggio) / arancio
// (svantaggio), divisione dei quarti, timeout e, al passaggio del mouse/dito, linea verticale con il
// punteggio in quel momento.
@Component({
   selector:    'app-grafico-differenza-comp',
   standalone:  true,
   imports:     [],
   templateUrl: './grafico-differenza-comp.component.html',
   styleUrl:    './grafico-differenza-comp.component.css'
})
export class GraficoDifferenzaCompComponent
{
   @Input() nomeNoi: string = '';
   @Input() nomeLoro: string = '';
   @Input() set serie (s: TSerieDiff | null)
   {
      this._serie = s;
      this.hover = null;
      this.Prepara();
   }
   get serie (): TSerieDiff | null { return this._serie; }
   private _serie: TSerieDiff | null = null;

   // area del grafico nel viewBox
   public readonly W = 900;
   public readonly H = 280;
   public readonly ML = 40;
   public readonly MR = 10;
   public readonly MT = 22;
   public readonly MB = 34;
   public readonly coloreVantaggio = COLORE_VANTAGGIO;
   public readonly coloreSvantaggio = COLORE_SVANTAGGIO;

   public lim = 5;
   public griglia: number[] = [];
   public gradini: { x: number, y: number, w: number, h: number, positivo: boolean }[] = [];
   public linea = '';
   public hover: { x: number, testo: string, aDestra: boolean } | null = null;


   private Prepara (): void
   {
      const s = this._serie;
      this.gradini = [];
      this.linea = '';
      this.griglia = [];
      if ((!s) || (s.durata <= 0))
         return;
      this.lim = LimiteY(s);
      const passo = PassoY(this.lim);
      for (let d = -this.lim; d <= this.lim; d += passo)
         this.griglia.push(d);
      this.gradini = Gradini(s).filter(g => g.diff !== 0).map(g => ({
         x: this.X(g.t0), w: this.X(g.t1) - this.X(g.t0),
         y: Math.min(this.Y(0), this.Y(g.diff)), h: Math.abs(this.Y(g.diff) - this.Y(0)),
         positivo: g.diff > 0
      }));
      // linea a gradini: orizzontale fino al canestro successivo, poi verticale
      let d = `M ${this.X(0)} ${this.Y(0)}`;
      for (const p of s.punti.slice(1))
         d += ` H ${this.X(p.t)} V ${this.Y(p.my - p.opp)}`;
      this.linea = d;
   }


   X (t: number): number
   {
      const durata = this._serie?.durata || 1;
      return this.ML + (this.W - this.ML - this.MR) * t / durata;
   }


   Y (diff: number): number
   {
      const h = this.H - this.MT - this.MB;
      return this.MT + h / 2 - (h / 2) * diff / this.lim;
   }


   Segno (d: number): string
   {
      return (d > 0) ? `+${d}` : `${d}`;
   }


   Diff (p: TPuntoDiff): number
   {
      return p.my - p.opp;
   }


   TitoloTimeout (to: { myTeam: boolean, quarto: number, tempo: number }): string
   {
      return `Timeout ${to.myTeam ? this.nomeNoi : this.nomeLoro} - ${EtichettaQuarto(to.quarto)} ${TempoStr(to.tempo)}`;
   }


   // posizione del puntatore -> punto della serie in vigore in quel momento
   Muovi (ev: PointerEvent): void
   {
      const s = this._serie;
      const svg = (ev.currentTarget as SVGGraphicsElement).ownerSVGElement;
      const ctm = svg?.getScreenCTM();
      if ((!s) || (!svg) || (!ctm))
         return;
      const pt = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(ctm.inverse());
      const t = Math.max(0, Math.min(s.durata, s.durata * (pt.x - this.ML) / (this.W - this.ML - this.MR)));
      const p = PuntoAlTempo(s, t);
      this.hover = { x: this.X(t), testo: DescrizionePunto(p, this.nomeNoi, this.nomeLoro), aDestra: (this.X(t) < this.W * 0.6) };
   }


   Esci (): void
   {
      this.hover = null;
   }
}
