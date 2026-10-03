import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {CommonModule} from '@angular/common';


// Posizione di un tiro nelle coordinate dell'immagine del campo originale del Delphi (BkField, 571x539 pixel,
// metà campo offensiva col canestro in alto): le stesse salvate dal Delphi nella Desc2 "px;py" dei tiri,
// così la mappa di tiro è coerente anche coi dati migrati, qualunque sia la dimensione a video.
export interface TPosizioneTiro
{
   x: number;
   y: number;
}


// Tiro da disegnare sul campo: pallino se segnato, crocetta se sbagliato, colorato per quarto
export interface TTiroPrecedente extends TPosizioneTiro
{
   segnato: boolean;
   quarto: number;             // 1..4 regolari, 5..8 supplementari
}


// Colori dei quarti per i tiri (tutti i supplementari hanno lo stesso colore)
const COLORI_QUARTI = ['#ff7777', '#17b1ff', '#8f4d00', '#109010'];
const COLORE_SUPPLEMENTARI = '#ffff00';


// Campo (metà offensiva) con i tiri disegnati sopra; se "cliccabile", un click restituisce la posizione.
// Usato dalla finestra di inserimento della posizione di un tiro e dalla mappa di tiro.
@Component({
   selector:    'app-campo-tiri',
   standalone:  true,
   imports: [
      CommonModule
   ],
   templateUrl: './campo-tiri.component.html',
   styleUrl:    './campo-tiri.component.css'
})
export class CampoTiriComponent implements OnChanges
{
   public static readonly LARGHEZZA_CAMPO = 571;
   public static readonly ALTEZZA_CAMPO = 539;

   public readonly LARGHEZZA = CampoTiriComponent.LARGHEZZA_CAMPO;
   public readonly ALTEZZA = CampoTiriComponent.ALTEZZA_CAMPO;

   @Input() tiri: TTiroPrecedente[] = [];
   @Input() cliccabile: boolean = false;
   // testo iniziale della legenda (es. "Tiri precedenti:")
   @Input() titoloLegenda: string = '';
   // false nelle mappe piccole (es. una per giocatore), dove la legenda dei quarti sarebbe ingombrante
   @Input() mostraLegenda: boolean = true;
   // altezza massima dell'immagine (CSS), per adattarla alla finestra che la contiene
   @Input() altezzaMax: string = 'min(539px, calc(100vh - 260px))';

   @Output() posizione = new EventEmitter<TPosizioneTiro>();

   public legenda: { label: string, colore: string }[] = [];


   ngOnChanges (): void
   {
      // legenda: solo i periodi in cui ci sono tiri sul campo
      const periodi = new Set((this.tiri ?? []).map(t => Math.min(t.quarto, 5)));
      this.legenda = [1, 2, 3, 4, 5]
         .filter(p => periodi.has(p))
         .map(p => ({ label: (p <= 4) ? `${p}° Q` : 'Suppl.', colore: CampoTiriComponent.ColoreQuarto(p) }));
   }


   static ColoreQuarto (quarto: number): string
   {
      return ((quarto >= 1) && (quarto <= COLORI_QUARTI.length)) ? COLORI_QUARTI[quarto - 1] : COLORE_SUPPLEMENTARI;
   }


   Colore (tiro: TTiroPrecedente): string
   {
      return CampoTiriComponent.ColoreQuarto(tiro.quarto);
   }


   onCampoClick (event: MouseEvent): void
   {
      if (!this.cliccabile)
         return;
      const img = event.target as HTMLImageElement;
      const rect = img.getBoundingClientRect();
      if ((rect.width <= 0) || (rect.height <= 0))
         return;
      // pixel a video -> pixel dell'immagine originale
      const x = Math.round((event.clientX - rect.left) * CampoTiriComponent.LARGHEZZA_CAMPO / rect.width);
      const y = Math.round((event.clientY - rect.top) * CampoTiriComponent.ALTEZZA_CAMPO / rect.height);
      this.posizione.emit({
         x: Math.min(Math.max(x, 0), CampoTiriComponent.LARGHEZZA_CAMPO - 1),
         y: Math.min(Math.max(y, 0), CampoTiriComponent.ALTEZZA_CAMPO - 1)
      });
   }
}
