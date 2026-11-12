# auguri ❤

Biglietto d'auguri per l'anniversario di laurea (12.11.2020): busta da aprire,
biglietto con il contatore del tempo da Dottoressa e un puzzle 4×4 con la foto
della laurea. Quando il puzzle è completo appare
**"Tanti auguri, amore — ti amo ❤"** con una pioggia di cuori.

**Indirizzo:** `https://minigiochi.<tailnet>.ts.net/auguri/`, solo dalla tailnet.

## Come funziona

- La pagina è **un file unico** (`dist/auguri.html`, circa 270 KB): stile,
  script e foto sono dentro. Lo crea `build.py` dai sorgenti in `site/`.
- La **foto non è su git** (la repo è pubblica): `site/img/` e `dist/` sono in
  `.gitignore`. Sul Pi va copiato a mano il file già pronto.
- Il container `auguri-auguri-1` (nginx non root, in sola lettura) risponde su
  **`127.0.0.1:8095`**, solo sul Pi: niente LAN, niente Internet. Con qualsiasi
  percorso restituisce la pagina.
- L'ingresso HTTPS di minigiochi (repo `ingressi-https`, `serve/minigiochi.json`)
  manda `/auguri/` a `127.0.0.1:8095` e tutto il resto all'app come prima.
  L'app minigiochi non viene modificata e la pagina non compare tra i giochi.

```
site/            sorgenti (index.html, css/, js/; img/foto.jpg solo in locale)
build.py         crea dist/auguri.html
deploy/          configurazione nginx del container
Dockerfile
docker-compose.yml
```

## Installazione sul Pi

1. Clonare la repo e preparare la cartella per il file:

   ```bash
   cd ~
   git clone https://github.com/Vito-Pepe/auguri.git
   mkdir -p ~/auguri/dist
   ```

2. Copiare `auguri.html` (quello già pronto, con la foto) in
   `~/auguri/dist/auguri.html`. Da iPhone con Termius: SFTP verso il Pi,
   cartella `auguri/dist`, carica il file. Da un computer:

   ```bash
   scp auguri.html pepe@100.96.58.127:~/auguri/dist/auguri.html
   ```

3. Controllare che la porta sia libera. Se il comando non stampa niente, è libera:

   ```bash
   sudo ss -ltn | grep ':8095 '
   ```

4. Avviare e provare:

   ```bash
   cd ~/auguri
   docker compose up -d --build
   curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8095/
   ```

   Risposta attesa: `200`. Se dice `000` o "Connection reset", nginx sta ancora
   partendo: riprovare dopo qualche secondo.

5. Unire la PR di `ingressi-https` che aggiunge `/auguri/`. Entro 5 minuti il cron
   riavvia gli ingressi. Per non aspettare: `cd ~/ingressi-https && ./update.sh`.
   Il riavvio fa cadere per qualche secondo tutti gli indirizzi `*.ts.net` delle app.

6. Aprire `https://minigiochi.<tailnet>.ts.net/auguri/`.

## Rimozione

1. Su GitHub, nella PR di `ingressi-https` già unita, premere **Revert** e unire la
   nuova PR con "Create a merge commit". Entro 5 minuti `/auguri/` sparisce
   dall'ingresso.
2. Sul Pi:

   ```bash
   cd ~/auguri && docker compose down --rmi local
   rm -rf ~/auguri
   ```

3. Togliere le righe di `auguri` da `INFRASTRUTTURA-PI.md` (repo `sillabe`).

## Cambiare testi o foto

Testi in `site/index.html`, data della laurea nella costante `GRAD` di
`site/js/app.js`. Per rifare il file unico serve la foto in `site/img/foto.jpg`
(quadrata, 900×900):

```bash
python3 build.py              # crea dist/auguri.html
docker compose up -d --build  # sul Pi, per pubblicarlo
```

Prova in locale senza Docker: `python3 -m http.server -d site 8000`, con la foto
in `site/img/foto.jpg`.
