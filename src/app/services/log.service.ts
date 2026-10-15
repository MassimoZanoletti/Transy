import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IDSUser } from '../models/datamod';
import { loggedUser } from './users.service';
import { utils } from '../common/utils';



// riga da scrivere nel log; timecode solo per le righe rimaste in attesa (altrimenti l'ora la mette il server)
interface TRigaLog
{
   userid:     number;
   username:   string;
   op:         string;
   parameters: string;
   timecode?:  string;
}


// aggiornamento dell'app non ancora registrato (nessun utente loggato); da = null alla prima installazione
interface TVersioneInSospeso
{
   da:       string | null;
   a:        string;
   timecode: string;
}


// Log delle operazioni sul server (tabella bbs_log): login, logout, operazioni sugli utenti, errori.
// La scrittura non deve mai disturbare l'app (in partita soprattutto): parte e non si aspetta, e usa fetch con
// keepalive, così arriva anche se subito dopo la pagina viene ricaricata (logout). Senza rete la riga resta in
// attesa nel localStorage (con la sua ora) e viene inviata al ritorno della connessione o al prossimo avvio.
@Injectable({
  providedIn: 'root'
})
export class LogService
{
   private apiUrl = 'https://www.basketsarezzo.com/code/backend/bbs/api_log.php';
   private static readonly CHIAVE_ATTESA = 'BBS_LogInAttesa';
   private static readonly CHIAVE_VERSIONE = 'BBS_VersioneApp';
   private static readonly CHIAVE_VERSIONE_SOSPESA = 'BBS_VersioneDaRegistrare';
   private static readonly MAX_ATTESA = 200;         // oltre, si perdono le righe più vecchie
   private static readonly MAX_ERRORI = 50;           // errori per sessione (un errore in un ciclo non intasa il log)
   private erroriInviati = new Set<string> ();
   private invioAttesaInCorso = false;
   private inRegistrazione = false;
   private intercettazioneAttiva = false;

   constructor(private http: HttpClient)
   {
      window.addEventListener('online', () => this.InviaInAttesa());
      setTimeout(() => this.InviaInAttesa(), 5000);
   }


   // righe più recenti per prime
   getAllData(aLimit: number = 1000): Observable<any>
   {
      return this.http.get<any>(`${this.apiUrl}?operation=all&limit=${aLimit}`);
   }


   // righe più vecchie di aMonths mesi (elements: { count, limite })
   getCountOld(aMonths: number): Observable<any>
   {
      return this.http.get<any>(`${this.apiUrl}?operation=countold&months=${aMonths}`);
   }


   // cancellazione delle righe più vecchie di aMonths mesi (elements: { deleted, limite })
   deleteOld(aMonths: number): Observable<any>
   {
      return this.http.get<any>(`${this.apiUrl}?operation=deleteold&months=${aMonths}`);
   }


   // aOperation: cosa è successo (Login, Logout, Errore...); aParameters: i dettagli (troncati dal server a 255 caratteri)
   AddToLog (aUser: IDSUser,
             aOperation: string,
             aParameters: string = ""): void
   {
      try
      {
         this.Invia({
            userid:     aUser?.id ?? 0,
            username:   aUser?.nome ?? "",
            op:         aOperation,
            parameters: aParameters.substring(0, 1000)      // il server tiene 255 caratteri; la URL resta corta
         });
      }
      catch
      {
         // il log non deve mai far fallire l'operazione che lo chiama
      }
   }


   // errori: testo senza HTML e spazi ripetuti
   AddErrorToLog (aUser: IDSUser,
                  aDescrizione: string): void
   {
      const testo = (aDescrizione ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      this.AddToLog(aUser, "Errore", testo);
   }


   // Tutti gli errori dell'app nel log: ogni console.error (lo usano il codice dell'app e l'ErrorHandler di Angular
   // per gli errori non gestiti) e gli errori/promesse rifiutate fuori da Angular. Chiamato una volta all'avvio.
   IntercettaErrori (): void
   {
      if (this.intercettazioneAttiva)
         return;
      this.intercettazioneAttiva = true;
      const consoleErrorOriginale = console.error.bind(console);
      console.error = (...args: any[]) =>
      {
         consoleErrorOriginale(...args);
         this.RegistraErrore(args);
      };
      window.addEventListener('error', (ev: ErrorEvent) => this.RegistraErrore([ev.error ?? ev.message]));
      window.addEventListener('unhandledrejection', (ev: PromiseRejectionEvent) => this.RegistraErrore(["Promise rifiutata:", ev.reason]));
   }


   private RegistraErrore (args: any[]): void
   {
      if (this.inRegistrazione)
         return;
      this.inRegistrazione = true;
      try
      {
         const testo = args.map(a => LogService.TestoDi(a)).filter(t => t !== "").join(" ").trim();
         // lo stesso errore una volta sola per sessione, e non oltre MAX_ERRORI
         if ((testo === "") || this.erroriInviati.has(testo) || (this.erroriInviati.size >= LogService.MAX_ERRORI))
            return;
         this.erroriInviati.add(testo);
         this.AddErrorToLog(loggedUser, testo);
      }
      catch
      {
         // il log non deve generare altri errori
      }
      finally
      {
         this.inRegistrazione = false;
      }
   }


   // Aggiornamenti dell'app: all'avvio la versione attuale si confronta con l'ultima vista su questo dispositivo
   // (localStorage), così si registra ogni aggiornamento, sia dal bottone "Aggiorna" sia riaprendo l'app.
   // Se nessuno è loggato la riga resta in sospeso (con l'ora dell'aggiornamento) e va nel log al login,
   // con l'utente. Chiamato una volta all'avvio, dopo il ripristino dell'utente dalla sessione.
   RegistraVersione (aVersione: string): void
   {
      try
      {
         const precedente = localStorage.getItem(LogService.CHIAVE_VERSIONE);
         if (precedente === aVersione)
            return;
         localStorage.setItem(LogService.CHIAVE_VERSIONE, aVersione);
         // più aggiornamenti prima di un login: una riga sola, dalla prima versione all'ultima
         const sospeso = this.LeggiVersioneInSospeso();
         const riga: TVersioneInSospeso = sospeso
            ? { ...sospeso, a: aVersione }
            : { da: precedente, a: aVersione, timecode: LogService.Adesso() };
         localStorage.setItem(LogService.CHIAVE_VERSIONE_SOSPESA, JSON.stringify(riga));
         if (loggedUser.ruolo != "")
            this.RegistraVersioneInSospeso(loggedUser);
      }
      catch
      {
         // localStorage non disponibile: l'aggiornamento non si registra
      }
   }


   // al login: la riga dell'aggiornamento rimasta in sospeso va nel log con l'utente appena entrato
   RegistraVersioneInSospeso (aUser: IDSUser): void
   {
      try
      {
         const riga = this.LeggiVersioneInSospeso();
         if (!riga)
            return;
         localStorage.removeItem(LogService.CHIAVE_VERSIONE_SOSPESA);
         this.Invia({
            userid:     aUser?.id ?? 0,
            username:   aUser?.nome ?? "",
            op:         riga.da ? "Aggiornamento" : "Prima installazione",
            parameters: riga.da ? `v. ${riga.da} -> v. ${riga.a}` : `v. ${riga.a}`,
            timecode:   riga.timecode
         });
      }
      catch
      {
         // il log non deve mai far fallire l'operazione che lo chiama
      }
   }


   private LeggiVersioneInSospeso (): TVersioneInSospeso | null
   {
      try
      {
         const testo = localStorage.getItem(LogService.CHIAVE_VERSIONE_SOSPESA);
         const riga = testo ? JSON.parse(testo) : null;
         return (riga && riga.a) ? riga : null;
      }
      catch
      {
         return null;
      }
   }


   private static TestoDi (a: any): string
   {
      if ((a === null) || (a === undefined))
         return "";
      if (typeof a === 'string')
         return a;
      if (a instanceof Error)
         return `${a.name}: ${a.message}`;
      if (typeof a?.message === 'string')        // es. HttpErrorResponse
         return a.message;
      try
      {
         return JSON.stringify(a).substring(0, 500);
      }
      catch
      {
         return `${a}`;
      }
   }


   private Url (riga: TRigaLog): string
   {
      const params = new URLSearchParams({
         operation:  "add",
         userid:     `${riga.userid}`,
         username:   riga.username,
         op:         riga.op,
         parameters: riga.parameters
      });
      if (riga.timecode)
         params.set("timecode", riga.timecode);
      return `${this.apiUrl}?${params.toString()}`;
   }


   // invio di una riga; se la rete non c'è va in attesa con l'ora attuale. Un errore del server (risposta non ok)
   // non si ritenta: ripeterla darebbe lo stesso errore
   private Invia (riga: TRigaLog): void
   {
      fetch(this.Url(riga), { keepalive: true })
         .then(() => this.InviaInAttesa())                 // la rete c'è: si svuotano anche quelle in attesa
         .catch(() => this.MettiInAttesa({ ...riga, timecode: riga.timecode ?? LogService.Adesso() }));
   }


   private MettiInAttesa (riga: TRigaLog): void
   {
      const attesa = this.LeggiAttesa();
      attesa.push(riga);
      this.ScriviAttesa(attesa.slice(-LogService.MAX_ATTESA));
   }


   private async InviaInAttesa (): Promise<void>
   {
      if (this.invioAttesaInCorso)
         return;
      const attesa = this.LeggiAttesa();
      if (attesa.length == 0)
         return;
      this.invioAttesaInCorso = true;
      this.ScriviAttesa([]);
      let i = 0;
      try
      {
         for (; i < attesa.length; i++)
            await fetch(this.Url(attesa[i]));
      }
      catch
      {
         // rete di nuovo assente: le righe non inviate tornano in attesa (davanti a quelle arrivate nel frattempo)
         this.ScriviAttesa([...attesa.slice(i), ...this.LeggiAttesa()].slice(-LogService.MAX_ATTESA));
      }
      finally
      {
         this.invioAttesaInCorso = false;
      }
   }


   private LeggiAttesa (): TRigaLog[]
   {
      try
      {
         const testo = localStorage.getItem(LogService.CHIAVE_ATTESA);
         const righe = testo ? JSON.parse(testo) : [];
         return Array.isArray(righe) ? righe : [];
      }
      catch
      {
         return [];
      }
   }


   private ScriviAttesa (righe: TRigaLog[]): void
   {
      try
      {
         if (righe.length > 0)
            localStorage.setItem(LogService.CHIAVE_ATTESA, JSON.stringify(righe));
         else
            localStorage.removeItem(LogService.CHIAVE_ATTESA);
      }
      catch
      {
         // localStorage non disponibile: le righe in attesa si perdono
      }
   }


   // ora locale nel formato del log (AAAA-MM-GG HH:MM:SS)
   private static Adesso (): string
   {
      const d = new Date();
      const p = (n: number) => utils.Dlt_PadDigits(n, 2);
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
   }
}
