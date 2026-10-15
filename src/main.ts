/*
import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {importProvidersFrom} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app/app.routes';
import {BrowserModule, provideClientHydration} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import { DialogService } from 'primeng/dynamicdialog';


bootstrapApplication (AppComponent, {
   providers: [
      provideRouter (routes),
      importProvidersFrom (BrowserAnimationsModule, HttpClientModule, BrowserModule),
      provideClientHydration (),
      DialogService
   ]
}).catch (err => console.error (err));
*/

import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {APP_INITIALIZER, importProvidersFrom, isDevMode} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideServiceWorker} from '@angular/service-worker';
import {routes} from './app/app.routes';
import {BrowserModule, provideClientHydration} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {provideHttpClient} from '@angular/common/http'; // Importa la funzione
import { DialogService } from 'primeng/dynamicdialog';
import { utils } from './app/common/utils';
import { LogService } from './app/services/log.service';

utils.startingPath = window.location.href;
bootstrapApplication (AppComponent, {
   providers: [
      provideRouter (routes),
      importProvidersFrom (BrowserAnimationsModule, BrowserModule),
      provideClientHydration (),
      provideHttpClient(), // Usa la funzione al posto del modulo
      // Service worker (PWA): app utilizzabile anche senza connessione (solo build di produzione)
      provideServiceWorker ('ngsw-worker.js', {
         enabled: !isDevMode (),
         registrationStrategy: 'registerWhenStable:30000'
      }),
      DialogService,
      // tutti gli errori (console.error, errori non gestiti) anche nel log del server
      { provide: APP_INITIALIZER, multi: true, deps: [LogService], useFactory: (log: LogService) => () => log.IntercettaErrori () }
   ]
}).catch (err => console.error (err));
