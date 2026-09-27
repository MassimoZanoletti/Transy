import {Injectable, NgZone, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {TOperation, TOperationType} from '../common/operation';
import {TFallo, TMatchPlayer, TMatchTeam, TRealizzazione, TTipoRealizzazione} from '../models/datamod';
import {globs} from '../common/utils';


// Comando inviato al server (api_matchevent.php, operation=sync): vedi SyncCommands lato PHP
type TSyncCommand =
   { cmd: 'add', data: any } |
   { cmd: 'delete', clientuid: string } |
   { cmd: 'quarter', data: any } |
   { cmd: 'resetmatch', matchheaderid: number };


// Elemento della coda persistente (IndexedDB). "seq" (autoincrement) dà l'ordine di invio; "key" identifica
// il soggetto del comando per la compattazione (es. 'add:<uid>', 'quarter:<match>:<num>').
interface TQueueItem
{
   seq?: number;
   matchHeaderId: number;
   key: string;
   command: TSyncCommand;
}


// Stato del quarto da salvare su bbs_quarter
export interface TQuarterState
{
   matchHeaderId: number;
   num: number;
   status: 'NOTPLAYED' | 'PLAYING' | 'PLAYED';
   timeRemaining: number;
   myTeam: TMatchTeam | null;
   oppTeam: TMatchTeam | null;
}


// Salvataggio remoto della partita live, "prima in locale, poi sul server":
//  - ogni evento/modifica diventa un comando in una coda persistente nel browser (IndexedDB: sopravvive a
//    ricarica della pagina e chiusura della scheda), quindi niente va perso se in palestra manca la rete;
//  - la coda viene inviata IN ORDINE, a blocchi, appena c'è connessione; il server è idempotente sul
//    clientuid, quindi un reinvio dopo una risposta persa non duplica nulla;
//  - un solo utente, nessun conflitto da risolvere.
@Injectable({
   providedIn: 'root'
})
export class MatchSyncService
{
   private apiUrl = 'https://www.basketsarezzo.com/code/backend/bbs/api_matchevent.php';

   private static readonly DB_NAME = 'transy-sync';
   private static readonly STORE = 'queue';
   // Copia locale degli eventi di ogni partita (server + azioni locali non ancora inviate): permette di
   // ricostruire la partita anche ricaricando la pagina senza connessione (vedi LoadMatchEvents)
   private static readonly EVENTS_STORE = 'events';
   private static readonly BATCH_SIZE = 50;
   private static readonly RETRY_MIN_MS = 5000;
   private static readonly RETRY_MAX_MS = 60000;
   private static readonly POLL_MS = 30000;

   // Stato esposto alla UI
   public readonly pendingCount = signal<number>(0);
   public readonly online = signal<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
   public readonly syncing = signal<boolean>(false);
   public readonly lastError = signal<string>('');

   private dbPromise: Promise<IDBDatabase> | null = null;
   private flushing = false;
   // seq degli elementi in corso di invio: non vanno toccati dalla compattazione
   private inFlight = new Set<number>();
   private retryDelay = MatchSyncService.RETRY_MIN_MS;
   private retryTimer: any = null;
   private flushDebounce: any = null;
   // Tutte le letture/scritture della coda passano da qui, una alla volta: evita che, ad esempio, un Undo
   // immediato non trovi ancora in coda l'aggiunta appena fatta, o che la compattazione tolga un elemento
   // mentre sta per essere inviato.
   private chain: Promise<any> = Promise.resolve();


   private Serialize<T> (fn: () => Promise<T>): Promise<T>
   {
      const result = this.chain.then(fn, fn);
      this.chain = result.catch(() => undefined);
      return result;
   }


   constructor (private http: HttpClient,
                private zone: NgZone)
   {
      if (typeof window !== 'undefined')
      {
         window.addEventListener('online', () => this.zone.run(() => { this.online.set(true); this.ScheduleFlush(0); }));
         window.addEventListener('offline', () => this.zone.run(() => this.online.set(false)));
         // controllo periodico: se è rimasto qualcosa in coda (es. errori precedenti) ci si riprova
         this.zone.runOutsideAngular(() => setInterval(() => { if (this.pendingCount() > 0) this.zone.run(() => this.ScheduleFlush(0)); }, MatchSyncService.POLL_MS));
      }
      this.RefreshPendingCount().then(() => this.ScheduleFlush(0));
   }


   ///////////////////////////////////////////////////////////////
   // API usata dalla pagina della partita
   ///////////////////////////////////////////////////////////////

   EnqueueAddEvent (op: TOperation,
                    matchHeaderId: number): Promise<void>
   {
      if (!(matchHeaderId > 0))
         return Promise.resolve();
      // conversione subito: fotografa l'operazione adesso, non quando sarà inviata
      const data = this.OperationToEvent(op, matchHeaderId);
      return this.Serialize(async () =>
      {
         await this.MirrorPut(matchHeaderId, data);
         await this.Enqueue({ matchHeaderId, key: `add:${op.clientUid}`, command: { cmd: 'add', data } });
      });
   }


   // Se l'aggiunta non è ancora partita basta toglierla dalla coda; altrimenti si accoda la cancellazione
   EnqueueDeleteEvent (op: TOperation,
                       matchHeaderId: number): Promise<void>
   {
      return this.Serialize(() => this.DoEnqueueDeleteEvent(op, matchHeaderId));
   }


   private async DoEnqueueDeleteEvent (op: TOperation,
                                       matchHeaderId: number): Promise<void>
   {
      await this.MirrorDelete(op.clientUid);
      const items = await this.GetAll();
      const pendingAdd = items.find(it => (it.key === `add:${op.clientUid}`) && (!this.inFlight.has(it.seq!)));
      if (pendingAdd)
      {
         await this.DeleteItems([pendingAdd.seq!]);
         await this.RefreshPendingCount();
         return;
      }
      await this.Enqueue({ matchHeaderId, key: `delete:${op.clientUid}`, command: { cmd: 'delete', clientuid: op.clientUid } });
   }


   // Lo stato di un quarto sostituisce quello eventualmente ancora in coda per lo stesso quarto
   EnqueueQuarterState (q: TQuarterState): Promise<void>
   {
      if (!(q.matchHeaderId > 0) || !(q.num > 0))
         return Promise.resolve();
      const data = this.QuarterToDb(q);
      return this.Serialize(() => this.DoEnqueueQuarterState(q.matchHeaderId, q.num, data));
   }


   private async DoEnqueueQuarterState (matchHeaderId: number,
                                        num: number,
                                        data: any): Promise<void>
   {
      const key = `quarter:${matchHeaderId}:${num}`;
      const items = await this.GetAll();
      const obsolete = items.filter(it => (it.key === key) && (!this.inFlight.has(it.seq!))).map(it => it.seq!);
      if (obsolete.length > 0)
         await this.DeleteItems(obsolete);
      await this.Enqueue({ matchHeaderId, key, command: { cmd: 'quarter', data } });
   }


   // "Azzera tutta la partita": tutto ciò che è ancora in coda per la partita diventa inutile
   EnqueueResetMatch (matchHeaderId: number): Promise<void>
   {
      if (!(matchHeaderId > 0))
         return Promise.resolve();
      return this.Serialize(() => this.DoEnqueueResetMatch(matchHeaderId));
   }


   private async DoEnqueueResetMatch (matchHeaderId: number): Promise<void>
   {
      await this.MirrorReplaceMatch(matchHeaderId, []);
      const items = await this.GetAll();
      const obsolete = items.filter(it => (it.matchHeaderId === matchHeaderId) && (!this.inFlight.has(it.seq!))).map(it => it.seq!);
      if (obsolete.length > 0)
         await this.DeleteItems(obsolete);
      await this.Enqueue({ matchHeaderId, key: `reset:${matchHeaderId}`, command: { cmd: 'resetmatch', matchheaderid: matchHeaderId } });
   }


   ///////////////////////////////////////////////////////////////
   // Caricamento degli eventi di una partita
   ///////////////////////////////////////////////////////////////

   // Eventi della partita (formato bbs_matchevent) nell'ordine in cui vanno rigiocati:
   //  - con connessione: quelli sul server, corretti con ciò che è ancora in coda (aggiunte non ancora
   //    inviate, cancellazioni e azzeramenti non ancora eseguiti); il risultato aggiorna la copia locale;
   //  - senza connessione: la copia locale (source = 'local'), aggiornata ad ogni azione registrata.
   async LoadMatchEvents (matchHeaderId: number): Promise<{ events: any[], source: 'server' | 'local' }>
   {
      let rows: any[] | null = null;
      try
      {
         const resp: any = await firstValueFrom(this.http.get(`${this.apiUrl}?operation=all&match=${matchHeaderId}`));
         if (resp && resp.ok && Array.isArray(resp.elements))
            rows = resp.elements;
      }
      catch (err)
      {
         console.warn('MatchSync: eventi non leggibili dal server, uso la copia locale', err);
      }
      if (rows == null)
         return { events: await this.Serialize(() => this.MirrorGetMatch(matchHeaderId)), source: 'local' };

      const serverRows: any[] = rows;
      return this.Serialize(async () =>
      {
         let events: any[] = [...serverRows];
         const pending = (await this.GetAll()).filter(it => it.matchHeaderId === matchHeaderId);
         for (const it of pending)
         {
            const c = it.command;
            if (c.cmd === 'resetmatch')
               events = [];
            else if (c.cmd === 'add')
            {
               if (!events.some(e => e.clientuid === c.data.clientuid))
                  events.push(c.data);
            }
            else if (c.cmd === 'delete')
               events = events.filter(e => e.clientuid !== c.clientuid);
         }
         await this.MirrorReplaceMatch(matchHeaderId, events);
         return { events, source: 'server' as const };
      });
   }


   // Evento (riga di bbs_matchevent, o evento ancora in coda) -> TOperation, con i giocatori cercati per ID
   // nei roster attuali. I dettagli non rappresentati in TOperation restano in eventData (vedi ApplyOperation).
   EventToOperation (ev: any,
                     myTeam: TMatchTeam | null,
                     oppTeam: TMatchTeam | null): TOperation
   {
      const isMyTeam = (Number(ev.ismyteam ?? 1) === 1);
      const team = isMyTeam ? myTeam : oppTeam;
      const findPlayer = (id: any): TMatchPlayer | undefined =>
         (Number(id) > 0) ? team?.Roster.find(p => p.playerRecID === Number(id)) : undefined;
      let extra: any = {};
      try
      {
         extra = ev.extra ? JSON.parse(ev.extra) : {};
      }
      catch
      {
      }
      const op = new TOperation(Number(ev.quarternum ?? ev.quarternum_lk ?? 0),
                                Number(ev.timeremaining ?? 0),
                                TOperationType.FromDbEvent(ev.eventtype, ev.subtype, ev.shottype, ev.made),
                                isMyTeam,
                                findPlayer(ev.playerid_link),
                                findPlayer(ev.player2id_link),
                                extra.desc ?? '',
                                Number(extra.iParam ?? 0),
                                extra.desc2 ?? '');
      if (ev.clientuid)
         op.clientUid = String(ev.clientuid);
      op.eventData = ev;
      return op;
   }


   ///////////////////////////////////////////////////////////////
   // Conversioni verso il formato del server
   ///////////////////////////////////////////////////////////////



   OperationToEvent (op: TOperation,
                     matchHeaderId: number): any
   {
      const p1 = op.player1();
      const p2 = op.player2();
      const dbEv = TOperationType.ToDbEvent(op.oper(), op.iParam());
      const ev: any = {
         clientuid:          op.clientUid,
         matchheaderid_link: matchHeaderId,
         quarternum:         op.quarter(),
         timeremaining:      op.time(),
         eventtype:          dbEv.type,
         ismyteam:           op.myTeam() ? 1 : 0,
         playerid_link:      p1 ? p1.playerRecID : null,
         player2id_link:     p2 ? p2.playerRecID : null,
         subtype:            dbEv.subtype,
         shottype:           null,
         made:               null,
         points:             null,
         ftawarded:          null,
         courtx:             null,
         courty:             null,
         extra:              JSON.stringify({ desc: op.desc(), desc2: op.desc2(), iParam: op.iParam() })
      };
      const shot = MatchSyncService.ShotInfo(op.oper());
      if (shot)
      {
         ev.shottype = shot.type;
         ev.made = shot.made ? 1 : 0;
         ev.points = shot.made ? shot.value : 0;
         // posizione del tiro, se registrata sulla realizzazione corrispondente (stesso criterio di TogliRealizzazione)
         const rz: TRealizzazione | undefined = p1?.realizzazioni().find(r =>
            (r.rTipo === shot.tipo) && (r.rTempo === op.time()) && (r.rQuarto === op.quarter()));
         if (rz && ((rz.rPosX !== 0) || (rz.rPosY !== 0)))
         {
            ev.courtx = rz.rPosX;
            ev.courty = rz.rPosY;
         }
      }
      if (op.oper() === TOperationType.totTimeout)
         ev.subtype = TOperation.TimeoutAfter(op.desc2());
      if ((op.oper() === TOperationType.totFalloFatto) && p1)
      {
         if (op.eventData && (op.eventData.subtype !== undefined))
         {
            // dettagli già fissati sull'operazione (falli registrati/corretti dalle dialog dei falli)
            ev.subtype = op.eventData.subtype;
            ev.ftawarded = op.eventData.ftawarded ?? 0;
         }
         else
         {
            const ff: TFallo | undefined = p1.falliFatti().find(f =>
               f.fCommesso && (f.fQuarto === op.quarter()) && (f.fTempo === op.time()));
            if (ff)
            {
               ev.subtype = MatchSyncService.FalloSubtype(ff);
               ev.ftawarded = ff.numLiberi;
            }
         }
      }
      return ev;
   }


   // Eventi accodati prima dell'adeguamento all'ENUM di bbs_matchevent avevano come eventtype il nome
   // dell'operazione ("T2YES", "RIMBDIFESA", ...): li converte nel formato attuale prima dell'invio
   static NormalizeLegacyEvent (data: any): void
   {
      const name = String(data?.eventtype ?? '').toUpperCase();
      if ((name === '') || (TOperationType.FromDbEvent(name, data.subtype, data.shottype, data.made) !== TOperationType.totUndefined))
         return;
      for (const key in TOperationType)
      {
         if (isNaN(Number(key)) && key.startsWith('tot') && (key.substring(3).toUpperCase() === name))
         {
            let iParam = 0;
            try { iParam = Number(JSON.parse(data.extra ?? '{}').iParam ?? 0); } catch { }
            const dbEv = TOperationType.ToDbEvent((TOperationType as any)[key] as TOperationType, iParam);
            data.eventtype = dbEv.type;
            if (dbEv.subtype && !data.subtype)
               data.subtype = dbEv.subtype;
            return;
         }
      }
   }


   static FalloSubtype (ff: TFallo): string
   {
      return ff.fEspulsione ? 'ESPULSIONE' : ff.fAntisportivo ? 'ANTISPORTIVO' : ff.fTecnico ? 'TECNICO' : 'PERSONALE';
   }


   private static ShotInfo (oper: TOperationType): { type: string, tipo: TTipoRealizzazione, made: boolean, value: number } | null
   {
      switch (oper)
      {
         case TOperationType.totTLYes: return { type: 'TL', tipo: TTipoRealizzazione.trTL, made: true,  value: 1 };
         case TOperationType.totTLNo:  return { type: 'TL', tipo: TTipoRealizzazione.trTL, made: false, value: 1 };
         case TOperationType.totT2Yes: return { type: 'T2', tipo: TTipoRealizzazione.trT2, made: true,  value: 2 };
         case TOperationType.totT2No:  return { type: 'T2', tipo: TTipoRealizzazione.trT2, made: false, value: 2 };
         case TOperationType.totT3Yes: return { type: 'T3', tipo: TTipoRealizzazione.trT3, made: true,  value: 3 };
         case TOperationType.totT3No:  return { type: 'T3', tipo: TTipoRealizzazione.trT3, made: false, value: 3 };
         default:                      return null;
      }
   }


   // Punteggio progressivo: punti di partenza = somma dei quarti precedenti, attuali = partenza + quarto
   private QuarterToDb (q: TQuarterState): any
   {
      const pts = (team: TMatchTeam | null) =>
      {
         let start = 0;
         for (let i = 0; i < q.num - 1; i++)
            start += team?.GetQuarto(i)?.punti ?? 0;
         const qrt = team?.GetQuarto(q.num - 1) ?? null;
         return { start, curr: start + (qrt?.punti ?? 0), fouls: qrt?.falliQrt ?? 0, bonus: qrt?.bonus ?? false };
      };
      const my = pts(q.myTeam);
      const opp = pts(q.oppTeam);
      return {
         matchheaderid_link: q.matchHeaderId,
         num:                q.num,
         isregular:          q.num <= globs.MaxRegQuarters,
         status:             q.status,
         myteamstartpoint:   my.start,
         oppoteamstartpoint: opp.start,
         myteamcurrpoint:    my.curr,
         oppoteamcurrpoint:  opp.curr,
         myteamfouls:        my.fouls,
         oppoteamfouls:      opp.fouls,
         myteambonus:        my.bonus,
         oppoteambonus:      opp.bonus,
         timeremaining:      q.timeRemaining
      };
   }


   ///////////////////////////////////////////////////////////////
   // Invio
   ///////////////////////////////////////////////////////////////

   ScheduleFlush (delayMs: number = 300): void
   {
      if (this.flushDebounce)
         clearTimeout(this.flushDebounce);
      this.flushDebounce = setTimeout(() => { this.flushDebounce = null; this.Flush(); }, delayMs);
   }


   async Flush (): Promise<void>
   {
      if (this.flushing)
         return;
      if ((typeof navigator !== 'undefined') && (!navigator.onLine))
         return;
      this.flushing = true;
      this.syncing.set(true);
      try
      {
         while (true)
         {
            const batch = await this.Serialize(async () =>
            {
               const b = (await this.GetAll()).slice(0, MatchSyncService.BATCH_SIZE);
               b.forEach(it => { if (it.command.cmd === 'add') MatchSyncService.NormalizeLegacyEvent(it.command.data); });
               b.forEach(it => this.inFlight.add(it.seq!));
               return b;
            });
            if (batch.length === 0)
               break;
            let processed = 0;
            let message = '';
            try
            {
               const resp: any = await firstValueFrom(this.http.post(`${this.apiUrl}?operation=sync`, { commands: batch.map(it => it.command) }));
               processed = Number(resp?.processed ?? 0);
               message = resp?.message ?? '';
            }
            catch (err: any)
            {
               // il server risponde 200 anche con un comando fallito; qui arrivano errori di rete/HTTP
               processed = Number(err?.error?.processed ?? 0);
               message = err?.error?.message ?? err?.message ?? 'Errore di rete';
            }
            await this.Serialize(async () =>
            {
               if (processed > 0)
                  await this.DeleteItems(batch.slice(0, processed).map(it => it.seq!));
               batch.forEach(it => this.inFlight.delete(it.seq!));
               await this.RefreshPendingCount();
            });
            if (processed < batch.length)
            {
               this.lastError.set(message);
               this.ScheduleRetry();
               break;
            }
            this.lastError.set('');
            this.retryDelay = MatchSyncService.RETRY_MIN_MS;
         }
      }
      finally
      {
         this.flushing = false;
         this.syncing.set(false);
      }
   }


   private ScheduleRetry (): void
   {
      if (this.retryTimer)
         return;
      const delay = this.retryDelay;
      this.retryDelay = Math.min(this.retryDelay * 2, MatchSyncService.RETRY_MAX_MS);
      this.retryTimer = setTimeout(() => { this.retryTimer = null; this.Flush(); }, delay);
   }


   ///////////////////////////////////////////////////////////////
   // Coda su IndexedDB
   ///////////////////////////////////////////////////////////////

   private async Enqueue (item: TQueueItem): Promise<void>
   {
      try
      {
         const db = await this.OpenDb();
         await this.Tx(db, 'readwrite', store => store.add(item));
      }
      catch (err)
      {
         console.error('MatchSync: impossibile salvare in coda', err);
         this.lastError.set('Impossibile salvare in locale: ' + String(err));
         return;
      }
      await this.RefreshPendingCount();
      this.ScheduleFlush();
   }


   private OpenDb (): Promise<IDBDatabase>
   {
      if (!this.dbPromise)
      {
         this.dbPromise = new Promise<IDBDatabase>((resolve, reject) =>
         {
            const req = indexedDB.open(MatchSyncService.DB_NAME, 2);
            req.onupgradeneeded = () =>
            {
               const db = req.result;
               if (!db.objectStoreNames.contains(MatchSyncService.STORE))
                  db.createObjectStore(MatchSyncService.STORE, { keyPath: 'seq', autoIncrement: true });
               if (!db.objectStoreNames.contains(MatchSyncService.EVENTS_STORE))
               {
                  const ev = db.createObjectStore(MatchSyncService.EVENTS_STORE, { keyPath: 'clientuid' });
                  ev.createIndex('matchHeaderId', 'matchHeaderId', { unique: false });
               }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => { this.dbPromise = null; reject(req.error); };
         });
      }
      return this.dbPromise;
   }


   private Tx<T> (db: IDBDatabase,
                  mode: IDBTransactionMode,
                  body: (store: IDBObjectStore) => IDBRequest<T> | void,
                  storeName: string = MatchSyncService.STORE): Promise<T | undefined>
   {
      return new Promise<T | undefined>((resolve, reject) =>
      {
         const tx = db.transaction(storeName, mode);
         const req = body(tx.objectStore(storeName));
         tx.oncomplete = () => resolve(req ? req.result : undefined);
         tx.onerror = () => reject(tx.error);
         tx.onabort = () => reject(tx.error);
      });
   }


   // Tutti gli elementi in coda, in ordine di inserimento
   private async GetAll (): Promise<TQueueItem[]>
   {
      try
      {
         const db = await this.OpenDb();
         return ((await this.Tx<TQueueItem[]>(db, 'readonly', store => store.getAll())) ?? []);
      }
      catch (err)
      {
         console.error('MatchSync: lettura coda fallita', err);
         return [];
      }
   }


   private async DeleteItems (seqs: number[]): Promise<void>
   {
      if (seqs.length === 0)
         return;
      const db = await this.OpenDb();
      await this.Tx(db, 'readwrite', store => { seqs.forEach(s => store.delete(s)); });
   }


   private async RefreshPendingCount (): Promise<void>
   {
      try
      {
         const db = await this.OpenDb();
         this.pendingCount.set((await this.Tx<number>(db, 'readonly', store => store.count())) ?? 0);
      }
      catch
      {
      }
   }

   ///////////////////////////////////////////////////////////////
   // Copia locale degli eventi (store "events": {clientuid, matchHeaderId, ord, data})
   ///////////////////////////////////////////////////////////////

   private mirrorOrd = Date.now() * 1000;


   private async MirrorPut (matchHeaderId: number,
                            data: any): Promise<void>
   {
      try
      {
         const db = await this.OpenDb();
         await this.Tx(db, 'readwrite', store => store.put({ clientuid: data.clientuid, matchHeaderId, ord: this.mirrorOrd++, data }), MatchSyncService.EVENTS_STORE);
      }
      catch (err)
      {
         console.error('MatchSync: copia locale evento non salvata', err);
      }
   }


   private async MirrorDelete (clientUid: string): Promise<void>
   {
      try
      {
         const db = await this.OpenDb();
         await this.Tx(db, 'readwrite', store => store.delete(clientUid), MatchSyncService.EVENTS_STORE);
      }
      catch (err)
      {
         console.error('MatchSync: cancellazione dalla copia locale fallita', err);
      }
   }


   private async MirrorGetMatch (matchHeaderId: number): Promise<any[]>
   {
      try
      {
         const db = await this.OpenDb();
         const recs: any[] = (await this.Tx<any[]>(db, 'readonly', store => store.index('matchHeaderId').getAll(matchHeaderId), MatchSyncService.EVENTS_STORE)) ?? [];
         return recs.sort((a, b) => a.ord - b.ord).map(r => r.data);
      }
      catch (err)
      {
         console.error('MatchSync: lettura copia locale fallita', err);
         return [];
      }
   }


   private async MirrorReplaceMatch (matchHeaderId: number,
                                     events: any[]): Promise<void>
   {
      try
      {
         const db = await this.OpenDb();
         const keys: IDBValidKey[] = (await this.Tx<IDBValidKey[]>(db, 'readonly', store => store.index('matchHeaderId').getAllKeys(matchHeaderId), MatchSyncService.EVENTS_STORE)) ?? [];
         await this.Tx(db, 'readwrite', store =>
         {
            keys.forEach(k => store.delete(k));
            events.forEach((ev, i) =>
            {
               if (ev.clientuid)
                  store.put({ clientuid: String(ev.clientuid), matchHeaderId, ord: i, data: ev });
            });
         }, MatchSyncService.EVENTS_STORE);
      }
      catch (err)
      {
         console.error('MatchSync: aggiornamento copia locale fallito', err);
      }
   }
}
