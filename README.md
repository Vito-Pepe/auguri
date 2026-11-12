# auguri ❤

Biglietto d'auguri per l'anniversario di laurea (12.11.2020): busta da aprire,
biglietto con il contatore del tempo da Dottoressa e un puzzle 4×4 con la foto
della laurea. Quando il puzzle è completo appare
**"Tanti auguri, amore — ti amo ❤"** con una pioggia di cuori.

Si consegna come **un file unico**, `dist/auguri.html` (circa 270 KB), con
stile, script e foto dentro: basta mandarlo e aprirlo con un browser. Niente
server.

```
site/        sorgenti (index.html, css/, js/; img/foto.jpg solo in locale)
build.py     crea dist/auguri.html
```

## Creare il file

La **foto non è su git** (la repo è pubblica): `site/img/` e `dist/` sono in
`.gitignore`. Metterla in `site/img/foto.jpg`, quadrata (900×900), poi:

```bash
python3 build.py            # crea dist/auguri.html
```

## Dove aprirlo

- **Computer** (Chrome, Safari, Firefox, Edge) e **Android** con Chrome: funziona
  tutto, anche senza Internet. Senza Internet cambiano solo i caratteri.
- **iPhone**: l'anteprima di WhatsApp, Mail o File di solito non esegue
  JavaScript. In quel caso la pagina mostra subito biglietto, foto e
  "Tanti auguri, amore — ti amo", senza busta né puzzle.

## Cambiare testi

Testi in `site/index.html`, data della laurea nella costante `GRAD` di
`site/js/app.js`, poi di nuovo `python3 build.py`. Prova in locale:
`python3 -m http.server -d site 8000`.
