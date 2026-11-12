#!/usr/bin/env bash
# Spegne sito e tunnel e cancella le immagini Docker create.
set -euo pipefail
cd "$(dirname "$0")"
docker compose --profile pubblico down --rmi all --remove-orphans
echo "Sito e tunnel rimossi."
