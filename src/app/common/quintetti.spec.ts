import {TMatchPlayer} from "../models/datamod";
import {TOperation, TOperationType} from "./operation";
import {AnalisiInCampo, PlusMinusQuintetto, PossessiQuintetto} from "./quintetti";
import {CalcolaFourFactors, BoxVuoto} from "./four-factors";
import {SerieDifferenza} from "./grafico-differenza";
import {MatriceCoppie, OnOff} from "./coppie-onoff";
import {AccumulaTimeout, EsitiTimeout, InvertiEsito, InvertiParziale, Parziali, RiepilogoVuoto} from "./parziali-timeout";
import {SommaZone, ZonaDelTiro, ZoneVuote} from "./zone-tiro";
import {MediaMobile, ScalaY} from "./andamento-campionato";


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
