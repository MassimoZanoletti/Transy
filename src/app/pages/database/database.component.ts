import {
   ChangeDetectorRef,
   Component,
   OnInit
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {BlockUIModule} from "primeng/blockui";
import {ButtonModule} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {DropdownModule} from "primeng/dropdown";
import {InputTextModule} from "primeng/inputtext";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {TableModule} from "primeng/table";
import {TooltipModule} from "primeng/tooltip";
import {firstValueFrom, Observable} from "rxjs";
import {
   MessDlgData,
   IDSSeason,
   IDSSocieta,
   IDSChamp,
   IDSPhase,
   IDSTeam,
   IDSPlayer,
   TDSCoach
} from "../../models/datamod";
import {MessageDialogService} from "../../services/message-dialog.service";
import {loggedUser} from "../../services/users.service";
import {SocietaService} from "../../services/societa.service";
import {SeasonsService} from "../../services/seasons.service";
import {CampionatiService} from "../../services/campionati.service";
import {PhaseService} from "../../services/phase.service";
import {TeamService} from "../../services/team.service";
import {PlayerService} from "../../services/player.service";
import {CoachService} from "../../services/coach.service";
import {utils} from "../../common/utils";
import { UnaAllaVolta } from '../../common/una-alla-volta';


// Livelli della gerarchia: Società > Stagione > Campionato > (Squadre | Fasi) ; Squadra > (Giocatori | Allenatori)
export type Livello = 'societa' | 'stagione' | 'campionato' | 'fase' | 'squadra' | 'giocatore' | 'allenatore';

const NOMI_LIVELLO: Record<Livello, { titolo: string, nuovo: string, modifica: string, articolo: string }> = {
   societa:    { titolo: 'Società',    nuovo: 'Nuova società',    modifica: 'Modifica società',    articolo: 'la società' },
   stagione:   { titolo: 'Stagione',   nuovo: 'Nuova stagione',   modifica: 'Modifica stagione',   articolo: 'la stagione' },
   campionato: { titolo: 'Campionato', nuovo: 'Nuovo campionato', modifica: 'Modifica campionato', articolo: 'il campionato' },
   fase:       { titolo: 'Fase',       nuovo: 'Nuova fase',       modifica: 'Modifica fase',       articolo: 'la fase' },
   squadra:    { titolo: 'Squadra',    nuovo: 'Nuova squadra',    modifica: 'Modifica squadra',    articolo: 'la squadra' },
   giocatore:  { titolo: 'Giocatore',  nuovo: 'Nuovo giocatore',  modifica: 'Modifica giocatore',  articolo: 'il giocatore' },
   allenatore: { titolo: 'Allenatore', nuovo: 'Nuovo allenatore', modifica: 'Modifica allenatore', articolo: "l'allenatore" }
};


@Component({
  selector:    'app-database',
  standalone:  true,
              imports: [
                 CommonModule,
                 FormsModule,
                 BlockUIModule,
                 ButtonModule,
                 DialogModule,
                 DropdownModule,
                 InputTextModule,
                 ProgressSpinnerModule,
                 TableModule,
                 TooltipModule
              ],
  templateUrl: './database.component.html',
  styleUrl:    './database.component.css'
})
export class DatabaseComponent implements OnInit
{
   //
   colTeam: any[] = [
      { field: 'nome', header: 'Nome', style: "font-weight: 700; font-size: 1.2em; color: lime;" },
      { field: 'abbrev', header: 'Abbr.', style: "" }
   ]
   colPhase: any[] = [
      { field: 'nome', header: 'Nome', style: "" },
      { field: 'abbrev', header: 'Abbr.', style: "" },
      { field: 'exportfolder', header: 'Exp. Fldr.', style: "" }
   ]
   colPlayer: any[] = [
      { field: 'numero', header: 'Num.', style: "font-weight: 700; font-size: 1.3em;" },
      { field: 'nomedisp', header: 'Nome', style: "font-weight: 700; font-size: 1.2em; color: lime;" },
      { field: 'anno', header: 'Anno', style: "" }
   ]
   colCoach: any[] = [
      { field: 'nome', header: 'Nome', style: "font-weight: 700; font-size: 1.2em; color: lime;" }
   ]

   //  Liste (ciascuna dipende dalla scelta del livello superiore)
   listaSocieta: IDSSocieta[] = [];
   listaStagioni: IDSSeason[] = [];
   listaCampionati: IDSChamp[] = [];
   listaSquadre: IDSTeam[] = [];
   listaFasi: IDSPhase[] = [];
   listaGiocatori: IDSPlayer[] = [];
   listaAllenatori: TDSCoach[] = [];
   //
   selSocieta: IDSSocieta | null = null;
   selSeason: IDSSeason | null = null;
   selChamp: IDSChamp | null = null;
   selPhase: IDSPhase | null = null;
   selTeam: IDSTeam | null = null;
   selPlayer: IDSPlayer | null = null;
   selCoach: TDSCoach | null = null;
   //
   tabSinistra: 'squadre' | 'fasi' = 'squadre';
   tabDestra: 'giocatori' | 'allenatori' = 'giocatori';
   //
   caricamentiInCorso: number = 0;

   /////////////////////////////////////////////////////
   //  Dialog (unica per tutti i livelli: i campi mostrati dipendono da dialogLivello)
   dialogVisible: boolean = false;
   dialogLivello: Livello = 'societa';
   dialogOperation: 'ADD' | 'EDIT' = 'ADD';
   dialogTitle: string = "";
   dialogOperazione: string = "";
   dialogErrorMessage: string = "";
   dialogValue_Nome: string = "";
   dialogValue_Abbrev: string = "";
   dialogValue_Anno: number = 0;
   dialogValue_Ruolo: string = "";
   dialogValue_Numero: string = "";
   dialogValue_Altezza: number = 0;


   constructor (private cdr: ChangeDetectorRef,
                private servSocieta: SocietaService,
                private servSeason: SeasonsService,
                private servChamp: CampionatiService,
                private servPhase: PhaseService,
                private servTeam: TeamService,
                private servPlayer: PlayerService,
                private servCoach: CoachService,
                private messageDialogService: MessageDialogService)
   {
   }


   ngOnInit (): void
   {
      this.RipristinaScelte ();
      this.Aggiorna ();
   }


   /////////////////////////////////////////////////////
   //  Ultime scelte fatte (localStorage, per utente): riaprendo la pagina si riparte da lì

   private ChiaveScelte (): string
   {
      return `BBS_Database_Scelte_${loggedUser.id}`;
   }


   SalvaScelte ()
   {
      utils.SaveToLocalStorage (this.ChiaveScelte (), {
         societa:     this.selSocieta?.id ?? null,
         stagione:    this.selSeason?.id ?? null,
         campionato:  this.selChamp?.id ?? null,
         squadra:     this.selTeam?.id ?? null,
         tabSinistra: this.tabSinistra,
         tabDestra:   this.tabDestra
      });
   }


   // Mette nelle scelte dei segnaposto con il solo id: i Carica* li sostituiscono con gli elementi veri
   // (o con null, se nel frattempo sono stati cancellati)
   private RipristinaScelte ()
   {
      const scelte = utils.GetFromLocalStorage<any> (this.ChiaveScelte ());
      if (!scelte)
         return;
      if (scelte.societa != null)
         this.selSocieta = { id: scelte.societa } as IDSSocieta;
      if (scelte.stagione != null)
         this.selSeason = { id: scelte.stagione } as IDSSeason;
      if (scelte.campionato != null)
         this.selChamp = { id: scelte.campionato } as IDSChamp;
      if (scelte.squadra != null)
         this.selTeam = { id: scelte.squadra } as IDSTeam;
      if ((scelte.tabSinistra == 'squadre') || (scelte.tabSinistra == 'fasi'))
         this.tabSinistra = scelte.tabSinistra;
      if ((scelte.tabDestra == 'giocatori') || (scelte.tabDestra == 'allenatori'))
         this.tabDestra = scelte.tabDestra;
   }


   SetTabSinistra (tab: 'squadre' | 'fasi')
   {
      this.tabSinistra = tab;
      this.SalvaScelte ();
   }


   SetTabDestra (tab: 'giocatori' | 'allenatori')
   {
      this.tabDestra = tab;
      this.SalvaScelte ();
   }


   get isLoading (): boolean
   {
      return (this.caricamentiInCorso > 0);
   }


   AddEnabled (): boolean
   {
      return (loggedUser.attributo == 255);
   }


   EditEnabled (row: any): boolean
   {
      return (loggedUser.attributo > 0);
   }


   DeleteEnabled (row: any): boolean
   {
      return (loggedUser.attributo == 255);
   }


   /////////////////////////////////////////////////////
   //  Caricamento dati

   private MostraErrore (sottotitolo: string, messaggio: string)
   {
      const dlgData: MessDlgData = {
         title:      'ERRORE',
         subtitle:   sottotitolo,
         message:    messaggio,
         messtype:   'error',
         btncaption: 'Chiudi'
      };
      this.messageDialogService.showMessage (dlgData, '600px');
   }


   private async Carica (richiesta: Observable<any>): Promise<any[]>
   {
      this.caricamentiInCorso++;
      try
      {
         const data = await firstValueFrom (richiesta);
         if (data && data.ok)
            return data.elements ?? [];
         this.MostraErrore ('Errore durante il caricamento dei dati dal server', data ? `${data.message}` : 'No data returned');
      }
      catch (e: any)
      {
         this.MostraErrore ('Errore durante il caricamento dei dati dal server', e?.message ?? JSON.stringify (e));
      }
      finally
      {
         this.caricamentiInCorso--;
         this.cdr.detectChanges ();
      }
      return [];
   }


   // Le risposte possono arrivare dopo che l'utente ha già cambiato scelta: ogni caricamento controlla che il
   // livello superiore sia ancora quello per cui è partito, altrimenti scarta il risultato.
   // Società, Stagione e Campionato: se c'è un solo elemento viene scelto in automatico.
   async CaricaSocieta ()
   {
      this.listaSocieta = await this.Carica (this.servSocieta.getAllData ());
      this.selSocieta = this.listaSocieta.find (s => s.id === this.selSocieta?.id) ?? null;
      if ((this.selSocieta == null) && (this.listaSocieta.length == 1))
         this.selSocieta = this.listaSocieta[0];
   }


   async CaricaStagioni ()
   {
      const socId = this.selSocieta?.id;
      if (socId == null)
         return;
      const elenco = await this.Carica (this.servSeason.getAllData (socId));
      if (this.selSocieta?.id !== socId)
         return;
      this.listaStagioni = elenco;
      this.selSeason = this.listaStagioni.find (s => s.id === this.selSeason?.id) ?? null;
      if ((this.selSeason == null) && (this.listaStagioni.length == 1))
         this.selSeason = this.listaStagioni[0];
   }


   async CaricaCampionati ()
   {
      const seasId = this.selSeason?.id;
      if (seasId == null)
         return;
      const elenco = await this.Carica (this.servChamp.getAllData (seasId));
      if (this.selSeason?.id !== seasId)
         return;
      this.listaCampionati = elenco;
      this.selChamp = this.listaCampionati.find (c => c.id === this.selChamp?.id) ?? null;
      if ((this.selChamp == null) && (this.listaCampionati.length == 1))
         this.selChamp = this.listaCampionati[0];
   }


   async CaricaSquadre ()
   {
      const champId = this.selChamp?.id;
      if (champId == null)
         return;
      const elenco = await this.Carica (this.servTeam.getAllData (champId));
      if (this.selChamp?.id !== champId)
         return;
      this.listaSquadre = elenco;
      this.selTeam = this.listaSquadre.find (t => t.id === this.selTeam?.id) ?? null;
      if (this.selTeam)
         this.selTeam.type = "iteam";
   }


   async CaricaFasi ()
   {
      const champId = this.selChamp?.id;
      if (champId == null)
         return;
      const elenco = await this.Carica (this.servPhase.getAllData (champId));
      if (this.selChamp?.id !== champId)
         return;
      this.listaFasi = elenco;
      this.selPhase = this.listaFasi.find (f => f.id === this.selPhase?.id) ?? null;
   }


   async CaricaGiocatori ()
   {
      const teamId = this.selTeam?.id;
      if (teamId == null)
         return;
      const elenco = await this.Carica (this.servPlayer.getAllData (teamId));
      if (this.selTeam?.id !== teamId)
         return;
      this.listaGiocatori = elenco;
      this.selPlayer = this.listaGiocatori.find (p => p.id === this.selPlayer?.id) ?? null;
   }


   async CaricaAllenatori ()
   {
      const teamId = this.selTeam?.id;
      if (teamId == null)
         return;
      const elenco = await this.Carica (this.servCoach.getAllData (teamId));
      if (this.selTeam?.id !== teamId)
         return;
      this.listaAllenatori = elenco;
      this.selCoach = this.listaAllenatori.find (c => c.id === this.selCoach?.id) ?? null;
   }


   // Ricarica tutti i livelli mantenendo le scelte fatte (se gli elementi esistono ancora)
   @UnaAllaVolta()
   async Aggiorna ()
   {
      await this.RicaricaTutto ();
      this.SalvaScelte ();
   }


   private async RicaricaTutto ()
   {
      await this.CaricaSocieta ();
      if (this.selSocieta == null)
         return this.PulisciSotto ('societa');
      await this.CaricaStagioni ();
      if (this.selSeason == null)
         return this.PulisciSotto ('stagione');
      await this.CaricaCampionati ();
      if (this.selChamp == null)
         return this.PulisciSotto ('campionato');
      await Promise.all ([this.CaricaSquadre (), this.CaricaFasi ()]);
      if (this.selTeam == null)
         return this.PulisciSotto ('squadra');
      await Promise.all ([this.CaricaGiocatori (), this.CaricaAllenatori ()]);
   }


   /////////////////////////////////////////////////////
   //  Scelte in cascata

   // Svuota liste e scelte dei livelli che dipendono da "liv" (non quella di "liv" stesso).
   // Fasi e Squadre dipendono entrambe dal Campionato: la Fase non ha livelli dipendenti.
   PulisciSotto (liv: Livello)
   {
      if (liv == 'societa')
      {
         this.listaStagioni = [];
         this.selSeason = null;
      }
      if ((liv == 'societa') || (liv == 'stagione'))
      {
         this.listaCampionati = [];
         this.selChamp = null;
      }
      if ((liv == 'societa') || (liv == 'stagione') || (liv == 'campionato'))
      {
         this.listaSquadre = [];
         this.listaFasi = [];
         this.selTeam = null;
         this.selPhase = null;
      }
      if ((liv == 'societa') || (liv == 'stagione') || (liv == 'campionato') || (liv == 'squadra'))
      {
         this.listaGiocatori = [];
         this.listaAllenatori = [];
         this.selPlayer = null;
         this.selCoach = null;
      }
      // viene chiamata a ogni cambio di scelta (anche dopo quelle automatiche e le cancellazioni)
      this.SalvaScelte ();
      this.cdr.detectChanges ();
   }


   async OnSocietaChange ()
   {
      this.PulisciSotto ('societa');
      await this.CaricaStagioni ();
      if (this.selSeason)
         await this.OnStagioneChange ();
   }


   async OnStagioneChange ()
   {
      this.PulisciSotto ('stagione');
      await this.CaricaCampionati ();
      if (this.selChamp)
         await this.OnCampionatoChange ();
   }


   async OnCampionatoChange ()
   {
      this.PulisciSotto ('campionato');
      await Promise.all ([this.CaricaSquadre (), this.CaricaFasi ()]);
   }


   async OnSquadraSelect ()
   {
      if (this.selTeam)
         this.selTeam.type = "iteam";
      this.PulisciSotto ('squadra');
      await Promise.all ([this.CaricaGiocatori (), this.CaricaAllenatori ()]);
   }


   OnSquadraUnselect ()
   {
      this.selTeam = null;
      this.PulisciSotto ('squadra');
   }


   /////////////////////////////////////////////////////
   //  Aggiungi / Modifica / Elimina

   private Genitore (liv: Livello): any
   {
      switch (liv)
      {
         case 'societa':    return true;
         case 'stagione':   return this.selSocieta;
         case 'campionato': return this.selSeason;
         case 'fase':       return this.selChamp;
         case 'squadra':    return this.selChamp;
         case 'giocatore':  return this.selTeam;
         case 'allenatore': return this.selTeam;
      }
   }


   Selezionato (liv: Livello): any
   {
      switch (liv)
      {
         case 'societa':    return this.selSocieta;
         case 'stagione':   return this.selSeason;
         case 'campionato': return this.selChamp;
         case 'fase':       return this.selPhase;
         case 'squadra':    return this.selTeam;
         case 'giocatore':  return this.selPlayer;
         case 'allenatore': return this.selCoach;
      }
   }


   PuoAggiungere (liv: Livello): boolean
   {
      return !!this.Genitore (liv);
   }


   PuoModificare (liv: Livello): boolean
   {
      return !!this.Selezionato (liv);
   }


   // Il livello mostrato nella colonna (scheda attiva)
   LivelloSinistra (): Livello
   {
      return (this.tabSinistra == 'squadre') ? 'squadra' : 'fase';
   }


   LivelloDestra (): Livello
   {
      return (this.tabDestra == 'giocatori') ? 'giocatore' : 'allenatore';
   }


   MostraCampoAbbrev (): boolean
   {
      return ['stagione', 'campionato', 'fase', 'squadra'].includes (this.dialogLivello);
   }


   AddData (liv: Livello)
   {
      if (!this.PuoAggiungere (liv))
         return;
      this.dialogLivello = liv;
      this.dialogOperation = 'ADD';
      this.dialogTitle = NOMI_LIVELLO[liv].titolo;
      this.dialogOperazione = NOMI_LIVELLO[liv].nuovo;
      this.dialogErrorMessage = "";
      this.dialogValue_Nome = "";
      this.dialogValue_Abbrev = "";
      this.dialogValue_Anno = 0;
      this.dialogValue_Ruolo = "";
      this.dialogValue_Numero = "";
      this.dialogValue_Altezza = 0;
      this.dialogVisible = true;
   }


   EditData (liv: Livello)
   {
      const sel = this.Selezionato (liv);
      if (!sel)
         return;
      this.dialogLivello = liv;
      this.dialogOperation = 'EDIT';
      this.dialogTitle = NOMI_LIVELLO[liv].titolo;
      this.dialogOperazione = NOMI_LIVELLO[liv].modifica;
      this.dialogErrorMessage = "";
      if (liv == 'giocatore')
      {
         this.dialogValue_Nome = sel.nomedisp;
         this.dialogValue_Anno = sel.anno;
         this.dialogValue_Ruolo = sel.ruolo;
         this.dialogValue_Numero = sel.numero;
         this.dialogValue_Altezza = sel.altezza;
      }
      else
      {
         this.dialogValue_Nome = sel.nome;
         this.dialogValue_Abbrev = sel.abbrev ?? "";
      }
      this.dialogVisible = true;
   }


   DialogAnnulla ()
   {
      this.dialogVisible = false;
   }


   @UnaAllaVolta()
   async DialogSalva ()
   {
      if (this.dialogValue_Nome.trim () == "")
      {
         this.dialogErrorMessage = "Il nome è obbligatorio";
         return;
      }
      const liv = this.dialogLivello;
      const nuovo = (this.dialogOperation == 'ADD');
      const id: number = nuovo ? 0 : this.Selezionato (liv)?.id;
      this.dialogVisible = false;
      let richiesta: Observable<any>;
      switch (liv)
      {
         case 'societa':
            richiesta = nuovo ? this.servSocieta.addNewData (this.dialogValue_Nome)
                              : this.servSocieta.updateData (id, this.dialogValue_Nome);
            break;
         case 'stagione':
            richiesta = nuovo ? this.servSeason.addNewData (this.dialogValue_Nome, this.dialogValue_Abbrev, this.selSocieta!.id)
                              : this.servSeason.updateData (id, this.dialogValue_Nome, this.dialogValue_Abbrev, this.selSocieta!.id);
            break;
         case 'campionato':
            richiesta = nuovo ? this.servChamp.addNewData (this.dialogValue_Nome, this.dialogValue_Abbrev, this.selSeason!.id)
                              : this.servChamp.updateData (id, this.dialogValue_Nome, this.dialogValue_Abbrev, this.selSeason!.id);
            break;
         case 'fase':
            richiesta = nuovo ? this.servPhase.addNewData (this.dialogValue_Nome, this.dialogValue_Abbrev, "", this.selChamp!.id)
                              : this.servPhase.updateData (id, this.dialogValue_Nome, this.dialogValue_Abbrev, "", this.selChamp!.id);
            break;
         case 'squadra':
            richiesta = nuovo ? this.servTeam.addNewData (this.dialogValue_Nome, this.dialogValue_Abbrev, "", this.selChamp!.id)
                              : this.servTeam.updateData (id, this.dialogValue_Nome, this.dialogValue_Abbrev, this.selTeam?.logo ?? "", this.selChamp!.id);
            break;
         case 'giocatore':
            richiesta = nuovo ? this.servPlayer.addNewData ("", "", this.dialogValue_Nome, this.dialogValue_Anno, this.dialogValue_Ruolo, this.dialogValue_Numero, this.dialogValue_Altezza, "", this.selTeam!.id)
                              : this.servPlayer.updateData (id, "", "", this.dialogValue_Nome, this.dialogValue_Anno, this.dialogValue_Ruolo, this.dialogValue_Numero, this.dialogValue_Altezza, "", this.selTeam!.id);
            break;
         case 'allenatore':
            richiesta = nuovo ? this.servCoach.addNewData (this.dialogValue_Nome, this.selTeam!.id)
                              : this.servCoach.updateData (id, this.dialogValue_Nome, this.selTeam!.id);
            break;
      }
      const sottotitolo = nuovo ? "Errore nell'inserimento dei dati" : "Errore nella modifica dei dati";
      try
      {
         const response = await firstValueFrom (richiesta);
         if (response?.ok)
            await this.RicaricaLivello (liv);
         else
            this.MostraErrore (sottotitolo, `${response?.message}`);
      }
      catch (e: any)
      {
         this.MostraErrore (sottotitolo, e?.message ?? JSON.stringify (e));
      }
      this.cdr.detectChanges ();
   }


   // Società, Stagione e Campionato ricaricano tutto: la scelta automatica dell'unico elemento rimasto
   // deve poi riempire anche i livelli sotto
   private async RicaricaLivello (liv: Livello)
   {
      switch (liv)
      {
         case 'societa':
         case 'stagione':
         case 'campionato': await this.Aggiorna ();         break;
         case 'fase':       await this.CaricaFasi ();       break;
         case 'squadra':    await this.CaricaSquadre ();    break;
         case 'giocatore':  await this.CaricaGiocatori ();  break;
         case 'allenatore': await this.CaricaAllenatori (); break;
      }
   }


   DeleteData (liv: Livello)
   {
      const sel = this.Selezionato (liv);
      if (!sel)
         return;
      const id: number = Number (sel.id);
      const nome: string = (liv == 'giocatore') ? sel.nomedisp : sel.nome;
      const dlgData: MessDlgData = {
         title:               'Cancellazione',
         subtitle:            '',
         message:             `Sei veramente sicuro di voler cancellare ${NOMI_LIVELLO[liv].articolo} '<b>${nome}</b>' dal database?`,
         messtype:            'warning',
         btncaption:          'Annulla',
         showCancelButton:    true,
         cancelButtonCaption: 'Sì, procedi'
      };
      this.messageDialogService.showMessage (dlgData, '', true).subscribe (result =>
                                                                           {
                                                                              if (result === 'secondary')
                                                                                 this.EseguiCancellazione (liv, id);
                                                                           });
   }


   private async EseguiCancellazione (liv: Livello, id: number)
   {
      let richiesta: Observable<any>;
      switch (liv)
      {
         case 'societa':    richiesta = this.servSocieta.DeleteData (id); break;
         case 'stagione':   richiesta = this.servSeason.DeleteData (id);  break;
         case 'campionato': richiesta = this.servChamp.DeleteData (id);   break;
         case 'fase':       richiesta = this.servPhase.DeleteData (id);   break;
         case 'squadra':    richiesta = this.servTeam.DeleteData (id);    break;
         case 'giocatore':  richiesta = this.servPlayer.DeleteData (id);  break;
         case 'allenatore': richiesta = this.servCoach.DeleteData (id);   break;
      }
      try
      {
         const response = await firstValueFrom (richiesta);
         if (response?.ok)
         {
            // l'elemento cancellato era quello scelto: la scelta e quelle che ne dipendono non valgono più
            switch (liv)
            {
               case 'societa':    this.selSocieta = null; break;
               case 'stagione':   this.selSeason = null;  break;
               case 'campionato': this.selChamp = null;   break;
               case 'fase':       this.selPhase = null;   break;
               case 'squadra':    this.selTeam = null;    break;
               case 'giocatore':  this.selPlayer = null;  break;
               case 'allenatore': this.selCoach = null;   break;
            }
            this.PulisciSotto (liv);
            await this.RicaricaLivello (liv);
         }
         else
            this.MostraErrore ('Errore durante la cancellazione del dato', `${response?.message ?? 'Nessun dato ritornato'}`);
      }
      catch (e: any)
      {
         this.MostraErrore ('Errore durante la cancellazione del dato', e?.message ?? JSON.stringify (e));
      }
      this.cdr.detectChanges ();
   }

}
