import {Injectable} from '@angular/core';
import type {jsPDF} from 'jspdf';
import {ConfigService} from './config.service';


// Destinazione scelta per un PDF: si chiede PRIMA di generarlo, perché la finestra "Salva con nome" si
// può aprire solo subito dopo il click (la generazione, con import e grafici, dura troppo)
export interface TPdfDestinazione
{
   Salva (pdf: jsPDF): Promise<void>;
}


@Injectable({
   providedIn: 'root'
})
export class PdfSaveService
{
   constructor (private config: ConfigService)
   {
   }


   // Apre la finestra "Salva con nome" sulla cartella delle impostazioni. null = l'utente ha annullato.
   // Senza File System Access API (Firefox, Safari, mobile) il PDF si scarica come download del browser.
   async ChiediDestinazione (nomeFile: string): Promise<TPdfDestinazione | null>
   {
      const nome = nomeFile.replace(/[\\/:*?"<>|]/g, '_');
      const download: TPdfDestinazione = { Salva: async pdf => { pdf.save(nome); } };
      if (!ConfigService.SceltaCartellaSupportata())
         return download;
      const opzioni: any = {
         suggestedName: nome,
         types: [{ description: 'Documento PDF', accept: { 'application/pdf': ['.pdf'] } }]
      };
      const startIn = this.config.CartellaInizialePdf();
      if (startIn)
         opzioni.startIn = startIn;
      let handle: FileSystemFileHandle;
      try
      {
         handle = await (window as any).showSaveFilePicker(opzioni);
      }
      catch (err: any)
      {
         if (err?.name === 'AbortError')
            return null;
         // cartella non più valida: si riprova senza
         if ((startIn) && (err?.name === 'TypeError' || err?.name === 'NotFoundError'))
         {
            delete opzioni.startIn;
            try
            {
               handle = await (window as any).showSaveFilePicker(opzioni);
            }
            catch (err2: any)
            {
               return (err2?.name === 'AbortError') ? null : download;
            }
         }
         else
            return download;
      }
      return {
         Salva: async pdf =>
         {
            const writable = await (handle as any).createWritable();
            await writable.write(pdf.output('blob'));
            await writable.close();
         }
      };
   }
}
