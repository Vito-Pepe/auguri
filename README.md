# auguri ❤

Biglietto d'auguri per l'anniversario di laurea (12.11.2020): busta da aprire,
biglietto con contatore del tempo passato da Dottoressa e un puzzle 4×4 con la
foto della laurea. Quando il puzzle è completo appare
**"Tanti auguri, amore — ti amo ❤"** con una pioggia di cuori.

Sito statico (HTML/CSS/JS, nessuna dipendenza) servito da nginx in Docker.
L'immagine gira su Raspberry Pi a 64 e a 32 bit.

```
site/            la pagina (index.html, css/, js/, img/foto.jpg)
deploy/          configurazione nginx
Dockerfile
docker-compose.yml
pubblica.sh      avvia sito + link pubblico Cloudflare
rimuovi.sh       spegne e cancella tutto
```

## Sul Raspberry

```bash
git clone https://github.com/Vito-Pepe/auguri.git
cd auguri
```

**La foto non è nel repo** (il repo è pubblico). Copiala dal tuo computer al
Raspberry, già ritagliata (`foto.jpg`, 900×900, senza metadati):

```bash
scp foto.jpg <utente>@<raspberry>:~/auguri/site/img/foto.jpg
```

Senza `site/img/foto.jpg` il puzzle resta vuoto e `pubblica.sh` si ferma.

### Opzione A: link pubblico Cloudflare (la più rapida)

Non serve un account e non bisogna aprire porte sul router. Funziona su
Raspberry con sistema a 64 bit (`uname -m` restituisce `aarch64`).

```bash
./pubblica.sh
```

Lo script avvia il sito e il tunnel e stampa un link tipo
`https://parole-a-caso.trycloudflare.com`: è quello da mandarle.
Il link cambia ogni volta che il tunnel viene riavviato.

### Opzione B: Tailscale Funnel

Funnel apre a internet un servizio del Raspberry: lo vede chiunque abbia il
link, anche fuori dalla tailnet. Funziona anche su sistemi a 32 bit.

```bash
docker compose up -d --build                # sito su http://localhost:8088
sudo tailscale funnel --bg 8088             # pubblica su https://<raspberry>.<tailnet>.ts.net
sudo tailscale funnel status                # mostra il link pubblico
```

La prima volta il comando può chiederti di abilitare Funnel (e i certificati
HTTPS) per la tailnet e mostra il link da aprire per farlo.

### Prova in locale

```bash
docker compose up -d --build
# poi apri http://<ip-del-raspberry>:8088
```

Se la porta 8088 è già occupata: `PORT=9090 docker compose up -d --build`.

## Rimozione

```bash
./rimuovi.sh                                # ferma sito e tunnel e cancella le immagini
sudo tailscale funnel --https=443 off       # solo se hai usato Funnel
```

Controlla con `sudo tailscale funnel status` che non sia rimasto niente di
pubblicato.

## Personalizzare

- Testi del biglietto: `site/index.html`
- Data della laurea: costante `GRAD` in `site/js/app.js`
- Foto: `site/img/foto.jpg`, quadrata (900×900), ignorata da git

La pagina ha `noindex` e un `robots.txt` che blocca i motori di ricerca.
