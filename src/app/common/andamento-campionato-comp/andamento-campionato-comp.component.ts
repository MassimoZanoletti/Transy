import {Component, Input} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {CheckboxModule} from 'primeng/checkbox';
import {
   DatiAndamento,
   MEDIA_MOBILE,
   MediaMobile,
   METRICHE_ANDAMENTO,
   NumAndamento,
   ScalaY,
   TDatiAndamento,
   TMetricaAndamento,
   TPartitaAndamento
} from "../andamento-campionato";
import {COLORE_LORO, COLORE_NOI} from "../grafico-differenza";


// Grafico dell'andamento partita per partita (pagina "Statistiche campionato"): una metrica scelta dal
// menu, con la media mobile facoltativa e il dettaglio della partita al passaggio del mouse/dito.
@Component({
   selector:    'app-andamento-campionato-comp',
   standalone:  true,
   imports:     [FormsModule, DropdownModule, CheckboxModule],
   templateUrl: './andamento-campionato-comp.component.html',
   styleUrl:    './andamento-campionato-comp.component.css'
})
export class AndamentoCampionatoCompComponent
{
   @Input() set partite (p: TPartitaAndamento[])
   {
      this._partite = p ?? [];
      this.Prepara();
   }
   private _partite: TPartitaAndamento[] = [];
   @Input() set nomeNoi (n: string)
   {
      this._nomeNoi = n ?? '';
      this.Prepara();
   }
   private _nomeNoi = '';

   public readonly metriche = METRICHE_ANDAMENTO;
   public metrica: TMetricaAndamento = 'punti';
   public mediaMobile: boolean = true;
   public readonly MEDIA_MOBILE = MEDIA_MOBILE;

   // area del grafico nel viewBox
   public readonly W = 900;
   public readonly H = 300;
   public readonly ML = 46;
   public readonly MR = 12;
   public readonly MT = 14;
   public readonly MB = 44;
   public readonly coloreSopra = COLORE_NOI;
   public readonly coloreSotto = COLORE_LORO;

   public dati: TDatiAndamento | null = null;
   public griglia: number[] = [];
   public linee: { colore: string, d: string, media: boolean }[] = [];
   public punti: { colore: string, x: number, y: number }[] = [];
   public barre: { x: number, y: number, w: number, h: number, positiva: boolean }[] = [];
   public ogniEtichetta = 1;
   public hover: { i: number, x: number, righe: string[], aDestra: boolean } | null = null;
   private scala = { min: 0, max: 10, passo: 5 };


   Prepara (): void
   {
      this.hover = null;
      if (this._partite.length === 0)
      {
         this.dati = null;
         return;
      }
      const dati = DatiAndamento(this._partite, this.metrica, this._nomeNoi);
      this.dati = dati;
      this.scala = ScalaY(dati);
      this.griglia = [];
      for (let v = this.scala.min; v <= this.scala.max + 1e-9; v += this.scala.passo)
         this.griglia.push(Math.round(v * 1000) / 1000);
      this.ogniEtichetta = Math.max(1, Math.ceil(dati.etichette.length / 18));
      this.linee = [];
      this.punti = [];
      this.barre = [];
      if (dati.barre)
      {
         const larghezza = Math.min(28, 0.6 * (this.W - this.ML - this.MR) / dati.etichette.length);
         dati.serie[0].valori.forEach((v, i) =>
         {
            if ((v !== null) && (v !== 0))
               this.barre.push({ x: this.X(i) - larghezza / 2, w: larghezza, y: Math.min(this.Y(0), this.Y(v)), h: Math.abs(this.Y(v) - this.Y(0)), positiva: v > 0 });
         });
         if (this.mediaMobile)
            this.linee.push({ colore: '#e2e8f0', d: this.Percorso(MediaMobile(dati.serie[0].valori)), media: true });
         return;
      }
      for (const s of dati.serie)
      {
         s.valori.forEach((v, i) => { if (v !== null) this.punti.push({ colore: s.colore, x: this.X(i), y: this.Y(v) }); });
         this.linee.push(this.mediaMobile ? { colore: s.colore, d: this.Percorso(MediaMobile(s.valori)), media: true }
                                          : { colore: s.colore, d: this.Percorso(s.valori), media: false });
      }
   }


   X (i: number): number
   {
      const n = Math.max(1, this.dati?.etichette.length ?? 1);
      return this.ML + (this.W - this.ML - this.MR) * (i + 0.5) / n;
   }


   Y (v: number): number
   {
      return this.MT + (this.H - this.MT - this.MB) * (this.scala.max - v) / (this.scala.max - this.scala.min);
   }


   // spezzata che salta le partite senza valore
   private Percorso (valori: (number | null)[]): string
   {
      let d = '';
      let staccato = true;
      valori.forEach((v, i) =>
      {
         if (v === null)
         {
            staccato = true;
            return;
         }
         d += `${staccato ? 'M' : 'L'} ${this.X(i).toFixed(1)} ${this.Y(v).toFixed(1)} `;
         staccato = false;
      });
      return d;
   }


   Asse (v: number): string
   {
      return NumAndamento(v, this.dati?.barre ?? false);
   }


   // puntatore -> partita più vicina, con i valori di tutte le serie (e la media mobile)
   Muovi (ev: PointerEvent): void
   {
      const dati = this.dati;
      const svg = (ev.currentTarget as SVGGraphicsElement).ownerSVGElement;
      const ctm = svg?.getScreenCTM();
      if ((!dati) || (!svg) || (!ctm))
         return;
      const pt = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(ctm.inverse());
      const n = dati.etichette.length;
      const i = Math.max(0, Math.min(n - 1, Math.floor(n * (pt.x - this.ML) / (this.W - this.ML - this.MR))));
      const righe = [dati.dettagli[i], ...dati.serie.map(s =>
      {
         const media = this.mediaMobile ? MediaMobile(s.valori)[i] : null;
         return `${s.nome}: ${NumAndamento(s.valori[i], dati.barre)}` + ((media !== null) ? ` (media ${MEDIA_MOBILE}: ${NumAndamento(media, dati.barre)})` : '');
      })];
      this.hover = { i, x: this.X(i), righe, aDestra: this.X(i) < this.W * 0.6 };
   }


   Esci (): void
   {
      this.hover = null;
   }
}
