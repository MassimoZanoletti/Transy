import {Component, Input} from '@angular/core';
import {TooltipModule} from 'primeng/tooltip';
import {
   ARCO_PATH,
   CAMPO_H,
   CAMPO_W,
   COLORE_ZONA_SOPRA,
   COLORE_ZONA_SOTTO,
   FORME_ZONE,
   MIN_TIRI_ZONA,
   PercZona,
   PpsStr,
   PPS_NEUTRO,
   QuotaZona,
   RiempimentoZona,
   TIdZona,
   TMappaZone,
   TZonaTiro
} from "../zone-tiro";


// Mappa di tiro a zone (tab "Mappa tiro" della partita): campo con le 10 zone colorate secondo i punti per
// tiro e, accanto, la tabella delle zone con segnati/tentati, percentuale, punti per tiro e quota dei tiri.
@Component({
   selector:    'app-zone-tiro-comp',
   standalone:  true,
   imports:     [TooltipModule],
   templateUrl: './zone-tiro-comp.component.html',
   styleUrl:    './zone-tiro-comp.component.css'
})
export class ZoneTiroCompComponent
{
   @Input() set mappa (m: TMappaZone | null)
   {
      this._mappa = m;
      this.perId = new Map((m?.zone ?? []).map(z => [z.id, z]));
   }
   get mappa (): TMappaZone | null { return this._mappa; }
   private _mappa: TMappaZone | null = null;
   private perId = new Map<TIdZona, TZonaTiro>();
   @Input() altezza: string = `${CAMPO_H}px`;

   public readonly W = CAMPO_W;
   public readonly H = CAMPO_H;
   public readonly forme = FORME_ZONE;
   public readonly arco = ARCO_PATH;
   public readonly MIN_TIRI_ZONA = MIN_TIRI_ZONA;
   public readonly ppsNeutro = PPS_NEUTRO.toLocaleString('it-IT', { minimumFractionDigits: 1 });
   public readonly coloreSopra = COLORE_ZONA_SOPRA;
   public readonly coloreSotto = COLORE_ZONA_SOTTO;
   public readonly Perc = PercZona;
   public readonly Pps = PpsStr;
   public readonly tooltipPps = `<span style='color: #ffff00'><b>Punti per tiro</b></span><br><span style='font-size: 0.8rem;'>` +
      `Punti segnati ogni tiro tentato dalla zona (percentuale x 2 o x 3). Permette di confrontare zone da 2 e da 3: ` +
      `50% da 2 e 33% da 3 valgono entrambi circa 1 punto per tiro.</span>`;
   // zona sotto il mouse/dito: evidenziata nella tabella
   public zonaAttiva: TIdZona | null = null;


   Zona (id: TIdZona): TZonaTiro
   {
      return this.perId.get(id)!;
   }


   Riempimento (id: TIdZona): string
   {
      return RiempimentoZona(this.Zona(id));
   }


   Quota (z: TZonaTiro): string
   {
      return ((this._mappa) && (z.tentati > 0)) ? QuotaZona(z, this._mappa) : '';
   }


   Titolo (z: TZonaTiro): string
   {
      if (z.tentati === 0)
         return `${z.nome}: nessun tiro`;
      return `${z.nome}: ${z.segnati}/${z.tentati} (${PercZona(z)}), ${PpsStr(z)} punti per tiro`;
   }
}
