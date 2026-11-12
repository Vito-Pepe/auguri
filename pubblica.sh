#!/usr/bin/env bash
# Avvia il sito e un tunnel pubblico Cloudflare (nessun account, nessuna porta
# da aprire sul router), poi stampa il link da mandarle.
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f site/img/foto.jpg ]; then
  echo "Manca la foto: copiala in site/img/foto.jpg (vedi README) e rilancia lo script."
  exit 1
fi

case "$(uname -m)" in
  aarch64|arm64|x86_64) ;;
  *)
    echo "Questo Raspberry usa un sistema a 32 bit ($(uname -m)): l'immagine Docker"
    echo "di cloudflared non esiste per questa architettura."
    echo "Usa Tailscale Funnel (vedi README):  docker compose up -d --build"
    exit 1
    ;;
esac

docker compose --profile pubblico up -d --build

echo "Aspetto il link pubblico..."
for _ in $(seq 1 40); do
  url=$(docker compose --profile pubblico logs tunnel 2>/dev/null \
        | grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' | tail -n 1 || true)
  if [ -n "$url" ]; then
    echo
    echo "  Link da mandarle:  $url"
    echo
    echo "  (il link vale finché il tunnel resta acceso; per spegnere tutto: ./rimuovi.sh)"
    exit 0
  fi
  sleep 2
done

echo "Il link non è ancora pronto. Controlla con:"
echo "  docker compose --profile pubblico logs tunnel"
exit 1
