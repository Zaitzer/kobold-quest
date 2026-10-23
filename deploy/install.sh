#!/bin/bash
# Installs or updates Kobold Quest on a fresh Ubuntu 24.04 (or Debian 12) server. Run as root from the unpacked folder.
# Safe to run again for every update: the world (accounts, saves, market) in /var/lib/kobold-quest is kept.
set -euo pipefail
cd "$(dirname "$0")"
echo "== packages"
export DEBIAN_FRONTEND=noninteractive
# only when something is missing: apt on every update was the most likely thing to fail
command -v node >/dev/null && command -v caddy >/dev/null && command -v ufw >/dev/null || { apt-get update -qq; apt-get install -y -qq nodejs caddy ufw >/dev/null; }
echo "== updater"
# refresh the 2-minute updater when this server has one (written beside and moved in, since it may be the script running us)
if [ -f /usr/local/bin/kq-update ]; then cp kq-update.sh /usr/local/bin/kq-update.new && chmod 755 /usr/local/bin/kq-update.new && mv /usr/local/bin/kq-update.new /usr/local/bin/kq-update; fi
echo "== drawings"
# Joakim's sprite sheets live in the repo's art/v6; copy the drawn ones into the website (skipped when installing from a tarball)
[ -d ../art/v6 ] && node server/art.js ../art/v6 server/public/art || true
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
