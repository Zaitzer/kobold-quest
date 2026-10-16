#!/bin/bash
# First-time setup on a new server (run once by cloud-init): install the game from this repo
# and a timer that pulls the repo every 2 minutes and reinstalls when release/ changes.
set -euo pipefail
REPO_DIR=/opt/kobold-quest/repo
cat > /usr/local/bin/kq-update <<'SH'
#!/bin/bash
set -euo pipefail
cd /opt/kobold-quest/repo
git fetch -q origin main
if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ] || [ "${1:-}" = "--force" ]; then
  git reset -q --hard origin/main
  bash release/install.sh
  echo "updated to $(git rev-parse --short HEAD)"
fi
SH
chmod +x /usr/local/bin/kq-update
cat > /etc/systemd/system/kq-update.service <<'U'
[Unit]
Description=Pull Kobold Quest from GitHub and reinstall if it changed
[Service]
Type=oneshot
ExecStart=/usr/local/bin/kq-update
U
cat > /etc/systemd/system/kq-update.timer <<'U'
[Unit]
Description=Check GitHub for Kobold Quest updates every 2 minutes
[Timer]
OnBootSec=1min
OnUnitActiveSec=2min
[Install]
WantedBy=timers.target
U
systemctl daemon-reload
systemctl enable --now kq-update.timer
/usr/local/bin/kq-update --force
