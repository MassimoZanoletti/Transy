import {IDSMatchHeader, TDSMatchRoster, TMatchPlayer, TMatchTeam} from "../models/datamod";
import {TOperation, TOperationList} from "./operation";
import {matchGlobs, TCurrMatch} from "./curr-match";
import {TabellaSquadra, TRigaStat, TTiriStat} from "./statistiche";


// Statistiche di squadra su più partite (pagina "Statistiche campionato"): per ogni partita la squadra
// scelta viene ricostruita rigiocando gli eventi salvati, come nella pagina della partita, e se ne
// prendono i totali di squadra (TabellaSquadra); in più le righe dei totali e delle medie.


export interface TRigaStatCamp
{
   fase: string;               // abbreviazione della fase
   giornata: string;
   data: string;
   squadra: string;            // avversaria
   casaTrasf: string;          // "C" / "T" per la squadra scelta
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


// Squadre di una partita ricostruite dai suoi eventi, senza toccare la partita aperta nella pagina match
export function RicostruisciPartita (cm: TCurrMatch,
                                     roster: TDSMatchRoster[],
                                     events: any[],
                                     eventToOperation: (ev: any, my: TMatchTeam | null, opp: TMatchTeam | null) => TOperation,
                                     opList: TOperationList): void
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
   const ops = events.map(ev => eventToOperation(ev, myTeam, oppTeam));
   ops.forEach((op, i) => op.counter.set(i + 1));
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
