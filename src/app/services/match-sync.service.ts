import {Injectable, Injector, NgZone, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom, Subject} from 'rxjs';
import {TOperation, TOperationType} from '../common/operation';
import {TFallo, TMatchPlayer, TMatchTeam, TRealizzazione, TTipoRealizzazione} from '../models/datamod';
import {globs} from '../common/utils';
import {MatchheaderService} from './matchheader.service';
import {MatchrosterService} from './matchroster.service';
import {PlayerService} from './player.service';
import {CoachService} from './coach.service';


// Scritture su intestazione/roster/anagrafica (non eventi) che passano dalla coda:
//  - matchheader:  riga completa di bbs_matchheader (formato MatchHeaderToDb); id = partita
//  - roster:       { rows } = roster COMPLETO della partita (righe formato MatchRosterToDb + playername_lk):
//                  sul server si cancella e si reinserisce tutto; id = partita
//  - playername:   { nomedisp } del giocatore (il resto dell'anagrafica si rilegge al momento dell'invio)
//  - createplayer: nuovo giocatore { nomedisp, anno, ruolo, numero, altezza, teamid_link }; id = id provvisorio
//  - createcoach:  nuovo allenatore { nome, teamid_link }; id = id provvisorio
//
// Id provvisori: giocatori e allenatori creati in palestra (dove la rete spesso manca) ricevono subito un id
// NEGATIVO, usato ovunque (roster, eventi, intestazione) finché il server non li crea; da lì in poi la
// corrispondenza provvisorio -> reale (store "idmap") viene applicata a tutto ciò che si invia o si rilegge.
export type TWriteEntity = 'matchheader' | 'roster' | 'playername' | 'createplayer' | 'createcoach';


// Comando inviato al server (api_matchevent.php, operation=sync): vedi SyncCommands lato PHP.
// 'write' invece non va a operation=sync: lo esegue il client con la "edit" dell'API dell'entità.
type TSyncCommand =
   { cmd: 'add', data: any } |
   { cmd: 'delete', clientuid: string } |
   { cmd: 'quarter', data: any } |
   { cmd: 'resetmatch', matchheaderid: number } |
   { cmd: 'write', entity: TWriteEntity, id: number, data: any };


// Elemento della coda persistente (IndexedDB). "seq" (autoincrement) dà l'ordine di invio; "key" identifica
// il soggetto del comando per la compattazione (es. 'add:<uid>', 'quarter:<match>:<num>').
interface TQueueItem
{
   seq?: number;
   matchHeaderId: number;
   key: string;
   command: TSyncCommand;
   // solo per 'write': quante volte il server l'ha già rifiutata (vedi MAX_WRITE_REJECTS)
   attempts?: number;
   // solo per 'write': già inviata almeno una volta (per createplayer: la risposta potrebbe essersi persa
   // dopo l'inserimento, quindi prima di reinserire si cerca se il giocatore esiste già)
   tried?: boolean;
}


// Campi (formato DB) che possono contenere l'id provvisorio di un giocatore o di un allenatore
const TEMP_ID_FIELDS = ['playerid_link', 'player2id_link', 'mycoach1id_link', 'mycoach2id_link', 'oppocoach1id_link', 'oppocoach2id_link'];


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
   // Corrispondenza id provvisorio (negativo) -> id assegnato dal server: {tempId, realId}
   private static readonly IDMAP_STORE = 'idmap';
   private static readonly BATCH_SIZE = 50;
   private static readonly RETRY_MIN_MS = 5000;
   private static readonly RETRY_MAX_MS = 60000;
   private static readonly POLL_MS = 30000;
   private static readonly MAX_WRITE_REJECTS = 3;

   // Stato esposto alla UI
   public readonly pendingCount = signal<number>(0);
   public readonly online = signal<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
   public readonly syncing = signal<boolean>(false);
   public readonly lastError = signal<string>('');
   // Scrittura rifiutata dal server (risposta ok=false): viene tolta dalla coda per non bloccare gli eventi
   // che seguono, e segnalata all'utente (vedi AppComponent)
   public readonly writeRejected = new Subject<string>();

   // Ultimo dato in coda per ogni scrittura non ancora confermata ('<entity>:<id>' -> data): le letture dei
   // service lo sovrappongono a quanto arriva dal server/cache, così una modifica fatta offline resta visibile
   private pendingWrites = new Map<string, any>();
   private pendingWritesReady: Promise<void>;
   private idMap = new Map<number, number>();
   private tempCounter = 0;

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


   // I service delle entità si prendono dall'Injector solo al momento dell'invio: loro stessi usano
   // MatchSyncService per sovrapporre le scritture in coda, iniettarli qui creerebbe un ciclo
   constructor (private http: HttpClient,
                private zone: NgZone,
                private injector: Injector)
   {
      if (typeof window !== 'undefined')
      {
         window.addEventListener('online', () => this.zone.run(() => { this.online.set(true); this.ScheduleFlush(0); }));
         window.addEventListener('offline', () => this.zone.run(() => this.online.set(false)));
         // controllo periodico: se è rimasto qualcosa in coda (es. errori precedenti) ci si riprova
         this.zone.runOutsideAngular(() => setInterval(() => { if (this.pendingCount() > 0) this.zone.run(() => this.ScheduleFlush(0)); }, MatchSyncService.POLL_MS));
      }
      this.pendingWritesReady = Promise.all([this.RefreshPendingCount(), this.LoadIdMap()]).then(() => undefined);
      this.pendingWritesReady.then(() => this.ScheduleFlush(0));
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


   // Modifica di intestazione partita, roster o nome giocatore: prima in locale, poi sul server come gli
   // eventi. Una scrittura sulla stessa entità sostituisce quella eventualmente ancora in coda.
   EnqueueWrite (entity: TWriteEntity,
                 id: number,
                 data: any,
                 matchHeaderId: number): Promise<void>
   {
      if ((!Number.isFinite(id)) || (id === 0))
         return Promise.resolve();
      // copia subito: fotografa il dato adesso, non quando sarà inviato
      const snapshot = JSON.parse(JSON.stringify(data));
      return this.Serialize(async () =>
      {
         await this.pendingWritesReady;
         // giocatore creato localmente ma già arrivato al server: si usa l'id reale
         if (entity === 'playername')
            id = this.MapId(id);
         const items = await this.GetAll();
         // nuovo nome di un giocatore non ancora creato sul server: basta correggerne la creazione in coda
         if ((entity === 'playername') && (id < 0))
         {
            const create = items.find(it => (it.key === `write:createplayer:${id}`) && (!this.inFlight.has(it.seq!)));
            if (create && (create.command.cmd === 'write'))
            {
               create.command.data.nomedisp = snapshot.nomedisp;
               await this.PutItem(create);
               await this.RefreshPendingCount();
               return;
            }
         }
         const key = `write:${entity}:${id}`;
         const obsolete = items.filter(it => (it.key === key) && (!this.inFlight.has(it.seq!))).map(it => it.seq!);
         if (obsolete.length > 0)
            await this.DeleteItems(obsolete);
         this.pendingWrites.set(`${entity}:${id}`, snapshot);
         await this.Enqueue({ matchHeaderId, key, command: { cmd: 'write', entity, id, data: snapshot } });
      });
   }


   // Id provvisorio (negativo, unico) per un giocatore/allenatore creato localmente
   NewTempId (): number
   {
      this.tempCounter = (this.tempCounter + 1) % 100;
      return -(Date.now() * 100 + this.tempCounter);
   }


   // Id reale corrispondente a un id provvisorio, se il server l'ha già assegnato; altrimenti l'id stesso
   MapId (id: number): number
   {
      const n = Number(id);
      return (n < 0) ? (this.idMap.get(n) ?? n) : id;
   }


   // Copia della riga (formato DB) con gli id provvisori già assegnati dal server sostituiti da quelli reali
   private MapRowIds<T> (row: T): T
   {
      if ((!row) || (typeof row !== 'object') || (this.idMap.size === 0))
         return row;
      const res: any = { ...row };
      for (const f of TEMP_ID_FIELDS)
      {
         if ((res[f] != null) && (Number(res[f]) < 0))
            res[f] = this.MapId(Number(res[f]));
      }
      return res;
   }


   // Roster completo della partita ancora in coda (righe formato DB), se c'è
   async PendingRoster (matchHeaderId: number): Promise<any[] | undefined>
   {
      await this.pendingWritesReady;
      const rows: any[] | undefined = this.pendingWrites.get(`roster:${matchHeaderId}`)?.rows;
      return rows ? rows.map(r => this.ToServerFormat(this.MapRowIds(r))) : undefined;
   }


   // Giocatori/allenatori creati localmente e non ancora arrivati al server, per la squadra indicata (formato
   // DB, con l'id provvisorio): le liste lette dal server/cache li devono mostrare comunque
   async PendingCreated (entity: 'createplayer' | 'createcoach',
                         teamId: number): Promise<any[]>
   {
      await this.pendingWritesReady;
      const res: any[] = [];
      this.pendingWrites.forEach((data, key) =>
      {
         const [ent, id] = key.split(':');
         if ((ent === entity) && (Number(data?.teamid_link) === Number(teamId)))
            res.push({ ...data, id: Number(id) });
      });
      return res;
   }


   // I dati in coda sono nel formato "ToDb" (booleani veri), le righe lette dal server hanno 1/0 come
   // stringhe: i vari "FromDb" confrontano con '1', quindi si convertono i booleani nel formato del server
   private ToServerFormat (row: any): any
   {
      const res: any = {};
      for (const k of Object.keys(row))
      {
         const v = row[k];
         if (v !== undefined)
            res[k] = (typeof v === 'boolean') ? (v ? '1' : '0') : v;
      }
      return res;
   }


   // Con connessione, attende (al massimo timeoutMs) che le scritture in coda arrivino al server: da usare
   // prima di rileggere dati appena modificati, altrimenti la rilettura potrebbe precedere l'invio
   async WaitForWrites (timeoutMs: number = 4000): Promise<void>
   {
      await this.pendingWritesReady;
      if ((typeof navigator !== 'undefined') && (!navigator.onLine))
         return;
      this.ScheduleFlush(0);
      const end = Date.now() + timeoutMs;
      while ((this.pendingWrites.size > 0) && (Date.now() < end))
         await new Promise(r => setTimeout(r, 150));
   }


   // Righe lette dal server/cache (formato DB) con sovrapposte le scritture ancora in coda per la stessa entità
   async OverlayRows (entity: TWriteEntity,
                      rows: any[],
                      idOf: (row: any) => number): Promise<any[]>
   {
      await this.pendingWritesReady;
      if ((this.pendingWrites.size === 0) || (!Array.isArray(rows)))
         return rows;
      return rows.map(row =>
      {
         const pending = this.pendingWrites.get(`${entity}:${idOf(row)}`);
         if (!pending)
            return row;
         return this.MapRowIds({ ...row, ...this.ToServerFormat(pending) });
      });
   }


   // Nome giocatore ancora in coda (entity 'playername'), se c'è
   async PendingPlayerName (playerId: number): Promise<string | undefined>
   {
      await this.pendingWritesReady;
      return this.pendingWrites.get(`playername:${playerId}`)?.nomedisp ??
             this.pendingWrites.get(`createplayer:${playerId}`)?.nomedisp;
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
      // le scritture su intestazione/roster/giocatori restano valide anche azzerando la partita
      const obsolete = items.filter(it => (it.matchHeaderId === matchHeaderId) && (it.command.cmd !== 'write') && (!this.inFlight.has(it.seq!))).map(it => it.seq!);
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
      await this.pendingWritesReady;
      if (rows == null)
         return { events: (await this.Serialize(() => this.MirrorGetMatch(matchHeaderId))).map(ev => this.MapRowIds(ev)), source: 'local' };

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
         // giocatori creati in palestra: negli eventi in coda possono esserci ancora gli id provvisori
         events = events.map(ev => this.MapRowIds(ev));
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
         else if ((op.eventData?.courtx != null) || (op.eventData?.courty != null))
         {
            // posizione già fissata sull'operazione (tiro corretto da "Modifica azione", non ancora applicato)
            ev.courtx = op.eventData.courtx;
            ev.courty = op.eventData.courty;
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
            // Sempre in ordine: o una sola scrittura (se è in testa alla coda), o il blocco di comandi per
            // operation=sync che la precede
            const batch = await this.Serialize(async () =>
            {
               const all = await this.GetAll();
               const b: TQueueItem[] = [];
               if ((all.length > 0) && (all[0].command.cmd === 'write'))
                  b.push(all[0]);
               else
               {
                  for (const it of all)
                  {
                     if ((it.command.cmd === 'write') || (b.length >= MatchSyncService.BATCH_SIZE))
                        break;
                     b.push(it);
                  }
               }
               b.forEach(it => { if (it.command.cmd === 'add') MatchSyncService.NormalizeLegacyEvent(it.command.data); });
               b.forEach(it => this.inFlight.add(it.seq!));
               return b;
            });
            if (batch.length === 0)
               break;
            const first = batch[0].command;
            if (first.cmd === 'write')
            {
               const item = batch[0];
               if (!item.tried)
                  await this.Serialize(() => this.PutItem({ ...item, tried: true }));
               const res = await this.ExecuteWrite(first, !!item.tried);
               const attempts = (item.attempts ?? 0) + ((res.result === 'rejected') ? 1 : 0);
               // un rifiuto ripetuto viene tolto dalla coda: altrimenti bloccherebbe per sempre anche gli eventi
               const giveUp = (res.result === 'rejected') && (attempts >= MatchSyncService.MAX_WRITE_REJECTS);
               await this.Serialize(async () =>
               {
                  if ((res.result === 'ok') || giveUp)
                     await this.DeleteItems([item.seq!]);
                  else if (res.result === 'rejected')
                     await this.PutItem({ ...item, attempts, tried: true });
                  this.inFlight.delete(item.seq!);
                  await this.RefreshPendingCount();
               });
               if ((res.result !== 'ok') && (!giveUp))
               {
                  this.lastError.set(res.message);
                  this.ScheduleRetry();
                  break;
               }
               if (giveUp)
               {
                  console.error('MatchSync: scrittura rifiutata dal server', first, res.message);
                  this.zone.run(() => this.writeRejected.next(res.message));
               }
               this.lastError.set('');
               this.retryDelay = MatchSyncService.RETRY_MIN_MS;
               continue;
            }
            let processed = 0;
            let message = '';
            try
            {
               // id provvisori dei giocatori sostituiti con quelli reali (le creazioni in coda precedono gli eventi)
               const commands = batch.map(it => (it.command.cmd === 'add') ? { ...it.command, data: this.MapRowIds(it.command.data) } : it.command);
               const resp: any = await firstValueFrom(this.http.post(`${this.apiUrl}?operation=sync`, { commands }));
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


   // Esegue una scrittura con la "edit" dell'API dell'entità. Esito:
   //  - 'ok':       eseguita;
   //  - 'network':  nessuna risposta dal server (rete, host irraggiungibile): si riprova finché serve;
   //  - 'rejected': il server ha risposto ok=false. Le API rispondono 500 sia per errori definitivi (record
   //                non trovato) sia temporanei (database), quindi si riprova solo qualche volta (vedi Flush)
   private async ExecuteWrite (c: { entity: TWriteEntity, id: number, data: any },
                               tried: boolean): Promise<{ result: 'ok' | 'network' | 'rejected', message: string }>
   {
      const what = (c.entity === 'matchheader')  ? 'Intestazione partita non salvata' :
                   (c.entity === 'roster')       ? 'Roster partita non salvato' :
                   (c.entity === 'createplayer') ? `Nuovo giocatore "${c.data?.nomedisp}" non creato` :
                   (c.entity === 'createcoach')  ? `Nuovo allenatore "${c.data?.nome}" non creato` :
                                                   `Nome giocatore "${c.data?.nomedisp}" non salvato`;
      const check = (resp: any) =>
      {
         if (resp?.ok === false)
            throw { error: resp };
      };
      const fail = (message: string) => ({ error: { ok: false, message } });
      try
      {
         switch (c.entity)
         {
            case 'matchheader':
            {
               // allenatori creati localmente: id reale, oppure nessuno se la creazione non è riuscita
               const data = this.MapRowIds(c.data);
               for (const f of ['mycoach1id_link', 'mycoach2id_link', 'oppocoach1id_link', 'oppocoach2id_link'])
               {
                  if (Number(data[f]) < 0)
                     data[f] = 0;
               }
               check(await firstValueFrom(this.injector.get(MatchheaderService).updateData(c.id, JSON.stringify(data))));
               break;
            }
            case 'roster':
            {
               const srv = this.injector.get(MatchrosterService);
               // si riscrive tutto il roster: ripetere l'operazione (es. dopo un'interruzione a metà) dà lo
               // stesso risultato. "deleteroster" risponde 404 se non c'era nulla da cancellare.
               try
               {
                  check(await firstValueFrom(srv.DeleteAllMatchRoster(c.id)));
               }
               catch (err: any)
               {
                  if (err?.status !== 404)
                     throw err;
               }
               for (const r of (c.data?.rows ?? []))
               {
                  const row: any = this.MapRowIds(r);
                  delete row.playername_lk;
                  if (Number(row.playerid_link) < 0)
                  {
                     // giocatore la cui creazione è stata rifiutata: la riga non può essere salvata
                     console.error('MatchSync: riga di roster con giocatore non creato, ignorata', r);
                     continue;
                  }
                  check(await firstValueFrom(srv.addNewData(JSON.stringify(row))));
               }
               break;
            }
            case 'createplayer':
            {
               const srv = this.injector.get(PlayerService);
               const d = c.data;
               // giocatore già presente sul server con gli stessi dati (id più alto): serve quando una creazione
               // precedente è arrivata al server ma la risposta si è persa, e quando il server non restituisce l'id
               const find = async (): Promise<number> =>
               {
                  const all: any = await firstValueFrom(srv.getAllData(d.teamid_link));
                  check(all);
                  const ids = ((all?.elements ?? []) as any[])
                     .filter(p => (Number(p.id) > 0) && (p.nomedisp === d.nomedisp) && (String(p.numero ?? '') === String(d.numero ?? '')))
                     .map(p => Number(p.id));
                  return (ids.length > 0) ? Math.max(...ids) : 0;
               };
               let realId = tried ? await find() : 0;
               if (!realId)
               {
                  const resp: any = await firstValueFrom(srv.addNewData('', '', d.nomedisp, d.anno, d.ruolo, d.numero, d.altezza, '', d.teamid_link));
                  check(resp);
                  realId = Number(resp?.elements?.id ?? 0) || await find();
               }
               if (!realId)
                  throw fail('il server non ha restituito il nuovo giocatore');
               await this.SaveIdMapping(c.id, realId);
               break;
            }
            case 'createcoach':
            {
               // "addoredit" cerca prima un allenatore con lo stesso nome nella squadra: ripeterlo non duplica
               const resp: any = await firstValueFrom(this.injector.get(CoachService).AddOrEdit(c.data.nome, c.data.teamid_link));
               check(resp);
               const el = Array.isArray(resp?.elements) ? resp.elements[0] : resp?.elements;
               const realId = Number(el?.id ?? 0);
               if (!realId)
                  throw fail('il server non ha restituito il nuovo allenatore');
               await this.SaveIdMapping(c.id, realId);
               break;
            }
            case 'playername':
            {
               const playerId = this.MapId(c.id);
               if (playerId < 0)
                  throw fail('giocatore mai creato sul server');
               // si riscrive l'anagrafica completa riletta adesso (per non perdere cognome, ruolo, altezza,
               // ecc.), cambiando solo il nome visualizzato
               const srv = this.injector.get(PlayerService);
               const cur: any = await firstValueFrom(srv.getSingleData(playerId));
               check(cur);
               const el = cur?.elements;
               if (!el)
                  throw fail(`giocatore ${playerId} non trovato`);
               check(await firstValueFrom(srv.updateData(el.id, el.cognome, el.nome, c.data.nomedisp, el.anno,
                                                         el.ruolo, el.numero, el.altezza, el.foto, el.teamid_link)));
               break;
            }
         }
         return { result: 'ok', message: '' };
      }
      catch (err: any)
      {
         // risposta JSON del server con ok=false (anche con stato HTTP di errore): rifiuto
         if (err?.error && (typeof err.error === 'object') && (err.error.ok === false))
            return { result: 'rejected', message: `${what}: ${err.error.message || 'errore del server'}` };
         return { result: 'network', message: err?.message ?? 'Errore di rete' };
      }
   }


   private async LoadIdMap (): Promise<void>
   {
      try
      {
         const db = await this.OpenDb();
         const recs: any[] = (await this.Tx<any[]>(db, 'readonly', store => store.getAll(), MatchSyncService.IDMAP_STORE)) ?? [];
         recs.forEach(r => this.idMap.set(Number(r.tempId), Number(r.realId)));
      }
      catch (err)
      {
         console.error('MatchSync: lettura corrispondenze id fallita', err);
      }
   }


   private async SaveIdMapping (tempId: number,
                                realId: number): Promise<void>
   {
      this.idMap.set(tempId, realId);
      const db = await this.OpenDb();
      await this.Tx(db, 'readwrite', store => store.put({ tempId, realId }), MatchSyncService.IDMAP_STORE);
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
            const req = indexedDB.open(MatchSyncService.DB_NAME, 3);
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
               if (!db.objectStoreNames.contains(MatchSyncService.IDMAP_STORE))
                  db.createObjectStore(MatchSyncService.IDMAP_STORE, { keyPath: 'tempId' });
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


   private async PutItem (item: TQueueItem): Promise<void>
   {
      const db = await this.OpenDb();
      await this.Tx(db, 'readwrite', store => store.put(item));
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
         const items = await this.GetAll();
         this.pendingCount.set(items.length);
         const writes = new Map<string, any>();
         for (const it of items)
         {
            if (it.command.cmd === 'write')
               writes.set(`${it.command.entity}:${it.command.id}`, it.command.data);
         }
         this.pendingWrites = writes;
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
