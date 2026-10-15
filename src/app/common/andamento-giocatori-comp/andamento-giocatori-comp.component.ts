import {Component, Input} from '@angular/core';
import {TooltipModule} from 'primeng/tooltip';
import {COLORE_NOI} from "../grafico-differenza";
import {TDatiAndamento, TPartitaAndamento} from "../andamento-campionato";
import {
   DatiAndamentoGiocatore,
   MediaValori,
   METRICHE_GIOCATORE,
   NumMetrica,
   Sparkline,
   TAndamentoGiocatore,
   TMetricaGiocatore,
   TSparkline
} from "../andamento-giocatori";
import {AndamentoCampionatoCompComponent} from "../andamento-campionato-comp/andamento-campionato-comp.component";


// Andamento stagionale dei giocatori (pagina "Statistiche campionato"): panoramica con una riga per giocatore
// e un mini-grafico per metrica; scegliendo una riga, sotto il grafico grande di quel giocatore (stesso
// componente dell'andamento di squadra).
@Component({
   selector:    'app-andamento-giocatori-comp',
   standalone:  true,
   imports:     [TooltipModule, AndamentoCampionatoCompComponent],
   templateUrl: './andamento-giocatori-comp.component.html',
   styleUrl:    './andamento-giocatori-comp.component.css'
})
export class AndamentoGiocatoriCompComponent
{
   @Input() set andamento (a: TAndamentoGiocatore[] | null)
   {
      this._andamento = a ?? [];
      this.spark = new Map(this._andamento.map(g => [g.id, Object.fromEntries(
         METRICHE_GIOCATORE.map(m => [m.value, Sparkline(g.valori[m.value], this.SW, this.SH, 3, m.scalaMin)])) as Record<TMetricaGiocatore, TSparkline>]));
      if (!this._andamento.some(g => g.id === this.idScelto))
         this.idScelto = this._andamento[0]?.id ?? 0;
      this.AggiornaCalcolo();
   }
   get andamento (): TAndamentoGiocatore[] { return this._andamento; }
   private _andamento: TAndamentoGiocatore[] = [];
   // partite selezionate (date e risultati per il grafico grande)
   @Input() set partite (p: TPartitaAndamento[])
   {
      this._partite = p ?? [];
      this.AggiornaCalcolo();
   }
   private _partite: TPartitaAndamento[] = [];

   public readonly metriche = METRICHE_GIOCATORE;
   public readonly SW = 150;
   public readonly SH = 34;
   public readonly coloreNoi = COLORE_NOI;
   public spark = new Map<number, Record<TMetricaGiocatore, TSparkline>>();
   public idScelto = 0;
   public calcola: ((metrica: string) => TDatiAndamento) | null = null;
   public readonly Num = NumMetrica;
   public readonly tooltipLettura = `<span class='tt-titolo'><b>Come leggere i mini-grafici</b></span><br><span class='tt-testo'>` +
      `Ogni mini-grafico ha la scala del giocatore (con un'ampiezza minima di 10, così chi è costante resta piatto): mostra la forma dell'andamento (crescita, calo, costanza), il valore ` +
      `lo dice la media accanto. Linea tratteggiata: media; pallino pieno: la partita migliore; pallino vuoto: la ` +
      `peggiore. Buchi: partite non giocate. Clicca una riga per il grafico grande del giocatore.</span>`;


   private AggiornaCalcolo (): void
   {
      const g = this._andamento.find(x => x.id === this.idScelto);
      const partite = this._partite;
      this.calcola = g ? ((metrica: string) => DatiAndamentoGiocatore(g, metrica as TMetricaGiocatore, partite)) : null;
   }


   Scegli (id: number): void
   {
      this.idScelto = id;
      this.AggiornaCalcolo();
   }


   Scelto (): TAndamentoGiocatore | null
   {
      return this._andamento.find(g => g.id === this.idScelto) ?? null;
   }


   Spark (g: TAndamentoGiocatore,
          m: TMetricaGiocatore): TSparkline
   {
      return this.spark.get(g.id)![m];
   }


   // spezzata con i buchi: "M x y L x y ... M x y ..."
   Linea (s: TSparkline): string
   {
      let d = '';
      let staccato = true;
      for (const p of s.punti)
      {
         if (!p)
         {
            staccato = true;
            continue;
         }
         d += `${staccato ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)} `;
         staccato = false;
      }
      return d;
   }


   // punti da disegnare come pallini: massimo (pieno), minimo (vuoto), isolati fra due buchi (pieni piccoli)
   Pallini (s: TSparkline): { x: number, y: number, tipo: 'max' | 'min' | 'solo' }[]
   {
      const r: { x: number, y: number, tipo: 'max' | 'min' | 'solo' }[] = [];
      s.punti.forEach((p, i) =>
      {
         if (!p)
            return;
         if (i === s.iMax)
            r.push({ x: p[0], y: p[1], tipo: 'max' });
         else if (i === s.iMin)
            r.push({ x: p[0], y: p[1], tipo: 'min' });
         else if (!s.punti[i - 1] && !s.punti[i + 1])
            r.push({ x: p[0], y: p[1], tipo: 'solo' });
      });
      return r;
   }


   Media (g: TAndamentoGiocatore,
          m: TMetricaGiocatore): string
   {
      return NumMetrica(MediaValori(g.valori[m]), m);
   }


   // valori partita per partita per il tooltip della cella
   Dettaglio (g: TAndamentoGiocatore,
              m: TMetricaGiocatore): string
   {
      const label = METRICHE_GIOCATORE.find(x => x.value === m)?.label ?? '';
      return `${g.numero} ${g.nome} - ${label}: ` + g.valori[m].map(v => (v === null) ? '-' : NumMetrica(v, m)).join(', ');
   }
}
