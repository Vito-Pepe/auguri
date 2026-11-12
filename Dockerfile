# nginx senza root (utente 101, porta 8080): multi-arch, gira sul Raspberry Pi 5 (arm64)
FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
# File unico creato da build.py (con la foto dentro): non è su git, va copiato sul Pi
COPY dist/auguri.html /usr/share/nginx/html/index.html

EXPOSE 8080
