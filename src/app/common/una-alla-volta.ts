// Protezione dalle richieste doppie (rete lenta in palestra, hotspot del cellulare): un metodo async decorato
// con @UnaAllaVolta() viene ignorato se chiamato di nuovo mentre la chiamata precedente non è ancora finita.
// Da usare SOLO su salvataggi/creazioni/caricamenti/export, mai sui comandi del live (due azioni diverse
// registrate in rapida successione sono legittime). Il doppio tocco veloce sullo stesso bottone è invece
// filtrato per tutta l'app in AppComponent (FiltraDoppioTocco).
export function UnaAllaVolta (): MethodDecorator
{
   return (_target: object, key: string | symbol, descriptor: PropertyDescriptor) =>
   {
      const originale = descriptor.value;
      const inCorso = Symbol (`inCorso_${String(key)}`);
      descriptor.value = async function (this: any, ...args: any[])
      {
         if (this[inCorso])
            return;
         this[inCorso] = true;
         try
         {
            return await originale.apply (this, args);
         }
         finally
         {
            this[inCorso] = false;
         }
      };
      return descriptor;
   };
}
