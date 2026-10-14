import {TMatchPlayer, TMatchTeam, TRealizzazione, TTipoRealizzazione} from "../models/datamod";
import {TOperation, TOperationType} from "./operation";
import {AnalisiInCampo, PlusMinusQuintetto, PossessiQuintetto} from "./quintetti";
import {CalcolaFourFactors, BoxVuoto} from "./four-factors";
import {MinutiDiGioco, SerieDifferenza} from "./grafico-differenza";
import {MatriceCoppie, OnOff} from "./coppie-onoff";
import {AccumulaTimeout, EsitiTimeout, InvertiEsito, InvertiParziale, Parziali, RiepilogoVuoto} from "./parziali-timeout";
import {CalcolaZone, SommaZone, ZonaDelTiro, ZoneVuote} from "./zone-tiro";
import {TabellaSquadra} from "./statistiche";
import {MediaMobile, ScalaY} from "./andamento-campionato";
import {CalcolaClutch, ClutchVuoto, SommaClutch} from "./clutch";
import {CalcolaUsage, DefAsse} from "./usage";
import {CalcolaRadar} from "./radar";
import {AndamentoGiocatori, Sparkline} from "./andamento-giocatori";
import {ConfrontoVintePerse, EsitoDiff} from "./confronto";


function Giocatore (id: number, my: boolean, quintetto: boolean): TMatchPlayer
{
   const p = new TMatchPlayer();
   p.playerRecID = id;
   p.isMyTeam.set(my);
   p.playNumber.set(String(id));
   p.playName.set(`G${id}`);
   p.inQuintetto.set(quintetto);
   return p;
}


describe('Quintetti, +/- e scarto', () =>
{
   // MyTeam: 1..5 in quintetto, 6 in panchina; avversari 11..15
   const my = [1, 2, 3, 4, 5, 6].map(id => Giocatore(id, true, id <= 5));
   const opp = [11, 12, 13, 14, 15].map(id => Giocatore(id, false, true));
   let counter = 0;
   const op = (q: number, t: number, tipo: TOperationType, myTeam: boolean, p1?: TMatchPlayer, p2?: TMatchPlayer) =>
   {
      const o = new TOperation(q, t, tipo, myTeam, p1, p2);
      o.counter.set(++counter);
      return o;
   };
   const ops = [
      op(1, 550, TOperationType.totT2Yes, true, my[0]),          // 2-0
      op(1, 500, TOperationType.totT3Yes, false, opp[0]),        // 2-3
      op(1, 400, TOperationType.totSostituz, true, my[4], my[5]), // esce 5, entra 6
      op(1, 300, TOperationType.totT2Yes, true, my[5]),          // 4-3
      op(1, 200, TOperationType.totPPersa, true, my[5]),
      op(1, 100, TOperationType.totT2No, false, opp[1]),
      op(2, 590, TOperationType.totTimeout, false),
      op(2, 500, TOperationType.totTLYes, false, opp[1]),        // 4-4
   ];
   const live = { quarto: 2, tempo: 0, quartoGiocato: () => true };

   it('calcola +/- e quintetti', () =>
   {
      const a = AnalisiInCampo(ops, [...my, ...opp], true, live);
      expect(a.plusMinus.get(my[0])).toBe(0);    // in campo sempre: 4-4
      expect(a.plusMinus.get(my[4])).toBe(-1);   // 2-3 mentre era in campo
      expect(a.plusMinus.get(my[5])).toBe(1);    // 2-1 dopo l'ingresso
      expect(a.plusMinus.get(opp[0])).toBe(0);
      expect(a.quintetti.length).toBe(2);
      const [q1, q2] = a.quintetti;              // in ordine di minuti
      expect(q1.chiave).toBe('1-2-3-4-6');
      expect(q1.secondi).toBe(400 + 600);        // 400" nel 1° quarto + tutto il 2°
      expect(PlusMinusQuintetto(q1)).toBe(1);
      expect(q1.noi.pp).toBe(1);
      expect(q1.loro.fga).toBe(1);
      expect(q1.loro.fta).toBe(1);
      expect(q2.chiave).toBe('1-2-3-4-5');
      expect(q2.secondi).toBe(200);
      expect(PlusMinusQuintetto(q2)).toBe(-1);
      expect(PossessiQuintetto(q2)).toBe(1);     // un tiro a testa
   });

   it('calcola On/Off e coppie', () =>
   {
      const q = AnalisiInCampo(ops, [...my, ...opp], true, live).quintetti;
      const onOff = OnOff(q);
      const g = (id: number) => onOff.find(r => r.giocatore.id === id)!;
      expect(onOff.length).toBe(6);
      expect(g(1).on.secondi).toBe(1200);
      expect(g(1).off.secondi).toBe(0);
      expect(PlusMinusQuintetto(g(5).on)).toBe(-1);
      expect(g(5).off.secondi).toBe(1000);
      expect(PlusMinusQuintetto(g(5).off)).toBe(1);
      expect(PlusMinusQuintetto(g(6).on)).toBe(1);
      expect(PlusMinusQuintetto(g(6).off)).toBe(-1);
      const m = MatriceCoppie(q);
      const i = (id: number) => m.giocatori.findIndex(x => x.id === id);
      expect(m.celle[i(5)][i(6)].secondi).toBe(0);
      expect(m.celle[i(1)][i(6)].secondi).toBe(1000);
      expect(PlusMinusQuintetto(m.celle[i(1)][i(6)])).toBe(1);
      expect(m.celle[i(1)][i(2)].secondi).toBe(1200);
      expect(m.celle[i(5)][i(5)].secondi).toBe(200);
   });

   it('costruisce la serie dello scarto', () =>
   {
      const s = SerieDifferenza(ops, [1, 2], live);
      expect(s.durata).toBe(1200);
      expect(s.punti.map(p => p.my - p.opp)).toEqual([0, 2, -1, 1, 0, 0]);
      expect(s.timeout.length).toBe(1);
      expect(s.timeout[0].t).toBe(610);
      expect(s.maxVant?.my).toBe(2);
      expect(s.maxSvant?.opp).toBe(3);
   });

   it('trova i parziali e valuta i timeout', () =>
   {
      const s = SerieDifferenza(ops, [1, 2], live);
      // canestri: noi 2, loro 3, noi 2, loro 1 (TL nel 2° quarto)
      expect(Parziali(s).length).toBe(0);                     // nessuno da 8
      const p = Parziali(s, 2);
      expect(p.map(x => `${x.myTeam ? 'N' : 'L'}${x.punti}`)).toEqual(['N2', 'L3', 'N2']);
      expect(p[1].myPrima).toBe(2);
      expect(p[1].oppPrima).toBe(0);
      expect(InvertiParziale(p[1]).myTeam).toBeTrue();
      const e = EsitiTimeout(s);
      expect(e.length).toBe(1);
      expect(e[0].myTeam).toBeFalse();                          // timeout avversario a inizio Q2
      expect(e[0].my).toBe(4);
      expect(e[0].opp).toBe(3);
      expect(e[0].prima).toEqual({ my: 0, opp: 0, secondi: 10 });   // la finestra prima non esce dal quarto
      // sempre noi-loro, anche se il timeout l'hanno chiamato gli avversari: dopo hanno segnato loro (TL)
      expect(e[0].dopo.my).toBe(0);
      expect(e[0].dopo.opp).toBe(1);
      expect(e[0].primoASegnare).toBe('opp');
      const r = RiepilogoVuoto();
      AccumulaTimeout(r, e, false);
      expect(r.numero).toBe(1);
      expect(r.favorevoli).toBe(0);
      expect(r.sommaDopo).toBe(-1);             // dal nostro punto di vista
      expect(r.primoNostro).toBe(0);
      // visto dall'altra squadra (pagina del campionato) si gira tutto
      const inv = InvertiEsito(e[0]);
      expect(inv.myTeam).toBeTrue();
      expect(inv.my).toBe(3);
      expect(inv.opp).toBe(4);
      expect(inv.dopo).toEqual({ my: 1, opp: 0, secondi: e[0].dopo.secondi });
      expect(inv.primoASegnare).toBe('my');
   });

   it('calcola i Four Factors', () =>
   {
      const noi = { ...BoxVuoto(), punti: 10, t2: { realizzati: 3, tentati: 6 }, t3: { realizzati: 1, tentati: 4 }, tl: { realizzati: 1, tentati: 2 }, ra: 2, rd: 6, pp: 3 };
      const loro = { ...BoxVuoto(), punti: 8, t2: { realizzati: 4, tentati: 10 }, t3: { realizzati: 0, tentati: 0 }, tl: { realizzati: 0, tentati: 0 }, ra: 4, rd: 8, pp: 1 };
      const ff = CalcolaFourFactors(noi, loro);
      expect(ff.fattori[0].noi).toBeCloseTo(45);           // (4 + 0.5) / 10
      expect(ff.fattori[1].noi).toBeCloseTo(100 * 3 / 13.88);
      expect(ff.fattori[2].noi).toBeCloseTo(20);           // 2 / (2 + 8)
      expect(ff.fattori[3].noi).toBeCloseTo(10);
      expect(ff.possessi).toBeCloseTo((11.88 + 7) / 2);
      expect(ff.pace).toBeNull();                         // senza minuti non si calcola
      // stessa partita con un supplementare (45'): pace = possessi riportati a 40'
      const conSuppl = CalcolaFourFactors(noi, loro, 1, MinutiDiGioco([1, 2, 3, 4, 5]));
      expect(MinutiDiGioco([1, 2, 3, 4, 5])).toBe(45);
      expect(MinutiDiGioco([1, 2, 3, 4])).toBe(40);
      expect(conSuppl.pace).toBeCloseTo(((11.88 + 7) / 2) * 40 / 45);
   });
});


describe('Zone di tiro', () =>
{
   it('classifica i tiri nelle zone', () =>
   {
      expect(ZonaDelTiro(287, 70, false)).toBe('sotto');
      expect(ZonaDelTiro(250, 190, false)).toBe('area');
      expect(ZonaDelTiro(100, 120, false)).toBe('mediaSx');
      expect(ZonaDelTiro(287, 280, false)).toBe('mediaCentro');
      expect(ZonaDelTiro(470, 150, false)).toBe('mediaDx');
      expect(ZonaDelTiro(20, 40, true)).toBe('angoloSx');
      expect(ZonaDelTiro(555, 60, true)).toBe('angoloDx');
      expect(ZonaDelTiro(60, 260, true)).toBe('alaSx');
      expect(ZonaDelTiro(287, 380, true)).toBe('frontale');
      expect(ZonaDelTiro(515, 260, true)).toBe('alaDx');
      // il valore registrato vince sulla posizione: un "3" cliccato appena dentro l'arco resta da 3
      expect(ZonaDelTiro(287, 310, true)).toBe('frontale');
   });

   it('somma le zone di più partite', () =>
   {
      const a = ZoneVuote();
      const b = ZoneVuote();
      b.zone[0].segnati = 2; b.zone[0].tentati = 3; b.conPosizione = 3; b.senzaPosizione = 1;
      SommaZone(a, b);
      SommaZone(a, b);
      expect(a.zone[0].segnati).toBe(4);
      expect(a.zone[0].tentati).toBe(6);
      expect(a.conPosizione).toBe(6);
      expect(a.senzaPosizione).toBe(2);
      expect(b.zone[0].tentati).toBe(3);       // b non cambia
   });
});


describe('Andamento partita per partita', () =>
{
   it('calcola la media mobile saltando i valori mancanti', () =>
   {
      expect(MediaMobile([10, 20, 30, 40], 3)).toEqual([10, 15, 20, 30]);
      expect(MediaMobile([null, 4, null, 8], 3)).toEqual([null, 4, 4, 6]);
   });

   it('sceglie una scala tonda, simmetrica per le barre', () =>
   {
      const linee = ScalaY({ titolo: '', barre: false, etichette: [], esiti: [], dettagli: [], serie: [{ nome: '', colore: '', valori: [49, 81] }] });
      expect(linee).toEqual({ min: 40, max: 90, passo: 10 });
      const barre = ScalaY({ titolo: '', barre: true, etichette: [], esiti: [], dettagli: [], serie: [{ nome: '', colore: '', valori: [-15, 22] }] });
      expect(barre.min).toBe(-barre.max);
      expect(barre.max).toBeGreaterThanOrEqual(22);
   });
});


describe('Clutch', () =>
{
   it('calcola il finale punto a punto', () =>
   {
      const my = [1, 2, 3, 4, 5, 6].map(id => Giocatore(id, true, id <= 5));
      const opp = [11, 12, 13, 14, 15].map(id => Giocatore(id, false, true));
      let n = 0;
      const op = (t: number, tipo: TOperationType, myTeam: boolean, p1?: TMatchPlayer, p2?: TMatchPlayer) =>
      {
         const o = new TOperation(4, t, tipo, myTeam, p1, p2);
         o.counter.set(++n);
         return o;
      };
      const ops = [
         op(450, TOperationType.totT2Yes, true, my[0]),           // 2-0, prima degli ultimi 5': resto della partita
         op(280, TOperationType.totT3Yes, false, opp[0]),         // 2-3 in clutch
         op(200, TOperationType.totSostituz, true, my[4], my[5]),
         op(100, TOperationType.totT2Yes, true, my[5]),           // 4-3 in clutch
         op(50,  TOperationType.totTLNo, false, opp[1])
      ];
      const c = CalcolaClutch(ops, [...my, ...opp], true, { quarto: 4, tempo: 0, quartoGiocato: () => true });
      expect(c.secondi).toBe(300);
      expect(c.vinte).toBe(1);
      expect(c.noi.punti).toBe(2);
      expect(c.loro.punti).toBe(3);
      expect(c.loro.tl.tentati).toBe(1);
      expect(c.restoNoi.punti).toBe(2);
      const g = (id: number) => c.giocatori.find(x => x.id === id)!;
      expect(g(1).secondi).toBe(300);
      expect(g(1).pm).toBe(-1);
      expect(g(5).secondi).toBe(100);
      expect(g(5).pm).toBe(-3);
      expect(g(6).secondi).toBe(200);
      expect(g(6).box.punti).toBe(2);
      expect(c.quintetti.map(q => `${q.chiave}:${q.secondi}`)).toEqual(['1-2-3-4-6:200', '1-2-3-4-5:100']);
      // sul campionato si somma
      const tot = ClutchVuoto();
      SommaClutch(tot, c);
      SommaClutch(tot, c);
      expect(tot.partite).toBe(2);
      expect(tot.vinte).toBe(2);
      expect(tot.secondi).toBe(600);
      expect(tot.giocatori.find(x => x.id === 6)!.box.punti).toBe(4);
      expect(c.giocatori.find(x => x.id === 6)!.box.punti).toBe(2);    // la partita non cambia
   });

   it('non c\'è clutch se lo scarto è largo', () =>
   {
      const my = [1, 2, 3, 4, 5].map(id => Giocatore(id, true, true));
      const o = new TOperation(4, 400, TOperationType.totT3Yes, true, my[0]);
      const o2 = new TOperation(4, 350, TOperationType.totT3Yes, true, my[0]);
      const o3 = new TOperation(4, 200, TOperationType.totT2Yes, true, my[0]);   // 6-0 prima: fuori soglia
      const c = CalcolaClutch([o, o2, o3], my, true, { quarto: 4, tempo: 0, quartoGiocato: () => true });
      expect(c.secondi).toBe(0);
      expect(c.partite).toBe(0);
      expect(c.noi.punti).toBe(0);
   });
});


describe('Usage', () =>
{
   it('ripartisce i possessi della squadra fra i giocatori', () =>
   {
      // 5 giocatori sempre in campo: gli usage sommano a 100% (nessuna palla persa della sola squadra)
      const g = (id: number, fga: number, fta: number, pp: number, punti: number) =>
         ({ id, numero: String(id), nome: '', secondi: 2400, punti, fga, fta, pp });
      const base = [g(1, 20, 5, 3, 22), g(2, 10, 0, 2, 8), g(3, 5, 4, 1, 9), g(4, 8, 2, 4, 10), g(5, 2, 0, 0, 2)];
      const squadra = { punti: 51, fga: 45, fta: 11, pp: 10 };
      const u = CalcolaUsage(base, squadra, 300);
      const somma = u.giocatori.reduce((a, x) => a + (x.usage ?? 0), 0);
      expect(somma).toBeCloseTo(100);
      expect(u.giocatori[0].id).toBe(1);                                  // il più alto per primo
      expect(u.giocatori[0].usage).toBeCloseTo(100 * (20 + 0.44 * 5 + 3) / (45 + 0.44 * 11 + 10));
      expect(u.giocatori[0].ts).toBeCloseTo(100 * 22 / (2 * (20 + 0.44 * 5)));
      // sotto la soglia dei minuti l'usage non si mostra
      const meta = CalcolaUsage([...base, { ...g(6, 1, 0, 0, 0), secondi: 120 }], squadra, 300);
      expect(meta.giocatori.find(x => x.id === 6)!.usage).toBeNull();
      expect(meta.giocatori.find(x => x.id === 6)!.pochiMinuti).toBeTrue();
      expect(meta.giocatori.find(x => x.id === 6)!.tiri).toBeNull();
      // volume grezzo: tentativi di tiro (TdC + 0,44 TL), a partita sul campionato
      expect(u.giocatori[0].tiri).toBeCloseTo(20 + 0.44 * 5);
      const camp = CalcolaUsage([{ ...g(1, 20, 5, 3, 22), partite: 4 }], squadra, 300);
      expect(camp.giocatori[0].tiri).toBeCloseTo((20 + 0.44 * 5) / 4);
      // l'asse del grafico: riferimento 20% per l'usage, media dei giocatori per i tiri
      expect(DefAsse(u, 'usage', false).riferimento).toBe(20);
      const medi = u.giocatori.reduce((a, x) => a + x.tiri!, 0) / u.giocatori.length;
      expect(DefAsse(u, 'tiri', false).riferimento).toBeCloseTo(medi);
   });
});


describe('Radar', () =>
{
   it('riporta a 40 minuti e normalizza sul massimo della squadra', () =>
   {
      const g = (id: number, secondi: number, punti: number, pp: number) => ({
         id, nome: '', numero: String(id), partite: 1, secondi, punti, pp,
         tl: { realizzati: 0, tentati: 0 }, t2: { realizzati: 0, tentati: 0 }, t3: { realizzati: 0, tentati: 0 },
         tdc: { realizzati: 0, tentati: 10 }, ff: 0, fs: 0, rd: 0, ra: 0, pr: 0, as: 0, pir: 0, pm: 0 });
      // 20 punti in 20' = 40 ogni 40'; 20 punti in 40' = 20 ogni 40'; chi ha giocato 5' resta fuori
      const r = CalcolaRadar([g(1, 1200, 20, 2), g(2, 2400, 20, 6), g(3, 300, 10, 0)] as any, null, 900);
      expect(r.giocatori.map(x => x.id)).toEqual([2, 1]);            // in ordine di minuti
      const uno = r.giocatori.find(x => x.id === 1)!;
      const due = r.giocatori.find(x => x.id === 2)!;
      expect(uno.valori[0]).toBeCloseTo(40);
      expect(due.valori[0]).toBeCloseTo(20);
      expect(uno.norm[0]).toBeCloseTo(1);
      expect(due.norm[0]).toBeCloseTo(0.5);
      // palle perse rovesciate: 4 ogni 40' contro 6 → 1 - 4/6
      expect(uno.norm[7]).toBeCloseTo(1 - 4 / 6);
      expect(due.norm[7]).toBeCloseTo(0);
      expect(r.media.valori[0]).toBeCloseTo(30);
      expect(uno.valori[2]).toBeNull();                               // usage non disponibile
   });
});


describe('Andamento dei giocatori', () =>
{
   it('mette i valori nella partita giusta e lascia buchi dove il giocatore non c\'era', () =>
   {
      const g: any = { id: 7, numero: '7', nome: 'B', secondi: 1500, serie: [
         { indice: 0, entrato: true,  secondi: 600, punti: 8, pir: 9, pm: 3 },
         { indice: 2, entrato: false, secondi: 0,   punti: 0, pir: 0, pm: 0 },     // a referto ma mai in campo
         { indice: 3, entrato: true,  secondi: 900, punti: 12, pir: 10, pm: -4 }
      ] };
      const [a] = AndamentoGiocatori([g], 4);
      expect(a.partite).toBe(3);
      expect(a.valori.punti).toEqual([8, null, null, 12]);
      expect(a.valori.minuti).toEqual([10, null, 0, 15]);
      expect(a.valori.pm).toEqual([3, null, null, -4]);
   });

   it('disegna il mini-grafico con ampiezza minima', () =>
   {
      // valori costanti fra 9 e 11: con ampiezza minima 10 restano nella fascia centrale
      const s = Sparkline([9, 11, 10], 100, 30, 0, 10);
      const ys = s.punti.map(p => p![1]);
      expect(Math.max(...ys) - Math.min(...ys)).toBeCloseTo(30 * 2 / 10);
      expect(s.iMax).toBe(1);
      expect(s.iMin).toBe(0);
      expect(Sparkline([5, null, 7], 100, 30).punti[1]).toBeNull();
   });
});


describe('Confronto vinte/perse', () =>
{
   it('divide le partite e confronta le medie', () =>
   {
      const tiri = (r: number, t: number) => ({ realizzati: r, tentati: t });
      const riga = (f: number, s: number, pp: number): any => ({
         fase: '', giornata: '', data: '', squadra: '', casaTrasf: 'C', puntiF: f, puntiS: s, dif: f - s,
         tl: tiri(10, 14), t2: tiri(20, 40), t3: tiri(5, 18), ff: 18, fs: 20, rd: 25, ra: 10, rt: 35, pp, pr: 8, as: 12, pir: 60 });
      const box = (p: number) => ({ ...BoxVuoto(), punti: p, t2: tiri(20, 40), t3: tiri(5, 18), tl: tiri(10, 14), rd: 25, ra: 10, pp: 12 });
      const partite = [
         { indice: 0, riga: riga(70, 60, 10), noi: box(70), loro: box(60), minuti: 40, difQuarti: [4, 2, 1, 3] },
         { indice: 1, riga: riga(66, 62, 12), noi: box(66), loro: box(62), minuti: 40, difQuarti: [2, 0, 1, 1] },
         { indice: 2, riga: riga(55, 70, 20), noi: box(55), loro: box(70), minuti: 40, difQuarti: [-6, -3, -4, -2] }
      ];
      const g: any = { id: 4, numero: '4', nome: 'R', serie: [
         { indice: 0, entrato: true, secondi: 1200, punti: 14, pir: 0, pm: 0, fga: 10, fta: 2 },
         { indice: 1, entrato: true, secondi: 1200, punti: 10, pir: 0, pm: 0, fga: 8, fta: 0 },
         { indice: 2, entrato: true, secondi: 600, punti: 4, pir: 0, pm: 0, fga: 9, fta: 0 }
      ] };
      const c = ConfrontoVintePerse(partite, [g]);
      expect(c.partiteA).toBe(2);
      expect(c.partiteB).toBe(1);
      const r = (titolo: string, etichetta: string) => c.sezioni.find(s => s.titolo === titolo)!.righe.find(x => x.etichetta === etichetta)!;
      const pf = r('Risultato', 'Punti fatti a partita');
      expect(pf.a).toBeCloseTo(68);
      expect(pf.b).toBeCloseTo(55);
      expect(EsitoDiff(pf)).toBe(1);                               // +13: netto e a favore
      const pp = r('Altro (a partita)', 'Palle perse');
      expect(pp.a).toBeCloseTo(11);
      expect(EsitoDiff(pp)).toBe(1);                               // meno palle perse nelle vinte: a favore
      const q2 = r('Scarto medio per quarto', '2° quarto');
      expect(q2.a).toBeCloseTo(1);
      const rd = r('Altro (a partita)', 'Rimbalzi difensivi');
      expect(EsitoDiff(rd)).toBe(0);                               // uguali: non evidenziato
      expect(c.giocatori[0].puntiA).toBeCloseTo(12);
      expect(c.giocatori[0].puntiB).toBeCloseTo(4);
      expect(c.giocatori[0].minB).toBeCloseTo(10);
   });
});


describe('Tiri sbagliati di squadra', () =>
{
   const tiro = (tipo: TTipoRealizzazione, fatto: boolean, x = 0, y = 0) =>
   {
      const r = new TRealizzazione();
      r.Add(tipo, 1, 300, fatto, x, y);
      return r;
   };

   it('entrano nei totali e nella nota del tabellino, non nei giocatori', () =>
   {
      const team = new TMatchTeam(false);
      const p = Giocatore(7, false, true);
      p.realizzazioni.set([tiro(TTipoRealizzazione.trT2, true), tiro(TTipoRealizzazione.trT2, true)]);
      team.Roster = [p];
      team.tiriSquadra.set([tiro(TTipoRealizzazione.trT2, false), tiro(TTipoRealizzazione.trT2, false), tiro(TTipoRealizzazione.trTL, false)]);
      team.rimbDifesa.set(3);
      const tab = TabellaSquadra(team, 'Ospiti', false, new Map(), [], '', '');
      expect(tab.righe[0].t2).toEqual({ realizzati: 2, tentati: 2 });
      expect(tab.totali.t2).toEqual({ realizzati: 2, tentati: 4 });
      expect(tab.totali.tdc.tentati).toBe(4);
      expect(tab.totali.tl).toEqual({ realizzati: 0, tentati: 1 });
      expect(tab.totali.efg).toBe('50');
      expect(tab.totali.rd).toBe(3);
      expect(tab.diSquadra).toBe('Nei totali anche azioni attribuite alla squadra e non ai giocatori: tiri sbagliati 2 T2, 1 TL; 3 rimbalzi difensivi.');
      expect(TabellaSquadra(new TMatchTeam(false), '', false, new Map(), [], '', '').diSquadra).toBe('');
   });

   it('entrano nelle zone di tiro', () =>
   {
      const z = CalcolaZone([], [tiro(TTipoRealizzazione.trT2, false, 287, 60), tiro(TTipoRealizzazione.trT3, false)]);
      expect(z.conPosizione).toBe(1);
      expect(z.senzaPosizione).toBe(1);
      expect(z.zone.find(x => x.id === 'sotto')!.tentati).toBe(1);
   });
});
