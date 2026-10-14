# Le nuove statistiche di Transy: guida per i tecnici

## Prima di cominciare

Transy adesso non si limita più al tabellino. Il tabellino è la classica tabella con punti, rimbalzi e assist di ogni giocatore: dice **quanto** ha fatto ciascuno, ma non sempre dice **quanto bene** l'ha fatto, né perché la partita è andata in un certo modo.

Per questo Transy calcola anche una serie di statistiche "da coach", le stesse che si usano nei report delle squadre professionistiche. In questa guida le vediamo una alla volta, con calma. Per ognuna trovate tre cose:

1. **Cosa misura**, spiegato a parole semplici.
2. **Come si calcola**, sempre con un esempio fatto passo passo con numeri veri.
3. **Come si legge**: quando un valore è buono, quando è cattivo e dove stanno le trappole.

Non serve essere bravi in matematica: bastano somme, divisioni e un po' di pazienza. Se una parola non vi è chiara, in fondo c'è il glossario.

### **Dove si trovano**

- **Tab "Statistiche" della partita**: prima le due tabelle dei giocatori (come sempre), poi tutta la parte di analisi: scarto, Four Factors, usage, timeout e parziali, clutch, quintetti, On/Off e coppie.
- **Tab "Mappa tiro"**: la mappa a zone, con il selettore Tiri / Zone.
- **Pagina "Statistiche campionato"**: tutte le statistiche sommate sulle partite scelte, più quelle che hanno senso solo su più partite (andamento, vinte/perse, radar, andamento dei giocatori).

### **Due PDF diversi**

- **Solo tabelle**: intestazione, andamento per quarto, tabelle dei giocatori. È quello che si può dare anche ai giornalisti.
- **Completo**: aggiunge tutte le analisi. È riservato allo staff.

### **I colori**

- **Rosso = noi** (il colore sociale), **azzurro = gli avversari**. Gli stessi colori indicano anche "a favore di chi": una barra rossa nel +/- è a nostro favore.
- Nelle tabelle, **verde** vuol dire "valore migliore" o "a favore", **rosso** "peggiore" o "contro".
- I punteggi sono sempre nell'ordine **noi-loro**, con i numeri colorati: il primo rosso, il secondo azzurro.

### **La regola d'oro**

Ogni numero vale quanto i dati da cui nasce. Su una partita sola molte statistiche ballano: due tiri sbagliati cambiano una percentuale di 20 punti. Sul campionato le stesse statistiche diventano solide. Per questo molte cose le trovate in entrambi i posti, ma vanno lette con pesi diversi.

Facciamo un esempio. Un giocatore tira 2 volte e segna 1 volta: è il 50%. Se avesse segnato anche il secondo tiro sarebbe al 100%, se li avesse sbagliati tutti e due allo 0%. Un solo tiro sposta la percentuale di 50 punti! Su 100 tiri, invece, un tiro in più o in meno sposta la percentuale solo di 1 punto. Ecco perché, più numeri ci sono dietro una statistica, più ci si può fidare.

### **Le parole di base**

Prima di partire, mettiamoci d'accordo sulle parole che useremo sempre. Sono quelle del tabellino, ma vale la pena ripassarle una per una.

- **Tiro dal campo (TdC)**: qualsiasi tiro fatto durante il gioco, da 2 o da 3 punti. I tiri liberi **non** sono tiri dal campo. "Tentati" sono tutti i tiri presi, "segnati" (o "realizzati") quelli entrati.
- **Percentuale**: segnati diviso tentati, per 100. Esempio: 5 segnati su 12 tentati = 5 ÷ 12 = 0,417, cioè 41,7%.
- **Tiro libero (TL)**: il tiro dalla lunetta dopo un fallo, vale 1 punto. Di solito se ne tirano 2, a volte 1 (dopo un canestro con fallo, il famoso "2+1") o 3 (fallo su un tiro da 3).
- **Rimbalzo offensivo (RO)**: la palla dopo un tiro sbagliato la riprende **la squadra che ha tirato**. L'azione continua: è una "seconda possibilità".
- **Rimbalzo difensivo (RD)**: la palla dopo un tiro sbagliato la prende **la squadra che difendeva**. L'azione degli altri è finita.
- **Palla persa (PP)**: la squadra perde la palla senza tirare. Un passaggio intercettato, un'infrazione di passi, un fallo in attacco, una palla finita fuori.
- **Recupero**: il contrario della palla persa, visto da chi difende. Quando rubate palla voi, voi avete un recupero e loro una palla persa.
- **Assist**: il passaggio che porta direttamente a un canestro di un compagno.
- **Stoppata**: il tiro dell'avversario respinto con la mano.
- **Falli subiti**: i falli che gli avversari commettono su di voi. Spesso portano ai liberi.

## Possessi, pace e Four Factors

### **Il possesso: il mattoncino di tutto**

Tutto questo capitolo parte da una parola sola: il **possesso**. Un possesso comincia quando una squadra prende la palla e finisce quando la palla passa all'altra squadra. Finisce in uno di questi modi:

- la squadra **segna** (poi la palla va agli avversari per la rimessa);
- la squadra **sbaglia il tiro e gli avversari prendono il rimbalzo** difensivo;
- la squadra **perde la palla**;
- la squadra va in lunetta e **tira i liberi** (dopo l'ultimo libero la palla, di norma, passa all'altra squadra).

Attenzione: se la squadra sbaglia e **riprende lei** il rimbalzo (rimbalzo offensivo), il possesso **non finisce**. Continua lo stesso possesso, con una seconda possibilità.

Una cosa importante da capire: in una partita le due squadre hanno **quasi lo stesso numero di possessi**. È come giocare a turno: una volta attacco io, una volta attacchi tu. Al massimo uno o due di differenza (per esempio chi inizia un quarto con la palla).

**Perché i possessi sono così utili?** Immaginate due partite. Nella prima segnate 80 punti, nella seconda 65. Siete andati meglio nella prima? Non per forza! Se nella prima partita avete avuto 90 possessi e nella seconda solo 60, nella seconda avete segnato di più ogni volta che avevate la palla. Contare i punti **per possesso** invece dei punti totali permette di confrontare partite giocate a ritmi diversi, come si confrontano le mele con le mele.

### **Possessi stimati**

I possessi non li registriamo uno per uno: li **stimiamo** (cioè li calcoliamo in modo approssimato) con la formula classica, partendo dai numeri del tabellino.

```latex
Possessi = TdC\ tentati - Rimbalzi\ offensivi + Palle\ perse + 0{,}44 \times Liberi\ tentati
```

Vediamo i pezzi uno alla volta:

1. **TdC tentati**: ogni tiro dal campo, di solito, chiude un possesso. Quindi li contiamo tutti.
2. **Meno i rimbalzi offensivi**: se dopo un tiro sbagliato riprendete voi la palla, quel possesso non era finito. Quindi ne togliamo uno per ogni rimbalzo offensivo.
3. **Più le palle perse**: ogni palla persa chiude un possesso senza un tiro, quindi la aggiungiamo.
4. **Più 0,44 × i liberi tentati**: non tutti i liberi chiudono un possesso. Una coppia di liberi sì, ma il libero del "2+1" o quello di un tecnico no. Gli statistici hanno visto che, in media, ogni libero tentato vale circa 0,44 possessi. È un numero "trovato contando" moltissime partite.

Esempio passo passo. Una squadra in una partita ha: 60 tiri dal campo tentati, 10 rimbalzi offensivi, 14 palle perse, 20 liberi tentati.

- 60 − 10 = 50
- 50 + 14 = 64
- 0,44 × 20 = 8,8
- 64 + 8,8 = 72,8, cioè circa **73 possessi**.

Transy fa questo conto per tutte e due le squadre e poi fa la **media** fra le due: visto che giocano quasi lo stesso numero di possessi, la media è la stima più affidabile.

### **Pace (ritmo)**

Il pace dice **quanto veloce si è giocato**. È il numero di possessi riportato a una partita di 40 minuti. Una squadra che corre in contropiede e tira presto fa tanti possessi (pace alto); una che ragiona e usa tutti i secondi dell'azione ne fa pochi (pace basso).

Perché "riportato a 40 minuti"? Perché con i supplementari si gioca di più e quindi si fanno più possessi, anche se il ritmo è lo stesso. Senza supplementari pace e possessi coincidono. Con un supplementare (45 minuti in tutto) 80 possessi diventano un pace di 80 × 40 ÷ 45 = circa 71.

Esempio: 72 punti con pace 65 vuol dire circa 111 punti ogni 100 possessi, un attacco ottimo. Gli stessi 72 punti con pace 85 sono circa 85 ogni 100 possessi: pochi. Stessi punti, partite diversissime.

Il pace dice anche **chi ha imposto il ritmo**: se volete correre e la partita esce a 64, l'avversario vi ha portato sul suo terreno.

### **Punti ogni 100 possessi e Net rating**

Ora che sappiamo contare i possessi, possiamo misurare quanto rende ogni possesso. Si usa la scala "ogni 100 possessi" perché è comoda da leggere: è come dire "se avessimo avuto la palla 100 volte, quanti punti avremmo fatto?".

- **Punti fatti ogni 100 possessi** (offensive rating): l'efficienza del vostro attacco. Più alto è meglio.
- **Punti subiti ogni 100 possessi** (defensive rating): l'efficienza della vostra difesa. Qui più **basso** è meglio, perché vuol dire che gli avversari segnano poco.
- **Net rating** = fatti − subiti. Positivo vuol dire che, a parità di possessi, siete migliori degli avversari. Negativo, che siete peggiori.

Esempio passo passo. In una partita ci sono 70 possessi. Voi segnate 77 punti, loro 70.

- Punti fatti ogni 100 possessi: 77 ÷ 70 × 100 = **110**
- Punti subiti ogni 100 possessi: 70 ÷ 70 × 100 = **100**
- Net rating: 110 − 100 = **+10**

Come leggerlo: un Net di +10 è un dominio. Fra −3 e +3 la partita è stata in sostanza alla pari.

Una vittoria di 2 punti con Net +3 e una sconfitta di 2 con Net −3 raccontano due partite quasi uguali, decise da pochi possessi. Non lasciatevi ingannare dal risultato: il Net rating è più "onesto" del punteggio finale.

### **I Four Factors**

Partiamo da una domanda semplice: **che cosa deve fare una squadra, in ogni possesso, per segnare più degli avversari?** Le risposte sono solo quattro:

1. **Tirare bene** quando tira.
2. **Non perdere la palla** prima di tirare.
3. **Riprendersi la palla** quando sbaglia (rimbalzo offensivo), per avere un altro tentativo.
4. **Andare in lunetta** e segnare i liberi, che sono punti "facili".

Tutto il resto (assist, recuperi, stoppate…) alla fine passa da una di queste quattro porte. Dean Oliver, uno dei primi statistici del basket, le ha chiamate **Four Factors**, cioè "i quattro fattori", e ha misurato quanto conta ciascuno per vincere. Il "peso" nella tabella dice proprio questo: su 100 "motivi" per cui si vince una partita, circa 40 dipendono dal tiro, 25 dalle palle perse, 20 dai rimbalzi offensivi e 15 dai liberi.

Dean Oliver ha mostrato che si vince soprattutto grazie a quattro fattori, in quest'ordine d'importanza. Transy li calcola per entrambe le squadre e mette in verde chi è messo meglio.

| Fattore | Peso | Cosa misura | Come si calcola | Meglio se |
| --- | --- | --- | --- | --- |
| Tiro (eFG%) | 40% | Quanto rendono i tiri dal campo | (canestri + 0,5 × canestri da 3) / tiri dal campo tentati | Alto |
| Palle perse (TOV%) | 25% | Quanti possessi buttate via | palle perse ogni 100 azioni concluse (tiri, liberi pesati, palle perse) | Basso |
| Rimbalzi offensivi (ORB%) | 20% | Quante seconde chance vi prendete | rimbalzi offensivi / (vostri RO + loro RD) | Alto |
| Tiri liberi (TL/TdC) | 15% | Quanto andate in lunetta e segnate | liberi segnati ogni 100 tiri dal campo | Alto |

Ogni fattore esiste **due volte**: quello vostro (come attaccate) e quello degli avversari (cioè come difendete voi). Per esempio, l'eFG% degli avversari dice quanto bene li avete lasciati tirare. Ora li vediamo uno per uno.

#### **1. Tiro: eFG% (percentuale effettiva)**

La normale percentuale dal campo ha un difetto: conta allo stesso modo un canestro da 2 e uno da 3. Ma un canestro da 3 vale una volta e mezza uno da 2! L'**eFG%** corregge questo difetto: ogni tripla segnata conta come "un canestro e mezzo".

Esempio passo passo. Un giocatore fa 4 su 10 da 2 e 2 su 6 da 3.

- Canestri segnati in tutto: 4 + 2 = 6. Tiri tentati: 10 + 6 = 16.
- Percentuale "normale": 6 ÷ 16 = 37,5%.
- Per l'eFG% aggiungiamo mezzo canestro per ogni tripla: 6 + 0,5 × 2 = 7.
- eFG%: 7 ÷ 16 = **43,8%**.

Un altro esempio per capire perché serve. Giocatore A: 4 su 10 da 2, fa 8 punti, 40%. Giocatore B: 3 su 10 da 3, fa 9 punti, 30%. Con la percentuale normale sembra meglio A, ma B ha fatto più punti con gli stessi tiri! L'eFG% lo dice subito: A 40%, B 45%.

Come leggerlo: più alto è meglio. Un eFG% del 50% vuol dire che ogni tiro dal campo vale in media 1 punto.

#### **2. Palle perse: TOV%**

Ogni palla persa è un possesso buttato via: zero punti, senza nemmeno provare a tirare. Il **TOV%** conta quante palle perdete ogni 100 azioni concluse, cioè ogni 100 volte che l'attacco finisce con un tiro, dei liberi o una palla persa.

Perché non guardare semplicemente il numero di palle perse? Perché in una partita veloce ci sono più possessi, e quindi più occasioni per perdere palla. 15 palle perse in 60 possessi sono tante; 15 in 85 sono meno gravi.

```latex
TOV\% = \frac{Palle\ perse}{TdC\ tentati + 0{,}44 \times Liberi\ tentati + Palle\ perse}
```

Sotto la riga c'è quasi la formula dei possessi, ma **senza togliere i rimbalzi offensivi**. Il motivo: dopo un rimbalzo offensivo l'azione riparte e si può perdere palla di nuovo, quindi conta ogni volta che l'attacco arriva in fondo.

Esempio passo passo, con i numeri visti per i possessi: 60 tiri dal campo tentati, 20 liberi tentati, 14 palle perse.

- Liberi "pesati": 0,44 × 20 = 8,8.
- Azioni concluse: 60 + 8,8 + 14 = 82,8.
- TOV%: 14 ÷ 82,8 = **16,9%**. Vuol dire che circa un'azione su sei finisce con una palla persa.

Come leggerlo: qui più **basso** è meglio. Il TOV% degli avversari, invece, misura quanto la vostra difesa li mette in difficoltà: più è alto, meglio avete difeso.

#### **3. Rimbalzi offensivi: ORB%**

Quando sbagliate un tiro, la palla è "contesa": può prenderla uno dei vostri (rimbalzo offensivo) o uno degli avversari (rimbalzo difensivo). L'**ORB%** dice quanti di questi palloni contesi riuscite a prendere voi.

Esempio passo passo. Voi prendete 12 rimbalzi offensivi, gli avversari prendono 28 rimbalzi difensivi.

- Palloni contesi dopo i vostri errori: 12 + 28 = 40.
- Quelli presi da voi: 12.
- ORB%: 12 ÷ 40 = **30%**.

Come leggerlo: più alto è meglio. Il 30% vuol dire che quasi un vostro errore su tre si trasforma in una seconda possibilità. Perché non contare solo i rimbalzi offensivi? Perché se tirate male avete tanti errori e quindi tanti rimbalzi da prendere: il numero da solo inganna, la percentuale no.

#### **4. Tiri liberi: TL/TdC**

I liberi sono punti senza difesa. Questo fattore misura due cose insieme: **quante volte vi guadagnate la lunetta** (attaccando il canestro e subendo falli) e **quanti liberi segnate**.

Esempio passo passo: segnate 15 liberi e tentate 60 tiri dal campo. 15 ÷ 60 × 100 = **25**. Vuol dire 25 liberi segnati ogni 100 tiri dal campo.

Come leggerlo: più alto è meglio. Una squadra che tira solo da fuori avrà un valore basso; una che attacca il ferro e prende falli, un valore alto.

#### **Come usarli**

Dopo una partita mettete una accanto all'altra le due righe, la vostra e quella degli avversari, e guardate fattore per fattore chi ha vinto il "duello". Transy mette già in verde chi è messo meglio.

Esempio: avete perso. L'eFG% è quasi uguale, ORB% e liberi pure, ma il vostro TOV% è 22 e il loro 12. Allora il problema non è stato il tiro: è stata la gestione della palla. In allenamento si lavorerà su quello, non sul tiro.

Ricordate i pesi: perdere il duello del tiro (40%) di solito fa più male che perdere quello dei liberi (15%).

**Dove**: riquadro Four Factors nel tab partita (con pace, possessi e rating) e nel campionato, dove c'è anche la tabella partita per partita.

## Scarto, parziali ed efficacia dei timeout

### **Il grafico dello scarto**

Lo **scarto** è la differenza di punti fra noi e loro in un certo momento. Se siamo 30-24, lo scarto è +6 (siamo avanti di 6); se siamo 30-35, lo scarto è −5 (siamo sotto di 5).

Il grafico dello scarto è la "storia" della partita in un colpo d'occhio. In orizzontale c'è il tempo, dal primo all'ultimo minuto. In verticale lo scarto. La linea a gradini sale ogni volta che segniamo noi e scende ogni volta che segnano loro.

- Quando la linea sta **sopra lo zero** siamo avanti: l'area è colorata di **rosso** (il nostro colore).
- Quando sta **sotto lo zero** siamo indietro: l'area è **azzurra** (il colore degli avversari).
- Le linee verticali sono le **divisioni dei quarti**.
- I **triangolini** sono i timeout: in alto i nostri, in basso i loro.
- Due etichette segnano il **vantaggio massimo** e lo **svantaggio massimo** della partita.

Passando col mouse o col dito sul grafico si legge il punteggio in quel momento.

Come leggerlo: una linea che sale piano piano racconta una squadra che costruisce il vantaggio con pazienza. Una linea che scende di colpo, come una scala presa di corsa, racconta un momento di blackout. Una linea che balla sempre intorno allo zero racconta una partita equilibrata dall'inizio alla fine.

### **I parziali**

Un **parziale** è una serie di punti segnati da una squadra **senza risposta** dell'altra, cioè mentre l'altra non segna nemmeno un punto.

Esempio. Sul 40-40 segniamo noi una tripla (43-40), poi due canestri da 2 (47-40), poi un libero (48-40). Gli avversari, nel frattempo, non segnano niente. Questo è un parziale di **8-0** per noi. Appena gli avversari segnano anche un solo punto, il parziale si chiude.

Transy segnala tutti i parziali da almeno **8-0**, anche quelli a cavallo fra due quarti (per esempio iniziati alla fine del 2° e finiti all'inizio del 3°). Per ognuno vedete:

- chi l'ha fatto;
- quando è iniziato e quando è finito;
- il punteggio prima e dopo.

Sul grafico dello scarto compaiono come fasce chiare con l'etichetta, per esempio "10-0".

Come usarli: sono la prima cosa da guardare per capire dove si è decisa una partita. Spesso una partita che sembra persa "di poco" in realtà si è decisa con un solo 12-0 a cavallo dell'intervallo. Chiedetevi: chi era in campo in quel momento? Avevamo chiamato timeout?

### **L'efficacia dei timeout**

Il timeout serve a fermare il gioco quando le cose vanno male (o a preparare un'azione importante). Ma funziona davvero? Transy prova a misurarlo.

Per ogni timeout guarda i **3 minuti di gioco prima** e i **3 minuti di gioco dopo**, senza uscire dal quarto, e conta i punti delle due squadre in quei due pezzi di partita.

- **Prima** dice quale parziale il timeout ha interrotto. Esempio: prima del timeout, 2-9 per loro. Il timeout è stato chiamato per fermare la loro corsa.
- **Dopo** dice se il timeout ha cambiato l'inerzia, cioè se la partita ha cambiato direzione. Esempio: dopo il timeout, 7-3 per noi. La corsa si è fermata e l'abbiamo invertita.
- **Primo a segnare** dice chi ha messo il primo canestro dopo la ripresa del gioco. È spesso il segno che lo schema disegnato durante il timeout ha funzionato.

Tutto è sempre dal **nostro punto di vista**, anche per i timeout chiamati dagli avversari: punteggi in ordine noi-loro, differenze verdi se a nostro favore.

Esempio completo. Timeout degli avversari a 8:34 del 4° quarto, siamo sotto 44-55.

- Prima: 4-0 per noi. Stavamo rientrando, e loro hanno chiamato timeout per fermarci.
- Dopo: 8-2 per noi, cioè **+6**, scritto in verde.
- Conclusione: il loro timeout non ha fermato la nostra rimonta.

In alto c'è il riepilogo per squadra: quanti timeout, la media del "prima" e del "dopo", in quanti timeout il "dopo" è andato a nostro favore e in quanti abbiamo segnato per primi.

Una cautela: 3 minuti sono pochi e molte cose succedono per caso. Un singolo timeout non dimostra niente; dieci o venti timeout, nel campionato, cominciano a raccontare qualcosa.

**Dove**: tab partita, sezione "Timeout e parziali" (e PDF completo); nel campionato il riepilogo dei timeout e i 10 parziali più ampi per parte.

## +/-, quintetti, On/Off e coppie

Tutte queste statistiche nascono dalla stessa idea. Transy ricostruisce **chi era in campo in ogni momento**: parte dal quintetto base e segue tutte le sostituzioni. Così, per ogni canestro (nostro o loro), sa quali dieci giocatori erano sul parquet. A quel punto può "assegnare" ogni canestro ai cinque che erano in campo.

Il punto chiave da capire: queste statistiche **non misurano quello che fa il singolo giocatore**, ma **come va la squadra mentre lui c'è**. Un giocatore può non segnare mai e avere numeri ottimi, perché difende, passa, prende rimbalzi, fa giocare meglio i compagni.

### **+/- (plus/minus, si legge "più meno")**

La differenza fra i punti fatti e i punti subiti dalla squadra **mentre il giocatore era in campo**.

Esempio passo passo. Rossi entra quando la partita è 20-20. Esce quando è 30-24.

- Mentre c'era lui, noi abbiamo segnato 30 − 20 = 10 punti.
- Loro hanno segnato 24 − 20 = 4 punti.
- Il +/- di Rossi in quel pezzo di partita è 10 − 4 = **+6**.

Se poi rientra più tardi, si sommano tutti i pezzi in cui è stato in campo.

Come leggerlo: positivo vuol dire che con lui in campo la squadra ha fatto meglio degli avversari; negativo, peggio. Attenzione però: il +/- dipende molto anche dai compagni e dagli avversari che ha trovato. Un ottimo giocatore che gioca sempre con la seconda unità contro i titolari avversari può avere un +/- brutto senza colpa. Lo trovate nelle tabelle dei giocatori (anche nel PDF per i giornalisti).

### **Quintetti**

Un **quintetto** è una combinazione di 5 giocatori in campo insieme. Ogni volta che cambia anche un solo giocatore, è un quintetto diverso.

Per ogni quintetto Transy mostra:

- i **minuti** giocati insieme;
- i **punti fatti e subiti** in quei minuti;
- il **+/-** (con una barra rossa se positivo, azzurra se negativo);
- i **possessi** giocati;
- i **punti ogni 100 possessi** fatti e subiti, e quindi il Net rating (lo abbiamo visto nel capitolo dei possessi).

I valori ogni 100 possessi compaiono solo sopra i **10 possessi**. Perché? Immaginate un quintetto che gioca 2 minuti, ha 4 possessi e fa un 6-0. Riportato a 100 possessi sarebbe un Net di +150: un numero assurdo, che non vuol dire niente. Sono troppo pochi possessi per giudicare.

Come usarli: guardate i quintetti che hanno giocato di più. Se il quintetto che usate più spesso ha un Net negativo, forse vale la pena provare altre combinazioni.

### **On/Off**

Per ogni giocatore, Transy divide la partita in due: i minuti **con lui in campo** (On) e i minuti **con lui in panchina** (Off). Per ciascuna delle due parti calcola il Net rating della squadra. Poi fa la differenza.

Esempio passo passo. Rossi:

- On: con lui in campo la squadra ha un Net di **+8**.
- Off: con lui in panchina la squadra ha un Net di **−4**.
- Differenza: +8 − (−4) = **+12**.

Vuol dire che quando Rossi è in campo la squadra rende nettamente meglio, anche se magari segna poco. È tipico dei giocatori che difendono bene o che fanno girare la palla. Al contrario, una differenza molto negativa dice che la squadra va meglio quando quel giocatore riposa: vale la pena capire perché.

Differenza fra +/- e On/Off: il +/- guarda solo i minuti in cui il giocatore c'era. L'On/Off confronta quei minuti con quelli in cui non c'era, quindi dice quanto la squadra "cambia" con lui.

### **La matrice delle coppie**

Una **matrice** è semplicemente una tabella a doppia entrata, come la tavola pitagorica. Qui sia sulle righe sia sulle colonne ci sono i giocatori. Ogni casella dice come va la squadra quando **quei due giocatori sono in campo insieme**.

Esempio: la casella all'incrocio fra la riga "Rossi" e la colonna "Bianchi" dice come va la squadra quando Rossi e Bianchi giocano insieme.

- Si può scegliere cosa guardare: **+/-**, **minuti insieme** o **Net**.
- Sulla **diagonale** (dove riga e colonna sono lo stesso giocatore) c'è il giocatore da solo.
- Il colore aiuta: **rosso** a favore, **azzurro** contro. Più il colore è intenso, più il valore è grande.

Serve a trovare le coppie che funzionano (o che non funzionano): per esempio due lunghi che insieme vanno sempre sotto, o un playmaker che rende solo con un certo esterno accanto. Prima di trarre conclusioni, guardate i **minuti insieme**: una coppia che ha giocato 3 minuti non dice niente.

**Attenzione**: tutto questo è affidabile quanto le **sostituzioni registrate**. Se un cambio viene dimenticato, Transy crede che in campo ci sia ancora il giocatore uscito, e gli attribuisce minuti e punti che non sono suoi. Se in una partita i cambi non sono stati segnati bene, meglio non dare peso a questi numeri.

**Dove**: tab partita (dopo le tabelle) e pagina campionato, sommati su tutte le partite.

## Clutch: i finali punto a punto

La parola inglese **clutch** indica i momenti decisivi, quelli in cui "si stringono i denti". Nel basket sono i minuti finali di una partita ancora aperta, quelli in cui si decide chi vince.

Per non decidere "a occhio" quali minuti sono clutch, usiamo la definizione standard: **ultimi 5 minuti del 4° quarto e dei supplementari, con uno scarto di 5 punti o meno** nel momento dell'azione.

Servono tutte e due le condizioni insieme:

1. **Il tempo**: mancano 5 minuti o meno alla fine del 4° quarto (o di un supplementare).
2. **Lo scarto**: in quel momento le squadre sono separate da 5 punti o meno.

Conta lo scarto di quel momento, non quello finale. Esempi:

- A 4' dalla fine siete +12: quei minuti **non** sono clutch, la partita è già abbastanza chiusa.
- Poi l'avversario fa un parziale e rientra fino a 4 punti di distanza (siete +4): da lì in avanti i minuti **tornano a essere** clutch.
- Se a 3' dalla fine siete +2 e vincete di 15 perché l'avversario crolla, i primi minuti sono clutch e gli ultimi, quando lo scarto supera 5, non più.

### **Cosa si vede**

- **Tempo di clutch**: quanti minuti della partita sono stati "punto a punto". Sul campionato anche quante partite sono arrivate punto a punto e il record (es. "6, vinte 4, perse 2").
- **Squadre in clutch e nel resto della partita**, una sotto l'altra: punti, punti ogni 10 minuti, tiri dal campo, da 3, liberi, palle perse, rimbalzi, assist. I "punti ogni 10 minuti" servono a confrontare pezzi di partita di lunghezza diversa: il clutch dura pochi minuti, il resto della partita molti di più. Esempio: 6 punti in 3 minuti di clutch sono 20 punti ogni 10 minuti. Questa parte serve a vedere se nei finali cambiate: "nel resto della partita tiriamo i liberi al 75%, nei finali al 55%".
- **Giocatori in clutch**: minuti, punti, tiri, liberi, palle perse, +/-. Risponde alla domanda "a chi diamo palla nel finale?". Spesso chi tira di più non è chi rende di più.
- **Quintetti in clutch**: quali cinque mettete in campo nei finali e come vanno.

### **Come leggerlo**

Su una partita i minuti di clutch sono pochi (a volte zero) e bastano un paio di tiri per stravolgere una percentuale: 1 su 2 è il 50%, 0 su 2 è lo 0%. Sulla singola partita prendetelo come un racconto del finale, non come un giudizio. Il dato vero viene dal **campionato**, dove si sommano tutti i finali punto a punto e i numeri diventano abbastanza grandi da essere affidabili.

**Dove**: tab partita (sezione "Finale punto a punto", solo se c'è stato) e pagina campionato.

## Volume ed efficienza: usage e TS%

Qui la domanda è: **chi si prende i tiri, e li merita?** Per rispondere servono due misure diverse:

- una di **volume**: quanti tiri si prende un giocatore (quanto "pesa" nell'attacco);
- una di **efficienza**: quanto rendono quei tiri.

Un giocatore ideale tira tanto **e** bene. Uno che tira tanto ma male toglie possessi ai compagni. Uno che tira poco ma bene forse dovrebbe tirare di più.

### **TS% (True Shooting, "tiro vero")**

Abbiamo già visto l'eFG%, che corregge la percentuale dal campo tenendo conto delle triple. Il **TS%** fa un passo in più: considera **anche i liberi**. È la misura più completa dell'efficienza al tiro di un giocatore.

```latex
TS\% = \frac{Punti}{2 \times (TdC\ tentati + 0{,}44 \times Liberi\ tentati)}
```

Sembra difficile, ma l'idea è semplice. Sotto la riga c'è il numero di "tentativi" del giocatore: i tiri dal campo più i liberi, contati con lo 0,44 che conosciamo già dai possessi. Il "2 ×" serve solo a metterlo nella stessa scala di una percentuale da 2: un TS% del 50% vuol dire che ogni tentativo vale in media 1 punto.

Esempio passo passo. Un giocatore segna 20 punti con 15 tiri dal campo e 6 liberi tentati.

- Liberi "pesati": 0,44 × 6 = 2,64.
- Tentativi: 15 + 2,64 = 17,64 (arrotondato 17,6).
- Raddoppio: 2 × 17,64 = 35,28.
- TS%: 20 ÷ 35,28 = **57%**.

Rispetto alla percentuale dal campo, il TS% premia chi tira da 3 e chi va in lunetta, perché sono modi efficienti di fare punti. Come riferimento: intorno al 50% è nella media, sopra il 55% è buono, sopra il 60% è ottimo, sotto il 45% è basso.

### **Usage % (USG%)**

L'**usage** misura il volume. È la quota dei possessi della squadra che il giocatore **chiude lui** (con un tiro, dei liberi o una palla persa) **mentre è in campo**.

Esempio passo passo. Mentre Rossi è in campo, la squadra gioca 40 possessi. Di questi, 10 finiscono con un tiro, dei liberi o una palla persa di Rossi.

- Usage di Rossi: 10 ÷ 40 = **25%**.
- Vuol dire che un possesso su quattro, con lui in campo, "passa dalle sue mani" alla fine.

Con 5 giocatori in campo, se tutti si dividessero i possessi in parti uguali, ognuno avrebbe il **20%** (100 ÷ 5). Questa è la media. Come riferimento:

- **sotto il 15%**: giocatore di ruolo, che tocca poco la palla in attacco (difensori, lunghi che bloccano);
- **intorno al 20%**: nella media;
- **fra 25% e 30%**: il terminale offensivo, quello che cerca il tiro;
- **oltre il 30%**: "passa tutto da lui".

Conta solo il tempo in campo: chi gioca poco non è penalizzato. Un giocatore che gioca 10 minuti può avere lo stesso usage di uno che ne gioca 35.

### **Tentativi di tiro**

Il volume "grezzo": tiri dal campo + 0,44 × liberi, a partita nel campionato. A differenza dell'usage **non** tiene conto dei minuti, quindi premia chi gioca di più. Nel grafico si sceglie quale dei due mettere sull'asse orizzontale: l'usage per vedere "chi tira quando c'è", i tentativi per vedere "chi tira di più in assoluto".

### **Il grafico**

Ogni giocatore è un punto (con il suo numero di maglia). In orizzontale c'è il volume: più il punto è a destra, più il giocatore tira. In verticale c'è il TS%: più il punto è in alto, meglio tira. Due linee tratteggiate (volume medio e TS% della squadra) dividono il grafico in quattro zone:

- **In alto a destra**: tira tanto e bene. È il vostro miglior attaccante: va bene così.
- **In alto a sinistra**: tira poco ma bene. Forse merita più palloni.
- **In basso a sinistra**: tira poco e non benissimo. Di solito un giocatore di ruolo: non è un problema, se fa altro.
- **In basso a destra**: tira tanto ma male. Si prende tanti possessi e li rende poco: è il caso da discutere.

[[schema-quattro-zone]]

Le linee tratteggiate sono il volume medio e il TS% della squadra: la zona in cui cade un giocatore dice come sta usando i suoi possessi.

Esempio: un giocatore con usage 27% e TS% 28% sta in basso a destra. Si prende un possesso su quattro e lo rende male: è il primo caso da discutere.

Chi ha giocato troppo poco (meno di 5 minuti in una partita; sul campionato 2 minuti e mezzo per partita, minimo 15 minuti in tutto) resta in tabella in grigio ma fuori dal grafico. Su pochi minuti questi numeri sono solo rumore: un giocatore che entra 2 minuti e segna l'unica tripla tentata avrebbe un TS% del 150%, che non vuol dire nulla.

**Dove**: tab partita (PDF completo) e pagina campionato.

## Mappa di tiro a zone

Transy ha due modi di mostrare i tiri sul campo. La mappa **con i pallini** mette un pallino per ogni tiro, nel punto in cui è stato preso: dice **dove** si è tirato. La mappa **a zone** invece raggruppa i tiri per zona del campo e colora ogni zona in base a quanto rende: dice **da dove conviene tirare**.

### **Le 10 zone**

Il campo viene diviso in 10 zone, 5 dentro l'arco dei 3 punti e 5 fuori.

| Tipo | Zone |
| --- | --- |
| Da 2 | Sotto canestro (entro circa 1,8 m), resto dell'area colorata, media distanza sinistra, centrale e destra |
| Da 3 | Angolo sinistro e destro (entro circa 3 m dalla linea di fondo), ala sinistra e destra, frontale |

Le zone "centrali" coprono 25° per parte rispetto alla linea immaginaria che va dal canestro a metà campo. Il valore del tiro (da 2 o da 3) è quello registrato: la posizione decide solo la zona. Un tiro da 3 cliccato per sbaglio appena dentro l'arco resta da 3.

### **Punti per tiro**

È il numero chiave della mappa. Risponde alla domanda: **ogni volta che tiriamo da questa zona, quanti punti facciamo in media?** Si calcola così: percentuale × 2 per le zone da 2, percentuale × 3 per quelle da 3.

Perché non basta la percentuale? Perché un tiro da 3 vale di più, quindi può permettersi di entrare meno spesso. Il 50% da 2 e il 33% da 3 valgono entrambi circa **1 punto per tiro**: su 100 tiri da 2 al 50% fate 50 canestri × 2 = 100 punti; su 100 tiri da 3 al 33% fate 33 canestri × 3 = 99 punti.

Esempio passo passo:

- Media distanza al 40%: 0,40 × 2 = **0,80** punti per tiro.
- Angolo da 3 al 38%: 0,38 × 3 = **1,14** punti per tiro.

Anche se la percentuale è più bassa, il tiro dall'angolo rende di più: su 10 tiri sono circa 11 punti contro 8.

### **I colori**

- **Verde acqua**: sopra 1 punto per tiro, la zona rende bene. Più è intenso, più la zona rende.
- **Arancio**: sotto 1 punto per tiro, la zona rende poco.
- **Grigio**: meno di 3 tiri, troppo pochi per dire qualcosa.

Qui non si usano rosso e azzurro perché la mappa misura l'efficienza, non una squadra.

Accanto al campo c'è una tabella con, per ogni zona: segnati/tentati, percentuale, punti per tiro e **quota dei tiri**, cioè quanti tiri su 100 sono stati presi da quella zona. È il modo più rapido per vedere se si tira tanto da zone che rendono poco. Esempio: se il 30% dei vostri tiri arriva dalla media distanza e quella zona è arancio, state "sprecando" tanti possessi in tiri poco convenienti.

### **Tiri fatti e tiri subiti**

Nel campionato ci sono due mappe: i nostri tiri e quelli degli avversari. La seconda è la **mappa difensiva**: dice da dove ci segnano e con quanta efficacia. Una zona verde acqua nella mappa degli avversari è una zona che difendiamo male. Funziona solo se in configurazione è attiva la posizione anche per i tiri avversari.

**Dove**: tab "Mappa tiro" (selettore Tiri / Zone; nel PDF le zone solo con "Tiri e zone, solo staff") e pagina campionato.

## Le statistiche del campionato

Queste statistiche hanno senso solo su più partite: servono a vedere le **tendenze**, cioè come cambia la squadra nel tempo. Le trovate nella pagina "Statistiche campionato", dopo la tabella di squadra e le tabelle dei giocatori. L'elaborazione parte da sola appena si apre la pagina, e la squadra proposta è già il Sarezzo.

### **Andamento partita per partita**

Un grafico con un punto per ogni partita, in ordine di data (sotto ogni punto ci sono la data e V o P, cioè vinta o persa). Dal menu si sceglie cosa guardare: punti, differenza, Net rating, punti ogni 100 possessi, eFG%, palle perse, rimbalzi offensivi, TL/TdC, pace, possessi.

Accanto c'è la **media mobile sulle ultime 3 partite** (attiva di default). Cos'è? Per ogni partita, invece del valore di quella partita, si prende la media di quella partita e delle due precedenti.

Esempio passo passo. Punti segnati in 4 partite: 70, 80, 90, 64.

- Media mobile alla 3ª partita: (70 + 80 + 90) ÷ 3 = **80**.
- Media mobile alla 4ª partita: (80 + 90 + 64) ÷ 3 = **78**.

La media mobile "ammorbidisce" la linea: toglie i salti delle singole partite (la serata storta, l'avversario fortissimo) e fa vedere la tendenza. Esempio: se la linea dell'eFG% scende per 5 partite di fila mentre la difesa tiene, il problema è in attacco.

### **Partite vinte e perse a confronto**

Le stesse statistiche calcolate due volte, una volta solo sulle partite vinte e una volta solo sulle perse, messe una accanto all'altra: risultato, ritmo ed efficienza, Four Factors (nostri e concessi), tiro, rimbalzi, assist, palle perse, falli, scarto medio per quarto. Più una tabella dei giocatori con punti, minuti e TS% nei due gruppi.

Risponde alla domanda: **cosa facciamo di diverso quando vinciamo?** Per esempio "nelle vinte perdiamo 4 palloni in meno" o "nelle perse il 3° quarto vale −5 di media".

La differenza è colorata solo quando è **netta** (per esempio almeno 3 punti, 3 punti percentuali al tiro, 2 palle perse a partita). Sotto quella soglia resta neutra: con poche partite una piccola differenza può essere solo il caso.

### **Radar dei giocatori**

Il radar è un grafico a forma di ragnatela. Dal centro partono 8 "raggi" (gli assi), uno per ogni statistica: punti, TS%, usage, rimbalzi, assist, recuperi, falli subiti e palle perse. Su ogni raggio si mette un puntino: più è lontano dal centro, più il giocatore è bravo in quella cosa. Unendo i puntini si ottiene un poligono, una "forma" che è come la carta d'identità del giocatore.

I conteggi sono **ogni 40 minuti**, cioè come se il giocatore avesse giocato una partita intera. Esempio: un giocatore che fa 6 punti in 20 minuti viene contato come 12 punti ogni 40 minuti. Così chi gioca poco non è penalizzato.

Ogni asse va da 0 al valore più alto della squadra: il radar dice **in cosa un giocatore è forte rispetto ai compagni**, non rispetto al campionato. Le palle perse sono rovesciate (pieno = nessuna), così ogni asse si legge "più è lontano dal centro, meglio è".

Come leggerlo: un poligono grande e rotondo è un giocatore completo; uno stretto e appuntito è uno specialista, fortissimo in una o due cose.

In grigio tratteggiato c'è la media della squadra. Si può sovrapporre un secondo giocatore (in viola) per confrontarli. Nel PDF ci sono tutti, 8 per pagina.

Non c'è sulla singola partita: con pochi minuti e pochi eventi la forma cambierebbe ogni volta per caso.

### **Andamento stagionale dei giocatori**

Una riga per giocatore, con un mini-grafico per punti, minuti, PIR e +/- e la media accanto. Il **PIR** (Performance Index Rating) è la "valutazione" del tabellino: in pratica somma le cose buone (punti, rimbalzi, assist, recuperi, stoppate, falli subiti) e toglie quelle cattive (tiri e liberi sbagliati, palle perse, stoppate subite, falli fatti). Un solo numero che riassume la partita di un giocatore.

Come si legge il mini-grafico:

- **linea tratteggiata**: la media del giocatore;
- **pallino pieno**: la sua partita migliore;
- **pallino vuoto**: la sua partita peggiore;
- **buchi** nella linea: partite non giocate.

Ogni mini-grafico ha la scala del giocatore, con un'ampiezza minima di 10: chi è costante resta quasi piatto, chi è altalenante va su e giù. Serve a vedere a colpo d'occhio chi cresce, chi cala e chi è imprevedibile, cosa che la media non dice. Esempio: 11 punti di media possono essere 5-6-8 a inizio stagione e 14-16-17 alla fine. La media è la stessa, ma il giocatore è cresciuto tantissimo.

Cliccando su una riga compare sotto il grafico grande di quel giocatore, con date e media mobile.

## Limiti e consigli d'uso

I numeri sono buoni quanto la registrazione della partita. Ecco cosa tenere a mente.

- **Le sostituzioni contano tantissimo.** +/-, quintetti, On/Off, coppie, minuti, usage e clutch dipendono dal sapere chi è in campo. Un cambio dimenticato sposta tutto. Se una partita è stata registrata in fretta, non tiratene conclusioni su questi numeri.
- **Gli avversari registrati a metà falsano i fattori.** Se dei loro rimbalzi o delle loro palle perse ne segniamo solo una parte, i loro Four Factors e i possessi stimati ne risentono. E anche i nostri ORB%, che dipendono dai loro rimbalzi difensivi. Se non sapete chi è stato, meglio registrare l'azione alla squadra che lasciarla andare.
- **I possessi sono una stima.** La formula viene dal basket professionistico: per confrontare partite fra loro va benissimo, come numero assoluto prendetelo con un margine di qualche possesso.
- **Le azioni "di squadra" non sono di nessuno.** Quando non si sa chi è stato, rimbalzi, palle perse e recuperate e tiri sbagliati si possono dare alla squadra: si clicca sulla squadra invece che su un giocatore. Entrano nei totali, nei possessi, nei Four Factors e nella mappa di tiro, ma non nei numeri dei giocatori: per questo sotto il tabellino una nota dice quante sono, e gli usage sommati restano un po' sotto il 100%. I canestri invece vanno sempre a un giocatore.
- **Campioni piccoli.** Su una partita sola clutch, percentuali delle zone, valori per 100 possessi dei quintetti cambiano tantissimo con un paio di azioni. Per questo ci sono le soglie minime (10 possessi, 3 tiri per zona, 5 minuti per l'usage) e per questo molte cose vanno lette soprattutto sul campionato.
- **Correlazione non è causa.** Se nelle vinte tiriamo meglio da 3, non vuol dire che basti tirare di più da 3 per vincere. Questi numeri indicano dove guardare, poi serve il video e l'occhio del tecnico.

### **Un modo pratico di usarli**

1. A fine partita: grafico dello scarto, parziali e Four Factors. In due minuti si capisce dove si è decisa.
2. In settimana: quintetti, On/Off e mappa a zone per preparare rotazioni e scelte di tiro.
3. Ogni 4-5 partite: pagina campionato, con andamento, vinte/perse e andamento dei giocatori per vedere le tendenze.

## Glossario delle sigle

| Sigla | Significato | In breve |
| --- | --- | --- |
| +/- | Plus/minus | Punti fatti − subiti con il giocatore in campo |
| Clutch | Finale punto a punto | Ultimi 5' del 4° quarto e dei supplementari, scarto entro 5 |
| Defensive rating | Efficienza difensiva | Punti subiti ogni 100 possessi (più basso è meglio) |
| eFG% | Effective field goal % | Percentuale dal campo con il canestro da 3 che vale 1,5 |
| Four Factors | I quattro fattori di Dean Oliver | Tiro, palle perse, rimbalzi offensivi, tiri liberi |
| Media mobile | Media delle ultime partite | Media della partita e delle due precedenti, toglie il rumore |
| Net rating | Differenza di efficienza | Punti fatti − subiti ogni 100 possessi |
| Offensive rating | Efficienza offensiva | Punti fatti ogni 100 possessi |
| On/Off | In campo / in panchina | Come va la squadra con e senza un giocatore |
| ORB% | Offensive rebound % | Quota dei rimbalzi offensivi disponibili presi |
| Pace | Ritmo | Possessi ogni 40 minuti |
| Parziale | Serie senza risposta | Punti di una squadra mentre l'altra non segna (da 8-0 in su) |
| PIR | Performance Index Rating | Valutazione globale del tabellino: cose buone meno cose cattive |
| Possesso | Turno d'attacco | Dal momento in cui si prende la palla a quando passa agli avversari |
| PPS / Punti per tiro | Points per shot | Percentuale × valore del tiro (2 o 3) |
| PP | Palle perse | Palloni persi senza tirare |
| Quintetto | Cinque in campo | Una combinazione di 5 giocatori in campo insieme |
| RD / RO | Rimbalzi difensivi / offensivi | Palla ripresa dopo un errore degli altri / dopo un proprio errore |
| TdC | Tiri dal campo | Tiri da 2 e da 3, esclusi i liberi |
| TL | Tiri liberi | Tiri dalla lunetta, 1 punto ciascuno |
| TL/TdC | Free throw rate | Liberi segnati ogni 100 tiri dal campo |
| TOV% | Turnover % | Palle perse ogni 100 azioni concluse |
| TS% | True shooting % | Efficienza al tiro compresi i liberi |
| USG% | Usage % | Quota dei possessi chiusi dal giocatore quando è in campo |
