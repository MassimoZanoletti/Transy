import {Injectable, signal} from '@angular/core';


// Impostazioni dell'applicazione salvate sul dispositivo (localStorage), come il file di configurazione
// locale del Delphi (BSDECfg). Ogni impostazione è un signal: la UI si aggiorna da sola quando cambia.
interface TConfigData
{
   // Finestra del campo per indicare la posizione dei tiri da 2 e da 3 (Delphi: ShowFieldMyShoot/ShowFieldOppoShoot)
   posizioneTiriMyTeam: boolean;
   posizioneTiriOppoTeam: boolean;
}


@Injectable({
   providedIn: 'root'
})
export class ConfigService
{
   private static readonly STORAGE_KEY = 'transy-config';

   private static readonly DEFAULTS: TConfigData = {
      posizioneTiriMyTeam:   false,
      posizioneTiriOppoTeam: false
   };

   public readonly posizioneTiriMyTeam = signal<boolean>(ConfigService.DEFAULTS.posizioneTiriMyTeam);
   public readonly posizioneTiriOppoTeam = signal<boolean>(ConfigService.DEFAULTS.posizioneTiriOppoTeam);


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


   private Save (): void
   {
      const data: TConfigData = {
         posizioneTiriMyTeam:   this.posizioneTiriMyTeam(),
         posizioneTiriOppoTeam: this.posizioneTiriOppoTeam()
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
