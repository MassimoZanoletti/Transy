import {Component, HostListener, OnInit, signal} from '@angular/core';
import {NgFor} from "@angular/common";
import {CardModule} from "primeng/card";
import * as currentPackage from "../../../../package.json";
import {DeviceInfo, LeggiDeviceInfoHigh, TDeviceInfoHigh, TDeviceInfoRiga} from "../../common/device-info";



// Pagina "Info" (menu Strumenti): programma e versione, poi le informazioni sul dispositivo
@Component ({
               selector:    'app-info-page',
               standalone:  true,
               imports: [
                  NgFor,
                  CardModule
               ],
               templateUrl: './info-page.component.html',
               styleUrl:    './info-page.component.css'
            })
export class InfoPageComponent implements OnInit
{
   public readonly programma: Array<TDeviceInfoRiga> = [
      { label: 'Programma',       value: currentPackage.name },
      { label: 'Versione',        value: currentPackage.version },
      { label: 'Data compilazione', value: currentPackage.comp_date },
      { label: 'Copyright',       value: currentPackage.copyrights }
   ];
   // informazioni sul dispositivo, ricalcolate quando cambiano finestra o orientamento
   public readonly deviceInfo = signal<Array<TDeviceInfoRiga>>([]);
   private deviceInfoHigh: TDeviceInfoHigh = {};


   async ngOnInit (): Promise<void>
   {
      this.AggiornaDeviceInfo();
      this.deviceInfoHigh = await LeggiDeviceInfoHigh();
      this.AggiornaDeviceInfo();
   }


   @HostListener('window:resize')
   @HostListener('window:orientationchange')
   AggiornaDeviceInfo (): void
   {
      this.deviceInfo.set(DeviceInfo(this.deviceInfoHigh));
   }
}
