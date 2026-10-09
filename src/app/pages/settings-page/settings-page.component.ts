import {Component} from '@angular/core';
import {InputTextModule} from 'primeng/inputtext';
import {FormsModule} from '@angular/forms';
import {FloatLabelModule} from 'primeng/floatlabel';
import {InputNumberModule} from 'primeng/inputnumber';
import {ColorPickerModule} from 'primeng/colorpicker';
import {CalendarModule} from 'primeng/calendar';
import {DropdownModule} from 'primeng/dropdown';
import {BlockUIModule} from "primeng/blockui";
import {CardModule} from "primeng/card";
import {CheckboxModule} from "primeng/checkbox";
import {DividerModule} from "primeng/divider";
import {NgIf} from "@angular/common";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {TableModule} from "primeng/table";
import {TooltipModule} from "primeng/tooltip";
import {Router} from "@angular/router";
import {loggedUser} from "../../services/users.service";
import {ConfigService, TCartellaPdf} from "../../services/config.service";
import {ButtonModule} from "primeng/button";



@Component ({
               selector:    'app-settings-page',
               standalone:  true,
               imports: [
                  FormsModule,
                  InputTextModule,
                  FloatLabelModule,
                  InputNumberModule,
                  ColorPickerModule,
                  CalendarModule,
                  DropdownModule,
                  BlockUIModule,
                  CardModule,
                  CheckboxModule,
                  DividerModule,
                  NgIf,
                  ProgressSpinnerModule,
                  TableModule,
                  TooltipModule,
                  ButtonModule
               ],
               templateUrl: './settings-page.component.html',
               styleUrl:    './settings-page.component.css'
            })
export class SettingsPageComponent
{
   public readonly sceltaCartellaSupportata: boolean = ConfigService.SceltaCartellaSupportata();
   public readonly opzioniCartellaPdf: Array<{ label: string, value: TCartellaPdf }> = [
      { label: 'Decide il browser',    value: 'browser' },
      { label: 'Download',             value: 'downloads' },
      { label: 'Documenti',            value: 'documents' },
      { label: 'Desktop',              value: 'desktop' },
      { label: 'Cartella scelta...',   value: 'custom' }
   ];


   constructor (public router: Router,
                public config: ConfigService)
   {
   }


   // "Cartella scelta..." apre subito la scelta della cartella; se l'utente annulla resta l'impostazione precedente
   async SetCartellaPdf (value: TCartellaPdf): Promise<void>
   {
      if ((value === 'custom') && (!this.config.cartellaPdfHandle()))
      {
         const precedente = this.config.cartellaPdf();
         this.config.cartellaPdf.set(value);
         if (!(await this.config.ScegliCartellaPdf()))
            this.config.cartellaPdf.set(precedente);
      }
      else
         this.config.SetCartellaPdf(value);
   }


   CfgUtentiEnabled(): boolean
   {
      return (loggedUser.attributo >= 255);
   }


   CfgUtenteEnabled(): boolean
   {
      return ((loggedUser.attributo > 0) && (loggedUser.attributo < 255));
   }


   TabellaUtenti()
   {
      this.router.navigate ([`/userstable`]);
   }


   EditUtente()
   {
      this.router.navigate ([`/useraedit`], {state: {id: loggedUser.id, from: "single"}});
   }
}
