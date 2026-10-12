import {ConvertiGuida, FrazioneDaLatex, LatexInTesto, PartiInLinea, Slug} from "./markdown-guida";


describe('Guida alle statistiche (Markdown)', () =>
{
   it('converte i blocchi usati dal documento', () =>
   {
      const md = [
         '# Titolo',
         '',
         '## Possessi, pace e Four Factors',
         '',
         '### **Dove si trovano**',
         '',
         'Testo con **grassetto** e',
         'una seconda riga.',
         '',
         '- primo **punto**',
         '- secondo',
         '',
         '1. uno',
         '2. due',
         '',
         '| A | B |',
         '| --- | --- |',
         '| x | **y** |',
         '',
         '```latex',
         'TS\\% = \\frac{Punti}{2 \\times (TdC\\ tentati + 0{,}44 \\times Liberi\\ tentati)}',
         '```',
         '',
         '[[schema-quattro-zone]]'
      ].join('\n');
      const b: any[] = ConvertiGuida(md);
      expect(b.map(x => x.tipo)).toEqual(['titolo', 'titolo', 'titolo', 'paragrafo', 'elenco', 'elenco', 'tabella', 'formula', 'schema']);
      expect(b[1].id).toBe('possessi-pace-e-four-factors');
      expect(b[2].testo).toBe('Dove si trovano');                      // asterischi tolti dai titoli
      expect(b[3].parti).toEqual([{ testo: 'Testo con ', grassetto: false }, { testo: 'grassetto', grassetto: true },
                                  { testo: ' e una seconda riga.', grassetto: false }]);
      expect(b[4].ordinato).toBeFalse();
      expect(b[5].ordinato).toBeTrue();
      expect(b[5].voci.length).toBe(2);
      expect(b[6].righe.length).toBe(1);                                 // la riga dei trattini non conta
      expect(b[6].righe[0][1]).toEqual([{ testo: 'y', grassetto: true }]);
      expect(b[7].testo).toBe('TS% = Punti ÷ [2 × (TdC tentati + 0,44 × Liberi tentati)]');
      expect(b[7].frazione).toEqual({ prima: 'TS% =', numeratore: 'Punti', denominatore: '2 × (TdC tentati + 0,44 × Liberi tentati)' });
      expect(b[8].nome).toBe('schema-quattro-zone');
   });

   it('rende leggibili le formule senza frazione', () =>
   {
      expect(LatexInTesto('Possessi = TdC\\ tentati - Rimbalzi\\ offensivi + 0{,}44 \\times Liberi\\ tentati'))
         .toBe('Possessi = TdC tentati − Rimbalzi offensivi + 0,44 × Liberi tentati');
      expect(FrazioneDaLatex('a = b')).toBeNull();
      expect(Slug('Limiti e consigli d\'uso')).toBe('limiti-e-consigli-d-uso');
      expect(PartiInLinea('**solo**')).toEqual([{ testo: 'solo', grassetto: true }]);
   });
});
