import {TMatchPlayer, TMatchTeam, TTipoRealizzazione} from "../models/datamod";
import {TOperation, TOperationType} from "./operation";
import {globs} from "./utils";


// Statistiche della partita per il tab "Statistiche" (stessa impostazione della pagina "Tabelle" di nebula):
// intestazione, andamento per quarto e tabella per giocatore di ciascuna squadra.


export interface TTiriStat
{
   realizzati: number;
   tentati: number;
}


// Una cella per quarto: punti e minuti giocati nel quarto (null = il giocatore non era in campo)
export interface TQuartoStat
{
   punti: number;
   min: string;
}


export interface TRigaStat
{
   numero: string;
   nome: string;
   quintetto: boolean;
   capitano: boolean;
   nonEntrato: boolean;              // "n.e.": giocatore di MyTeam mai entrato in campo
   punti: number;
   min: string;
   tl: TTiriStat;
   t2: TTiriStat;
   t3: TTiriStat;
   tdc: TTiriStat;
   ff: number;
   fs: number;
   rd: number;
   ra: number;
   rtot: number;
   pp: number;
   pr: number;
   as: number;
   stf: number;
   sts: number;
   quarti: (TQuartoStat | null)[];   // Q1..Q4 e supplementari (ET) sommati
   pir: number;
   oer: string;
   efg: string;
   ts: string;
}


export interface TTabellaStat
{
   squadra: string;
   righe: TRigaStat[];
   totali: TRigaStat;
   coach1: string;
   coach2: string;
}


export interface TQuartoAndamento
{
   label: string;
   parziale: string;
   progressivo: string;
   maxVantaggio: number;
   maxSvantaggio: number;
   maxSenzaSegnare: string;
   maxSenzaSubire: string;
}


// Situazione del cronometro, per i minuti e l'andamento del quarto in corso
export interface TContestoLive
{
   quarto: number;                        // quarto del cronometro (1..8)
   tempo: number;                         // secondi rimanenti
   quartoGiocato: (quarto: number) => boolean;
}


const NUM_QUARTI = globs.MaxRegQuarters + globs.MaxExtraQuarters;

const DurataQuarto = (q: number) => (q <= globs.MaxRegQuarters) ? globs.DurationRegulTime : globs.DurationExtraTime;

export const TempoStr = (secondi: number) =>
   `${String(Math.floor(Math.max(0, secondi) / 60)).padStart(2, '0')}:${String(Math.max(0, secondi) % 60).padStart(2, '0')}`;


// Secondi giocati da ciascun giocatore in ciascun quarto (indice 0..7), ricavati dalle operazioni con le
// stesse regole di MatchComponent.ReplayOperations: nel 1° quarto parte il quintetto base, negli altri chi
// ha finito il quarto precedente; un nuovo blocco di "Quintetto" sostituisce chi era in campo per quella
// squadra; le sostituzioni chiudono/aprono gli stint. Il quarto in corso arriva fino al cronometro attuale.
export function MinutiPerQuarto (ops: TOperation[],
                                 giocatori: TMatchPlayer[],
                                 live: TContestoLive): Map<TMatchPlayer, number[]>
{
   const minuti = new Map<TMatchPlayer, number[]>(giocatori.map(p => [p, new Array(NUM_QUARTI).fill(0)]));
   const inCampo = new Map<TMatchPlayer, number>();      // giocatore -> tempo di ingresso nel quarto corrente
   const chiudi = (p: TMatchPlayer, q: number, tempo: number) =>
   {
      const ingresso = inCampo.get(p);
      if (ingresso === undefined)
         return;
      const arr = minuti.get(p);
      if (arr && (q >= 1) && (q <= NUM_QUARTI))
         arr[q - 1] += Math.max(0, ingresso - tempo);
      inCampo.delete(p);
   };
   const iniziaQuarto = (q: number, formazione: TMatchPlayer[]) =>
   {
      inCampo.clear();
      formazione.forEach(p => inCampo.set(p, DurataQuarto(q)));
   };

   let currQ = 0;
   let lastTime = 0;
   let quintTeam: boolean | null = null;
   let quintIds = new Set<number>();
   let prevCounter = -1;
   for (const op of ops)
   {
      const q = op.quarter();
      if (q !== currQ)
      {
         let formazione: TMatchPlayer[];
         if (currQ > 0)
         {
            formazione = [...inCampo.keys()];
            formazione.forEach(p => chiudi(p, currQ, lastTime));
         }
         else
            formazione = giocatori.filter(p => p.inQuintetto());
         currQ = q;
         iniziaQuarto(q, formazione);
         quintTeam = null;
      }
      lastTime = op.time();
      const p1 = op.player1();
      const p2 = op.player2();
      if (op.oper() === TOperationType.totQuintetto)
      {
         const id1 = p1?.playerRecID ?? 0;
         const nuovoBlocco = (quintTeam !== op.myTeam()) || (op.counter() !== prevCounter + 1) || quintIds.has(id1);
         if (nuovoBlocco)
         {
            [...inCampo.keys()].filter(p => p.isMyTeam() === op.myTeam()).forEach(p => chiudi(p, q, op.time()));
            quintIds = new Set<number>();
            quintTeam = op.myTeam();
         }
         if (p1)
         {
            quintIds.add(id1);
            inCampo.set(p1, DurataQuarto(q));
         }
      }
      else
      {
         quintTeam = null;
         if (op.oper() === TOperationType.totSostituz)
         {
            if (p1)
               chiudi(p1, q, op.time());
            if (p2)
               inCampo.set(p2, op.time());
         }
      }
      prevCounter = op.counter();
   }
   if (currQ > 0)
   {
      if (live.quarto === currQ)
         [...inCampo.keys()].forEach(p => chiudi(p, currQ, live.tempo));
      else
      {
         const formazione = [...inCampo.keys()];
         formazione.forEach(p => chiudi(p, currQ, lastTime));
         // cronometro già nel quarto successivo (nessuna azione ancora): in campo chi ha finito il precedente
         if ((live.quarto > currQ) && live.quartoGiocato(live.quarto))
         {
            iniziaQuarto(live.quarto, formazione);
            formazione.forEach(p => chiudi(p, live.quarto, live.tempo));
         }
      }
   }
   return minuti;
}


function Tiri (player: TMatchPlayer, tipo: TTipoRealizzazione): TTiriStat
{
   const r = player.realizzazioni().filter(x => x.rTipo === tipo);
   return { realizzati: r.filter(x => x.rPunti > 0).length, tentati: r.length };
}


function SommaTiri (a: TTiriStat, b: TTiriStat): TTiriStat
{
   return { realizzati: a.realizzati + b.realizzati, tentati: a.tentati + b.tentati };
}


// Indici di efficienza (come nebula): OER = punti / (TdC tentati + 0.44 TL tentati + palle perse);
// eFG% = (TdC realizzati + 0.5 T3 realizzati) / TdC tentati; TS% = punti / (2 (TdC tentati + 0.44 TL tentati))
function Indici (riga: TRigaStat): void
{
   const denOer = riga.tdc.tentati + (0.44 * riga.tl.tentati) + riga.pp;
   riga.oer = (denOer !== 0) ? (riga.punti / denOer).toFixed(1) : '';
   riga.efg = (riga.tdc.tentati !== 0) ? String(Math.round(100 * (riga.tdc.realizzati + 0.5 * riga.t3.realizzati) / riga.tdc.tentati)) : '';
   const denTs = 2 * (riga.tdc.tentati + (0.44 * riga.tl.tentati));
   riga.ts = (denTs !== 0) ? String(Math.round(100 * riga.punti / denTs)) : '';
}


function RigaVuota (): TRigaStat
{
   const tiri = () => ({ realizzati: 0, tentati: 0 });
   return {
      numero: '', nome: '', quintetto: false, capitano: false, nonEntrato: false,
      punti: 0, min: '', tl: tiri(), t2: tiri(), t3: tiri(), tdc: tiri(),
      ff: 0, fs: 0, rd: 0, ra: 0, rtot: 0, pp: 0, pr: 0, as: 0, stf: 0, sts: 0,
      quarti: [null, null, null, null, null], pir: 0, oer: '', efg: '', ts: ''
   };
}


function RigaGiocatore (p: TMatchPlayer,
                        secondiQuarti: number[],
                        isMyTeam: boolean): TRigaStat
{
   const riga = RigaVuota();
   riga.numero = p.playNumber();
   riga.nome = p.playName();
   riga.quintetto = p.inQuintetto();
   riga.capitano = p.captain();
   const secondi = secondiQuarti.reduce((a, b) => a + b, 0);
   // come nebula: di MyTeam chi non è mai entrato è "n.e."; degli avversari (minuti spesso non rilevati) si
   // mostrano comunque i dati
   riga.nonEntrato = isMyTeam && (secondi <= 0);
   riga.min = riga.nonEntrato ? 'n.e.' : TempoStr(secondi);
   riga.tl = Tiri(p, TTipoRealizzazione.trTL);
   riga.t2 = Tiri(p, TTipoRealizzazione.trT2);
   riga.t3 = Tiri(p, TTipoRealizzazione.trT3);
   riga.tdc = SommaTiri(riga.t2, riga.t3);
   riga.punti = p.CalcolaPunti();
   riga.ff = p.GetFalliFatti();
   riga.fs = p.falliSubiti();
   riga.rd = p.rimbDifesa();
   riga.ra = p.rimbAttacco();
   riga.rtot = riga.rd + riga.ra;
   riga.pp = p.pPerse();
   riga.pr = p.pRecuperate();
   riga.as = p.assist();
   riga.stf = p.stoppFatte();
   riga.sts = p.stoppSubite();
   riga.pir = p.CalcPIR();
   for (let q = 1; q <= NUM_QUARTI; q++)
   {
      const col = Math.min(q, 5) - 1;
      const sec = secondiQuarti[q - 1];
      const punti = p.realizzazioni().filter(r => r.rQuarto === q).reduce((a, r) => a + r.rPunti, 0);
      if ((sec <= 0) && (punti === 0))
         continue;
      const prec = riga.quarti[col];
      const totSec = sec + (prec ? StrToSec(prec.min) : 0);
      riga.quarti[col] = { punti: (prec?.punti ?? 0) + punti, min: TempoStr(totSec) };
   }
   Indici(riga);
   return riga;
}


function StrToSec (s: string): number
{
   const [m, sec] = s.split(':').map(Number);
   return (m || 0) * 60 + (sec || 0);
}


export function TabellaSquadra (team: TMatchTeam | null,
                                nomeSquadra: string,
                                isMyTeam: boolean,
                                minuti: Map<TMatchPlayer, number[]>,
                                quartiGiocati: number[],
                                coach1: string,
                                coach2: string): TTabellaStat
{
   const giocatori = [...(team?.Roster ?? [])]
      .sort((a, b) => (parseInt(a.playNumber(), 10) || 0) - (parseInt(b.playNumber(), 10) || 0));
   const righe = giocatori.map(p => RigaGiocatore(p, minuti.get(p) ?? new Array(NUM_QUARTI).fill(0), isMyTeam));

   // Totali: somma dei giocatori entrati (per MyTeam), più rimbalzi e palle perse/recuperate attribuiti
   // alla sola squadra; gli indici sono calcolati sui totali di squadra
   const tot = RigaVuota();
   let secondiTot = 0;
   righe.filter(r => !r.nonEntrato).forEach(r =>
   {
      tot.punti += r.punti;
      secondiTot += (r.min && r.min !== 'n.e.') ? StrToSec(r.min) : 0;
      tot.tl = SommaTiri(tot.tl, r.tl);
      tot.t2 = SommaTiri(tot.t2, r.t2);
      tot.t3 = SommaTiri(tot.t3, r.t3);
      tot.ff += r.ff; tot.fs += r.fs; tot.rd += r.rd; tot.ra += r.ra;
      tot.pp += r.pp; tot.pr += r.pr; tot.as += r.as; tot.stf += r.stf; tot.sts += r.sts;
      tot.pir += r.pir;
   });
   tot.tdc = SommaTiri(tot.t2, tot.t3);
   tot.rd += team?.rimbDifesa() ?? 0;
   tot.ra += team?.rimbAttacco() ?? 0;
   tot.rtot = tot.rd + tot.ra;
   tot.pp += team?.pPerse() ?? 0;
   tot.pr += team?.pRecuperate() ?? 0;
   tot.min = TempoStr(secondiTot);
   // punti di squadra per quarto (colonna ET = somma dei supplementari)
   for (const q of quartiGiocati)
   {
      const col = Math.min(q, 5) - 1;
      const punti = team?.GetQuarto(q - 1)?.punti ?? 0;
      tot.quarti[col] = { punti: (tot.quarti[col]?.punti ?? 0) + punti, min: '' };
   }
   Indici(tot);
   return { squadra: nomeSquadra, righe, totali: tot, coach1, coach2 };
}


// Andamento per quarto (come nebula): parziali e progressivi nell'ordine casa-ospiti del titolo; vantaggio,
// svantaggio e tempi senza segnare/subire dal punto di vista di MyTeam
export function AndamentoQuarti (ops: TOperation[],
                                 myTeam: TMatchTeam | null,
                                 oppTeam: TMatchTeam | null,
                                 myTeamInCasa: boolean,
                                 quartiGiocati: number[],
                                 live: TContestoLive): TQuartoAndamento[]
{
   const result: TQuartoAndamento[] = [];
   let myTot = 0;
   let oppTot = 0;
   const casaOspiti = (my: number, opp: number) => myTeamInCasa ? `${my} - ${opp}` : `${opp} - ${my}`;
   for (const q of quartiGiocati)
   {
      const myQ = myTeam?.GetQuarto(q - 1)?.punti ?? 0;
      const oppQ = oppTeam?.GetQuarto(q - 1)?.punti ?? 0;
      let my = myTot;
      let opp = oppTot;
      let maxVant = Math.max(0, my - opp);
      let maxSvant = Math.min(0, my - opp);
      const inizio = DurataQuarto(q);
      const fine = (live.quarto === q) ? live.tempo : 0;
      let ultimoFatto = inizio;
      let ultimoSubito = inizio;
      let maxSenzaSegnare = 0;
      let maxSenzaSubire = 0;
      for (const op of ops.filter(o => o.quarter() === q))
      {
         const punti = (op.oper() === TOperationType.totTLYes) ? 1 :
                       (op.oper() === TOperationType.totT2Yes) ? 2 :
                       (op.oper() === TOperationType.totT3Yes) ? 3 : 0;
         if (punti === 0)
            continue;
         if (op.myTeam())
         {
            my += punti;
            maxSenzaSegnare = Math.max(maxSenzaSegnare, ultimoFatto - op.time());
            ultimoFatto = op.time();
         }
         else
         {
            opp += punti;
            maxSenzaSubire = Math.max(maxSenzaSubire, ultimoSubito - op.time());
            ultimoSubito = op.time();
         }
         maxVant = Math.max(maxVant, my - opp);
         maxSvant = Math.min(maxSvant, my - opp);
      }
      maxSenzaSegnare = Math.max(maxSenzaSegnare, ultimoFatto - fine);
      maxSenzaSubire = Math.max(maxSenzaSubire, ultimoSubito - fine);
      myTot += myQ;
      oppTot += oppQ;
      result.push({
         label:           (q <= globs.MaxRegQuarters) ? `Q${q}` : `ET${q - globs.MaxRegQuarters}`,
         parziale:        casaOspiti(myQ, oppQ),
         progressivo:     casaOspiti(myTot, oppTot),
         maxVantaggio:    maxVant,
         maxSvantaggio:   maxSvant,
         maxSenzaSegnare: TempoStr(maxSenzaSegnare),
         maxSenzaSubire:  TempoStr(maxSenzaSubire)
      });
   }
   return result;
}
