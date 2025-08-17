


export interface User
{
   id: number;
   nome: string;
   password: string;
   ruolo: string;
   ruolo_id: number;
   attributo: number
}


export interface Societa
{
   id: number;
   nome: string;
}


export interface Season
{
   id: number;
   nome: string;
   abbrev: string;
   tenantid_link: number;
}


export interface Champ
{
   id: number;
   nome: string;
   abbrev: string;
   seasonid_link: number;
}


export interface Phase
{
   id: number;
   nome: string;
   abbrev: string;
   champid_link: number;
   exportfolder: string;
}


export interface Team
{
   id: number;
   nome: string;
   abbrev: string;
   champid_link: number;
   logo: string;
}


export namespace TipoEvento
{
   export const EventoVuoto: number = 0;
   export const EventoNormale: number = 1;
   export const EventoMaster: number = 2;
   export const EventoPeriodico: number = 3;
}


export interface EventoDbElement
{
   id: number;
   data: string;
   orainizio: string;
   orafine: string;
   risorsa_id: number;
   gruppo_id: number;
   casa: string;
   ospite: string;
   luogo: string;
   commento: string;
   arbitraggio: number;
   tipoevento: number;
   season_id: number;
   season: string;
   risorsa: string;
   risorsatxt: string;
   risorsabck: string;
   gruppo: string;
   gruppotxt: string
   gruppobck: string;
   master_id: number;
}


export interface EventoDb
{
   ok: boolean;
   message: string;
   elements: EventoDbElement[];
}


export interface EventoElement
{
   id: number;
   data: Date;
   orainizio: Date;
   orafine: Date;
   risorsa_id: number;
   gruppo_id: number;
   casa: string;
   ospite: string;
   luogo: string;
   commento: string;
   arbitraggio: boolean;
   tipoevento: number;
   risorsa: string;
   risorsatxt: string;
   risorsabck: string;
   gruppo: string;
   gruppotxt: string
   gruppobck: string;
   season_id: number;
   season: string;
   master_id: number;
}


export interface LogMessage
{
   id: number;
   datetime: string;
   user_id: number;
   user: string
   description: string;
}






// src/app/models/mess-dlg-data.model.ts
export interface MessDlgData {
   title: string;
   subtitle?: string;
   message: string;
   btncaption?: string; // Caption for the primary (OK/Yes) button
   messtype?: 'info' | 'warning' | 'error';
   showCancelButton?: boolean; // New: true to show a second button (e.g., No/Cancel)
   cancelButtonCaption?: string; // New: Caption for the second button
}

// Aggiungiamo un tipo per il risultato del dialogo per maggiore chiarezza
export type MessDialogResult = boolean | 'primary' | 'secondary' | undefined;
// 'confirm' o true per il bottone principale (OK/Sì)
// 'cancel' o false per il secondo bottone (Annulla/No)
// undefined se chiuso dalla 'X' o ESC
