// Informazioni sul dispositivo su cui gira l'app (tipo, schermo, browser, sistema operativo), mostrate
// nelle impostazioni. Il tipo di dispositivo è una stima: il browser non lo dichiara mai esplicitamente.

export interface TDeviceInfoRiga
{
   label: string;
   value: string;
}


// Valori "ad alta entropia" di navigator.userAgentData (solo Chrome/Edge/Opera): si leggono in modo asincrono
export interface TDeviceInfoHigh
{
   platformVersion?: string;
   architecture?: string;
   bitness?: string;
   model?: string;
   fullVersionList?: Array<{ brand: string, version: string }>;
}


export async function LeggiDeviceInfoHigh (): Promise<TDeviceInfoHigh>
{
   const uaData = (navigator as any).userAgentData;
   if (!uaData?.getHighEntropyValues)
      return {};
   try
   {
      return await uaData.getHighEntropyValues(['platformVersion', 'architecture', 'bitness', 'model', 'fullVersionList']);
   }
   catch
   {
      return {};
   }
}


export function DeviceInfo (high: TDeviceInfoHigh): Array<TDeviceInfoRiga>
{
   const nav = navigator as any;
   const uaData = nav.userAgentData;
   const ua = navigator.userAgent;
   const mq = (query: string): boolean => window.matchMedia(query).matches;
   const sino = (v: boolean): string => v ? 'sì' : 'no';
   const dpr = window.devicePixelRatio || 1;
   const so = SistemaOperativo(uaData, high, ua);
   const browser = Browser(uaData, high, ua);

   return [
      { label: 'Tipo dispositivo (stima)',   value: TipoDispositivo(uaData, ua, so) },
      { label: 'Sistema operativo',          value: so },
      { label: 'Browser',                    value: browser },
      { label: 'Modello',                    value: high.model || '-' },
      { label: 'Architettura',               value: high.architecture ? `${high.architecture} ${high.bitness ?? ''} bit`.trim() : '-' },
      { label: 'Dichiarato mobile (UA)',     value: uaData ? sino(!!uaData.mobile) : 'non disponibile' },
      { label: 'Schermo (pixel CSS)',        value: `${screen.width} × ${screen.height}` },
      { label: 'Scala (devicePixelRatio)',   value: `${dpr} (${Math.round(dpr * 100)}%)` },
      { label: 'Schermo (pixel fisici)',     value: `${Math.round(screen.width * dpr)} × ${Math.round(screen.height * dpr)}` },
      { label: 'Area disponibile',           value: `${screen.availWidth} × ${screen.availHeight}` },
      { label: 'Finestra del browser',       value: `${window.innerWidth} × ${window.innerHeight}` },
      { label: 'Orientamento',               value: screen.orientation?.type ?? '-' },
      { label: 'Profondità colore',          value: `${screen.colorDepth} bit` },
      { label: 'Puntatore principale',       value: mq('(pointer: coarse)') ? 'dito (coarse)' : mq('(pointer: fine)') ? 'mouse/penna (fine)' : 'nessuno' },
      { label: 'Altri puntatori',            value: [mq('(any-pointer: coarse)') ? 'dito' : '', mq('(any-pointer: fine)') ? 'mouse/penna' : ''].filter(s => s).join(', ') || 'nessuno' },
      { label: 'Hover',                      value: sino(mq('(hover: hover)')) },
      { label: 'Punti di tocco',             value: String(navigator.maxTouchPoints ?? 0) },
      { label: 'Aperta come app installata', value: sino(ModalitaVisualizzazione() !== 'browser') },
      { label: 'Modalità di visualizzazione', value: ModalitaVisualizzazione() },
      { label: 'Service worker (PWA) attivo', value: sino(!!navigator.serviceWorker?.controller) },
      { label: 'Tema di sistema',            value: mq('(prefers-color-scheme: dark)') ? 'scuro' : 'chiaro' },
      { label: 'Lingua',                     value: (navigator.languages ?? [navigator.language]).join(', ') },
      { label: 'Fuso orario',                value: Intl.DateTimeFormat().resolvedOptions().timeZone },
      { label: 'Processori logici',          value: navigator.hardwareConcurrency ? String(navigator.hardwareConcurrency) : '-' },
      { label: 'Memoria (approssimata)',     value: nav.deviceMemory ? `${nav.deviceMemory} GB` : '-' },
      { label: 'Connessione',                value: nav.connection?.effectiveType ? `${nav.connection.effectiveType}${nav.connection.downlink ? ` (~${nav.connection.downlink} Mbit/s)` : ''}` : '-' },
      { label: 'Online',                     value: sino(navigator.onLine) },
      { label: 'User agent',                 value: ua }
   ];
}


// Come è aperta l'app: 'browser' = scheda del browser; le altre = finestra dell'app installata (PWA)
function ModalitaVisualizzazione (): string
{
   if ((navigator as any).standalone === true)
      return 'standalone';
   for (const modo of ['window-controls-overlay', 'fullscreen', 'standalone', 'minimal-ui'])
      if (window.matchMedia(`(display-mode: ${modo})`).matches)
         return modo;
   return 'browser';
}


function SistemaOperativo (uaData: any, high: TDeviceInfoHigh, ua: string): string
{
   if (uaData?.platform)
   {
      const piattaforma: string = uaData.platform;
      const versione = high.platformVersion;
      if ((piattaforma === 'Windows') && (versione))
         // platformVersion 13 e oltre = Windows 11 (lo user agent dice sempre "Windows 10")
         return (parseInt(versione, 10) >= 13) ? `Windows 11 (${versione})` : `Windows 10 o precedente (${versione})`;
      return versione ? `${piattaforma} ${versione}` : piattaforma;
   }
   let m: RegExpMatchArray | null;
   if ((m = ua.match(/Android ([\d.]+)/)))
      return `Android ${m[1]}`;
   if ((m = ua.match(/(?:iPhone|CPU) OS ([\d_]+)/)))
      return `iOS ${m[1].replace(/_/g, '.')}`;
   if ((m = ua.match(/Mac OS X ([\d_.]+)/)))
      return (navigator.maxTouchPoints > 1) ? `iPadOS (si presenta come macOS ${m[1].replace(/_/g, '.')})` : `macOS ${m[1].replace(/_/g, '.')}`;
   if (/Windows NT 10/.test(ua))
      return 'Windows 10/11';
   if (/Windows/.test(ua))
      return 'Windows';
   if (/CrOS/.test(ua))
      return 'ChromeOS';
   if (/Linux/.test(ua))
      return 'Linux';
   return 'sconosciuto';
}


function Browser (uaData: any, high: TDeviceInfoHigh, ua: string): string
{
   const marche: Array<{ brand: string, version: string }> = high.fullVersionList ?? uaData?.brands ?? [];
   // si scartano le marche finte ("Not A;Brand") e Chromium se c'è una marca più specifica
   const vere = marche.filter(b => !/not.?a.?brand/i.test(b.brand));
   const scelta = vere.find(b => b.brand !== 'Chromium') ?? vere[0];
   if (scelta)
      return `${scelta.brand} ${scelta.version}`;
   let m: RegExpMatchArray | null;
   if ((m = ua.match(/Edg(?:e|A|iOS)?\/([\d.]+)/)))
      return `Microsoft Edge ${m[1]}`;
   if ((m = ua.match(/(?:OPR|Opera)\/([\d.]+)/)))
      return `Opera ${m[1]}`;
   if ((m = ua.match(/SamsungBrowser\/([\d.]+)/)))
      return `Samsung Internet ${m[1]}`;
   if ((m = ua.match(/(?:Firefox|FxiOS)\/([\d.]+)/)))
      return `Firefox ${m[1]}`;
   if ((m = ua.match(/(?:Chrome|CriOS)\/([\d.]+)/)))
      return `Chrome ${m[1]}`;
   if ((m = ua.match(/Version\/([\d.]+).*Safari/)))
      return `Safari ${m[1]}`;
   return 'sconosciuto';
}


// PC / tablet / smartphone combinando sistema operativo, tipo di puntatore e lato corto dello schermo
function TipoDispositivo (uaData: any, ua: string, so: string): string
{
   const touch = window.matchMedia('(pointer: coarse)').matches || (navigator.maxTouchPoints > 0);
   const latoCorto = Math.min(screen.width, screen.height);
   const sistemaMobile = /Android|iOS|iPadOS/.test(so) || /Mobi|Android|iPhone|iPad/.test(ua);
   if ((uaData?.mobile) || (sistemaMobile))
      return (latoCorto < 600) ? 'smartphone' : 'tablet';
   // puntatore a dito fuori da Windows: tablet/smartphone (Chrome sui tablet Android in modalità "sito desktop"
   // si presenta come Linux)
   if ((window.matchMedia('(pointer: coarse)').matches) && (!/Windows/.test(so)))
      return (latoCorto < 600) ? 'smartphone' : 'tablet';
   if ((touch) && (window.matchMedia('(pointer: coarse)').matches))
      return (latoCorto < 600) ? 'smartphone' : 'tablet';
   return touch ? 'PC (con schermo touch)' : 'PC';
}
