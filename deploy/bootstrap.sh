#!/bin/bash
# First-time setup on a new server (run once by cloud-init): install the game from this repo
# and a timer that pulls the repo every 2 minutes and reinstalls when release/ changes.
set -euo pipefail
REPO_DIR=/opt/kobold-quest/repo
install -m 755 "$REPO_DIR/deploy/kq-update.sh" /usr/local/bin/kq-update
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
