#!/bin/bash
# Installs or updates Kobold Quest on a fresh Ubuntu 24.04 (or Debian 12) server. Run as root from the unpacked folder.
# Safe to run again for every update: the world (accounts, saves, market) in /var/lib/kobold-quest is kept.
set -euo pipefail
cd "$(dirname "$0")"
echo "== packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nodejs caddy ufw >/dev/null
echo "== game server"
id -u kobold >/dev/null 2>&1 || useradd --system --home /var/lib/kobold-quest --shell /usr/sbin/nologin kobold
mkdir -p /opt/kobold-quest /var/lib/kobold-quest
rm -rf /opt/kobold-quest/server.new && cp -r server /opt/kobold-quest/server.new
rm -rf /opt/kobold-quest/server.old && { [ -d /opt/kobold-quest/server ] && mv /opt/kobold-quest/server /opt/kobold-quest/server.old || true; }
mv /opt/kobold-quest/server.new /opt/kobold-quest/server
chown -R kobold:kobold /var/lib/kobold-quest
cp kobold-quest.service /etc/systemd/system/kobold-quest.service
systemctl daemon-reload && systemctl enable --now kobold-quest >/dev/null 2>&1 && systemctl restart kobold-quest
echo "== https"
cp Caddyfile /etc/caddy/Caddyfile && systemctl reload caddy || systemctl restart caddy
echo "== firewall"
ufw allow OpenSSH >/dev/null && ufw allow 80/tcp >/dev/null && ufw allow 443/tcp >/dev/null && ufw --force enable >/dev/null
sleep 1
curl -fsS http://127.0.0.1:8080/health >/dev/null && echo "Kobold Quest is running. Open https://joakimskar.no" || { echo "The game server did not start:"; journalctl -u kobold-quest -n 30 --no-pager; exit 1; }
