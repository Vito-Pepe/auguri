#!/usr/bin/env python3
"""Crea dist/auguri.html: la pagina in un file unico (stile, script e foto
incorporati), come richiede l'app dei minigiochi per i giochi caricati.

Uso:  python3 build.py [percorso/foto.jpg]
La foto predefinita è site/img/foto.jpg (non è su git: va messa a mano).
"""
import base64
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent
SITE = ROOT / "site"
OUT = ROOT / "dist" / "auguri.html"
MAX_SIZE = 3 * 1024 * 1024  # limite dei caricamenti nei minigiochi


def replace_once(text, old, new):
    if text.count(old) != 1:
        sys.exit(f"Non trovo (una sola volta) in index.html: {old}")
    return text.replace(old, new)


def main():
    photo = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else SITE / "img" / "foto.jpg"
    if not photo.is_file():
        sys.exit(f"Manca la foto: {photo}")

    html = (SITE / "index.html").read_text(encoding="utf-8")
    css = (SITE / "css" / "style.css").read_text(encoding="utf-8")
    js = (SITE / "js" / "app.js").read_text(encoding="utf-8")
    if "</style" in css or "</script" in js:
        sys.exit("Lo stile o lo script contengono un tag di chiusura: non si possono incorporare")

    data = base64.b64encode(photo.read_bytes()).decode("ascii")
    html = replace_once(html, '<link rel="stylesheet" href="css/style.css">', f"<style>\n{css}</style>")
    html = replace_once(
        html,
        '<script src="js/app.js"></script>',
        f'<script>window.FOTO_DATA = "data:image/jpeg;base64,{data}";</script>\n  <script>\n{js}</script>',
    )

    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    size = OUT.stat().st_size
    print(f"{OUT.relative_to(ROOT)}: {size / 1024:.0f} KB")
    if size > MAX_SIZE:
        sys.exit("Troppo grande per i minigiochi (massimo 3 MB): usa una foto più leggera")


if __name__ == "__main__":
    main()
