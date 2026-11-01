import {Component, Input} from '@angular/core';
import {ButtonModule} from 'primeng/button';
import {TooltipModule} from 'primeng/tooltip';
import {COLORE_LORO, COLORE_NOI} from "../grafico-differenza";
import {
   GiocatoriOrdinati,
   MIN_POSSESSI_RATING,
   MinutiQuintetto,
   TGiocatoreQuintetto,
   TPartitaQuintetto,
   NetQuintetto,
   NumQ,
   PlusMinusQuintetto,
   PossessiQuintetto,
   RatingQuintetto,
   TQuintettoStat
} from "../quintetti";


// Tabella dei quintetti (tab "Statistiche" della partita e pagina "Statistiche campionato"): giocatori,
// minuti insieme, punti fatti/subiti, +/- con barra divergente (rossa a nostro favore, azzurra contro) e valori
// per 100 possessi. In ordine di minuti; di default solo i primi, gli altri con "Mostra tutti".
// Filtro per giocatori: selezionandone uno o più restano solo i quintetti in cui ci sono tutti.
@Component({
   selector:    'app-quintetti-comp',
   standalone:  true,
   imports:     [ButtonModule, TooltipModule],
   templateUrl: './quintetti-comp.component.html',
   styleUrl:    './quintetti-comp.component.css'
})
export class QuintettiCompComponent
{
   @Input() set quintetti (q: TQuintettoStat[])
   {
      this._quintetti = q ?? [];
      this.maxPm = Math.max(1, ...this._quintetti.map(x => Math.abs(PlusMinusQuintetto(x))));
      // giocatori presenti in almeno un quintetto, in ordine di numero
      const perId = new Map<number, TGiocatoreQuintetto>();
      for (const x of this._quintetti)
         for (const g of x.giocatori)
            perId.set(g.id, g);
      this.giocatoriFiltro = [...perId.values()].sort((a, b) => (parseInt(a.numero, 10) || 0) - (parseInt(b.numero, 10) || 0));
      // la selezione resta, tolti i giocatori che non ci sono più
      this.selezionati = new Set([...this.selezionati].filter(id => perId.has(id)));
      this.AggiornaFiltrati();
   }
   get quintetti (): TQuintettoStat[] { return this._quintetti; }
   private _quintetti: TQuintettoStat[] = [];
   // pagina del campionato: colonna con il numero di partite
   @Input() conPartite: boolean = false;

   public giocatoriFiltro: TGiocatoreQuintetto[] = [];
   public selezionati = new Set<number>();
   public filtrati: TQuintettoStat[] = [];

   public readonly PRIMI = 10;
   public tutti: boolean = false;
   public maxPm: number = 1;
   public readonly coloreVantaggio = COLORE_NOI;
   public readonly coloreSvantaggio = COLORE_LORO;
   public readonly Giocatori = GiocatoriOrdinati;
   public readonly Minuti = MinutiQuintetto;
   public readonly Num = NumQ;
   public readonly Pm = PlusMinusQuintetto;
   public readonly Net = NetQuintetto;
   public readonly Rating = RatingQuintetto;
   public readonly tooltipPoss = this.Tooltip('Possessi stimati', 'Tiri dal campo tentati - rimbalzi offensivi + palle perse + 0,44 x liberi tentati, mentre il quintetto era in campo; media delle due squadre.');
   public readonly tooltipRating = this.Tooltip('Per 100 possessi', `Punti fatti e subiti ogni 100 possessi e la loro differenza (Net). Mostrati solo con almeno ${MIN_POSSESSI_RATING} possessi: con meno sono poco significativi.`);


   Visibili (): TQuintettoStat[]
   {
      return this.tutti ? this.filtrati : this.filtrati.slice(0, this.PRIMI);
   }


   CambiaSelezione (id: number): void
   {
      if (this.selezionati.has(id))
         this.selezionati.delete(id);
      else
         this.selezionati.add(id);
      this.AggiornaFiltrati();
   }


   AzzeraSelezione (): void
   {
      this.selezionati.clear();
      this.AggiornaFiltrati();
   }


   private AggiornaFiltrati (): void
   {
      const sel = [...this.selezionati];
      this.filtrati = sel.length === 0
         ? this._quintetti
         : this._quintetti.filter(q => sel.every(id => q.giocatori.some(g => g.id === id)));
   }


   // tooltip della colonna "Part": le partite, una per riga
   TooltipPartite (q: TQuintettoStat): string
   {
      const elenco = q.elencoPartite ?? [];
      if (elenco.length === 0)
         return '';
      const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const riga = (p: TPartitaQuintetto) => `${esc(p.data)} · <b>${MinutiQuintetto(p)}</b> · ${esc(p.partita)}`;
      return `<span class='tt-titolo'><b>Partite (${elenco.length})</b></span><br>` +
             `<span class='tt-testo tt-elenco'>${elenco.map(riga).join('<br>')}</span>`;
   }


   Possessi (q: TQuintettoStat): string
   {
      return NumQ(Math.round(PossessiQuintetto(q)));
   }


   // barra del +/-: metà sinistra per i negativi, metà destra per i positivi (in % della metà)
   LarghezzaPm (q: TQuintettoStat): number
   {
      return 100 * Math.abs(PlusMinusQuintetto(q)) / this.maxPm;
   }


   private Tooltip (titolo: string,
                    descrizione: string): string
   {
      return `<span class='tt-titolo'><b>${titolo}</b></span><br><span class='tt-testo'>${descrizione}</span>`;
   }
}
