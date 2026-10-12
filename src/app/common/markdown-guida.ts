// Convertitore minimo da Markdown a blocchi, per la guida alle statistiche (assets/guida-statistiche.md,
// esportata dal documento per i tecnici). Gestisce solo quello che il documento usa: titoli da # a ####,
// paragrafi, **grassetto**, elenchi puntati e numerati, tabelle, blocchi ```latex (resi come formula in
// testo semplice) e il segnaposto [[schema-quattro-zone]] (disegnato dalla pagina). Niente HTML: la pagina
// costruisce gli elementi dal template, quindi il testo non può iniettare nulla.


// Pezzo di testo in linea, normale o in grassetto
export interface TParte
{
   testo: string;
   grassetto: boolean;
}


// Formula con una frazione: "TS% =" prima, poi numeratore sopra la riga e denominatore sotto
export interface TFrazione
{
   prima: string;
   numeratore: string;
   denominatore: string;
}


export type TBloccoGuida =
   | { tipo: 'titolo', livello: number, testo: string, id: string }
   | { tipo: 'paragrafo', parti: TParte[] }
   | { tipo: 'elenco', ordinato: boolean, voci: TParte[][] }
   | { tipo: 'tabella', intestazione: TParte[][], righe: TParte[][][] }
   | { tipo: 'formula', testo: string, frazione: TFrazione | null }
   | { tipo: 'codice', testo: string }
   | { tipo: 'schema', nome: string };


// "**Dove** si trovano" -> [{Dove, grassetto}, { si trovano}]
export function PartiInLinea (testo: string): TParte[]
{
   const parti: TParte[] = [];
   const pezzi = testo.split('**');
   pezzi.forEach((p, i) =>
   {
      if (p !== '')
         parti.push({ testo: p, grassetto: (i % 2) === 1 });
   });
   return parti;
}


// Id per i collegamenti dall'indice: minuscole, lettere e cifre, trattini
export function Slug (testo: string): string
{
   return testo.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
}


// Formula LaTeX del documento -> testo leggibile (\frac diventa "A ÷ [B]"; per disegnarla come frazione
// c'è FrazioneDaLatex)
export function LatexInTesto (latex: string): string
{
   let t = latex.trim()
      .replace(/\{,\}/g, ',')
      .replace(/\\times/g, '×')
      .replace(/\\%/g, '%')
      .replace(/\\ /g, ' ')
      .replace(/ - /g, ' − ');
   const frazione = /\\frac\{([^{}]*)\}\{(.*)\}/.exec(t);
   if (frazione)
      t = t.replace(frazione[0], `${frazione[1]} ÷ [${frazione[2]}]`);
   return t.replace(/\s+/g, ' ');
}


// "TS\% = \frac{Punti}{2 \times (…)}" -> { prima: "TS% =", numeratore: "Punti", denominatore: "2 × (…)" }
export function FrazioneDaLatex (latex: string): TFrazione | null
{
   const f = /^(.*?)\\frac\{([^{}]*)\}\{(.*)\}\s*$/.exec(latex.trim().replace(/\{,\}/g, ','));
   if (!f)
      return null;
   const pulisci = (t: string) => LatexInTesto(t);
   return { prima: pulisci(f[1]), numeratore: pulisci(f[2]), denominatore: pulisci(f[3]) };
}


function Celle (riga: string): string[]
{
   return riga.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
}


export function ConvertiGuida (markdown: string): TBloccoGuida[]
{
   const righe = markdown.replace(/\r\n/g, '\n').split('\n');
   const blocchi: TBloccoGuida[] = [];
   let paragrafo: string[] = [];
   const chiudiParagrafo = () =>
   {
      if (paragrafo.length > 0)
         blocchi.push({ tipo: 'paragrafo', parti: PartiInLinea(paragrafo.join(' ')) });
      paragrafo = [];
   };

   let i = 0;
   while (i < righe.length)
   {
      const riga = righe[i];
      const pulita = riga.trim();

      // blocco di codice: ```latex = formula, altrimenti testo così com'è
      if (pulita.startsWith('```'))
      {
         chiudiParagrafo();
         const lingua = pulita.slice(3).trim();
         const contenuto: string[] = [];
         i++;
         while ((i < righe.length) && !righe[i].trim().startsWith('```'))
            contenuto.push(righe[i++]);
         i++;
         blocchi.push((lingua === 'latex') ? { tipo: 'formula', testo: LatexInTesto(contenuto.join(' ')), frazione: FrazioneDaLatex(contenuto.join(' ')) }
                                           : { tipo: 'codice', testo: contenuto.join('\n') });
         continue;
      }

      const schema = /^\[\[([a-z0-9-]+)\]\]$/.exec(pulita);
      if (schema)
      {
         chiudiParagrafo();
         blocchi.push({ tipo: 'schema', nome: schema[1] });
         i++;
         continue;
      }

      const titolo = /^(#{1,4})\s+(.*)$/.exec(pulita);
      if (titolo)
      {
         chiudiParagrafo();
         const testo = titolo[2].replace(/\*\*/g, '').trim();
         blocchi.push({ tipo: 'titolo', livello: titolo[1].length, testo, id: Slug(testo) });
         i++;
         continue;
      }

      // tabella: righe consecutive che iniziano con "|"; la seconda è la riga dei trattini
      if (pulita.startsWith('|'))
      {
         chiudiParagrafo();
         const tab: string[] = [];
         while ((i < righe.length) && righe[i].trim().startsWith('|'))
            tab.push(righe[i++]);
         const intestazione = Celle(tab[0]).map(PartiInLinea);
         const corpo = tab.slice(1).filter(r => !/^\|?\s*:?-{3,}/.test(r.trim()));
         blocchi.push({ tipo: 'tabella', intestazione, righe: corpo.map(r => Celle(r).map(PartiInLinea)) });
         continue;
      }

      // elenco: righe consecutive "- …" oppure "1. …"
      const puntato = /^[-*]\s+/;
      const numerato = /^\d+\.\s+/;
      if (puntato.test(pulita) || numerato.test(pulita))
      {
         chiudiParagrafo();
         const ordinato = numerato.test(pulita);
         const voci: TParte[][] = [];
         while ((i < righe.length) && (ordinato ? numerato : puntato).test(righe[i].trim()))
         {
            voci.push(PartiInLinea(righe[i].trim().replace(ordinato ? numerato : puntato, '')));
            i++;
         }
         blocchi.push({ tipo: 'elenco', ordinato, voci });
         continue;
      }

      if (pulita === '')
         chiudiParagrafo();
      else
         paragrafo.push(pulita);
      i++;
   }
   chiudiParagrafo();
   return blocchi;
}
