import {Component, Input} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {TooltipModule} from 'primeng/tooltip';
import {COLORE_NOI} from "../grafico-differenza";
import {COLORE_CONFRONTO, NumR, PuntoRadar, TRadar, TRadarGiocatore} from "../radar";


// Radar di un giocatore (pagina "Statistiche campionato"): poligono del giocatore (rosso) sopra la media della
// squadra (grigio tratteggiato), con un secondo giocatore facoltativo da confrontare (viola); sotto la
// tabella con i valori reali di ogni asse.
@Component({
   selector:    'app-radar-comp',
   standalone:  true,
   imports:     [FormsModule, DropdownModule, TooltipModule],
   templateUrl: './radar-comp.component.html',
   styleUrl:    './radar-comp.component.css'
})
export class RadarCompComponent
{
   @Input() set radar (r: TRadar | null)
   {
      this._radar = r;
      this.opzioni = (r?.giocatori ?? []).map(g => ({ label: `${g.numero} ${g.nome}`, value: g.id }));
      this.opzioniConfronto = [{ label: 'nessuno', value: 0 }, ...this.opzioni];
      // giocatore scelto: resta lo stesso se c'è ancora, altrimenti quello con più minuti
      if (!this.opzioni.some(o => o.value === this.idScelto))
         this.idScelto = this.opzioni[0]?.value ?? 0;
      if (!this.opzioni.some(o => o.value === this.idConfronto))
         this.idConfronto = 0;
   }
   get radar (): TRadar | null { return this._radar; }
   private _radar: TRadar | null = null;

   public opzioni: { label: string, value: number }[] = [];
   public opzioniConfronto: { label: string, value: number }[] = [];
   public idScelto = 0;
   public idConfronto = 0;

   public readonly W = 460;
   public readonly H = 400;
   public readonly CX = 230;
   public readonly CY = 205;
   public readonly R = 140;
   public readonly anelli = [0.25, 0.5, 0.75, 1];
   public readonly coloreNoi = COLORE_NOI;
   public readonly coloreConfronto = COLORE_CONFRONTO;
   public readonly Num = NumR;
   public readonly tooltipRadar = `<span class='tt-titolo'><b>Come leggere il radar</b></span><br><span class='tt-testo'>` +
      `I conteggi sono riportati a 40 minuti di gioco, così chi gioca poco non è penalizzato. Ogni asse va da 0 al ` +
      `valore più alto della squadra: il radar mostra in cosa il giocatore è forte rispetto ai compagni. ` +
      `Per le palle perse il pieno vuol dire "nessuna". In grigio tratteggiato la media della squadra.</span>`;


   Scelto (): TRadarGiocatore | null
   {
      return this._radar?.giocatori.find(g => g.id === this.idScelto) ?? null;
   }


   Confronto (): TRadarGiocatore | null
   {
      return (this.idConfronto > 0) ? (this._radar?.giocatori.find(g => g.id === this.idConfronto) ?? null) : null;
   }


   Punto (i: number,
          r: number): [number, number]
   {
      return PuntoRadar(this.CX, this.CY, this.R, i, this._radar?.assi.length ?? 8, r);
   }


   Raggio (r: number): number
   {
      return Math.max(0.02, r);
   }


   Poligono (norm: number[]): string
   {
      return norm.map((r, i) => this.Punto(i, this.Raggio(r)).map(v => v.toFixed(1)).join(',')).join(' ');
   }


   Anello (r: number): string
   {
      return (this._radar?.assi ?? []).map((_, i) => this.Punto(i, r).map(v => v.toFixed(1)).join(',')).join(' ');
   }


   // etichetta dell'asse fuori dall'anello esterno
   Etichetta (i: number): { x: number, y: number, ancora: string }
   {
      const [x, y] = this.Punto(i, 1.13);
      return { x, y: y + 4, ancora: (Math.abs(x - this.CX) < 8) ? 'middle' : ((x > this.CX) ? 'start' : 'end') };
   }


   Minuti (g: TRadarGiocatore): string
   {
      return `${g.partite} partite, ${Math.round(g.secondi / 60)} minuti`;
   }


   SogliaMinuti (): number
   {
      return Math.round((this._radar?.minSecondi ?? 0) / 60);
   }
}
