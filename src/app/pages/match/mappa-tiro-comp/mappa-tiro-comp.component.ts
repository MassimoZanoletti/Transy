import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {SelectButtonModule} from 'primeng/selectbutton';
import {ButtonModule} from 'primeng/button';
import type {jsPDF} from 'jspdf';
import {CampoTiriComponent, TTiroPrecedente} from "../../../common/campo-tiri/campo-tiri.component";
import {CalcolaMappaTiri, PercentualeTiri, TMappaTiri} from "../../../common/mappa-tiri";
import {IDSMatchHeader} from "../../../models/datamod";
import {matchGlobs} from "../../../common/curr-match";
import {ConfigService} from "../../../services/config.service";
import {PdfSaveService} from "../../../services/pdf-save.service";
import { UnaAllaVolta } from '../../../common/una-alla-volta';


// Mappa di tiro di un giocatore (un riquadro della griglia sotto la mappa di squadra)
interface TMappaGiocatore extends TMappaTiri
{
   numero: string;
   nome: string;
   tl: { segnati: number, tentati: number };
}


// Tab "Mappa tiro" della partita: in alto la mappa di tiro di tutta la squadra scelta, MyTeam o OppoTeam
// (la stessa del doppio click sui punti della squadra), sotto una griglia di campi a metà dimensione,
// 6 per riga, uno per giocatore con numero, nome e statistiche di tiro. Le mappe (e l'esportazione in PDF)
// compaiono solo se in configurazione è attiva la posizione dei tiri per quella squadra.
// I dati si ricalcolano con Aggiorna() (all'apertura del tab).
@Component({
   selector:    'app-mappa-tiro-comp',
   standalone:  true,
   imports: [
      CommonModule,
      FormsModule,
      SelectButtonModule,
      ButtonModule,
      CampoTiriComponent
   ],
   templateUrl: './mappa-tiro-comp.component.html',
   styleUrl:    './mappa-tiro-comp.component.css'
})
export class MappaTiroCompComponent
{
   // altezza originale dell'immagine del campo per la mappa di squadra; per le mappe dei giocatori al massimo
   // 250px, ma tale che 6 card (bordi, spazi interni e fra le card compresi, circa 200px in tutto) stiano nella
   // larghezza della finestra senza barra di scorrimento orizzontale
   public readonly ALTEZZA_SQUADRA = `${CampoTiriComponent.ALTEZZA_CAMPO}px`;
   public readonly ALTEZZA_GIOCATORE =
      `min(250px, calc((100vw - 200px) / 6 * ${CampoTiriComponent.ALTEZZA_CAMPO} / ${CampoTiriComponent.LARGHEZZA_CAMPO}))`;

   @Input() matchHeader: IDSMatchHeader | null = null;

   // squadra mostrata: MyTeam (true) o OppoTeam (false)
   public isMyTeam: boolean = true;
   public opzioniSquadra: { label: string, value: boolean }[] = [];

   public nomeSquadra: string = '';
   public squadra: TMappaTiri | null = null;
   public giocatori: TMappaGiocatore[] = [];


   constructor (private config: ConfigService,
                private pdfSave: PdfSaveService)
   {
   }


   // la posizione dei tiri si chiede (e quindi la mappa ha senso) solo se attivata in configurazione per la squadra
   MappaAbilitata (): boolean
   {
      return this.config.ChiediPosizioneTiro(this.isMyTeam);
   }


   Aggiorna (): void
   {
      const myNome = this.matchHeader?.myTeamNome_lk || 'MyTeam';
      const oppoNome = this.matchHeader?.oppoTeamNome_lk || 'OppoTeam';
      this.opzioniSquadra = [{ label: myNome, value: true }, { label: oppoNome, value: false }];
      const team = this.isMyTeam ? matchGlobs.currMatch?.myTeam() : matchGlobs.currMatch?.oppTeam();
      const roster = [...(team?.Roster ?? [])]
         .sort((a, b) => (parseInt(a.playNumber(), 10) || 0) - (parseInt(b.playNumber(), 10) || 0));
      this.nomeSquadra = this.isMyTeam ? myNome : oppoNome;
      this.squadra = CalcolaMappaTiri(roster);
      this.giocatori = roster.map(p => ({
         ...CalcolaMappaTiri([p]),
         numero: p.playNumber(),
         nome:   p.playName(),
         tl:     { segnati: p.CalcTLRealizz(), tentati: p.CalcTLTentati() }
      }));
   }


   Percentuale (segnati: number,
                tentati: number): string
   {
      return PercentualeTiri(segnati, tentati);
   }


   private RiepilogoStr (mappa: TMappaTiri): string
   {
      return mappa.riepilogo.map(r => `${r.label} ${r.segnati}/${r.tentati} (${this.Percentuale(r.segnati, r.tentati)})`).join('    ');
   }


   // PDF in orizzontale della squadra mostrata: mappa di squadra sulla prima pagina, mappe dei giocatori
   // (6 per riga) sulla seconda (e seguenti, se i giocatori non ci stanno in una pagina)
   @UnaAllaVolta()
   async EsportaPdf (): Promise<void>
   {
      this.Aggiorna();
      if (!this.MappaAbilitata() || !this.squadra)
         return;
      const destinazione = await this.pdfSave.ChiediDestinazione(`M_${this.matchHeader?.title || 'partita'}-mappa-tiro-${this.isMyTeam ? 'myteam' : 'oppoteam'}.pdf`);
      if (!destinazione)
         return;
      const [{ default: jsPDF }, campo] = await Promise.all([import('jspdf'), this.CaricaImmagineCampo()]);
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pageWidth = 297;
      const pageHeight = 210;
      const margine = 5;
      const font = 'helvetica';
      const proporzione = CampoTiriComponent.ALTEZZA_CAMPO / CampoTiriComponent.LARGHEZZA_CAMPO;
      const mh = this.matchHeader;
      const partita = mh ? (mh.atHome ? `${mh.myTeamNome_lk} - ${mh.oppoTeamNome_lk}` : `${mh.oppoTeamNome_lk} - ${mh.myTeamNome_lk}`) : '';
      const intestazione = [partita, mh?.matchDateStr ?? ''].filter(t => t).join('    ');

      const titoloPagina = (titolo: string) =>
      {
         pdf.setFontSize(16);
         pdf.setFont(font, 'bold');
         pdf.text(titolo, pageWidth / 2, margine + 6, { align: 'center' });
         pdf.setFontSize(9);
         pdf.setFont(font, 'normal');
         pdf.text(intestazione, pageWidth / 2, margine + 11, { align: 'center' });
      };

      // pagina 1: mappa di squadra
      titoloPagina(`Mappa di tiro - ${this.nomeSquadra}`);
      const altezzaSquadra = pageHeight - 2 * margine - 30;
      const larghezzaSquadra = altezzaSquadra / proporzione;
      const ySquadra = margine + 14;
      this.DisegnaCampo(pdf, campo, this.squadra.tiri, (pageWidth - larghezzaSquadra) / 2, ySquadra, larghezzaSquadra);
      const y = ySquadra + altezzaSquadra + 5;
      pdf.setFontSize(11);
      pdf.setFont(font, 'bold');
      pdf.text(this.RiepilogoStr(this.squadra), pageWidth / 2, y, { align: 'center' });
      this.DisegnaLegenda(pdf, this.squadra.tiri, pageWidth / 2, y + 5);
      if (this.squadra.senzaPosizione > 0)
      {
         pdf.setFontSize(8);
         pdf.setFont(font, 'italic');
         pdf.text(`${this.squadra.senzaPosizione} ${this.squadra.senzaPosizione === 1 ? 'tiro' : 'tiri'} senza posizione (non sul campo)`,
                  pageWidth / 2, y + 9, { align: 'center' });
      }

      // pagina 2: mappe dei giocatori, 6 per riga
      const colonne = 6;
      const spazio = 4;
      const larghezzaCella = (pageWidth - 2 * margine - (colonne - 1) * spazio) / colonne;
      // spazio interno fra il bordo della card del giocatore e il suo contenuto
      const pad = 1.5;
      const larghezzaCampo = larghezzaCella - 2 * pad;
      const altezzaCampo = larghezzaCampo * proporzione;
      const altezzaCella = pad + 5 + altezzaCampo + 8 + pad;
      const yInizio = margine + 15;
      const righePerPagina = Math.max(1, Math.floor((pageHeight - margine - yInizio + spazio) / (altezzaCella + spazio)));
      this.giocatori.forEach((g, i) =>
      {
         const posInPagina = i % (colonne * righePerPagina);
         if (posInPagina === 0)
         {
            pdf.addPage();
            titoloPagina(`Mappe di tiro dei giocatori - ${this.nomeSquadra}`);
         }
         const x = margine + (posInPagina % colonne) * (larghezzaCella + spazio);
         const yCella = yInizio + Math.floor(posInPagina / colonne) * (altezzaCella + spazio);
         const centro = x + larghezzaCella / 2;
         // bordo della card del giocatore
         pdf.setDrawColor('#000000');
         pdf.setLineWidth(0.3);
         pdf.roundedRect(x, yCella, larghezzaCella, altezzaCella, 1.5, 1.5);
         pdf.setFontSize(9);
         pdf.setFont(font, 'bold');
         pdf.text(pdf.splitTextToSize(`${g.numero} ${g.nome}`, larghezzaCampo)[0], centro, yCella + pad + 3.5, { align: 'center' });
         this.DisegnaCampo(pdf, campo, g.tiri, x + pad, yCella + pad + 5, larghezzaCampo);
         const yStat = yCella + pad + 5 + altezzaCampo + 3.5;
         pdf.setFontSize(7);
         pdf.setFont(font, 'normal');
         pdf.text(this.RiepilogoStr(g), centro, yStat, { align: 'center' });
         const tl = `TL ${g.tl.segnati}/${g.tl.tentati} (${this.Percentuale(g.tl.segnati, g.tl.tentati)})`;
         const senza = (g.senzaPosizione > 0) ? `    ${g.senzaPosizione} senza posizione` : '';
         pdf.text(tl + senza, centro, yStat + 3.5, { align: 'center' });
      });

      await destinazione.Salva(pdf);
   }


   private CaricaImmagineCampo (): Promise<HTMLImageElement>
   {
      return new Promise((resolve, reject) =>
      {
         const img = new Image();
         img.onload = () => resolve(img);
         img.onerror = reject;
         img.src = 'assets/campo-tiri.png';
      });
   }


   // campo con i tiri come in app-campo-tiri: pallino se segnato, crocetta bordata di nero se sbagliato
   private DisegnaCampo (pdf: jsPDF,
                         campo: HTMLImageElement,
                         tiri: TTiroPrecedente[],
                         x: number,
                         y: number,
                         larghezza: number): void
   {
      // pixel dell'immagine originale -> mm
      const k = larghezza / CampoTiriComponent.LARGHEZZA_CAMPO;
      const altezza = CampoTiriComponent.ALTEZZA_CAMPO * k;
      pdf.addImage(campo, 'PNG', x, y, larghezza, altezza);
      pdf.setDrawColor('#424b57');
      pdf.setLineWidth(0.2);
      pdf.rect(x, y, larghezza, altezza);
      pdf.setLineCap('round');
      for (const tiro of tiri)
      {
         const cx = x + tiro.x * k;
         const cy = y + tiro.y * k;
         const colore = CampoTiriComponent.ColoreQuarto(tiro.quarto);
         if (tiro.segnato)
         {
            pdf.setFillColor(colore);
            pdf.setDrawColor('#000000');
            pdf.setLineWidth(1.5 * k);
            pdf.circle(cx, cy, 7 * k, 'FD');
         }
         else
         {
            for (const [tratto, spessore] of [['#000000', 5.5], [colore, 3]] as [string, number][])
            {
               pdf.setDrawColor(tratto);
               pdf.setLineWidth(spessore * k);
               pdf.line(cx - 6 * k, cy - 6 * k, cx + 6 * k, cy + 6 * k);
               pdf.line(cx - 6 * k, cy + 6 * k, cx + 6 * k, cy - 6 * k);
            }
         }
      }
      pdf.setLineCap('butt');
   }


   // legenda dei quarti presenti fra i tiri, centrata orizzontalmente in "centro"
   private DisegnaLegenda (pdf: jsPDF,
                           tiri: TTiroPrecedente[],
                           centro: number,
                           y: number): void
   {
      const periodi = new Set(tiri.map(t => Math.min(t.quarto, 5)));
      const voci = [1, 2, 3, 4, 5].filter(p => periodi.has(p))
         .map(p => ({ label: (p <= 4) ? `${p}° Q` : 'Suppl.', colore: CampoTiriComponent.ColoreQuarto(p) }));
      const testo = 'pallino: segnato, croce: sbagliato';
      const larghezzaVoce = 16;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      let x = centro - (pdf.getTextWidth(testo) + 6 + voci.length * larghezzaVoce) / 2;
      pdf.text(testo, x, y);
      x += pdf.getTextWidth(testo) + 6;
      for (const voce of voci)
      {
         pdf.setFillColor(voce.colore);
         pdf.setDrawColor('#000000');
         pdf.setLineWidth(0.2);
         pdf.circle(x + 1.5, y - 1.1, 1.5, 'FD');
         pdf.text(voce.label, x + 4, y);
         x += larghezzaVoce;
      }
   }
}
