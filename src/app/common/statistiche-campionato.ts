import {IDSMatchHeader, TDSMatchRoster, TMatchPlayer, TMatchTeam, TTipoRealizzazione} from "../models/datamod";
import {TOperation, TOperationList} from "./operation";
import {matchGlobs, TCurrMatch} from "./curr-match";
import {MinutiPerQuarto, TabellaSquadra, TContestoLive, TRigaStat, TTiriStat} from "./statistiche";
import {globs} from "./utils";
import {AccumulaQuintetti, AnalisiInCampo, TQuintettoStat} from "./quintetti";


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


// Valori di un giocatore in una partita (per l'andamento stagionale); entrato = false se a referto ma mai in campo
export interface TPartitaGiocatore
{
   indice: number;             // posizione della partita fra quelle selezionate
   entrato: boolean;
   secondi: number;
   punti: number;
   pir: number;
   pm: number;
   fga: number;                // tiri dal campo tentati
   fta: number;                // liberi tentati
}


// Statistiche di un giocatore sommate sulle partite selezionate
export interface TGiocatoreStatCamp
{
   id: number;
   nome: string;
   numero: string;             // numero di maglia nell'ultima partita
   partite: number;            // partite in cui era a referto
   secondi: number;
   secondiPartite: number;     // durata delle partite in cui era a referto
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
   serie: TPartitaGiocatore[]; // una voce per partita in cui era a referto, in ordine
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


// Aggiunge a "giocatori" le statistiche dei giocatori della squadra scelta in una partita ricostruita, e a
// "quintetti" quelle dei suoi quintetti. Minuti come nel tab "Statistiche" della partita (MinutiPerQuarto),
// con la partita considerata finita: l'ultimo quarto si chiude a 0.
export function AccumulaGiocatori (giocatori: Map<number, TGiocatoreStatCamp>,
                                   quintetti: Map<string, TQuintettoStat>,
                                   mh: IDSMatchHeader,
                                   cm: TCurrMatch,
                                   ops: TOperation[],
                                   teamId: number,
                                   indicePartita: number = 0): void
{
   const isMy = (Number(mh.myTeamId_link) === teamId);
   const team = isMy ? cm.myTeam() : cm.oppTeam();
   const roster = team?.Roster ?? [];
   const ultimoQuarto = ops.reduce((q, op) => Math.max(q, op.quarter()), 0);
   const live: TContestoLive = { quarto: ultimoQuarto, tempo: 0, quartoGiocato: () => false };
   const minuti = MinutiPerQuarto(ops, roster, live);
   // +/- e quintetti: basta seguire chi è in campo della squadra scelta, contando i canestri di entrambe le squadre
   const inCampo = AnalisiInCampo(ops, roster, isMy, live);
   const plusMinus = inCampo.plusMinus;
   AccumulaQuintetti(quintetti, inCampo.quintetti);
   // durata della partita, misurata come i minuti in campo (somma dei quintetti)
   const secondiPartita = inCampo.quintetti.reduce((a, q) => a + q.secondi, 0);
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
         g = { id: p.playerRecID, nome: '', numero: '', partite: 0, secondi: 0, secondiPartite: 0, punti: 0,
               tl: { realizzati: 0, tentati: 0 }, t2: { realizzati: 0, tentati: 0 },
               t3: { realizzati: 0, tentati: 0 }, tdc: { realizzati: 0, tentati: 0 },
               ff: 0, fs: 0, rd: 0, ra: 0, pp: 0, pr: 0, as: 0, pir: 0, pm: 0, serie: [] };
         giocatori.set(p.playerRecID, g);
      }
      // nome e numero dall'ultima partita in cui compare (le partite arrivano in ordine di data)
      g.nome = p.playName();
      g.numero = p.playNumber();
      g.partite++;
      const secondi = (minuti.get(p) ?? []).reduce((a, b) => a + b, 0);
      const punti = p.CalcolaPunti();
      const pir = p.CalcPIR();
      const pm = plusMinus.get(p) ?? 0;
      const tiri = p.realizzazioni();
      g.serie.push({ indice: indicePartita, entrato: (secondi > 0) || (punti > 0), secondi, punti, pir, pm,
                     fga: tiri.filter(x => (x.rTipo === TTipoRealizzazione.trT2) || (x.rTipo === TTipoRealizzazione.trT3)).length,
                     fta: tiri.filter(x => x.rTipo === TTipoRealizzazione.trTL).length });
      g.secondi += secondi;
      g.secondiPartite += secondiPartita;
      g.punti += punti;
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
      g.pir += pir;
      g.pm += pm;
   }
}


// Totali di squadra della partita ricostruita (tutti i giocatori a referto: i minuti non servono qui)
function TotaliSquadra (team: TMatchTeam | null): TRigaStat
{
   return TabellaSquadra(team, '', false, new Map(), [], '', '').totali;
}


// Totali di squadra delle due squadre della partita ricostruita, dal punto di vista della squadra scelta
// (per i Four Factors)
export function BoxPartita (mh: IDSMatchHeader,
                            cm: TCurrMatch,
                            teamId: number): { noi: TRigaStat, loro: TRigaStat }
{
   const isMy = (Number(mh.myTeamId_link) === teamId);
   return { noi: TotaliSquadra(isMy ? cm.myTeam() : cm.oppTeam()), loro: TotaliSquadra(isMy ? cm.oppTeam() : cm.myTeam()) };
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
