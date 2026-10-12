import {Component, OnInit, signal} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {ConvertiGuida, TBloccoGuida} from "../../common/markdown-guida";


// Pagina "Guida alle statistiche" (menu Strumenti): il documento per i tecnici, esportato in Markdown in
// assets/guida-statistiche.md (in cache del service worker: si legge anche offline). In alto l'indice dei
// capitoli; i blocchi sono costruiti dal template (niente HTML dal file).
@Component ({
               selector:    'app-guida-statistiche-page',
               standalone:  true,
               imports:     [NgTemplateOutlet],
               templateUrl: './guida-statistiche-page.component.html',
               styleUrl:    './guida-statistiche-page.component.css'
            })
export class GuidaStatistichePageComponent implements OnInit
{
   public readonly blocchi = signal<TBloccoGuida[]>([]);
   public readonly errore = signal<string>('');


   async ngOnInit (): Promise<void>
   {
      try
      {
         const risposta = await fetch('assets/guida-statistiche.md');
         if (!risposta.ok)
            throw new Error(`HTTP ${risposta.status}`);
         this.blocchi.set(ConvertiGuida(await risposta.text()));
      }
      catch (err)
      {
         this.errore.set(`Impossibile leggere la guida (${err instanceof Error ? err.message : String(err)}).`);
      }
   }


   // capitoli (titoli di livello 2) per l'indice
   Capitoli (): { testo: string, id: string }[]
   {
      return this.blocchi().filter(b => (b.tipo === 'titolo') && (b.livello === 2))
                           .map(b => ({ testo: (b as { testo: string }).testo, id: (b as { id: string }).id }));
   }


   // l'indice scorre al capitolo (nessun cambio di rotta: l'app usa il router senza frammenti)
   VaiA (id: string,
         ev: Event): void
   {
      ev.preventDefault();
      document.getElementById(`guida-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
   }


   TornaSu (): void
   {
      document.getElementById('guida-inizio')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
   }
}
