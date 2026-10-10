import {IDSMatchHeader, TDSMatchRoster, TMatchPlayer, TMatchTeam, TTipoRealizzazione} from "../models/datamod";
import {TOperation, TOperationList, TOperationType} from "./operation";
import {matchGlobs, TCurrMatch} from "./curr-match";
import {MinutiPerQuarto, TabellaSquadra, TContestoLive, TRigaStat, TTiriStat} from "./statistiche";
import {globs} from "./utils";


// Statistiche di squadra su più partite (pagina "Statistiche campionato"): per ogni partita la squadra
// scelta viene ricostruita rigiocando gli eventi salvati, come nella pagina della partita, e se ne
// prendono i totali di squadra (TabellaSquadra); in più le righe dei totali e delle medie.


export interface TRigaStatCamp
{
   fase: string;               // abbreviazione della fase
   giornata: string;
   data: string;
   squadra: string;            // avversaria
   casaTrasf: string;          // "C" / "T" per la squadra scelta; nelle righe dei quarti "Q1".."Q4", "Et1".. (supplementari)
   quarto?: number;            // solo nelle righe di dettaglio di un quarto (sotto la riga della partita)
   puntiF: number;
   puntiS: number;
   dif: number;
   tl: TTiriStat;
   t2: TTiriStat;
   t3: TTiriStat;
   ff: number;
   fs: number;
   rd: number;
   ra: number;
   rt: number;
   pp: number;
   pr: number;
   as: number;
   pir: number;
}


// Statistiche di un giocatore sommate sulle partite selezionate
export interface TGiocatoreStatCamp
{
   id: number;
   nome: string;
   numero: string;             // numero di maglia nell'ultima partita
   partite: number;            // partite in cui era a referto
   secondi: number;
   punti: number;
   tl: TTiriStat;
   t2: TTiriStat;
   t3: TTiriStat;
   tdc: TTiriStat;
   ff: number;
   fs: number;
   rd: number;
   ra: number;
   pp: number;
   pr: number;
   as: number;
   pir: number;
   pm: number;                 // plus/minus
}


// Squadre di una partita ricostruite dai suoi eventi, senza toccare la partita aperta nella pagina match.
// Restituisce le operazioni nell'ordine in cui sono state rigiocate (servono per i minuti dei giocatori).
// Con soloQuarto vengono rigiocate solo le operazioni di quel quarto: statistiche del singolo quarto.
export function RicostruisciPartita (cm: TCurrMatch,
                                     roster: TDSMatchRoster[],
                                     events: any[],
                                     eventToOperation: (ev: any, my: TMatchTeam | null, opp: TMatchTeam | null) => TOperation,
                                     opList: TOperationList,
                                     soloQuarto?: number): TOperation[]
{
   const myTeam = cm.myTeam();
   const oppTeam = cm.oppTeam();
   for (const team of [myTeam, oppTeam])
   {
      if (!team)
         continue;
      team.Roster = roster.filter(r => Boolean(r.isMyTeam) === team.IsMyTeam).map(r =>
      {
         const plr = new TMatchPlayer();
         plr.playerRecID = r.playerId_link;
         plr.isMyTeam.set(r.isMyTeam);
         plr.playName.set(r.playerName_lk);
         plr.captain.set(r.capitano);
         plr.playNumber.set(r.playNumber);
         plr.inQuintetto.set(r.quintetto);
         plr.rosterRecID = r.id;
         return plr;
      });
      team.NotifyRosterChanged();
   }
   // stesso ordine di TOperationList (AddNoSort + Refresh): quarto, tempo decrescente, sequenza di caricamento
   let ops = events.map(ev => eventToOperation(ev, myTeam, oppTeam));
   ops.forEach((op, i) => op.counter.set(i + 1));
   if (soloQuarto !== undefined)
      ops = ops.filter(op => op.quarter() === soloQuarto);
   ops.sort((a, b) => (a.quarter() - b.quarter()) || (b.time() - a.time()) || (a.counter() - b.counter()));
   // ApplyOperation lavora su matchGlobs.currMatch: la partita temporanea ci resta solo per questo ciclo,
   // sincrono, quindi nessun altro codice può vederla
   const prev = matchGlobs.currMatch;
   try
   {
      matchGlobs.currMatch = cm;
      for (const op of ops)
         opList.ApplyOperation(op);
   }
   finally
   {
      matchGlobs.currMatch = prev;
   }
   return ops;
}


// Aggiunge a "giocatori" le statistiche dei giocatori della squadra scelta in una partita ricostruita.
// Minuti come nel tab "Statistiche" della partita (MinutiPerQuarto), con la partita considerata finita:
// l'ultimo quarto si chiude a 0.
export function AccumulaGiocatori (giocatori: Map<number, TGiocatoreStatCamp>,
                                   mh: IDSMatchHeader,
                                   cm: TCurrMatch,
                                   ops: TOperation[],
                                   teamId: number): void
{
   const team = (Number(mh.myTeamId_link) === teamId) ? cm.myTeam() : cm.oppTeam();
   const roster = team?.Roster ?? [];
   const ultimoQuarto = ops.reduce((q, op) => Math.max(q, op.quarter()), 0);
   const live: TContestoLive = { quarto: ultimoQuarto, tempo: 0, quartoGiocato: () => false };
   const minuti = MinutiPerQuarto(ops, roster, live);
   // +/-: basta seguire chi è in campo della squadra scelta, contando i canestri di entrambe le squadre
   const plusMinus = PlusMinus(ops, roster);
   // tiri del giocatore per tipo (come Tiri() in statistiche.ts)
   const somma = (a: TTiriStat, p: TMatchPlayer, tipo: TTipoRealizzazione) =>
   {
      const r = p.realizzazioni().filter(x => x.rTipo === tipo);
      a.realizzati += r.filter(x => x.rPunti > 0).length;
      a.tentati += r.length;
   };
   for (const p of roster)
   {
      let g = giocatori.get(p.playerRecID);
      if (!g)
      {
         g = { id: p.playerRecID, nome: '', numero: '', partite: 0, secondi: 0, punti: 0,
               tl: { realizzati: 0, tentati: 0 }, t2: { realizzati: 0, tentati: 0 },
               t3: { realizzati: 0, tentati: 0 }, tdc: { realizzati: 0, tentati: 0 },
               ff: 0, fs: 0, rd: 0, ra: 0, pp: 0, pr: 0, as: 0, pir: 0, pm: 0 };
         giocatori.set(p.playerRecID, g);
      }
      // nome e numero dall'ultima partita in cui compare (le partite arrivano in ordine di data)
      g.nome = p.playName();
      g.numero = p.playNumber();
      g.partite++;
      g.secondi += (minuti.get(p) ?? []).reduce((a, b) => a + b, 0);
      g.punti += p.CalcolaPunti();
      somma(g.tl, p, TTipoRealizzazione.trTL);
      somma(g.t2, p, TTipoRealizzazione.trT2);
      somma(g.t3, p, TTipoRealizzazione.trT3);
      g.tdc = { realizzati: g.t2.realizzati + g.t3.realizzati, tentati: g.t2.tentati + g.t3.tentati };
      g.ff += p.GetFalliFatti();
      g.fs += p.falliSubiti();
      g.rd += p.rimbDifesa();
      g.ra += p.rimbAttacco();
      g.pp += p.pPerse();
      g.pr += p.pRecuperate();
      g.as += p.assist();
      g.pir += p.CalcPIR();
      g.pm += plusMinus.get(p) ?? 0;
   }
}


// Plus/minus di ciascun giocatore: differenza punti fatti-subiti dalla sua squadra mentre era in campo.
// Chi è in campo segue le stesse regole di MinutiPerQuarto (statistiche.ts) e di ReplayOperations: nel 1°
// quarto parte il quintetto base, negli altri chi ha finito il precedente; un nuovo blocco di "Quintetto"
// sostituisce chi era in campo per quella squadra; le sostituzioni fanno uscire/entrare.
function PlusMinus (ops: TOperation[],
                    giocatori: TMatchPlayer[]): Map<TMatchPlayer, number>
{
   const pm = new Map<TMatchPlayer, number>(giocatori.map(p => [p, 0]));
   let inCampo = new Set<TMatchPlayer>();
   let currQ = 0;
   let quintTeam: boolean | null = null;
   let quintIds = new Set<number>();
   let prevCounter = -1;
   for (const op of ops)
   {
      const q = op.quarter();
      if (q !== currQ)
      {
         if (currQ === 0)
            inCampo = new Set(giocatori.filter(p => p.inQuintetto()));
         currQ = q;
         quintTeam = null;
      }
      const p1 = op.player1();
      const p2 = op.player2();
      if (op.oper() === TOperationType.totQuintetto)
      {
         const id1 = p1?.playerRecID ?? 0;
         const nuovoBlocco = (quintTeam !== op.myTeam()) || (op.counter() !== prevCounter + 1) || quintIds.has(id1);
         if (nuovoBlocco)
         {
            [...inCampo].filter(p => p.isMyTeam() === op.myTeam()).forEach(p => inCampo.delete(p));
            quintIds = new Set<number>();
            quintTeam = op.myTeam();
         }
         if (p1)
         {
            quintIds.add(id1);
            inCampo.add(p1);
         }
      }
      else
      {
         quintTeam = null;
         if (op.oper() === TOperationType.totSostituz)
         {
            if (p1)
               inCampo.delete(p1);
            if (p2)
               inCampo.add(p2);
         }
         const punti = (op.oper() === TOperationType.totTLYes) ? 1 :
                       (op.oper() === TOperationType.totT2Yes) ? 2 :
                       (op.oper() === TOperationType.totT3Yes) ? 3 : 0;
         if (punti > 0)
            for (const p of inCampo)
               if (pm.has(p))
                  pm.set(p, pm.get(p)! + ((p.isMyTeam() === op.myTeam()) ? punti : -punti));
      }
      prevCounter = op.counter();
   }
   return pm;
}


// Totali di squadra della partita ricostruita (tutti i giocatori a referto: i minuti non servono qui)
function TotaliSquadra (team: TMatchTeam | null): TRigaStat
{
   return TabellaSquadra(team, '', false, new Map(), [], '', '').totali;
}


export function RigaPartita (mh: IDSMatchHeader,
                             cm: TCurrMatch,
                             teamId: number): TRigaStatCamp
{
   const isMy = (Number(mh.myTeamId_link) === teamId);
   const nostra = TotaliSquadra(isMy ? cm.myTeam() : cm.oppTeam());
   const loro = TotaliSquadra(isMy ? cm.oppTeam() : cm.myTeam());
   const inCasa = isMy ? mh.atHome : !mh.atHome;
   return {
      fase:      mh.phaseAbbrev_lk,
      giornata:  mh.giornata,
      data:      mh.matchDateStr,
      squadra:   isMy ? mh.oppoTeamNome_lk : mh.myTeamNome_lk,
      casaTrasf: inCasa ? 'C' : 'T',
      puntiF:    nostra.punti,
      puntiS:    loro.punti,
      dif:       nostra.punti - loro.punti,
      tl:        { ...nostra.tl },
      t2:        { ...nostra.t2 },
      t3:        { ...nostra.t3 },
      ff:        nostra.ff,
      fs:        nostra.fs,
      rd:        nostra.rd,
      ra:        nostra.ra,
      rt:        nostra.rtot,
      pp:        nostra.pp,
      pr:        nostra.pr,
      as:        nostra.as,
      pir:       nostra.pir
   };
}


// Quarti in cui c'è almeno un'azione registrata, in ordine
export function QuartiGiocati (ops: TOperation[]): number[]
{
   return [...new Set(ops.map(op => op.quarter()).filter(q => q > 0))].sort((a, b) => a - b);
}


// Riga di dettaglio di un quarto (partita ricostruita con soloQuarto): prime colonne vuote, in C/T il quarto
export function RigaQuarto (mh: IDSMatchHeader,
                            cm: TCurrMatch,
                            teamId: number,
                            quarto: number): TRigaStatCamp
{
   return {
      ...RigaPartita(mh, cm, teamId),
      fase: '', giornata: '', data: '', squadra: '',
      casaTrasf: (quarto <= globs.MaxRegQuarters) ? `Q${quarto}` : `Et${quarto - globs.MaxRegQuarters}`,
      quarto
   };
}


export function TotaliPartite (righe: TRigaStatCamp[]): TRigaStatCamp
{
   const somma = (f: (r: TRigaStatCamp) => number) => righe.reduce((acc, r) => acc + f(r), 0);
   const tiri = (f: (r: TRigaStatCamp) => TTiriStat) => ({ realizzati: somma(r => f(r).realizzati), tentati: somma(r => f(r).tentati) });
   return {
      fase: '', giornata: '', data: '', squadra: 'TOTALI', casaTrasf: '',
      puntiF: somma(r => r.puntiF),
      puntiS: somma(r => r.puntiS),
      dif:    somma(r => r.dif),
      tl:     tiri(r => r.tl),
      t2:     tiri(r => r.t2),
      t3:     tiri(r => r.t3),
      ff:     somma(r => r.ff),
      fs:     somma(r => r.fs),
      rd:     somma(r => r.rd),
      ra:     somma(r => r.ra),
      rt:     somma(r => r.rt),
      pp:     somma(r => r.pp),
      pr:     somma(r => r.pr),
      as:     somma(r => r.as),
      pir:    somma(r => r.pir)
   };
}


// Medie per partita (valori non arrotondati: la formattazione è del template)
export function MediePartite (totali: TRigaStatCamp,
                              numPartite: number): TRigaStatCamp
{
   const n = (numPartite > 0) ? numPartite : 1;
   const tiri = (t: TTiriStat) => ({ realizzati: t.realizzati / n, tentati: t.tentati / n });
   return {
      fase: '', giornata: '', data: '', squadra: 'MEDIA', casaTrasf: '',
      puntiF: totali.puntiF / n,
      puntiS: totali.puntiS / n,
      dif:    totali.dif / n,
      tl:     tiri(totali.tl),
      t2:     tiri(totali.t2),
      t3:     tiri(totali.t3),
      ff:     totali.ff / n,
      fs:     totali.fs / n,
      rd:     totali.rd / n,
      ra:     totali.ra / n,
      rt:     totali.rt / n,
      pp:     totali.pp / n,
      pr:     totali.pr / n,
      as:     totali.as / n,
      pir:    totali.pir / n
   };
}
