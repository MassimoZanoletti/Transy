import {Injectable, signal} from '@angular/core';


// Impostazioni dell'applicazione salvate sul dispositivo (localStorage), come il file di configurazione
// locale del Delphi (BSDECfg). Ogni impostazione è un signal: la UI si aggiorna da sola quando cambia.
interface TConfigData
{
   // Finestra del campo per indicare la posizione dei tiri da 2 e da 3 (Delphi: ShowFieldMyShoot/ShowFieldOppoShoot)
   posizioneTiriMyTeam: boolean;
   posizioneTiriOppoTeam: boolean;
   // Cartella proposta dalla finestra "Salva con nome" delle esportazioni PDF
   cartellaPdf: TCartellaPdf;
}


// 'browser': nessuna preferenza (decide il browser); 'custom': cartella scelta dall'utente, il cui handle
// non si può mettere nel localStorage e sta in IndexedDB (vedi CaricaHandleCartella)
export type TCartellaPdf = 'browser' | 'downloads' | 'documents' | 'desktop' | 'custom';


@Injectable({
   providedIn: 'root'
})
export class ConfigService
{
   private static readonly STORAGE_KEY = 'transy-config';
   private static readonly DB_NAME = 'transy-config';
   private static readonly HANDLE_STORE = 'handles';
   private static readonly HANDLE_KEY = 'cartellaPdf';

   private static readonly DEFAULTS: TConfigData = {
      posizioneTiriMyTeam:   false,
      posizioneTiriOppoTeam: false,
      cartellaPdf:           'browser'
   };

   public readonly posizioneTiriMyTeam = signal<boolean>(ConfigService.DEFAULTS.posizioneTiriMyTeam);
   public readonly posizioneTiriOppoTeam = signal<boolean>(ConfigService.DEFAULTS.posizioneTiriOppoTeam);
   public readonly cartellaPdf = signal<TCartellaPdf>(ConfigService.DEFAULTS.cartellaPdf);
   // cartella scelta dall'utente (valida solo con cartellaPdf = 'custom')
   public readonly cartellaPdfHandle = signal<FileSystemDirectoryHandle | null>(null);


   constructor ()
   {
      let data: Partial<TConfigData> = {};
      try
      {
         data = JSON.parse(localStorage.getItem(ConfigService.STORAGE_KEY) ?? '{}') ?? {};
      }
      catch
      {
      }
      this.posizioneTiriMyTeam.set(data.posizioneTiriMyTeam ?? ConfigService.DEFAULTS.posizioneTiriMyTeam);
      this.posizioneTiriOppoTeam.set(data.posizioneTiriOppoTeam ?? ConfigService.DEFAULTS.posizioneTiriOppoTeam);
      this.cartellaPdf.set(data.cartellaPdf ?? ConfigService.DEFAULTS.cartellaPdf);
      this.CaricaHandleCartella();
   }


   // Chiedere la posizione dei tiri (da 2 e da 3) per la squadra indicata?
   ChiediPosizioneTiro (isMyTeam: boolean): boolean
   {
      return isMyTeam ? this.posizioneTiriMyTeam() : this.posizioneTiriOppoTeam();
   }


   SetPosizioneTiri (isMyTeam: boolean,
                     value: boolean): void
   {
      (isMyTeam ? this.posizioneTiriMyTeam : this.posizioneTiriOppoTeam).set(value);
      this.Save();
   }


   // Il browser permette di scegliere la cartella di salvataggio (File System Access API: Chrome/Edge desktop)?
   static SceltaCartellaSupportata (): boolean
   {
      return ('showSaveFilePicker' in window) && ('showDirectoryPicker' in window);
   }


   // Cartella da cui parte la finestra "Salva con nome" del PDF (undefined = decide il browser)
   CartellaInizialePdf (): FileSystemDirectoryHandle | string | undefined
   {
      const cartella = this.cartellaPdf();
      if (cartella === 'browser')
         return undefined;
      if (cartella === 'custom')
         return this.cartellaPdfHandle() ?? undefined;
      return cartella;
   }


   SetCartellaPdf (value: TCartellaPdf): void
   {
      this.cartellaPdf.set(value);
      this.Save();
   }


   // Fa scegliere all'utente la cartella delle esportazioni PDF; false se ha annullato
   async ScegliCartellaPdf (): Promise<boolean>
   {
      let handle: FileSystemDirectoryHandle;
      try
      {
         handle = await (window as any).showDirectoryPicker({ id: 'transy-pdf', startIn: this.cartellaPdfHandle() ?? 'documents' });
      }
      catch
      {
         return false;
      }
      this.cartellaPdfHandle.set(handle);
      this.SetCartellaPdf('custom');
      try
      {
         const db = await this.OpenDb();
         await this.Tx(db, 'readwrite', store => store.put(handle, ConfigService.HANDLE_KEY));
      }
      catch (err)
      {
         console.error('Cartella PDF non salvata', err);
      }
      return true;
   }


   private async CaricaHandleCartella (): Promise<void>
   {
      try
      {
         const db = await this.OpenDb();
         this.cartellaPdfHandle.set((await this.Tx<FileSystemDirectoryHandle>(db, 'readonly', store => store.get(ConfigService.HANDLE_KEY))) ?? null);
      }
      catch (err)
      {
         console.error('Cartella PDF non letta', err);
      }
   }


   private OpenDb (): Promise<IDBDatabase>
   {
      return new Promise<IDBDatabase>((resolve, reject) =>
      {
         const req = indexedDB.open(ConfigService.DB_NAME, 1);
         req.onupgradeneeded = () => req.result.createObjectStore(ConfigService.HANDLE_STORE);
         req.onsuccess = () => resolve(req.result);
         req.onerror = () => reject(req.error);
      });
   }


   private Tx<T> (db: IDBDatabase,
                  mode: IDBTransactionMode,
                  body: (store: IDBObjectStore) => IDBRequest<T> | IDBRequest): Promise<T | undefined>
   {
      return new Promise<T | undefined>((resolve, reject) =>
      {
         const tx = db.transaction(ConfigService.HANDLE_STORE, mode);
         const req = body(tx.objectStore(ConfigService.HANDLE_STORE));
         tx.oncomplete = () => { db.close(); resolve(req.result); };
         tx.onerror = () => { db.close(); reject(tx.error); };
         tx.onabort = () => { db.close(); reject(tx.error); };
      });
   }


   private Save (): void
   {
      const data: TConfigData = {
         posizioneTiriMyTeam:   this.posizioneTiriMyTeam(),
         posizioneTiriOppoTeam: this.posizioneTiriOppoTeam(),
         cartellaPdf:           this.cartellaPdf()
      };
      try
      {
         localStorage.setItem(ConfigService.STORAGE_KEY, JSON.stringify(data));
      }
      catch (err)
      {
         console.error('Configurazione non salvata', err);
      }
   }
}
