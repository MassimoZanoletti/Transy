import {Directive, ElementRef, HostListener, Input, OnChanges, OnDestroy} from '@angular/core';


// Tooltip per gli elementi dei grafici SVG, con l'aspetto dei tooltip PrimeNG (stesse classi, quindi stessi
// caratteri e colori). Il pTooltip di PrimeNG non va sugli elementi SVG: per posizionarsi usa offsetWidth,
// che lì non c'è. Il contenuto è HTML (vedi TestoTooltip). Di norma sta sopra l'elemento; con tooltipSegui
// segue il puntatore: serve per le forme più grandi della parte visibile (es. zone di tiro ritagliate dal campo).
@Directive({
   selector:   '[appTooltipSvg]',
   standalone: true
})
export class TooltipSvgDirective implements OnChanges, OnDestroy
{
   @Input('appTooltipSvg') testo: string = '';
   @Input() tooltipSegui: boolean = false;

   private contenitore: HTMLDivElement | null = null;
   private testoDiv: HTMLDivElement | null = null;
   private puntatore: { x: number, y: number } | null = null;


   constructor (private el: ElementRef<Element>)
   {
   }


   ngOnChanges (): void
   {
      if (this.testoDiv)
      {
         this.testoDiv.innerHTML = this.testo;
         this.Posiziona();
      }
   }


   ngOnDestroy (): void
   {
      this.Nascondi();
   }


   @HostListener('mouseenter', ['$event'])
   Mostra (ev?: MouseEvent): void
   {
      this.Nascondi();
      this.puntatore = ev ? { x: ev.clientX, y: ev.clientY } : null;
      if (!this.testo)
         return;
      const c = document.createElement('div');
      c.setAttribute('role', 'tooltip');
      c.style.display = 'inline-block';
      c.style.pointerEvents = 'none';
      c.style.zIndex = '1200';
      const freccia = document.createElement('div');
      freccia.className = 'p-tooltip-arrow';
      const t = document.createElement('div');
      t.className = 'p-tooltip-text';
      t.innerHTML = this.testo;
      c.append(freccia, t);
      document.body.appendChild(c);
      this.contenitore = c;
      this.testoDiv = t;
      this.Posiziona();
   }


   @HostListener('mousemove', ['$event'])
   Muovi (ev: MouseEvent): void
   {
      if ((!this.tooltipSegui) || (!this.contenitore))
         return;
      this.puntatore = { x: ev.clientX, y: ev.clientY };
      this.Posiziona();
   }


   @HostListener('mouseleave')
   Nascondi (): void
   {
      this.contenitore?.remove();
      this.contenitore = null;
      this.testoDiv = null;
   }


   // sopra l'elemento e centrato; sotto se in alto non c'è posto; sempre dentro lo schermo in orizzontale
   private Posiziona (): void
   {
      const c = this.contenitore;
      if (!c)
         return;
      c.className = 'p-tooltip p-component p-tooltip-top';
      c.style.left = '-999px';
      c.style.top = '-999px';
      // con tooltipSegui un rettangolo di 24px attorno al puntatore, così il tooltip non ci finisce sotto
      const p = this.puntatore;
      const r = (this.tooltipSegui && p) ? new DOMRect(p.x - 12, p.y - 12, 24, 24) : this.el.nativeElement.getBoundingClientRect();
      const w = c.offsetWidth;
      const h = c.offsetHeight;
      const sotto = (r.top - h < 0);
      if (sotto)
         c.className = 'p-tooltip p-component p-tooltip-bottom';
      const left = Math.max(4, Math.min(window.innerWidth - w - 4, r.left + (r.width - w) / 2));
      const top = sotto ? r.bottom : r.top - h;
      c.style.left = `${left + window.scrollX}px`;
      c.style.top = `${top + window.scrollY}px`;
   }
}


// Contenuto dei tooltip delle statistiche: titolo giallo e righe di testo (una per dato), testo già escapato
export function TestoTooltip (titolo: string,
                              righe: string[] = []): string
{
   const t = `<span class='tt-titolo'><b>${EscTooltip(titolo)}</b></span>`;
   return righe.length ? `${t}<br><span class='tt-testo'>${righe.map(EscTooltip).join('<br>')}</span>` : t;
}


export function EscTooltip (s: string): string
{
   return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
